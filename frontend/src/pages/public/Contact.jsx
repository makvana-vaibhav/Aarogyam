import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

// NOTE: placeholder contact details below — swap for the real thing before this ships anywhere real.
const TEAM = [
  {
    kind: "Team member 1",
    name: "Team Member 1",
    github: "github.com/yourhandle",
    portfolio: "yourportfolio.dev",
    phone: "+91 00000 00000",
    email: "you@example.com"
  },
  {
    kind: "Team member 2",
    name: "Team Member 2",
    github: "github.com/yourhandle",
    portfolio: "yourportfolio.dev",
    phone: "+91 00000 00000",
    email: "you@example.com"
  },
  {
    kind: "Team member 3",
    name: "Team Member 3",
    github: "github.com/yourhandle",
    portfolio: "yourportfolio.dev",
    phone: "+91 00000 00000",
    email: "you@example.com"
  }
];

export default function Contact() {
  useDocumentTitle("Contact · Aarogyam");

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <span className="eyebrow">Contact</span>
          <h1>We read everything.</h1>
          <p className="lede">Aarogyam is a college project built by a three-person team. Reach out to any of us directly.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="role-grid">
            {TEAM.map((member) => (
              <div className="role-card reveal" key={member.name}>
                <div className="role-kind">{member.kind}</div>
                <h3>{member.name}</h3>
                <ul>
                  <li><a href={`https://${member.github}`} target="_blank" rel="noreferrer">{member.github}</a></li>
                  <li><a href={`https://${member.portfolio}`} target="_blank" rel="noreferrer">{member.portfolio}</a></li>
                  <li><a href={`tel:${member.phone.replace(/\s+/g, "")}`}>{member.phone}</a></li>
                  <li><a href={`mailto:${member.email}`}>{member.email}</a></li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
