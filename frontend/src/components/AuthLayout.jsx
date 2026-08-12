import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import PublicHeader from "./PublicHeader.jsx";
import { SimpleFooter } from "./PublicFooter.jsx";
import PwaInstallPrompt from "./PwaInstallPrompt.jsx";
import OfflineIndicator from "./OfflineIndicator.jsx";

// Used by the auth-flow pages (login/register/forgot-password/verify-otp/dashboard) — simple footer.
export default function AuthLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <OfflineIndicator />
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <SimpleFooter />
      <PwaInstallPrompt />
    </>
  );
}

