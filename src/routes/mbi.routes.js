import { Router } from "express";
import {
  getMyMbiProgressComparison,
  getMyMbiRetestStatus,
  getQuestions,
  getMyBurnoutAlerts,
  markBurnoutAlertAsRead,
  submitTeacherTest,
  getTestHistory,
  getTestHistoryByUserId,
} from "../controllers/index.js";
import {
  allUsers,
  isAdminOrPsychologist,
  isTeacher,
  requireToken,
} from "../middlewares/index.js";
import { validateRequest } from "../middlewares/zod.middleware.js";
import {
  alertIdParamsSchema,
  submitMbiBodySchema,
  teacherIdParamsSchema,
} from "../validators/security.schemas.js";

const router = Router();

// GET Obtiene el catálogo de preguntas
router.get("/questions", requireToken, allUsers, getQuestions);

// POST Guarda los resultados del test
router.post(
  "/submit",
  requireToken,
  isTeacher,
  validateRequest({ body: submitMbiBodySchema }),
  submitTeacherTest,
);

// GET Obtiene el progreso histórico del docente autenticado
router.get("/history", requireToken, isTeacher, getTestHistory);

// GET Obtiene estado de frecuencia sugerida para recapturar MBI (cada 30 días)
router.get("/retest-status/me", requireToken, isTeacher, getMyMbiRetestStatus);

// GET Obtiene comparación clínica antes/después (T1 vs último Tn)
router.get("/progress/my", requireToken, isTeacher, getMyMbiProgressComparison);

// GET Obtiene el progreso histórico de un docente específico (solo para Admin o Psychologist)
router.get(
  "/history/:teacherId",
  requireToken,
  isAdminOrPsychologist,
  validateRequest({ params: teacherIdParamsSchema }),
  getTestHistoryByUserId,
);

// GET Obtiene alertas clinicas del psicologo/admin autenticado
router.get(
  "/alerts/my",
  requireToken,
  isAdminOrPsychologist,
  getMyBurnoutAlerts,
);

// PATCH Marca una alerta clinica como leida
router.patch(
  "/alerts/:alertId/read",
  requireToken,
  isAdminOrPsychologist,
  validateRequest({ params: alertIdParamsSchema }),
  markBurnoutAlertAsRead,
);

export default router;
