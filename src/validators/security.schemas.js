import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(3, "Debe tener al menos 3 caracteres.")
  .max(100, "No puede superar 100 caracteres.");

const emailSchema = z
  .string()
  .trim()
  .min(3, "El correo es obligatorio.")
  .email("El correo no tiene un formato valido.");

const passwordSchema = z
  .string()
  .trim()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(64, "La contrasena no puede superar 64 caracteres.");

const verificationCodeSchema = z
  .string()
  .trim()
  .min(8, "El codigo de verificacion es invalido.")
  .max(2048, "El codigo de verificacion es invalido.");

const userDataSchema = z
  .object({
    given_name: nameSchema,
    surname: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    data_privacy_consent: z.boolean().refine((value) => value === true, {
      message: "Debe aceptar el tratamiento de datos para continuar.",
    }),
  })
  .strict();

export const loginBodySchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const resendVerificationBodySchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const forgotPasswordBodySchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export const verifyAccountParamsSchema = z
  .object({
    code: verificationCodeSchema,
  })
  .strict();

export const resetPasswordParamsSchema = z
  .object({
    verificationCode: verificationCodeSchema,
  })
  .strict();

export const resetPasswordBodySchema = z
  .object({
    newPassword: passwordSchema,
  })
  .strict();

export const registerTeacherBodySchema = z
  .object({
    userData: userDataSchema,
  })
  .strict();

export const registerAdminBodySchema = z
  .object({
    userData: userDataSchema,
  })
  .strict();

export const registerPsychologistBodySchema = z
  .object({
    userData: userDataSchema,
  })
  .strict();

export const userIdParamsSchema = z
  .object({
    userId: z.string().uuid("El identificador del usuario no es valido."),
  })
  .strict();

export const changePasswordBodySchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .min(1, "La contrasena actual es obligatoria."),
    newPassword: passwordSchema,
  })
  .strict()
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "La nueva contrasena debe ser diferente a la actual.",
    path: ["newPassword"],
  });

export const deleteUserBodySchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, "La contrasena de confirmacion no puede estar vacia.")
      .max(64, "La contrasena de confirmacion excede el maximo permitido.")
      .optional(),
  })
  .strict();

export const additionalInformationBodySchema = z
  .object({
    additionalInformation: z
      .object({
        document_number: z
          .string()
          .trim()
          .min(4, "El numero de documento debe tener al menos 4 caracteres.")
          .max(30, "El numero de documento no puede superar 30 caracteres."),
        phone: z
          .string()
          .trim()
          .min(7, "El telefono debe tener al menos 7 caracteres.")
          .max(20, "El telefono no puede superar 20 caracteres."),
        date_of_birth: z
          .string()
          .trim()
          .min(1, "La fecha de nacimiento es obligatoria."),
        sex: z
          .string()
          .trim()
          .min(1, "El campo de sexo es obligatorio.")
          .max(30, "El campo de sexo no puede superar 30 caracteres."),
        address: z
          .string()
          .trim()
          .max(200, "La direccion no puede superar 200 caracteres.")
          .optional()
          .or(z.literal("")),
      })
      .strict(),
  })
  .strict();

const mbiAnswerSchema = z
  .object({
    question_id: z.string().uuid("El ID de pregunta no es valido."),
    score: z
      .number({
        invalid_type_error: "El score debe ser numerico.",
      })
      .int("El score debe ser un entero.")
      .min(0, "El score no puede ser menor a 0.")
      .max(6, "El score no puede ser mayor a 6."),
  })
  .strict();

export const submitMbiBodySchema = z
  .object({
    answers: z
      .array(mbiAnswerSchema)
      .length(22, "El test MBI requiere exactamente 22 respuestas.")
      .superRefine((answers, context) => {
        const seen = new Set();

        answers.forEach((answer, index) => {
          if (seen.has(answer.question_id)) {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, "question_id"],
              message:
                "No se permiten respuestas duplicadas para la misma pregunta.",
            });
          }

          seen.add(answer.question_id);
        });
      }),
  })
  .strict();

export const teacherIdParamsSchema = z
  .object({
    teacherId: z.string().uuid("El ID del docente no es valido."),
  })
  .strict();

export const alertIdParamsSchema = z
  .object({
    alertId: z.string().uuid("El ID de la alerta no es valido."),
  })
  .strict();

export const startSpaceSessionBodySchema = z
  .object({
    space_id: z.string().uuid("El ID del espacio debe ser un UUID valido."),
  })
  .strict();

export const endSpaceSessionParamsSchema = z
  .object({
    session_id: z.string().uuid("El ID de sesion no es valido."),
  })
  .strict();

export const endSpaceSessionBodySchema = z
  .object({
    mood_score: z
      .number({ invalid_type_error: "El mood_score debe ser numerico." })
      .int("El mood_score debe ser un entero.")
      .min(1, "El mood_score debe estar entre 1 y 10.")
      .max(10, "El mood_score debe estar entre 1 y 10."),
  })
  .strict();

export const moodHistoryQuerySchema = z
  .object({
    days: z.coerce
      .number()
      .int("El parametro days debe ser entero.")
      .min(7, "El parametro days debe ser mayor o igual a 7.")
      .max(365, "El parametro days debe ser menor o igual a 365.")
      .optional(),
  })
  .strict();
