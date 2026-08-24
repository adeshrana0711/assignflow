import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import crypto from "crypto";

import { assignmentApprovedTemplate } from "../emails/assignmentApproved.js";
import { assignmentRejectedTemplate } from "../emails/assignmentRejected.js";
import { reviewOtpTemplate } from "../emails/reviewOtpTemplate.js";

import { sendEmail } from "../utils/email.js";

import {
  normalizeCloudinaryFileUrl,
  uploadBufferToCloudinary,
} from "../utils/cloudinary.js";

import { streamRemoteFile } from "../utils/file-delivery.js";

import { ASSIGNMENT_DEADLINE_DAYS } from "../config/contants.config.js";


// ======================================================
// PROFESSOR DASHBOARD
// ======================================================

export const getProfessorDashboard = async (req, res) => {
  try {

    const statusFilter =
      req.query.status || "all";

    const searchQuery =
      req.query.search || "";

    const sortBy =
      req.query.sort || "oldest";


    const professorId =
      req.user._id || req.user.id;


    // ==================================================
    // QUERY
    // ==================================================

    let query = {

      $or: [
        {
          reviewerId: professorId,
        },
        {
          "history.reviewerId":
            professorId,
        },
      ],

      status: {
        $ne: "draft",
      },

    };


    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (statusFilter !== "all") {

      query.status =
        statusFilter;

    }


    // ==================================================
    // SEARCH
    // ==================================================

    if (searchQuery) {

      const students =
        await User.find({

          name: {
            $regex:
              searchQuery,
            $options: "i",
          },

        }).select("_id");


      query.$or = [

        {
          title: {
            $regex:
              searchQuery,
            $options: "i",
          },
        },

        {
          studentId: {
            $in:
              students.map(
                (student) =>
                  student._id
              ),
          },
        },

      ];

    }


    // ==================================================
    // COUNTS
    // ==================================================

    const pending =
      await Assignment.countDocuments({

        reviewerId: professorId,

        status: "submitted",

      });


    const approved =
      await Assignment.countDocuments({

        $or: [

          {
            reviewerId: professorId,

            status: "approved",
          },

          {
            "history.reviewerId":
              professorId,

            "history.action":
              "approved",
          },

        ],

      });


    const rejected =
      await Assignment.countDocuments({

        $or: [

          {
            reviewerId: professorId,

            status: "rejected",
          },

          {
            "history.reviewerId":
              professorId,

            "history.action":
              "rejected",
          },

        ],

      });


    const forwarded =
      await Assignment.countDocuments({

        status: "forwarded",

        history: {

          $elemMatch: {

            action: "forwarded",

            reviewerId:
              professorId,

          },

        },

      });


    const totalReviewed =
      approved +
      rejected +
      forwarded;


    // ==================================================
    // SORT
    // ==================================================

    let sortOptions = {
      createdAt: 1,
    };


    if (sortBy === "newest") {

      sortOptions = {
        createdAt: -1,
      };

    }


    if (sortBy === "title") {

      sortOptions = {
        title: 1,
      };

    }


    // ==================================================
    // ASSIGNMENTS
    // ==================================================

    const assignments =
      await Assignment.find(query)

        .populate(
          "studentId",
          "name email department"
        )

        .populate(
          "reviewerId",
          "name email department role"
        )

        .skip(
          ((parseInt(req.query.page) || 1) - 1) *
          10
        )

        .limit(10)

        .sort(sortOptions);


    const totalAssignments =
      await Assignment.countDocuments(
        query
      );


    const page =
      parseInt(req.query.page) || 1;


    const totalPages =
      Math.ceil(
        totalAssignments / 10
      );


    const unreadNotifications =
      await Notification.countDocuments({

        userId: professorId,

        read: false,

      });


    // ==================================================
    // EJS RESPONSE
    // ==================================================

    res.render(
      "professor/dashboard",
      {

        forwarded,

        pending,

        approved,

        rejected,

        totalReviewed,

        assignments,

        page,

        totalPages,

        statusFilter,

        searchQuery,

        sortBy,

        unreadNotifications,

        deadlineDays:
          ASSIGNMENT_DEADLINE_DAYS,

      }
    );


  } catch (err) {

    console.error(
      "Dashboard Error:",
      err
    );

    res
      .status(500)
      .send(
        "Error loading dashboard"
      );

  }
};


