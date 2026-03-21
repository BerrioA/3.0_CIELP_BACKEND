import { Router } from "express";
import {
  login,
  logout,
  profile,
  refreshToken,
  resendEmailCode,
  verifyAccount,
  sendPasswordRecoveryUrl,
  resetPassword,
} from "../controllers/index.js";
import { requireToken, requireRefreshToken } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/zod.middleware.js";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  resendVerificationBodySchema,
  resetPasswordBodySchema,
  resetPasswordParamsSchema,
  verifyAccountParamsSchema,
} from "../validators/security.schemas.js";

const router = Router();

// Ruta para el inicio de sesión, no requiere token
router.post("/login", validateRequest({ body: loginBodySchema }), login);

// Ruta para el cierre de sesión, requiere token de acceso
router.post("/logout", logout);

// Ruta para refrescar el token, requiere refresh token
router.get("/refresh", requireRefreshToken, refreshToken);

// Ruta para obtener el perfil del usuario autenticado, requiere token de acceso
router.get("/profile", requireToken, profile);

// Ruta para verificar la cuenta a través del código enviado por correo
router.get(
  "/verify-account/:code",
  validateRequest({ params: verifyAccountParamsSchema }),
  verifyAccount,
);

// Ruta para reenviar el código de verificación, no requiere token
router.post(
  "/resend-verification",
  validateRequest({ body: resendVerificationBodySchema }),
  resendEmailCode,
);

// Ruta para enviar el enlace de recuperación de contraseña, no requiere token
router.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordBodySchema }),
  sendPasswordRecoveryUrl,
);

// Ruta para restablecer la contraseña, no requiere token
router.post(
  "/reset-password/:verificationCode",
  validateRequest({
    params: resetPasswordParamsSchema,
    body: resetPasswordBodySchema,
  }),
  resetPassword,
);

export default router;
