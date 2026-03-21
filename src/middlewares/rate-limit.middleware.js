import rateLimit from "express-rate-limit";
import {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "../config/env.js";
import { logger } from "../observability/logger.js";

const DEFAULT_GLOBAL_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_GLOBAL_MAX = 300;
const DEFAULT_AUTH_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_AUTH_MAX = 20;

const safeNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const buildLimitHandler = (message) => {
  return (req, res) => {
    logger.warn("rate_limit_exceeded", {
      request_id: req.requestId,
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
      user_agent: req.header("user-agent") || "unknown",
    });

    return res.status(429).json({
      success: false,
      message,
      request_id: req.requestId,
    });
  };
};

export const apiRateLimiter = rateLimit({
  windowMs: safeNumber(RATE_LIMIT_WINDOW_MS, DEFAULT_GLOBAL_WINDOW_MS),
  max: safeNumber(RATE_LIMIT_MAX, DEFAULT_GLOBAL_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  handler: buildLimitHandler(
    "Se detectaron demasiadas solicitudes. Intenta de nuevo en unos minutos.",
  ),
});

export const authRateLimiter = rateLimit({
  windowMs: safeNumber(AUTH_RATE_LIMIT_WINDOW_MS, DEFAULT_AUTH_WINDOW_MS),
  max: safeNumber(AUTH_RATE_LIMIT_MAX, DEFAULT_AUTH_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => req.method === "OPTIONS",
  handler: buildLimitHandler(
    "Demasiados intentos de autenticacion. Espera unos minutos antes de reintentar.",
  ),
});
