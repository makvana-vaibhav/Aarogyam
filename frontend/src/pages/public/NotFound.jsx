import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { isLoggedIn, getDashboardHref, getUser } from "../../lib/publicAuth.js";

export default function NotFound() {
  useDocumentTitle("404 — Page Not Found · Aarogyam");
  const user = isLoggedIn() ? getUser() : null;

  return (
    <section className="auth-section">
      <div className="wrap" style={{ maxWidth: "560px", textAlign: "center" }}>
        <div className="auth-card" style={{ padding: "48px 32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "rgba(45, 106, 79, 0.1)",
              color: "var(--accent)",
              marginBottom: "20px"
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <span className="eyebrow" style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "2px", color: "var(--accent)" }}>
            ERROR 404
          </span>

          <h1 style={{ fontSize: "30px", margin: "8px 0 12px", color: "var(--pine)" }}>
            Page not found
          </h1>

          <p className="lede" style={{ fontSize: "15px", color: "var(--ink-soft)", marginBottom: "28px", lineHeight: "1.6" }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-ghost" style={{ minWidth: "140px" }}>
              Back to Home
            </Link>
            {user ? (
              <Link to={getDashboardHref(user)} className="btn btn-solid" style={{ minWidth: "140px" }}>
                My Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-solid" style={{ minWidth: "140px" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
