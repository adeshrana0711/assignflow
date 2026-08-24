import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProfessorPages.css";

export default function VerifyOtp() {
  const navigate = useNavigate(); const { state } = useLocation(); const [otp, setOtp] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setLoading(true); setError(""); try { const response = await fetch("/professor/review/verify-otp", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }, body: JSON.stringify({ otp }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not verify OTP"); navigate(data.redirect); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  return <main className="student-detail"><p className="eyebrow">Secure review</p><h1>Verify review OTP</h1><p>Enter the six-digit code sent to {state?.email || "your email address"}.</p><form className="login-form otp-form" onSubmit={submit}><input className="form-input" inputMode="numeric" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" required />{error && <p className="api-error">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? "Verifying…" : "Verify and finish review"}</button></form></main>;
}
