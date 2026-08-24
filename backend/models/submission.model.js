import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // ==========================================
    // PROFESSOR'S ASSIGNMENT
    // ==========================================

    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    // ==========================================
    // STUDENT
    // ==========================================

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // STUDENT'S COMPLETED FILE
    // ==========================================

    fileUrl: {
      type: String,
      required: true,
    },

    // ==========================================
    // SUBMISSION STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "submitted",
        "approved",
        "rejected",
        "forwarded",
      ],
      default: "submitted",
    },

    // Current professor/HOD reviewer
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // MARKS AND FEEDBACK
    // ==========================================

    marks: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },

    // ==========================================
    // REVIEW HISTORY
    // ==========================================

    history: [
      {
        action: {
          type: String,
          enum: [
            "submitted",
            "approved",
            "rejected",
            "resubmitted",
            "forwarded",
            "final approved",
            "final rejected",
          ],
        },

        remark: {
          type: String,
          default: "",
        },

        date: {
          type: Date,
          default: Date.now,
        },

        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        // Text signature
        signature: {
          type: String,
          default: "",
        },

        // Signature image
        signatureImage: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// ONE STUDENT = ONE SUBMISSION
// FOR ONE ASSIGNMENT
// ==========================================

submissionSchema.index(
  {
    assignmentId: 1,
    studentId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "Submission",
  submissionSchema
);