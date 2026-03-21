import {
  User,
  MbiTestSession,
  SpaceSession,
  DigitalSpace,
  Role,
  AdditionalInformation,
} from "../models/relations.model.js";
import { Op } from "sequelize";

const VALID_PERIODS = ["today", "week", "month"];

const getPeriodRanges = (period = "week") => {
  const now = new Date();
  const endCurrent = now;
  let startCurrent;

  if (period === "today") {
    startCurrent = new Date(now);
    startCurrent.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    startCurrent = new Date(now);
    startCurrent.setDate(1);
    startCurrent.setHours(0, 0, 0, 0);
  } else {
    // week (ultimos 7 dias incluyendo hoy)
    startCurrent = new Date(now);
    startCurrent.setDate(startCurrent.getDate() - 6);
    startCurrent.setHours(0, 0, 0, 0);
  }

  const durationMs = endCurrent.getTime() - startCurrent.getTime();
  const endPrevious = new Date(startCurrent.getTime() - 1);
  const startPrevious = new Date(endPrevious.getTime() - durationMs);

  return {
    current: {
      start: startCurrent,
      end: endCurrent,
    },
    previous: {
      start: startPrevious,
      end: endPrevious,
    },
  };
};

const calculateDelta = (currentValue, previousValue) => {
  const delta = currentValue - previousValue;

  if (previousValue === 0) {
    return {
      absolute: delta,
      percent: currentValue > 0 ? 100 : 0,
    };
  }

  return {
    absolute: delta,
    percent: Number(((delta / previousValue) * 100).toFixed(2)),
  };
};

const roundToTwo = (value) => Number(Number(value || 0).toFixed(2));

const getRiskTierFromScores = ({ ee = 0, dp = 0, pa = 0 }) => {
  let affectedAreas = 0;

  if (ee > 26) affectedAreas += 1;
  if (dp > 9) affectedAreas += 1;
  if (pa < 34) affectedAreas += 1;

  if (affectedAreas === 3) {
    return {
      key: "severo",
      label: "Riesgo severo",
      score: 3,
      priority: 4,
    };
  }

  if (affectedAreas === 2) {
    return {
      key: "alto",
      label: "Riesgo alto",
      score: 2,
      priority: 3,
    };
  }

  if (affectedAreas === 1) {
    return {
      key: "moderado",
      label: "Riesgo moderado",
      score: 1,
      priority: 2,
    };
  }

  return {
    key: "saludable",
    label: "Saludable",
    score: 0,
    priority: 1,
  };
};

const getInstitutionalTrafficLight = (riskScoreAverage) => {
  if (riskScoreAverage >= 2.2) {
    return {
      key: "high",
      label: "Alerta alta",
      color: "error",
      summary:
        "Predominan niveles de riesgo alto/severo. Se requiere intervencion prioritaria.",
    };
  }

  if (riskScoreAverage >= 1.2) {
    return {
      key: "medium",
      label: "Atencion moderada",
      color: "warning",
      summary:
        "Existen señales de desgaste relevantes. Conviene reforzar el seguimiento.",
    };
  }

  return {
    key: "low",
    label: "Estable",
    color: "success",
    summary:
      "El comportamiento institucional se mantiene en un rango controlado.",
  };
};

const buildTrendInfo = ({ currentValue, previousValue, tolerance = 0.15 }) => {
  const delta = currentValue - previousValue;
  const percent =
    previousValue === 0
      ? currentValue > 0
        ? 100
        : 0
      : roundToTwo((delta / previousValue) * 100);

  if (delta > tolerance) {
    return {
      direction: "up",
      label: "En aumento",
      interpretation: "Deterioro frente al periodo anterior",
      delta: roundToTwo(delta),
      percent,
    };
  }

  if (delta < -tolerance) {
    return {
      direction: "down",
      label: "En descenso",
      interpretation: "Mejora frente al periodo anterior",
      delta: roundToTwo(delta),
      percent,
    };
  }

  return {
    direction: "stable",
    label: "Estable",
    interpretation: "Sin variacion significativa",
    delta: roundToTwo(delta),
    percent,
  };
};

