import { DigitalSpace } from "../models/digital_space.model.js";
import { SpaceSession } from "../models/space_session.model.js";
import { Op } from "sequelize";
import {
  MbiTestSession,
  Role,
  SessionLog,
  UserProgressStat,
} from "../models/relations.model.js";
import { getRankedRecommendedSpaces } from "./mbi.service.js";
import { syncUserProgressStats } from "./progress-analytics.service.js";

const getWeekStartDate = (dateValue) => {
  const date = new Date(dateValue);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const toIsoDate = (dateValue) =>
  new Date(dateValue).toISOString().split("T")[0];

const buildWeeklyEvolution = (sessions = []) => {
  const weeksToInclude = 8;
  const weekKeys = [];
  const weekMap = {};
  const currentWeekStart = getWeekStartDate(new Date());

  for (let index = weeksToInclude - 1; index >= 0; index -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - index * 7);
    const key = toIsoDate(weekStart);
    weekKeys.push(key);
    weekMap[key] = {
      week_start: key,
      week_label: weekStart.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
      }),
      total_seconds: 0,
      sessions_count: 0,
    };
  }

  sessions.forEach((session) => {
    const baseDate = session.ended_at || session.created_at;
    if (!baseDate) {
      return;
    }

    const weekKey = toIsoDate(getWeekStartDate(baseDate));
    if (!weekMap[weekKey]) {
      return;
    }

    weekMap[weekKey].total_seconds += Number(session.duration_seconds) || 0;
    weekMap[weekKey].sessions_count += 1;
  });

  return weekKeys.map((key) => ({
    week_start: weekMap[key].week_start,
    week_label: weekMap[key].week_label,
    total_minutes: Number((weekMap[key].total_seconds / 60).toFixed(2)),
    sessions_count: weekMap[key].sessions_count,
  }));
};

const getAvoidedSpaceIdsByMood = (logs = []) => {
  return new Set(
    logs
      .filter((log) => Number(log?.mood_score) <= 2)
      .map((log) => log?.space_id)
      .filter(Boolean),
  );
};

// 1. Obtener el catálogo de espacios disponibles
export const getAvailableSpacesService = async (
  userId = null,
  roleId = null,
) => {
  try {
    const spaces = await DigitalSpace.findAll({
      where: { is_active: true },
      attributes: [
        "id",
        "name",
        "description",
        "type",
        "thumbnail_url",
        "video_url",
      ],
    });

    if (!userId || !roleId) {
      return spaces;
    }

    const role = await Role.findByPk(roleId, { attributes: ["name"] });

    if (!role || role.name !== "teacher") {
      return spaces;
    }

    const latestMbiSession = await MbiTestSession.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      attributes: [
        "emotional_exhaustion_score",
        "depersonalization_score",
        "personal_accomplishment_score",
      ],
    });

    if (!latestMbiSession) {
      return [];
    }

    const rankedRecommendations = getRankedRecommendedSpaces(
      latestMbiSession.emotional_exhaustion_score,
      latestMbiSession.depersonalization_score,
      latestMbiSession.personal_accomplishment_score,
    );

    const recentLogs = await SessionLog.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 20,
      attributes: ["space_id", "mood_score"],
    });

    const avoidedSpaceIds = getAvoidedSpaceIdsByMood(recentLogs);
    const spaceByName = spaces.reduce((acc, space) => {
      acc[space.name] = space;
      return acc;
    }, {});

    const preferredRecommendation = rankedRecommendations.find((candidate) => {
      const mappedSpace = spaceByName[candidate.spaceName];
      if (!mappedSpace) {
        return false;
      }

      return !avoidedSpaceIds.has(mappedSpace.id);
    });

    const fallbackRecommendation = rankedRecommendations.find((candidate) =>
      Boolean(spaceByName[candidate.spaceName]),
    );

    const chosenRecommendation =
      preferredRecommendation || fallbackRecommendation;

    if (!chosenRecommendation) {
      return [];
    }

    return spaces.filter(
      (space) => space.name === chosenRecommendation.spaceName,
    );
  } catch (error) {
    throw new Error(
      "Error al obtener los espacios digitales: " + error.message,
    );
  }
};

// 1.1 Obtener la sesión activa actual del usuario
export const getActiveSpaceSessionService = async (userId) => {
  try {
    const activeSession = await SpaceSession.findOne({
      where: {
        user_id: userId,
        status: "active",
      },
      include: [
        {
          model: DigitalSpace,
          attributes: ["id", "name", "type", "thumbnail_url", "video_url"],
        },
      ],
      order: [["started_at", "DESC"]],
    });

    if (!activeSession) {
      return null;
    }

    return activeSession;
  } catch (error) {
    throw new Error(
      "Error al obtener la sesion activa del usuario: " + error.message,
    );
  }
};

