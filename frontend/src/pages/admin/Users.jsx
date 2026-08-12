import { useEffect, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { AdminAPI } from "../../lib/adminApi.js";
import { formatDateTime } from "../../lib/format.js";
import { useToast } from "../../context/ToastContext.jsx";

const FILTER_TABS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "unverified", label: "Unverified" }
];

export default function Users() {
  useDocumentTitle("Users — Aarogyam Admin");
  const showToast = useToast();

  const [roleNames, setRoleNames] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    Promise.all([AdminAPI.master("roles").list(), AdminAPI.listUsers()])
      .then(([roles, users]) => {
        const map = {};
        roles.forEach((r) => (map[r.roleId] = r.roleName));
        setRoleNames(map);
        setAllUsers(users);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function matchesFilter(u) {
    if (filter === "active") return u.isActive;
    if (filter === "inactive") return !u.isActive;
    if (filter === "unverified") return !u.isEmailVerified;
    return true;
  }

  function matchesSearch(u, term) {
    if (!term) return true;
    const lower = term.toLowerCase();
    return String(u.email || "").toLowerCase().includes(lower) || String(u.phoneNumber || "").toLowerCase().includes(lower);
  }

  const visibleUsers = allUsers.filter((u) => matchesFilter(u) && matchesSearch(u, search.trim()));

  async function toggleUser(userId) {
    const current = allUsers.find((u) => u.userId === userId);
    if (!current) return;
    setTogglingId(userId);
    try {
      const action = current.isActive ? AdminAPI.deactivateUser : AdminAPI.activateUser;
      await action(userId);
      setAllUsers((rows) => rows.map((u) => (u.userId === userId ? { ...u, isActive: !u.isActive } : u)));
      showToast("User " + (current.isActive ? "deactivated" : "activated") + ".");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <>
      <div className="page-head-row">
        <div>
          <h2>All users</h2>
          <p>Every account on the platform, across all roles.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs" id="statusTabs">
          {FILTER_TABS.map((tab) => (
            <button key={tab.value} className={filter === tab.value ? "active" : ""} onClick={() => setFilter(tab.value)}>{tab.label}</button>
          ))}
        </div>
        <div className="spacer"></div>
        <input type="search" id="userSearch" placeholder="Search by email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Email</th><th>Phone</th><th>Role</th><th>Verified</th><th>Status</th><th>Last login</th><th></th></tr></thead>
          <tbody id="usersBody">
            {loading ? (
              <tr><td colSpan={7} className="table-loading">Loading…</td></tr>
            ) : loadError ? (
              <tr><td colSpan={7} className="table-empty">{loadError}</td></tr>
            ) : !visibleUsers.length ? (
              <tr><td colSpan={7} className="table-empty">No users match this view.</td></tr>
            ) : (
              visibleUsers.map((u) => (
                <tr key={u.userId}>
                  <td>{u.email}</td>
                  <td className="mono">{u.phoneNumber || "—"}</td>
                  <td>{roleNames[u.roleId] || "#" + u.roleId}</td>
                  <td>{u.isEmailVerified ? <span className="badge ok">Verified</span> : <span className="badge pending">Unverified</span>}</td>
                  <td>{u.isActive ? <span className="badge ok">Active</span> : <span className="badge bad">Inactive</span>}</td>
                  <td>{formatDateTime(u.lastLoginAt)}</td>
                  <td className="actions">
                    <button
                      className={"btn btn-sm " + (u.isActive ? "btn-danger" : "btn-solid")}
                      disabled={togglingId === u.userId}
                      onClick={() => toggleUser(u.userId)}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
