import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const AuthLoginAttempt = sequelize.define(
  "auth_login_attempts",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    failed_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    first_failed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_failed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    blocked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: false,
    underscored: true,
    tableName: "auth_login_attempts",
  },
);
