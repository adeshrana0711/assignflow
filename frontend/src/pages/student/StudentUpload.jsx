import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentPages.css";

const endpoint = (bulk) =>
  bulk
    ? "/student/assignments/bulk-upload"
    : "/student/assignments/upload";

export default function StudentUpload({ bulk = false }) {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ======================================
  // LOAD PROFESSORS
  // ======================================
  useEffect(() => {
    const loadProfessors = async () => {
      try {
        setError("");

        const response = await fetch(
          "/api/student/professors",
          {
            credentials: "include",
            headers: {
              Accept: "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          throw new Error(
            "Unable to load professors."
          );
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            "Unable to load professors."
          );
        }

        const data = await response.json();
        setProfessors(data.professors || []);
      } catch (err) {
        setError(
          err.message || "Unable to load professors."
        );
      }
    };

    loadProfessors();
  }, []);

  // ======================================
  // SUBMIT FORM
  // ======================================
  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new FormData(
        event.currentTarget
      );

      const response = await fetch(
        endpoint(bulk),
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!response.ok) {
        let message = "Upload failed. Please try again.";

        if (contentType.includes("application/json")) {
          const data = await response.json();
          message =
            data.error ||
            data.message ||
            message;
        } else {
          const text = await response.text();

          if (text) {
            message = text;
          }
        }

        throw new Error(message);
      }

      navigate("/student/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-upload-page">
      <div className="student-upload-container">
        {/* Back */}
        <Link
          to="/student/dashboard"
          className="student-upload-back"
        >
          ← Back to Dashboard
        </Link>

        {/* Heading */}
        <div className="student-upload-heading">
          <h1>
            {bulk
              ? "Bulk Upload Assignments"
              : "Upload Assignment"}
          </h1>

          <p>
            {bulk
              ? "Upload multiple PDF assignments at once."
              : "Submit your assignment for professor review."}
          </p>
        </div>

        {/* Form */}
        <form
          className="student-upload-form"
          onSubmit={submit}
        >
          {/* Normal Upload */}
          {!bulk && (
            <>
              <div className="student-upload-field">
                <label htmlFor="title">
                  Title
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  autoComplete="off"
                />
              </div>

              <div className="student-upload-field">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                />
              </div>
            </>
          )}

          {/* Bulk Description */}
          {bulk && (
            <div className="student-upload-field">
              <label htmlFor="description">
                Common Description
              </label>

              <textarea
                id="description"
                name="description"
                rows="5"
              />
            </div>
          )}

          {/* Category */}
          <div className="student-upload-field">
            <label htmlFor="category">
              Category
            </label>

            <select
              id="category"
              name="category"
              defaultValue="Assignment"
              required
            >
              <option value="Assignment">
                Assignment
              </option>

              <option value="Thesis">
                Thesis
              </option>

              <option value="Report">
                Report
              </option>
            </select>
          </div>

          {/* Reviewer */}
          <div className="student-upload-field">
            <label htmlFor="reviewerId">
              Select Reviewer (Professor)
            </label>

            <select
              id="reviewerId"
              name="reviewerId"
              defaultValue=""
              required
            >
              <option
                value=""
                disabled
              >
                Choose a professor
              </option>

              {professors.map((professor) => (
                <option
                  key={professor._id}
                  value={professor._id}
                >
                  {professor.name}
                  {professor.department
                    ? ` — ${professor.department}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* File */}
          <div className="student-upload-field">
            <label htmlFor="assignment-file">
              {bulk
                ? "Upload Files (max 5 PDFs)"
                : "Upload PDF"}
            </label>

            <input
              id="assignment-file"
              className="student-file-input"
              name={bulk ? "files" : "file"}
              type="file"
              accept="application/pdf,.pdf"
              multiple={bulk}
              required
            />

            <small className="student-upload-help">
              {bulk
                ? "Select up to 5 PDF files."
                : "Only PDF files are allowed."}
            </small>
          </div>

          {/* Error */}
          {error && (
            <div className="student-upload-error">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="student-upload-submit"
            disabled={loading}
          >
            {loading
              ? "Uploading..."
              : bulk
              ? "Upload All"
              : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}