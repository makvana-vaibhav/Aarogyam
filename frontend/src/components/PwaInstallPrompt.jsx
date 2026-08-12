import { useState, useEffect } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    
    if (inStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem("aarogyam_pwa_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isAppleDevice && !inStandalone) {
      setIsIos(true);
      // Give the user a moment to browse before showing the prompt
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Standard Chromium / Android beforeinstallprompt
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 2500);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem("aarogyam_pwa_dismissed", Date.now().toString());
  }

  if (isStandalone || !showPrompt) return null;

  return (
    <aside className="pwa-install-banner" role="dialog" aria-label="Install Aarogyam App">
      <div className="pwa-install-inner">
        <div className="pwa-install-icon">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="#081c15" stroke="#2d6a4f" strokeWidth="1.5" />
            <path d="M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3" stroke="#40916c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="pwa-install-text">
          <strong>Install Aarogyam App</strong>
          {isIos ? (
            <p>
              Tap <span className="pwa-ios-share-icon" aria-label="Share">⎋</span> Share, then select <strong>“Add to Home Screen”</strong> for the best app experience.
            </p>
          ) : (
            <p>Fast offline access and native app experience on your phone.</p>
          )}
        </div>

        <div className="pwa-install-actions">
          {!isIos && deferredPrompt && (
            <button className="btn btn-solid btn-sm" type="button" onClick={handleInstallClick}>
              Install
            </button>
          )}
          <button className="btn btn-ghost btn-sm pwa-close-btn" type="button" onClick={handleDismiss} aria-label="Dismiss">
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
