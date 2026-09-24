import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentPages.css";

const ENDPOINT =
  "/api/student/assignments/bulk-upload";

export default function BulkUpload() {
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
              "X-Requested-With":
                "XMLHttpRequest",
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

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "Unable to load professors."
          );
        }

        const data =
          await response.json();

        setProfessors(
          data.professors || []
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to load professors."
        );
      }
    };

    loadProfessors();
  }, []);

  // ======================================
  // SUBMIT BULK UPLOAD
  // ======================================
  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData =
        new FormData(
          event.currentTarget
        );

      const response = await fetch(
        ENDPOINT,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (!response.ok) {
        let message =
          "Upload failed. Please try again.";

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          const data =
            await response.json();

          message =
            data.error ||
            data.message ||
            message;
        } else {
          const text =
            await response.text();

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
            Bulk Upload Assignments
          </h1>

          <p>
            Upload multiple PDF assignments
            at once.
          </p>
        </div>

        {/* Form */}
        <form
          className="student-upload-form"
          onSubmit={submit}
        >

          {/* Description */}
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

              {professors.map(
                (professor) => (
                  <option
                    key={professor._id}
                    value={professor._id}
                  >
                    {professor.name}

                    {professor.department
                      ? ` — ${professor.department}`
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Files */}
          <div className="student-upload-field">
            <label htmlFor="assignment-files">
              Upload Files (max 5 PDFs)
            </label>

            <input
              id="assignment-files"
              className="student-file-input"
              name="files"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              required
            />

            <small className="student-upload-help">
              Select up to 5 PDF files.
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
              : "Upload All"}
          </button>
        </form>
      </div>
    </div>
  );
}