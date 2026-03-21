import { getGlobalAnalyticsService } from "../services/index.js";

// Controlador para obtener el resumen global de métricas institucionales
export const getGlobalDashboard = async (req, res) => {
  try {
    const period = (req.query?.period || "week").toString().toLowerCase();
    const dashboardData = await getGlobalAnalyticsService(period);

    res.status(200).json({
      success: true,
      message: "Métricas institucionales obtenidas exitosamente",
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
