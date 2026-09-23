import express from "express";
import { protect, professorOnly } from "../middlewares/auth.middleware.js";
import { uploadSignature } from "../middlewares/multer.middleware.js"; // Import new uploader
import {
  getProfessorDashboard,
  getReviewPage,
  getAssignmentDetails,
  initiateReview,
  verifyReviewOTP,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  forwardAssignment,
  professorViewAssignmentFile,
  professorDownloadAssignmentFile,
} from "../controllers/professor.controller.js";
import { getProfessorDashboardApi, getProfessorAssignmentApi, getProfessorNotificationsApi, markProfessorNotificationApi, markAllProfessorNotificationsApi, getProfessorDepartmentsApi, getProfessorStudentsApi } from "../controllers/professor-api.controller.js";

const router = express.Router();

router.get("/dashboard", protect, professorOnly, getProfessorDashboardApi);
router.get("/departments", protect, professorOnly, getProfessorDepartmentsApi);
router.get("/students", protect, professorOnly, getProfessorStudentsApi);
router.get("/assignments/:id", protect, professorOnly, getProfessorAssignmentApi);
router.get("/notifications", protect, professorOnly, getProfessorNotificationsApi);
router.post("/notifications/mark-all-read", protect, professorOnly, markAllProfessorNotificationsApi);
router.post("/notifications/:id/mark-read", protect, professorOnly, markProfessorNotificationApi);

// OTP Verification (Must be before :id routes)
// OTP Verification FIRST (MUST BE BEFORE :id route)
router.post("/review/verify-otp", protect, professorOnly, verifyReviewOTP);

// Review actions and file delivery remain backend responsibilities.
router.get("/assignments/:id/file", protect, professorOnly, professorViewAssignmentFile);
router.get("/assignments/:id/download", protect, professorOnly, professorDownloadAssignmentFile);
router.post(
  "/review/:id",
  protect,
  professorOnly,
  uploadSignature,
  initiateReview
);


//================================
//Forwarding Assignments to HODs
//================================

router.post(
  "/assignments/:id/forward",
  protect,
  professorOnly,
  forwardAssignment
);

export default router;
