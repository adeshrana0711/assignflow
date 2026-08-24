import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    // ==========================================
    // ASSIGNMENT CREATED BY PROFESSOR
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: ["Assignment", "Thesis", "Report"],
      required: true,
    },

    // File/question uploaded by professor
    fileUrl: {
      type: String,
      default: "",
    },

    // Professor who created the assignment
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // ==========================================
    // WHO SHOULD RECEIVE THE ASSIGNMENT?
    // ==========================================

    // "department" = all students in department
    // "students" = only selected students
    assignmentType: {
      type: String,
      enum: ["department", "students"],
      required: false,
    },

    // Example: "CSE"
    // Used when assignmentType = "department"
    department: {
      type: String,
      default: "",
      trim: true,
    },

    // Used when assignmentType = "students"
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ==========================================
    // DEADLINE
    // ==========================================

    dueDate: {
      type: Date,
      required: false,
    },

    maxMarks: {
      type: Number,
      default: 100,
      min: 1,
    },
    marks: { type: Number, min: 0, default: null },
    parentAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", default: null },

    // ==========================================
    // ASSIGNMENT STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["active", "closed", "draft", "submitted", "approved", "rejected", "forwarded"],
      default: "draft",
    },

    // Student submission and review workflow.
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionRemark: { type: String, default: null },
    approvalRemark: { type: String, default: null },
    reviewerSignature: { type: String, default: null },
    reviewerSignatureImage: { type: String, default: null },
    history: [{
      action: String,
      remark: String,
      signature: String,
      signatureImage: String,
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      marks: Number,
      date: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Assignment", assignmentSchema);
