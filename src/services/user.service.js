import { Op } from "sequelize";
import bcryptjs from "bcryptjs";
import {
  AdditionalInformation,
  Role,
  User,
  UserPreference,
} from "../models/relations.model.js";

const DEFAULT_USER_PREFERENCES = {
  email_notifications_enabled: true,
  security_events_notifications_enabled: true,
  compact_dashboard_mode_enabled: false,
  dark_mode_enabled: false,
};

const parsePreferencesPayload = (payload = {}) => {
  const normalized = {};

  if (typeof payload.email_notifications_enabled === "boolean") {
    normalized.email_notifications_enabled =
      payload.email_notifications_enabled;
  }

  if (typeof payload.security_events_notifications_enabled === "boolean") {
    normalized.security_events_notifications_enabled =
      payload.security_events_notifications_enabled;
  }

  if (typeof payload.compact_dashboard_mode_enabled === "boolean") {
    normalized.compact_dashboard_mode_enabled =
      payload.compact_dashboard_mode_enabled;
  }

  if (typeof payload.dark_mode_enabled === "boolean") {
    normalized.dark_mode_enabled = payload.dark_mode_enabled;
  }

  return normalized;
};

// Servicio para obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const patients = await User.findAll({
      include: [
        {
          model: Role,
          where: {
            name: {
              [Op.in]: ["psychologist", "admin", "developer"],
            },
          },
          attributes: ["name"],
        },
        {
          model: AdditionalInformation,
          attributes: ["id", "phone", "date_of_birth", "sex"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "given_name",
        "surname",
        "email",
        "data_privacy_consent",
        "created_at",
      ],
      order: [["given_name", "ASC"]],
    });

    const formattedPatients = patients.map((patient) => {
      const patientData = patient.toJSON();

      const additionalInfo = patientData.additional_information;

      return {
        id: patientData.id,
        given_name: patientData.given_name,
        surname: patientData.surname,
        email: patientData.email,
        role: patientData.role?.name || null,
        phone: additionalInfo?.phone || null,
        date_of_birth: additionalInfo?.date_of_birth || null,
        sex: additionalInfo?.sex || null,
        created_at: patientData.created_at,
      };
    });

    return formattedPatients;
  } catch (error) {
    throw new Error("Error al obtener los pacientes: " + error.message);
  }
};

// Servicio para actualizar un usuario
export const updateUser = async ({ userId, dataUserUpdate }) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "given_name",
        "surname",
        "email",
        "status",
        "createdAt",
      ],
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    await user.update(dataUserUpdate);

    return user;
  } catch (error) {
    console.error({ message: error });
    throw new Error("Error al actualizar el usuario: " + error.message);
  }
};

export const registerAdditionalInformation = async (
  userId,
  additionalInformation,
) => {
  const { document_number, phone, date_of_birth, sex, address } =
    additionalInformation;
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("Usuario no encontrado.");

    const existingAdditionalInformation = await AdditionalInformation.findOne({
      where: {
        user_id: userId,
      },
      paranoid: false,
    });

    if (existingAdditionalInformation) {
      if (existingAdditionalInformation.deletedAt) {
        await existingAdditionalInformation.restore();
      }

      await existingAdditionalInformation.update({
        document_number,
        phone,
        date_of_birth,
        sex,
        address,
      });
    } else {
      await AdditionalInformation.create({
        document_number,
        phone,
        date_of_birth,
        sex,
        address,
        user_id: userId,
      });
    }

    return true;
  } catch (error) {
    console.error(
      "Error al intentar realizar el registro de usuario:",
      error.message,
    );
    throw error;
  }
};

export const getMyAdditionalInformation = async (userId) => {
  try {
    const additionalInformation = await AdditionalInformation.findOne({
      where: { user_id: userId },
      attributes: [
        "document_number",
        "phone",
        "date_of_birth",
        "sex",
        "last_test_date",
      ],
    });

    if (!additionalInformation) {
      return null;
    }

    return {
      document_number: additionalInformation.document_number || "",
      phone: additionalInformation.phone || "",
      date_of_birth: additionalInformation.date_of_birth || null,
      sex: additionalInformation.sex || "",
      address: "",
      last_test_date: additionalInformation.last_test_date || null,
    };
  } catch (error) {
    throw new Error(
      "Error al obtener la informacion adicional del usuario: " + error.message,
    );
  }
};

// Servicio para eliminar un usuario de cualquier rol
export const deleteUser = async ({ userId, actorUserId, currentPassword }) => {
  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
      ],
    });

    if (!user) return null;

    const sensitiveRoles = new Set(["admin", "psychologist"]);
    const targetRoleName = user?.role?.name || "";

    if (sensitiveRoles.has(targetRoleName)) {
      if (!actorUserId) {
        return {
          error:
            "No se pudo validar el usuario autenticado para confirmar la eliminación.",
        };
      }

      if (!currentPassword) {
        return {
          error:
            "Para eliminar administradores o psicólogos debes confirmar tu contraseña.",
        };
      }

      const actorUser = await User.findByPk(actorUserId, {
        attributes: ["id", "password"],
      });

      if (!actorUser) {
        return {
          error: "Usuario autenticado no encontrado para validación.",
        };
      }

      const isPasswordValid = await bcryptjs.compare(
        currentPassword,
        actorUser.password,
      );

      if (!isPasswordValid) {
        return {
          error: "La contraseña de confirmación es incorrecta.",
        };
      }
    }

    await user.destroy();

    return true;
  } catch (error) {
    throw new Error("Error al intentar eliminar el usuario: " + error.message);
  }
};

