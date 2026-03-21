import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const MbiQuestion = sequelize.define(
  "mbi_question",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    question_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    statement: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subscale: {
      type: DataTypes.ENUM(
        "cansancio_emocional",
        "despersonalizacion",
        "realizacion_personal",
      ),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Esto habilita el uso de deleted_at
    underscored: true,
    tableName: "mbi_questions",
  },
);
