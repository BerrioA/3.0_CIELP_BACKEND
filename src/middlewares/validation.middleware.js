import { body } from "express-validator";

export const userRegisterValidator = [
  body("given_name").notEmpty().withMessage("El nombre es obligatorio"),
  body("surname").notEmpty().withMessage("El apellido es obligatorio"),
  body("gender")
    .notEmpty()
    .isIn(["Masculino", "Femenino", "Otro"])
    .withMessage("Género inválido"),
  body("cellphone")
    .notEmpty()
    .isLength({ min: 10, max: 10 })
    .withMessage("Número de celular inválido"),
  body("email").isEmail().withMessage("Correo electrónico inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];
