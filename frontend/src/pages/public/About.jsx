import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

export default function About() {
  useDocumentTitle("About · Aarogyam");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">About the project</span>
          <h1>A record that outlives the paperwork.</h1>
          <p className="lede">Aarogyam (from the Sanskrit <em>आरोग्यम्</em>, "good health") is a digital health identity platform built around one idea: a patient's medical history should belong to the patient.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap prose">
          <h2>Why it exists</h2>
          <p>Healthcare in most places runs on fragments. A blood report from one lab, a discharge summary from a hospital two cities away, a prescription on a fading slip of paper: each institution keeps its own piece, and nobody keeps the whole. When the patient shows up somewhere new, the record effectively resets.</p>
          <p>The consequences are mundane and expensive: <strong>repeated diagnostic tests</strong> because the last results can't be found, <strong>incomplete histories</strong> at exactly the moment a doctor needs context, and hours lost reconstructing what should have been a single scroll.</p>
          <p>Aarogyam collapses those fragments into one place. At registration, every patient receives a unique, permanent Aarogyam ID. From then on, every visit, diagnosis, prescription and uploaded report attaches to that ID, building a chronological health timeline that any authorized doctor can read in seconds by scanning the patient's QR card.</p>

          <hr className="rule" />

          <h2>Principles</h2>
          <div className="principles">
            <div className="principle">
              <div className="n">P·01</div>
              <h3>The patient owns the record</h3>
              <p>Records follow the person, not the institution. Patients can view, upload and download everything on their own timeline.</p>
            </div>
            <div className="principle">
              <div className="n">P·02</div>
              <h3>Trust is earned, then granted</h3>
              <p>Doctors register with licence and degree documents, and an admin verifies them before any access is granted. No exceptions.</p>
            </div>
            <div className="principle">
              <div className="n">P·03</div>
              <h3>Least privilege, always</h3>
              <p>Patients, doctors and admins operate in strictly separated roles. Each sees only what their role requires.</p>
            </div>
            <div className="principle">
              <div className="n">P·04</div>
              <h3>Useful on day one</h3>
              <p>A patient can register, receive an ID and upload their existing history in minutes: the record is never empty by design.</p>
            </div>
          </div>

          <hr className="rule" />

          <h2>Where it's heading</h2>
          <p>The current platform is a complete records system; the roadmap builds intelligence on top of it:</p>
          <ul>
            <li>AI-generated medical summaries of a patient's timeline</li>
            <li>OCR for digitizing printed and handwritten reports</li>
            <li>A mobile application for patients on the go</li>
            <li>ABDM / ABHA integration with India's national health stack</li>
            <li>Health analytics dashboards and smart medical insights</li>
          </ul>

          <hr className="rule" />

          <h2>A note on scope</h2>
          <p>Aarogyam is developed for <strong>educational and research purposes</strong>. It is a working demonstration of how a centralized digital health identity system can be designed and built, not a certified medical device or a substitute for professional medical infrastructure.</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2 className="reveal">See it from the inside.</h2>
          <p className="lede reveal d1">Create an ID, upload a report, watch the timeline take shape.</p>
          <div className="hero-ctas reveal d2">
            <Link className="btn btn-solid btn-lg" to="/register">Create your Aarogyam ID <span className="arr">→</span></Link>
            <Link className="btn btn-ghost btn-lg" to="/contact">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
