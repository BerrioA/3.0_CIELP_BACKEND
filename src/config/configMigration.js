import {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
} from "./env.js";

const configMigration = {
  development: {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    dialect: "postgres",

    // --- Configuración para Ubicaciones (NUEVO) ---
    migrationStorage: "sequelize", // Opcional, pero buena práctica
    seederStorage: "sequelize", // Opcional, pero buena práctica

    migrationStoragePath: "src/database/migrations",
    seederStoragePath: "src/database/seeders",
    "models-path": "src/database/models",
  },
  production: {
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    dialect: "postgres",

    // --- Configuración para Ubicaciones (NUEVO) ---
    migrationStorage: "sequelize", // Opcional, pero buena práctica
    seederStorage: "sequelize", // Opcional, pero buena práctica

    migrationStoragePath: "src/database/migrations",
    seederStoragePath: "src/database/seeders",
    "models-path": "src/database/models",
  },
};

export default configMigration;
