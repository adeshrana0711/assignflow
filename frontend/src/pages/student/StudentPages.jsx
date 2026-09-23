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
  try {
    const response = await fetch(path, {
      method: options.method || "GET",

      credentials: "include",

      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(options.headers || {}),
      },

      body: options.body,
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data = {};

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      data = {
        error:
          text ||
          `Server returned status ${response.status}`,
      };
    }

    if (response.status === 401) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "You are not authorized to access this page."
      );
    }

    if (response.status === 404) {
      throw new Error(
        "Student API endpoint was not found."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
          data.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;

  } catch (error) {

    console.error(
      "Student API error:",
      error
    );

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please make sure your backend is running."
      );
    }

    throw error;
  }
};


// ======================================================
// DATE FORMATTER
// ======================================================

const date = (value) => {
  if (!value) {
    return "—";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
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

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString(
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

            <th>
              Title
            </th>

            <th>
              Category
            </th>

            <th>
              Professor
            </th>

            <th>
              Due Date
            </th>

            <th>
              Status
            </th>

            <th>
              Action
            </th>

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

                <td>
                  <strong>
                    {item.title ||
                      "Untitled Assignment"}
                  </strong>
                </td>


                <td>
                  {item.category ||
                    "Assignment"}
                </td>


                <td>
                  {professor.name ||
                    "Not assigned"}
                </td>


                <td>
                  {date(item.dueDate)}
                </td>


                <td>

                  <span
                    className={`student-status ${
                      item.status ||
                      "unknown"
                    }`}
                  >
                    {statusLabel(
                      item.status
                    )}
                  </span>

                </td>


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


  const [loading, setLoading] =
    useState(true);


  const status =
    searchParams.get("status") ||
    "all";


  const search =
    searchParams.get("search") ||
    "";


  // ------------------------------------------------------
  // LOAD ASSIGNMENTS
  // ------------------------------------------------------

  useEffect(() => {

    let mounted = true;


    const loadAssignments =
      async () => {

        try {

          setLoading(true);
          setError("");


          const data =
            await api(
              `/api/student/assignments?${searchParams.toString()}`
            );


          if (mounted) {

            setAssignments(
              Array.isArray(
                data.assignments
              )
                ? data.assignments
                : []
            );

          }

        } catch (error) {

          if (mounted) {

            setError(
              error.message ||
                "Unable to load assignments."
            );

          }

        } finally {

          if (mounted) {
            setLoading(false);
          }

        }

      };


    loadAssignments();


    return () => {
      mounted = false;
    };

  }, [searchParams]);


  // ------------------------------------------------------
  // SEARCH
  // ------------------------------------------------------

  const handleSearch =
    (event) => {

      setSearchParams({
        status,
        search:
          event.target.value,
      });

    };


  // ------------------------------------------------------
  // STATUS
  // ------------------------------------------------------

  const handleStatus =
    (event) => {

      setSearchParams({
        status:
          event.target.value,
        search,
      });

    };


  return (
    <>

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


      {loading ? (

        <div className="student-loading-card">
          <div className="student-spinner"></div>
          <p>Loading assignments...</p>
        </div>

      ) : error ? (

        <div className="student-api-error-card">

          <h2>
            Unable to load assignments
          </h2>

          <p>
            {error}
          </p>

          <button
            className="primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

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


  const [loading, setLoading] =
    useState(true);


  // ------------------------------------------------------
  // LOAD ASSIGNMENT
  // ------------------------------------------------------

  const loadAssignment =
    async () => {

      try {

        setLoading(true);
        setError("");


        const data =
          await api(
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

      } finally {

        setLoading(false);

      }

    };


  useEffect(() => {

    loadAssignment();

  }, [id]);


  // ------------------------------------------------------
  // LOADING
  // ------------------------------------------------------

  if (loading) {

    return (
      <div className="student-loading-card">

        <div className="student-spinner"></div>

        <p>
          Loading assignment...
        </p>

      </div>
    );
  }


  // ------------------------------------------------------
  // ERROR
  // ------------------------------------------------------

  if (error && !assignment) {

    return (
      <div className="student-api-error-card">

        <h2>
          Unable to load assignment
        </h2>

        <p>
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


  if (!assignment) {

    return (
      <div className="student-api-error-card">

        <h2>
          Assignment not found
        </h2>

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


  const canSubmit =
    assignment.status === "active" &&
    !assignment.submission;


  // ------------------------------------------------------
  // SUBMIT COMPLETED ASSIGNMENT
  // ------------------------------------------------------

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

      <Link to="/student/assignments">
        ← Back to Assignments
      </Link>


      {/* ==================================================
          HEADER
         ================================================== */}

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


      {/* ==================================================
          INFORMATION
         ================================================== */}

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


      {/* ==================================================
          DESCRIPTION
         ================================================== */}

      <section>

        <h2>
          Assignment Description
        </h2>

        <p>
          {assignment.description ||
            "No description provided."}
        </p>

      </section>


      {/* ==================================================
          PROFESSOR FILE
         ================================================== */}

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


      {/* ==================================================
          SUBMIT COMPLETED ASSIGNMENT
         ================================================== */}

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


          <label>

            Submission Note

            <textarea
              name="description"
              rows="4"
              placeholder="Add an optional note for your professor..."
            />

          </label>


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


          {error && (

            <p className="api-error">
              {error}
            </p>

          )}


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


      {/* ==================================================
          SUBMITTED
         ================================================== */}

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


      {/* ==================================================
          FORWARDED
         ================================================== */}

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


      {/* ==================================================
          APPROVED
         ================================================== */}

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


          {assignment.marks !== null &&
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


      {/* ==================================================
          REJECTED
         ================================================== */}

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


  const [loading, setLoading] =
    useState(true);


  // ------------------------------------------------------
  // LOAD NOTIFICATIONS
  // ------------------------------------------------------

  const reload = async () => {

    try {

      setLoading(true);
      setError("");


      const data =
        await api(
          "/api/student/notifications"
        );


      setNotifications(
        Array.isArray(
          data.notifications
        )
          ? data.notifications
          : []
      );

    } catch (error) {

      setError(
        error.message ||
          "Unable to load notifications."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    reload();

  }, []);


  // ------------------------------------------------------
  // MARK ONE READ
  // ------------------------------------------------------

  const mark = async (id) => {

    try {

      await api(
        `/api/student/notifications/${id}/mark-read`,
        {
          method: "POST",
        }
      );

      await reload();

    } catch (error) {

      setError(
        error.message ||
          "Unable to mark notification."
      );

    }

  };


  // ------------------------------------------------------
  // MARK ALL READ
  // ------------------------------------------------------

  const markAll = async () => {

    try {

      await api(
        "/api/student/notifications/mark-all-read",
        {
          method: "POST",
        }
      );

      await reload();

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


      {/* LOADING */}

      {loading ? (

        <div className="student-loading-card">

          <div className="student-spinner"></div>

          <p>
            Loading notifications...
          </p>

        </div>

      ) : (

        <div className="notification-list">

          {notifications.length ? (

            notifications.map(
              (notification) => {

                const assignment =
                  notification.assignmentId;


                return (
                  <article
                    key={
                      notification._id
                    }
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

      )}

    </>
  );
}