// 2. Iniciar una sesión de relajación
export const startSpaceSessionService = async (userId, spaceId) => {
  try {
    // Validar que el espacio exista
    const space = await DigitalSpace.findByPk(spaceId);
    if (!space) throw new Error("El espacio digital seleccionado no existe.");

    // [BUENA PRÁCTICA] Limpiar sesiones previas que el usuario dejó abandonadas
    await SpaceSession.update(
      { status: "abandoned", ended_at: new Date() },
      {
        where: {
          user_id: userId,
          status: "active",
        },
      },
    );

    // Crear la nueva sesión
    const newSession = await SpaceSession.create({
      user_id: userId,
      space_id: spaceId,
      status: "active",
      started_at: new Date(),
    });

    return newSession;
  } catch (error) {
    throw new Error("Error al iniciar la sesión: " + error.message);
  }
};

// 3. Finalizar la sesión y calcular el tiempo
export const endSpaceSessionService = async (userId, sessionId, moodScore) => {
  try {
    // Buscar la sesión activa específica de este usuario
    const session = await SpaceSession.findOne({
      where: {
        id: sessionId,
        user_id: userId,
        status: "active",
      },
    });

    if (!session) {
      throw new Error(
        "No se encontró una sesión activa con ese ID para este usuario.",
      );
    }

    const normalizedMoodScore = Number(moodScore);
    if (!Number.isInteger(normalizedMoodScore)) {
      throw new Error(
        "El feedback post-sesion (mood_score) debe ser un entero entre 1 y 10.",
      );
    }

    if (normalizedMoodScore < 1 || normalizedMoodScore > 10) {
      throw new Error("El mood_score debe estar entre 1 y 10.");
    }

    const endedAt = new Date();

    // Calcular la diferencia en segundos
    const durationMs =
      endedAt.getTime() - new Date(session.started_at).getTime();
    const durationSeconds = Math.floor(durationMs / 1000);

    // Actualizar el registro
    session.ended_at = endedAt;
    session.duration_seconds = durationSeconds;
    session.status = "completed";

    await session.save();

    await SessionLog.create({
      user_id: userId,
      space_id: session.space_id,
      session_id: session.id,
      duration_seconds: durationSeconds,
      mood_score: normalizedMoodScore,
    });

    await syncUserProgressStats(userId);

    return session;
  } catch (error) {
    throw new Error("Error al finalizar la sesión: " + error.message);
  }
};

// 4. Obtener estadísticas del usuario sobre sus sesiones de relajación
export const getUserSpaceStatsService = async (userId) => {
  try {
    // Buscar todas las sesiones completadas por este usuario
    const sessions = await SpaceSession.findAll({
      where: {
        user_id: userId,
        status: "completed",
      },
      include: [
        {
          model: DigitalSpace,
          attributes: ["name", "type", "thumbnail_url"], // Para saber qué espacios usó
        },
      ],
      order: [["created_at", "DESC"]], // Las más recientes primero
    });

    // Calcular estadísticas
    const totalSessions = sessions.length;

    // Sumar todos los segundos
    const totalSeconds = sessions.reduce(
      (acc, session) => acc + session.duration_seconds,
      0,
    );

    // Convertir a minutos y redondear a 2 decimales
    const totalMinutes = parseFloat((totalSeconds / 60).toFixed(2));

    // Opcional pero genial: ¿Cuál es su espacio favorito?
    // Creamos un diccionario para contar cuántas veces usó cada uno
    const spaceCounts = {};
    sessions.forEach((session) => {
      const spaceName = session.digital_space?.name;
      if (spaceName) {
        spaceCounts[spaceName] = (spaceCounts[spaceName] || 0) + 1;
      }
    });

    // Encontrar el espacio más usado
    let favoriteSpace = "Aún no hay datos";
    if (Object.keys(spaceCounts).length > 0) {
      favoriteSpace = Object.keys(spaceCounts).reduce((a, b) =>
        spaceCounts[a] > spaceCounts[b] ? a : b,
      );
    }

    const progressStats = await UserProgressStat.findOne({
      where: { user_id: userId },
      attributes: [
        "total_meditation_time",
        "favorite_space_id",
        "average_mood_improvement",
        "burnout_status_trend",
      ],
    });

    const latestMoodLog = await SessionLog.findOne({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      attributes: ["mood_score", "created_at"],
    });

    return {
      overview: {
        total_sessions: totalSessions,
        total_minutes_meditated: totalMinutes,
        favorite_space: favoriteSpace,
      },
      recent_history: sessions.slice(0, 5), // Solo devolvemos las últimas 5 para no saturar
      weekly_evolution: buildWeeklyEvolution(sessions),
      progress_summary: {
        total_meditation_time_seconds:
          progressStats?.total_meditation_time || totalSeconds,
        favorite_space_id: progressStats?.favorite_space_id || null,
        average_mood_improvement: progressStats?.average_mood_improvement || 0,
        burnout_status_trend: progressStats?.burnout_status_trend || [],
        last_mood_score: latestMoodLog?.mood_score || null,
        last_mood_logged_at: latestMoodLog?.created_at || null,
      },
    };
  } catch (error) {
    throw new Error(
      "Error al obtener las estadísticas de los espacios: " + error.message,
    );
  }
};

