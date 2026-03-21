import { Router } from "express";
import {
  getUsers,
  getAllUsersTrash,
  registerAdmin,
  updateUsers,
  registerPsychologist,
  changePassword,
  changeMePassword,
  deleteUsers,
  deleteUserComplete,
  restoreUser,
  registerAdditionalInformations,
  getMeAdditionalInformation,
  getMePreferences,
  updateMePreferences,
} from "../controllers/index.js";
import { requireToken } from "../middlewares/auth/requireToken.js";
import { allAdmins, isSuperAdmin } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/zod.middleware.js";
import {
  additionalInformationBodySchema,
  changePasswordBodySchema,
  deleteUserBodySchema,
  registerAdminBodySchema,
  registerPsychologistBodySchema,
  userIdParamsSchema,
} from "../validators/security.schemas.js";

const router = Router();

// Rutas para la gestión de usuarios, protegidas por autenticación y autorización

// Ruta para obtener la lista de usuarios, requiere token y rol de super admin o admin
router.get("/", requireToken, allAdmins, getUsers);

// Ruta para obtener la lista de usuarios eliminados (papelera), requiere token y rol de super admin o admin
router.get("/trash", requireToken, allAdmins, getAllUsersTrash);

// Rutas para registrar nuevos usuarios, requiere token y rol de super admin o admin
router.post(
  "/psychologists",
  requireToken,
  allAdmins,
  validateRequest({ body: registerPsychologistBodySchema }),
  registerPsychologist,
);

// Ruta para registrar nuevos administradores, requiere token y rol de super admin
router.post(
  "/admins",
  requireToken,
  isSuperAdmin,
  validateRequest({ body: registerAdminBodySchema }),
  registerAdmin,
);

// Ruta para registrar información adicional de un usuario, requiere token
router.post(
  "/additional-information",
  requireToken,
  validateRequest({ body: additionalInformationBodySchema }),
  registerAdditionalInformations,
);

// Ruta para obtener la informacion adicional del usuario autenticado
router.get(
  "/me/additional-information",
  requireToken,
  getMeAdditionalInformation,
);

// Rutas para actualizar información de usuarios, requiere token y rol de super admin o admin
router.patch(
  "/me/password",
  requireToken,
  validateRequest({ body: changePasswordBodySchema }),
  changeMePassword,
);

// Ruta para obtener preferencias del usuario autenticado
router.get("/me/preferences", requireToken, getMePreferences);

// Ruta para actualizar preferencias del usuario autenticado
router.patch("/me/preferences", requireToken, updateMePreferences);

// Rutas para actualizar información de usuarios, requiere token y rol de super admin o admin
router.patch(
  "/:userId",
  requireToken,
  allAdmins,
  validateRequest({ params: userIdParamsSchema }),
  updateUsers,
);

// Rutas para cambiar la contraseña de un usuario específico, requiere token y rol de super admin
router.patch(
  "/:userId/password",
  requireToken,
  isSuperAdmin,
  validateRequest({
    params: userIdParamsSchema,
    body: changePasswordBodySchema,
  }),
  changePassword,
);

// Rutas para eliminar usuarios, requiere token y rol de super admin o admin
router.delete(
  "/:userId",
  requireToken,
  allAdmins,
  validateRequest({
    params: userIdParamsSchema,
    body: deleteUserBodySchema,
  }),
  deleteUsers,
);

// Ruta para eliminar completamente un usuario de la base de datos, requiere token y rol de super admin o admin
router.delete(
  "/:userId/permanent",
  requireToken,
  allAdmins,
  validateRequest({ params: userIdParamsSchema }),
  deleteUserComplete,
);

// Ruta para restaurar un usuario eliminado, requiere token y rol de super admin o admin
router.patch(
  "/:userId/restore",
  requireToken,
  allAdmins,
  validateRequest({ params: userIdParamsSchema }),
  restoreUser,
);

export default router;
