import { transporter } from "../utils/transportEmail.js";
import {
  Burnout_Critical_Alert_Template,
  Password_Reset_Success_Template,
  Url_Template,
  Url_Verification_Template,
  Welcome_Template,
} from "../utils/emailTemplate.js";

const FROM_EMAIL = '"CIELP" <cielpcontacto@gmail.com>';

// Función genérica interna para evitar repetir código
const sendEmail = async (options) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      ...options,
    });
    return { success: true };
  } catch (error) {
    console.error(`[Email Service Error]: ${error}`);
    return { success: false, error };
  }
};

export const sendVerificationEmail = async (email, url) => {
  return await sendEmail({
    to: email,
    subject: "Verifica tu cuenta en CIELP 🔐",
    html: Url_Verification_Template.replace("{verificationCode}", url).replace(
      "{cabecera}",
      "Verificación de Cuenta",
    ),
  });
};

export const sendPasswordResetEmail = async (email, url) => {
  return await sendEmail({
    to: email,
    subject: "Restablecer contraseña - CIELP 🔑",
    text: `Hola, para restablecer tu contraseña en CIELP, por favor abre el siguiente enlace: ${url}`,
    html: Url_Template.replace("{cabecera}", "Restablecer Contraseña").replace(
      /\{urlCode\}/g,
      url,
    ),
  });
};

export const sendWelcomeEmail = async (email, name, last_name) => {
  return await sendEmail({
    to: email,
    subject: "¡Bienvenido a CIELP! ✅",
    html: Welcome_Template.replace("{name}", name).replace(
      "{lastname}",
      last_name,
    ),
  });
};

export const sendUrlResetPasswordEmail = async (email, resetPasswordUrl) => {
  return await sendPasswordResetEmail(email, resetPasswordUrl);
};

export const sendPasswordResetSuccessEmail = async (email, name, last_name) => {
  return await sendEmail({
    to: email,
    subject: "Tu contraseña fue restablecida - CIELP ✅",
    html: Password_Reset_Success_Template.replace(
      "{name}",
      name || "Usuario",
    ).replace("{lastname}", last_name || ""),
  });
};

export const sendCriticalBurnoutAlertEmail = async ({
  psychologistEmail,
  psychologistName,
  teacherName,
  diagnosis,
  recommendedSpace,
}) => {
  const emailTemplate = Burnout_Critical_Alert_Template.replace(
    "{psychologistName}",
    psychologistName || "equipo de psicologia",
  )
    .replace("{teacherName}", teacherName || "Docente")
    .replace("{diagnosis}", diagnosis || "Sin diagnostico")
    .replace("{recommendedSpace}", recommendedSpace || "Sin espacio sugerido");

  return await sendEmail({
    to: psychologistEmail,
    subject: "Alerta clinica CIELP: docente con riesgo alto de burnout",
    html: emailTemplate,
  });
};
