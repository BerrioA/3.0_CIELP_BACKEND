import {
  getMbiQuestionsService,
  getMyMbiComparisonService,
  getMyMbiRetestStatusService,
  getMyBurnoutAlertsService,
  markBurnoutAlertAsReadService,
  getUserTestHistoryService,
  processMbiTest,
} from "../services/mbi.service.js";

// Controlador para obtener las preguntas del test MBI
export const getQuestions = async (_, res) => {
  try {
    const questions = await getMbiQuestionsService();

    res.status(200).json({
      success: true,
      message: "Preguntas obtenidas exitosamente",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Error interno al obtener las preguntas",
    });
  }
};

// Controlador para procesar las respuestas del test MBI
export const submitTeacherTest = async (req, res) => {
  try {
    // 1. Extraer datos del body y del usuario autenticado
    const { answers } = req.body;

    // Asumimos que tu middleware de autenticación (JWT o Passport) guarda el usuario en req.user
    const userId = req.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // 2. Delegar la lógica pesada al servicio
    const result = await processMbiTest(userId, answers);

    // 3. Responder al cliente
    res.status(201).json({
      message: "Test MBI registrado y procesado exitosamente",
      data: result,
    });
  } catch (error) {
    // Aquí capturamos errores del servicio (ej. si enviaron un UUID falso)
    const statusCode = Number(error?.statusCode) || 400;

    res.status(statusCode).json({
      error: error.message,
      code: error?.code || null,
      meta: error?.meta || null,
    });
  }
};

// Controlador para obtener el historial de test MBI de un usuario
export const getTestHistory = async (req, res) => {
  try {
    // Extraemos el ID del usuario desde el token de autenticación
    const userId = req.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const history = await getUserTestHistoryService(userId);

    res.status(200).json({
      success: true,
      message: "Historial obtenido exitosamente",
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Error al obtener el historial",
    });
  }
};

// Controlador para obtener el historial de test MBI de un usuario específico (solo para Admin o Psychologist)
export const getTestHistoryByUserId = async (req, res) => {
  try {
    // Extraemos el ID del profesor
    const teacher = req.params.teacherId;

    if (!teacher) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const history = await getUserTestHistoryService(teacher);

    res.status(200).json({
      success: true,
      message: "Historial obtenido exitosamente",
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Error al obtener el historial",
    });
  }
};

// Controlador para obtener las alertas de burnout del usuario autenticado (psicologo)
export const getMyBurnoutAlerts = async (req, res) => {
  try {
    const userId = req.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const alerts = await getMyBurnoutAlertsService(userId);

    res.status(200).json({
      success: true,
      message: "Alertas clinicas obtenidas exitosamente",
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Error al obtener alertas clinicas",
    });
  }
};

// Controlador para marcar una alerta de burnout como leida
export const markBurnoutAlertAsRead = async (req, res) => {
  try {
    const userId = req.uid;
    const { alertId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!alertId) {
      return res.status(400).json({ error: "Debe enviar el ID de la alerta" });
    }

    const result = await markBurnoutAlertAsReadService(userId, alertId);

    return res.status(200).json({
      success: true,
      message: "Alerta marcada como leida",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || "Error al actualizar la alerta",
    });
  }
};

export const getMyMbiRetestStatus = async (req, res) => {
  try {
    const userId = req.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const status = await getMyMbiRetestStatusService(userId);

    return res.status(200).json({
      success: true,
      message: "Estado de recaptura MBI obtenido exitosamente",
      data: status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Error al obtener estado de recaptura MBI",
    });
  }
};

export const getMyMbiProgressComparison = async (req, res) => {
  try {
    const userId = req.uid;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const comparison = await getMyMbiComparisonService(userId);

    return res.status(200).json({
      success: true,
      message: "Comparacion MBI obtenida exitosamente",
      data: comparison,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Error al obtener comparacion MBI",
    });
  }
};
