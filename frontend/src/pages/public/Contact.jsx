import { useState } from "react";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

const TEAM = [
  {
    role: "Developer",
    name: "Akshit Kapuriya",
    initials: "AK",
    github: "github.com/akshit-kapuriya",
    phone: "+91 6359446915",
    email: "akshitkapuriya8@gmail.com"
  },
  {
    role: "Team Lead & Developer",
    name: "Vaibhav Makvana",
    initials: "VM",
    github: "github.com/makvana-vaibhav",
    portfolio: "vaibhavmakvana.in",
    phone: "+91 9106117060",
    email: "hello@vaibhavmakvana.in"
  },
  {
    role: "Developer",
    name: "Shubham Bosmiya",
    initials: "SB",
    github: "github.com/Shelby1507",
    phone: "+91 9106123827",
    email: "bosmiyashubham15@gmail.com"
  }
];

const FAQS = [
  {
    q: "What is Aarogyam?",
    a: "Aarogyam is a digital health identity platform created to consolidate medical records, diagnoses, and prescriptions under a single permanent QR-enabled health identity."
  },
  {
    q: "How are doctor accounts verified?",
    a: "Doctor registrations remain inactive until an administrator manually verifies their medical licence number, degree credentials, and practice documents."
  },
  {
    q: "Is patient data private and secure?",
    a: "Yes. Access is role-restricted: patients own their full history, verified doctors access records during consultations, and passwords & sessions are secured with cryptography."
  },
  {
    q: "Can I report a bug or suggest an improvement?",
    a: "Absolutely! You can reach out directly to any member of our team via GitHub, email, or phone listed above, or send us a message using the form below."
  }
];

export default function Contact() {
  useDocumentTitle("Contact · Aarogyam");

  const [formData, setFormData] = useState({ name: "", email: "", subject: "General Question", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const targetEmail = "vaibhavmakvana14118@gmail.com";
    const mailSubject = encodeURIComponent(`[Aarogyam Contact] ${formData.subject} - ${formData.name}`);
    const mailBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nInquiry Type: ${formData.subject}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:${targetEmail}?subject=${mailSubject}&body=${mailBody}`;
    setSubmitted(true);
  };

  return (
    <>
      <section className="page-head contact-head">
        <div className="wrap">
          <span className="eyebrow">Contact Us</span>
          <h1>Get in touch with us</h1>
          <p className="lede">Have questions, feedback, or need technical support? Reach out to our team directly or send a message below.</p>
        </div>
      </section>

      <section className="section contact-section">
        <div className="wrap">
          {/* Team Grid — 3 in a row grid */}
          <div className="contact-grid">
            {TEAM.map((member) => (
              <div className="contact-card reveal" key={member.name}>
                <div className="contact-header">
                  <div className="contact-avatar">{member.initials}</div>
                  <div className="contact-role">{member.role}</div>
                  <h3>{member.name}</h3>
                </div>

                <div className="contact-list">
                  {member.github && (
                    <a className="contact-item" href={`https://${member.github}`} target="_blank" rel="noreferrer">
                      <div className="contact-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                          <path d="M9 18c-4.51 2-5-2-7-2" />
                        </svg>
                      </div>
                      <span className="contact-item-text">{member.github}</span>
                    </a>
                  )}

                  {member.portfolio && (
                    <a className="contact-item" href={`https://${member.portfolio}`} target="_blank" rel="noreferrer">
                      <div className="contact-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <span className="contact-item-text">{member.portfolio}</span>
                    </a>
                  )}

                  {member.phone && (
                    <a className="contact-item" href={`tel:${member.phone.replace(/\s+/g, "")}`}>
                      <div className="contact-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <span className="contact-item-text">{member.phone}</span>
                    </a>
                  )}

                  {member.email && (
                    <a className="contact-item" href={`mailto:${member.email}`}>
                      <div className="contact-icon-box">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <span className="contact-item-text">{member.email}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Contact Form Section */}
          <div className="contact-form-section reveal">
            <div className="contact-form-header">
              <h2>Send us a message</h2>
              <p>Have a question about Aarogyam, feedback, or a technical inquiry? Send us a message directly.</p>
            </div>

            {submitted ? (
              <div className="contact-success-msg">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Thank you! Your message has been sent. We will review it shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-grid">
                <div className="contact-form-group">
                  <label htmlFor="contact-name">Your Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="contact-input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="contact-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="contact-form-group contact-field-full">
                  <label htmlFor="contact-subject">Inquiry Type</label>
                  <select
                    id="contact-subject"
                    className="contact-select"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Question">General Question</option>
                    <option value="Platform Feedback">Platform Feedback</option>
                    <option value="Doctor Verification">Doctor Registration & Verification</option>
                    <option value="Bug Report">Bug Report / Technical Issue</option>
                  </select>
                </div>

                <div className="contact-form-group contact-field-full">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="contact-textarea"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <div className="contact-field-full">
                  <button type="submit" className="btn btn-solid btn-lg">
                    Send Email <span className="arr">→</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* FAQ Section */}
          <div className="faq-section reveal">
            <div className="faq-header">
              <h2>Frequently asked questions</h2>
              <p>Quick answers to common questions about Aarogyam.</p>
            </div>

            <div className="faq-grid">
              {FAQS.map((faq, index) => (
                <div className="faq-card" key={index}>
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {faq.q}
                  </h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
