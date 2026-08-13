import { useEffect, useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { requireAuth, logout } from "../../lib/publicAuth.js";

export default function Dashboard() {
  useDocumentTitle("Dashboard · Aarogyam");

  const [user, setUser] = useState(null);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const current = requireAuth();
    if (!current) return;

    const role = String(current.roleName || "").toLowerCase();
    if (role === "patient") {
      window.location.replace("/patient/overview");
      return;
    }
    if (role === "doctor") {
      window.location.replace("/doctor/overview");
      return;
    }

    setUser(current);
    setRedirecting(false);
  }, []);

  if (redirecting || !user) return null;

  const badgeClass =
    String(user.approvalStatus || "").toLowerCase() === "approved"
      ? "ok"
      : String(user.approvalStatus || "").toLowerCase() === "rejected"
      ? "bad"
      : "pending";

  return (
    <section className="auth-section">
      <div className="wrap">
        <div className="auth-head">
          <span className="eyebrow">Signed in</span>
          <h1>Your account</h1>
          <p className="lede">This is a placeholder overview confirming authentication works end to end. The full patient/doctor dashboards come next.</p>
        </div>

        <div className="dash-card">
          <div className="dash-row">
            <span className="dl">Email</span>
            <span className="dv" id="dvEmail">{user.email || "—"}</span>
          </div>
          <div className="dash-row">
            <span className="dl">Role</span>
            <span className="dv" id="dvRole">{user.roleName || "—"}</span>
          </div>
          {String(user.roleName).toLowerCase() === "doctor" && user.approvalStatus ? (
            <div className="dash-row" id="approvalRow">
              <span className="dl">Approval status</span>
              <span className="dv" id="dvApproval">
                <span className={"badge " + badgeClass}>{user.approvalStatus}</span>
              </span>
            </div>
          ) : null}
          <div className="dash-row">
            <span className="dl">User ID</span>
            <span className="dv" id="dvUserId">{user.userId != null ? user.userId : "—"}</span>
          </div>
        </div>

        <p className="auth-foot">
          <button id="logoutBtn" className="btn btn-ghost" type="button" onClick={logout}>Log out</button>
        </p>
      </div>
    </section>
  );
}
