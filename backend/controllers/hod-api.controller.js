import Assignment from "../models/assignment.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";


// ======================================================
// HELPER
// ======================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};


// ======================================================
// HOD DASHBOARD API
// ======================================================

export const hodDashboardApi = async (req, res) => {
  try {

    const hodId = getUserId(req);

    if (!hodId) {
      return res.status(401).json({
        success: false,
        error: "HOD user is not logged in",
      });
    }


    console.log("======================================");
    console.log("HOD DASHBOARD API");
    console.log("HOD ID:", hodId);
    console.log("HOD NAME:", req.user?.name);
    console.log("HOD ROLE:", req.user?.role);
    console.log("HOD DEPARTMENT:", req.user?.department);
    console.log("======================================");


    const statusFilter = req.query.status || "all";
    const search = (req.query.search || "").trim();
    const sortBy = req.query.sort || "newest";


    // ==================================================
    // MAIN QUERY
    //
    // Professor forwarding code does:
    //
    // assignment.reviewerId = newReviewerId
    // assignment.status = "forwarded"
    //
    // Therefore HOD assignments are found using
    // reviewerId = logged-in HOD.
    // ==================================================

    const query = {
      reviewerId: hodId,
    };


    // ==================================================
    // STATUS FILTER
    // ==================================================

    if (statusFilter === "submitted") {

      query.status = {
        $in: [
          "submitted",
          "forwarded",
        ],
      };

    } else if (statusFilter === "reviewed") {

      query.status = {
        $in: [
          "approved",
          "rejected",
        ],
      };

    } else if (statusFilter === "rejected") {

      query.status = "rejected";

    } else if (statusFilter === "forwarded") {

      query.status = "forwarded";
    }


    // ==================================================
    // SEARCH BY TITLE
    // ==================================================

    if (search) {

      query.title = {
        $regex: search,
        $options: "i",
      };

    }


    // ==================================================
    // SORT
    // ==================================================

    let sort = {
      createdAt: -1,
    };

    if (sortBy === "oldest") {

      sort = {
        createdAt: 1,
      };

    }

    if (sortBy === "title") {

      sort = {
        title: 1,
      };

    }


    // ==================================================
    // GET ASSIGNMENTS
    // ==================================================

    const assignments = await Assignment.find(query)
      .populate(
        "studentId",
        "name email department"
      )
      .populate(
        "reviewerId",
        "name email department role"
      )
      .populate(
        "history.reviewerId",
        "name email department role"
      )
      .sort(sort)
      .lean();


    console.log(
      "HOD ASSIGNMENTS FOUND:",
      assignments.length
    );


    assignments.forEach((assignment) => {

      console.log({
        id: assignment._id,
        title: assignment.title,
        status: assignment.status,
        student: assignment.studentId?.name,
        professor: assignment.reviewerId?.name,
        reviewerId:
          assignment.reviewerId?._id,
      });

    });


    // ==================================================
    // COUNTS
    //
    // IMPORTANT:
    // Counts are based on ALL assignments belonging
    // to this HOD, not only the currently filtered list.
    // ==================================================

    const baseQuery = {
      reviewerId: hodId,
    };


    const [
      pending,
      reviewed,
      rejected,
      total,
      unreadNotifications,
    ] = await Promise.all([

      Assignment.countDocuments({
        ...baseQuery,
        status: {
          $in: [
            "submitted",
            "forwarded",
          ],
        },
      }),

      Assignment.countDocuments({
        ...baseQuery,
        status: {
          $in: [
            "approved",
            "rejected",
          ],
        },
      }),

      Assignment.countDocuments({
        ...baseQuery,
        status: "rejected",
      }),

      Assignment.countDocuments(
        baseQuery
      ),

      Notification.countDocuments({
        userId: hodId,
        read: false,
      }),

    ]);


    // ==================================================
    // FORMAT RESPONSE
    // ==================================================

    const formattedAssignments =
      assignments.map((assignment) => {

        return {

          ...assignment,

          student: {
            id:
              assignment.studentId?._id ||
              null,

            name:
              assignment.studentId?.name ||
              "Unknown Student",

            email:
              assignment.studentId?.email ||
              "—",

            department:
              assignment.studentId?.department ||
              "—",
          },


          professor: {
            id:
              assignment.reviewerId?._id ||
              null,

            name:
              assignment.reviewerId?.name ||
              "Unknown Professor",

            email:
              assignment.reviewerId?.email ||
              "—",

            department:
              assignment.reviewerId?.department ||
              "—",
          },

        };

      });


    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return res.status(200).json({

      success: true,

      assignments:
        formattedAssignments,

      counts: {

        pending,

        reviewed,

        rejected,

        total,

      },

      unreadNotifications,

    });


  } catch (error) {

    console.error(
      "HOD DASHBOARD ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        error.message ||
        "Unable to load HOD dashboard",

    });

  }
};


// ======================================================
// HOD SINGLE ASSIGNMENT
// ======================================================

export const hodAssignmentApi = async (
  req,
  res
) => {

  try {

    const hodId = getUserId(req);

    if (!hodId) {

      return res.status(401).json({
        error: "Not authenticated",
      });

    }


    const assignment =
      await Assignment.findOne({

        _id: req.params.id,

        reviewerId: hodId,

      })
        .populate(
          "studentId",
          "name email department"
        )
        .populate(
          "reviewerId",
          "name email department role"
        )
        .populate(
          "history.reviewerId",
          "name email department role"
        )
        .lean();


    if (!assignment) {

      return res.status(404).json({
        error:
          "Assignment not found",
      });

    }


    return res.status(200).json({

      success: true,

      assignment,

    });


  } catch (error) {

    console.error(
      "HOD ASSIGNMENT API ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Unable to load assignment",

    });

  }

};


// ======================================================
// HOD NOTIFICATIONS
// ======================================================

export const hodNotificationsApi = async (
  req,
  res
) => {

  try {

    const hodId = getUserId(req);


    const notifications =
      await Notification.find({
        userId: hodId,
      })
        .populate(
          "assignmentId",
          "title status"
        )
        .populate(
          "sender",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .lean();


    return res.status(200).json({

      success: true,

      notifications,

    });


  } catch (error) {

    console.error(
      "HOD NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Unable to load notifications",

    });

  }

};


// ======================================================
// MARK ONE NOTIFICATION READ
// ======================================================

export const markHodNotificationApi = async (
  req,
  res
) => {

  try {

    const hodId = getUserId(req);


    await Notification.updateOne(

      {
        _id: req.params.id,

        userId: hodId,
      },

      {
        $set: {
          read: true,
        },
      }

    );


    return res.status(200).json({

      success: true,

    });


  } catch (error) {

    console.error(
      "MARK HOD NOTIFICATION ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Unable to mark notification",

    });

  }

};


// ======================================================
// MARK ALL HOD NOTIFICATIONS READ
// ======================================================

export const markAllHodNotificationsApi = async (
  req,
  res
) => {

  try {

    const hodId = getUserId(req);


    await Notification.updateMany(

      {
        userId: hodId,

        read: false,
      },

      {
        $set: {
          read: true,
        },
      }

    );


    return res.status(200).json({

      success: true,

    });


  } catch (error) {

    console.error(
      "MARK ALL HOD NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({

      error:
        "Unable to mark notifications",

    });

  }

};