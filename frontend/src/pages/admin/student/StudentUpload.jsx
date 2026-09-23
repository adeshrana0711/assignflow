import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StudentPages.css";

// API endpoint
const endpoint = (bulk) =>
  bulk
    ? "/api/student/assignments/bulk-upload"
    : "/api/student/assignments/upload";

export default function StudentUpload({ bulk = false }) {
  const navigate = useNavigate();

  const [professors, setProfessors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/student/professors", {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((r) => r.json())
      .then((d) => setProfessors(d.professors || []))
      .catch(() => setError("Unable to load professors."));
  }, []);

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(endpoint(bulk), {
        method: "POST",
        credentials: "include",
        body: new FormData(event.currentTarget),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      navigate("/student/dashboard");
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-ejs-page">
      <div className="student-upload-card">

        <Link
          to="/student/dashboard"
          className="student-back"
        >
          ← Back to Dashboard
        </Link>

        <h1>
          {bulk ? "Bulk Upload Assignments" : "Upload Assignment"}
        </h1>

        <form onSubmit={submit}>

          {bulk ? (
            <label>
              Common Description
              <textarea
                name="description"
                rows="3"
              />
            </label>
          ) : (
            <>
              <label>
                Title
                <input
                  name="title"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  rows="3"
                />
              </label>
            </>
          )}

          <label>
            Category
            <select
              name="category"
              defaultValue="Assignment"
            >
              <option>Assignment</option>
              <option>Thesis</option>
              <option>Report</option>
            </select>
          </label>

          <label>
            Select Reviewer (Professor)

            <select
              name="reviewerId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Choose a professor
              </option>

              {professors.map((p) => (
                <option
                  key={p._id}
                  value={p._id}
                >
                  {p.name} — {p.department}
                </option>
              ))}
            </select>
          </label>

          <label>
            {bulk
              ? "Upload Files (max 5 PDFs)"
              : "Upload PDF"}

            <input
              name={bulk ? "files" : "file"}
              type="file"
              accept="application/pdf"
              multiple={bulk}
              required
            />
          </label>

          {error && (
            <p className="api-error">
              {error}
            </p>
          )}

          <button
            className="student-submit"
            disabled={loading}
          >
            {loading
              ? "Uploading…"
              : bulk
              ? "Upload All"
              : "Upload"}
          </button>

        </form>
      </div>
    </div>
  );
}