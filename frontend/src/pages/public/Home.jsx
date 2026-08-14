import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

export default function Home() {
  useDocumentTitle("Aarogyam · One health identity, for life");

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">Digital health identity</span>
          <h1>Your medical history, <em>finally</em> in one place.</h1>
          <p className="lede">Aarogyam gives every patient a single lifelong health ID. Reports, prescriptions and diagnoses stay attached to you, not to the hospital that filed them, the clinic that lost them, or the folder at home.</p>
          <div className="hero-ctas">
            <Link className="btn btn-solid btn-lg" to="/register">Create your Aarogyam ID <span className="arr">→</span></Link>
            <Link className="btn btn-ghost btn-lg" to="/#how">See how it works</Link>
          </div>
          <p className="hero-note">Free for patients · OTP-verified sign-up · Doctors verified by licence, e.g. <code>MCI-44210</code></p>
        </div>
      </section>

      {/* ================= PROBLEM ================= */}
      <section className="section problem" id="problem">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Records are scattered.<br />Patients are not.</h2>
          </div>

          <div className="problem-grid">
            <div className="problem-copy reveal">
              <p>A lifetime of healthcare produces a paper trail across hospitals, clinics, labs and pharmacies, and none of them talk to each other. The person who ends up responsible for assembling that history is usually the one least equipped to do it: <strong>the patient, mid-illness</strong>.</p>
              <p>Aarogyam replaces the paper trail with a single record that follows the patient. Every visit, diagnosis, prescription and uploaded report lands on one timeline, under one ID, retrievable in seconds by scanning a QR code.</p>
            </div>
            <ul className="problem-list reveal d1">
              <li><span className="n">a.</span>Reports go missing between appointments, so diagnostic tests get repeated at the patient's cost.</li>
              <li><span className="n">b.</span>Doctors work from incomplete histories and whatever the patient happens to remember.</li>
              <li><span className="n">c.</span>Old prescriptions are unreadable, unfindable, or both.</li>
              <li><span className="n">d.</span>Switching cities or hospitals means starting the record from zero.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="section features" id="features">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>What you get</h2>
            <p className="lede">Everything hangs off the Aarogyam ID, a permanent identifier issued once, at registration.</p>
          </div>

          <div className="feature-grid">
            <div className="feature reveal">
              <span className="tag">Identity</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="9" width="32" height="22" rx="3" /><path d="M10 17h8M10 21h6M10 25h7" /><circle cx="28" cy="19" r="3.5" /><path d="M23 27c1-2.4 2.8-3.5 5-3.5s4 1.1 5 3.5" /></svg>
              <h3>One lifelong health ID</h3>
              <p>Registration issues a unique Aarogyam ID that stays with the patient permanently. Every future record, from any doctor in any city, attaches to it.</p>
            </div>

            <div className="feature reveal d1">
              <span className="tag">Access</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="10" height="10" rx="1.5" /><rect x="24" y="6" width="10" height="10" rx="1.5" /><rect x="6" y="24" width="10" height="10" rx="1.5" /><path d="M24 24h4v4h-4zM30 24h4M34 28v6M24 30v4h6M28 34h2" /></svg>
              <h3>QR health card</h3>
              <p>A scannable card that opens the patient's record instantly at the front desk: no forms, no spelling out names, no lost files.</p>
            </div>

            <div className="feature reveal d2">
              <span className="tag">Records</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4H10a2 2 0 0 0-2 2v28a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V13z" /><path d="M23 4v9h9" /><path d="M14 22l3 0 2-4 3 8 2-4h4" /></svg>
              <h3>Report uploads</h3>
              <p>Lab results, scans and discharge summaries live as files on the record, uploaded by the patient or their doctor, and never photocopied again.</p>
            </div>

            <div className="feature reveal">
              <span className="tag">Treatment</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4h16v7H12z" /><path d="M9 11h22v23a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2z" /><path d="M20 19v10M15 24h10" /></svg>
              <h3>Digital prescriptions</h3>
              <p>Doctors issue structured prescriptions with dosage and duration, downloadable as a clean PDF, legible by pharmacists and future doctors alike.</p>
            </div>

            <div className="feature reveal d1">
              <span className="tag">History</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4v32" /><circle cx="8" cy="10" r="2.5" fill="currentColor" stroke="none" /><circle cx="8" cy="20" r="2.5" /><circle cx="8" cy="30" r="2.5" /><path d="M14 10h18M14 20h14M14 30h16" /></svg>
              <h3>Health timeline</h3>
              <p>Visits, diagnoses, prescriptions and reports arranged chronologically: the whole medical story readable top to bottom in one scroll.</p>
            </div>

            <div className="feature reveal d2">
              <span className="tag">Trust</span>
              <svg className="icon" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4l13 5v9c0 8.4-5.5 14.6-13 18-7.5-3.4-13-9.6-13-18V9z" /><path d="M14.5 20l4 4 7-8" /></svg>
              <h3>Verified doctors only</h3>
              <p>Doctors submit licence and degree documents at registration and are approved by an admin before they can touch a single patient record.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>How it works</h2>
            <p className="lede">From a blank form to a living medical record.</p>
          </div>

          <div className="feature-grid">
            <div className="feature reveal">
              <h3>Register</h3>
              <p>Sign up as a patient with basic details. An OTP sent to your email verifies it's really you.</p>
            </div>
            <div className="feature reveal d1">
              <h3>Get your ID</h3>
              <p>Your permanent Aarogyam ID and QR health card are generated on the spot.</p>
            </div>
            <div className="feature reveal d2">
              <h3>Add your history</h3>
              <p>Upload existing reports and prescriptions so your record starts complete, not empty.</p>
            </div>
            <div className="feature reveal">
              <h3>Visit any doctor</h3>
              <p>They scan your QR card, see your history, and add diagnoses and prescriptions directly.</p>
            </div>
            <div className="feature reveal d1">
              <h3>Watch it grow</h3>
              <p>Every interaction lands on your timeline automatically. Download anything, anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="section roles" id="roles">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Built for both sides of the desk</h2>
          </div>

          <div className="role-grid">
            <div className="role-card reveal">
              <div className="role-kind">For patients</div>
              <h3>Own your record</h3>
              <p>Your history stops depending on which hospital filed it.</p>
              <ul>
                <li>Lifelong Aarogyam ID &amp; QR card</li>
                <li>Upload and download reports</li>
                <li>Full prescription history</li>
                <li>Chronological health timeline</li>
              </ul>
            </div>

            <div className="role-card reveal d1">
              <div className="role-kind">For doctors</div>
              <h3>Treat with context</h3>
              <p>The patient's full history before the consultation starts.</p>
              <ul>
                <li>Find patients by ID or QR scan</li>
                <li>Review complete medical history</li>
                <li>Record diagnoses per visit</li>
                <li>Issue prescriptions as PDF</li>
              </ul>
            </div>

            <div className="role-card reveal d2">
              <div className="role-kind">For admins</div>
              <h3>Keep it trustworthy</h3>
              <p>Verification and oversight for the whole platform.</p>
              <ul>
                <li>Approve doctors by licence &amp; degree</li>
                <li>Manage patient and doctor accounts</li>
                <li>Monitor platform activity</li>
                <li>Platform-wide statistics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="section" id="why">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Why it exists</h2>
          </div>

          <div className="prose reveal d1">
            <p>Healthcare records are scattered by design: a lab keeps its report, a hospital keeps its discharge summary, a clinic keeps a prescription on paper. Nobody keeps the whole picture, so when a patient shows up somewhere new, their history effectively starts over — repeated tests, incomplete context for doctors, and hours lost reconstructing what should have been a single scroll.</p>
            <p>Aarogyam collapses those fragments into one place: a permanent ID issued once, at registration, with every visit, diagnosis, prescription and uploaded report attached to it and readable in seconds by scanning a QR card.</p>
            <hr className="rule" />
            <h3>A note on scope</h3>
            <p>This project is built for <strong>educational and research purposes</strong>. It's a working demonstration of how a centralized digital health identity system can be designed and built, not a certified medical device or a substitute for real medical infrastructure.</p>
          </div>
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="section security">
        <div className="wrap">
          <div className="section-head reveal">
            <h2>Guarded by design</h2>
          </div>

          <div className="sec-grid">
            <div className="sec-item reveal">
              <svg className="icon" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="13" width="20" height="13" rx="2" /><path d="M10 13V9a5 5 0 0 1 10 0v4" /><circle cx="15" cy="19" r="1.6" /></svg>
              <h3>OTP-verified accounts</h3>
              <p>Every registration is confirmed with a one-time code before the account goes live.</p>
            </div>
            <div className="sec-item reveal d1">
              <svg className="icon" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3l10 4v7c0 6.3-4.1 11-10 13C9.1 25 5 20.3 5 14V7z" /></svg>
              <h3>JWT-secured sessions</h3>
              <p>Signed tokens authenticate every request between the app and the API.</p>
            </div>
            <div className="sec-item reveal d2">
              <svg className="icon" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="15" cy="10" r="4" /><path d="M7 25c1.3-4 4.3-6 8-6s6.7 2 8 6" /><path d="M22 4l4 4M26 4l-4 4" /></svg>
              <h3>Role-based access</h3>
              <p>Patients, doctors and admins each see strictly their own slice of the system.</p>
            </div>
            <div className="sec-item reveal d3">
              <svg className="icon" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6h20v18H5z" /><path d="M5 11h20M10 6v5" /><path d="M10 17l3 3 6-6" /></svg>
              <h3>Approval workflow</h3>
              <p>No doctor account is activated until an admin has verified its credentials.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-band">
        <div className="wrap">
          <span className="eyebrow reveal" style={{ justifyContent: "center" }}>Get started</span>
          <h2 className="reveal d1">The best time to start your health record was your first checkup. The second best is now.</h2>
          <p className="lede reveal d2">Registration takes about two minutes, and your ID lasts a lifetime.</p>
          <div className="hero-ctas reveal d3">
            <Link className="btn btn-solid btn-lg" to="/register">Create your Aarogyam ID <span className="arr">→</span></Link>
            <Link className="btn btn-ghost btn-lg" to="/#why">Why it exists</Link>
          </div>
        </div>
      </section>
    </>
  );
}