const getSexLabel = (sex) => {
  if (sex === "F") {
    return "Femenino";
  }

  if (sex === "M") {
    return "Masculino";
  }

  if (sex === "other") {
    return "Otro";
  }

  return "Sin dato";
};

const getAgeRangeFromBirthDate = (birthDate) => {
  if (!birthDate) {
    return "Sin dato";
  }

  const now = new Date();
  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return "Sin dato";
  }

  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  if (age < 30) {
    return "18-29";
  }

  if (age < 40) {
    return "30-39";
  }

  if (age < 50) {
    return "40-49";
  }

  return "50+";
};

const buildSessionsWhere = (startDate, endDate) => ({
  status: "completed",
  created_at: {
    [Op.between]: [startDate, endDate],
  },
});

const buildMbiWhere = (startDate, endDate) => ({
  created_at: {
    [Op.between]: [startDate, endDate],
  },
});

const getMetricsForRange = async ({ startDate, endDate, teacherRoleId }) => {
  const [tests, sessions] = await Promise.all([
    MbiTestSession.findAll({
      attributes: ["user_id"],
      where: buildMbiWhere(startDate, endDate),
      include: [
        {
          model: User,
          attributes: ["id"],
          where: {
            role_id: teacherRoleId,
          },
          required: true,
        },
      ],
      raw: true,
    }),
    SpaceSession.findAll({
      attributes: ["user_id", "duration_seconds"],
      where: buildSessionsWhere(startDate, endDate),
      include: [
        {
          model: User,
          attributes: ["id"],
          where: {
            role_id: teacherRoleId,
          },
          required: true,
        },
        {
          model: DigitalSpace,
          attributes: ["name"],
        },
      ],
      raw: false,
    }),
  ]);

  const totalTests = tests.length;
  const totalSeconds = sessions.reduce(
    (acc, session) => acc + (session.duration_seconds || 0),
    0,
  );
  const totalMinutes = parseFloat((totalSeconds / 60).toFixed(2));

  const spaceCounts = {};
  sessions.forEach((session) => {
    const spaceName = session.digital_space?.name;
    if (spaceName) {
      spaceCounts[spaceName] = (spaceCounts[spaceName] || 0) + 1;
    }
  });

  let favoriteSpace = "Aun no hay datos";
  if (Object.keys(spaceCounts).length > 0) {
    favoriteSpace = Object.keys(spaceCounts).reduce((a, b) =>
      spaceCounts[a] > spaceCounts[b] ? a : b,
    );
  }

  return {
    evaluaciones_completadas: totalTests,
    minutos_totales_terapia: totalMinutes,
    espacio_mas_utilizado: favoriteSpace,
    usuarios_evaluados_unicos: new Set(tests.map((item) => item.user_id)).size,
  };
};

const getRiskSummaryForRange = async ({
  startDate,
  endDate,
  teacherRoleId,
}) => {
  const sessions = await MbiTestSession.findAll({
    attributes: [
      "id",
      "user_id",
      "created_at",
      "emotional_exhaustion_score",
      "depersonalization_score",
      "personal_accomplishment_score",
    ],
    where: buildMbiWhere(startDate, endDate),
    include: [
      {
        model: User,
        attributes: ["id"],
        where: {
          role_id: teacherRoleId,
        },
        required: true,
      },
    ],
    order: [
      ["user_id", "ASC"],
      ["created_at", "DESC"],
    ],
    raw: true,
  });

  const latestSessionByUser = new Map();

  sessions.forEach((session) => {
    if (!latestSessionByUser.has(session.user_id)) {
      latestSessionByUser.set(session.user_id, session);
    }
  });

  const distribution = {
    severo: 0,
    alto: 0,
    moderado: 0,
    saludable: 0,
  };

  let scoreAccumulator = 0;

  const latestEvaluations = Array.from(latestSessionByUser.values()).map(
    (session) => {
      const riskTier = getRiskTierFromScores({
        ee: session.emotional_exhaustion_score,
        dp: session.depersonalization_score,
        pa: session.personal_accomplishment_score,
      });

      distribution[riskTier.key] += 1;
      scoreAccumulator += riskTier.score;

      return {
        sessionId: session.id,
        userId: session.user_id,
        createdAt: session.created_at,
        riskTier,
      };
    },
  );

  const totalEvaluations = latestEvaluations.length;
  const averageRiskScore =
    totalEvaluations > 0 ? roundToTwo(scoreAccumulator / totalEvaluations) : 0;

  return {
    totalEvaluations,
    averageRiskScore,
    distribution,
    latestEvaluations,
  };
};

