const startedAt = Date.now();

const metricsState = {
  requests_total: 0,
  requests_by_method: {},
  requests_by_status_class: {},
  requests_by_route: {},
  errors_total: 0,
  errors_by_type: {},
  latency_ms: {
    total: 0,
    count: 0,
    max: 0,
  },
};

const getStatusClass = (statusCode) => {
  const base = Math.floor(Number(statusCode || 0) / 100);
  return `${base}xx`;
};

const normalizeRouteLabel = (req) => {
  const fallback = req.baseUrl
    ? `${req.baseUrl}${req.path || ""}`
    : req.originalUrl || req.url || "unknown";

  return req.route?.path ? `${req.baseUrl || ""}${req.route.path}` : fallback;
};

export const recordRequestMetric = ({ req, statusCode, durationMs }) => {
  metricsState.requests_total += 1;

  const method = req.method || "UNKNOWN";
  metricsState.requests_by_method[method] =
    (metricsState.requests_by_method[method] || 0) + 1;

  const statusClass = getStatusClass(statusCode);
  metricsState.requests_by_status_class[statusClass] =
    (metricsState.requests_by_status_class[statusClass] || 0) + 1;

  const routeLabel = normalizeRouteLabel(req);
  metricsState.requests_by_route[routeLabel] =
    (metricsState.requests_by_route[routeLabel] || 0) + 1;

  const duration = Number(durationMs || 0);
  metricsState.latency_ms.total += duration;
  metricsState.latency_ms.count += 1;
  metricsState.latency_ms.max = Math.max(metricsState.latency_ms.max, duration);
};

export const recordErrorMetric = (errorName = "UnknownError") => {
  metricsState.errors_total += 1;
  metricsState.errors_by_type[errorName] =
    (metricsState.errors_by_type[errorName] || 0) + 1;
};

export const getMetricsSnapshot = () => {
  const uptimeSec = Math.floor((Date.now() - startedAt) / 1000);
  const avgLatency =
    metricsState.latency_ms.count > 0
      ? Number(
          (
            metricsState.latency_ms.total / metricsState.latency_ms.count
          ).toFixed(2),
        )
      : 0;

  return {
    uptime_seconds: uptimeSec,
    requests_total: metricsState.requests_total,
    requests_by_method: metricsState.requests_by_method,
    requests_by_status_class: metricsState.requests_by_status_class,
    requests_by_route: metricsState.requests_by_route,
    errors_total: metricsState.errors_total,
    errors_by_type: metricsState.errors_by_type,
    latency_ms: {
      avg: avgLatency,
      max: Number(metricsState.latency_ms.max.toFixed(2)),
    },
  };
};
