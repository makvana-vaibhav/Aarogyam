import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AarogyamAuth } from "../../lib/publicAuth.js";

export default function VerifyOtp() {
  useDocumentTitle("Verify your email — Aarogyam");

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const email = searchParams.get("email") || "";

  const [otpCode, setOtpCode] = useState("");
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const alertRef = useRef(null);

  useEffect(() => {
    if (alert) {
      setTimeout(() => {
        if (alertRef.current) {
          alertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  }, [alert]);

  useEffect(() => {
    if (!userId) {
      window.location.href = "/register";
    }
  }, [userId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await AarogyamAuth.verifyOtp({ userId: Number(userId), otpCode: otpCode.trim() });
      setSuccess("Email verified. Redirecting to login…");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setAlert(err.message);
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) {
      setAlert("Missing email — go back and register again.");
      return;
    }
    setResending(true);
    try {
      await AarogyamAuth.resendOtp({ email });
      setAlert(null);
      setSuccess("A new code has been sent to " + email + ".");
    } catch (err) {
      setSuccess(null);
      setAlert(err.message);
    } finally {
      setResending(false);
    }
  }

  if (!userId) return null;

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="auth-head">
          <span className="eyebrow">One more step</span>
          <h1>Verify your email</h1>
          <p className="lede">We sent a 6-digit code to <strong id="otpEmail">{email || "your email"}</strong>. Enter it below to activate your account.</p>
        </div>

        <div className="auth-card">
          {alert ? <div ref={alertRef} id="otpAlert" className="form-alert error" tabIndex={-1} style={{ outline: "none" }}>{alert}</div> : null}
          {success ? <div className="form-alert success">{success}</div> : null}

          <form id="otpForm" noValidate onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="otpCode">OTP code<span className="req">*</span></label>
              <input id="otpCode" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="123456" required autoFocus value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
            </div>
            <button id="otpSubmit" className="btn btn-solid btn-block" type="submit" disabled={submitting}>
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>

          <p className="auth-foot">
            Didn't get a code?{" "}
            <button id="resendBtn" type="button" className="resend-link" style={{ color: "var(--accent)" }} disabled={resending} onClick={handleResend}>
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
