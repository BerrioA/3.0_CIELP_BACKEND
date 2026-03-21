import {
  Role,
  User,
  AdditionalInformation,
} from "../models/relations.model.js";

// Servicio para obtener todos los maestros
export const getAllTeachers = async () => {
  try {
    const teachers = await User.findAll({
      include: [
        {
          model: Role,
          where: { name: "teacher" },
          attributes: [],
        },
        {
          model: AdditionalInformation,
          attributes: ["id", "phone", "date_of_birth", "sex"],
          required: false,
        },
      ],
      attributes: ["id", "given_name", "surname", "email", "created_at"],
      order: [["given_name", "ASC"]],
    });

    const formattedTeachers = teachers.map((teacher) => {
      const teacherData = teacher.toJSON();

      const additionalInfo = teacherData.additional_information;

      return {
        id: teacherData.id,
        given_name: teacherData.given_name,
        surname: teacherData.surname,
        email: teacherData.email,
        phone: additionalInfo?.phone || null,
        date_of_birth: additionalInfo?.date_of_birth || null,
        sex: additionalInfo?.sex || null,
        created_at: teacherData.created_at,
      };
    });

    return formattedTeachers;
  } catch (error) {
    throw new Error("Error al obtener los maestros: " + error.message);
  }
};

// Servicio para obtener un maestro por ID
export const getOneTeacher = async (id) => {
  try {
    const teacherId = typeof id === "string" ? id : id?.teacherId;

    if (!teacherId) {
      throw new Error("Id del maestro no existe!");
    }

    const teacher = await User.findByPk(teacherId, {
      include: [
        {
          model: Role,
          where: {
            name: "teacher",
          },
          attributes: [],
        },
        {
          model: AdditionalInformation,
          attributes: ["id", "phone", "date_of_birth", "sex"],
          required: false,
        },
      ],
      attributes: ["id", "given_name", "surname", "email", "created_at"],
    });

    if (!teacher) {
      throw new Error("Maestro no encontrado.");
    }

    const teacherData = teacher.toJSON();

    return {
      id: teacherData.id,
      given_name: teacherData.given_name,
      surname: teacherData.surname,
      email: teacherData.email,
      created_at: teacherData.created_at,
      phone: teacherData.additional_information?.phone || null,
      date_of_birth: teacherData.additional_information?.date_of_birth || null,
      sex: teacherData.additional_information?.sex || null,
    };
  } catch (error) {
    throw new Error("Error al obtener el maestro: " + error.message);
  }
};