// Servicio para obtener todos los usuarios en papelera de reciclaje
export const getUsersTrash = async () => {
  try {
    const users = await User.findAll({
      where: {
        deletedAt: { [Op.ne]: null },
      },
      paranoid: false,
      include: [
        {
          model: Role,
          where: {
            name: {
              [Op.in]: ["teacher", "psychologist", "admin", "developer"],
            },
          },
          attributes: ["name"],
        },
        {
          model: AdditionalInformation,
          attributes: ["id", "phone", "date_of_birth", "sex"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "given_name",
        "surname",
        "email",
        "data_privacy_consent",
        "created_at",
      ],
      order: [["given_name", "ASC"]],
    });

    const formattedUsers = users.map((user) => {
      const userData = user.toJSON();

      const additionalInfo = userData.additional_information;

      return {
        id: userData.id,
        given_name: userData.given_name,
        surname: userData.surname,
        role: userData.role?.name || null,
        phone: additionalInfo?.phone || null,
        email: userData.email,
        date_of_birth: additionalInfo?.date_of_birth || null,
        sex: additionalInfo?.sex || null,
        created_at: userData.created_at,
      };
    });

    return formattedUsers;
  } catch (error) {
    throw new Error(
      "Error al intentar obtener los usuarios en papelera: " + error.message,
    );
  }
};

// Servicio para eliminar un usuario por completo desde la papelera de reciclaje
export const deleteUsersComplete = async ({ userId }) => {
  try {
    const user = await User.findByPk(userId, { paranoid: false });

    if (!user) return null;

    await user.destroy({ force: true });

    return true;
  } catch (error) {
    throw new Error(
      "Error al intentar eliminar el usuario definitivamente: " + error.message,
    );
  }
};

export const restoreUsers = async ({ userId }) => {
  try {
    const user = await User.findByPk(userId, { paranoid: false });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    await user.restore();

    return { message: "Usuario restaurado correctamente." };
  } catch (error) {
    throw new Error("Error al intentar restaurar el usuario: " + error.message);
  }
};

// Servicio para actualizar contraseña
export const updatePassword = async ({
  userId,
  patientId,
  newPassword,
  oldPassword,
}) => {
  try {
    const idToSearch = userId || patientId;

    const user = await User.findByPk(idToSearch, {
      attributes: ["id", "password"],
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    const comparePassword = await bcryptjs.compare(oldPassword, user.password);

    if (!comparePassword) {
      return { error: "La contraseña actual es incorrecta" };
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: "Contraseña actiializada correctamente." };
  } catch (error) {
    console.error({ message: error });
    throw new Error("Error al actualizar la contraseña: " + error.message);
  }
};

// Servicio para actualizar contraseña de usuario logueado
export const updateMePassword = async ({
  userId,
  newPassword,
  oldPassword,
}) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "password"],
    });

    if (!user) {
      return { error: "Usuario no encontrado" };
    }

    const comparePassword = await bcryptjs.compare(oldPassword, user.password);

    if (!comparePassword) {
      return { error: "Credenciales incorrectas." };
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: "Contraseña actiializada correctamente." };
  } catch (error) {
    console.error({ message: error });
    throw new Error("Error al actualizar la contraseña: " + error.message);
  }
};

// Servicio para obtener las preferencias de un usuario
export const getMyPreferences = async (userId) => {
  const existingPreferences = await UserPreference.findOne({
    where: { user_id: userId },
  });

  if (!existingPreferences) {
    return {
      ...DEFAULT_USER_PREFERENCES,
    };
  }

  return {
    email_notifications_enabled:
      existingPreferences.email_notifications_enabled,
    security_events_notifications_enabled:
      existingPreferences.security_events_notifications_enabled,
    compact_dashboard_mode_enabled:
      existingPreferences.compact_dashboard_mode_enabled,
    dark_mode_enabled: existingPreferences.dark_mode_enabled,
  };
};

// Servicio para actualizar las preferencias de un usuario
export const updateMyPreferences = async (userId, preferencesPayload) => {
  const safePayload = parsePreferencesPayload(preferencesPayload);

  const [preferences] = await UserPreference.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      ...DEFAULT_USER_PREFERENCES,
      ...safePayload,
    },
  });

  if (Object.keys(safePayload).length > 0) {
    await preferences.update(safePayload);
  }

  return {
    email_notifications_enabled: preferences.email_notifications_enabled,
    security_events_notifications_enabled:
      preferences.security_events_notifications_enabled,
    compact_dashboard_mode_enabled: preferences.compact_dashboard_mode_enabled,
    dark_mode_enabled: preferences.dark_mode_enabled,
  };
};
