import { formatRelativeTime } from "../lib/format.js";

// Shared between the patient and doctor shells — ported from renderNotifPopoverList/loadNotifPopover.
export default function NotifPopover({ open, loading, errorMessage, rows, onMarkRead, onStopClick }) {
  return (
    <div className="pt-popover" id="notifPopover" hidden={!open} onClick={onStopClick}>
      <div className="pt-popover-head">Unread notifications</div>
      <div className="pt-popover-list" id="notifPopoverList">
        {loading ? (
          <div className="table-loading">Loading…</div>
        ) : errorMessage ? (
          <div className="form-alert error">{errorMessage}</div>
        ) : !rows.length ? (
          <div className="empty-state">You are all caught up.</div>
        ) : (
          rows.slice(0, 6).map((item) => (
            <article className="list-item unread" key={item.notificationId}>
              <div className="list-item-main">
                <div className="row-title">{item.title}</div>
                <div className="row-sub pre-wrap">{item.message}</div>
                <div className="list-meta">{formatRelativeTime(item.createdAt)}</div>
              </div>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => onMarkRead(item.notificationId)}>
                Mark read
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
