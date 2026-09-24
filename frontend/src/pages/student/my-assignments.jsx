import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "./studentApi.js";
import { AssignmentTable } from "./AssignmentTable.jsx";

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


