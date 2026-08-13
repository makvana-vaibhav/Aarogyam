import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI, extractAarogyamId } from "../../lib/doctorApi.js";
import { formatDate } from "../../lib/format.js";

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

function ScanQrIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3z" /><path d="M17 17h4v4h-4z" /></svg>
  );
}

export default function Overview() {
  useDocumentTitle("Overview · Aarogyam Doctor");
  const { profile, requestScan } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

  const [aarogyamId, setAarogyamId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    Promise.all([DoctorAPI.dashboard(), DoctorAPI.myPatients()])
      .then(([dashboardStats, patients]) => {
        setStats(dashboardStats);
        setRecentPatients((patients || []).slice(0, 5));
      })
      .catch((err) => setStatsError(err.message));
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    setSearching(true);
    setSearchError(null);
    try {
      const rows = await DoctorAPI.searchPatients(aarogyamId.trim(), searchName.trim());
      setSearchResults(rows);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  function handleScan() {
    requestScan((scannedId) => {
      const cleanId = extractAarogyamId(scannedId);
      window.location.href = "/doctor/create-visit?aarogyamId=" + encodeURIComponent(cleanId);
    });
  }

  const heading = profile ? "Dr. " + joinName(profile) : "Doctor overview";

  return (
    <div className="pt-content pt-dash">
      <div className="page-head-row">
        <div>
          <h2 id="doctorHeading">{heading}</h2>
          <p>Today's clinical overview based on your current Aarogyam records.</p>
        </div>
        <Link className="btn btn-solid btn-sm" to="/doctor/create-visit">Create visit</Link>
      </div>

      <div className="stat-grid" id="statGrid">
        {statsError ? (
          <div className="form-alert error">{statsError}</div>
        ) : !stats ? (
          <div className="table-loading">Loading dashboard…</div>
        ) : (
          [
            { label: "Patients treated", value: stats.patientsTreated, note: "Unique patients" },
            { label: "Total visits", value: stats.totalVisits, note: "All recorded consultations" },
            { label: "Visits today", value: stats.visitsToday, note: "Recorded today" },
            { label: "Diagnoses this week", value: stats.diagnosesThisWeek, note: "Last 7 days" },
            { label: "Prescriptions this week", value: stats.prescriptionsThisWeek, note: "Last 7 days" }
          ].map((card) => (
            <div className="stat-card" key={card.label}>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="metric-note">{card.note}</div>
            </div>
          ))
        )}
      </div>

      <div className="card section-space">
        <div className="card-title">Search patients</div>
        <div className="card-sub">Search any patient by Aarogyam ID or name, or scan their QR Code to open their record.</div>
        <form id="searchForm" className="toolbar compact-top" onSubmit={handleSearch}>
          <input id="aarogyamId" type="text" placeholder="Aarogyam ID" value={aarogyamId} onChange={(e) => setAarogyamId(e.target.value)} />
          <input id="searchName" type="text" placeholder="Patient name" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          <button className="btn btn-solid btn-sm" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
          <button className="btn btn-ghost btn-sm mobile-only-inline" id="overviewScanQrBtn" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }} onClick={handleScan}>
            <ScanQrIcon />
            Scan QR
          </button>
        </form>
        <div id="searchResults" className="stack-list compact-top">
          {!searchResults && !searchError ? (
            <div className="empty-state">Run a search to view results.</div>
          ) : searchError ? (
            <div className="form-alert error">{searchError}</div>
          ) : !searchResults.length ? (
            <div className="empty-state">No patient matched that search.</div>
          ) : (
            searchResults.map((row) => (
              <div className="card result-card" key={row.patientId}>
                <div className="result-copy">
                  <div className="row-title">{joinName(row)}</div>
                  <div className="row-sub">AAID {row.aarogyamId} • {row.gender} • {row.bloodGroup || "Blood group not set"}</div>
                </div>
                <Link className="btn btn-solid btn-sm" to={"/doctor/patient?patientId=" + row.patientId}>View record</Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card section-space">
        <div className="page-head-row section-head">
          <div>
            <div className="card-title">Recent patients</div>
            <div className="card-sub">Patients you most recently consulted.</div>
          </div>
          <Link className="btn btn-ghost btn-sm" to="/doctor/my-patients">View all</Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Patient</th><th>Aarogyam ID</th><th>Last visit</th><th></th></tr></thead>
            <tbody id="recentPatientsBody">
              {statsError ? null : !stats ? (
                <tr><td colSpan={4} className="table-loading">Loading…</td></tr>
              ) : !recentPatients.length ? (
                <tr><td colSpan={4} className="table-empty">No patients found yet.</td></tr>
              ) : (
                recentPatients.map((row) => (
                  <tr key={row.patientId}>
                    <td><div className="row-title">{joinName(row)}</div><div className="row-sub">{row.bloodGroup || "Blood group not set"}</div></td>
                    <td className="mono">{row.aarogyamId}</td>
                    <td>{formatDate(row.lastVisitDate)}</td>
                    <td className="actions"><Link className="btn btn-ghost btn-sm" to={"/doctor/patient?patientId=" + row.patientId}>Open</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
