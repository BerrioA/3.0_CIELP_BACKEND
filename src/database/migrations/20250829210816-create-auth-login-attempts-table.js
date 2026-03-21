import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("auth_login_attempts", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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

  await context.addIndex("auth_login_attempts", ["email"], {
    unique: true,
    name: "idx_auth_login_attempts_email",
  });

  await context.addIndex("auth_login_attempts", ["blocked_until"], {
    name: "idx_auth_login_attempts_blocked_until",
  });
}

export async function down({ context }) {
  await context.dropTable("auth_login_attempts");
}
