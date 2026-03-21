import { sequelize } from "../config/db.js";
import {
  BurnoutAlert,
  AdditionalInformation,
  MbiQuestion,
  MbiTestSession,
  MbiTestAnswer,
  Role,
  User,
} from "../models/relations.model.js";
import { sendCriticalBurnoutAlertEmail } from "./email.service.js";
import {
  getMbiRetestStatusService,
  getMyMbiProgressComparisonService,
  markLastTestDate,
  syncUserProgressStats,
  validateMbiRetestAvailability,
} from "./progress-analytics.service.js";

const MBI_ES_EXPECTED_TOTAL_QUESTIONS = 22;

const MBI_ES_REFERENCE_RANGES = {
  cansancio_emocional: {
    low: [0, 18],
    medium: [19, 26],
    high: [27, 54],
  },
  despersonalizacion: {
    low: [0, 5],
    medium: [6, 9],
    high: [10, 30],
  },
  realizacion_personal: {
    low: [0, 33],
    medium: [34, 39],
    high: [40, 48],
  },
};

const MBI_ES_ALERT_THRESHOLDS = {
  ee: 27,
  dp: 10,
  paLow: 34,
};

const MBI_ES_QUESTION_NUMBERS = {
  cansancio_emocional: [1, 2, 3, 6, 8, 13, 14, 16, 20],
  despersonalizacion: [5, 10, 11, 15, 22],
  realizacion_personal: [4, 7, 9, 12, 17, 18, 19, 21],
};

const MBI_SCORE_MIN = 0;
const MBI_SCORE_MAX = 6;

const toSortedNumberArray = (values = []) =>
  values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

const arraysAreEqual = (left = [], right = []) => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

const validateMbiQuestionCatalog = (questions = []) => {
  if (!Array.isArray(questions) || questions.length !== 22) {
    throw new Error(
      "El catálogo MBI no es válido: se esperan exactamente 22 ítems.",
    );
  }

  const bySubscale = {
    cansancio_emocional: [],
    despersonalizacion: [],
    realizacion_personal: [],
  };

  questions.forEach((question) => {
    const subscale = String(question?.subscale || "");
    const number = Number(question?.question_number);

    if (!(subscale in bySubscale) || !Number.isFinite(number)) {
      return;
    }

    bySubscale[subscale].push(number);
  });

  const isCatalogValid =
    arraysAreEqual(
      toSortedNumberArray(bySubscale.cansancio_emocional),
      toSortedNumberArray(MBI_ES_QUESTION_NUMBERS.cansancio_emocional),
    ) &&
    arraysAreEqual(
      toSortedNumberArray(bySubscale.despersonalizacion),
      toSortedNumberArray(MBI_ES_QUESTION_NUMBERS.despersonalizacion),
    ) &&
    arraysAreEqual(
      toSortedNumberArray(bySubscale.realizacion_personal),
      toSortedNumberArray(MBI_ES_QUESTION_NUMBERS.realizacion_personal),
    );

  if (!isCatalogValid) {
    throw new Error(
      "El catálogo MBI no coincide con la estructura oficial MBI-ES (9 CE, 5 DP, 8 RP).",
    );
  }
};

const validateMbiAnswersPayload = (answers = [], questionMap = {}) => {
  if (
    !Array.isArray(answers) ||
    answers.length !== MBI_ES_EXPECTED_TOTAL_QUESTIONS
  ) {
    throw new Error(
      "El test requiere exactamente las 22 respuestas para ser válido.",
    );
  }

  const seenQuestionIds = new Set();

  answers.forEach((answer) => {
    const questionId = answer?.question_id;
    const score = Number(answer?.score);

    if (!questionMap[questionId]) {
      throw new Error(
        `La pregunta con ID ${questionId} no existe en el sistema.`,
      );
    }

    if (seenQuestionIds.has(questionId)) {
      throw new Error(
        "Se detectaron respuestas duplicadas para una misma pregunta del MBI.",
      );
    }

    if (
      !Number.isInteger(score) ||
      score < MBI_SCORE_MIN ||
      score > MBI_SCORE_MAX
    ) {
      throw new Error(
        "Cada respuesta MBI debe tener un valor entero entre 0 y 6.",
      );
    }

    seenQuestionIds.add(questionId);
  });
};

const getDimensionLevel = (score, referenceRange) => {
  if (score >= referenceRange.high[0]) {
    return "alto";
  }

  if (score >= referenceRange.medium[0]) {
    return "medio";
  }

  return "bajo";
};

