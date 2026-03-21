import { cleanupExpiredVerificationCodes } from "../services/auth.service.js";

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos en milisegundos

// Función para configurar tareas programadas
export const setupScheduledTasks = () => {
  const runCleanup = async () => {
    try {
      await cleanupExpiredVerificationCodes();

      // const deletedCount = await cleanupExpiredVerificationCodes();
      // console.log(
      //   `[Scheduler] Limpieza de códigos expirados completada. Eliminados: ${deletedCount}`,
      // );
    } catch (error) {
      console.error(
        "[Scheduler] Error al limpiar códigos expirados:",
        error.message,
      );
    }
  };

  // Primera ejecución al iniciar para evitar acumulación al reiniciar el servicio.
  void runCleanup();

  const intervalId = setInterval(() => {
    void runCleanup();
  }, CLEANUP_INTERVAL_MS);

  // console.log(
  //   "[Scheduler] Limpieza automática de códigos iniciada (cada 5 min)",
  // );

  return {
    stop: () => clearInterval(intervalId),
  };
};
