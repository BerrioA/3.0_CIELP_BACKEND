import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { corsOptions } from "./config/corsOptions.js";
import userRoutes from "./routes/user.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import mbiRoutes from "./routes/mbi.routes.js";
import spacesRoutes from "./routes/space.routes.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import {
  attachRequestContext,
  globalErrorHandler,
  healthCheckHandler,
  metricsHandler,
  notFoundHandler,
  requestObservability,
} from "./middlewares/observability.middleware.js";
import {
  apiRateLimiter,
  authRateLimiter,
} from "./middlewares/rate-limit.middleware.js";

const app = express();

// Middlewares
app.set("trust proxy", 1);
app.use(helmet());
app.use(attachRequestContext);
app.use(requestObservability);
app.use("/api/cielp/v1", apiRateLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// Endpoints operativos
app.get("/api/cielp/v1/health", healthCheckHandler);
app.get("/api/cielp/v1/metrics", metricsHandler);

// Rutas
app.use("/api/cielp/v1/auth", authRateLimiter, authRoutes);
app.use("/api/cielp/v1/users", userRoutes);
app.use("/api/cielp/v1/teachers", teacherRoutes);
app.use("/api/cielp/v1/mbi", mbiRoutes);
app.use("/api/cielp/v1/spaces", spacesRoutes);
app.use("/api/cielp/v1/analytics", analyticsRoutes);

app.use("/cielp", (_, res) => {
  res.send("Bienvenido a CIELP API");
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
