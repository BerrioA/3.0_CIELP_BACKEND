import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("mbi_questions", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    question_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: "Numero de la pregunta del 1 al 22",
    },
    statement: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "El enunciado exacto de la pregunta del test MBI",
    },
    subscale: {
      type: DataTypes.ENUM(
        "cansancio_emocional",
        "despersonalizacion",
        "realizacion_personal",
      ),
      allowNull: false,
      comment: "La dimension que evalua esta pregunta",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
}

export async function down({ context }) {
  await context.dropTable("mbi_questions");
  await context.sequelize.query(
    'DROP TYPE IF EXISTS "enum_mbi_questions_subscale";',
  );
}
