import {
  getAllUsers,
  deleteUser,
  deleteUsersComplete,
  getUsersTrash,
  registerUser,
  updateMePassword,
  updatePassword,
  updateUser,
  restoreUsers,
  registerAdditionalInformation,
  getMyAdditionalInformation,
  getMyPreferences,
  updateMyPreferences,
} from "../services/index.js";

// Controlador para obtener todos los usuarios
export const getUsers = async (_, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error(
      "Se ha presentado un error intentar al obtener los usuarios",
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

// Controlador para actualizar usuarios e informacion adicional
export const updateUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { dataUserUpdate } = req.body;

    // Validar que al menos uno de los objetos tenga datos
    if (!dataUserUpdate) {
      return res.status(400).json({
        message: "Debe proporcionar al menos un dato para actualizar",
      });
    }

    let userToUpdate = null;

    // Actualizar usuario si se proporcionaron datos
    if (dataUserUpdate && Object.keys(dataUserUpdate).length > 0) {
      userToUpdate = await updateUser({
        userId,
        dataUserUpdate,
      });

      if (userToUpdate.error) {
        return res.status(404).json({ message: userToUpdate.error });
      }
    }

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: userToUpdate,
    });
  } catch (error) {
    console.error(
      "Ha ocurrido un error al intentar actualizar el usuario:",
      error,
    );
    return res.status(500).json({
      message: "Ha ocurrido un error al intentar actualizar el usuario",
      error: error.message,
    });
  }
};

// Controlador para registrar administradores usando authService
export const registerAdmin = async (req, res) => {
  try {
    const { userData } = req.body;

    await registerUser(userData, "admin");

    return res
      .status(201)
      .json({ message: "Administrador registrado exitosamente" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const registerAdditionalInformations = async (req, res) => {
  try {
    const userId = req.uid;

    const { additionalInformation } = req.body;

    await registerAdditionalInformation(userId, additionalInformation);

    return res
      .status(201)
      .json({ message: "Información adicional registrada exitosamente" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Controlador para registrar psicólogos usando authService
export const registerPsychologist = async (req, res) => {
  try {
    const { userData } = req.body;

    // Llamar al mismo servicio pero indicando el rol deseado
    await registerUser(userData, "psychologist");

    return res
      .status(201)
      .json({ message: "Psicólogo registrado exitosamente" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Controlador para cambiar la contraseña de un usuario desde panel administrativo
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
      return res.status(400).json({
        message: "Debe proporcionar la contraseña actual y la nueva contraseña",
      });
    }

    const result = await updatePassword({
      userId,
      newPassword,
      oldPassword,
    });

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      });
    }

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({
      message: "Ha ocurrido un error al intentar cambiar la contraseña",
      error: error.message,
    });
  }
};

// Controlador para cambiar la contraseña de un usuario autenticado
export const changeMePassword = async (req, res) => {
  try {
    const userId = req.uid;
    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
      return res.status(400).json({
        message: "Debe proporcionar la contraseña actual y la nueva contraseña",
      });
    }

    const result = await updateMePassword({
      userId,
      newPassword,
      oldPassword,
    });

    if (result.error) {
      return res.status(400).json({
        message: result.error,
      });
    }

    return res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({
      message: "Ha ocurrido un error al intentar cambiar la contraseña",
      error: error.message,
    });
  }
};

// Controlador para eliminar un usuario por
export const deleteUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword } = req.body || {};

    const result = await deleteUser({
      userId,
      actorUserId: req.uid,
      currentPassword,
    });

    if (result?.error) {
      return res.status(400).json({ message: result.error });
    }

    if (!result) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(
      "Se ha presentado un error al intentar eliminar el usuario",
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar un usuario por completo
export const deleteUserComplete = async (req, res) => {
  try {
    const userId = req.params;

    const result = await deleteUsersComplete(userId);

    if (!result) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Usuario eliminado correctamente de la papelera de reciclaje",
    });
  } catch (error) {
    console.error(
      "Se ha presentado un error al intentar eliminar el usuario definitivamente",
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

// Controlador para obtener todos los usuarios en papelera de reciclaje
export const getAllUsersTrash = async (_, res) => {
  try {
    const deletedUsers = await getUsersTrash();
    res.status(200).json(deletedUsers);
  } catch (error) {
    console.error(
      "Se ha presentado un error al intentar obtener los usuarios en papelera de reciclaje",
      error,
    );
    res.status(500).json({ error: error.message });
  }
};

// Controlador para restaurar un usuario desde la papelera de reciclaje
export const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "El ID del usuario es requerido para restaurar" });
    }
    const result = await restoreUsers({ userId });

    if (result.error) {
      return res.status(404).json({ message: result.error });
    }
    return res.status(200).json({ message: result.message });
  } catch (error) {
    console.error(
      "Error al intentar restaurar el usuario desde la papelera de reciclaje:",
      error,
    );
    return res.status(500).json({
      message: "Ha ocurrido un error al intentar restaurar el usuario",
      error: error.message,
    });
  }
};

export const getMePreferences = async (req, res) => {
  try {
    const preferences = await getMyPreferences(req.uid);

    return res.status(200).json({
      message: "Preferencias obtenidas correctamente.",
      data: preferences,
    });
  } catch (error) {
    return res.status(500).json({
      message: "No fue posible obtener las preferencias de usuario.",
      error: error.message,
    });
  }
};

export const getMeAdditionalInformation = async (req, res) => {
  try {
    const additionalInformation = await getMyAdditionalInformation(req.uid);

    return res.status(200).json({
      message: "Informacion adicional obtenida correctamente.",
      data: additionalInformation,
    });
  } catch (error) {
    return res.status(500).json({
      message: "No fue posible obtener la informacion adicional del usuario.",
      error: error.message,
    });
  }
};

export const updateMePreferences = async (req, res) => {
  try {
    const preferences = await updateMyPreferences(req.uid, req.body || {});

    return res.status(200).json({
      message: "Preferencias actualizadas correctamente.",
      data: preferences,
    });
  } catch (error) {
    return res.status(500).json({
      message: "No fue posible actualizar las preferencias de usuario.",
      error: error.message,
    });
  }
};
