import Assignment from "../models/assignment.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

const studentAssignmentQuery = (user) => ({
  $or: [
    // Legacy student uploads are owned directly by the student.
    { studentId: user._id },
    { assignmentType: "department", department: user.department },
    { assignmentType: "students", assignedStudents: user._id },
  ],
});

const assignmentList = async (req) => {
  const query = studentAssignmentQuery(req.user);
  if (req.query.status && req.query.status !== "all") query.status = req.query.status;
  if (req.query.search) query.title = { $regex: req.query.search, $options: "i" };
  const sort = req.query.sort === "oldest" ? { createdAt: 1 } : req.query.sort === "title" ? { title: 1 } : { createdAt: -1 };
  return Assignment.find(query).populate("professorId", "name email department").sort(sort).lean();
};

export const getStudentDashboardApi = async (req, res) => {
  try {
    const assignments = await assignmentList(req);
    const allAssignments = await Assignment.find(studentAssignmentQuery(req.user)).select("status").lean();
    const counts = {
      draft: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      forwarded: 0,
      active: 0,
      closed: 0,
      total: allAssignments.length,
    };
    allAssignments.forEach(({ status }) => { counts[status] = (counts[status] || 0) + 1; });
    const unreadNotifications = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ assignments, counts, unreadNotifications });
  } catch (error) {
    console.error("Student dashboard API error:", error);
    res.status(500).json({ error: "Unable to load your dashboard" });
  }
};

export const getStudentAssignmentsApi = async (req, res) => {
  try { res.json({ assignments: await assignmentList(req) }); }
  catch (error) { res.status(500).json({ error: "Unable to load assignments" }); }
};

export const getStudentAssignmentApi = async (req, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, ...studentAssignmentQuery(req.user) })
      .populate("professorId", "name email department").lean();
    if (!assignment) return res.status(404).json({ error: "Assignment not found" });
    res.json({ assignment });
  } catch (error) { res.status(500).json({ error: "Unable to load assignment" }); }
};

export const getStudentNotificationsApi = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate("assignmentId", "title status").sort({ createdAt: -1 }).limit(20).lean();
    res.json({ notifications });
  } catch (error) { res.status(500).json({ error: "Unable to load notifications" }); }
};

export const markStudentNotificationReadApi = async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { read: true });
  res.json({ success: true });
};

export const markAllStudentNotificationsReadApi = async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ success: true });
};

export const getStudentProfessorsApi = async (req, res) => {
  const professors = await User.find({ role: "professor", department: req.user.department }).select("name email department").lean();
  res.json({ professors });
};

export const submitCompletedAssignmentApi = async (req, res) => {
  try {
    const task = await Assignment.findOne({ _id: req.params.id, ...studentAssignmentQuery(req.user), studentId: { $exists: false } })
      .select("title description category professorId maxMarks dueDate");
    if (!task) return res.status(404).json({ error: "Assigned task not found" });
    if (!req.file) return res.status(400).json({ error: "A completed PDF is required" });
    const uploaded = await uploadBufferToCloudinary(req.file, { folder: "assignflow/submissions", resource_type: "auto" });
    const submission = await Assignment.create({
      title: task.title,
      description: req.body.description || task.description,
      category: task.category,
      fileUrl: uploaded.secure_url || uploaded.url,
      studentId: req.user._id,
      reviewerId: task.professorId,
      parentAssignmentId: task._id,
      maxMarks: task.maxMarks,
      dueDate: task.dueDate,
      status: "submitted",
      history: [{ action: "submitted", remark: "Completed assignment uploaded", date: new Date() }],
    });
    await Notification.create({ userId: task.professorId, assignmentId: submission._id, sender: req.user._id, type: "submission", message: `${req.user.name} submitted completed work for "${task.title}".`, read: false });
    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error("Completed assignment upload error:", error);
    res.status(500).json({ error: "Unable to upload the completed assignment" });
  }
};
