import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "./ProfessorPages.css";


// ======================================================
// API
// ======================================================

const api = async (url) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Unable to load dashboard"
    );
  }

  return data;
};


// ======================================================
// DATE
// ======================================================

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};


// ======================================================
// DAYS PENDING
// ======================================================

const getDaysPending = (assignment) => {
  if (!assignment?.createdAt) {
    return "—";
  }

  if (
    assignment.status === "approved" ||
    assignment.status === "rejected"
  ) {
    return getDecisionText(assignment);
  }

  const submittedDate =
    new Date(assignment.createdAt);

  if (Number.isNaN(submittedDate.getTime())) {
    return "—";
  }

  const now = new Date();

  const difference =
    now.getTime() -
    submittedDate.getTime();

  const days = Math.floor(
    difference /
      (1000 * 60 * 60 * 24)
  );

  return `${Math.max(days, 0)} day${
    days === 1 ? "" : "s"
  }`;
};


// ======================================================
// APPROVED / REJECTED TEXT
// ======================================================

const getDecisionText = (assignment) => {
  const statusDate =
    assignment.reviewedAt ||
    assignment.approvedAt ||
    assignment.rejectedAt ||
    assignment.updatedAt;

  if (!statusDate) {
    return assignment.status === "approved"
      ? "Approved"
      : "Rejected";
  }

  const formatted =
    formatDate(statusDate);

  if (assignment.status === "approved") {
    return `Approved on ${formatted}`;
  }

  if (assignment.status === "rejected") {
    return `Rejected on ${formatted}`;
  }

  return formatted;
};


// ======================================================
// STATUS
// ======================================================

const statusLabel = (status) => {
  switch (status) {
    case "submitted":
      return "Pending Review";

    case "approved":
      return "Approved";

    case "forwarded":
      return "Forwarded";

    case "rejected":
      return "Rejected";

    case "draft":
      return "Draft";

    default:
      return status || "Unknown";
  }
};


// ======================================================
// PROFESSOR DASHBOARD
// ======================================================

