import { Router } from "express";
import { requireToken } from "../middlewares/auth/requireToken.js";
import { isAdminOrPsychologist } from "../middlewares/index.js";
import { getGlobalDashboard } from "../controllers/index.js";

const router = Router();

// GET /api/analytics/global -> Obtiene el resumen para los directivos
router.get("/global", requireToken, isAdminOrPsychologist, getGlobalDashboard);

export default router;
