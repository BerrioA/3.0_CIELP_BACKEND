import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("mbi_test_answers", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "mbi_test_sessions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "mbi_questions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Valor del 0 (Nunca) al 6 (Todos los días)",
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
  });
}

export async function down({ context }) {
  await context.dropTable("mbi_test_answers");
}