const buildMbiInterpretation = (ee_score, dp_score, pa_score) => {
  const eeLevel = getDimensionLevel(
    ee_score,
    MBI_ES_REFERENCE_RANGES.cansancio_emocional,
  );
  const dpLevel = getDimensionLevel(
    dp_score,
    MBI_ES_REFERENCE_RANGES.despersonalizacion,
  );
  const paLevel = getDimensionLevel(
    pa_score,
    MBI_ES_REFERENCE_RANGES.realizacion_personal,
  );

  const isEEAlert = ee_score >= MBI_ES_ALERT_THRESHOLDS.ee;
  const isDPAlert = dp_score >= MBI_ES_ALERT_THRESHOLDS.dp;
  const isPAAlert = pa_score < MBI_ES_ALERT_THRESHOLDS.paLow;

  const affectedAreas =
    Number(isEEAlert) + Number(isDPAlert) + Number(isPAAlert);

  let riskLevel = "saludable";
  let diagnosis = "Saludable. Sin indicios de Burnout clínicamente relevantes.";

  if (affectedAreas === 1) {
    riskLevel = "moderado";
    diagnosis =
      "Riesgo moderado / indicios iniciales de Burnout (afectación en 1 dimensión).";
  } else if (affectedAreas === 2) {
    riskLevel = "alto";
    diagnosis =
      "Riesgo alto de Burnout (afectación en 2 dimensiones). Requiere seguimiento clínico cercano.";
  } else if (affectedAreas === 3) {
    riskLevel = "severo";
    diagnosis =
      "Síndrome de Burnout severo (afectación crítica en las 3 dimensiones). Requiere intervención prioritaria.";
  }

  return {
    risk_level: riskLevel,
    affected_areas: affectedAreas,
    diagnostico: diagnosis,
    dimensions: {
      cansancio_emocional: {
        score: ee_score,
        level: eeLevel,
        burnout_indicio: isEEAlert,
      },
      despersonalizacion: {
        score: dp_score,
        level: dpLevel,
        burnout_indicio: isDPAlert,
      },
      realizacion_personal: {
        score: pa_score,
        level: paLevel,
        burnout_indicio: isPAAlert,
        note: "En realización personal, puntajes bajos incrementan el riesgo de Burnout.",
      },
    },
  };
};

const normalizeRiskLevel = (score, thresholds) => {
  if (score >= thresholds.veryHigh) {
    return 3;
  }

  if (score >= thresholds.high) {
    return 2;
  }

  if (score >= thresholds.medium) {
    return 1;
  }

  return 0;
};

const normalizeLowPersonalAccomplishmentRisk = (pa_score) => {
  if (pa_score < 28) {
    return 3;
  }

  if (pa_score < 34) {
    return 2;
  }

  if (pa_score < 40) {
    return 1;
  }

  return 0;
};

const isCriticalBurnoutRisk = (ee_score, dp_score, pa_score) => {
  const hasVeryHighDimension =
    ee_score >= 36 || dp_score >= 15 || pa_score < 28;
  const hasTwoHighDimensions =
    Number(ee_score >= MBI_ES_ALERT_THRESHOLDS.ee) +
      Number(dp_score >= MBI_ES_ALERT_THRESHOLDS.dp) +
      Number(pa_score < MBI_ES_ALERT_THRESHOLDS.paLow) >=
    2;

  return hasVeryHighDimension || hasTwoHighDimensions;
};

export const getRankedRecommendedSpaces = (ee_score, dp_score, pa_score) => {
  const eeRisk = normalizeRiskLevel(ee_score, {
    medium: 19,
    high: 27,
    veryHigh: 36,
  });

  const dpRisk = normalizeRiskLevel(dp_score, {
    medium: 6,
    high: 10,
    veryHigh: 15,
  });

  const paRisk = normalizeLowPersonalAccomplishmentRisk(pa_score);

  const affectedAreas = [eeRisk, dpRisk, paRisk].filter(
    (risk) => risk >= 2,
  ).length;

  const candidates = [
    {
      spaceName: "Refugio del Bosque",
      symptom: "Sobrecarga emocional y fatiga",
      score:
        eeRisk * 1.35 +
        dpRisk * 0.35 +
        paRisk * 0.2 +
        (affectedAreas >= 2 ? 0.35 : 0),
      reason:
        "Prioriza la descarga del cansancio emocional con un entorno sonoro estable y baja demanda cognitiva.",
    },
    {
      spaceName: "Meditación Guiada: Soltar la Carga",
      symptom: "Despersonalización y desconexión con la labor docente",
      score: dpRisk * 1.3 + eeRisk * 0.45 + paRisk * 0.25,
      reason:
        "Favorece reconexión emocional y regulación de pensamientos automáticos asociados al desgaste relacional.",
    },
    {
      spaceName: "Respiración Consciente (4-4-4)",
      symptom: "Baja realización personal y pérdida de control",
      score: paRisk * 1.3 + eeRisk * 0.45 + dpRisk * 0.25,
      reason:
        "Aporta regulación fisiológica rápida para recuperar sensación de control y autoeficacia.",
    },
    {
      spaceName: "Olas del Mar al Atardecer",
      symptom: "Mantenimiento preventivo del bienestar",
      score:
        (3 - eeRisk) * 0.8 +
        (3 - dpRisk) * 0.8 +
        (3 - paRisk) * 0.8 +
        (affectedAreas === 0 ? 0.7 : 0),
      reason:
        "Consolida estado de equilibrio emocional y reduce activación basal como estrategia preventiva.",
    },
  ];

  return candidates.sort((a, b) => b.score - a.score);
};

