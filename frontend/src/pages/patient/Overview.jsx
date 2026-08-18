import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { PatientAPI } from "../../lib/patientApi.js";
import { formatDate, downloadBlob } from "../../lib/format.js";
import { useHealthCard } from "../../lib/useHealthCard.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function Overview() {
  useDocumentTitle("Overview · Aarogyam Patient");
  const showToast = useToast();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [visits, setVisits] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [error, setError] = useState(null);

  const { qrUrl, qrError, downloadCard, joinName } = useHealthCard(profile);

  useEffect(() => {
    Promise.all([PatientAPI.dashboard(), PatientAPI.profile(), PatientAPI.visits(), PatientAPI.diagnoses()])
      .then(([dashboardStats, profileData, visitRows, diagnosisRows]) => {
        setStats(dashboardStats);
        setProfile(profileData);
        setVisits(visitRows || []);
        setDiagnoses(diagnosisRows || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function handleDownloadCard() {
    try {
      await downloadCard();
    } catch (err) {
      showToast("Could not generate the health card image.", true);
    }
  }

  async function handleCopyId() {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.aarogyamId);
      showToast("Aarogyam ID copied.");
    } catch (err) {
      showToast("Could not copy: " + profile.aarogyamId, true);
    }
  }

  async function handleDownloadPdf() {
    try {
      const file = await PatientAPI.downloadProfilePdf();
      downloadBlob(file.blob, file.fileName || "aarogyam-profile.pdf");
    } catch (err) {
      showToast(err.message, true);
    }
  }

  if (error) {
    return (
      <div className="pt-content pt-dash">
        <div className="form-alert error">{error}</div>
      </div>
    );
  }

  const diagnosisByVisitId = {};
  diagnoses.forEach((d) => {
    (diagnosisByVisitId[d.visitId] = diagnosisByVisitId[d.visitId] || []).push(d);
  });
  const recentVisits = visits.slice(0, 3);

  return (
    <div className="pt-content pt-dash">
      <div className="page-head-row">
        <div>
          <h2 id="welcomeHeading">{profile ? "Good day, " + profile.firstName : "Good day"}</h2>
          <p>A quick snapshot of your health record.</p>
        </div>
      </div>

      <div className="stat-grid" id="statGrid">
        {!stats ? (
          <div className="table-loading">Loading dashboard…</div>
        ) : (
          [
            { label: "Total visits", value: stats.totalVisits, note: stats.lastVisitDate ? "Last visit " + formatDate(stats.lastVisitDate) : "No visits yet" },
            { label: "Prescriptions", value: stats.totalPrescriptions, note: "Issued during consultations" },
            { label: "Reports", value: stats.totalReports, note: stats.reportsThisMonth + " added this month" },
            { label: "Diagnoses", value: stats.totalDiagnoses, note: "Recorded on your history" }
          ].map((card) => (
            <div className="stat-card" key={card.label}>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="metric-note">{card.note}</div>
            </div>
          ))
        )}
      </div>

      <div className="grid-2 grid-2-equal dashboard-grid">
        <div className="card">
          <div className="card-title">Aarogyam health card</div>
          <div className="card-sub">Scan this at any registered facility.</div>
          <div className="health-card compact-top">
            <div className="hc-head"><b>AAROGYAM · HEALTH IDENTITY</b></div>
            <div className="hc-body">
              <div className="hc-info" id="healthCardInfo">
                {profile ? (
                  <>
                    <div className="cap">Patient</div>
                    <div className="card-title">{joinName(profile)}</div>
                    <div className="card-sub">Aarogyam ID {profile.aarogyamId}</div>
                    <div className="card-sub">{profile.email}</div>
                    <div className="cap card-cap-spaced">Blood group</div>
                    <div>{profile.bloodGroup || "Not set"}</div>
                    <div className="cap card-cap-spaced">Mobile number</div>
                    <div>{profile.phoneNumber || "Not added"}</div>
                    <div className="cap card-cap-spaced">Emergency contact</div>
                    <div>{profile.emergencyContact || "Not added"}</div>
                  </>
                ) : null}
              </div>
              <div className="hc-qr"><img id="healthCardQr" alt="Patient health card QR code" src={qrUrl || undefined} /></div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Quick actions</div>
          <div className="card-sub">Manage your Aarogyam ID and profile.</div>
          <div className="quick-actions compact-top">
            <button className="quick-action-btn" id="downloadCardBtn" type="button" onClick={handleDownloadCard}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0l-4-4m4 4l4-4" /><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" /></svg>
              Download Aarogyam card
            </button>
            <button className="quick-action-btn" id="copyAarogyamIdBtn" type="button" onClick={handleCopyId}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V5a1 1 0 0 1 1-1h11" /></svg>
              Copy Aarogyam ID
            </button>
            <button className="quick-action-btn" id="downloadProfilePdfBtn" type="button" onClick={handleDownloadPdf}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></svg>
              Download profile PDF
            </button>
            <Link className="quick-action-btn" to="/patient/profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" /></svg>
              View full profile
            </Link>
          </div>
        </div>
      </div>

      <div className="card section-space">
        <div className="page-head-row section-head">
          <div>
            <div className="card-title">Recent visits</div>
            <div className="card-sub">Your most recent consultations.</div>
          </div>
          <Link className="btn btn-ghost btn-sm" to="/patient/medical-history">View full history</Link>
        </div>
        <div id="timelineList" className="timeline">
          {!stats ? (
            <div className="table-loading">Loading visits…</div>
          ) : !visits.length ? (
            <div className="empty-state">No visits recorded yet.</div>
          ) : (
            recentVisits.map((visit) => {
              const visitDiagnoses = diagnosisByVisitId[visit.visitId] || [];
              return (
                <div className="timeline-item" key={visit.visitId}>
                  <div className="timeline-head">
                    <b>{formatDate(visit.visitDate)}</b>
                  </div>
                  <div className="timeline-body">{(visit.notes || "Consultation notes were not added for this visit.").slice(0, 160)}</div>
                  {visitDiagnoses.length ? (
                    <div className="timeline-tags">
                      {visitDiagnoses.map((d) => (
                        <span className="badge ok" key={d.diagnosisId}>{d.diagnosisTitle}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
