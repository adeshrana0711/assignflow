import express from "express";
import { protect, hodOnly } from "../middlewares/auth.middleware.js";
import { uploadSignature } from "../middlewares/multer.middleware.js"; // Import signature uploader
import {
  getHodDashboard,
  getHodReviewPage,
  hodApprove,
  hodReject,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getHodDetails,
  hodViewAssignmentFile,
  hodDownloadAssignmentFile,
} from "../controllers/hod.controller.js";
import { hodDashboardApi, hodAssignmentApi, hodNotificationsApi, markHodNotificationApi, markAllHodNotificationsApi } from "../controllers/hod-api.controller.js";

const router = express.Router();
router.get("/api/dashboard", protect, hodOnly, hodDashboardApi);
router.get("/api/assignments/:id", protect, hodOnly, hodAssignmentApi);
router.get("/api/notifications", protect, hodOnly, hodNotificationsApi);
router.post("/api/notifications/mark-all-read", protect, hodOnly, markAllHodNotificationsApi);
router.post("/api/notifications/:id/mark-read", protect, hodOnly, markHodNotificationApi);

// File delivery and final-review actions remain backend responsibilities.
router.get("/assignments/:id/file", protect, hodOnly, hodViewAssignmentFile);
router.get("/assignments/:id/download", protect, hodOnly, hodDownloadAssignmentFile);

// Approve & Reject - WITH MULTER FOR FILE UPLOAD
router.post(
  "/assignments/:id/approve",
  protect,
  hodOnly,
  uploadSignature,
  hodApprove
);
router.post(
  "/assignments/:id/reject",
  protect,
  hodOnly,
  uploadSignature,
  hodReject
);


export default router;
