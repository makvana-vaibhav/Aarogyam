import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

export default function Terms() {
  useDocumentTitle("Terms of Use — Aarogyam");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Legal</span>
          <h1>Terms of use</h1>
          <p className="lede legal-updated">Last updated · 17 July 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <p>These terms govern your use of the Aarogyam platform. By creating an account or using the service, you agree to them. They are written to be read, not skimmed — they're short.</p>

          <h2>1. What Aarogyam is (and isn't)</h2>
          <p>Aarogyam is a digital health records platform: it stores, organizes and presents medical information created by you and by verified doctors. It is <strong>not</strong> a medical service. Nothing on the platform is medical advice, and the platform never diagnoses, prescribes or treats. Decisions about your health belong with qualified professionals.</p>
          <p>Aarogyam is developed for educational and research purposes and is provided on that basis.</p>

          <h2>2. Your account</h2>
          <ul>
            <li>You must provide accurate information at registration and complete OTP verification.</li>
            <li>One Aarogyam ID per person. The ID is personal and non-transferable.</li>
            <li>You are responsible for keeping your password confidential and for activity under your account. Tell us immediately if you suspect unauthorized access.</li>
          </ul>

          <h2>3. Doctor accounts</h2>
          <ul>
            <li>Doctor registration requires a valid medical licence number, degree details and supporting documents.</li>
            <li>Accounts remain inactive until approved by an administrator. Approval may be refused or revoked if credentials cannot be verified or are misused.</li>
            <li>Doctors may access patient records only in the legitimate context of care, and are responsible for the accuracy of the diagnoses and prescriptions they record.</li>
          </ul>

          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>impersonate another person or register with credentials that are not yours;</li>
            <li>upload content that is unlawful, malicious, or unrelated to genuine medical records;</li>
            <li>attempt to access records or functionality outside your role;</li>
            <li>probe, disrupt or reverse-engineer the platform's security.</li>
          </ul>
          <p>Violations may result in suspension or termination of the account, and where credentials were falsified, referral to the relevant authority.</p>

          <h2>5. Your content</h2>
          <p>Medical records you upload remain yours. By uploading, you grant Aarogyam the limited licence needed to store, display and process them for the sole purpose of providing the service to you and your authorized doctors, as described in the <Link to="/privacy"><strong>privacy policy</strong></Link>.</p>

          <h2>6. Availability &amp; changes</h2>
          <p>We aim to keep the service available and your data intact, but as an educational project the platform is provided <strong>"as is"</strong>, without warranties of uninterrupted availability or fitness for clinical use. Keep independent copies of documents that matter — the download feature exists for exactly this reason. We may update features and these terms; material changes will be announced on the platform.</p>

          <h2>7. Liability</h2>
          <p>To the fullest extent permitted by law, Aarogyam and its developers are not liable for medical decisions made using information on the platform, for content recorded by doctors or patients, or for losses arising from use of an educational system in a clinical setting contrary to Section 1.</p>

          <h2>8. Contact</h2>
          <p>Questions about these terms: <a href="mailto:support@aarogyam.health"><strong>support@aarogyam.health</strong></a>, or use the <Link to="/contact"><strong>contact page</strong></Link>.</p>
        </div>
      </section>
    </>
  );
}