// Motor de recomendación: selecciona un solo espacio óptimo según las 3 dimensiones MBI.
export const getBestRecommendedSpace = (ee_score, dp_score, pa_score) => {
  const rankedCandidates = getRankedRecommendedSpaces(
    ee_score,
    dp_score,
    pa_score,
  );
  const bestCandidate = rankedCandidates[0];

  return bestCandidate;
};

const generateRecommendations = (ee_score, dp_score, pa_score) => {
  const bestCandidate = getBestRecommendedSpace(ee_score, dp_score, pa_score);

  return [
    {
      sintoma_detectado: bestCandidate.symptom,
      espacio_sugerido: bestCandidate.spaceName,
      motivo: bestCandidate.reason,
    },
  ];
};

const createAndDispatchCriticalAlerts = async ({
  teacherUser,
  sessionId,
  diagnosis,
  recommendedSpace,
}) => {
  const psychologistRole = await Role.findOne({
    where: { name: "psychologist" },
    attributes: ["id"],
  });

  if (!psychologistRole) {
    return {
      created: 0,
      emailSent: 0,
      reason: "No existe el rol psychologist en la base de datos.",
    };
  }

  let recipients = await User.findAll({
    where: {
      role_id: psychologistRole.id,
      status: "verified",
    },
    attributes: ["id", "given_name", "surname", "email"],
  });

  // Fallback defensivo: si por alguna razon no hay psicologos verificados,
  // intentamos con todos los psicologos activos por rol para no perder la alerta.
  if (!recipients.length) {
    recipients = await User.findAll({
      where: {
        role_id: psychologistRole.id,
      },
      attributes: ["id", "given_name", "surname", "email", "status"],
    });
  }

  if (!recipients.length) {
    return {
      created: 0,
      emailSent: 0,
      reason:
        "No se encontraron usuarios con rol psychologist para recibir la alerta.",
    };
  }

  const teacherFullName =
    `${teacherUser?.given_name || ""} ${teacherUser?.surname || ""}`.trim() ||
    "Docente";

  const alertMessage =
    `Se detecto un resultado de burnout con riesgo critico para ${teacherFullName}. ` +
    `Priorizar seguimiento clinico y acompanamiento temprano.`;

  await BurnoutAlert.bulkCreate(
    recipients.map((recipient) => ({
      recipient_user_id: recipient.id,
      teacher_user_id: teacherUser.id,
      mbi_session_id: sessionId,
      risk_level: "critical",
      recommended_space_name: recommendedSpace,
      message: alertMessage,
    })),
  );

  const emailResults = await Promise.allSettled(
    recipients
      .filter((recipient) => recipient.email)
      .map((recipient) =>
        sendCriticalBurnoutAlertEmail({
          psychologistEmail: recipient.email,
          psychologistName:
            `${recipient.given_name || ""} ${recipient.surname || ""}`.trim() ||
            "profesional",
          teacherName: teacherFullName,
          diagnosis,
          recommendedSpace,
        }),
      ),
  );

  return {
    created: recipients.length,
    emailSent: emailResults.filter((result) => result.status === "fulfilled")
      .length,
    reason: null,
  };
};

const queueCriticalAlertsDispatch = ({
  userId,
  sessionId,
  diagnosis,
  recommendedSpace,
}) => {
  setImmediate(async () => {
    try {
      const teacherUser = await User.findByPk(userId, {
        attributes: ["id", "given_name", "surname"],
      });

      if (!teacherUser) {
        console.warn(
          "No se encontro el docente origen para alerta critica de burnout.",
        );
        return;
      }

      const dispatchResult = await createAndDispatchCriticalAlerts({
        teacherUser,
        sessionId,
        diagnosis,
        recommendedSpace,
      });

      if (dispatchResult.created === 0) {
        console.warn(
          "No se crearon alertas clinicas de burnout:",
          dispatchResult.reason,
        );
      }
    } catch (backgroundError) {
      console.error(
        "Error en ejecucion en segundo plano de alertas criticas de burnout:",
        backgroundError.message,
      );
    }
  });
};