const getCohortAlerts = async ({ latestEvaluations }) => {
  if (!latestEvaluations?.length) {
    return [];
  }

  const userIds = latestEvaluations.map((item) => item.userId);

  const additionalRows = await AdditionalInformation.findAll({
    attributes: ["user_id", "sex", "date_of_birth"],
    where: {
      user_id: {
        [Op.in]: userIds,
      },
    },
    raw: true,
  });

  const additionalMap = new Map(
    additionalRows.map((item) => [item.user_id, item]),
  );

  const cohortMap = new Map();

  const updateCohort = ({ key, label, riskTier }) => {
    const current = cohortMap.get(key) || {
      key,
      label,
      total_docentes: 0,
      severo: 0,
      alto: 0,
      moderado: 0,
      saludable: 0,
    };

    current.total_docentes += 1;
    current[riskTier.key] += 1;
    cohortMap.set(key, current);
  };

  latestEvaluations.forEach((evaluation) => {
    const info = additionalMap.get(evaluation.userId);
    const sexLabel = getSexLabel(info?.sex);
    const ageRange = getAgeRangeFromBirthDate(info?.date_of_birth);

    updateCohort({
      key: `sex:${sexLabel}`,
      label: `Sexo ${sexLabel}`,
      riskTier: evaluation.riskTier,
    });

    updateCohort({
      key: `age:${ageRange}`,
      label: `Edad ${ageRange}`,
      riskTier: evaluation.riskTier,
    });
  });

  return Array.from(cohortMap.values())
    .map((cohort) => {
      const highOrSevere = cohort.alto + cohort.severo;
      const highOrSeverePercent =
        cohort.total_docentes > 0
          ? roundToTwo((highOrSevere / cohort.total_docentes) * 100)
          : 0;

      return {
        ...cohort,
        alerta_alta_severa_pct: highOrSeverePercent,
        prioridad: roundToTwo(
          highOrSeverePercent +
            cohort.severo * 10 +
            (cohort.total_docentes >= 3 ? 5 : 0),
        ),
      };
    })
    .sort((a, b) => b.prioridad - a.prioridad)
    .slice(0, 3);
};

