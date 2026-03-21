import { Role, User } from "../../models/relations.model.js";

const validatedRole = async (uid) => {
  try {
    const user = await User.findByPk(uid, { attributes: ["role_id"] });

    if (!user?.role_id) {
      return "Rol no encontrado";
    }

    const role = await Role.findByPk(user.role_id, { attributes: ["name"] });

    if (!role) {
      return "Rol no encontrado";
    }

    switch (role.name) {
      case "superAdmin":
        return "SuperAdmin";

      case "admin":
        return "Admin";

      case "teacher":
        return "Teacher";

      case "psychologist":
        return "Psychologist";

      case "developer":
        return "Developer";

      default:
        return "Rol no existente";
    }
  } catch (error) {
    console.error(
      "Se ha presentado un error al intentar validar el rol del usuario.",
      error,
    );

    return res.status(500).json({
      error:
        "Se ha presentado un error al intentar validar el rol del usuario.",
    });
  }
};

// //Middleware encargado de validar el rol de administrador o super administrador
export const allAdmins = async (req, res, next) => {
  try {
    const role = await validatedRole(req.uid);

    if (role === "SuperAdmin" || role === "Admin") {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, no tiene permisos para acceder a esta ruta.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol del usuario.",
    });
  }
};

//Middleware encargado de validar el rol super administrador
export const isSuperAdmin = async (req, res, next) => {
  try {
    const roleAdmin = await validatedRole(req.uid);

    if (roleAdmin === "SuperAdmin") {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, solo Super Administrador.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol Super Administrador.",
    });
  }
};

//Middleware encargado de validar el rol administrador
export const isAdmin = async (req, res, next) => {
  try {
    const roleAdmin = await validatedRole(req.uid);

    if (roleAdmin === "Admin") {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, solo Administrador.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol Administrador.",
    });
  }
};

// Middleware encargado de validar el rol teacher
export const isTeacher = async (req, res, next) => {
  try {
    const roleTeacher = await validatedRole(req.uid);

    if (roleTeacher === "Teacher") {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, solo Teacher.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol teacher.",
    });
  }
};

// //Middleware encargado de validar el rol de administrador o teacher
export const allUsers = async (req, res, next) => {
  try {
    const role = await validatedRole(req.uid);

    if (
      role === "SuperAdmin" ||
      role === "Admin" ||
      role === "Teacher" ||
      role === "Psychologist" ||
      role === "Developer"
    ) {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, no tiene permisos para acceder a esta ruta.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol del usuario.",
    });
  }
};

// //Middleware encargado de validar el rol de administrador o teacher
export const isAdminOrPsychologist = async (req, res, next) => {
  try {
    const role = await validatedRole(req.uid);

    if (role === "SuperAdmin" || role === "Admin" || role === "Psychologist") {
      return next();
    }

    return res.status(400).json({
      message: "Acceso denegado, no tiene permisos para acceder a esta ruta.",
    });
  } catch (error) {
    console.error("Error al validar el rol:", error);
    return res.status(500).json({
      error: "Error al validar el rol del usuario.",
    });
  }
};
