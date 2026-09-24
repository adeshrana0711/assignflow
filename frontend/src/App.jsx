import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "./App.css";

// ======================================================
// ADMIN PAGES
// ======================================================

import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import DepartmentsPage from "./pages/admin/DepartmentsPage";
import AddDepartmentPage from "./pages/admin/AddDepartmentPage";
import EditDepartmentPage from "./pages/admin/EditDepartmentPage";

import UsersPage from "./pages/admin/UsersPage";
import AddUserPage from "./pages/admin/AddUserPage";
import EditUserPage from "./pages/admin/EditUserPage";

// ======================================================
// ADMIN CSS
// ======================================================

import "./pages/admin/css/AdminDashboard.css";
import "./pages/admin/css/LoginPage.css";

// ======================================================
// PROFESSOR
// ======================================================

import CreateAssignment from "./pages/professor/CreateAssignment";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorAssignment from "./pages/professor/ProfessorAssignment";
import ProfessorNotifications from "./pages/professor/ProfessorNotifications";
import VerifyOtp from "./pages/professor/VerifyOtp";

// ======================================================
// PROFESSOR CSS
// ======================================================

import "./pages/professor/CreateAssignment.css";
import "./pages/professor/ProfessorPages.css";

// ======================================================
// HOD
// ======================================================

import HodDashboard from "./pages/hod/HodDashboard";
import HodAssignment from "./pages/hod/HodAssignment";
import HodNotifications from "./pages/hod/HodNotifications";

// ======================================================
// HOD CSS
// ======================================================

import "./pages/hod/HodPages.css";

// ======================================================
// STUDENT
// ======================================================

// Student components are now separated into individual files

import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/dashboard";
import StudentAssignments from "./pages/student/my-assignments";
import StudentAssignmentDetails from "./pages/student/details";
import StudentNotifications from "./pages/student/notifications";

import UploadSingle from "./pages/student/upload-single";
import BulkUpload from "./pages/student/bulk-upload";

// ======================================================
// STUDENT CSS
// ======================================================

import "./pages/student/StudentPages.css";

// ======================================================
// COMPONENTS
// ======================================================

import Navbar from "./components/Navbar";

// ======================================================
// MAIN APP LAYOUT
// ======================================================

function AppLayout() {
  const location = useLocation();

  // ------------------------------------------------------
  // STUDENT HAS ITS OWN NAVBAR
  // ------------------------------------------------------

  const isStudentPage = location.pathname.startsWith("/student");

  return (
    <div className="app-layout">

      {/* ==================================================
          ADMIN / PROFESSOR / HOD NAVBAR
         ================================================== */}

      {!isStudentPage && <Navbar />}

      <main
        className={
          isStudentPage
            ? "app-content student-app-content"
            : "app-content"
        }
      >

        <Routes>

          {/* ==================================================
              GENERAL DASHBOARD
             ================================================== */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* ==================================================
              ADMIN
             ================================================== */}

          <Route
            path="/admin/dashboard"
            element={<AdminDashboardPage />}
          />

          <Route
            path="/admin/departments"
            element={<DepartmentsPage />}
          />

          <Route
            path="/admin/departments/add"
            element={<AddDepartmentPage />}
          />

          <Route
            path="/admin/departments/edit/:id"
            element={<EditDepartmentPage />}
          />

          <Route
            path="/admin/users"
            element={<UsersPage />}
          />

          <Route
            path="/admin/users/add"
            element={<AddUserPage />}
          />

          <Route
            path="/admin/users/edit/:id"
            element={<EditUserPage />}
          />

          {/* ==================================================
              PROFESSOR
             ================================================== */}

          <Route
            path="/professor/dashboard"
            element={<ProfessorDashboard />}
          />

          <Route
            path="/professor/create-assignment"
            element={<CreateAssignment />}
          />

          <Route
            path="/professor/review/:id"
            element={<ProfessorAssignment review />}
          />

          <Route
            path="/professor/details/:id"
            element={<ProfessorAssignment />}
          />

          <Route
            path="/professor/notifications"
            element={<ProfessorNotifications />}
          />

          <Route
            path="/professor/verify-otp"
            element={<VerifyOtp />}
          />

          {/* ==================================================
              HOD
             ================================================== */}

          <Route
            path="/hod/dashboard"
            element={<HodDashboard />}
          />

          <Route
            path="/hod/review/:id"
            element={<HodAssignment review />}
          />

          <Route
            path="/hod/details/:id"
            element={<HodAssignment />}
          />

          <Route
            path="/hod/notifications"
            element={<HodNotifications />}
          />

          {/* ==================================================
              STUDENT
             ================================================== */}

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

          {/* ==================================================
              SINGLE ASSIGNMENT UPLOAD
             ================================================== */}

          <Route
            path="/student/assignments/upload"
            element={
              <StudentLayout>
                <UploadSingle />
              </StudentLayout>
            }
          />

          {/* ==================================================
              BULK ASSIGNMENT UPLOAD
             ================================================== */}

          <Route
            path="/student/bulk-upload"
            element={
              <StudentLayout>
                <BulkUpload />
              </StudentLayout>
            }
          />

          {/* ==================================================
              ASSIGNMENT DETAILS
             ================================================== */}

          <Route
            path="/student/assignments/:id"
            element={
              <StudentLayout>
                <StudentAssignmentDetails />
              </StudentLayout>
            }
          />

          {/* ==================================================
              STUDENT NOTIFICATIONS
             ================================================== */}

          <Route
            path="/student/notifications"
            element={
              <StudentLayout>
                <StudentNotifications />
              </StudentLayout>
            }
          />

          {/* ==================================================
              UNKNOWN URL
             ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>

      </main>

    </div>
  );
}

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            LOGIN
            Login is completely outside AppLayout
           ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* ==================================================
            ALL OTHER PAGES
           ================================================== */}

        <Route
          path="/*"
          element={<AppLayout />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;