import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import "./StudentPages.css";


// ======================================================
// API HELPER
// ======================================================
const api = async (path, options = {}) => {
  const response = await fetch(path, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType =
    response.headers.get("content-type");

  let body = {};

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    body = await response.json();
  } else {
    const text = await response.text();

    if (text) {
      body = {
        error: text,
      };
    }
  }

  if (!response.ok) {
    throw new Error(
      body.error || "Something went wrong"
    );
  }

  return body;
};


// ======================================================
// DATE FORMATTER
// ======================================================
const date = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


// ======================================================
// DATE + TIME FORMATTER
// ======================================================
const dateTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
};


// ======================================================
// STATUS LABEL
// ======================================================
const statusLabel = (status) => {
  switch (status) {
    case "draft":
      return "Draft";

    case "active":
      return "Open";

    case "closed":
      return "Closed";

    case "submitted":
      return "Submitted";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    case "forwarded":
      return "Forwarded to HOD";

    default:
      return status || "Unknown";
  }
};


// ======================================================
// STUDENT LAYOUT
// ======================================================
export function StudentLayout({ children }) {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api("/api/student/dashboard")
      .then((data) => {
        setUnread(data.unreadNotifications || 0);
      })
      .catch(() => {});
  }, []);

  const logout = async () => {
    try {
      await fetch("/auth/logout", {
        credentials: "include",
      });
    } finally {
      navigate("/login");
    }
  };

  return (
    <div className="student-layout">

      {/* ================= NAVBAR ================= */}
      <header className="student-nav">

        {/* LEFT SIDE */}
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

        {/* RIGHT SIDE */}
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

      {/* ================= PAGE CONTENT ================= */}
      <main className="student-content">
        {children}
      </main>

    </div>
  );
}


