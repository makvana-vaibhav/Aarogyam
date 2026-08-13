export default function ConfirmModal({
  open,
  title = "Confirm action",
  message = "Are you sure you want to proceed?",
  confirmText = "Log out",
  cancelText = "Cancel",
  danger = true,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onCancel}
    >
      <div
        className="modal"
        style={{
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          borderRadius: "14px",
          padding: "24px 20px 18px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: danger ? "rgba(217, 83, 79, 0.12)" : "rgba(45, 106, 79, 0.12)", color: danger ? "#d9534f" : "var(--accent)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
          {danger ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--ink)", margin: "0 0 8px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "13.5px", color: "var(--ink-soft)", margin: "0 0 20px", lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button
            className="btn btn-ghost"
            type="button"
            style={{ flex: 1, height: "40px", justifyContent: "center" }}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={"btn " + (danger ? "btn-danger" : "btn-solid")}
            type="button"
            style={{
              flex: 1,
              height: "40px",
              justifyContent: "center",
              background: danger ? "#d9534f" : "var(--accent)",
              borderColor: danger ? "#d9534f" : "var(--accent)",
              color: "#fff"
            }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
