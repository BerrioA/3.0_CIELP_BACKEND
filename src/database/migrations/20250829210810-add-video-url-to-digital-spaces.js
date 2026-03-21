import { DataTypes } from "sequelize";

const SPACE_VIDEO_URLS = {
  "Meditación Guiada: Soltar la Carga":
    "https://www.youtube.com/watch?v=1lFRGBT0fCY&list=RD1lFRGBT0fCY&start_radio=1",
  "Refugio del Bosque": "https://www.youtube.com/watch?v=7Ilu033ydSw",
  "Olas del Mar al Atardecer": "https://www.youtube.com/watch?v=6TGHwQHdDlo",
  "Respiración Consciente (4-4-4)":
    "https://www.youtube.com/watch?v=Nvtr6Ms4bmo",
};

export async function up({ context }) {
  await context.addColumn("digital_spaces", "video_url", {
    type: DataTypes.STRING(255),
    allowNull: true,
  });

  for (const [name, url] of Object.entries(SPACE_VIDEO_URLS)) {
    await context.bulkUpdate(
      "digital_spaces",
      {
        video_url: url,
        updated_at: new Date(),
      },
      {
        name,
      },
    );
  }
}

export async function down({ context }) {
  await context.removeColumn("digital_spaces", "video_url");
}
