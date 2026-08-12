import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { doctorLogout } from "../../lib/doctorApi.js";
import { joinName } from "../../lib/format.js";

export default function DoctorRejected({ profile }) {
  useDocumentTitle("Application Status — Aarogyam");

  const doctorName = profile ? "Dr. " + joinName(profile) : "Doctor";
  const rejectionReason = profile?.rejectionReason || "Credentials or verification documents did not meet verification criteria.";

  return (
    <div className="pt-content" style={{ maxWidth: "680px", margin: "40px auto 80px", padding: "0 16px" }}>
      <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(220, 38, 38, 0.12)",
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "var(--ink)" }}>Application Not Approved</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: "14.5px", maxWidth: "480px", margin: "0 auto 20px", lineHeight: 1.5 }}>
          Hello <strong>{doctorName}</strong>. Following review by the Aarogyam Medical Board, your application could not be approved at this time.
        </p>

        {/* Reason Box */}
        <div
          style={{
            background: "rgba(220, 38, 38, 0.06)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "8px",
            padding: "16px 20px",
            textAlign: "left",
            marginBottom: "24px"
          }}
        >
          <div style={{ fontSize: "12px", fontFamily: "var(--mono)", textTransform: "uppercase", color: "#dc2626", fontWeight: 600, marginBottom: "6px", letterSpacing: "0.08em" }}>
            Reason for Rejection
          </div>
          <div style={{ fontSize: "14px", color: "var(--ink)", lineHeight: 1.5 }}>
            {rejectionReason}
          </div>
        </div>

        <div style={{ background: "var(--bg-raised)", borderRadius: "8px", padding: "16px 20px", textAlign: "left", marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", fontFamily: "var(--mono)", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "10px", letterSpacing: "0.08em" }}>
            Application Summary
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13.5px" }}>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>License: </span>
              <strong>{profile?.licenseNumber || "—"}</strong>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Status: </span>
              <span className="badge" style={{ background: "rgba(220, 38, 38, 0.15)", color: "#dc2626", fontWeight: 600 }}>
                Rejected
              </span>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Email: </span>
              <span>{profile?.email || "—"}</span>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Hospital: </span>
              <span>{profile?.hospitalName || "—"}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--ink-faint)", marginBottom: "24px" }}>
          If you believe this is an error or would like to submit corrected documentation, please contact our support team.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button className="btn btn-ghost" type="button" onClick={doctorLogout}>
            Log out
          </button>
          <a className="btn btn-solid" href="mailto:support@aarogyam.health?subject=Doctor%20Application%20Review%20Request">
            Contact Support &amp; Appeal
          </a>
        </div>
      </div>
    </div>
  );
}
