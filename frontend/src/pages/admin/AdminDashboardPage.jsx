import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    departmentCount: 0,
    userCount: 0,
    studentCount: 0,
    professorCount: 0,
    hodCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==================================================
  // FETCH DASHBOARD STATS
  // ==================================================

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/admin/dashboard/stats",
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        // ------------------------------------------
        // Read response safely
        // ------------------------------------------

        const contentType =
          response.headers.get("content-type") || "";

        const isJson =
          contentType.includes("application/json");

        let data = null;

        if (isJson) {
          data = await response.json();
        } else {
          const text = await response.text();

          console.error(
            "Dashboard API returned non-JSON response:",
            text.substring(0, 500)
          );

          throw new Error(
            `Dashboard API returned ${response.status} ${response.statusText} instead of JSON.`
          );
        }

        // ------------------------------------------
        // Handle HTTP errors
        // ------------------------------------------

        if (!response.ok) {
          const message =
            typeof data?.message === "string"
              ? data.message
              : typeof data?.error === "string"
                ? data.error
                : "Unable to load dashboard statistics.";

          throw new Error(message);
        }

        // ------------------------------------------
        // Validate response
        // ------------------------------------------

        if (!data || typeof data !== "object") {
          throw new Error(
            "Invalid dashboard response received."
          );
        }

        if (mounted) {
          setStats({
            departmentCount:
              Number(data.departmentCount) || 0,

            userCount:
              Number(data.userCount) || 0,

            studentCount:
              Number(data.studentCount) || 0,

            professorCount:
              Number(data.professorCount) || 0,

            hodCount:
              Number(data.hodCount) || 0,
          });
        }
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err
        );

        if (mounted) {
          setError(
            err?.message ||
              "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  // ==================================================
  // STAT CARDS
  // ==================================================

  const statCards = useMemo(
    () => [
      {
        label: "Total Departments",
        value: stats.departmentCount,
        icon: "🏛",
        description: "Academic departments",
        status: "Active",
        statusClass: "status-positive",
        color: "indigo",
      },

      {
        label: "Total Users",
        value: stats.userCount,
        icon: "👥",
        description: "Registered users",
        status: "Registered",
        statusClass: "status-neutral",
        color: "green",
      },

      {
        label: "Total Students",
        value: stats.studentCount,
        icon: "🎓",
        description: "Enrolled students",
        status: "Students",
        statusClass: "status-blue",
        color: "blue",
      },

      {
        label: "Total Professors",
        value: stats.professorCount,
        icon: "🧑‍🏫",
        description: "Faculty members",
        status: "Faculty",
        statusClass: "status-amber",
        color: "amber",
      },

      {
        label: "Total HODs",
        value: stats.hodCount,
        icon: "⭐",
        description: "Department leadership",
        status: "Leadership",
        statusClass: "status-purple",
        color: "purple",
      },
    ],
    [stats]
  );

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="admin-dashboard-page">

      {/* ==================================================
          HEADER
         ================================================== */}

      <section className="admin-dashboard-hero">

        <div className="admin-hero-content">

          <div className="admin-title-wrap">

            <span className="admin-eyebrow">
              ADMINISTRATION
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage users, departments and
              institutional activity from one
              central workspace.
            </p>

          </div>

          <Link
            to="/admin/users/add"
            className="admin-primary-button"
          >
            <span className="admin-button-icon">
              +
            </span>

            Add User
          </Link>

        </div>

      </section>


      {/* ==================================================
          STATISTICS
         ================================================== */}

      <section className="admin-stats-section">

        <div className="admin-section-heading">

          <div>

            <span className="admin-section-label">
              OVERVIEW
            </span>

            <h2>
              Institution Summary
            </h2>

          </div>

          {!loading && !error && (
            <span className="admin-live-status">

              <span className="admin-live-dot" />

              Data updated

            </span>
          )}

        </div>


        {/* ==================================================
            LOADING
           ================================================== */}

        {loading && (

          <div className="admin-loading-grid">

            {[1, 2, 3, 4, 5].map(
              (item) => (

                <div
                  key={item}
                  className="admin-stat-skeleton"
                >

                  <div />

                  <span />

                  <span />

                </div>
              )
            )}

          </div>
        )}


        {/* ==================================================
            ERROR
           ================================================== */}

        {!loading && error && (

          <div className="admin-error-card">

            <div className="admin-error-icon">
              !
            </div>

            <div>

              <h3>
                Unable to load statistics
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="admin-primary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          </div>
        )}


        {/* ==================================================
            STAT CARDS
           ================================================== */}

        {!loading && !error && (

          <div className="admin-stats-grid">

            {statCards.map(
              (stat) => (

                <article
                  key={stat.label}
                  className={`admin-stat-card admin-stat-${stat.color}`}
                >

                  <div className="admin-stat-top">

                    <div className="admin-stat-icon">
                      {stat.icon}
                    </div>

                    <span
                      className={`admin-status ${stat.statusClass}`}
                    >
                      {stat.status}
                    </span>

                  </div>


                  <div className="admin-stat-content">

                    <span className="admin-stat-label">
                      {stat.label}
                    </span>

                    <strong className="admin-stat-value">
                      {stat.value}
                    </strong>

                    <span className="admin-stat-description">
                      {stat.description}
                    </span>

                  </div>

                </article>

              )
            )}

          </div>
        )}

      </section>


      {/* ==================================================
          QUICK ACTIONS
         ================================================== */}

      <section className="admin-actions-section">

        <div className="admin-section-heading">

          <div>

            <span className="admin-section-label">
              MANAGEMENT
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>

        </div>


        <div className="admin-actions-grid">

          {/* ADD USER */}

          <Link
            to="/admin/users/add"
            className="admin-action-card"
          >

            <div className="admin-action-icon admin-action-blue">
              +
            </div>

            <div className="admin-action-content">

              <h3>
                Add User
              </h3>

              <p>
                Create a new student,
                professor or administrator
                account.
              </p>

              <span className="admin-action-link">
                Create account →
              </span>

            </div>

          </Link>


          {/* DEPARTMENTS */}

          <Link
            to="/admin/departments"
            className="admin-action-card"
          >

            <div className="admin-action-icon admin-action-green">
              🏛
            </div>

            <div className="admin-action-content">

              <h3>
                Manage Departments
              </h3>

              <p>
                View, create and manage
                academic departments.
              </p>

              <span className="admin-action-link">
                View departments →
              </span>

            </div>

          </Link>


          {/* USERS */}

          <Link
            to="/admin/users"
            className="admin-action-card"
          >

            <div className="admin-action-icon admin-action-purple">
              👥
            </div>

            <div className="admin-action-content">

              <h3>
                Manage Users
              </h3>

              <p>
                Review registered users
                and manage their accounts.
              </p>

              <span className="admin-action-link">
                View users →
              </span>

            </div>

          </Link>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboardPage;