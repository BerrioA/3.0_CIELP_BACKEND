import { v4 as uuidv4 } from "uuid";

const QUESTIONS = [
  {
    question_number: 1,
    statement: "Me siento emocionalmente agotado/a por mi trabajo.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 2,
    statement: "Me siento cansado al final de la jornada de trabajo.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 3,
    statement:
      "Cuando me levanto por la mañana y me enfrento a otra jornada de trabajo me siento fatigado.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 6,
    statement:
      "Siento que trabajar todo el día con alumnos/as supone un gran esfuerzo y me cansa.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 8,
    statement:
      "Siento que mi trabajo me está desgastando. Me siento quemado por mi trabajo.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 13,
    statement: "Me siento frustrado/a en mi trabajo.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 14,
    statement: "Creo que trabajo demasiado.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 16,
    statement: "Trabajar directamente con alumnos/as me produce estrés.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 20,
    statement:
      "Me siento acabado en mi trabajo, al límite de mis posibilidades.",
    subscale: "cansancio_emocional",
  },
  {
    question_number: 5,
    statement:
      "Creo que estoy tratando a algunos alumnos/as como si fueran objetos impersonales.",
    subscale: "despersonalizacion",
  },
  {
    question_number: 10,
    statement:
      "Me he vuelto más insensible con la gente desde que ejerzo la profesión docente.",
    subscale: "despersonalizacion",
  },
  {
    question_number: 11,
    statement: "Pienso que este trabajo me está endureciendo emocionalmente.",
    subscale: "despersonalizacion",
  },
  {
    question_number: 15,
    statement:
      "No me preocupa realmente lo que les ocurra a algunos de mis alumnos/as.",
    subscale: "despersonalizacion",
  },
  {
    question_number: 22,
    statement: "Creo que los alumnos/as me culpan de algunos de sus problemas.",
    subscale: "despersonalizacion",
  },
  {
    question_number: 4,
    statement:
      "Tengo facilidad para comprender como se sienten mis alumnos/as.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 7,
    statement:
      "Creo que trato con mucha eficacia los problemas de mis alumnos/as.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 9,
    statement:
      "Creo que con mi trabajo estoy influyendo positivamente en la vida de mis alumnos/as.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 12,
    statement: "Me siento con mucha energía en mi trabajo.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 17,
    statement:
      "Siento que puedo crear con facilidad un clima agradable con mis alumnos/as.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 18,
    statement:
      "Me siento motivado después de trabajar en contacto con alumnos/as.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 19,
    statement: "Creo que consigo muchas cosas valiosas en este trabajo.",
    subscale: "realizacion_personal",
  },
  {
    question_number: 21,
    statement:
      "En mi trabajo trato los problemas emocionalmente con mucha calma.",
    subscale: "realizacion_personal",
  },
];

export async function up({ context }) {
  const existing = await context.sequelize.query(
    "SELECT question_number FROM mbi_questions;",
    { type: context.sequelize.QueryTypes.SELECT },
  );
  const existingNumbers = new Set(
    (existing || []).map((row) => Number(row.question_number)),
  );

  const rows = QUESTIONS.filter(
    (question) => !existingNumbers.has(question.question_number),
  ).map((question) => ({
    id: uuidv4(),
    ...question,
    created_at: new Date(),
    updated_at: new Date(),
  }));

  if (rows.length > 0) {
    await context.bulkInsert("mbi_questions", rows);
  }
}

export async function down({ context }) {
  await context.bulkDelete("mbi_questions", {
    question_number: QUESTIONS.map((question) => question.question_number),
  });
}
