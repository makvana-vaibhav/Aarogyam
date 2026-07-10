import heroImg from "@/assets/hero-health.png";
import shieldImg from "@/assets/security-shield.png";
import dashboardImg from "@/assets/dashboard-preview.png";
import whyImg from "@/assets/why-illustration.png";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  QrCode,
  FileText,
  Pill,
  Clock,
  Cloud,
  Lock,
  KeyRound,
  UserCheck,
  Sparkles,
  Play,
  Menu,
  X,
  Star,
  ChevronDown,
  HeartPulse,
  ScanLine,
  RefreshCcw,
  Globe,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ---------- Reusable primitives ---------- */

function GradientButton({
  children,
  href = "#",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow ${className}`}
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70" />
      <span className="relative flex items-center gap-2">{children}</span>
    </a>
  );
}

function GhostButton({
  children,
  href = "#",
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/60 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-all duration-300 hover:border-primary/40 hover:text-primary ${className}`}
    >
      {children}
    </a>
  );
}

function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

/* ---------- Navigation ---------- */

function Logo() {
  return (
    <a href="#" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-soft">
        <HeartPulse className="h-5 w-5 text-white" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Aarogyam
      </span>
    </a>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  const links = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-blur" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#"
            className="text-sm font-semibold text-foreground/80 transition-colors hover:text-primary"
          >
            Login
          </a>
          <GradientButton href="#" className="px-5 py-2.5">
            Register Free <ArrowRight className="h-4 w-4" />
          </GradientButton>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="nav-blur border-t border-border/60 md:hidden">
          <div className="flex flex-col gap-2 px-6 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <GhostButton href="#" className="flex-1 py-2.5">
                Login
              </GhostButton>
              <GradientButton href="#" className="flex-1 py-2.5">
                Register
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-glow" />
        <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -right-40 top-24 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-16 lg:grid-cols-2">
        {/* LEFT */}
        <div className="animate-reveal">
          <Eyebrow>
            <Check className="h-3.5 w-3.5" /> One Digital Health Identity For Life
          </Eyebrow>
          <h1 className="mt-6 text-[44px] font-extrabold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Your Health.
            <br />
            <span className="text-gradient-primary">One Identity.</span>
            <br />
            Lifetime Access.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Manage your complete medical history securely in one place. Access
            prescriptions, lab reports, diagnoses, and health records anytime,
            anywhere.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GradientButton href="#">
              Create Aarogyam ID <ArrowRight className="h-4 w-4" />
            </GradientButton>
            <GhostButton href="#">
              <Play className="h-4 w-4" /> Watch Demo
            </GhostButton>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-foreground/80 sm:max-w-lg">
            {[
              "Secure Cloud Storage",
              "QR Health Card",
              "Encrypted Records",
              "Lifetime Health Timeline",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[40px] bg-gradient-soft blur-2xl" />
          <div className="relative animate-float">
            <img
              src={heroImg}
              alt="Aarogyam digital health identity illustration"
              width={1280}
              height={1280}
              className="mx-auto w-full max-w-[560px] drop-shadow-[0_30px_60px_rgba(13,92,99,0.25)]"
            />
          </div>
          {/* Floating chips */}
          <div className="absolute left-0 top-10 hidden rounded-2xl glass px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Encryption</div>
              <div className="text-sm font-semibold">AES-256 Secured</div>
            </div>
          </div>
          <div className="absolute right-0 bottom-6 hidden rounded-2xl glass px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/30 text-primary">
              <QrCode className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs text-muted-foreground">Health ID</div>
              <div className="text-sm font-semibold">AAROGYAM-7G3X9K</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stats ---------- */

function Stats() {
  const items = [
    { k: "10,000+", v: "Patients Registered" },
    { k: "500+", v: "Doctors" },
    { k: "100%", v: "Encrypted Records" },
    { k: "24/7", v: "Access Anywhere" },
  ];
  return (
    <Section className="pt-8 md:pt-12">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-soft backdrop-blur md:grid-cols-4 md:p-8">
        {items.map((i) => (
          <div
            key={i.v}
            className="rounded-2xl px-4 py-6 text-center md:border-r md:border-border/50 md:last:border-r-0"
          >
            <div className="text-3xl font-extrabold tracking-tight text-gradient-primary md:text-4xl">
              {i.k}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{i.v}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Features ---------- */

const features = [
  {
    icon: UserCheck,
    title: "Digital Health Identity",
    desc: "A unique lifelong health ID that follows you across every clinic, hospital, and lab.",
  },
  {
    icon: QrCode,
    title: "QR Health Card",
    desc: "Instant patient verification with a single scan — no forms, no waiting.",
  },
  {
    icon: FileText,
    title: "Medical Reports",
    desc: "Upload, organize, and share lab reports securely with providers in seconds.",
  },
  {
    icon: Pill,
    title: "Digital Prescriptions",
    desc: "Store, track, and re-order every prescription from one unified inbox.",
  },
  {
    icon: Clock,
    title: "Health Timeline",
    desc: "A chronological view of your complete medical history, always up to date.",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    desc: "AES-encrypted records stored across resilient, HIPAA-grade infrastructure.",
  },
];

function Features() {
  return (
    <Section id="features">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Features</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Everything you need for{" "}
          <span className="text-gradient-primary">better healthcare</span>
        </h2>
        <p className="mt-4 text-muted-foreground">
          Purpose-built for patients and providers who value privacy, speed, and
          clarity.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative rounded-3xl border border-border/60 bg-card p-7 shadow-soft card-hover"
          >
            <div className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="mb-5 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-white shadow-soft">
              <f.icon className="h-5 w-5" strokeWidth={2.25} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.desc}
            </p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Learn more
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- How it works ---------- */

const steps = [
  {
    icon: UserCheck,
    title: "Register",
    desc: "Sign up in under a minute with your basic details and phone verification.",
  },
  {
    icon: QrCode,
    title: "Generate Aarogyam ID",
    desc: "Get your unique QR health card, ready to share with any provider.",
  },
  {
    icon: FileText,
    title: "Doctor Updates Records",
    desc: "Providers append encrypted prescriptions and reports to your profile.",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    desc: "View your full timeline from any device, on any continent, 24/7.",
  },
];

function HowItWorks() {
  return (
    <Section id="how" className="bg-gradient-soft">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          From signup to a{" "}
          <span className="text-gradient-primary">lifelong record</span>
        </h2>
      </div>
      <div className="relative mt-16 grid gap-8 md:grid-cols-4">
        <div className="pointer-events-none absolute inset-x-8 top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        {steps.map((s, i) => (
          <div key={s.title} className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-card border border-border/70 shadow-soft">
              <s.icon className="h-6 w-6 text-primary" strokeWidth={2.25} />
            </div>
            <div className="mx-auto mt-4 grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-xs font-bold text-white shadow-soft">
              {i + 1}
            </div>
            <h3 className="mt-4 text-center text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Why Aarogyam ---------- */

function Why() {
  const points = [
    "Lifetime health record — yours forever",
    "Bank-grade encryption on every field",
    "QR-based instant provider access",
    "Paperless, sustainable healthcare",
    "Faster, better-informed diagnoses",
    "Available anywhere, on any device",
  ];
  return (
    <Section id="about">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-glow opacity-70 blur-2xl" />
          <img
            src={whyImg}
            alt="Why Aarogyam illustration"
            width={1024}
            height={1024}
            loading="lazy"
            className="mx-auto w-full max-w-[520px] animate-float"
          />
        </div>
        <div>
          <Eyebrow>Why Aarogyam</Eyebrow>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Designed for how healthcare{" "}
            <span className="text-gradient-primary">should feel</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Aarogyam brings your care into one calm, secure, always-available
            place — so you spend less time managing paperwork and more time
            living well.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-primary text-white">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm font-medium text-foreground/90">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Platform preview ---------- */

function Preview() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Platform preview</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          A calm command center for{" "}
          <span className="text-gradient-primary">your health</span>
        </h2>
      </div>

      <div className="relative mt-14">
        <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[40px] bg-gradient-glow blur-3xl" />
        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-elevated">
          <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/50" />
            <div className="mx-auto flex items-center gap-2 rounded-lg bg-background/70 px-3 py-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> app.aarogyam.health
            </div>
          </div>
          <img
            src={dashboardImg}
            alt="Aarogyam dashboard preview"
            width={1600}
            height={1024}
            loading="lazy"
            className="w-full"
          />
        </div>

        {/* Floating glass cards */}
        <div className="absolute -left-4 top-24 hidden rounded-2xl glass px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <HeartPulse className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs text-muted-foreground">Health Score</div>
            <div className="text-sm font-semibold">82 / 100</div>
          </div>
        </div>
        <div className="absolute -right-4 bottom-16 hidden rounded-2xl glass px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/30 text-primary">
            <ScanLine className="h-4 w-4" />
          </span>
          <div>
            <div className="text-xs text-muted-foreground">Last sync</div>
            <div className="text-sm font-semibold">Just now</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Security ---------- */

function Security() {
  const items = [
    { icon: Lock, title: "End-to-End Encryption", desc: "AES-256 in transit and at rest." },
    { icon: Cloud, title: "Cloud Backup", desc: "Redundant, geo-distributed storage." },
    { icon: KeyRound, title: "Role-Based Access", desc: "You choose who sees what, always." },
    { icon: UserCheck, title: "Secure Login", desc: "MFA, biometrics, and passkey support." },
    { icon: ShieldCheck, title: "Data Privacy", desc: "HIPAA & GDPR aligned by design." },
    { icon: RefreshCcw, title: "Full Audit Trail", desc: "Every access is logged and visible to you." },
  ];
  return (
    <section
      id="security"
      className="relative overflow-hidden px-6 py-28 md:py-36"
      style={{ background: "linear-gradient(160deg, #0a3f45 0%, #0D5C63 55%, #164e56 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-40">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-teal-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-glow blur-3xl" />
          <img
            src={shieldImg}
            alt="Security shield"
            width={1024}
            height={1024}
            loading="lazy"
            className="mx-auto w-full max-w-[440px] animate-float"
          />
        </div>
        <div className="text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide uppercase">
            <ShieldCheck className="h-3.5 w-3.5" /> Security first
          </div>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Built like a bank.
            <br />
            Cared for like a clinic.
          </h2>
          <p className="mt-4 max-w-lg text-white/70">
            Your health data is the most personal record you own. Aarogyam protects
            it with layered security and transparent controls.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {items.map((i) => (
              <div
                key={i.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-accent">
                  <i.icon className="h-4 w-4" />
                </span>
                <div className="mt-3 text-sm font-semibold">{i.title}</div>
                <div className="mt-1 text-xs text-white/60">{i.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */

const testimonials = [
  {
    quote:
      "I finally have every prescription in one place. When I travel, I just show my QR — that's it.",
    name: "Ananya S.",
    role: "Patient, Mumbai",
    initial: "A",
  },
  {
    quote:
      "Instead of chasing files, I open a patient's timeline and see everything I need in seconds.",
    name: "Dr. Rohan Mehta",
    role: "General Physician",
    initial: "R",
  },
  {
    quote:
      "Aarogyam has quietly become the connective tissue of our outpatient workflow.",
    name: "Sunrise Hospital",
    role: "Hospital partner",
    initial: "S",
  },
];

function Testimonials() {
  return (
    <Section>
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Loved by patients & providers</Eyebrow>
        <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
          Trusted across the care{" "}
          <span className="text-gradient-primary">continuum</span>
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="rounded-3xl border border-border/60 bg-card p-7 shadow-soft card-hover"
          >
            <div className="flex gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 text-base leading-relaxed text-foreground/90">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-sm font-bold text-white">
                {t.initial}
              </span>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}

/* ---------- FAQ ---------- */

const faqs = [
  {
    q: "What is an Aarogyam ID?",
    a: "A unique, lifelong digital health identity that links your medical records, prescriptions, and reports in one secure place.",
  },
  {
    q: "Is my data really private?",
    a: "Yes. Records are AES-256 encrypted, access is role-based, and every view is logged in an audit trail only you control.",
  },
  {
    q: "Do I need a smartphone to use it?",
    a: "No. Aarogyam works on any modern browser. Your QR card can also be printed for offline use.",
  },
  {
    q: "Can my doctor add records directly?",
    a: "Yes. Verified providers can append prescriptions and reports to your timeline with your permission.",
  },
  {
    q: "Does it cost anything?",
    a: "Creating an Aarogyam ID and managing your records is free for individuals. Providers pay for premium features.",
  },
  {
    q: "What happens if I lose access to my phone?",
    a: "You can recover your account using verified email, phone OTP, or a trusted recovery contact.",
  },
  {
    q: "Can I export my records?",
    a: "Absolutely. Export all your data as encrypted PDFs or standards-compliant FHIR bundles at any time.",
  },
  {
    q: "Is Aarogyam suitable for hospitals?",
    a: "Yes. We offer a provider workspace with role-based access, analytics, and secure record intake.",
  },
];

function FAQ() {
  return (
    <Section>
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_2fr]">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Answers, upfront.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Can't find what you're looking for?{" "}
            <a href="#" className="font-medium text-primary underline underline-offset-4">
              Talk to our team
            </a>
            .
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="border-b border-border/60"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* ---------- CTA ---------- */

function FinalCTA() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[32px] p-12 text-center md:p-20">
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-32 left-1/4 h-[400px] w-[400px] rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
          Ready to manage your health digitally?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Create your free Aarogyam ID in under a minute. Your lifelong,
          encrypted health record — starting today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
          >
            Create Free Aarogyam ID <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            Login
          </a>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Features", "How it works", "Security", "Pricing"],
    },
    {
      title: "Resources",
      links: ["Docs", "Help center", "Changelog", "Status"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Contact", "Blog"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "HIPAA", "GDPR"],
    },
  ];
  return (
    <footer className="border-t border-border/60 bg-background px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              One secure digital identity for your lifelong health record.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-sm font-semibold text-foreground">{c.title}</div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Aarogyam. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary">Twitter</a>
            <a href="#" className="hover:text-primary">LinkedIn</a>
            <a href="#" className="hover:text-primary">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Root ---------- */

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Why />
      <Preview />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}