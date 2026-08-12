import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI } from "../../lib/adminApi.js";
import { formatDate, formatDateTime } from "../../lib/format.js";

export default function Overview() {
  useDocumentTitle("Overview — Aarogyam Admin");
  const { refreshPendingCount } = useOutletContext();

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [pendingDoctors, setPendingDoctors] = useState(null);
  const [pendingError, setPendingError] = useState(null);
  const [recentAudit, setRecentAudit] = useState(null);
  const [auditError, setAuditError] = useState(null);

  useEffect(() => {
    AdminAPI.dashboardStats()
      .then((data) => {
        setStats(data);
        refreshPendingCount();
      })
      .catch((err) => setStatsError(err.message));
    AdminAPI.listDoctors("Pending")
      .then((rows) => setPendingDoctors(rows.slice(0, 5)))
      .catch((err) => setPendingError(err.message));
    AdminAPI.listAuditLogs()
      .then((rows) => setRecentAudit(rows.slice(0, 8)))
      .catch((err) => setAuditError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tiles = stats
    ? [
        { label: "Total users", value: stats.totalUsers },
        { label: "Patients", value: stats.totalPatients },
        { label: "Doctors", value: stats.totalDoctors },
        { label: "Pending approvals", value: stats.pendingDoctorApprovals, warn: stats.pendingDoctorApprovals > 0 },
        { label: "Hospitals", value: stats.totalHospitals },
        { label: "Total visits", value: stats.totalVisits }
      ]
    : [];

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>Platform overview</h2>
          <p>A snapshot of accounts, approvals and activity across Aarogyam.</p>
        </div>
      </div>

      <div className="stat-grid" id="statGrid">
        {statsError ? (
          <div className="form-alert error">{statsError}</div>
        ) : !stats ? (
          <div className="table-loading">Loading stats…</div>
        ) : (
          tiles.map((t) => (
            <div className={"stat-card" + (t.warn ? " warn" : "")} key={t.label}>
              <div className="stat-label">{t.label}</div>
              <div className="stat-value">{t.value}</div>
            </div>
          ))
        )}
      </div>

      <div className="page-head-row">
        <div><h2 style={{ fontSize: "17px" }}>Doctors awaiting approval</h2></div>
        <Link className="btn btn-ghost btn-sm" to="/admin/doctors?status=Pending">View all</Link>
      </div>
      <div className="table-wrap" style={{ marginBottom: "30px" }}>
        <table className="data-table">
          <thead><tr><th>Name</th><th>License</th><th>Applied</th><th></th></tr></thead>
          <tbody id="pendingDoctorsBody">
            {pendingError ? (
              <tr><td colSpan={4} className="table-empty">{pendingError}</td></tr>
            ) : !pendingDoctors ? (
              <tr><td colSpan={4} className="table-loading">Loading…</td></tr>
            ) : !pendingDoctors.length ? (
              <tr><td colSpan={4} className="table-empty">No doctors awaiting approval.</td></tr>
            ) : (
              pendingDoctors.map((d) => (
                <tr key={d.doctorId}>
                  <td>{[d.firstName, d.middleName, d.lastName].filter(Boolean).join(" ")}</td>
                  <td className="mono">{d.licenseNumber}</td>
                  <td>{formatDate(d.createdAt)}</td>
                  <td className="actions"><Link className="btn btn-ghost btn-sm" to={"/admin/doctors?doctorId=" + d.doctorId}>Review</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="page-head-row">
        <div><h2 style={{ fontSize: "17px" }}>Recent activity</h2></div>
        <Link className="btn btn-ghost btn-sm" to="/admin/audit-logs">View all</Link>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody id="recentAuditBody">
            {auditError ? (
              <tr><td colSpan={4} className="table-empty">{auditError}</td></tr>
            ) : !recentAudit ? (
              <tr><td colSpan={4} className="table-loading">Loading…</td></tr>
            ) : !recentAudit.length ? (
              <tr><td colSpan={4} className="table-empty">No activity recorded yet.</td></tr>
            ) : (
              recentAudit.map((r, i) => (
                <tr key={i}>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td className="mono">{r.userId != null ? "#" + r.userId : "—"}</td>
                  <td>{r.action}</td>
                  <td>{r.entityName} #{r.entityId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
