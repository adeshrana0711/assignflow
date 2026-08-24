import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import "./HodPages.css";


const api = async (url) => {

  const response = await fetch(url, {

    credentials: "include",

    headers: {
      Accept: "application/json",
      "X-Requested-With":
        "XMLHttpRequest",
    },

  });


  const contentType =
    response.headers.get("content-type") || "";


  let data;


  if (contentType.includes("application/json")) {

    data = await response.json();

  } else {

    const text =
      await response.text();

    throw new Error(
      text ||
      `Server returned ${response.status}`
    );

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      "Unable to load HOD dashboard"
    );

  }


  return data;

};


const formatStatus = (status) => {

  switch (status) {

    case "submitted":
      return "Pending";

    case "forwarded":
      return "Forwarded";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return status || "Unknown";

  }

};


export default function HodDashboard() {

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


  // ==================================================
  // LOAD DASHBOARD
  // ==================================================

  const loadDashboard = async () => {

    try {

      setLoading(true);

      setError("");


      const query =
        params.toString();


      const result =
        await api(
          `/hod/api/dashboard${
            query ? `?${query}` : ""
          }`
        );


      console.log(
        "HOD DASHBOARD RESPONSE:",
        result
      );


      setData(result);


    } catch (error) {

      console.error(
        "HOD DASHBOARD ERROR:",
        error
      );


      setError(
        error.message ||
        "Unable to load HOD dashboard"
      );


    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadDashboard();

  }, [params]);


  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {

    return (

      <div className="hod-page">

        <div className="api-status">

          Loading HOD dashboard...

        </div>

      </div>

    );

  }


  // ==================================================
  // ERROR
  // ==================================================

  if (error) {

    return (

      <div className="hod-page">

        <div className="api-error">

          {error}

        </div>

      </div>

    );

  }


  if (!data) {

    return null;

  }


  const assignments =
    Array.isArray(data.assignments)
      ? data.assignments
      : [];


  const counts =
    data.counts || {

      pending: 0,

      reviewed: 0,

      rejected: 0,

      total: 0,

    };


  const status =
    params.get("status") ||
    "all";


  const search =
    params.get("search") ||
    "";


  // ==================================================
  // SEARCH
  // ==================================================

  const handleSearch = (value) => {

    const next =
      new URLSearchParams(params);


    if (value) {

      next.set(
        "search",
        value
      );

    } else {

      next.delete("search");

    }


    setParams(next);

  };


  // ==================================================
  // STATUS
  // ==================================================

  const handleStatus = (value) => {

    const next =
      new URLSearchParams(params);


    if (value === "all") {

      next.delete("status");

    } else {

      next.set(
        "status",
        value
      );

    }


    setParams(next);

  };


  return (

    <div className="hod-page">

      {/* ==================================================
          HEADER
      ================================================== */}

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


      {/* ==================================================
          STATS
      ================================================== */}

      <section className="student-stats hod-stats">


        <article>

          <span>
            Pending Review
          </span>

          <strong>
            {counts.pending}
          </strong>

        </article>


        <article>

          <span>
            Reviewed
          </span>

          <strong>
            {counts.reviewed}
          </strong>

        </article>


        <article>

          <span>
            Rejected
          </span>

          <strong>
            {counts.rejected}
          </strong>

        </article>


        <article>

          <span>
            Total Received
          </span>

          <strong>
            {counts.total}
          </strong>

        </article>


      </section>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <form
        className="student-filters hod-filters"
        onSubmit={(e) =>
          e.preventDefault()
        }
      >

        <input

          type="text"

          placeholder="Search by title, student or professor"

          value={search}

          onChange={(e) =>
            handleSearch(
              e.target.value
            )
          }

        />


        <select

          value={status}

          onChange={(e) =>
            handleStatus(
              e.target.value
            )
          }

        >

          <option value="all">
            All
          </option>

          <option value="submitted">
            Pending
          </option>

          <option value="forwarded">
            Forwarded
          </option>

          <option value="reviewed">
            Reviewed
          </option>

          <option value="rejected">
            Rejected
          </option>

        </select>

      </form>


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="table-card hod-table-card">

        <div className="table-title">

          <h2>
            Assignment Queue
          </h2>

        </div>


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

            {assignments.length > 0 ? (

              assignments.map(
                (assignment) => {

                  const canReview =
                    assignment.status ===
                      "submitted" ||
                    assignment.status ===
                      "forwarded";


                  return (

                    <tr
                      key={
                        assignment._id
                      }
                    >

                      {/* STUDENT */}

                      <td>

                        <strong>

                          {
                            assignment.student
                              ?.name ||

                            assignment.studentId
                              ?.name ||

                            "Unknown Student"

                          }

                        </strong>

                      </td>


                      {/* PROFESSOR */}

                      <td>

                        {
                          assignment.history
                            ?.find(
                              (h) =>
                                h.action ===
                                "forwarded"
                            )
                            ?.reviewerId
                            ?.name ||

                          assignment.professor
                            ?.name ||

                          assignment.reviewerId
                            ?.name ||

                          "Professor"

                        }

                      </td>


                      {/* TITLE */}

                      <td>

                        {
                          assignment.title ||
                          "Untitled Assignment"
                        }

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `student-status ${
                              assignment.status
                            }`
                          }
                        >

                          {
                            formatStatus(
                              assignment.status
                            )
                          }

                        </span>

                      </td>


                      {/* DATE */}

                      <td>

                        {
                          assignment.createdAt
                            ? new Date(
                                assignment.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day:
                                    "2-digit",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )
                            : "—"
                        }

                      </td>


                      {/* ACTION */}

                      <td>

                        <Link

                          className="student-action"

                          to={
                            canReview

                              ? `/hod/review/${assignment._id}`

                              : `/hod/details/${assignment._id}`
                          }

                        >

                          {
                            canReview
                              ? "Review Now"
                              : "View Details"
                          }

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
                  className="empty-row"
                >

                  No assignments received from professors.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


    </div>

  );

}