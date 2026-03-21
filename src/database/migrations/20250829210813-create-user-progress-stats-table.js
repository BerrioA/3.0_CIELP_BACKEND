import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("user_progress_stats", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    total_meditation_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    favorite_space_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "digital_spaces",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
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
  await context.dropTable("user_progress_stats");
}
