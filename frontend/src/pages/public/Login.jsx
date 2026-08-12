import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AarogyamAuth, isLoggedIn, getDashboardHref } from "../../lib/publicAuth.js";
import { saveSession } from "../../lib/session.js";

export default function Login() {
  useDocumentTitle("Log in — Aarogyam");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [resendEmail, setResendEmail] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      window.location.href = getDashboardHref();
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResendEmail(null);
    setSubmitting(true);
    try {
      const result = await AarogyamAuth.login({ email: email.trim(), password });
      const user = {
        userId: result.userId,
        email: result.email,
        roleName: result.roleName,
        approvalStatus: result.approvalStatus
      };
      saveSession(result.token, user);
      window.location.href = getDashboardHref(user);
    } catch (err) {
      const notVerified = /not verified/i.test(err.message || "");
      setError(err.message);
      setResendEmail(notVerified ? email.trim() : null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const result = await AarogyamAuth.resendOtp({ email: resendEmail });
      window.location.href = "/verify-otp?userId=" + result.userId + "&email=" + encodeURIComponent(resendEmail);
    } catch (err) {
      setResending(false);
      setError(err.message);
    }
  }

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="auth-head">
          <span className="eyebrow">Welcome back</span>
          <h1>Log in to Aarogyam</h1>
          <p className="lede">Access your health ID, records and prescriptions.</p>
        </div>

        <div className="auth-card">
          {error ? (
            <div className="form-alert error">
              {error}
              {resendEmail ? (
                <>
                  <br />
                  <button type="button" className="resend-link" disabled={resending} onClick={handleResend}>
                    {resending ? "Sending…" : "Resend verification code"}
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">Email<span className="req">*</span></label>
              <input id="email" name="email" type="email" placeholder="jane@mail.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password<span className="req">*</span></label>
                <Link to="/forgot-password" style={{ fontSize: "12px", color: "var(--accent)", textDecoration: "none" }}>Forgot password?</Link>
              </div>
              <input id="password" name="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button id="loginSubmit" className="btn btn-solid btn-block" type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="auth-foot">Don't have an account yet? <Link to="/register">Register here</Link></p>
      </div>
    </section>
  );
}
