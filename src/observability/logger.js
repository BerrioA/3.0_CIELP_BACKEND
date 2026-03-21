import { NODE_ENV } from "../config/env.js";

const SERVICE_NAME = "cielp-backend";

const formatError = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  return value;
};

const writeLog = (level, message, context = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    env: NODE_ENV || "development",
    pid: process.pid,
    message,
    ...context,
  };

  const serialized = JSON.stringify(payload, (_, value) => formatError(value));

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logger = {
  info: (message, context = {}) => writeLog("info", message, context),
  warn: (message, context = {}) => writeLog("warn", message, context),
  error: (message, context = {}) => writeLog("error", message, context),
  debug: (message, context = {}) => writeLog("debug", message, context),
};
