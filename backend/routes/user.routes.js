import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

import {
  getUsers,
  renderAddUserForm,
  addUser,
  renderEditUserForm,
  updateUser,
  deleteUser,
  getUsersApi,
  getUserApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
} from "../controllers/user.controller.js";

const router = express.Router();

// Users API for React
router.get("/api", protect, adminOnly, getUsersApi);
router.get("/api/:id", protect, adminOnly, getUserApi);
router.post("/api", protect, adminOnly, addUserApi);
router.put("/api/:id", protect, adminOnly, updateUserApi);
router.delete("/api/:id", protect, adminOnly, deleteUserApi);

export default router;
