import { AdditionalInformation } from "../models/index.js";

// Servicio para actualizar la información adicional de usuarios
export const updateAdditionalInformation = async ({
  userId,
  dataAdditionalInformationUpdate,
  transaction,
}) => {
  try {
    const additionalInfo = await AdditionalInformation.findOne({
      where: { user_id: userId },
      attributes: ["id", "document_number", "phone", "date_of_birth", "sex"],
      transaction,
    });

    if (!additionalInfo) {
      return { error: "Información adicional de usuario no encontrada" };
    }

    await additionalInfo.update(dataAdditionalInformationUpdate, {
      transaction,
    });

    return additionalInfo;
  } catch (error) {
    console.error({ message: error });
    throw new Error(
      "Error al actualizar la información adicional: " + error.message,
    );
  }
};
