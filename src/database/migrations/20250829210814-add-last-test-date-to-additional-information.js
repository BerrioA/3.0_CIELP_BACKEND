import { DataTypes } from "sequelize";

export async function up({ context }) {
  await context.addColumn("additional_information", "last_test_date", {
    type: DataTypes.DATEONLY,
    allowNull: true,
  });
}

export async function down({ context }) {
  await context.removeColumn("additional_information", "last_test_date");
}
