import { useEffect, useRef, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI } from "../../lib/adminApi.js";
import { formatDateTime } from "../../lib/format.js";

export default function AuditLogs() {
  useDocumentTitle("Audit logs — Aarogyam Admin");

  const [allLogs, setAllLogs] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [search, setSearch] = useState("");
  const filterTimerRef = useRef(null);

  function loadLogs(userId) {
    setLoadError(null);
    AdminAPI.listAuditLogs(userId)
      .then((rows) => setAllLogs(rows))
      .catch((err) => setLoadError(err.message));
  }

  useEffect(() => {
    loadLogs();
  }, []);

  function handleUserIdChange(value) {
    setUserIdFilter(value);
    clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      const trimmed = value.trim();
      loadLogs(trimmed ? Number(trimmed) : undefined);
    }, 300);
  }

  function handleClearFilter() {
    setUserIdFilter("");
    loadLogs();
  }

  const term = search.trim().toLowerCase();
  const visibleLogs = (allLogs || []).filter((r) => {
    if (!term) return true;
    return (
      String(r.action).toLowerCase().includes(term) ||
      String(r.entityName).toLowerCase().includes(term) ||
      String(r.userName || "").toLowerCase().includes(term) ||
      String(r.userEmail || "").toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>Audit trail</h2>
          <p>Every recorded action across the platform, most recent first.</p>
        </div>
      </div>

      <div className="toolbar">
        <input type="text" id="userIdFilter" placeholder="Filter by user ID…" inputMode="numeric" style={{ maxWidth: "200px" }} value={userIdFilter} onChange={(e) => handleUserIdChange(e.target.value)} />
        <button className="btn btn-ghost btn-sm" id="clearFilter" type="button" onClick={handleClearFilter}>Clear</button>
        <div className="spacer"></div>
        <input type="search" id="logSearch" placeholder="Search action, entity, user name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>When</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th></tr></thead>
          <tbody id="logsBody">
            {loadError ? (
              <tr><td colSpan={5} className="table-empty">{loadError}</td></tr>
            ) : !allLogs ? (
              <tr><td colSpan={5} className="table-loading">Loading…</td></tr>
            ) : !visibleLogs.length ? (
              <tr><td colSpan={5} className="table-empty">No matching activity.</td></tr>
            ) : (
              visibleLogs.map((r, i) => (
                <tr key={i}>
                  <td>{formatDateTime(r.createdAt)}</td>
                  <td>
                    {r.userId != null ? (
                      <>
                        <div className="row-title">{r.userName || "User #" + r.userId}</div>
                        <div className="row-sub">{[r.roleName, r.userEmail].filter(Boolean).join(" • ")}</div>
                      </>
                    ) : (
                      <div className="row-sub">System</div>
                    )}
                  </td>
                  <td>{r.action}</td>
                  <td>{r.entityName}</td>
                  <td className="mono">#{r.entityId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
