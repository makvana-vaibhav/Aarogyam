import { useEffect, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { doctorLogout, DoctorAPI } from "../../lib/doctorApi.js";
import { getUser } from "../../lib/session.js";
import { joinName } from "../../lib/format.js";

export default function DoctorPendingApproval({ profile }) {
  useDocumentTitle("Account Pending Approval · Aarogyam");

  const sessionUser = getUser();
  const [hospitalName, setHospitalName] = useState(profile?.hospitalName || "");

  useEffect(() => {
    if (profile?.hospitalId && !hospitalName) {
      DoctorAPI.hospitals()
        .then((list) => {
          const match = (list || []).find((h) => h.hospitalId === profile.hospitalId);
          if (match) setHospitalName(match.hospitalName);
        })
        .catch(() => {});
    }
  }, [profile?.hospitalId, hospitalName]);

  const doctorName = profile ? "Dr. " + joinName(profile) : (sessionUser?.name ? "Dr. " + sessionUser.name : "Doctor");
  const email = profile?.email || sessionUser?.email || "Submitted during registration";
  const displayHospital = hospitalName || profile?.hospitalName || (profile?.hospitalId ? "Hospital #" + profile.hospitalId : "Registered Healthcare Facility");

  return (
    <div className="pt-content" style={{ maxWidth: "680px", margin: "40px auto 80px", padding: "0 16px" }}>
      <div className="card" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(234, 179, 8, 0.15)",
            color: "#eab308",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "var(--ink)" }}>Application Under Review</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: "14.5px", maxWidth: "480px", margin: "0 auto 24px", lineHeight: 1.5 }}>
          Welcome, <strong>{doctorName}</strong>. Your doctor profile has been submitted and is currently awaiting verification by the Aarogyam Medical Board.
        </p>

        <div style={{ background: "var(--bg-raised)", borderRadius: "8px", padding: "16px 20px", textAlign: "left", marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", fontFamily: "var(--mono)", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: "10px", letterSpacing: "0.08em" }}>
            Submitted Credentials
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13.5px" }}>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>License: </span>
              <strong>{profile?.licenseNumber || "Submitted"}</strong>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Status: </span>
              <span className="badge" style={{ background: "rgba(234, 179, 8, 0.2)", color: "#ca8a04", fontWeight: 600 }}>
                Pending Review
              </span>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Email: </span>
              <span>{email}</span>
            </div>
            <div>
              <span style={{ color: "var(--ink-faint)" }}>Hospital: </span>
              <span>{displayHospital}</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: "var(--ink-faint)", marginBottom: "24px" }}>
          Clinical features (patient records, prescription creation, visit recording) will unlock immediately once approved.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button className="btn btn-ghost" type="button" onClick={doctorLogout}>
            Log out
          </button>
          <a className="btn btn-solid" href="mailto:support@aarogyam.health">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
