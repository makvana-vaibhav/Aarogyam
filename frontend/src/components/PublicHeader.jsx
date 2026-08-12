import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isLoggedIn, getUser, getDashboardHref, logout } from "../lib/publicAuth.js";

// Ported from the shared <header class="site-header"> markup + script.js's scroll/mobile-nav
// wiring + auth.js's DOMContentLoaded header-actions swap (Login/Register -> Dashboard/Log out).
export default function PublicHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState(() => (isLoggedIn() ? getUser() : null));

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link to="/" className={location.pathname === "/" ? "active" : undefined} onClick={closeNav}>Home</Link>
          <Link to="/#features" onClick={closeNav}>Features</Link>
          <Link to="/#how" onClick={closeNav}>How it works</Link>
          <Link to="/#roles" onClick={closeNav}>Who it's for</Link>
          <Link to="/about" className={location.pathname === "/about" ? "active" : undefined} onClick={closeNav}>About</Link>
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
