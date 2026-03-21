import { v4 as uuidv4 } from "uuid";

export async function up({ context }) {
  await context.bulkInsert(
    "digital_spaces",
    [
      {
        id: uuidv4(),
        name: "Refugio del Bosque",
        description:
          "Sumérgete en la tranquilidad de un bosque milenario. El sonido del viento en las hojas y el canto lejano de las aves te ayudarán a desconectar después de una larga jornada de clases, reduciendo la fatiga visual y el cansancio emocional.",
        type: "sonido_ambiental",
        thumbnail_url:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        video_url: "https://www.youtube.com/watch?v=7Ilu033ydSw",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Olas del Mar al Atardecer",
        description:
          "El sonido rítmico y constante de las olas rompiendo suavemente en la arena. Esta frecuencia acústica está comprobada para ayudar a estabilizar el ritmo cardíaco, promoviendo un estado de calma profunda y aliviando el estrés.",
        type: "sonido_ambiental",
        thumbnail_url:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        video_url: "https://www.youtube.com/watch?v=6TGHwQHdDlo",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Meditación Guiada: Soltar la Carga",
        description:
          "Una sesión guiada por voz diseñada específicamente para docentes. Se enfoca en técnicas de visualización para liberar la tensión acumulada en el aula, ayudando a reconectar con la vocación y disminuir la despersonalización hacia los alumnos.",
        type: "meditacion_guiada",
        thumbnail_url:
          "https://images.unsplash.com/photo-1545389336-eaee235efea4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        video_url:
          "https://www.youtube.com/watch?v=1lFRGBT0fCY&list=RD1lFRGBT0fCY&start_radio=1",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Respiración Consciente (4-4-4)",
        description:
          "Técnica de respiración estructurada paso a paso. Ideal para utilizar durante 5 minutos antes de entrar a una clase difícil o una reunión de padres. Te devuelve rápidamente el control de tu sistema nervioso.",
        type: "ejercicio_respiracion",
        thumbnail_url:
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        video_url: "https://www.youtube.com/watch?v=Nvtr6Ms4bmo",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {},
  );
}

export async function down({ context }) {
  await context.bulkDelete(
    "digital_spaces",
    {
      name: [
        "Refugio del Bosque",
        "Olas del Mar al Atardecer",
        "Meditación Guiada: Soltar la Carga",
        "Respiración Consciente (4-4-4)",
      ],
    },
    {},
  );
}
