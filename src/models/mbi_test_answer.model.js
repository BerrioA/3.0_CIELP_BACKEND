import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { MbiTestSession } from "./mbi_test_session.model.js";
import { MbiQuestion } from "./mbi_question.model.js";

export const MbiTestAnswer = sequelize.define(
  "mbi_test_answer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: MbiTestSession,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: MbiQuestion,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: false,
    underscored: true,
    tableName: "mbi_test_answers",
  },
);
