import express from "express";

import {
  createAssignment,
  getProfessorAssignments,
  getAssignmentById,
  deleteAssignment,
} from "../controllers/assignment.controller.js";

import {
  protect,
  professorOnly,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// =====================================================
// PROFESSOR CREATE ASSIGNMENT
// POST /api/assignments
// =====================================================

router.post(
  "/",
  protect,
  professorOnly,
  createAssignment
);


// =====================================================
// PROFESSOR'S ASSIGNMENTS
// GET /api/assignments/professor
// =====================================================

router.get(
  "/professor",
  protect,
  professorOnly,
  getProfessorAssignments
);


// =====================================================
// GET ONE ASSIGNMENT
// GET /api/assignments/:id
// =====================================================

router.get(
  "/:id",
  protect,
  professorOnly,
  getAssignmentById
);


// =====================================================
// DELETE ASSIGNMENT
// DELETE /api/assignments/:id
// =====================================================

router.delete(
  "/:id",
  protect,
  professorOnly,
  deleteAssignment
);

export default router;