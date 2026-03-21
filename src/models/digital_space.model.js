import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const DigitalSpace = sequelize.define(
  "digital_space",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "sonido_ambiental",
        "meditacion_guiada",
        "ejercicio_respiracion",
      ),
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    paranoid: true, // Habilita deleted_at (borrado lógico)
    underscored: true,
    tableName: "digital_spaces",
  },
);
