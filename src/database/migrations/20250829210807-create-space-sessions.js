import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("space_sessions", {
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
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true, // Es nulo hasta que el usuario presiona "Detener"
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "Se calcula automáticamente cuando la sesión termina",
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "abandoned"),
      allowNull: false,
      defaultValue: "active",
      comment:
        "abandoned es por si el usuario cierra el navegador sin detener la sesión",
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
  await context.dropTable("space_sessions");
  await context.sequelize.query(
    'DROP TYPE IF EXISTS "enum_space_sessions_status";',
  );
}
