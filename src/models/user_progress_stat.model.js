import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const UserProgressStat = sequelize.define(
  "user_progress_stat",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    total_meditation_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    favorite_space_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    average_mood_improvement: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    burnout_status_trend: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    paranoid: false,
    underscored: true,
    tableName: "user_progress_stats",
  },
);
