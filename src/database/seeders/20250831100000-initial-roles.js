import { v4 as uuidv4 } from "uuid";

export async function up({ context }) {
  await context.bulkInsert(
    "roles",
    [
      {
        id: uuidv4(),
        name: "teacher",
        description:
          "Persona que recibe servicios de salud mental; puede gestionar su perfil, test de bournot, seguimiento de estado y gestión de espacios dentro del sistema.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "psychologist",
        description:
          "Profesional de salud mental responsable de evaluar, tratar y dar seguimiento a pacientes; gestiona intervenciones y registros clínicos.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "superAdmin",
        description:
          "Rol con máximos privilegios de administración del sistema. Concede acceso total a la gestión de planes, suscripciones, usuarios de la plataforma y configuraciones globales de Oris.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "admin",
        description:
          "Rol para socios estratégicos y colaboradores clave. Concede un nivel avanzado de acceso a la plataforma para tareas administrativas, como la gestión de ventas, finanzas y reportes a nivel de plataforma.",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "developer",
        description:
          "Rol para el equipo de desarrollo de la plataforma. Concede acceso completo a las funcionalidades internas del sistema para depuración, mantenimiento y despliegue de nuevas características.",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {},
  );
}

export async function down({ context }) {
  await context.bulkDelete(
    "roles",
    {
      name: [
        "teacher",
        "psychologist",
        "superAdmin",
        "admin",
        "developer",
      ],
    },
    {},
  );
}
