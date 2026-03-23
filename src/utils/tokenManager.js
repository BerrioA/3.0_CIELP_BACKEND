import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  FRONTEND_URL,
  JWT_REFRESH,
  JWT_SECRET,
  NODE_ENV,
} from "../config/env.js";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 60 * 15;
const REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 15;

export const generateToken = (uid) => {
  try {
    const expiresIn = ACCESS_TOKEN_EXPIRES_IN_SECONDS;
    const token = jwt.sign({ uid }, JWT_SECRET, {
      expiresIn,
    });
    return { token, expiresIn };
  } catch (error) {
    console.error("Error generando token:", error);
    throw new Error("Error al generar el token");
  }
};

export const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(String(rawToken)).digest("hex");
};

const resolveCookieSameSite = (req) => {
  if (NODE_ENV !== "production") {
    return "lax";
  }

  try {
    const frontendHost = new URL(FRONTEND_URL).hostname;
    const backendHost = req?.get?.("host")?.split(":")?.[0];

    if (frontendHost && backendHost && frontendHost !== backendHost) {
      return "none";
    }
  } catch {
    // Si no podemos resolver hosts, usamos una configuracion compatible para cross-site en produccion.
  }

  return "none";
};

export const generateRefreshToken = (uid, role, sessionId, req, res) => {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN_SECONDS;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const isProduction = NODE_ENV === "production";
  const sameSite = resolveCookieSameSite(req);

  try {
    const refreshToken = jwt.sign({ uid, role }, JWT_REFRESH, {
      expiresIn,
      jwtid: sessionId,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      maxAge: expiresIn * 1000, // 15 horas en milisegundos
    });

    return {
      refreshToken,
      expiresIn,
      expiresAt,
    };
  } catch (error) {
    console.error("Error generando refresh token:", error);
    throw new Error("Error al generar el refresh token");
  }
};

export const tokenVerificationErrors = {
  "invalid signature": "La firma del JWT no es válida",
  "jwt expired": "JWT expirado",
  "invalid token": "Token no válido",
  "No Bearer": "Utiliza formato Bearer",
  "jwt malformed": "JWT mal formado",
  "jwt must be provided": "JWT es requerido",
};