// ======================================================
// GET REVIEW PAGE
// ======================================================

export const getReviewPage = async (
  req,
  res
) => {

  try {

    const assignment =
      await Assignment.findById(
        req.params.id
      )

        .populate(
          "studentId",
          "name email"
        )

        .populate(
          "reviewerId",
          "name"
        );


    if (!assignment) {

      return res
        .status(404)
        .send(
          "Assignment not found"
        );

    }


    const assignmentData =
      assignment.toObject();


    assignmentData.name =
      assignment.studentId?.name ||
      "Unknown";


    assignmentData.email =
      assignment.studentId?.email ||
      "Unknown";


    assignmentData.fileUrl =
      normalizeCloudinaryFileUrl(
        assignmentData.fileUrl
      );


    res.render(
      "professor/review",
      {

        assignment:
          assignmentData,

        deadlineDays:
          ASSIGNMENT_DEADLINE_DAYS,

      }
    );


  } catch (err) {

    console.error(
      "Review Page Error:",
      err
    );

    res
      .status(500)
      .send(
        "Error loading review page"
      );

  }

};


// ======================================================
// GET ASSIGNMENT DETAILS
// ======================================================

export const getAssignmentDetails =
  async (req, res) => {

    try {

      const assignment =
        await Assignment.findById(
          req.params.id
        )

          .populate(
            "studentId",
            "name email"
          )

          .populate(
            "reviewerId",
            "name"
          )

          .populate(
            "history.reviewerId",
            "name department"
          );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "Assignment not found"
          );

      }


      const assignmentData =
        assignment.toObject();


      assignmentData.name =
        assignment.studentId?.name ||
        "Unknown";


      assignmentData.email =
        assignment.studentId?.email ||
        "Unknown";


      assignmentData.fileUrl =
        normalizeCloudinaryFileUrl(
          assignmentData.fileUrl
        );


      // ==================================================
      // HOD LIST
      // ==================================================

      const forwardList =
        await User.find({

          department:
            req.user.department,

          role: "hod",

        })

          .select(
            "name email department role"
          );


      return res.render(
        "professor/details",
        {

          assignment:
            assignmentData,

          forwardList,

          deadlineDays:
            ASSIGNMENT_DEADLINE_DAYS,

          user:
            req.user,

        }
      );


    } catch (err) {

      console.error(
        "Details Page Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error loading assignment details"
        );

    }

  };


// ======================================================
// STEP 1 - INITIATE REVIEW
// ======================================================

