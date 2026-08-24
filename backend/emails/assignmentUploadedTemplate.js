const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const assignmentUploadedTemplate = ({ professorName, student, assignments }) => {
  const assignmentRows = assignments
    .map(
      (assignment) => `
        <div style="margin: 16px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p><strong>Title:</strong> ${escapeHtml(assignment.title)}</p>
          <p><strong>Category:</strong> ${escapeHtml(assignment.category)}</p>
          <p><strong>Description:</strong> ${escapeHtml(assignment.description || "Not provided")}</p>
          <p><strong>File:</strong> <a href="${escapeHtml(assignment.fileUrl)}">Open uploaded file</a></p>
        </div>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: auto; padding: 20px; color: #1f2937;">
      <h2 style="color: #4f46e5;">New assignment upload</h2>
      <p>Hello ${escapeHtml(professorName)},</p>
      <p>A student has uploaded ${assignments.length === 1 ? "an assignment" : `${assignments.length} assignments`} for you.</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
        <p><strong>Student:</strong> ${escapeHtml(student.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(student.email)}</p>
        <p><strong>Department:</strong> ${escapeHtml(student.department || "Not provided")}</p>
      </div>
      ${assignmentRows}
      <p>Please sign in to AssignFlow to review the upload.</p>
    </div>`;
};