// ======================================================
// ASSIGNMENT TABLE
// ======================================================
function AssignmentTable({
  assignments = [],
}) {
  if (!assignments.length) {
    return (
      <p className="empty-state-card">
        No assignments found.
      </p>
    );
  }

  return (
    <div className="table-card">

      <table>

        <thead>

          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Professor</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

        </thead>


        <tbody>

          {assignments.map((item) => {

            const professor =
              item.professorId ||
              item.reviewerId ||
              {};

            return (
              <tr key={item._id}>

                {/* TITLE */}
                <td>
                  <strong>
                    {item.title ||
                      "Untitled Assignment"}
                  </strong>
                </td>


                {/* CATEGORY */}
                <td>
                  {item.category ||
                    "Assignment"}
                </td>


                {/* PROFESSOR */}
                <td>
                  {professor.name ||
                    "Not assigned"}
                </td>


                {/* DUE DATE */}
                <td>
                  {date(item.dueDate)}
                </td>


                {/* STATUS */}
                <td>

                  <span
                    className={`student-status ${
                      item.status || "unknown"
                    }`}
                  >
                    {statusLabel(
                      item.status
                    )}
                  </span>

                </td>


                {/* ACTION */}
                <td>

                  <Link
                    className="student-action"
                    to={`/student/assignments/${item._id}`}
                  >
                    View
                  </Link>

                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}


// ======================================================
// STUDENT DASHBOARD
// ======================================================
export function StudentDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    api("/api/student/dashboard")
      .then(setData)
      .catch((error) => {
        setError(
          error.message ||
            "Unable to load dashboard."
        );
      });
  }, []);

  if (error) {
    return (
      <div className="student-dashboard-page">
        <p className="api-error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="student-dashboard-page">
        <p className="api-status">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  const assignments = data.assignments || [];
  const counts = data.counts || {};

  // Filter assignments
  const filteredAssignments = assignments.filter(
    (assignment) => {
      const studentSearch =
        search.trim().toLowerCase();

      const matchesSearch =
        !studentSearch ||
        assignment.title
          ?.toLowerCase()
          .includes(studentSearch) ||
        assignment.category
          ?.toLowerCase()
          .includes(studentSearch) ||
        assignment.professorId?.name
          ?.toLowerCase()
          .includes(studentSearch);

      const matchesStatus =
        statusFilter === "all" ||
        assignment.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  return (
    <div className="student-dashboard-page">

      {/* =========================================
          DASHBOARD HEADER
      ========================================== */}
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


      {/* =========================================
          STATISTICS
      ========================================== */}
      <section className="student-dashboard-stats">

        <article className="student-stat-card pending-card">

          <span>
            Pending Submission
          </span>

          <strong>
            {counts.draft || 0}
          </strong>

        </article>


        <article className="student-stat-card review-card">

          <span>
            Under Review
          </span>

          <strong>
            {counts.submitted || 0}
          </strong>

        </article>


        <article className="student-stat-card approved-card">

          <span>
            Approved
          </span>

          <strong>
            {counts.approved || 0}
          </strong>

        </article>


        <article className="student-stat-card forwarded-card">

          <span>
            Forwarded
          </span>

          <strong>
            {counts.forwarded || 0}
          </strong>

        </article>


        <article className="student-stat-card rejected-card">

          <span>
            Rejected
          </span>

          <strong>
            {counts.rejected || 0}
          </strong>

        </article>

      </section>


      {/* =========================================
          SEARCH + FILTER
      ========================================== */}
      <section className="student-dashboard-filters">

        <input
          type="text"
          placeholder="Search assignment or professor..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
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


      {/* =========================================
          ASSIGNMENT TABLE
      ========================================== */}
      <section className="student-dashboard-table-card">

        <table>

          <thead>

            <tr>
              <th>Assignment</th>
              <th>Professor</th>
              <th>Category</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Action</th>
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


      {/* =========================================
          FOOTER
      ========================================== */}
      <div className="student-dashboard-footer">

        <span>
          Showing{" "}
          <strong>
            {filteredAssignments.length}
          </strong>{" "}
          assignment
          {filteredAssignments.length !== 1
            ? "s"
            : ""}
        </span>

        <Link
          to="/student/assignments"
          className="student-view-all"
        >
          View All Assignments →
        </Link>

      </div>

    </div>
  );
}


// ======================================================
// STUDENT ASSIGNMENTS
// ======================================================
export function StudentAssignments() {

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [assignments, setAssignments] =
    useState([]);

  const [error, setError] =
    useState("");

  const status =
    searchParams.get("status") ||
    "all";

  const search =
    searchParams.get("search") ||
    "";


  // ====================================================
  // LOAD ASSIGNMENTS
  // ====================================================
  useEffect(() => {

    const loadAssignments = async () => {

      try {

        setError("");

        const data = await api(
          `/api/student/assignments?${searchParams.toString()}`
        );

        setAssignments(
          data.assignments || []
        );

      } catch (error) {

        setError(
          error.message ||
            "Unable to load assignments."
        );

      }

    };

    loadAssignments();

  }, [searchParams]);


  // ====================================================
  // SEARCH
  // ====================================================
  const handleSearch = (event) => {

    setSearchParams({
      status,
      search: event.target.value,
    });

  };


  // ====================================================
  // STATUS
  // ====================================================
  const handleStatus = (event) => {

    setSearchParams({
      status: event.target.value,
      search,
    });

  };


  return (
    <>

      {/* HEADER */}
      <section className="student-heading">

        <div>

          <h1>
            My Assignments
          </h1>

          <p>
            View assignments given by your
            professors and submit your work.
          </p>

        </div>

      </section>


      {/* FILTERS */}
      <form
        className="student-filters"
        onSubmit={(event) =>
          event.preventDefault()
        }
      >

        <input
          value={search}
          placeholder="Search by title..."
          onChange={handleSearch}
        />


        <select
          value={status}
          onChange={handleStatus}
        >

          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Open
          </option>

          <option value="submitted">
            Submitted
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>

          <option value="forwarded">
            Forwarded to HOD
          </option>

          <option value="closed">
            Closed
          </option>

        </select>

      </form>


      {/* ERROR */}
      {error ? (

        <p className="api-error">
          {error}
        </p>

      ) : (

        <AssignmentTable
          assignments={assignments}
        />

      )}

    </>
  );
}


// ======================================================
// STUDENT ASSIGNMENT DETAILS
// ======================================================
export function StudentAssignmentDetails() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();


  const [assignment, setAssignment] =
    useState(null);

  const [error, setError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);


  // ====================================================
  // LOAD ASSIGNMENT
  // ====================================================
  const loadAssignment = async () => {

    try {

      setError("");

      const data = await api(
        `/api/student/assignments/${id}`
      );

      setAssignment(
        data.assignment
      );

    } catch (error) {

      setError(
        error.message ||
          "Unable to load assignment."
      );

    }

  };


  useEffect(() => {
    loadAssignment();
  }, [id]);


  // ====================================================
  // LOADING
  // ====================================================
  if (!assignment && !error) {

    return (
      <p className="api-status">
        Loading assignment...
      </p>
    );

  }


  // ====================================================
  // ERROR
  // ====================================================
  if (error && !assignment) {

    return (
      <div>

        <p className="api-error">
          {error}
        </p>

        <Link
          to="/student/assignments"
          className="primary-button"
        >
          Back to Assignments
        </Link>

      </div>
    );

  }


  const professor =
    assignment.professorId ||
    assignment.reviewerId ||
    {};


  // ====================================================
  // CAN STUDENT SUBMIT?
  // ====================================================
  const canSubmit =
    assignment.status === "active" &&
    !assignment.submission;


  // ====================================================
  // SUBMIT COMPLETED ASSIGNMENT
  // ====================================================
  const submitCompletedAssignment =
    async (event) => {

      event.preventDefault();

      setUploading(true);
      setError("");

      try {

        const formData =
          new FormData(
            event.currentTarget
          );


        /*
         * Backend:
         *
         * POST
         * /student/api/assignments/:id/submit-completed
         *
         * FormData:
         * file
         * description
         */

        const result =
          await api(
            `/api/student/assignments/${id}/submit-completed`,
            {
              method: "POST",
              body: formData,
            }
          );


        alert(
          result.message ||
            "Assignment submitted successfully."
        );


        /*
         * Reload assignment so that
         * status changes from:
         *
         * active
         *
         * to:
         *
         * submitted
         */

        await loadAssignment();


        navigate(
          `/student/assignments/${id}`
        );

      } catch (error) {

        setError(
          error.message ||
            "Assignment submission failed."
        );

      } finally {

        setUploading(false);

      }

    };


  return (
    <article className="student-detail">

      {/* =================================================
          BACK
      ================================================= */}
      <Link to="/student/assignments">
        ← Back to Assignments
      </Link>


      {/* =================================================
          HEADER
      ================================================= */}
      <div className="student-detail-header">

        <div>

          <p className="eyebrow">
            {assignment.category ||
              "Assignment"}
          </p>

          <h1>
            {assignment.title}
          </h1>


          <span
            className={`student-status ${
              assignment.status
            }`}
          >
            {statusLabel(
              assignment.status
            )}
          </span>

        </div>

      </div>


      {/* =================================================
          ASSIGNMENT INFORMATION
      ================================================= */}
      <dl>

        <div>

          <dt>
            Professor
          </dt>

          <dd>
            {professor.name ||
              "Not assigned"}
          </dd>

        </div>


        <div>

          <dt>
            Professor Email
          </dt>

          <dd>
            {professor.email ||
              "—"}
          </dd>

        </div>


        <div>

          <dt>
            Due Date
          </dt>

          <dd>
            {date(
              assignment.dueDate
            )}
          </dd>

        </div>


        <div>

          <dt>
            Maximum Marks
          </dt>

          <dd>
            {assignment.maxMarks ??
              "—"}
          </dd>

        </div>


        <div>

          <dt>
            Created
          </dt>

          <dd>
            {dateTime(
              assignment.createdAt
            )}
          </dd>

        </div>


        {assignment.submittedAt && (

          <div>

            <dt>
              Submitted
            </dt>

            <dd>
              {dateTime(
                assignment.submittedAt
              )}
            </dd>

          </div>

        )}

      </dl>


      {/* =================================================
          DESCRIPTION
      ================================================= */}
      <section>

        <h2>
          Assignment Description
        </h2>

        <p>
          {assignment.description ||
            "No description provided."}
        </p>

      </section>


      {/* =================================================
          PROFESSOR'S ASSIGNMENT FILE
      ================================================= */}
      {assignment.fileUrl && (

        <section>

          <h2>
            Assignment File
          </h2>

          <p>
            Download or open the file
            provided by your professor.
          </p>

          <a
            className="primary-button"
            href={assignment.fileUrl}
            target="_blank"
            rel="noreferrer"
          >
            📄 Open Assignment PDF
          </a>

        </section>

      )}


      {/* =================================================
          SUBMIT COMPLETED ASSIGNMENT
      ================================================= */}
      {canSubmit && (

        <form
          className="student-completed-upload"
          onSubmit={
            submitCompletedAssignment
          }
        >

          <h2>
            Submit Completed Assignment
          </h2>

          <p>
            Upload your completed assignment
            as a PDF. It will be sent to your
            professor for review.
          </p>


          {/* SUBMISSION NOTE */}
          <label>
            Submission Note

            <textarea
              name="description"
              rows="4"
              placeholder="Add an optional note for your professor..."
            />

          </label>


          {/* FILE */}
          <label>
            Completed Assignment PDF

            <input
              name="file"
              type="file"
              accept="application/pdf"
              required
            />

          </label>


          <p className="upload-help">
            Only PDF files are allowed.
          </p>


          {/* ERROR */}
          {error && (

            <p className="api-error">
              {error}
            </p>

          )}


          {/* SUBMIT */}
          <button
            type="submit"
            className="primary-button"
            disabled={uploading}
          >
            {uploading
              ? "Submitting..."
              : "Submit to Professor"}
          </button>

        </form>

      )}


      {/* =================================================
          SUBMITTED MESSAGE
      ================================================= */}
      {assignment.status ===
        "submitted" && (

        <section className="submission-status-card">

          <h2>
            Assignment Submitted
          </h2>

          <p>
            Your assignment has been
            submitted to the professor and
            is waiting for review.
          </p>

          {assignment.submission?.fileUrl && (

            <a
              className="primary-button"
              href={
                assignment.submission.fileUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              📄 View Submitted PDF
            </a>

          )}

        </section>

      )}


      {/* =================================================
          FORWARDED TO HOD
      ================================================= */}
      {assignment.status ===
        "forwarded" && (

        <section className="submission-status-card">

          <h2>
            Forwarded to HOD
          </h2>

          <p>
            Your professor has reviewed your
            assignment and forwarded it to
            the HOD for final review.
          </p>

        </section>

      )}


      {/* =================================================
          APPROVED
      ================================================= */}
      {assignment.status ===
        "approved" && (

        <section className="submission-status-card">

          <h2>
            ✓ Assignment Approved
          </h2>

          <p>
            Your assignment has been
            approved.
          </p>

          {assignment.marks !==
            null &&
            assignment.marks !==
              undefined && (

            <p className="marks-display">

              Marks awarded:

              <strong>
                {" "}
                {assignment.marks}

                {assignment.maxMarks
                  ? ` / ${assignment.maxMarks}`
                  : ""}
              </strong>

            </p>

          )}

          {assignment.professorRemark && (

            <div>

              <strong>
                Professor Remarks
              </strong>

              <p>
                {assignment.professorRemark}
              </p>

            </div>

          )}

        </section>

      )}


      {/* =================================================
          REJECTED
      ================================================= */}
      {assignment.status ===
        "rejected" && (

        <section className="submission-status-card">

          <h2>
            ✕ Assignment Rejected
          </h2>

          <p>
            Your professor has rejected
            this assignment.
          </p>


          {assignment.professorRemark && (

            <div>

              <strong>
                Professor Remarks
              </strong>

              <p>
                {assignment.professorRemark}
              </p>

            </div>

          )}

          {/* OPTIONAL RESUBMISSION */}
          <p>
            Please check the professor's
            remarks and resubmit if your
            system allows resubmissions.
          </p>

        </section>

      )}

    </article>
  );
}


// ======================================================
// STUDENT NOTIFICATIONS
// ======================================================
export function StudentNotifications() {

  const [notifications, setNotifications] =
    useState([]);

  const [error, setError] =
    useState("");


  // ====================================================
  // LOAD
  // ====================================================
  const reload = () => {

    api("/api/student/notifications")

      .then((data) => {

        setNotifications(
          data.notifications || []
        );

      })

      .catch((error) => {

        setError(
          error.message ||
            "Unable to load notifications."
        );

      });

  };


  useEffect(() => {
    reload();
  }, []);


  // ====================================================
  // MARK ONE READ
  // ====================================================
  const mark = async (id) => {

    try {

      await api(
        `/api/student/notifications/${id}/mark-read`,
        {
          method: "POST",
        }
      );

      reload();

    } catch (error) {

      setError(
        error.message ||
          "Unable to mark notification."
      );

    }

  };


  // ====================================================
  // MARK ALL
  // ====================================================
  const markAll = async () => {

    try {

      await api(
        "/api/student/notifications/mark-all-read",
        {
          method: "POST",
        }
      );

      reload();

    } catch (error) {

      setError(
        error.message ||
          "Unable to mark notifications."
      );

    }

  };


  return (
    <>

      {/* HEADER */}
      <section className="student-heading">

        <div>

          <h1>
            Notifications
          </h1>

          <p>
            Updates about your assignments
            and professor reviews.
          </p>

        </div>


        {notifications.some(
          (notification) =>
            !notification.read
        ) && (

          <button
            className="primary-button"
            onClick={markAll}
          >
            Mark All as Read
          </button>

        )}

      </section>


      {/* ERROR */}
      {error && (

        <p className="api-error">
          {error}
        </p>

      )}


      {/* NOTIFICATIONS */}
      <div className="notification-list">

        {notifications.length ? (

          notifications.map(
            (notification) => {

              const assignment =
                notification.assignmentId;

              return (
                <article
                  key={notification._id}
                  className={
                    !notification.read
                      ? "unread"
                      : ""
                  }
                >

                  <div>

                    <strong>
                      {notification.message}
                    </strong>

                    <p>

                      {dateTime(
                        notification.createdAt
                      )}

                      {assignment &&
                        ` · ${assignment.title}`}

                    </p>

                  </div>


                  <div>

                    {assignment && (

                      <Link
                        className="student-action"
                        to={`/student/assignments/${assignment._id}`}
                      >
                        View
                      </Link>

                    )}


                    {!notification.read && (

                      <button
                        type="button"
                        onClick={() =>
                          mark(
                            notification._id
                          )
                        }
                      >
                        Mark Read
                      </button>

                    )}

                  </div>

                </article>
              );
            }
          )

        ) : (

          <p className="empty-state-card">
            No notifications yet.
          </p>

        )}

      </div>

    </>
  );
}