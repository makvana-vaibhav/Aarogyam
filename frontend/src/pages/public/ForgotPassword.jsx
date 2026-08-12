import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AarogyamAuth } from "../../lib/publicAuth.js";

export default function ForgotPassword() {
  useDocumentTitle("Forgot Password — Aarogyam");

  const [step, setStep] = useState(1);
  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(null);

  const [email, setEmail] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeEmail, setActiveEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifiedOtpCode, setVerifiedOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  function hideAlerts() {
    setAlert(null);
    setSuccess(null);
  }

  async function handleStep1(e) {
    e.preventDefault();
    hideAlerts();
    const trimmed = email.trim();
    if (!trimmed) {
      setAlert("Please enter your email address.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await AarogyamAuth.forgotPassword({ email: trimmed });
      setActiveUserId(res.userId);
      setActiveEmail(trimmed);
      setSuccess("Verification code sent! Check your inbox.");
      setStep(2);
    } catch (err) {
      setAlert(err.message || "Failed to send verification code.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleResend() {
    if (!activeEmail) return;
    hideAlerts();
    setResending(true);
    try {
      await AarogyamAuth.forgotPassword({ email: activeEmail });
      setSuccess("A new verification code has been sent to " + activeEmail);
    } catch (err) {
      setAlert(err.message || "Failed to resend verification code.");
    } finally {
      setResending(false);
    }
  }

  async function handleStep2(e) {
    e.preventDefault();
    hideAlerts();
    const trimmed = otpCode.trim();
    if (!trimmed) {
      setAlert("Please enter the 6-digit OTP code.");
      return;
    }
    setVerifying(true);
    try {
      await AarogyamAuth.verifyForgotOtp({ userId: activeUserId, otpCode: trimmed });
      setVerifiedOtpCode(trimmed);
      setSuccess("OTP code verified successfully!");
      setStep(3);
    } catch (err) {
      setAlert(err.message || "Invalid or expired OTP code. Please enter the correct code.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleStep3(e) {
    e.preventDefault();
    hideAlerts();
    if (!newPassword || newPassword.length < 6) {
      setAlert("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert("Passwords do not match. Please re-enter.");
      return;
    }
    setResettingPassword(true);
    try {
      const res = await AarogyamAuth.resetPassword({
        userId: activeUserId,
        otpCode: verifiedOtpCode,
        newPassword
      });
      setSuccess(res.message || "Password reset successfully! You can now log in.");
      setStep(4);
    } catch (err) {
      setAlert(err.message || "Failed to reset password.");
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="auth-head">
          <span className="eyebrow">Account recovery</span>
          <h1>Reset your password</h1>
          <p className="lede">Follow the verification steps below to securely reset your account password.</p>
        </div>

        <div className="auth-card">
          {alert ? <div className="form-alert error">{alert}</div> : null}
          {success ? <div className="form-alert success">{success}</div> : null}

          {step === 1 ? (
            <form id="step1Form" noValidate onSubmit={handleStep1}>
              <div className="form-row">
                <label htmlFor="resetEmail">Email address<span className="req">*</span></label>
                <input id="resetEmail" type="email" placeholder="e.g. doctor@aarogyam.com" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button id="sendOtpBtn" className="btn btn-solid btn-block" type="submit" disabled={sendingOtp}>
                {sendingOtp ? "Sending code…" : "Send verification code"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form id="step2Form" noValidate onSubmit={handleStep2}>
              <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", marginBottom: "20px" }}>
                A 6-digit verification code was sent to <strong id="sentEmailDisplay" style={{ color: "var(--ink)" }}>{activeEmail}</strong>.
              </p>
              <div className="form-row">
                <label htmlFor="otpCode">OTP verification code<span className="req">*</span></label>
                <input id="otpCode" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10} placeholder="123456" required autoComplete="one-time-code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
              </div>
              <button id="verifyOtpBtn" className="btn btn-solid btn-block" type="submit" disabled={verifying}>
                {verifying ? "Verifying code…" : "Verify code"}
              </button>

              <div style={{ marginTop: "14px", textAlign: "center" }}>
                <button id="resendResetOtpBtn" type="button" className="btn btn-ghost btn-sm" style={{ fontSize: "12.5px" }} disabled={resending} onClick={handleResend}>
                  {resending ? "Resending…" : "Resend code"}
                </button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <form id="step3Form" noValidate onSubmit={handleStep3}>
              <div style={{ background: "var(--bg-raised)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", color: "var(--accent)", fontWeight: 600 }}>✓ OTP verified successfully!</span>
                <div style={{ fontSize: "12.5px", color: "var(--ink-soft)", marginTop: "2px" }}>Enter your new password below.</div>
              </div>
              <div className="form-row">
                <label htmlFor="newPassword">New password<span className="req">*</span></label>
                <input id="newPassword" type="password" minLength={6} placeholder="At least 6 characters" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="confirmPassword">Confirm new password<span className="req">*</span></label>
                <input id="confirmPassword" type="password" minLength={6} placeholder="Re-enter new password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <button id="resetPasswordBtn" className="btn btn-solid btn-block" type="submit" disabled={resettingPassword}>
                {resettingPassword ? "Setting new password…" : "Set new password"}
              </button>
            </form>
          ) : null}

          {step === 4 ? (
            <div id="successBox" style={{ textAlign: "center", padding: "10px 0" }}>
              <Link className="btn btn-solid btn-block" to="/login">Proceed to Login</Link>
            </div>
          ) : null}
        </div>

        <p className="auth-foot">Remembered your password? <Link to="/login">Log in here</Link></p>
      </div>
    </section>
  );
}
