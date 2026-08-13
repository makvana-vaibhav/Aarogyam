import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AdminAPI, requireAdminAuth, performAdminLogout } from "../lib/adminApi.js";
import PwaInstallPrompt from "./PwaInstallPrompt.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";

const NAV_ITEMS = [
  { section: "General", links: [
    { to: "/admin", label: "Overview", end: true, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" /><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" /><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" /><rect x="13" y="13" width="7.5" height="7.5" rx="1.5" /></svg>
    ) }
  ]},
  { section: "Management", links: [
    { to: "/admin/doctors", label: "Doctors", badge: true, icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v4a3 3 0 0 0 6 0V3" /><path d="M9 5H7a2 2 0 0 0-2 2v3a5 5 0 0 0 10 0V7a2 2 0 0 0-2-2h-2" /><circle cx="18" cy="16" r="3" /><path d="M5 16a3 3 0 0 1 3-3" /><path d="M5 21v-2a3 3 0 0 1 3-3" /></svg>
    ) },
    { to: "/admin/users", label: "Users", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="17.5" cy="8.5" r="2.4" /><path d="M15 14.2c2.6.4 4.5 2.6 4.5 5.3" /></svg>
    ) },
    { to: "/admin/patients", label: "Patients", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" /><path d="M5 16c.6-1.8 2-2.8 3.5-2.8s2.9 1 3.5 2.8" /><path d="M15 10h4M15 13.5h4" /></svg>
    ) }
  ]},
  { section: "Configuration", links: [
    { to: "/admin/master-data", label: "Master data", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" /><path d="M4.5 5.5V12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V5.5" /><path d="M4.5 12v6.5c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V12" /></svg>
    ) },
    { to: "/admin/audit-logs", label: "Audit logs", icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
    ) }
  ]}
];

const PAGE_TITLES = {
  "/admin": "Overview",
  "/admin/doctors": "Doctors",
  "/admin/users": "Users",
  "/admin/patients": "Patients",
  "/admin/master-data": "Master data",
  "/admin/audit-logs": "Audit logs"
};

export default function AdminLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const current = requireAdminAuth();
    if (!current) return;
    setUser(current);
    AdminAPI.dashboardStats()
      .then((stats) => setPendingCount(stats.pendingDoctorApprovals || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", sidebarOpen);
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const title = PAGE_TITLES[location.pathname] || "Aarogyam Admin";

  return (
    <ToastProvider>
      <OfflineIndicator />
      <div className="sidebar-scrim" id="sidebarScrim" onClick={closeSidebar}></div>

      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" />
            <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aarogyam <small>Admin</small>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <div className="nav-label">{group.section}</div>
              {group.links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} onClick={closeSidebar}>
                  {link.icon}
                  {link.label}
                  {link.badge ? (
                    <span className="nav-count" id="navPendingCount" hidden={pendingCount <= 0}>{pendingCount}</span>
                  ) : null}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">Aarogyam Admin</div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="sidebar-toggle" id="sidebarToggle" aria-label="Menu" onClick={() => setSidebarOpen((v) => !v)}><span></span></button>
          <h1>{title}</h1>
          <div className="topbar-actions">
            <span className="admin-user"><span className="dot"></span><span id="adminEmail">{user?.email || "—"}</span></span>
            <button className="btn btn-ghost btn-sm" id="logoutBtn" type="button" onClick={() => setLogoutConfirmOpen(true)}>Log out</button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet context={{ refreshPendingCount: () => AdminAPI.dashboardStats().then((s) => setPendingCount(s.pendingDoctorApprovals || 0)).catch(() => {}) }} />
        </main>
      </div>
      <PwaInstallPrompt />
      <ConfirmModal
        open={logoutConfirmOpen}
        title="Log out"
        message="Are you sure you want to log out of Aarogyam Admin?"
        confirmText="Log out"
        onConfirm={performAdminLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </ToastProvider>
  );
}

