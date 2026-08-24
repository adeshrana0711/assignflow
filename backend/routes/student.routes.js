import express from "express";
import { protect, studentOnly } from "../middlewares/auth.middleware.js";
import {
  uploadSingle,
  uploadMultiple,
} from "../middlewares/multer.middleware.js";
import {
  getDashboard,
  getUploadForm,
  uploadAssignment,
  getBulkUploadForm,
  bulkUploadAssignments,
  getMyAssignments,
  getAssignmentDetails,
  submitAssignment,
  downloadAssignmentFile,
  viewAssignmentFile,
  resubmitAssignment,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/student.controller.js";
import {
  getStudentDashboardApi,
  getStudentAssignmentsApi,
  getStudentAssignmentApi,
  getStudentNotificationsApi,
  markStudentNotificationReadApi,
  markAllStudentNotificationsReadApi,
  getStudentProfessorsApi,
  submitCompletedAssignmentApi,
} from "../controllers/student-api.controller.js";

const router = express.Router();

// JSON endpoints consumed by the React student portal.
router.get("/api/dashboard", protect, studentOnly, getStudentDashboardApi);
router.get("/api/professors", protect, studentOnly, getStudentProfessorsApi);
router.get("/api/assignments", protect, studentOnly, getStudentAssignmentsApi);
router.get("/api/assignments/:id", protect, studentOnly, getStudentAssignmentApi);
router.post("/api/assignments/:id/submit-completed", protect, studentOnly, uploadSingle, submitCompletedAssignmentApi);
router.get("/api/notifications", protect, studentOnly, getStudentNotificationsApi);
router.post("/api/notifications/mark-all-read", protect, studentOnly, markAllStudentNotificationsReadApi);
router.post("/api/notifications/:id/mark-read", protect, studentOnly, markStudentNotificationReadApi);

// Upload API actions (React owns the page routes).
router.post(
  "/assignments/upload",
  protect,
  studentOnly,
  uploadSingle,
  uploadAssignment
);

router.post(
  "/assignments/bulk-upload",
  protect,
  studentOnly,
  uploadMultiple,
  bulkUploadAssignments
);

// File delivery remains a backend responsibility.
router.get("/assignments/:id/file", protect, studentOnly, viewAssignmentFile);
router.post("/assignments/:id/submit", protect, studentOnly, submitAssignment);
router.get(
  "/assignments/:id/download",
  protect,
  studentOnly,
  downloadAssignmentFile
);
router.post(
  "/assignments/:id/resubmit",
  protect,
  studentOnly,
  uploadSingle,
  resubmitAssignment
);


export default router;
