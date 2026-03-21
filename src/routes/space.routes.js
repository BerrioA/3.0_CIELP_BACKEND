import { Router } from "express";
import {
  getMoodHistoryBySpace,
  getDigitalSpaces,
  startSession,
  endSession,
  getUserStats,
  getActiveSession,
} from "../controllers/index.js";
import {
  allUsers,
  isAdminOrPsychologist,
  isTeacher,
  requireToken,
} from "../middlewares/index.js";
import { validateRequest } from "../middlewares/zod.middleware.js";
import {
  endSpaceSessionBodySchema,
  endSpaceSessionParamsSchema,
  moodHistoryQuerySchema,
  startSpaceSessionBodySchema,
} from "../validators/security.schemas.js";

const router = Router();

// GET /api/spaces -> Obtiene el catálogo (Bosque, Mar, etc.)
router.get("/", requireToken, allUsers, getDigitalSpaces);

// POST /api/spaces/start -> El usuario le da "Play" a un sonido
router.post(
  "/start",
  requireToken,
  isTeacher,
  validateRequest({ body: startSpaceSessionBodySchema }),
  startSession,
);

// GET /api/spaces/stats -> Obtiene estadísticas, el resumen de tiempo y sesiones del usuario autenticado
router.get("/stats", requireToken, isTeacher, getUserStats);

// GET /api/spaces/mood-history -> Vista histórica de mood por espacio (psicologia/admin)
router.get(
  "/mood-history",
  requireToken,
  isAdminOrPsychologist,
  validateRequest({ query: moodHistoryQuerySchema }),
  getMoodHistoryBySpace,
);

// GET /api/spaces/active-session -> Recupera la sesión activa del usuario autenticado
router.get("/active-session", requireToken, isTeacher, getActiveSession);

// PUT /api/spaces/end/:session_id -> El usuario le da "Stop" o cierra el modal
router.put(
  "/end/:session_id",
  requireToken,
  isTeacher,
  validateRequest({
    params: endSpaceSessionParamsSchema,
    body: endSpaceSessionBodySchema,
  }),
  endSession,
);

export default router;
