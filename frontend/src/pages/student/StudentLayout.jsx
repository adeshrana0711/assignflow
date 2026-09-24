import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "./studentApi.js";

export default function StudentLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [unread, setUnread] = useState(0);

  // ------------------------------------------------------
  // LOAD NOTIFICATION COUNT
  // ------------------------------------------------------

  useEffect(() => {
    let mounted = true;

    const loadUnread = async () => {
      try {
        const data = await api("/api/student/dashboard");

        if (mounted) {
          setUnread(data.unreadNotifications || 0);
        }
      } catch (error) {
        console.error(
          "Unable to load notification count:",
          error
        );
      }
    };

    loadUnread();

    return () => {
      mounted = false;
    };
  }, []);

  // ------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------

  const logout = async () => {
    try {
      await fetch("/auth/logout", {
        method: "GET",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/login");
    }
  };

  // ------------------------------------------------------
  // NAVIGATION
  // ------------------------------------------------------

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="student-layout">

      {/* ==================================================
          STUDENT NAVBAR
         ================================================== */}

      <header className="student-nav">

        {/* LEFT BRAND */}
        <Link
          className="student-brand"
          to="/student/dashboard"
        >

          <div className="student-brand-logo">
            <span>AF</span>
          </div>

          <div className="student-brand-info">

            <span className="student-brand-name">
              AssignFlow
            </span>

            <span className="student-portal-title">
              Student Portal
            </span>

          </div>

        </Link>


        {/* RIGHT NAVIGATION */}

        <div className="student-nav-right">

          <nav className="student-nav-links">

            <Link
              to="/student/dashboard"
              className={
                isActive("/student/dashboard")
                  ? "active"
                  : ""
              }
            >
              Dashboard
            </Link>


            <Link
              to="/student/assignments"
              className={
                isActive("/student/assignments")
                  ? "active"
                  : ""
              }
            >
              My Assignments
            </Link>


            <Link
              to="/student/assignments/upload"
              className={
                isActive("/student/assignments/upload")
                  ? "active"
                  : ""
              }
            >
              Upload
            </Link>


            <Link
              to="/student/bulk-upload"
              className={
                isActive("/student/bulk-upload")
                  ? "active"
                  : ""
              }
            >
              Bulk Upload
            </Link>


            <Link
              to="/student/notifications"
              className={
                isActive("/student/notifications")
                  ? "active"
                  : ""
              }
            >
              <span className="student-notification-link">
                Notifications

                {unread > 0 && (
                  <b className="student-notification-count">
                    {unread}
                  </b>
                )}
              </span>
            </Link>

          </nav>


          {/* LOGOUT */}

          <button
            type="button"
            onClick={logout}
            className="student-logout"
          >
            Logout
          </button>

        </div>

      </header>


      {/* ==================================================
          PAGE CONTENT
         ================================================== */}

      <main className="student-content">
        {children}
      </main>

    </div>
  );
}