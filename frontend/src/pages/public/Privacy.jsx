import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

export default function Privacy() {
  useDocumentTitle("Privacy Policy · Aarogyam");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1>Privacy policy</h1>
          <p className="lede legal-updated">Last updated · 17 July 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <p>Aarogyam exists to hold some of the most sensitive information a person has. This policy explains, in plain language, what we collect, why we collect it, and what we will and will not do with it.</p>

          <h2>1. What we collect</h2>
          <h3>Account information</h3>
          <p>When you register we collect your name, email address, phone number and a password (stored only in hashed form). Patients additionally provide date of birth, gender, blood group, emergency contact and address. Doctors additionally provide their medical licence number, specialization, degree, practice details and verification documents.</p>
          <h3>Health records</h3>
          <p>The core of the platform: medical reports you or your doctors upload, diagnoses and prescriptions recorded during visits, and the timeline built from them. This data is created deliberately, by you or by a verified doctor treating you: we never source health data from anywhere else.</p>
          <h3>Technical data</h3>
          <p>Standard operational logs (login timestamps, request records) used for security and troubleshooting, and audit entries recording who accessed which record and when.</p>

          <h2>2. How we use it</h2>
          <ul>
            <li><strong>To run the service</strong>: issuing your Aarogyam ID, generating your QR health card, rendering your timeline, producing prescription PDFs.</li>
            <li><strong>To verify identities</strong>: sending one-time passwords by email at registration, and reviewing doctor credentials before approval.</li>
            <li><strong>To notify you</strong>: service emails such as OTP codes, approval decisions and record activity. We do not send marketing email.</li>
            <li><strong>To keep the platform safe</strong>: detecting misuse through logs and audit trails.</li>
          </ul>

          <h2>3. Who can see your health record</h2>
          <p>Access is role-based and deliberately narrow:</p>
          <ul>
            <li><strong>You</strong> can see your complete record at all times.</li>
            <li><strong>Verified doctors</strong> can access your record in the context of your care, for example after scanning your QR card at a consultation.</li>
            <li><strong>Administrators</strong> manage accounts and approvals; their job is verification and oversight, not reading medical histories.</li>
          </ul>
          <p>We do not sell data. We do not share health records with advertisers, insurers, employers or any third party for commercial purposes, full stop.</p>

          <h2>4. How it's protected</h2>
          <ul>
            <li>Passwords are hashed; they are never stored or transmitted in plain text.</li>
            <li>Every API request is authenticated with signed JSON Web Tokens.</li>
            <li>Role-based authorization is enforced on the server for every endpoint.</li>
            <li>Doctor accounts are inactive until an administrator verifies licence and degree documents.</li>
          </ul>

          <h2>5. Your choices</h2>
          <ul>
            <li><strong>Access &amp; download</strong>: you can view and download your records and prescriptions from your dashboard at any time.</li>
            <li><strong>Correction</strong>: profile details can be edited from your account; factual errors in medical entries should be raised with the issuing doctor.</li>
            <li><strong>Deletion</strong>: you may request account deletion by contacting us. Some records may be retained where required for audit integrity, and we will tell you exactly what and why.</li>
          </ul>

          <h2>6. A note on scope</h2>
          <p>Aarogyam is an educational and research project. It follows the practices described here as a matter of design, but it is not a certified clinical system and should not be treated as one for regulated medical data.</p>

          <h2>7. Contact</h2>
          <p>Questions about this policy or your data: <a href="mailto:support@aarogyam.health"><strong>support@aarogyam.health</strong></a>, or use the <Link to="/contact"><strong>contact page</strong></Link>.</p>
        </div>
      </section>
    </>
  );
}
