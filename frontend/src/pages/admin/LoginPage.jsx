import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: new URLSearchParams(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in");
      }

      navigate(data.redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">

      {/* Animated background */}
      <div className="page-backdrop">
        <div className="floating-shape shape-one"></div>
        <div className="floating-shape shape-two"></div>
        <div className="floating-shape shape-three"></div>
      </div>

      <main className="login-container">

        {/* =====================================
            LEFT BRANDING SECTION
        ====================================== */}

        <section className="login-showcase">

          <div className="showcase-content">

            {/* Logo */}
            <div className="brand">
              <div className="brand-logo">
                AF
              </div>

              <div>
                <h2>AssignFlow</h2>
                <span>Academic Workflow System</span>
              </div>
            </div>

            {/* Main heading */}
            <div className="showcase-heading">

              <div className="welcome-badge">
                <span className="badge-dot"></span>
                Smart Academic Management
              </div>

              <h1>
                Simplify your
                <br />

                <span>academic workflow.</span>
              </h1>

              <p>
                AssignFlow brings students, professors and
                administrators together in one secure platform
                for managing assignments, submissions and
                academic reviews.
              </p>

            </div>

            {/* Features */}
            <div className="feature-list">

              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <strong>Secure & Reliable</strong>
                  <p>
                    Your academic data stays protected.
                  </p>
                </div>
              </div>


              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M4 19V5M4 19h16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 15l3-4 3 2 5-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <strong>Track Progress</strong>
                  <p>
                    Monitor assignments and submissions easily.
                  </p>
                </div>
              </div>


              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24">
                    <path
                      d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="9"
                      cy="7"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div>
                  <strong>Connected Campus</strong>
                  <p>
                    One platform for every academic role.
                  </p>
                </div>
              </div>

            </div>

          </div>

          <div className="showcase-footer">
            <span>© {new Date().getFullYear()} AssignFlow</span>
            <span>Academic Workflow System</span>
          </div>

        </section>


        {/* =====================================
            RIGHT LOGIN SECTION
        ====================================== */}

        <section className="login-section">

          <div className="login-card">

            {/* Mobile logo */}
            <div className="mobile-brand">
              <div className="brand-logo">
                AF
              </div>

              <span>AssignFlow</span>
            </div>


            {/* Login header */}
            <div className="login-header">

              <div className="login-icon">
                <svg viewBox="0 0 24 24">
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M8 10V7a4 4 0 018 0v3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="15"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <p className="login-eyebrow">
                  Welcome back
                </p>

                <h1>Sign in to AssignFlow</h1>

                <p className="login-description">
                  Access your academic workspace and continue
                  where you left off.
                </p>
              </div>

            </div>


            {/* Error */}
            {error && (
              <div className="api-error" role="alert">

                <svg viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M12 8v5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="16.5"
                    r=".8"
                    fill="currentColor"
                  />
                </svg>

                <span>{error}</span>

              </div>
            )}


            {/* Form */}
            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* Email */}
              <div className="form-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-group">

                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M3 7l9 6 9-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* Password */}
              <div className="form-field">

                <div className="password-label">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-button"
                    onClick={() => {
                      navigate("/forgot-password");
                    }}
                  >
                    Forgot password?
                  </button>

                </div>

                <div className="input-group">

                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M8 10V7a4 4 0 018 0v3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 10.6a2 2 0 002.8 2.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <path
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7a13 13 0 01-3.1 4.3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />

                        <path
                          d="M6.1 6.1C3.8 7.8 2.6 10.3 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24">
                        <path
                          d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />
                      </svg>
                    )}

                  </button>

                </div>

              </div>


              {/* Remember */}
              <div className="remember-row">

                <label className="remember-check">

                  <input
                    type="checkbox"
                    name="remember"
                  />

                  <span>
                    Keep me signed in
                  </span>

                </label>

              </div>


              {/* Submit */}
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>
                      Sign in to Dashboard
                    </span>

                    <svg viewBox="0 0 24 24">
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}

              </button>

            </form>


            {/* Security */}
            <div className="security-note">

              <svg viewBox="0 0 24 24">
                <path
                  d="M12 3l7 3v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 12l2 2 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span>
                Your connection is secure and your account
                information is protected.
              </span>

            </div>


            <div className="login-footer">

              <span>
                © {new Date().getFullYear()} AssignFlow System
              </span>

              <span className="footer-dot">•</span>

              <span>
                Secure Academic Platform
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default LoginPage;