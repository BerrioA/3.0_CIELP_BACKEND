import {
  getAllTeachers,
  getOneTeacher,
  processResendVerification,
  registerUser,
} from "../services/index.js";

// Controlador para registrar maestros
export const registerTeacher = async (req, res) => {
  try {
    const { userData } = req.body;

    const newUser = await registerUser(userData);

    await processResendVerification(newUser.email);

    res.status(201).json({
      message:
        "Usuario registrado exitosamente. Por favor, verifica tu correo electrónico para activar tu cuenta.",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Controlador para obtener todos los maestros
export const getTeachers = async (_, res) => {
  try {
    const teachers = await getAllTeachers();
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Se ha presentado un error al obtener los maestros", error);
    res.status(500).json({ error: error.message });
  }
};

// Controlador para obtener un maestro por ID
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId)
      return res.status(404).json({ error: "Id del maestro no existe!" });

    const teacher = await getOneTeacher({ teacherId });
    res.status(200).json(teacher);
  } catch (error) {
    if (error.message === "Maestro no encontrado.") {
      return res.status(404).json({ error: error.message });
    }

    console.error(
      "Se ha presentado un error al intentar obtener el maestro",
      error,
    );
    res.status(500).json({ error: error.message });
  }
};
