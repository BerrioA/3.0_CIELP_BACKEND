import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PASS,
  EMAIL_PORT,
  EMAIL_USER,
} from "../config/env.js";

export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: EMAIL_PORT,
  secure: Number(EMAIL_PORT) === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
