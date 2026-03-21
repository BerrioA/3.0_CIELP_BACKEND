import {
  authLogin,
  authLogout,
  generateRecoveryToken,
  getUserProfile,
  resetUserPassword,
  sendPasswordResetEmail,
} from "../services/index.js";

// Controlador para obtener el perfil del usuario autenticado
export const profile = async (req, res) => {
  try {
    const profileData = await getUserProfile(req.uid);
    return res.status(200).json(profileData);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error.message);

    const statusCode = error.message === "Usuario no encontrado." ? 404 : 500;
    return res.status(statusCode).json({ message: error.message });
  }
};

// Controlador para manejar el inicio de sesión
export const login = async (req, res) => {
  try {
    const result = await authLogin(req.body, res, req);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controlador de login:", error.message);

    return res.status(Number(error?.statusCode) || 403).json({
      message: error.message || "Error al iniciar sesión.",
    });
  }
};

// Controlador para manejar el cierre de sesión
export const logout = async (req, res) => {
  try {
    const result = await authLogout(req, res);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error al intentar cerrar sesión:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Controlador encargado de enviar el link para restablecer la contraseña
export const sendPasswordRecoveryUrl = async (req, res) => {
  try {
    const { email } = req.body;
    const { url, userEmail } = await generateRecoveryToken(email);

    await sendPasswordResetEmail(userEmail, url);

    res
      .status(200)
      .json({ message: "Enlace de recuperación enviado con éxito." });
  } catch (error) {
    res
      .status(error.message === "Usuario no encontrado" ? 404 : 500)
      .json({ error: error.message });
  }
};

// Controlador encargado de restablecer la contraseña de un usuario
export const resetPassword = async (req, res) => {
  try {
    const { verificationCode } = req.params;
    const { newPassword } = req.body;

    await resetUserPassword(verificationCode, newPassword);

    res.status(200).json({ message: "Contraseña restablecida con éxito." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