// Servicio para obtener las preguntas del test MBI
export const getMbiQuestionsService = async () => {
  try {
    const questions = await MbiQuestion.findAll({
      // Solo enviamos lo que el frontend necesita, ocultamos timestamps
      attributes: ["id", "question_number", "statement", "subscale"],
      // Ordenamos estrictamente por el número de pregunta (1 al 22)
      order: [["question_number", "ASC"]],
    });

    if (!questions || questions.length === 0) {
      throw new Error(
        "No se encontraron preguntas en la base de datos. Verifica los seeders.",
      );
    }

    validateMbiQuestionCatalog(questions);

    return questions;
  } catch (error) {
    console.error(
      "Error en el servicio getMbiQuestionsService:",
      error.message,
    );
    throw error;
  }
};

// Servicio para procesar las respuestas del test MBI
export const processMbiTest = async (userId, answers) => {
  await validateMbiRetestAvailability(userId);

  // Iniciamos una transacción para asegurar la integridad de los datos
  const transaction = await sequelize.transaction();

  try {
    // 1. Obtener todas las preguntas para mapear sus IDs con sus subescalas
    const questions = await MbiQuestion.findAll({ raw: true });

    // Creamos un diccionario para búsqueda rápida { 'uuid': 'cansancio_emocional' }
    const questionMap = questions.reduce((acc, q) => {
      acc[q.id] = q.subscale;
      return acc;
    }, {});

    validateMbiAnswersPayload(answers, questionMap);

    // 2. Inicializar los contadores
    let ee_score = 0; // Cansancio Emocional
    let dp_score = 0; // Despersonalización
    let pa_score = 0; // Realización Personal

    // 3. Sumar las respuestas
    answers.forEach((ans) => {
      const subscale = questionMap[ans.question_id];
      if (!subscale) {
        throw new Error(
          `La pregunta con ID ${ans.question_id} no existe en el sistema.`,
        );
      }

      if (subscale === "cansancio_emocional") ee_score += ans.score;
      if (subscale === "despersonalizacion") dp_score += ans.score;
      if (subscale === "realizacion_personal") pa_score += ans.score;
    });

    // 4. Crear el registro principal de la sesión
    const session = await MbiTestSession.create(
      {
        user_id: userId,
        emotional_exhaustion_score: ee_score,
        depersonalization_score: dp_score,
        personal_accomplishment_score: pa_score,
      },
      { transaction },
    );

    // 5. Preparar el array de respuestas detalladas
    const answersToInsert = answers.map((ans) => ({
      session_id: session.id,
      question_id: ans.question_id,
      score: ans.score,
    }));

    // Insertar las 22 respuestas de golpe [cite: 2]
    await MbiTestAnswer.bulkCreate(answersToInsert, { transaction });

    // Confirmamos que todo se guardó correctamente
    await transaction.commit();

    // Actualizamos fecha de última prueba para lógica de frecuencia (4-6 semanas).
    await markLastTestDate(userId, new Date());

    // Refrescamos el resumen agregado del usuario para analítica macro.
    await syncUserProgressStats(userId);

    // 6. Evaluar el diagnóstico e interpretación estructurada en base a criterios MBI-ES.
    const interpretation = buildMbiInterpretation(ee_score, dp_score, pa_score);
    const diagnosticoFinal = interpretation.diagnostico;
    // NUEVO: Generamos las recomendaciones personalizadas
    const recomendacionesPersonalizadas = generateRecommendations(
      ee_score,
      dp_score,
      pa_score,
    );

    const result = {
      session_id: session.id,
      scores: {
        cansancio_emocional: ee_score,
        despersonalizacion: dp_score,
        realizacion_personal: pa_score,
      },
      diagnostico: diagnosticoFinal,
      interpretacion: interpretation,
      recomendaciones: recomendacionesPersonalizadas, // <-- Lo exponemos al frontend
    };

    if (isCriticalBurnoutRisk(ee_score, dp_score, pa_score)) {
      result.alerta_critica = {
        activated: true,
        platform_notifications: null,
        email_notifications: null,
        status: "queued",
        reason: "La alerta se esta procesando en segundo plano.",
      };

      queueCriticalAlertsDispatch({
        userId,
        sessionId: session.id,
        diagnosis: diagnosticoFinal,
        recommendedSpace:
          recomendacionesPersonalizadas[0]?.espacio_sugerido ||
          "Espacio no definido",
      });
    }

    return result;
  } catch (error) {
    // Si algo falla, revertimos todos los cambios en la base de datos
    await transaction.rollback();
    console.error("Error en el servicio processMbiTest:", error.message);
    throw error;
  }
};

