import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PublicHeader from "./PublicHeader.jsx";
import PublicFooter from "./PublicFooter.jsx";
import PwaInstallPrompt from "./PwaInstallPrompt.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";
import { initScrollReveal } from "../lib/scrollReveal.js";

// Used by the marketing pages (home/about/contact/privacy/terms) — full footer with link columns.
export default function MarketingLayout() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo(0, 0);
    }
    return initScrollReveal();
  }, [location.pathname, location.hash]);

  return (
    <>
      <OfflineIndicator />
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
      <PwaInstallPrompt />
    </>
  );
}