export const initiateReview =
  async (req, res) => {

    try {

      const expectsJson =
        req.headers.accept?.includes(
          "application/json"
        ) ||
        req.headers[
          "x-requested-with"
        ] ===
          "XMLHttpRequest";


      const {
        remark,
        signature,
        decision,
      } = req.body;


      const assignmentId =
        req.params.id;


      // ==================================================
      // SIGNATURE
      // ==================================================

      const signatureUpload =
        req.file

          ? await uploadBufferToCloudinary(
              req.file,
              {
                folder:
                  "assignflow/signatures",

                resource_type:
                  "image",
              }
            )

          : null;


      const signatureImage =
        signatureUpload
          ? signatureUpload.secure_url
          : null;


      // ==================================================
      // ASSIGNMENT
      // ==================================================

      const assignment =
        await Assignment.findById(
          assignmentId
        );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "Assignment not found"
          );

      }


      if (
        !signature &&
        !signatureImage
      ) {

        return res
          .status(400)
          .send(
            "Signature is required (text or image)"
          );

      }


      if (
        !remark ||
        !decision
      ) {

        return res
          .status(400)
          .send(
            "Remark and decision are required"
          );

      }


      // ==================================================
      // OTP
      // ==================================================

      const otp =
        crypto.randomInt(
          100000,
          999999
        ).toString();


      const user =
        await User.findById(
          req.user.id
        );


      if (!user) {

        return res
          .status(401)
          .send(
            "Unauthorized user"
          );

      }


      user.reviewOtp =
        otp;


      user.reviewOtpExpires =
        Date.now() +
        10 * 60 * 1000;


      user.tempReviewData = {

        assignmentId:
          assignment._id,

        decision,

        remark,

        signature:
          signature || null,

        signatureImage:
          signatureImage || null,

      };


      await user.save();


      const signaturePreview =
        signatureImage

          ? "<p><em>(Signature Image Uploaded)</em></p>"

          : `<p style="font-family:cursive;font-size:24px;color:#4f46e5;">${signature}</p>`;


      await sendEmail({

        to:
          user.email,

        subject:
          "AssignFlow: Verify Assignment Review",

        html:
          reviewOtpTemplate(
            user.name,
            assignment.title,
            otp,
            signaturePreview
          ),

      });


      if (expectsJson) {

        return res.json({

          requiresOtp: true,

          email:
            user.email,

          assignmentId,

        });

      }


      return res.render(
        "professor/verify-otp",
        {

          email:
            user.email,

          assignmentId,

        }
      );


    } catch (err) {

      console.error(
        "Initiate Review Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error initiating review process"
        );

    }

  };


// ======================================================
// STEP 2 - VERIFY OTP
// ======================================================

export const verifyReviewOTP =
  async (req, res) => {

    try {

      const expectsJson =
        req.headers.accept?.includes(
          "application/json"
        ) ||
        req.headers[
          "x-requested-with"
        ] ===
          "XMLHttpRequest";


      const { otp } =
        req.body;


      const user =
        await User.findById(
          req.user.id
        );


      if (!user) {

        return res
          .status(401)
          .send(
            "Unauthorized"
          );

      }


      // ==================================================
      // VERIFY OTP
      // ==================================================

      if (

        !user.reviewOtp ||

        user.reviewOtp !==
          String(otp) ||

        user.reviewOtpExpires <
          Date.now() ||

        !user.tempReviewData

      ) {

        if (expectsJson) {

          return res
            .status(400)
            .json({

              error:
                "Invalid or expired OTP.",

            });

        }


        return res.render(
          "professor/verify-otp",
          {

            email:
              user.email,

            assignmentId:
              user.tempReviewData
                ?.assignmentId,

            error:
              "Invalid or expired OTP.",

          }
        );

      }


      const {
        assignmentId,
        decision,
        remark,
        signature,
        signatureImage,
      } =
        user.tempReviewData;


      const assignment =
        await Assignment.findById(
          assignmentId
        );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "Assignment not found"
          );

      }


      // ==================================================
      // AUTHORIZATION
      // ==================================================

      if (
        assignment.reviewerId?.toString() !==
        user._id.toString()
      ) {

        return res
          .status(403)
          .send(
            "Unauthorized review action"
          );

      }


      // ==================================================
      // HISTORY
      // ==================================================

      assignment.history.push({

        action:
          decision,

        remark,

        signature:
          signature || null,

        signatureImage:
          signatureImage || null,

        reviewerId:
          user._id,

        date:
          new Date(),

      });


      // ==================================================
      // DECISION
      // ==================================================

      if (
        decision ===
        "approved"
      ) {

        assignment.status =
          "approved";

        assignment.approvalRemark =
          remark;

        assignment.reviewerSignature =
          signature || null;

        assignment.reviewerSignatureImage =
          signatureImage || null;

      } else {

        assignment.status =
          "rejected";

        assignment.rejectionRemark =
          remark;

        assignment.reviewerSignature =
          signature || null;

        assignment.reviewerSignatureImage =
          signatureImage || null;

      }


      await assignment.save();


      // ==================================================
      // STUDENT NOTIFICATION
      // ==================================================

      await Notification.create({

        userId:
          assignment.studentId,

        assignmentId:
          assignment._id,

        sender:
          user._id,

        message:
          `Your assignment "${assignment.title}" was ${decision} by ${user.name}.`,

        type:
          decision,

        read:
          false,

      });


      // ==================================================
      // EMAIL STUDENT
      // ==================================================

      if (
        decision ===
        "approved"
      ) {

        try {

          const student =
            await User.findById(
              assignment.studentId
            );


          await sendEmail({

            to:
              student.email,

            subject:
              `Assignment "${assignment.title}" Approved`,

            html:
              assignmentApprovedTemplate(

                student.name,

                assignment.title,

                remark,

                assignment._id

              ),

          });


        } catch (err) {

          console.error(
            "Approval email failed:",
            err
          );

        }

      }


      if (
        decision ===
        "rejected"
      ) {

        try {

          const student =
            await User.findById(
              assignment.studentId
            );


          await sendEmail({

            to:
              student.email,

            subject:
              `Assignment "${assignment.title}" Rejected`,

            html:
              assignmentRejectedTemplate(

                student.name,

                assignment.title,

                remark,

                assignment._id

              ),

          });


        } catch (err) {

          console.error(
            "Rejection email failed:",
            err
          );

        }

      }


      // ==================================================
      // CLEAR OTP
      // ==================================================

      user.reviewOtp =
        undefined;

      user.reviewOtpExpires =
        undefined;

      user.tempReviewData =
        undefined;


      await user.save();


      if (expectsJson) {

        return res.json({

          success:
            true,

          redirect:
            "/professor/dashboard?status=submitted",

        });

      }


      return res.redirect(
        "/professor/dashboard?status=submitted"
      );


    } catch (err) {

      console.error(
        "OTP Verify Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error verifying review"
        );

    }

  };


