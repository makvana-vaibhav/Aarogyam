import { Link } from "react-router-dom";

// Shared between the patient and doctor shells.
export default function AvatarMenu({ open, name, meta, profileHref, onLogout, onClose, onStopClick }) {
  return (
    <div className="pt-popover" id="avatarPopover" hidden={!open} onClick={onStopClick}>
      <div className="pt-account-card">
        <div className="pt-account-name" id="sidebarProfileName">{name}</div>
        <div className="pt-account-meta" id="sidebarProfileMeta">{meta}</div>
      </div>
      <div className="pt-popover-menu">
        <Link to={profileHref} onClick={onClose}>Profile &amp; settings</Link>
        <button
          className="danger"
          id="logoutBtn"
          type="button"
          onClick={() => {
            if (onClose) onClose();
            onLogout();
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
