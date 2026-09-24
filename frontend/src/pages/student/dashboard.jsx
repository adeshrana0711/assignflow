import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, date, statusLabel } from "./studentApi.js";
import { AssignmentTable } from "./AssignmentTable.jsx";

export function StudentDashboard() {

  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");


  // ------------------------------------------------------
  // LOAD DASHBOARD
  // ------------------------------------------------------

  useEffect(() => {

    let mounted = true;

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        const result =
          await api(
            "/api/student/dashboard"
          );

        if (mounted) {
          setData(result);
        }

      } catch (error) {

        console.error(
          "Student dashboard error:",
          error
        );

        if (mounted) {

          setError(
            error.message ||
              "Unable to load dashboard."
          );
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    };


    loadDashboard();


    return () => {
      mounted = false;
    };

  }, []);


  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------

  if (loading) {

    return (
      <div className="student-dashboard-page">

        <div className="student-loading-card">

          <div className="student-spinner"></div>

          <p>
            Loading your dashboard...
          </p>

        </div>

      </div>
    );
  }


  // ------------------------------------------------------
  // ERROR
  // ------------------------------------------------------

  if (error) {

    return (
      <div className="student-dashboard-page">

        <div className="student-api-error-card">

          <h2>
            Unable to load dashboard
          </h2>

          <p>
            {error}
          </p>


          <button
            type="button"
            className="primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  if (!data) {

    return (
      <div className="student-dashboard-page">

        <div className="student-api-error-card">

          <h2>
            No dashboard data
          </h2>

          <p>
            The server did not return
            dashboard data.
          </p>

        </div>

      </div>
    );
  }


  const assignments =
    Array.isArray(data.assignments)
      ? data.assignments
      : [];


  const counts =
    data.counts || {};


  // ------------------------------------------------------
  // FILTER
  // ------------------------------------------------------

  const filteredAssignments =
    assignments.filter(
      (assignment) => {

        const query =
          search.trim().toLowerCase();


        const title =
          assignment.title
            ?.toLowerCase() || "";


        const category =
          assignment.category
            ?.toLowerCase() || "";


        const professor =
          assignment.professorId
            ?.name
            ?.toLowerCase() || "";


        const matchesSearch =
          !query ||
          title.includes(query) ||
          category.includes(query) ||
          professor.includes(query);


        const matchesStatus =
          statusFilter === "all" ||
          assignment.status ===
            statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );


  return (
    <div className="student-dashboard-page">

      {/* ==================================================
          HEADER
         ================================================== */}

      <section className="student-dashboard-header">

        <div>

          <h1>
            Student Dashboard
          </h1>

          <p>
            View your assignments, submit your
            work and track your review status.
          </p>

        </div>


        <Link
          className="student-create-button"
          to="/student/assignments/upload"
        >
          + Upload Assignment
        </Link>

      </section>


      {/* ==================================================
          STATISTICS
         ================================================== */}

      <section className="student-dashboard-stats">

        <article
          className="student-stat-card pending-card"
        >

          <span>
            Pending Submission
          </span>

          <strong>
            {counts.draft || 0}
          </strong>

        </article>


        <article
          className="student-stat-card review-card"
        >

          <span>
            Under Review
          </span>

          <strong>
            {counts.submitted || 0}
          </strong>

        </article>


        <article
          className="student-stat-card approved-card"
        >

          <span>
            Approved
          </span>

          <strong>
            {counts.approved || 0}
          </strong>

        </article>


        <article
          className="student-stat-card forwarded-card"
        >

          <span>
            Forwarded
          </span>

          <strong>
            {counts.forwarded || 0}
          </strong>

        </article>


        <article
          className="student-stat-card rejected-card"
        >

          <span>
            Rejected
          </span>

          <strong>
            {counts.rejected || 0}
          </strong>

        </article>

      </section>


      {/* ==================================================
          SEARCH + FILTER
         ================================================== */}

      <section className="student-dashboard-filters">

        <input
          type="text"
          placeholder="Search assignment or professor..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Open
          </option>

          <option value="submitted">
            Pending Review
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="forwarded">
            Forwarded
          </option>

          <option value="rejected">
            Rejected
          </option>

          <option value="closed">
            Closed
          </option>

        </select>

      </section>


      {/* ==================================================
          ASSIGNMENT TABLE
         ================================================== */}

      <section className="student-dashboard-table-card">

        <table>

          <thead>

            <tr>

              <th>
                Assignment
              </th>

              <th>
                Professor
              </th>

              <th>
                Category
              </th>

              <th>
                Status
              </th>

              <th>
                Due Date
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredAssignments.length > 0 ? (

              filteredAssignments.map(
                (assignment) => {

                  const professor =
                    assignment.professorId ||
                    assignment.reviewerId ||
                    {};


                  return (
                    <tr
                      key={assignment._id}
                    >

                      {/* ASSIGNMENT */}

                      <td>

                        <div className="student-assignment-name">

                          <strong>
                            {assignment.title ||
                              "Untitled Assignment"}
                          </strong>


                          {assignment.description && (

                            <small>

                              {assignment.description
                                .length > 45
                                ? assignment.description.substring(
                                    0,
                                    45
                                  ) + "..."
                                : assignment.description}

                            </small>

                          )}

                        </div>

                      </td>


                      {/* PROFESSOR */}

                      <td>

                        <div className="student-professor-name">

                          <strong>
                            {professor.name ||
                              "Not assigned"}
                          </strong>


                          {professor.email && (

                            <small>
                              {professor.email}
                            </small>

                          )}

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td>
                        {assignment.category ||
                          "Assignment"}
                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`student-dashboard-status ${
                            assignment.status ||
                            "unknown"
                          }`}
                        >

                          {statusLabel(
                            assignment.status
                          )}

                        </span>

                      </td>


                      {/* DUE DATE */}

                      <td>
                        {date(
                          assignment.dueDate
                        )}
                      </td>


                      {/* ACTION */}

                      <td>

                        <Link
                          className="student-dashboard-action"
                          to={`/student/assignments/${assignment._id}`}
                        >
                          View
                        </Link>

                      </td>

                    </tr>
                  );

                }
              )

            ) : (

              <tr>

                <td
                  colSpan="6"
                  className="student-dashboard-empty"
                >

                  <div>

                    <h3>
                      No assignments found
                    </h3>

                    <p>
                      Try changing your search
                      or status filter.
                    </p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </section>


      {/* ==================================================
          FOOTER
         ================================================== */}

      <div className="student-dashboard-footer">

        <div className="student-dashboard-footer-count">
          Showing{" "}
          <strong>{filteredAssignments.length}</strong>{" "}
          assignment
          {filteredAssignments.length !== 1 ? "s" : ""}
        </div>

        <Link
          to="/student/assignments"
          className="student-dashboard-footer-link"
        >
          View All Assignments →
        </Link>

      </div>

    </div>
  );
}


