import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { DoctorAPI, requireDoctorAuth, performDoctorLogout, extractAarogyamId } from "../lib/doctorApi.js";
import { initials as formatInitials } from "../lib/format.js";
import { usePopoverGroup } from "../lib/usePopoverGroup.js";
import { useQrScanner } from "../lib/useQrScanner.js";
import { useProfilePicture } from "../lib/useProfilePicture.js";
import NotifPopover from "./NotifPopover.jsx";
import AvatarMenu from "./AvatarMenu.jsx";
import QrScannerModal from "./QrScannerModal.jsx";
import PwaInstallPrompt from "./PwaInstallPrompt.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import { ToastProvider } from "../context/ToastContext.jsx";

import DoctorPendingApproval from "../pages/doctor/DoctorPendingApproval.jsx";
import DoctorRejected from "../pages/doctor/DoctorRejected.jsx";

function ScanQrIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><path d="M14 14h3v3h-3z" /><path d="M17 17h4v4h-4z" /></svg>
  );
}

function DoctorShell() {
  const [profile, setProfile] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifDot, setNotifDot] = useState(false);
  const [notifRows, setNotifRows] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const popovers = usePopoverGroup();
  const scanner = useQrScanner();
  const pictureUrl = useProfilePicture(DoctorAPI.profilePicture, profile);

  const refreshProfile = useCallback(() => {
    return DoctorAPI.profile().then((data) => {
      setProfile(data);
      return data;
    });
  }, []);

  useEffect(() => {
    const user = requireDoctorAuth();
    if (!user) return;
    refreshProfile().catch(() => {});
    DoctorAPI.notifications(true)
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
    DoctorAPI.notifications(true)
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
      await DoctorAPI.markNotificationRead(id);
      loadNotifPopover();
      DoctorAPI.notifications(true)
        .then((rows) => setNotifDot(!!rows.length))
        .catch(() => {});
    } catch (e) {}
  }

  function defaultScanNavigate() {
    scanner.startScan((rawId) => {
      const cleanId = extractAarogyamId(rawId);
      window.location.href = "/doctor/create-visit?aarogyamId=" + encodeURIComponent(cleanId);
    });
  }

  const approvalStatus = (profile?.approvalStatus || "").toLowerCase();
  const isPending = profile && (approvalStatus === "pendingapproval" || approvalStatus === "pending");
  const isRejected = profile && approvalStatus === "rejected";

  if (isPending) {
    return (
      <ToastProvider>
        <OfflineIndicator />
        <header className="pt-topnav">
          <div className="pt-topnav-inner">
            <div className="pt-brand" style={{ cursor: "default" }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" /><path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Aarogyam <small style={{ fontSize: "11px", color: "#ca8a04", marginLeft: "6px" }}>Pending Review</small>
            </div>
            <div className="pt-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setLogoutConfirmOpen(true)}>Log out</button>
            </div>
          </div>
        </header>
        <main className="pt-main">
          <DoctorPendingApproval profile={profile} />
        </main>
        <ConfirmModal
          open={logoutConfirmOpen}
          title="Log out"
          message="Are you sure you want to log out of Aarogyam?"
          confirmText="Log out"
          onConfirm={performDoctorLogout}
          onCancel={() => setLogoutConfirmOpen(false)}
        />
      </ToastProvider>
    );
  }

  if (isRejected) {
    return (
      <ToastProvider>
        <OfflineIndicator />
        <header className="pt-topnav">
          <div className="pt-topnav-inner">
            <div className="pt-brand" style={{ cursor: "default" }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" /><path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Aarogyam <small style={{ fontSize: "11px", color: "#dc2626", marginLeft: "6px" }}>Application Rejected</small>
            </div>
            <div className="pt-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setLogoutConfirmOpen(true)}>Log out</button>
            </div>
          </div>
        </header>
        <main className="pt-main">
          <DoctorRejected profile={profile} />
        </main>
        <ConfirmModal
          open={logoutConfirmOpen}
          title="Log out"
          message="Are you sure you want to log out of Aarogyam?"
          confirmText="Log out"
          onConfirm={performDoctorLogout}
          onCancel={() => setLogoutConfirmOpen(false)}
        />
      </ToastProvider>
    );
  }

  const name = profile ? "Dr. " + [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ") : "Doctor";
  const meta = "License " + (profile?.licenseNumber || "—");
  const avatarInitials = profile ? formatInitials(profile.firstName, profile.lastName) : "D";

  return (
    <ToastProvider>
      <OfflineIndicator />
      <header className="pt-topnav">
        <div className="pt-topnav-inner">
          <NavLink className="pt-brand" to="/doctor/overview">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" /><path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Aarogyam
          </NavLink>
          <nav className="pt-links">
            <NavLink to="/doctor/overview">Overview</NavLink>
            <NavLink to="/doctor/my-patients">My Patients</NavLink>
            <NavLink to="/doctor/create-visit">Create Visit</NavLink>
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
                profileHref="/doctor/profile"
                onLogout={() => setLogoutConfirmOpen(true)}
                onClose={popovers.close}
                onStopClick={popovers.stop}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-main">
        <Outlet context={{ profile, refreshProfile, requestScan: scanner.startScan, confirmLogout: () => setLogoutConfirmOpen(true) }} />
      </main>

      {/* Mobile App Bottom Navigation Bar for Doctors */}
      <nav className="mobile-app-bottom-nav doctor-bottom-nav" aria-label="Doctor Mobile Navigation">
        <NavLink to="/doctor/overview" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span>Overview</span>
        </NavLink>

        <NavLink to="/doctor/my-patients" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span>Patients</span>
        </NavLink>

        {/* Center Prominent Scan QR Button */}
        <button
          type="button"
          className="mob-tab-center-btn"
          aria-label="Scan Patient QR Code"
          onClick={defaultScanNavigate}
        >
          <div className="mob-tab-center-icon">
            <ScanQrIcon />
          </div>
          <span>Scan QR</span>
        </button>

        <NavLink to="/doctor/create-visit" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span>New Visit</span>
        </NavLink>

        <NavLink to="/doctor/profile" className={({ isActive }) => `mob-tab-item ${isActive ? "active" : ""}`}>
          <div className="mob-tab-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span>Profile</span>
        </NavLink>
      </nav>

      <QrScannerModal open={scanner.open} status={scanner.status} videoRef={scanner.videoRef} canvasRef={scanner.canvasRef} onClose={scanner.stopScan} />
      <PwaInstallPrompt />
      <ConfirmModal
        open={logoutConfirmOpen}
        title="Log out"
        message="Are you sure you want to log out of Aarogyam?"
        confirmText="Log out"
        onConfirm={performDoctorLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </ToastProvider>
  );
}

export default DoctorShell;

