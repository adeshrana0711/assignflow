import express from "express";
import { login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", (req, res) => res.status(410).json({ error: "Login is provided by the React app." }));
router.post("/login", login);
router.get("/logout", logout);

export default router;
