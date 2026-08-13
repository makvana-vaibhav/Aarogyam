import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { isLoggedIn, getDashboardHref, getUser } from "../../lib/publicAuth.js";

export default function NotFound() {
  useDocumentTitle("404 · Page Not Found · Aarogyam");
  const user = isLoggedIn() ? getUser() : null;

  return (
    <section className="auth-section" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div className="wrap" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="auth-card" style={{ padding: "48px 32px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          {/* Centered Warning Emblem */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              backgroundColor: "rgba(45, 106, 79, 0.12)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              flexShrink: 0
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Centered Pill Badge */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "20px",
              backgroundColor: "rgba(45, 106, 79, 0.08)",
              border: "1px solid rgba(45, 106, 79, 0.2)",
              color: "var(--accent)",
              fontFamily: "var(--mono)",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "1.5px",
              marginBottom: "14px",
              textTransform: "uppercase"
            }}
          >
            Error 404
          </div>

          <h1 style={{ fontSize: "30px", fontWeight: "700", margin: "0 0 12px", color: "var(--pine)" }}>
            Page not found
          </h1>

          <p className="lede" style={{ fontSize: "14.5px", color: "var(--ink-soft)", margin: "0 0 28px", maxWidth: "420px", lineHeight: "1.6" }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", width: "100%" }}>
            <Link to="/" className="btn btn-ghost" style={{ minWidth: "135px" }}>
              Back to Home
            </Link>
            {user ? (
              <Link to={getDashboardHref(user)} className="btn btn-solid" style={{ minWidth: "135px" }}>
                My Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn btn-solid" style={{ minWidth: "135px" }}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
