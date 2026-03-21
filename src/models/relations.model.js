import { Role } from "./roles.model.js";
import { User } from "./user.model.js";
import { AdditionalInformation } from "./additional.information.model.js";
import { MbiTestSession } from "./mbi_test_session.model.js";
import { MbiTestAnswer } from "./mbi_test_answer.model.js";
import { MbiQuestion } from "./mbi_question.model.js";
import { DigitalSpace } from "./digital_space.model.js";
import { SpaceSession } from "./space_session.model.js";
import { SessionLog } from "./session_log.model.js";
import { VerificationCode } from "./verification_code.model.js";
import { UserPreference } from "./user_preference.model.js";
import { BurnoutAlert } from "./burnout_alert.model.js";
import { UserProgressStat } from "./user_progress_stat.model.js";
import { RefreshTokenSession } from "./refresh_token_session.model.js";
import { AuthLoginAttempt } from "./auth_login_attempt.model.js";

// Un rol tiene muchos usuarios
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

// Un usuario tiene una información adicional
User.hasOne(AdditionalInformation, { foreignKey: "user_id" });
AdditionalInformation.belongsTo(User, { foreignKey: "user_id" });

// Un usuario puede realizar el test múltiples veces (Historial de sesiones)
User.hasMany(MbiTestSession, { foreignKey: "user_id" });
MbiTestSession.belongsTo(User, { foreignKey: "user_id" });

// Una sesión de test contiene muchas respuestas (Exactamente 22)
MbiTestSession.hasMany(MbiTestAnswer, { foreignKey: "session_id" });
MbiTestAnswer.belongsTo(MbiTestSession, { foreignKey: "session_id" });

// Una pregunta del catálogo puede tener muchas respuestas (a lo largo de varios tests y usuarios)
MbiQuestion.hasMany(MbiTestAnswer, { foreignKey: "question_id" });
MbiTestAnswer.belongsTo(MbiQuestion, { foreignKey: "question_id" });

// Un usuario puede tener muchas sesiones de relajación
User.hasMany(SpaceSession, { foreignKey: "user_id" });
SpaceSession.belongsTo(User, { foreignKey: "user_id" });

// Un espacio de relajación puede ser usado en muchas sesiones
DigitalSpace.hasMany(SpaceSession, { foreignKey: "space_id" });
SpaceSession.belongsTo(DigitalSpace, { foreignKey: "space_id" });

// Un usuario puede registrar múltiples logs de feedback post-sesión
User.hasMany(SessionLog, { foreignKey: "user_id" });
SessionLog.belongsTo(User, { foreignKey: "user_id" });

// Un espacio puede tener múltiples logs de sesión
DigitalSpace.hasMany(SessionLog, { foreignKey: "space_id" });
SessionLog.belongsTo(DigitalSpace, { foreignKey: "space_id" });

// Una sesión finalizada tiene un log de feedback asociado
SpaceSession.hasOne(SessionLog, { foreignKey: "session_id" });
SessionLog.belongsTo(SpaceSession, { foreignKey: "session_id" });

// Un usuario mantiene un resumen acumulado de progreso
User.hasOne(UserProgressStat, { foreignKey: "user_id" });
UserProgressStat.belongsTo(User, { foreignKey: "user_id" });

// El espacio favorito puede vincularse al resumen de progreso
DigitalSpace.hasMany(UserProgressStat, { foreignKey: "favorite_space_id" });
UserProgressStat.belongsTo(DigitalSpace, { foreignKey: "favorite_space_id" });

// Un usuario tiene muchos códigos de verificación (para diferentes propósitos, como verificación de cuenta o restablecimiento de contraseña)
User.hasMany(VerificationCode, { foreignKey: "user_id" });
VerificationCode.belongsTo(User, { foreignKey: "user_id" });

// Un usuario tiene una configuración de preferencias
User.hasOne(UserPreference, { foreignKey: "user_id" });
UserPreference.belongsTo(User, { foreignKey: "user_id" });

// Un usuario puede tener múltiples sesiones de refresh token
User.hasMany(RefreshTokenSession, { foreignKey: "user_id" });
RefreshTokenSession.belongsTo(User, { foreignKey: "user_id" });

// Un psicologo puede recibir múltiples alertas de burnout crítico
User.hasMany(BurnoutAlert, {
  foreignKey: "recipient_user_id",
  as: "received_burnout_alerts",
});
BurnoutAlert.belongsTo(User, {
  foreignKey: "recipient_user_id",
  as: "recipient",
});

// Un docente puede originar múltiples alertas
User.hasMany(BurnoutAlert, {
  foreignKey: "teacher_user_id",
  as: "teacher_burnout_alerts",
});
BurnoutAlert.belongsTo(User, {
  foreignKey: "teacher_user_id",
  as: "teacher",
});

// Una sesión MBI puede generar múltiples alertas (una por psicologo destinatario)
MbiTestSession.hasMany(BurnoutAlert, {
  foreignKey: "mbi_session_id",
  as: "burnout_alerts",
});
BurnoutAlert.belongsTo(MbiTestSession, {
  foreignKey: "mbi_session_id",
  as: "mbi_session",
});

export {
  Role,
  User,
  AdditionalInformation,
  MbiQuestion,
  MbiTestSession,
  MbiTestAnswer,
  DigitalSpace,
  SpaceSession,
  SessionLog,
  VerificationCode,
  UserPreference,
  BurnoutAlert,
  UserProgressStat,
  RefreshTokenSession,
  AuthLoginAttempt,
};
