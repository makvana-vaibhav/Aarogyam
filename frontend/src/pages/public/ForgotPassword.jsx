import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AarogyamAuth } from "../../lib/publicAuth.js";
import PasswordField from "../../components/PasswordField.jsx";

export default function ForgotPassword() {
  useDocumentTitle("Forgot Password — Aarogyam");

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeEmail, setActiveEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifiedOtpCode, setVerifiedOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [alert, setAlert] = useState(null);
  const [success, setSuccess] = useState(null);
  const alertRef = useRef(null);

  useEffect(() => {
    if (alert) {
      setTimeout(() => {
        if (alertRef.current) {
          alertRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          alertRef.current.focus?.();
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  }, [alert]);

  async function handleStep1(e) {
    e.preventDefault();
    setAlert(null);
    setSuccess(null);
    setSendingOtp(true);
    try {
      const res = await AarogyamAuth.forgotPassword({ email: email.trim() });
      setActiveUserId(res.userId);
      setActiveEmail(email.trim());
      setStep(2);
      setSuccess("A verification code was sent to your registered email address.");
    } catch (err) {
      setAlert(err.message);
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleStep2(e) {
    e.preventDefault();
    setAlert(null);
    setSuccess(null);
    setVerifying(true);
    try {
      await AarogyamAuth.verifyForgotOtp({
        userId: activeUserId,
        otpCode: otpCode.trim()
      });
      setVerifiedOtpCode(otpCode.trim());
      setStep(3);
      setSuccess("OTP verified! Please create a new password.");
    } catch (err) {
      setAlert(err.message);
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setAlert(null);
    setSuccess(null);
    setResending(true);
    try {
      const res = await AarogyamAuth.forgotPassword({ email: activeEmail });
      if (res.userId) setActiveUserId(res.userId);
      setSuccess("A fresh verification code was sent to " + activeEmail + ".");
    } catch (err) {
      setAlert(err.message);
    } finally {
      setResending(false);
    }
  }

  async function handleStep3(e) {
    e.preventDefault();
    setAlert(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setAlert("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert("Passwords do not match. Please re-enter.");
      return;
    }

    setResettingPassword(true);
    try {
      await AarogyamAuth.resetPassword({
        userId: activeUserId,
        otpCode: verifiedOtpCode,
        newPassword
      });
      setStep(4);
      setSuccess("Your password has been reset successfully! You can now log in.");
    } catch (err) {
      setAlert(err.message);
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
          {alert ? <div ref={alertRef} id="forgotAlert" className="form-alert error" tabIndex={-1} style={{ outline: "none" }}>{alert}</div> : null}
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
                <PasswordField id="newPassword" minLength={6} placeholder="At least 6 characters" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="form-row">
                <label htmlFor="confirmPassword">Confirm new password<span className="req">*</span></label>
                <PasswordField id="confirmPassword" minLength={6} placeholder="Re-enter new password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
