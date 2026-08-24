import { Admin } from "../models/admin.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { email, password } = req.body;
  const expectsJson =
    req.headers.accept?.includes("application/json") ||
    req.headers["x-requested-with"] === "XMLHttpRequest";
  const sendLoginError = (message) => res.status(401).json({ error: message });

  // --- 1. Try Admin First ---
  const admin = await Admin.findOne({ email });
  if (admin) {
    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return sendLoginError("Invalid email or password");

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        department: admin.department ?? null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res.json({ success: true, role: "admin", redirect: "/admin/dashboard" });
  }

  // --- 2. Try User (Student / Professor / HOD) ---
  const user = await User.findOne({ email });
  if (!user) return sendLoginError("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return sendLoginError("Invalid email or password");

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  // REDIRECT BASED ON ROLE
  const redirects = {
    student: "/student/dashboard",
    professor: "/professor/dashboard",
    hod: "/hod/dashboard",
  };
  const redirect = redirects[user.role] || "/login";
  return res.json({ success: true, role: user.role, redirect });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
};
