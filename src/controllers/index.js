export {
  profile,
  login,
  logout,
  sendPasswordRecoveryUrl,
  resetPassword,
} from "./auth.controller.js";

export { refreshToken } from "./refreshToken.controller.js";

export {
  getUsers,
  updateUsers,
  registerAdmin,
  registerPsychologist,
  getAllUsersTrash,
  changePassword,
  changeMePassword,
  restoreUser,
  deleteUsers,
  deleteUserComplete,
  registerAdditionalInformations,
  getMeAdditionalInformation,
  getMePreferences,
  updateMePreferences,
} from "./user.controller.js";

export {
  registerTeacher,
  getTeachers,
  getTeacherById,
} from "./teacher.controller.js";

export {
  getQuestions,
  getMyMbiProgressComparison,
  getMyMbiRetestStatus,
  submitTeacherTest,
  getTestHistory,
  getTestHistoryByUserId,
  getMyBurnoutAlerts,
  markBurnoutAlertAsRead,
} from "./mbi.controller.js";

export {
  getDigitalSpaces,
  startSession,
  getActiveSession,
  endSession,
  getUserStats,
  getMoodHistoryBySpace,
} from "./space.controller.js";

export { resendEmailCode, verifyAccount } from "./email.controller.js";

export { getGlobalDashboard } from "./analytics.controller.js";
