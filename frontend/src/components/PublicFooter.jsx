import { Link } from "react-router-dom";

const YEAR = new Date().getFullYear();

// Simple footer used on auth-style pages (login/register/etc).
export function SimpleFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-bottom">
          <span><Link to="/admin/login" style={{ color: "inherit", textDecoration: "none" }} aria-label="Admin login">©</Link> <span id="year">{YEAR}</span> Aarogyam. Built for educational and research purposes.</span>
          <span className="mono">आरोग्यम् · "good health"</span>
        </div>
      </div>
    </footer>
  );
}

// Full footer with link columns, used on marketing pages (home/about/contact/privacy/terms).
export default function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="brand" to="/">
              <svg className="mark" width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" />
                <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Aarogyam
            </Link>
            <p>A digital health identity platform with one lifelong ID for every patient's complete medical record.</p>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/#features">Features</Link>
            <Link to="/#how">How it works</Link>
            <Link to="/#roles">Who it's for</Link>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <Link to="/#why">Why it exists</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of use</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span><Link to="/admin/login" style={{ color: "inherit", textDecoration: "none" }} aria-label="Admin login">©</Link> <span id="year">{YEAR}</span> Aarogyam. Built for educational and research purposes.</span>
          <span className="mono">आरोग्यम् · "good health"</span>
        </div>
      </div>
    </footer>
  );
}
