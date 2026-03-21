import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const BurnoutAlert = sequelize.define(
  "burnout_alert",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    recipient_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    teacher_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    mbi_session_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    risk_level: {
      type: DataTypes.ENUM("high", "critical"),
      allowNull: false,
      defaultValue: "high",
    },
    recommended_space_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    underscored: true,
    tableName: "burnout_alerts",
  },
);
