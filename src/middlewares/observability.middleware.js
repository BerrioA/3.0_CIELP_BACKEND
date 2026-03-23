import { randomUUID } from "crypto";
import {
  getMetricsSnapshot,
  recordErrorMetric,
  recordRequestMetric,
} from "../observability/metrics.js";
import { logger } from "../observability/logger.js";

const NS_PER_MS = 1_000_000;

export const attachRequestContext = (req, res, next) => {
  const incomingRequestId = req.header("x-request-id");
  req.requestId = incomingRequestId || randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};

export const requestObservability = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedNs = process.hrtime.bigint() - start;
    const durationMs = Number(elapsedNs) / NS_PER_MS;

    recordRequestMetric({
      req,
      statusCode: res.statusCode,
      durationMs,
    });

    logger.info("http_request", {
      request_id: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2)),
      user_agent: req.header("user-agent") || "unknown",
      ip: req.ip,
    });
  });

  next();
};

export const healthCheckHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    memory_mb: {
      rss: Number((process.memoryUsage().rss / 1024 / 1024).toFixed(2)),
      heap_used: Number(
        (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      ),
    },
  });
};

export const metricsHandler = (_req, res) => {
  res.status(200).json(getMetricsSnapshot());
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada.",
    request_id: req.requestId,
  });
};

export const globalErrorHandler = (error, req, res, _next) => {
  recordErrorMetric(error?.name || "UnknownError");

  const statusCode = Number(error?.status || error?.statusCode || 500);
  const isServerError = statusCode >= 500;

  logger.error("unhandled_error", {
    request_id: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status_code: statusCode,
    error_name: error?.name || "Error",
    error_message: error?.message || "Error inesperado",
    stack: error?.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: isServerError ? "Error interno del servidor." : error?.message,
    request_id: req.requestId,
  });
};
