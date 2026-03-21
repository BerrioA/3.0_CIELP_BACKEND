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


    await migrator.up();
    
    // If seed-on-start is enabled, migrations must run first to guarantee schema.
    const shouldRunMigrations = RUN_MIGRATIONS_ON_START || RUN_SEED_ON_START;

    if (shouldRunMigrations) {
      logger.info("startup_migrations_enabled");
      await migrator.up();
      logger.info("startup_migrations_completed");
    }

    if (RUN_SEED_ON_START) {
      logger.info("startup_seed_enabled", {
        blocking: SEED_BLOCK_STARTUP,
      });

      try {
        await seeder.up();
        logger.info("startup_seed_completed");
      } catch (error) {
        logger.error("startup_seed_failed", { error });
        if (SEED_BLOCK_STARTUP) {
          throw error;
        }
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
