import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./HodPages.css";


// ======================================================
// API HELPER
// ======================================================

const api = async (url) => {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      text || `Server returned status ${response.status}`
    );
  }

  if (response.status === 401) {
    throw new Error("HOD session expired. Please login again.");
  }

  if (response.status === 403) {
    throw new Error(
      "You are not authorized to access the HOD dashboard."
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
};


// ======================================================
// STATUS LABEL
// ======================================================

const statusLabel = (status) => {
  switch (status) {
    case "submitted":
      return "Pending Review";

    case "forwarded":
      return "Pending Review";

    case "reviewed":
      return "Reviewed";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return status || "Unknown";
  }
};


// ======================================================
// DATE
// ======================================================

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};


// ======================================================
// HOD DASHBOARD
// ======================================================

export default function HodDashboard() {
  const [params, setParams] = useSearchParams();

  const [data, setData] = useState(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);


  const status =
    params.get("status") || "all";

  const search =
    params.get("search") || "";


  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        if (status !== "all") {
          query.set("status", status);
        }

        if (search.trim()) {
          query.set("search", search.trim());
        }

        const url =
          `/hod/api/dashboard${
            query.toString()
              ? `?${query.toString()}`
              : ""
          }`;

        console.log(
          "HOD dashboard API:",
          url
        );

        const result = await api(url);

        console.log(
          "HOD dashboard response:",
          result
        );

        if (mounted) {
          setData(result);
        }

      } catch (err) {
        console.error(
          "HOD dashboard error:",
          err
        );

        if (mounted) {
          setError(
            err.message ||
              "Unable to load HOD dashboard."
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

  }, [status, search]);


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="hod-page">

        <div className="api-status">
          Loading HOD dashboard...
        </div>

      </div>
    );
  }


  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <div className="hod-page">

        <div className="api-error">

          <h2>
            Unable to load HOD dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="student-action"
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
      <div className="hod-page">

        <div className="api-status">
          No dashboard data received.
        </div>

      </div>
    );
  }


  // ====================================================
  // NORMALIZE DATA
  // ====================================================

  const assignments =
    Array.isArray(data.assignments)
      ? data.assignments
      : [];


  const counts = {
    pending:
      data.counts?.pending ||
      assignments.filter(
        (a) =>
          a.status === "submitted" ||
          a.status === "forwarded"
      ).length,

    reviewed:
      data.counts?.reviewed ||
      assignments.filter(
        (a) => a.status === "reviewed"
      ).length,

    rejected:
      data.counts?.rejected ||
      assignments.filter(
        (a) => a.status === "rejected"
      ).length,

    total:
      data.counts?.total ??
      assignments.length,
  };


  // ====================================================
  // SEARCH/FILTER
  // ====================================================

  const filteredAssignments =
    assignments.filter((assignment) => {

      const query =
        search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      const title =
        assignment.title
          ?.toLowerCase() || "";

      const student =
        assignment.studentId?.name
          ?.toLowerCase() || "";

      const studentEmail =
        assignment.studentId?.email
          ?.toLowerCase() || "";

      const professor =
        (
          assignment.professorId?.name ||
          assignment.reviewerId?.name ||
          ""
        ).toLowerCase();

      return (
        title.includes(query) ||
        student.includes(query) ||
        studentEmail.includes(query) ||
        professor.includes(query)
      );
    });


  // ====================================================
  // UPDATE SEARCH
  // ====================================================

  const handleSearch = (event) => {
    const value = event.target.value;

    setParams({
      status,
      search: value,
    });
  };


  // ====================================================
  // UPDATE STATUS
  // ====================================================

  const handleStatus = (event) => {
    setParams({
      status: event.target.value,
      search,
    });
  };


  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div className="hod-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <section className="student-heading">

        <div>

          <h1>
            HOD Dashboard
          </h1>

          <p>
            Final review of department submissions.
          </p>

        </div>

      </section>


      {/* ================================================
          STATISTICS
      ================================================= */}

      <section className="student-stats hod-stats">

        <article className="hod-stat-pending">

          <span>
            Pending Review
          </span>

          <strong>
            {counts.pending}
          </strong>

        </article>


        <article className="hod-stat-reviewed">

          <span>
            Reviewed
          </span>

          <strong>
            {counts.reviewed}
          </strong>

        </article>


        <article className="hod-stat-rejected">

          <span>
            Rejected
          </span>

          <strong>
            {counts.rejected}
          </strong>

        </article>


        <article className="hod-stat-total">

          <span>
            Total Received
          </span>

          <strong>
            {counts.total}
          </strong>

        </article>

      </section>


      {/* ================================================
          SEARCH + FILTER
      ================================================= */}

      <form
        className="student-filters hod-filters"
        onSubmit={(event) =>
          event.preventDefault()
        }
      >

        <input
          type="text"
          placeholder="Search by title, student or professor..."
          value={search}
          onChange={handleSearch}
        />


        <select
          value={status}
          onChange={handleStatus}
        >

          <option value="all">
            All
          </option>

          <option value="submitted">
            Pending
          </option>

          <option value="forwarded">
            Pending Review
          </option>

          <option value="reviewed">
            Reviewed
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

      </form>


      {/* ================================================
          ASSIGNMENT TABLE
      ================================================= */}

      <section className="table-card hod-table-card">

        <table>

          <thead>

            <tr>

              <th>
                Student
              </th>

              <th>
                Professor
              </th>

              <th>
                Title
              </th>

              <th>
                Status
              </th>

              <th>
                Received
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

                  const student =
                    assignment.studentId ||
                    assignment.student ||
                    {};


                  const professor =
                    assignment.professorId ||
                    assignment.reviewerId ||
                    assignment.professor ||
                    {};


                  const isPending =
                    assignment.status ===
                      "submitted" ||
                    assignment.status ===
                      "forwarded";


                  return (
                    <tr
                      key={assignment._id}
                    >

                      {/* STUDENT */}

                      <td>

                        <div className="hod-person">

                          <strong>
                            {student.name ||
                              "Unknown Student"}
                          </strong>

                          {student.email && (
                            <small>
                              {student.email}
                            </small>
                          )}

                        </div>

                      </td>


                      {/* PROFESSOR */}

                      <td>

                        <div className="hod-person">

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


                      {/* TITLE */}

                      <td>

                        <strong>
                          {assignment.title ||
                            "Untitled Assignment"}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`student-status ${
                            assignment.status ||
                            "unknown"
                          }`}
                        >
                          {statusLabel(
                            assignment.status
                          )}
                        </span>

                      </td>


                      {/* RECEIVED */}

                      <td>

                        {formatDate(
                          assignment.createdAt ||
                          assignment.submittedAt
                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <Link
                          className="student-action"
                          to={
                            isPending
                              ? `/hod/review/${assignment._id}`
                              : `/hod/details/${assignment._id}`
                          }
                        >

                          {isPending
                            ? "Review Now"
                            : "View Details"}

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
                  className="hod-empty"
                >

                  No assignments match
                  the current filters.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </section>


      {/* ================================================
          DEBUG INFORMATION
          Remove after backend is fixed
      ================================================= */}

      <div className="hod-debug">

        <strong>
          API returned:
        </strong>{" "}

        {assignments.length} assignments

      </div>

    </div>
  );
}