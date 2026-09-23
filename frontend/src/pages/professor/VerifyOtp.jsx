import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProfessorPages.css";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/professor/review/verify-otp",
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },

          body: JSON.stringify({
            otp: otp,
          }),
        }
      );

      // Check whether backend returned JSON
      const contentType =
        response.headers.get("content-type") || "";

      let data = {};

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        console.error(
          "Non-JSON response from server:",
          text
        );

        throw new Error(
          `Server returned ${response.status} instead of JSON`
        );
      }

      console.log("OTP response:", data);

      // Backend returned an error
      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Could not verify OTP"
        );
      }

      // Successful verification
      if (data.redirect) {
        navigate(data.redirect);
      } else {
        // Fallback if backend doesn't send redirect
        navigate("/professor/dashboard");
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        err?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="student-detail">
      <p className="eyebrow">Secure review</p>

      <h1>Verify review OTP</h1>

      <p>
        Enter the six-digit code sent to{" "}
        {state?.email || "your email address"}.
      </p>

      <form
        className="login-form otp-form"
        onSubmit={submit}
      >
        <input
          className="form-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setOtp(value);
            setError("");
          }}
          placeholder="123456"
          autoComplete="one-time-code"
          required
        />

        {error && (
          <p className="api-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={loading || otp.length !== 6}
        >
          {loading
            ? "Verifying..."
            : "Verify and finish review"}
        </button>
      </form>
    </main>
  );
}