export const getMyMbiRetestStatusService = async (userId) => {
  return getMbiRetestStatusService(userId);
};

export const getMyMbiComparisonService = async (userId) => {
  const comparison = await getMyMbiProgressComparisonService(userId);

  const additionalInformation = await AdditionalInformation.findOne({
    where: { user_id: userId },
    attributes: ["last_test_date"],
  });

  return {
    ...comparison,
    last_test_date: additionalInformation?.last_test_date || null,
  };
};

// Servicio para obtener el historial de tests de un usuario
export const getUserTestHistoryService = async (userId) => {
  try {
    const history = await MbiTestSession.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]], // El test más reciente primero
      include: [
        {
          model: MbiTestAnswer,
          attributes: ["score", "question_id"],
          include: [
            {
              model: MbiQuestion,
              attributes: ["question_number", "subscale"],
            },
          ],
        },
      ],
    });

    // Formatear la respuesta para que sea fácil de consumir en React
    const formattedHistory = history.map((session) => {
      const interpretation = buildMbiInterpretation(
        session.emotional_exhaustion_score,
        session.depersonalization_score,
        session.personal_accomplishment_score,
      );

      // NUEVO: Generamos las recomendaciones históricas
      const recomendacionesPersonalizadas = generateRecommendations(
        session.emotional_exhaustion_score,
        session.depersonalization_score,
        session.personal_accomplishment_score,
      );

      return {
        session_id: session.id,
        date: session.created_at,
        scores: {
          cansancio_emocional: session.emotional_exhaustion_score,
          despersonalizacion: session.depersonalization_score,
          realizacion_personal: session.personal_accomplishment_score,
        },
        diagnostico: interpretation.diagnostico,
        interpretacion: interpretation,
        recomendaciones: recomendacionesPersonalizadas, // <-- Lo exponemos al frontend
      };
    });

    return formattedHistory;
  } catch (error) {
    console.error("Error al obtener el historial de tests:", error.message);
    throw error;
  }
};

export const getMyBurnoutAlertsService = async (recipientUserId) => {
  try {
    const alerts = await BurnoutAlert.findAll({
      where: { recipient_user_id: recipientUserId },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "given_name", "surname", "email"],
        },
        {
          model: MbiTestSession,
          as: "mbi_session",
          attributes: [
            "id",
            "created_at",
            "emotional_exhaustion_score",
            "depersonalization_score",
            "personal_accomplishment_score",
          ],
        },
      ],
      limit: 30,
    });

    return alerts.map((alert) => ({
      id: alert.id,
      risk_level: alert.risk_level,
      is_read: alert.is_read,
      read_at: alert.read_at,
      message: alert.message,
      recommended_space_name: alert.recommended_space_name,
      created_at: alert.created_at,
      teacher: {
        id: alert.teacher?.id || null,
        given_name: alert.teacher?.given_name || "",
        surname: alert.teacher?.surname || "",
        email: alert.teacher?.email || "",
      },
      mbi_session: {
        id: alert.mbi_session?.id || null,
        created_at: alert.mbi_session?.created_at || null,
        scores: {
          cansancio_emocional:
            alert.mbi_session?.emotional_exhaustion_score || 0,
          despersonalizacion: alert.mbi_session?.depersonalization_score || 0,
          realizacion_personal:
            alert.mbi_session?.personal_accomplishment_score || 0,
        },
      },
    }));
  } catch (error) {
    throw new Error("Error al obtener alertas de burnout: " + error.message);
  }
};

export const markBurnoutAlertAsReadService = async (
  recipientUserId,
  alertId,
) => {
  try {
    const alert = await BurnoutAlert.findOne({
      where: {
        id: alertId,
        recipient_user_id: recipientUserId,
      },
    });

    if (!alert) {
      throw new Error("La alerta indicada no existe para este usuario.");
    }

    if (!alert.is_read) {
      alert.is_read = true;
      alert.read_at = new Date();
      await alert.save();
    }

    return {
      id: alert.id,
      is_read: alert.is_read,
      read_at: alert.read_at,
    };
  } catch (error) {
    throw new Error("Error al marcar la alerta como leida: " + error.message);
  }
};
