import {
  AdditionalInformation,
  MbiTestSession,
  SessionLog,
  SpaceSession,
  UserProgressStat,
} from "../models/relations.model.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RETEST_WINDOW_DAYS = 30;

const parseDateWithoutTimezoneDrift = (value) => {
  if (!value) {
    return null;
  }

  const rawValue = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return new Date(`${rawValue}T00:00:00.000Z`);
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const resolveLastTestDate = async (userId) => {
  const additionalInformation = await AdditionalInformation.findOne({
    where: { user_id: userId },
    attributes: ["last_test_date"],
  });

  const fallbackLastSession = await MbiTestSession.findOne({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    attributes: ["created_at"],
  });

  return {
    lastTestDateRaw:
      additionalInformation?.last_test_date ||
      fallbackLastSession?.created_at ||
      null,
  };
};

export const getMbiRetestWindowStatus = async (userId) => {
  if (!userId) {
    throw new Error("Usuario no autenticado.");
  }

  const { lastTestDateRaw } = await resolveLastTestDate(userId);

  if (!lastTestDateRaw) {
    return {
      last_test_date: null,
      days_since_last_test: null,
      days_remaining: 0,
      should_retake: true,
      can_submit_test: true,
      next_recommended_date: null,
    };
  }

  const lastDate = parseDateWithoutTimezoneDrift(lastTestDateRaw);
  if (!lastDate) {
    return {
      last_test_date: null,
      days_since_last_test: null,
      days_remaining: 0,
      should_retake: true,
      can_submit_test: true,
      next_recommended_date: null,
    };
  }

  const elapsedMs = Date.now() - lastDate.getTime();
  const daysSinceLastTest = Math.max(
    0,
    Math.floor(elapsedMs / (24 * 60 * 60 * 1000)),
  );
  const shouldRetake = elapsedMs >= THIRTY_DAYS_MS;
  const daysRemaining = shouldRetake
    ? 0
    : Math.max(0, RETEST_WINDOW_DAYS - daysSinceLastTest);

  const nextRecommendedDate = new Date(lastDate);
  nextRecommendedDate.setDate(
    nextRecommendedDate.getDate() + RETEST_WINDOW_DAYS,
  );

  return {
    last_test_date: lastDate.toISOString(),
    days_since_last_test: daysSinceLastTest,
    days_remaining: daysRemaining,
    should_retake: shouldRetake,
    can_submit_test: shouldRetake,
    next_recommended_date: nextRecommendedDate.toISOString(),
  };
};

export const validateMbiRetestAvailability = async (userId) => {
  const status = await getMbiRetestWindowStatus(userId);

  if (status.can_submit_test) {
    return status;
  }

  const availabilityError = new Error(
    `Aun estas en tu proceso de mejora. Tu proxima evaluacion estara disponible en ${status.days_remaining} dia(s).`,
  );

  availabilityError.statusCode = 403;
  availabilityError.code = "MBI_RETEST_BLOCKED";
  availabilityError.meta = {
    days_remaining: status.days_remaining,
    next_recommended_date: status.next_recommended_date,
    last_test_date: status.last_test_date,
  };

  throw availabilityError;
};

const getBurnoutStatusLabel = (session) => {
  const ee = Number(session?.emotional_exhaustion_score) || 0;
  const dp = Number(session?.depersonalization_score) || 0;
  const pa = Number(session?.personal_accomplishment_score) || 0;

  const severe = ee > 26 && dp > 9 && pa < 34;
  if (severe) {
    return "Severo";
  }

  const highSignals = Number(ee > 26) + Number(dp > 9) + Number(pa < 34);
  if (highSignals >= 2) {
    return "Alto";
  }

  if (highSignals === 1) {
    return "Moderado";
  }

  return "Saludable";
};

const buildFavoriteSpaceId = (sessions = []) => {
  if (!sessions.length) {
    return null;
  }

  const countBySpaceId = sessions.reduce((acc, session) => {
    const spaceId = session?.space_id;
    if (!spaceId) {
      return acc;
    }

    acc[spaceId] = (acc[spaceId] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(countBySpaceId).reduce((winner, current) => {
    if (!winner) {
      return current;
    }

    return countBySpaceId[current] > countBySpaceId[winner] ? current : winner;
  }, null);
};

export const syncUserProgressStats = async (userId) => {
  if (!userId) {
    return null;
  }

  const completedSessions = await SpaceSession.findAll({
    where: {
      user_id: userId,
      status: "completed",
    },
    attributes: ["space_id", "duration_seconds"],
  });

  const moodLogs = await SessionLog.findAll({
    where: { user_id: userId },
    attributes: ["mood_score"],
  });

  const mbiSessions = await MbiTestSession.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    attributes: [
      "emotional_exhaustion_score",
      "depersonalization_score",
      "personal_accomplishment_score",
      "created_at",
    ],
  });

  const totalMeditationTime = completedSessions.reduce(
    (acc, session) => acc + (Number(session.duration_seconds) || 0),
    0,
  );

  const averageMoodImprovement = moodLogs.length
    ? Number(
        (
          moodLogs.reduce(
            (acc, log) => acc + (Number(log.mood_score) || 0),
            0,
          ) / moodLogs.length
        ).toFixed(2),
      )
    : 0;

  const burnoutStatusTrend = mbiSessions
    .slice(0, 6)
    .reverse()
    .map((session) => getBurnoutStatusLabel(session));

  const favoriteSpaceId = buildFavoriteSpaceId(completedSessions);

  const [stats] = await UserProgressStat.findOrCreate({
    where: { user_id: userId },
    defaults: {
      user_id: userId,
      total_meditation_time: totalMeditationTime,
      favorite_space_id: favoriteSpaceId,
      average_mood_improvement: averageMoodImprovement,
      burnout_status_trend: burnoutStatusTrend,
    },
  });

  await stats.update({
    total_meditation_time: totalMeditationTime,
    favorite_space_id: favoriteSpaceId,
    average_mood_improvement: averageMoodImprovement,
    burnout_status_trend: burnoutStatusTrend,
  });

  return stats;
};

export const markLastTestDate = async (userId, testDate = new Date()) => {
  if (!userId) {
    return;
  }

  const additionalInformation = await AdditionalInformation.findOne({
    where: { user_id: userId },
  });

  if (!additionalInformation) {
    return;
  }

  const isoDate = new Date(testDate).toISOString().split("T")[0];

  await additionalInformation.update({
    last_test_date: isoDate,
  });
};

export const getMbiRetestStatusService = async (userId) => {
  const status = await getMbiRetestWindowStatus(userId);

  if (!status.last_test_date) {
    return {
      ...status,
      banner_message:
        "Aun no tienes una medicion MBI inicial. Te recomendamos realizarla esta semana.",
    };
  }

  return {
    ...status,
    banner_message: status.should_retake
      ? "Es momento de chequear tu estado emocional. Te recomendamos repetir el MBI."
      : `Aun estas en tu proceso de mejora. Tu proxima evaluacion estara disponible en ${status.days_remaining} dia(s).`,
  };
};

const getDimensionDelta = (startValue, endValue, inverse = false) => {
  const start = Number(startValue) || 0;
  const end = Number(endValue) || 0;

  if (start === 0) {
    return {
      absolute_change: end - start,
      percent_change: 0,
      improved: inverse ? end > start : end < start,
    };
  }

  const rawPercent = ((end - start) / start) * 100;
  const normalizedPercent = Number(rawPercent.toFixed(2));
  const improved = inverse ? end > start : end < start;

  return {
    absolute_change: end - start,
    percent_change: normalizedPercent,
    improved,
  };
};

export const getMyMbiProgressComparisonService = async (userId) => {
  if (!userId) {
    throw new Error("Usuario no autenticado.");
  }

  const sessions = await MbiTestSession.findAll({
    where: { user_id: userId },
    order: [["created_at", "ASC"]],
    attributes: [
      "id",
      "created_at",
      "emotional_exhaustion_score",
      "depersonalization_score",
      "personal_accomplishment_score",
    ],
  });

  if (sessions.length < 2) {
    return {
      has_enough_data: false,
      message:
        "Se requieren al menos dos mediciones MBI para habilitar comparacion clinica.",
      baseline: sessions[0] || null,
      latest: sessions[sessions.length - 1] || null,
      dimensions: null,
    };
  }

  const baseline = sessions[0];
  const latest = sessions[sessions.length - 1];

  const emotionalExhaustion = getDimensionDelta(
    baseline.emotional_exhaustion_score,
    latest.emotional_exhaustion_score,
  );
  const depersonalization = getDimensionDelta(
    baseline.depersonalization_score,
    latest.depersonalization_score,
  );
  const personalAccomplishment = getDimensionDelta(
    baseline.personal_accomplishment_score,
    latest.personal_accomplishment_score,
    true,
  );

  const improvedCount = [
    emotionalExhaustion.improved,
    depersonalization.improved,
    personalAccomplishment.improved,
  ].filter(Boolean).length;

  const globalStatus =
    improvedCount >= 2
      ? "positive"
      : improvedCount === 1
        ? "mixed"
        : "needs_attention";

  return {
    has_enough_data: true,
    global_status: globalStatus,
    message:
      globalStatus === "positive"
        ? "Tu evolucion clinica muestra mejoria global frente a la medicion inicial."
        : globalStatus === "mixed"
          ? "Tu evolucion muestra avances parciales; conviene sostener acompanamiento y rutina."
          : "No se observa mejoria global aun; recomendamos reforzar intervenciones de autocuidado.",
    baseline: {
      session_id: baseline.id,
      date: baseline.created_at,
      emotional_exhaustion_score: baseline.emotional_exhaustion_score,
      depersonalization_score: baseline.depersonalization_score,
      personal_accomplishment_score: baseline.personal_accomplishment_score,
    },
    latest: {
      session_id: latest.id,
      date: latest.created_at,
      emotional_exhaustion_score: latest.emotional_exhaustion_score,
      depersonalization_score: latest.depersonalization_score,
      personal_accomplishment_score: latest.personal_accomplishment_score,
    },
    dimensions: {
      emotional_exhaustion: emotionalExhaustion,
      depersonalization,
      personal_accomplishment: personalAccomplishment,
    },
  };
};
