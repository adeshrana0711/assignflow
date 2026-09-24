import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, date, dateTime, statusLabel } from "./studentApi.js";

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


