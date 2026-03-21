import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import {
  SUPERADMIN_NAME,
  SUPERADMIN_LASTNAME,
  SUPERADMIN_EMAIL,
  SUPERADMIN_PASSWORD,
} from "../../config/env.js";

export async function up({ context }) {
  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

  // 1. Buscar el rol superAdmin
  const roles = await context.sequelize.query(
    `SELECT id FROM roles WHERE name = 'superAdmin' LIMIT 1;`,
    {
      type: context.sequelize.QueryTypes.SELECT,
    },
  );

  if (!roles || roles.length === 0) {
    throw new Error(
      "El rol 'superAdmin' no existe. Ejecuta primero el seeder de roles.",
    );
  }

  const roleId = roles[0].id;

  // 2. Crear usuario SuperAdmin
  await context.bulkInsert("users", [
    {
      id: uuidv4(),
      given_name: SUPERADMIN_NAME,
      surname: SUPERADMIN_LASTNAME,
      email: SUPERADMIN_EMAIL,
      password: passwordHash,
      role_id: roleId,
      status: "verified",
      data_privacy_consent: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

export async function down({ context }) {
  await context.bulkDelete("users", {
    email: SUPERADMIN_EMAIL,
  });
}
