import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

export default function Contact() {
  useDocumentTitle("Contact — Aarogyam");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1>We read everything.</h1>
          <p className="lede">Questions about the platform, feedback on the product, or a doctor account waiting on approval — send it over.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <div className="ci-row">
                <div className="ci-label">General &amp; support</div>
                <div className="ci-value"><a href="mailto:support@aarogyam.health">support@aarogyam.health</a></div>
                <div className="ci-sub">Account issues, OTP problems, record questions.</div>
              </div>
              <div className="ci-row">
                <div className="ci-label">Doctor onboarding</div>
                <div className="ci-value"><a href="mailto:doctors@aarogyam.health">doctors@aarogyam.health</a></div>
                <div className="ci-sub">Licence verification and approval status.</div>
              </div>
              <div className="ci-row">
                <div className="ci-label">Project &amp; research</div>
                <div className="ci-value"><a href="mailto:hello@aarogyam.health">hello@aarogyam.health</a></div>
                <div className="ci-sub">Collaboration, academic queries, the codebase.</div>
              </div>
              <div className="ci-row">
                <div className="ci-label">Response time</div>
                <div className="ci-value">Within 2 working days</div>
                <div className="ci-sub">Usually much sooner.</div>
              </div>
            </div>

            <form className="contact-form reveal d1" action="mailto:support@aarogyam.health" method="post" encType="text/plain">
              <div className="form-row">
                <label htmlFor="cf-name">Your name<span className="req">*</span></label>
                <input id="cf-name" name="name" type="text" placeholder="Jane Mehta" required />
              </div>
              <div className="form-row">
                <label htmlFor="cf-email">Email<span className="req">*</span></label>
                <input id="cf-email" name="email" type="email" placeholder="jane@mail.com" required />
              </div>
              <div className="form-row">
                <label htmlFor="cf-topic">Topic</label>
                <select id="cf-topic" name="topic">
                  <option>General question</option>
                  <option>Account &amp; login</option>
                  <option>Doctor approval</option>
                  <option>Feedback</option>
                  <option>Something else</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="cf-msg">Message<span className="req">*</span></label>
                <textarea id="cf-msg" name="message" placeholder="What's on your mind?" required></textarea>
              </div>
              <button className="btn btn-solid btn-lg" type="submit">Send message <span className="arr">→</span></button>
              <p className="form-note">Please don't include medical details or documents in this form — those belong inside your Aarogyam record, not in email.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
