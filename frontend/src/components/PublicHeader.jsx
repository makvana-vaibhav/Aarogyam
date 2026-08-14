import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isLoggedIn, getUser, getDashboardHref, logout } from "../lib/publicAuth.js";

// Section ids on the Home page that the nav's active-state scroll-spy watches.
// "problem" has no nav link of its own — it groups under "Home" (see sectionToNavKey below).
const SPY_SECTION_IDS = ["problem", "features", "how", "roles"];

function sectionToNavKey(sectionId) {
  return sectionId === "problem" ? "home" : sectionId;
}

// Ported from the shared <header class="site-header"> markup + script.js's scroll/mobile-nav
// wiring + auth.js's DOMContentLoaded header-actions swap (Login/Register -> Dashboard/Log out).
export default function PublicHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState(() => (isLoggedIn() ? getUser() : null));
  // Which in-page nav key is active, based on which Home section is in view.
  // null means "no spied section in view" -> Home is treated as active (top of page, or a
  // section like security/why/cta that has no nav link).
  const [activeNavKey, setActiveNavKey] = useState(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: the spied sections only exist on the Home page, so this re-runs (and the
  // observer gets torn down/recreated) whenever the route changes, e.g. navigating away and
  // back to "/".
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveNavKey(null);
      return;
    }

    const sections = SPY_SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) {
      setActiveNavKey(null);
      return;
    }

    const ratios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let bestId = null;
        let bestRatio = 0;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        setActiveNavKey(bestId ? sectionToNavKey(bestId) : null);
      },
      // A thin horizontal band around the vertical center of the viewport: whichever section
      // is passing through it "wins". Nothing intersecting (top of page, or a non-spied
      // section like security/why) falls back to Home.
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    setActiveNavKey(null);

    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    setUser(isLoggedIn() ? getUser() : null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", navOpen);
  }, [navOpen]);

  useEffect(() => {
    return () => document.body.classList.remove("nav-open");
  }, []);

  function closeNav() {
    setNavOpen(false);
  }

  return (
    <header className={"site-header" + (scrolled ? " scrolled" : "")}>
      <div className="wrap">
        <Link className="brand" to="/" aria-label="Aarogyam home" onClick={closeNav}>
          <svg className="mark" width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" stroke="#2d6a4f" strokeWidth="1.5" />
            <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aarogyam <small>Health ID</small>
        </Link>

        <nav className="site-nav" id="siteNav">
          <Link to="/" className={location.pathname === "/" && (activeNavKey === "home" || activeNavKey === null) ? "active" : undefined} onClick={closeNav}>Home</Link>
          <Link to="/#features" className={location.pathname === "/" && activeNavKey === "features" ? "active" : undefined} onClick={closeNav}>Features</Link>
          <Link to="/#how" className={location.pathname === "/" && activeNavKey === "how" ? "active" : undefined} onClick={closeNav}>How it works</Link>
          <Link to="/#roles" className={location.pathname === "/" && activeNavKey === "roles" ? "active" : undefined} onClick={closeNav}>Who it's for</Link>
          <Link to="/contact" className={location.pathname === "/contact" ? "active" : undefined} onClick={closeNav}>Contact</Link>
          {!user ? (
            <div className="mobile-only-nav-auth">
              <Link to="/login" className="btn btn-ghost" onClick={closeNav}>Log in</Link>
              <Link to="/register" className="btn btn-solid" onClick={closeNav}>Register account</Link>
            </div>
          ) : (
            <div className="mobile-only-nav-auth">
              <Link to={getDashboardHref(user)} className="btn btn-ghost" onClick={closeNav}>Dashboard</Link>
              <button type="button" className="btn btn-solid" onClick={() => { closeNav(); logout(); }}>Log out</button>
            </div>
          )}
        </nav>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Menu"
          aria-expanded={navOpen ? "true" : "false"}
          onClick={() => setNavOpen((open) => !open)}
        >
          <span></span>
        </button>

        <div className="header-actions">
          {user ? (
            <>
              <Link className="btn btn-ghost" to={getDashboardHref(user)}>Dashboard</Link>
              <a
                className="btn btn-solid"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
              >
                Log out
              </a>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/login">Login</Link>
              <Link className="btn btn-solid" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
