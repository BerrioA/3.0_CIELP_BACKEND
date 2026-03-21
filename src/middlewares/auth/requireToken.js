import jwt from "jsonwebtoken";
import { tokenVerificationErrors } from "../../utils/tokenManager.js";
import { JWT_SECRET } from "../../config/env.js";

// Middleware encargado de solicitar el token para la validación
export const requireToken = (req, res, next) => {
  try {
    let token = req.headers?.authorization;

    if (!token) {
      return res.status(403).json({
        message:
          "El token debe enviarse en el encabezado de autorización con el formato Bearer.",
      });
    }

    token = token.split(" ")[1];

    const { uid } = jwt.verify(token, JWT_SECRET);

    req.uid = uid;

    next();
  } catch (error) {
    console.log("Se he presentado un error en el token requerido:", error);

    return res
      .status(401)
      .send({ error: tokenVerificationErrors[error.message] });
  }
};
