import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("session_logs", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    space_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "digital_spaces",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "space_sessions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      unique: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mood_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
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

  await context.addIndex("session_logs", ["user_id", "created_at"], {
    name: "idx_session_logs_user_created_at",
  });
}

export async function down({ context }) {
  await context.removeIndex("session_logs", "idx_session_logs_user_created_at");
  await context.dropTable("session_logs");
}