export const getSpaceMoodHistoryService = async ({ days = 90 } = {}) => {
  try {
    const sanitizedDays = Number.isInteger(Number(days))
      ? Math.max(7, Math.min(365, Number(days)))
      : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - sanitizedDays);

    const logs = await SessionLog.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
        },
      },
      include: [
        {
          model: DigitalSpace,
          attributes: ["id", "name", "type"],
        },
      ],
      attributes: [
        "id",
        "space_id",
        "duration_seconds",
        "mood_score",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
      limit: 2000,
    });

    const summaryMap = {};
    const weeklyMap = {};

    logs.forEach((log) => {
      const spaceId = log?.space_id || "unknown";
      const spaceName = log?.digital_space?.name || "Espacio sin nombre";
      const moodScore = Number(log?.mood_score) || 0;
      const duration = Number(log?.duration_seconds) || 0;

      if (!summaryMap[spaceId]) {
        summaryMap[spaceId] = {
          space_id: spaceId,
          space_name: spaceName,
          sessions_count: 0,
          total_mood: 0,
          total_duration_seconds: 0,
          last_logged_at: null,
        };
      }

      summaryMap[spaceId].sessions_count += 1;
      summaryMap[spaceId].total_mood += moodScore;
      summaryMap[spaceId].total_duration_seconds += duration;
      summaryMap[spaceId].last_logged_at =
        summaryMap[spaceId].last_logged_at || log?.created_at || null;

      const date = new Date(log?.created_at || Date.now());
      const weekStart = getWeekStartDate(date);
      const weekKey = toIsoDate(weekStart);

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          week_start: weekKey,
          week_label: weekStart.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
          }),
          total_mood: 0,
          entries_count: 0,
        };
      }

      weeklyMap[weekKey].total_mood += moodScore;
      weeklyMap[weekKey].entries_count += 1;
    });

    const summary = Object.values(summaryMap)
      .map((item) => ({
        space_id: item.space_id,
        space_name: item.space_name,
        sessions_count: item.sessions_count,
        average_mood_score: Number(
          (item.total_mood / Math.max(1, item.sessions_count)).toFixed(2),
        ),
        average_duration_minutes: Number(
          (
            item.total_duration_seconds /
            60 /
            Math.max(1, item.sessions_count)
          ).toFixed(2),
        ),
        last_logged_at: item.last_logged_at,
      }))
      .sort((a, b) => b.sessions_count - a.sessions_count);

    const weeklyMoodTrend = Object.values(weeklyMap)
      .sort(
        (a, b) =>
          new Date(a.week_start).getTime() - new Date(b.week_start).getTime(),
      )
      .map((item) => ({
        week_start: item.week_start,
        week_label: item.week_label,
        average_mood_score: Number(
          (item.total_mood / Math.max(1, item.entries_count)).toFixed(2),
        ),
        entries_count: item.entries_count,
      }));

    const recentLogs = logs.slice(0, 12).map((log) => ({
      id: log.id,
      mood_score: Number(log.mood_score) || 0,
      duration_seconds: Number(log.duration_seconds) || 0,
      created_at: log.created_at,
      space: {
        id: log.digital_space?.id || null,
        name: log.digital_space?.name || "Espacio sin nombre",
        type: log.digital_space?.type || null,
      },
    }));

    return {
      summary,
      weekly_mood_trend: weeklyMoodTrend,
      recent_logs: recentLogs,
      metadata: {
        period_days: sanitizedDays,
        logs_count: logs.length,
      },
    };
  } catch (error) {
    throw new Error(
      "Error al obtener el historico de mood por espacio: " + error.message,
    );
  }
};
