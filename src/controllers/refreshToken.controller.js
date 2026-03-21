import { generateToken } from "../utils/tokenManager.js";
import { rotateRefreshSession } from "../services/auth.service.js";

// Controlador encargado de generar el refreshToken
export const refreshToken = async (req, res) => {
  try {
    await rotateRefreshSession({
      uid: req.uid,
      role: req.role,
      req,
      res,
      currentSessionId: req.refreshTokenSessionId,
    });

    const { token, expiresIn } = generateToken(req.uid);

    return res.status(200).json({ token, expiresIn });
  } catch (error) {
    console.error("Error al generar el RefreshToken:", error);

    return res.status(500).json({
      message:
        "Se ha presentado un error en el servidor al intentar generar el RefreshToken.",
    });
  }
};
