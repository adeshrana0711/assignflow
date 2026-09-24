import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./studentApi.js";

export function StudentLayout({ children }) {

  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);


  // ------------------------------------------------------
  // LOAD NOTIFICATION COUNT
  // ------------------------------------------------------

  useEffect(() => {

    let mounted = true;

    const loadUnread = async () => {

      try {

        const data =
          await api("/api/student/dashboard");

        if (mounted) {
          setUnread(
            data.unreadNotifications || 0
          );
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

      await fetch(
        "/auth/logout",
        {
          method: "GET",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    } finally {

      navigate("/login");
    }
  };


  return (
    <div className="student-layout">

      {/* ==================================================
          STUDENT NAVBAR
         ================================================== */}

      <header className="student-nav">

        <div className="student-nav-left">

          <Link
            className="student-brand"
            to="/student/dashboard"
          >
            AssignFlow
          </Link>

          <span className="student-portal-title">
            Student Portal
          </span>

        </div>


        <nav className="student-nav-links">

          <Link to="/student/dashboard">
            Dashboard
          </Link>

          <Link to="/student/assignments">
            My Assignments
          </Link>

          <Link to="/student/assignments/upload">
            Upload
          </Link>

          <Link to="/student/bulk-upload">
            Bulk Upload
          </Link>

          <Link to="/student/notifications">

            Notifications

            {unread > 0 && (
              <b className="student-notification-count">
                {unread}
              </b>
            )}

          </Link>


          <button
            type="button"
            onClick={logout}
            className="student-logout"
          >
            Logout
          </button>

        </nav>

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


