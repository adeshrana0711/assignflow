import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.config.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import studentRoutes from "./routes/student.routes.js";
import professorRoutes from "./routes/professor.routes.js";
import hodRoutes from "./routes/hod.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";

const app = express();


/* =====================================================
   DATABASE
===================================================== */

connectDB();


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());


/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AssignFlow backend is running",
  });
});


/* =====================================================
   AUTH
===================================================== */

app.use(
  "/auth",
  authRoutes
);


/* =====================================================
   ADMIN
===================================================== */

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin/users",
  userRoutes
);


/* =====================================================
   STUDENT
===================================================== */

app.use(
  "/api/student",
  studentRoutes
);


/* =====================================================
   PROFESSOR
===================================================== */

app.use(
  "/api/professor",
  professorRoutes
);


/* =====================================================
   HOD
===================================================== */

app.use(
  "/api/hod",
  hodRoutes
);


/* =====================================================
   ASSIGNMENTS
===================================================== */

app.use(
  "/api/assignments",
  assignmentRoutes
);


/* =====================================================
   API 404 HANDLER
===================================================== */

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});


/* =====================================================
   LOCAL SERVER
===================================================== */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}


/* =====================================================
   VERCEL
===================================================== */

export default app;