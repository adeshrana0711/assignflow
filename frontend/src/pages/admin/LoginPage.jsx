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
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ==============================
          BACKGROUND DECORATION
      =============================== */}

      <div className="background-decoration">
        <div className="orb orb-one"></div>
        <div className="orb orb-two"></div>
        <div className="orb orb-three"></div>
      </div>


      {/* ==============================
          HEADER
      =============================== */}

      <header className="login-navbar">

        <div className="navbar-logo">

          <div className="navbar-logo-box">
            AF
          </div>

          <div className="navbar-brand-text">
            <strong>AssignFlow</strong>
            <span>Academic Workflow</span>
          </div>

        </div>

        <div className="navbar-right">
          <span>New to AssignFlow?</span>

          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create account
          </button>
        </div>

      </header>


      {/* ==============================
          MAIN CONTENT
      =============================== */}

      <main className="login-main">

        {/* ==================================
            LEFT CONTENT
        =================================== */}

        <section className="login-intro">

          <div className="intro-content">

            <div className="intro-badge">
              <span className="live-dot"></span>
              Smart Academic Platform
            </div>

            <h1>
              Everything your
              <br />
              <span>academic workflow</span>
              <br />
              needs.
            </h1>

            <p>
              AssignFlow connects students, professors,
              HODs and administrators in one centralized
              platform designed to make academic work
              simpler, faster and more organized.
            </p>


            {/* Feature cards */}

            <div className="intro-features">

              <div className="intro-feature">

                <div className="feature-number">
                  01
                </div>

                <div>
                  <h3>Assignment Management</h3>

                  <p>
                    Create, submit and manage assignments
                    from one place.
                  </p>
                </div>

              </div>


              <div className="intro-feature">

                <div className="feature-number">
                  02
                </div>

                <div>
                  <h3>Review & Approval</h3>

                  <p>
                    Streamline professor reviews and
                    academic approvals.
                  </p>
                </div>

              </div>


              <div className="intro-feature">

                <div className="feature-number">
                  03
                </div>

                <div>
                  <h3>Track Everything</h3>

                  <p>
                    Stay updated with submissions,
                    notifications and progress.
                  </p>
                </div>

              </div>

            </div>

          </div>


          <div className="intro-bottom">

            <span>
              © {new Date().getFullYear()} AssignFlow
            </span>

            <span className="bottom-separator">
              |
            </span>

            <span>
              Secure Academic Workflow System
            </span>

          </div>

        </section>


        {/* ==================================
            RIGHT LOGIN
        =================================== */}

        <section className="login-form-area">

          <div className="login-form-container">


            {/* Login heading */}

            <div className="form-heading">

              <div className="form-heading-icon">

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
                </svg>

              </div>

              <div>

                <span>
                  ACCOUNT ACCESS
                </span>

                <h2>
                  Welcome back
                </h2>

              </div>

            </div>


            <p className="form-description">
              Sign in to access your AssignFlow dashboard
              and continue managing your academic workflow.
            </p>


            {/* Error */}

            {error && (

              <div className="login-error">

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
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="16.5"
                    r="0.8"
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

              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <svg
                    className="field-icon"
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
                    />
                  </svg>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

              </div>


              {/* Password */}

              <div className="form-group">

                <div className="label-row">

                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/forgot-password")
                    }
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="input-wrapper">

                  <svg
                    className="field-icon"
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
                    className="show-password"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                  >

                    {showPassword ? (

                      <svg viewBox="0 0 24 24">
                        <path
                          d="M3 3l18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 10.6a2 2 0 002.8 2.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />

                        <path
                          d="M6.1 6.1C3.8 7.8 2.6 10.3 2.5 12c1 2.5 4.5 7 9.5 7 1 0 2-.2 2.9-.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />

                        <path
                          d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7a13 13 0 01-3.1 4.3"
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

                <label>

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
                className="login-button"
                disabled={loading}
              >

                {loading ? (

                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>

                ) : (

                  <>
                    Sign in to dashboard

                    <svg viewBox="0 0 24 24">

                      <path
                        d="M5 12h14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M13 6l6 6-6 6"
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

            <div className="secure-message">

              <div className="secure-icon">

                <svg viewBox="0 0 24 24">

                  <path
                    d="M12 3l7 3v5c0 4.5-2.7 8-7 10-4.3-2-7-5.5-7-10V6l7-3z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
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

              </div>

              <div>
                <strong>
                  Secure sign in
                </strong>

                <span>
                  Your account information is protected
                  using secure authentication.
                </span>
              </div>

            </div>


            {/* Bottom */}

            <div className="form-footer">

              <span>
                © {new Date().getFullYear()} AssignFlow
              </span>

              <span>
                Privacy
              </span>

              <span>
                Terms
              </span>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default LoginPage;