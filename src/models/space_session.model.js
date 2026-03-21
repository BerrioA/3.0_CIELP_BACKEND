import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./user.model.js";
import { DigitalSpace } from "./digital_space.model.js";

export const SpaceSession = sequelize.define(
  "space_session",
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
      references: {
        model: User,
        key: "id",
      },
    },
    space_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: DigitalSpace,
        key: "id",
      },
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "abandoned"),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
    paranoid: false,
    underscored: true,
    tableName: "space_sessions",
  },
);
