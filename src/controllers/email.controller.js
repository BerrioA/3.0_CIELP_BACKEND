import {
  confirmAccountVerification,
  processResendVerification,
} from "../services/index.js";

// Controlador para reenviar el código de verificación por email
export const resendEmailCode = async (req, res) => {
  try {
    const { email } = req.body;
    // Todo ocurre en el service: generar código, guardar en BD y enviar correo
    await processResendVerification(email);

    return res.status(200).json({
      message: "Se ha enviado un nuevo código de verificación a tu correo.",
    });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};

// Controlador para verificar la cuenta usando el código enviado por email
export const verifyAccount = async (req, res) => {
  try {
    const { code } = req.params; // El Base64 que viene de la URL

    await confirmAccountVerification(code);

    return res.status(200).json({
      message: "¡Perfecto! tu cuenta ha sido verificada con éxito.",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
