import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from "dotenv";
dotenv.config();


console.log('Cloudinary:', process.env.CLOUDINARY_CLOUD_NAME ? 'READY' : 'MISSING');
console.log("PORT =", process.env.PORT);
console.log('Cloudinary check:', !!process.env.CLOUDINARY_CLOUD_NAME);

import connectDB from "./config/db.config.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization,X-Requested-With,Accept"
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // This parses form data
app.use(cookieParser());

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static("uploads")); // Disabled for Cloudinary

//auth Routes
app.use("/auth", authRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/admin/users", userRoutes);

// Student Routes
import studentRoutes from "./routes/student.routes.js";
app.use("/student", studentRoutes);

// Professor Routes
import professorRoutes from "./routes/professor.routes.js";
app.use("/professor", professorRoutes);

// HOD Routes
import hodRoutes from "./routes/hod.routes.js";
app.use("/hod", hodRoutes);


import assignmentRoutes from "./routes/assignment.routes.js";
app.use("/api/assignments", assignmentRoutes);

// Production React application. API routes above always take precedence.
const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/{*splat}", (req, res) => res.sendFile(path.join(frontendDist, "index.html")));

// Start server
app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
)
