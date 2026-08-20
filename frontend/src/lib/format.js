// Shared formatting helpers, ported from {Patient,Doctor,Admin}Util in the original app.
// escapeHtml isn't needed — JSX escapes text content automatically.

// The app is India-only, so every timestamp is always shown in IST with a 12-hour
// AM/PM clock - regardless of the viewer's device locale/timezone settings, which
// would otherwise silently render times in the browser's own local zone/format.
const IST_TIME_ZONE = "Asia/Kolkata";

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", timeZone: IST_TIME_ZONE });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const formatted = date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: IST_TIME_ZONE
  });
  return formatted + " IST";
}

export function formatRelativeTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(days, "day");
}

export function initials(firstName, lastName) {
  return ((firstName || "").charAt(0) + (lastName || "").charAt(0)).toUpperCase() || "P";
}

export function fileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return "—";
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
}

export function downloadBlob(blobOrResult, fileName) {
  if (!blobOrResult) return;
  const blob = (blobOrResult && blobOrResult.blob instanceof Blob) ? blobOrResult.blob : (blobOrResult instanceof Blob ? blobOrResult : (blobOrResult.blob || blobOrResult));
  const resolvedName = fileName || (blobOrResult && blobOrResult.fileName) || "download";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = resolvedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function statusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved" || value === "active") return "ok";
  if (value === "pending" || value === "unverified") return "pending";
  if (value === "rejected" || value === "inactive") return "bad";
  return "";
}

export function toTitleCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function joinName(row) {
  if (!row) return "";
  const raw = [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
  return toTitleCase(raw);
}