// ======================================================
// FORWARD ASSIGNMENT TO HOD
// ======================================================

export const forwardAssignment =
  async (req, res) => {

    try {

      const {
        newReviewerId,
        note,
      } =
        req.body;


      const assignmentId =
        req.params.id;


      const professorId =
        req.user._id ||
        req.user.id;


      console.log(
        "======================================"
      );

      console.log(
        "FORWARD ASSIGNMENT START"
      );

      console.log(
        "Assignment ID:",
        assignmentId
      );

      console.log(
        "Professor ID:",
        professorId
      );

      console.log(
        "Professor:",
        req.user.name
      );

      console.log(
        "Professor Department:",
        req.user.department
      );

      console.log(
        "Selected HOD ID:",
        newReviewerId
      );


      // ==================================================
      // VALIDATION
      // ==================================================

      if (
        !newReviewerId ||
        !note
      ) {

        return res
          .status(400)
          .send(
            "HOD selection and forwarding note are required"
          );

      }


      if (
        note.trim().length <
        10
      ) {

        return res
          .status(400)
          .send(
            "Forwarding note must be at least 10 characters"
          );

      }


      // ==================================================
      // FIND ASSIGNMENT
      // ==================================================

      const assignment =
        await Assignment.findById(
          assignmentId
        ).populate(
          "studentId",
          "name email"
        );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "Assignment not found"
          );

      }


      console.log(
        "Assignment found:",
        assignment.title
      );

      console.log(
        "Current status:",
        assignment.status
      );

      console.log(
        "Current reviewer:",
        assignment.reviewerId?.toString()
      );


      // ==================================================
      // ONLY APPROVED
      // ==================================================

      if (
        assignment.status !==
        "approved"
      ) {

        return res
          .status(400)
          .send(
            "Only approved assignments can be forwarded to HOD"
          );

      }


      // ==================================================
      // FIND HOD
      // ==================================================

      const newReviewer =
        await User.findById(
          newReviewerId
        );


      if (!newReviewer) {

        return res
          .status(404)
          .send(
            "Selected HOD not found"
          );

      }


      console.log(
        "Selected HOD name:",
        newReviewer.name
      );

      console.log(
        "Selected HOD role:",
        newReviewer.role
      );

      console.log(
        "Selected HOD department:",
        newReviewer.department
      );


      // ==================================================
      // VERIFY HOD
      // ==================================================

      if (
        newReviewer.role !==
        "hod"
      ) {

        return res
          .status(400)
          .send(
            "Assignment can only be forwarded to HOD"
          );

      }


      // ==================================================
      // VERIFY DEPARTMENT
      // ==================================================

      if (
        newReviewer.department !==
        req.user.department
      ) {

        return res
          .status(400)
          .send(
            "Can only forward to HOD in your department"
          );

      }


      // ==================================================
      // SAVE HOD AS REVIEWER
      // ==================================================

      assignment.reviewerId = newReviewer._id;

      assignment.status =
        "forwarded";


      // ==================================================
      // HISTORY
      // ==================================================

      assignment.history.push({

        action:
          "forwarded",

        remark:
          note,

        reviewerId:
          professorId,

        date:
          new Date(),

      });


      // ==================================================
      // SAVE
      // ==================================================

      await assignment.save();

