import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("refresh_token_sessions", {
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
    token_hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    user_agent: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    replaced_by_token_id: {
      type: DataTypes.UUID,
      allowNull: true,
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

  await context.addIndex("refresh_token_sessions", ["user_id"], {
    name: "idx_refresh_token_sessions_user_id",
  });

  await context.addIndex("refresh_token_sessions", ["expires_at"], {
    name: "idx_refresh_token_sessions_expires_at",
  });

  await context.addIndex("refresh_token_sessions", ["revoked_at"], {
    name: "idx_refresh_token_sessions_revoked_at",
  });
}

export async function down({ context }) {
  await context.dropTable("refresh_token_sessions");
}
