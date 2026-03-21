import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";
import { sequelize } from "./config/db.js";
import { migrator, seeder } from "./config/umzugConfig.js";
import { NODE_ENV, PORT } from "./config/env.js";
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

    // ✅ Ejecutar migraciones SIEMPRE (simple y seguro)
    logger.info("running_migrations");
    await migrator.up();
    logger.info("migrations_completed");

    // ✅ Ejecutar seeders (opcional, puedes comentar si no quieres)
    if (process.env.RUN_SEED_ON_START === "true") {
      logger.info("running_seeders");

      try {
        await seeder.up();
        logger.info("seeders_completed");
      } catch (error) {
        logger.error("seeders_failed", { error });
        throw error;
      }
    }

    if (NODE_ENV !== "test") {
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
