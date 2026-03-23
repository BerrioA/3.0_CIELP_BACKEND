import { randomUUID } from "crypto";
import {
  getMetricsSnapshot,
  recordErrorMetric,
  recordRequestMetric,
} from "../observability/metrics.js";
import { logger } from "../observability/logger.js";
import {
  KEEPALIVE_ENABLE_SUPABASE_PING,
  KEEPALIVE_TOKEN,
  SUPABASE_ANON_KEY,
  SUPABASE_PING_PATH,
  SUPABASE_PROJECT_URL,
} from "../config/env.js";

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

const buildSupabasePingUrl = () => {
  const baseUrl = SUPABASE_PROJECT_URL.replace(/\/+$/, "");
  const path = SUPABASE_PING_PATH.startsWith("/")
    ? SUPABASE_PING_PATH
    : `/${SUPABASE_PING_PATH}`;
  return `${baseUrl}${path}`;
};

const isSupabasePingConfigured = () => {
  return (
    KEEPALIVE_ENABLE_SUPABASE_PING &&
    Boolean(SUPABASE_PROJECT_URL) &&
    Boolean(SUPABASE_ANON_KEY)
  );
};

export const keepAlivePingHandler = async (req, res) => {
  if (KEEPALIVE_TOKEN) {
    const incomingToken = req.header("x-keepalive-token") || "";

    if (incomingToken !== KEEPALIVE_TOKEN) {
      return res.status(401).json({
        success: false,
        message: "Token de keep-alive invalido.",
      });
    }
  }

  const responsePayload = {
    success: true,
    render: {
      awake: true,
      timestamp: new Date().toISOString(),
    },
    supabase: {
      enabled: isSupabasePingConfigured(),
      ok: null,
      status_code: null,
      latency_ms: null,
      error: null,
    },
  };

  if (!responsePayload.supabase.enabled) {
    return res.status(200).json(responsePayload);
  }

  const start = Date.now();

  try {
    const supabaseUrl = buildSupabasePingUrl();
    const supabaseResponse = await fetch(supabaseUrl, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    responsePayload.supabase.status_code = supabaseResponse.status;
    responsePayload.supabase.latency_ms = Date.now() - start;
    responsePayload.supabase.ok = supabaseResponse.ok;

    if (!supabaseResponse.ok) {
      const rawBody = await supabaseResponse.text();
      responsePayload.supabase.error = rawBody.slice(0, 180);

      logger.warn("keepalive_supabase_ping_failed", {
        status_code: supabaseResponse.status,
      });

      return res.status(502).json(responsePayload);
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    responsePayload.supabase.ok = false;
    responsePayload.supabase.latency_ms = Date.now() - start;
    responsePayload.supabase.error = error?.message || "Error de red";

    logger.warn("keepalive_supabase_ping_error", {
      error_message: responsePayload.supabase.error,
    });

    return res.status(502).json(responsePayload);
  }
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
