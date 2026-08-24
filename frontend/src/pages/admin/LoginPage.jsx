import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: new URLSearchParams(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to sign in");
      navigate(data.redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-backdrop" />
      <main className="login-card">
        <div className="brand-icon">
          <div className="brand-ring">
            <svg viewBox="0 0 24 24" className="brand-svg" aria-hidden="true">
              <path
                d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 13v2m-5 3h10a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="login-header">
          <h1>AssignFlow Login</h1>
          <p>Welcome back! Please login to your account.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <div className="input-group">
            <span className="input-icon">✉</span>
            <input id="email" name="email" type="email" placeholder="admin@uni.com" required />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>

          {error && <p className="api-error" role="alert">{error}</p>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Signing in…" : "Login to Dashboard"}
          </button>
        </form>

        <p className="login-footer">© {new Date().getFullYear()} AssignFlow System</p>
      </main>
    </div>
  )
}

export default LoginPage;
