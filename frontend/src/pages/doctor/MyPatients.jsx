import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { DoctorAPI } from "../../lib/doctorApi.js";
import { formatDate } from "../../lib/format.js";

function joinName(row) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

export default function MyPatients() {
  useDocumentTitle("My Patients — Aarogyam Doctor");
  const { requestScan } = useOutletContext();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    DoctorAPI.myPatients(search.trim())
      .then((data) => setRows(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [search]);

  function handleScan() {
    requestScan((scannedId) => {
      navigate("/doctor/create-visit?aarogyamId=" + encodeURIComponent(scannedId));
    });
  }

  return (
    <div className="pt-content">
      <div className="page-head-row">
        <div>
          <h2>My patients</h2>
          <p>Patients you have already treated through Aarogyam.</p>
        </div>
      </div>
      <div className="toolbar">
        <input id="patientSearch" type="search" placeholder="Search by name or Aarogyam ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="spacer"></div>
        <button className="btn btn-solid btn-sm" id="myPatientsScanQrBtn" type="button" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }} onClick={handleScan}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3z" /><path d="M17 17h4v4h-4z" /></svg>
          Scan Patient QR
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Aarogyam ID</th><th>Total visits</th><th>Last visit</th><th></th></tr></thead>
          <tbody id="patientsBody">
            {loading ? (
              <tr><td colSpan={5} className="table-loading">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="table-empty">{error}</td></tr>
            ) : !rows.length ? (
              <tr><td colSpan={5} className="table-empty">No patients found.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.patientId}>
                  <td><div className="row-title">{joinName(row)}</div><div className="row-sub">{row.gender}</div></td>
                  <td className="mono">{row.aarogyamId}</td>
                  <td>{row.totalVisits}</td>
                  <td>{formatDate(row.lastVisitDate)}</td>
                  <td className="actions"><Link className="btn btn-ghost btn-sm" to={"/doctor/patient?patientId=" + row.patientId}>Open</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
