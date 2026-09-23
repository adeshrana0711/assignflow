import express from "express";

import { protect, studentOnly } from "../middlewares/auth.middleware.js";

import {
  uploadSingle,
  uploadMultiple,
} from "../middlewares/multer.middleware.js";

import {uploadAssignment,bulkUploadAssignments,submitAssignment,downloadAssignmentFile,viewAssignmentFile,resubmitAssignment} from "../controllers/student.controller.js";

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

/*
|--------------------------------------------------------------------------
| Student JSON APIs
|--------------------------------------------------------------------------
*/

// Dashboard
router.get("/dashboard",protect,studentOnly,getStudentDashboardApi);

// Professors
router.get("/professors",protect,studentOnly,getStudentProfessorsApi);

// Assignments
router.get("/assignments",protect,studentOnly,getStudentAssignmentsApi);

router.get("/assignments/:id",protect,studentOnly,getStudentAssignmentApi);

router.post("/assignments/:id/submit-completed",protect,studentOnly,uploadSingle,submitCompletedAssignmentApi);

// Notifications
router.get("/notifications",protect,studentOnly,getStudentNotificationsApi);

router.post("/notifications/mark-all-read",protect,studentOnly,markAllStudentNotificationsReadApi);

router.post("/notifications/:id/mark-read",protect,studentOnly, markStudentNotificationReadApi);

/*
|--------------------------------------------------------------------------
| Student Assignment Upload APIs
|--------------------------------------------------------------------------
*/

router.post("/assignments/upload",protect,studentOnly,uploadSingle,uploadAssignment);

router.post("/assignments/bulk-upload",protect,studentOnly,uploadMultiple,bulkUploadAssignments);

/*
|--------------------------------------------------------------------------
| Assignment Files
|--------------------------------------------------------------------------
*/

router.get("/assignments/:id/file",protect,studentOnly,viewAssignmentFile);

router.post("/assignments/:id/submit",protect,studentOnly,submitAssignment);

router.get("/assignments/:id/download",protect,studentOnly,downloadAssignmentFile);

router.post("/assignments/:id/resubmit",protect,studentOnly,uploadSingle,resubmitAssignment);

export default router;