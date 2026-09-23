import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./ProfessorPages.css";


// ======================================
// API HELPER
// ======================================
const api = async (url) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
  });

  const contentType = response.headers.get("content-type");

  let data;

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    data = await response.json();
  } else {
    const text = await response.text();

    throw new Error(
      text || "Unable to load assignment"
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load assignment"
    );
  }

  return data;
};


// ======================================
// DATE FORMATTER
// ======================================
const formatDate = (value) => {
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


// ======================================
// STATUS FORMATTER
// ======================================
const formatStatus = (status) => {
  switch (status) {
    case "submitted":
      return "Pending Review";

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


// ======================================
// PROFESSOR ASSIGNMENT
// ======================================
export default function ProfessorAssignment({
  review = false,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [error, setError] = useState("");

  const [remark, setRemark] = useState("");

  const [signature, setSignature] = useState("");

  const [decision, setDecision] =
    useState("approved");

  const [submitting, setSubmitting] =
    useState(false);


  // ======================================
  // LOAD ASSIGNMENT
  // ======================================
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setError("");

        const result = await api(
          `/api/professor/assignments/${id}`
        );

        setData(result);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load assignment."
        );
      }
    };

    loadAssignment();
  }, [id]);


  // ======================================
  // SUBMIT PROFESSOR REVIEW
  // ======================================
  const submitReview = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const body = new FormData();

      body.append("remark", remark);
      body.append("signature", signature);
      body.append("decision", decision);

      const response = await fetch(
        `/api/professor/review/${id}`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            Accept: "application/json",
            "X-Requested-With":
              "XMLHttpRequest",
          },

          body,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        );

      let result;

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        result = await response.json();
      } else {
        const text = await response.text();

        throw new Error(
          text ||
            "Unable to start review."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to start review."
        );
      }


      /*
       * Backend should return something like:
       *
       * {
       *   assignmentId: "...",
       *   reviewId: "...",
       *   message: "OTP sent successfully"
       * }
       *
       * This information is passed
       * to the OTP page.
       */

      navigate(
        "/professor/verify-otp",
        {
          state: {
            ...result,

            assignmentId:
              result.assignmentId || id,

            decision,

            remark,

            signature,
          },
        }
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to start review."
      );
    } finally {
      setSubmitting(false);
    }
  };


  // ======================================
  // LOADING
  // ======================================
  if (!data && !error) {
    return (
      <div className="professor-page">
        <p className="api-status">
          Loading assignment...
        </p>
      </div>
    );
  }


  // ======================================
  // ERROR
  // ======================================
  if (error && !data) {
    return (
      <div className="professor-page">

        <p className="api-error">
          {error}
        </p>

        <Link
          to="/professor/dashboard"
          className="primary-button"
        >
          Back to Dashboard
        </Link>

      </div>
    );
  }


  const { assignment } = data;


  // ======================================
  // CHECK WHETHER REVIEW IS ALLOWED
  // ======================================
  const canReview =
    assignment.status === "submitted";


  return (
    <article className="student-detail professor-detail">

      {/* ==================================
          BACK
      =================================== */}
      <Link to="/professor/dashboard">
        ← Back to Dashboard
      </Link>


      {/* ==================================
          HEADER
      =================================== */}
      <div className="student-detail-header">

        <p className="eyebrow">
          {review
            ? "Review Assignment"
            : "Assignment Details"}
        </p>

        <h1>
          {assignment.title}
        </h1>

        <p>
          Submitted by{" "}
          <strong>
            {assignment.studentId?.name ||
              "Unknown Student"}
          </strong>

          {assignment.studentId?.email && (
            <>
              {" "}
              ·{" "}
              {assignment.studentId.email}
            </>
          )}
        </p>

      </div>


      {/* ==================================
          ASSIGNMENT INFORMATION
      =================================== */}
      <dl>

        <div>
          <dt>Category</dt>

          <dd>
            {assignment.category ||
              "Assignment"}
          </dd>
        </div>


        <div>
          <dt>Status</dt>

          <dd>
            <span
              className={`student-status ${
                assignment.status
              }`}
            >
              {formatStatus(
                assignment.status
              )}
            </span>
          </dd>
        </div>


        <div>
          <dt>Submitted</dt>

          <dd>
            {formatDate(
              assignment.createdAt
            )}
          </dd>
        </div>


        <div>
          <dt>Student</dt>

          <dd>
            {assignment.studentId?.name ||
              "Unknown Student"}
          </dd>
        </div>

      </dl>


      {/* ==================================
          DESCRIPTION
      =================================== */}
      <section>

        <h2>
          Description
        </h2>

        <p>
          {assignment.description ||
            "No description provided."}
        </p>

      </section>


      {/* ==================================
          SUBMITTED FILE
      =================================== */}
      {assignment.fileUrl && (
  <section className="submitted-file-section">
    <h2>Submitted Assignment</h2>

    <p>
      The student submitted the following PDF file.
    </p>

    <a
      className="primary-button"
      href={`/api/professor/assignments/${id}/file`}
      target="_blank"
      rel="noreferrer"
    >
      📄 Open Submitted File
    </a>
  </section>
)}

      {/* ==================================
          ALREADY REVIEWED MESSAGE
      =================================== */}
      {!canReview && (

        <div className="review-status-message">

          {assignment.status ===
            "approved" && (
            <>
              <h2>
                ✓ Assignment Approved
              </h2>

              <p>
                This assignment has already
                been approved.
              </p>
            </>
          )}


          {assignment.status ===
            "rejected" && (
            <>
              <h2>
                ✕ Assignment Rejected
              </h2>

              <p>
                This assignment has already
                been rejected.
              </p>
            </>
          )}


          {assignment.status ===
            "forwarded" && (
            <>
              <h2>
                Assignment Forwarded
              </h2>

              <p>
                This assignment has been
                forwarded to the HOD for
                further review.
              </p>
            </>
          )}

        </div>

      )}


      {/* ==================================
          REVIEW FORM
      =================================== */}
      {review && canReview && (

        <form
          className="login-form review-form"
          onSubmit={submitReview}
        >

          <h2>
            Review Decision
          </h2>

          <p>
            Select whether you want to approve
            or reject this assignment.
          </p>


          {/* DECISION */}
          <label>
            Decision
          </label>

          <select
            className="form-input"
            value={decision}
            onChange={(event) =>
              setDecision(
                event.target.value
              )
            }
          >

            <option value="approved">
              Approve
            </option>

            <option value="rejected">
              Reject
            </option>

          </select>


          {/* REMARK */}
          <label>
            Remarks
          </label>

          <textarea
            className="form-input"
            value={remark}
            onChange={(event) =>
              setRemark(
                event.target.value
              )
            }
            placeholder="Enter your review remarks..."
            rows="5"
            required
          />


          {/* SIGNATURE */}
          <label>
            Signature
          </label>

          <input
            className="form-input"
            value={signature}
            onChange={(event) =>
              setSignature(
                event.target.value
              )
            }
            placeholder="Enter your signature"
            required
          />


          {/* ERROR */}
          {error && (
            <p className="api-error">
              {error}
            </p>
          )}


          {/* SUBMIT */}
          <button
            type="submit"
            className={
              decision === "approved"
                ? "approve-button"
                : "reject-button"
            }
            disabled={submitting}
          >

            {submitting
              ? "Sending OTP..."
              : "Continue to OTP Verification"}

          </button>

        </form>

      )}

    </article>
  );
}