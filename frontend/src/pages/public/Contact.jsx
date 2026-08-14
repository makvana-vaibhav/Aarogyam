import { useDocumentTitle } from "../../lib/useDocumentTitle.js";

// NOTE: placeholder contact details below — swap for the real thing before this ships anywhere real.
const TEAM = [
  {
    kind: "Vaibhav Makvana",
    name: "Vaibhav Makvana",
    github: "github.com/makvana-vaibhav",
    portfolio: "vaibhavmakvana.in",
    phone: "+91 9106117060",
    email: "hello@vaibhavmakvana.in"
  },
  {
    kind: "Akshit Kapuriya",
    name: "Akshit Kapuriya",
    github: "github.com/akshit-kapuriya",
    phone: "+91 6359446915",
    email: "akshitkapuriya8@gmail.com"
  },
  {
    kind: "Shubham Bosmiya",
    name: "Shubham Bosmiya",
    github: "github.com/Shelby1507",
    phone: "+91 9106123827",
    email: "bosmiyashubham15@gmail.com"
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
