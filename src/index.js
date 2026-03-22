import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";
import { sequelize } from "./config/db.js";
import { migrator, seeder } from "./config/umzugConfig.js";
import {
  EMAIL_FROM,
  EMAIL_PROVIDER,
  NODE_ENV,
  PORT,
  RESEND_API_KEY,
} from "./config/env.js";
import "./models/relations.model.js";
import { setupScheduledTasks } from "./utils/scheduler.js";
import { logger } from "./observability/logger.js";

process.on("unhandledRejection", (reason) => {
  logger.error("process_unhandled_rejection", { reason });
});

process.on("uncaughtException", (error) => {
  logger.error("process_uncaught_exception", { error });
});

process.on("SIGTERM", () => {
  logger.info("process_sigterm_received");
  process.exit(0);
});

async function main() {
  try {
    await sequelize.authenticate();
    logger.info("database_connection_successful");

    // 🔥 Seeders SIEMPRE
    logger.info("running_seeders");
    await seeder.up();
    logger.info("seeders_completed");

    if (NODE_ENV !== "test") {
      logger.info("email_provider_configured", {
        email_provider: EMAIL_PROVIDER,
        email_from_configured: Boolean(EMAIL_FROM),
        resend_api_key_configured: Boolean(RESEND_API_KEY),
      });

      setupScheduledTasks();
      app.listen(PORT, () => {
        logger.info("server_started", {
          port: Number(PORT),
          node_env: NODE_ENV,
        });
      });
    }
  } catch (error) {
    logger.error("database_connection_failed", { error });
    process.exit(1);
  }
}

main();
