import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import {
  getDashboard,
  getDashboardStats,
  getAddDepartment,
  postAddDepartment,
  getAllDepartments,
  getDepartmentsApi,
  getAllDepartmentsApi,
  getDepartmentApi,
  createDepartmentApi,
  updateDepartmentApi,
  deleteDepartmentApi,
  getEditDepartment,
  postEditDepartment,
  deleteDepartment,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

// Departments API for React
router.get("/departments/api/all", protect, adminOnly, getAllDepartmentsApi);
router.get("/departments/api/:id", protect, adminOnly, getDepartmentApi);
router.get("/departments/api", protect, adminOnly, getDepartmentsApi);
router.post("/departments/api", protect, adminOnly, createDepartmentApi);
router.put("/departments/api/:id", protect, adminOnly, updateDepartmentApi);
router.delete("/departments/api/:id", protect, adminOnly, deleteDepartmentApi);


export default router;
