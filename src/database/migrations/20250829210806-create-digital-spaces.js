import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.createTable("digital_spaces", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Ej: Refugio del Mar, Bosque Profundo, Meditación Guiada",
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
      comment: "URL de la imagen de portada para mostrar en React",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
}

export async function down({ context }) {
  await context.dropTable("digital_spaces");
  await context.sequelize.query(
    'DROP TYPE IF EXISTS "enum_digital_spaces_type";',
  );
}