console.log("========== FORWARD CHECK ==========");

const checkAssignment = await Assignment.findById(
  assignment._id
)
  .populate(
    "reviewerId",
    "name email department role"
  )
  .lean();

console.log(
  "Assignment ID:",
  checkAssignment._id
);

console.log(
  "Assignment title:",
  checkAssignment.title
);

console.log(
  "Assignment status:",
  checkAssignment.status
);

console.log(
  "Reviewer:",
  checkAssignment.reviewerId
);

console.log(
  "Reviewer ID:",
  checkAssignment.reviewerId?._id
);

console.log(
  "Reviewer name:",
  checkAssignment.reviewerId?.name
);

console.log(
  "Reviewer role:",
  checkAssignment.reviewerId?.role
);

console.log(
  "Reviewer department:",
  checkAssignment.reviewerId?.department
);

console.log(
  "==================================");
      // ==================================================
      // VERIFY DATABASE VALUE
      // ==================================================

      const savedAssignment =
        await Assignment.findById(
          assignment._id
        )
          .populate(
            "reviewerId",
            "name email department role"
          )
          .lean();


      console.log(
        "======================================"
      );

      console.log(
        "FORWARD SUCCESSFUL"
      );

      console.log(
        "Saved Assignment:",
        savedAssignment._id
      );

      console.log(
        "Saved Status:",
        savedAssignment.status
      );

      console.log(
        "Saved Reviewer ID:",
        savedAssignment.reviewerId?._id
      );

      console.log(
        "Saved Reviewer Name:",
        savedAssignment.reviewerId?.name
      );

      console.log(
        "Saved Reviewer Role:",
        savedAssignment.reviewerId?.role
      );

      console.log(
        "======================================"
      );


      // ==================================================
      // HOD NOTIFICATION
      // ==================================================

      await Notification.create({

        userId:
          newReviewer._id,

        assignmentId:
          assignment._id,

        sender:
          professorId,

        type:
          "forwarded",

        message:
          `Assignment "${assignment.title}" has been forwarded to you by ${req.user.name} for final approval.`,

        read:
          false,

      });


      // ==================================================
      // STUDENT NOTIFICATION
      // ==================================================

      await Notification.create({

        userId:
          assignment.studentId._id,

        assignmentId:
          assignment._id,

        sender:
          professorId,

        type:
          "forwarded",

        message:
          `Your assignment "${assignment.title}" has been forwarded to HOD for final review.`,

        read:
          false,

      });


      // ==================================================
      // RESPONSE
      // ==================================================

      return res.redirect(
        "/professor/dashboard?message=Assignment%20forwarded%20successfully"
      );


    } catch (err) {

      console.error(
        "======================================"
      );

      console.error(
        "FORWARD ASSIGNMENT ERROR"
      );

      console.error(
        err
      );

      console.error(
        "======================================"
      );

      return res
        .status(500)
        .send(
          err.message ||
          "Error forwarding assignment"
        );

    }

  };


