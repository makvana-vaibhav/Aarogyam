import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PatientAPI, requirePatientAuth, performPatientLogout } from "../lib/patientApi.js";
import { initials as formatInitials } from "../lib/format.js";
import { usePopoverGroup } from "../lib/usePopoverGroup.js";
import { useProfilePicture } from "../lib/useProfilePicture.js";
import NotifPopover from "./NotifPopover.jsx";
import AvatarMenu from "./AvatarMenu.jsx";
import PwaInstallPrompt from "./PwaInstallPrompt.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";

export default function PatientLayout() {
  const [profile, setProfile] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifDot, setNotifDot] = useState(false);
  const [notifRows, setNotifRows] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const popovers = usePopoverGroup();
  const pictureUrl = useProfilePicture(PatientAPI.profilePicture, profile);

  const refreshProfile = useCallback(() => {
    return PatientAPI.profile().then((data) => {
      setProfile(data);
      return data;
    });
  }, []);

  useEffect(() => {
    const user = requirePatientAuth();
    if (!user) return;
    refreshProfile().catch(() => {});
    PatientAPI.notifications(true)
      .then((rows) => setNotifDot(!!rows.length))
      .catch(() => setNotifDot(false));
  }, [refreshProfile]);

  useEffect(() => {
    document.body.classList.toggle("pt-nav-open", mobileNavOpen);
    return () => document.body.classList.remove("pt-nav-open");
  }, [mobileNavOpen]);

  function loadNotifPopover() {
    setNotifLoading(true);
    setNotifError(null);
    PatientAPI.notifications(true)
      .then((rows) => setNotifRows(rows))
      .catch((err) => setNotifError(err.message))
      .finally(() => setNotifLoading(false));
  }

  function handleNotifToggle(e) {
    const willOpen = popovers.open !== "notif";
    popovers.toggle("notif", e);
    if (willOpen) loadNotifPopover();
  }

  async function handleMarkRead(id) {
    try {
      await PatientAPI.markNotificationRead(id);
      loadNotifPopover();
      PatientAPI.notifications(true)
        .then((rows) => setNotifDot(!!rows.length))
        .catch(() => {});
    } catch (e) {}
  }

  const name = profile ? [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") : "Patient";
  const meta = profile ? "Aarogyam ID " + profile.aarogyamId : "Aarogyam ID";
  const avatarInitials = profile ? formatInitials(profile.firstName, profile.lastName) : "P";

  return (
    <ToastProvider>
      <OfflineIndicator />
      <header className="pt-topnav">
        <div className="pt-topnav-inner">
          <NavLink className="pt-brand" to="/patient/overview">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" /><path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Aarogyam
          </NavLink>
          <nav className="pt-links">
            <NavLink to="/patient/overview">Overview</NavLink>
            <NavLink to="/patient/medical-history">Medical History</NavLink>
            <NavLink to="/patient/reports">Reports</NavLink>
          </nav>
          <div className="pt-actions">
            <div>
              <button className="pt-icon-btn" id="notifBellBtn" type="button" aria-label="Notifications" onClick={handleNotifToggle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
                <span className="pt-dot" id="notifDot" hidden={!notifDot}></span>
              </button>
              <NotifPopover
                open={popovers.open === "notif"}
                loading={notifLoading}
                errorMessage={notifError}
                rows={notifRows}
                onMarkRead={handleMarkRead}
                onStopClick={popovers.stop}
              />
            </div>
            <div>
              <button className="pt-avatar-btn" id="avatarBtn" type="button" aria-label="Account" onClick={(e) => popovers.toggle("avatar", e)}>
                {pictureUrl ? (
                  <img className="avatar-circle small" id="sidebarInitials" src={pictureUrl} alt="" />
                ) : (
                  <span className="avatar-circle small" id="sidebarInitials">{avatarInitials}</span>
                )}
              </button>
              <AvatarMenu
                open={popovers.open === "avatar"}
                name={name}
                meta={meta}
                avatarInitials={avatarInitials}
                pictureUrl={pictureUrl}
                profileHref="/patient/profile"
                onLogout={() => setLogoutConfirmOpen(true)}
                onClose={popovers.close}
                onStopClick={popovers.stop}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-main">
        <Outlet context={{ profile, refreshProfile, confirmLogout: () => setLogoutConfirmOpen(true) }} />
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <nav className="mobile-app-bottom-nav" aria-label="Mobile Navigation">
        <NavLink to="/patient/overview" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span>Overview</span>
        </NavLink>
        <NavLink to="/patient/medical-history" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span>History</span>
        </NavLink>
        <NavLink to="/patient/reports" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <span>Reports</span>
        </NavLink>
        <NavLink to="/patient/profile" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span>Profile</span>
        </NavLink>
      </nav>

      <PwaInstallPrompt />
      <ConfirmModal
        open={logoutConfirmOpen}
        title="Log out"
        message="Are you sure you want to log out of Aarogyam?"
        confirmText="Log out"
        onConfirm={performPatientLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </ToastProvider>
  );
}

