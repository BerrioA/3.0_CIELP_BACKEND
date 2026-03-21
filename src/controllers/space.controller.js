import {
  endSpaceSessionService,
  getAvailableSpacesService,
  getActiveSpaceSessionService,
  getSpaceMoodHistoryService,
  getUserSpaceStatsService,
  startSpaceSessionService,
} from "../services/index.js";

// 1. Obtener el catálogo de espacios digitales
export const getDigitalSpaces = async (req, res) => {
  try {
    const userId = req.uid || null;
    const roleId = req.role || null;

    const spaces = await getAvailableSpacesService(userId, roleId);
    res.status(200).json({ success: true, data: spaces });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Iniciar una sesión de relajación
export const startSession = async (req, res) => {
  try {
    const userId = req.uid;
    const { space_id } = req.body;

    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const session = await startSpaceSessionService(userId, space_id);

    res.status(201).json({
      success: true,
      message: "Sesión de relajación iniciada",
      data: { session_id: session.id, started_at: session.started_at },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 2.1 Obtener la sesión activa actual del usuario autenticado
export const getActiveSession = async (req, res) => {
  try {
    const userId = req.uid;

    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const session = await getActiveSpaceSessionService(userId);

    if (!session) {
      return res.status(200).json({
        success: true,
        message: "No existe una sesion activa para este usuario.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sesion activa obtenida correctamente.",
      data: {
        session_id: session.id,
        space_id: session.space_id,
        started_at: session.started_at,
        space: session.digital_space
          ? {
              id: session.digital_space.id,
              name: session.digital_space.name,
              type: session.digital_space.type,
              thumbnail_url: session.digital_space.thumbnail_url,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Finalizar la sesión de relajación
export const endSession = async (req, res) => {
  try {
    const userId = req.uid;
    const { session_id } = req.params; // Lo recibiremos por la URL: /end/:session_id
    const { mood_score } = req.body;

    if (!userId) return res.status(401).json({ error: "No autenticado" });

    const session = await endSpaceSessionService(
      userId,
      session_id,
      mood_score,
    );

    res.status(200).json({
      success: true,
      message: "Sesión finalizada exitosamente",
      data: {
        session_id: session.id,
        duration_seconds: session.duration_seconds,
        duration_minutes: (session.duration_seconds / 60).toFixed(2), // Extra de utilidad para el frontend
        mood_score: Number(mood_score),
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// 4. Obtener estadísticas de uso del usuario
export const getUserStats = async (req, res) => {
  try {
    const userId = req.uid;

    if (!userId)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const stats = await getUserSpaceStatsService(userId);

    res.status(200).json({
      success: true,
      message: "Estadísticas de relajación obtenidas correctamente",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Obtener historico de mood por espacio (psicologia/admin)
export const getMoodHistoryBySpace = async (req, res) => {
  try {
    const { days = 90 } = req.validated?.query || req.query;

    const history = await getSpaceMoodHistoryService({
      days,
    });

    return res.status(200).json({
      success: true,
      message: "Historico de mood por espacio obtenido correctamente",
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