// ======================================================
// PROFESSOR NOTIFICATIONS
// ======================================================

export const getNotifications =
  async (req, res) => {

    try {

      const notifications =
        await Notification.find({

          userId:
            req.user.id,

        })

          .populate(
            "assignmentId",
            "title status"
          )

          .sort({
            createdAt: -1,
          })

          .limit(20);


      res.render(
        "professor/notifications",
        {
          notifications,
        }
      );


    } catch (err) {

      console.error(
        "Notifications Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error loading notifications"
        );

    }

  };


// ======================================================
// MARK NOTIFICATION READ
// ======================================================

export const markNotificationRead =
  async (req, res) => {

    try {

      await Notification.findByIdAndUpdate(

        req.params.id,

        {
          read: true,
        }

      );


      res.redirect(
        "/professor/notifications"
      );


    } catch (err) {

      console.error(
        "Mark Read Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error marking notification as read"
        );

    }

  };


// ======================================================
// MARK ALL NOTIFICATIONS READ
// ======================================================

export const markAllNotificationsRead =
  async (req, res) => {

    try {

      await Notification.updateMany(

        {
          userId:
            req.user.id,

          read:
            false,

        },

        {
          read:
            true,

        }

      );


      res.redirect(
        "/professor/notifications"
      );


    } catch (err) {

      console.error(
        "Mark All Read Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error marking notifications as read"
        );

    }

  };


// ======================================================
// VIEW ASSIGNMENT FILE
// ======================================================

export const professorViewAssignmentFile =
  async (req, res) => {

    try {

      const assignment =
        await Assignment.findById(
          req.params.id
        );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "File not found"
          );

      }


      const professorId =
        req.user._id ||
        req.user.id;


      const reviewerMatches =

        assignment.reviewerId
          ?.toString() ===
          professorId.toString()

        ||

        assignment.history?.some(
          (entry) =>
            entry.reviewerId
              ?.toString() ===
            professorId.toString()
        );


      if (!reviewerMatches) {

        return res
          .status(403)
          .send(
            "Unauthorized"
          );

      }


      if (
        assignment.fileUrl?.startsWith(
          "http"
        )
      ) {

        return streamRemoteFile(

          res,

          normalizeCloudinaryFileUrl(
            assignment.fileUrl
          ),

          assignment.title,

          "inline",

          {
            contentType:
              "application/pdf",

            extension:
              "pdf",
          }

        );

      }


      return res.sendFile(
        assignment.fileUrl
      );


    } catch (err) {

      console.error(
        "Professor View File Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error opening file"
        );

    }

  };


// ======================================================
// DOWNLOAD ASSIGNMENT FILE
// ======================================================

export const professorDownloadAssignmentFile =
  async (req, res) => {

    try {

      const assignment =
        await Assignment.findById(
          req.params.id
        );


      if (!assignment) {

        return res
          .status(404)
          .send(
            "File not found"
          );

      }


      const professorId =
        req.user._id ||
        req.user.id;


      const reviewerMatches =

        assignment.reviewerId
          ?.toString() ===
          professorId.toString()

        ||

        assignment.history?.some(
          (entry) =>
            entry.reviewerId
              ?.toString() ===
            professorId.toString()
        );


      if (!reviewerMatches) {

        return res
          .status(403)
          .send(
            "Unauthorized"
          );

      }


      if (
        assignment.fileUrl?.startsWith(
          "http"
        )
      ) {

        return streamRemoteFile(

          res,

          normalizeCloudinaryFileUrl(
            assignment.fileUrl
          ),

          assignment.title,

          "attachment",

          {
            contentType:
              "application/pdf",

            extension:
              "pdf",
          }

        );

      }


      return res.download(
        assignment.fileUrl
      );


    } catch (err) {

      console.error(
        "Professor Download File Error:",
        err
      );

      res
        .status(500)
        .send(
          "Error downloading file"
        );

    }

  };