const getCriticalCasesWithoutFollowUp = async ({ latestEvaluations }) => {
  const riskyEvaluations = (latestEvaluations || []).filter(
    (evaluation) =>
      evaluation.riskTier.key === "severo" ||
      evaluation.riskTier.key === "alto",
  );

  if (!riskyEvaluations.length) {
    return [];
  }

  const userIds = riskyEvaluations.map((item) => item.userId);
  const minCreatedAt = riskyEvaluations.reduce((acc, item) => {
    if (!acc) {
      return item.createdAt;
    }
    return new Date(item.createdAt) < new Date(acc) ? item.createdAt : acc;
  }, null);

  const [users, followUpSessions] = await Promise.all([
    User.findAll({
      attributes: ["id", "given_name", "surname", "email"],
      where: {
        id: {
          [Op.in]: userIds,
        },
      },
      raw: true,
    }),
    SpaceSession.findAll({
      attributes: ["user_id", "created_at"],
      where: {
        user_id: {
          [Op.in]: userIds,
        },
        status: "completed",
        created_at: {
          [Op.gte]: minCreatedAt,
        },
      },
      raw: true,
    }),
  ]);

  const userMap = new Map(users.map((item) => [item.id, item]));

  const sessionsByUser = new Map();
  followUpSessions.forEach((session) => {
    const current = sessionsByUser.get(session.user_id) || [];
    current.push(session.created_at);
    sessionsByUser.set(session.user_id, current);
  });

  return riskyEvaluations
    .filter((evaluation) => {
      const candidateSessions = sessionsByUser.get(evaluation.userId) || [];
      return !candidateSessions.some(
        (sessionDate) =>
          new Date(sessionDate).getTime() >
          new Date(evaluation.createdAt).getTime(),
      );
    })
    .map((evaluation) => {
      const user = userMap.get(evaluation.userId);
      return {
        user_id: evaluation.userId,
        nombre:
          `${user?.given_name || ""} ${user?.surname || ""}`.trim() ||
          "Docente",
        email: user?.email || "",
        riesgo: evaluation.riskTier.label,
        evaluado_en: evaluation.createdAt,
        prioridad: evaluation.riskTier.priority,
      };
    })
    .sort((a, b) => {
      if (b.prioridad !== a.prioridad) {
        return b.prioridad - a.prioridad;
      }
      return (
        new Date(a.evaluado_en).getTime() - new Date(b.evaluado_en).getTime()
      );
    })
    .slice(0, 8);
};

const buildExecutiveRecommendations = ({
  trafficLight,
  coverage,
  adherence,
  criticalCasesCount,
}) => {
  const recommendations = [];

  if (trafficLight.key === "high") {
    recommendations.push(
      "Activar comite de seguimiento semanal para casos de riesgo alto y severo.",
    );
  }

  if (coverage < 70) {
    recommendations.push(
      "Incrementar cobertura MBI con campana focalizada en cohortes de baja participacion.",
    );
  }

  if (adherence < 55) {
    recommendations.push(
      "Fortalecer adherencia post-evaluacion con rutas de acompanamiento en las primeras 72 horas.",
    );
  }

  if (criticalCasesCount > 0) {
    recommendations.push(
      "Asignar responsables por cada caso critico sin seguimiento y establecer SLA de primera intervencion.",
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Mantener el esquema actual y monitorear semanalmente para sostener resultados.",
    );
  }

  return recommendations;
};

