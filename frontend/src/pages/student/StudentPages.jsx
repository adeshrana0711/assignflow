import { Routes, Route } from "react-router-dom";

import { StudentLayout } from "./StudentLayout.jsx";
import { StudentDashboard } from "./dashboard.jsx";
import { StudentAssignments } from "./my-assignments.jsx";
import { StudentAssignmentDetails } from "./details.jsx";
import { StudentNotifications } from "./notifications.jsx";
import UploadSingle from "./upload-single.jsx";
import BulkUpload from "./bulk-upload.jsx";

export default function StudentRoutes() {
  return (
    <Routes>
      <Route
        path="/student/dashboard"
        element={
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        }
      />

      <Route
        path="/student/assignments"
        element={
          <StudentLayout>
            <StudentAssignments />
          </StudentLayout>
        }
      />

      <Route
        path="/student/assignments/upload"
        element={
          <StudentLayout>
            <UploadSingle />
          </StudentLayout>
        }
      />

      <Route
        path="/student/bulk-upload"
        element={
          <StudentLayout>
            <BulkUpload />
          </StudentLayout>
        }
      />

      <Route
        path="/student/assignments/:id"
        element={
          <StudentLayout>
            <StudentAssignmentDetails />
          </StudentLayout>
        }
      />

      <Route
        path="/student/notifications"
        element={
          <StudentLayout>
            <StudentNotifications />
          </StudentLayout>
        }
      />
    </Routes>
  );
}
