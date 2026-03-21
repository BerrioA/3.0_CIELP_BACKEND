import { FRONTEND_URL } from "./env.js";

// ⚡ Configurar CORS
export const corsOptions = {
  origin: [FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