// Servicio para obtener las métricas globales del dashboard institucional
export const getGlobalAnalyticsService = async (requestedPeriod = "week") => {
  try {
    const period = VALID_PERIODS.includes(requestedPeriod)
      ? requestedPeriod
      : "week";

    const ranges = getPeriodRanges(period);

    // 1. Buscar dinámicamente el UUID del rol 'docente'
    const docenteRole = await Role.findOne({
      where: { name: "teacher" },
    });

    if (!docenteRole?.id) {
      throw new Error(
        "No se encontro el rol docente para construir analiticas.",
      );
    }

    const [currentMetrics, previousMetrics, currentRisk, previousRisk] =
      await Promise.all([
        getMetricsForRange({
          startDate: ranges.current.start,
          endDate: ranges.current.end,
          teacherRoleId: docenteRole.id,
        }),
        getMetricsForRange({
          startDate: ranges.previous.start,
          endDate: ranges.previous.end,
          teacherRoleId: docenteRole.id,
        }),
        getRiskSummaryForRange({
          startDate: ranges.current.start,
          endDate: ranges.current.end,
          teacherRoleId: docenteRole.id,
        }),
        getRiskSummaryForRange({
          startDate: ranges.previous.start,
          endDate: ranges.previous.end,
          teacherRoleId: docenteRole.id,
        }),
      ]);

    let docentesAcumuladosActual = 0;
    let docentesAcumuladosAnterior = 0;

    [docentesAcumuladosActual, docentesAcumuladosAnterior] = await Promise.all([
      User.count({
        where: {
          role_id: docenteRole.id,
          created_at: {
            [Op.lte]: ranges.current.end,
          },
        },
      }),
      User.count({
        where: {
          role_id: docenteRole.id,
          created_at: {
            [Op.lte]: ranges.previous.end,
          },
        },
      }),
    ]);

    const cohortAlerts = await getCohortAlerts({
      latestEvaluations: currentRisk.latestEvaluations,
    });

    const criticalCasesWithoutFollowUp = await getCriticalCasesWithoutFollowUp({
      latestEvaluations: currentRisk.latestEvaluations,
    });

    const followedTeachersCurrent =
      currentRisk.latestEvaluations.length -
      criticalCasesWithoutFollowUp.length;

    const currentCoverage =
      docentesAcumuladosActual > 0
        ? roundToTwo(
            (currentMetrics.usuarios_evaluados_unicos /
              docentesAcumuladosActual) *
              100,
          )
        : 0;

    const previousCoverage =
      docentesAcumuladosAnterior > 0
        ? roundToTwo(
            (previousMetrics.usuarios_evaluados_unicos /
              docentesAcumuladosAnterior) *
              100,
          )
        : 0;

    const currentAdherence =
      currentRisk.latestEvaluations.length > 0
        ? roundToTwo(
            (followedTeachersCurrent / currentRisk.latestEvaluations.length) *
              100,
          )
        : 0;

    const trafficLight = getInstitutionalTrafficLight(
      currentRisk.averageRiskScore,
    );
    const trendInfo = buildTrendInfo({
      currentValue: currentRisk.averageRiskScore,
      previousValue: previousRisk.averageRiskScore,
    });

    const recommendations = buildExecutiveRecommendations({
      trafficLight,
      coverage: currentCoverage,
      adherence: currentAdherence,
      criticalCasesCount: criticalCasesWithoutFollowUp.length,
    });

    const comparativo = {
      docentes_activos: calculateDelta(
        docentesAcumuladosActual,
        docentesAcumuladosAnterior,
      ),
      evaluaciones_completadas: calculateDelta(
        currentMetrics.evaluaciones_completadas,
        previousMetrics.evaluaciones_completadas,
      ),
      minutos_totales_terapia: calculateDelta(
        currentMetrics.minutos_totales_terapia,
        previousMetrics.minutos_totales_terapia,
      ),
    };

    return {
      impacto_institucional: {
        docentes_activos: docentesAcumuladosActual,
        ...currentMetrics,
      },
      comparativo_periodo_anterior: comparativo,
      periodo: {
        seleccionado: period,
        actual: {
          desde: ranges.current.start,
          hasta: ranges.current.end,
        },
        anterior: {
          desde: ranges.previous.start,
          hasta: ranges.previous.end,
        },
      },
      mvp_ejecutivo: {
        semaforo_institucional: {
          ...trafficLight,
          promedio_riesgo: currentRisk.averageRiskScore,
          distribucion: currentRisk.distribution,
          tendencia: trendInfo,
        },
        riesgo_por_cohortes: {
          top_alertas: cohortAlerts,
          docentes_evaluados: currentRisk.totalEvaluations,
        },
        cobertura_adherencia: {
          docentes_totales: docentesAcumuladosActual,
          docentes_evaluados: currentMetrics.usuarios_evaluados_unicos,
          cobertura_pct: currentCoverage,
          cobertura_delta: calculateDelta(currentCoverage, previousCoverage),
          docentes_con_seguimiento: followedTeachersCurrent,
          adherencia_pct: currentAdherence,
          sin_seguimiento: criticalCasesWithoutFollowUp.length,
        },
        casos_criticos_sin_seguimiento: criticalCasesWithoutFollowUp,
        resumen_ejecutivo_mensual: {
          generado_en: new Date(),
          periodo_evaluado: period,
          kpis: {
            riesgo_promedio: currentRisk.averageRiskScore,
            cobertura_pct: currentCoverage,
            adherencia_pct: currentAdherence,
            casos_criticos: criticalCasesWithoutFollowUp.length,
          },
          recomendaciones: recommendations,
        },
      },
    };
  } catch (error) {
    throw new Error("Error al generar analíticas globales: " + error.message);
  }
};
