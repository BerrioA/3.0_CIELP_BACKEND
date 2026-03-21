import { Router } from "express";
import {
  getTeacherById,
  getTeachers,
  registerTeacher,
} from "../controllers/index.js";
import { isAdminOrPsychologist, requireToken } from "../middlewares/index.js";
import { validateRequest } from "../middlewares/zod.middleware.js";
import { registerTeacherBodySchema } from "../validators/security.schemas.js";

const router = Router();

router.post(
  "/",
  validateRequest({ body: registerTeacherBodySchema }),
  registerTeacher,
);
router.get("/", requireToken, isAdminOrPsychologist, getTeachers);
router.get("/:teacherId", requireToken, isAdminOrPsychologist, getTeacherById);

export default router;
