import Assignment from "../models/assignment.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Department from "../models/department.model.js";

const queue = (user) => ({ $or: [{ reviewerId: user._id }, { "history.reviewerId": user._id }], status: { $ne: "draft" } });

export const getProfessorDashboardApi = async (req, res) => {
  try {
    const query = queue(req.user);
    if (req.query.status && req.query.status !== "all") query.status = req.query.status;
    if (req.query.search) {
      const students = await User.find({ name: { $regex: req.query.search, $options: "i" } }).select("_id");
      query.$or = [{ title: { $regex: req.query.search, $options: "i" } }, { studentId: { $in: students.map((student) => student._id) } }];
    }
    const sort = req.query.sort === "oldest" ? { createdAt: 1 } : req.query.sort === "title" ? { title: 1 } : { createdAt: -1 };
    const assignments = await Assignment.find(query).populate("studentId", "name email department").sort(sort).lean();
    const count = (status) => Assignment.countDocuments({ reviewerId: req.user._id, status });
    const [pending, approved, rejected, forwarded, unreadNotifications] = await Promise.all([count("submitted"), count("approved"), count("rejected"), count("forwarded"), Notification.countDocuments({ userId: req.user._id, read: false })]);
    res.json({ assignments, counts: { pending, approved, rejected, forwarded, totalReviewed: approved + rejected + forwarded }, unreadNotifications });
  } catch (error) { console.error("Professor dashboard API error:", error); res.status(500).json({ error: "Unable to load dashboard" }); }
};

export const getProfessorAssignmentApi = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, ...queue(req.user) }).populate("studentId", "name email department").populate("reviewerId", "name department").populate("history.reviewerId", "name department").lean();
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json({ assignment });
  } catch (error) { res.status(500).json({ error: "Unable to load assignment" }); }
};

export const getProfessorNotificationsApi = async (req, res) => {
  try { const notifications = await Notification.find({ userId: req.user._id }).populate("assignmentId", "title status").sort({ createdAt: -1 }).limit(20).lean(); res.json({ notifications }); }
  catch (error) { res.status(500).json({ error: "Unable to load notifications" }); }
};
export const markProfessorNotificationApi = async (req, res) => { await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { read: true }); res.json({ success: true }); };
export const markAllProfessorNotificationsApi = async (req, res) => { await Notification.updateMany({ userId: req.user._id, read: false }, { read: true }); res.json({ success: true }); };

export const getProfessorDepartmentsApi = async (req, res) => {
  try {
    if (!req.user.department) return res.json({ departments: [] });
    const departments = await Department.find({ name: req.user.department })
      .select("name programType address")
      .lean();
    // Existing users may predate Department records; their assigned department
    // must still be available in the professor assignment form.
    res.json({ departments: departments.length ? departments : [{ _id: req.user.department, name: req.user.department }] });
  } catch (error) {
    res.status(500).json({ error: "Unable to load your department" });
  }
};

export const getProfessorStudentsApi = async (req, res) => {
  try {
    const students = await User.find({ role: "student", department: req.user.department })
      .select("name email department")
      .sort({ name: 1 })
      .lean();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: "Unable to load students" });
  }
};
