import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI, getToken, getUser, saveSession } from "../../lib/adminApi.js";

export default function Login() {
  useDocumentTitle("Admin login — Aarogyam");
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const existingUser = getUser();
    if (getToken() && existingUser && String(existingUser.roleName).toLowerCase() === "admin") {
      window.location.href = "/admin";
      return;
    }
    if (searchParams.get("expired") === "1") {
      setAlert("Your session expired. Please log in again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setSubmitting(true);
    try {
      const result = await AdminAPI.login({ email: email.trim(), password });
      if (String(result.roleName).toLowerCase() !== "admin") {
        setAlert("This account does not have admin access.");
        return;
      }
      saveSession(result.token, { userId: result.userId, email: result.email, roleName: result.roleName });
      window.location.href = "/admin";
    } catch (err) {
      setAlert(err.message || "Log in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="auth-brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" />
            <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aarogyam <small>Admin</small>
        </div>

        <div className="auth-head">
          <span className="eyebrow">Administrator access</span>
          <h1>Sign in to the admin panel</h1>
          <p>Doctor approvals, user management and platform data.</p>
        </div>

        <div className="auth-card">
          {alert ? <div className="form-alert error">{alert}</div> : null}

          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="email">Email<span className="req">*</span></label>
              <input id="email" name="email" type="email" placeholder="admin@aarogyam.health" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-row">
              <label htmlFor="password">Password<span className="req">*</span></label>
              <input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button id="loginSubmit" className="btn btn-solid btn-block" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Log in"}</button>
          </form>
        </div>

        <p className="auth-foot">Admin accounts are provisioned separately and cannot self-register.</p>
      </div>
    </section>
  );
}
