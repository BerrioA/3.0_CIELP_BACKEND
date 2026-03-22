const getRequiredString = (name) => {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(
      `Falta la variable de entorno requerida: ${name}. El servidor no puede iniciar de forma segura.`,
    );
  }

  return String(value).trim();
};

const getOptionalString = (name, fallback = "") => {
  const value = process.env[name];
  return value ? String(value).trim() : fallback;
};

const getRequiredNumber = (name) => {
  const raw = getRequiredString(name);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    throw new Error(`La variable ${name} debe ser numerica.`);
  }

  return parsed;
};

const getOptionalNumber = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return fallback;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed)) {
    throw new Error(`La variable ${name} debe ser numerica.`);
  }

  return parsed;
};

export const PORT = getRequiredNumber("PORT");
export const POSTGRES_USER = getRequiredString("POSTGRES_USER");
export const POSTGRES_PASSWORD = getRequiredString("POSTGRES_PASSWORD");
export const POSTGRES_DB = getRequiredString("POSTGRES_DB");
export const POSTGRES_HOST = getRequiredString("POSTGRES_HOST");
export const POSTGRES_PORT = getRequiredNumber("POSTGRES_PORT");
export const POSTGRES_URL = getRequiredString("POSTGRES_URL");
export const JWT_SECRET = getRequiredString("JWT_SECRET");
export const JWT_REFRESH = getRequiredString("JWT_REFRESH");
export const NODE_ENV = getRequiredString("NODE_ENV");
export const RATE_LIMIT_MAX = getOptionalNumber("RATE_LIMIT_MAX", 300);
export const RATE_LIMIT_WINDOW_MS = getOptionalNumber(
  "RATE_LIMIT_WINDOW_MS",
  15 * 60 * 1000,
);
export const AUTH_RATE_LIMIT_MAX = getOptionalNumber("AUTH_RATE_LIMIT_MAX", 20);
export const AUTH_RATE_LIMIT_WINDOW_MS = getOptionalNumber(
  "AUTH_RATE_LIMIT_WINDOW_MS",
  10 * 60 * 1000,
);
export const LOGIN_ATTEMPT_MAX_FAILURES = getOptionalNumber(
  "LOGIN_ATTEMPT_MAX_FAILURES",
  5,
);
export const LOGIN_ATTEMPT_WINDOW_MS = getOptionalNumber(
  "LOGIN_ATTEMPT_WINDOW_MS",
  15 * 60 * 1000,
);
export const LOGIN_ATTEMPT_BLOCK_MS = getOptionalNumber(
  "LOGIN_ATTEMPT_BLOCK_MS",
  30 * 60 * 1000,
);
export const SUPERADMIN_NAME = getOptionalString("SUPERADMIN_NAME");
export const SUPERADMIN_LASTNAME = getOptionalString("SUPERADMIN_LASTNAME");
export const SUPERADMIN_EMAIL = getOptionalString("SUPERADMIN_EMAIL");
export const SUPERADMIN_PASSWORD = getOptionalString("SUPERADMIN_PASSWORD");
export const SUPERADMIN_PHONE = getOptionalString("SUPERADMIN_PHONE");
export const EMAIL_HOST = getOptionalString("EMAIL_HOST");
export const EMAIL_PORT = getOptionalNumber("EMAIL_PORT", 587);
export const EMAIL_USER = getOptionalString("EMAIL_USER");
export const EMAIL_PASS = getOptionalString("EMAIL_PASS");
export const FRONTEND_URL = getRequiredString("FRONTEND_URL");

const isNodeEnvAllowed = ["development", "test", "production"].includes(
  NODE_ENV,
);

if (!isNodeEnvAllowed) {
  throw new Error(
    `NODE_ENV invalido: ${NODE_ENV}. Valores permitidos: development, test, production.`,
  );
}

if (JWT_SECRET.length < 32 || JWT_REFRESH.length < 32) {
  throw new Error(
    "JWT_SECRET y JWT_REFRESH deben tener una longitud minima de 32 caracteres.",
  );
}

if (NODE_ENV === "production") {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "En produccion, EMAIL_HOST, EMAIL_USER y EMAIL_PASS son requeridos para enviar correos.",
    );
  }
}