export default function ProfessorDashboard() {

  const [
    params,
    setParams,
  ] = useSearchParams();


  const [data, setData] =
    useState(null);


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(true);


  // ====================================================
  // FILTER VALUES
  // ====================================================

  const status =
    params.get("status") ||
    "all";


  const search =
    params.get("search") ||
    "";


  const sort =
    params.get("sort") ||
    "oldest";


  // ====================================================
  // LOAD DASHBOARD
  // ====================================================

  useEffect(() => {

    let mounted = true;


    const loadDashboard =
      async () => {

        try {

          setLoading(true);
          setError("");


          const result =
            await api(
              `/professor/api/dashboard?${params.toString()}`
            );


          if (mounted) {
            setData(result);
          }

        } catch (error) {

          console.error(
            "Professor dashboard error:",
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

  }, [params]);


  // ====================================================
  // FILTER + SORT
  // ====================================================

  const assignments = useMemo(() => {

    if (!data?.assignments) {
      return [];
    }


    let result =
      [...data.assignments];


    // SEARCH

    const searchValue =
      search.trim().toLowerCase();


    if (searchValue) {

      result =
        result.filter((assignment) => {

          const student =
            assignment.studentId?.name
              ?.toLowerCase() || "";


          const email =
            assignment.studentId?.email
              ?.toLowerCase() || "";


          const title =
            assignment.title
              ?.toLowerCase() || "";


          return (
            student.includes(searchValue) ||
            email.includes(searchValue) ||
            title.includes(searchValue)
          );

        });

    }


    // STATUS

    if (status !== "all") {

      result =
        result.filter(
          (assignment) =>
            assignment.status ===
            status
        );

    }


    // SORT

    result.sort((a, b) => {

      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();


      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();


      if (sort === "newest") {
        return dateB - dateA;
      }

      return dateA - dateB;

    });


    return result;

  }, [
    data,
    search,
    status,
    sort,
  ]);


  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch =
    (event) => {

      setParams({
        status,
        search:
          event.target.value,
        sort,
      });

    };


  // ====================================================
  // STATUS
  // ====================================================

  const handleStatus =
    (event) => {

      setParams({
        status:
          event.target.value,
        search,
        sort,
      });

    };


  // ====================================================
  // SORT
  // ====================================================

  const handleSort =
    (event) => {

      setParams({
        status,
        search,
        sort:
          event.target.value,
      });

    };


  // ====================================================
  // ERROR
  // ====================================================

  if (error) {

    return (
      <div className="professor-page">

        <div className="professor-api-error">

          <h2>
            Unable to load dashboard
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

      </div>
    );

  }


  // ====================================================
  // LOADING
  // ====================================================

  if (loading && !data) {

    return (
      <div className="professor-page">

        <div className="professor-loading">

          <div className="professor-spinner"></div>

          <p>
            Loading assignment queue...
          </p>

        </div>

      </div>
    );

  }


  if (!data) {
    return null;
  }


  // ====================================================
  // COUNTS
  // ====================================================

  const counts =
    data.counts || {};


  return (
    <div className="professor-page">


      {/* ==================================================
          DASHBOARD HEADER
         ================================================== */}

      <section className="professor-dashboard-heading">

        <div>

          <h1>
            Professor Dashboard
          </h1>

          <p>
            Review and track student assignments
            submitted for approval.
          </p>

        </div>


        <Link
          className="professor-create-button"
          to="/professor/create-assignment"
        >
          + Create Assignment
        </Link>

      </section>


      {/* ==================================================
          STATISTICS
         ================================================== */}

      <section className="professor-stats">


        <article className="professor-stat pending">

          <span>
            Pending Review
          </span>

          <strong>
            {counts.pending || 0}
          </strong>

        </article>


        <article className="professor-stat approved">

          <span>
            Approved
          </span>

          <strong>
            {counts.approved || 0}
          </strong>

        </article>


        <article className="professor-stat forwarded">

          <span>
            Forwarded
          </span>

          <strong>
            {counts.forwarded || 0}
          </strong>

        </article>


        <article className="professor-stat rejected">

          <span>
            Rejected
          </span>

          <strong>
            {counts.rejected || 0}
          </strong>

        </article>


        <article className="professor-stat total">

          <span>
            Total Reviewed
          </span>

          <strong>
            {counts.totalReviewed || 0}
          </strong>

        </article>


      </section>


      {/* ==================================================
          FILTER CARD
         ================================================== */}

      <section className="professor-filter-card">


        <div className="professor-filter search-filter">

          <label>
            Search by Student or Title
          </label>

          <input
            value={search}
            onChange={handleSearch}
            placeholder="Type to search..."
          />

        </div>


        <div className="professor-filter">

          <label>
            Status
          </label>

          <select
            value={status}
            onChange={handleStatus}
          >

            <option value="all">
              All
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

          </select>

        </div>


        <div className="professor-filter">

          <label>
            Sort By
          </label>

          <select
            value={sort}
            onChange={handleSort}
          >

            <option value="oldest">
              Oldest
            </option>

            <option value="newest">
              Newest
            </option>

          </select>

        </div>


      </section>


      {/* ==================================================
          ASSIGNMENT QUEUE
         ================================================== */}

      <section className="professor-queue">


        <div className="professor-queue-header">

          <h2>
            Assignment Queue
          </h2>

        </div>


        <div className="professor-table-wrapper">

          <table className="professor-table">


            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Title
                </th>

                <th>
                  Status
                </th>

                <th>
                  Submitted
                </th>

                <th>
                  Days Pending
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>


              {assignments.length > 0 ? (

                assignments.map(
                  (assignment) => {

                    const student =
                      assignment.studentId ||
                      {};


                    const isPending =
                      assignment.status ===
                      "submitted";


                    return (
                      <tr
                        key={
                          assignment._id
                        }
                      >


                        {/* STUDENT */}

                        <td>

                          <div className="professor-student-cell">

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


                        {/* TITLE */}

                        <td>

                          <strong className="professor-title">

                            {assignment.title ||
                              "Untitled Assignment"}

                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`professor-status ${assignment.status}`}
                          >

                            {assignment.status ===
                              "approved" && (
                              <span>
                                ✓
                              </span>
                            )}

                            {assignment.status ===
                              "rejected" && (
                              <span>
                                ✕
                              </span>
                            )}

                            {assignment.status ===
                              "submitted" && (
                              <span>
                                ●
                              </span>
                            )}

                            {statusLabel(
                              assignment.status
                            )}

                          </span>

                        </td>


                        {/* SUBMITTED */}

                        <td>

                          <span className="professor-date">

                            {formatDate(
                              assignment.createdAt
                            )}

                          </span>

                        </td>


                        {/* DAYS PENDING */}

                        <td>

                          {isPending ? (

                            <span className="professor-pending-days">

                              {getDaysPending(
                                assignment
                              )}

                            </span>

                          ) : (

                            <span className="professor-decision-date">

                              <span className="decision-check">
                                ✓
                              </span>

                              {getDecisionText(
                                assignment
                              )}

                            </span>

                          )}

                        </td>


                        {/* ACTION */}

                        <td>

                          <div className="professor-actions">

                            <Link
                              className="professor-details-button"
                              to={
                                assignment.status ===
                                "submitted"
                                  ? `/professor/review/${assignment._id}`
                                  : `/professor/details/${assignment._id}`
                              }
                            >

                              Details

                            </Link>


                            {assignment.status ===
                              "submitted" && (

                              <Link
                                className="professor-review-button"
                                to={`/professor/review/${assignment._id}`}
                                title="Review assignment"
                              >
                                →
                              </Link>

                            )}

                          </div>

                        </td>


                      </tr>
                    );

                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="professor-empty"
                  >

                    No assignments found.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


    </div>
  );
}