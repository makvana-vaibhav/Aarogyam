import { useState, useEffect } from "react";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = (navigator.userAgent || "").toLowerCase();
  
  // Explicitly reject Windows, Mac desktop, Linux desktop
  const isDesktopOS = /windows nt|macintosh|mac os x.*intel|x11.*linux/i.test(ua) && !/android|iphone|ipad|ipod|mobile/i.test(ua);
  if (isDesktopOS) return false;

  // Must have a mobile user agent AND be on a mobile viewport
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
  return isMobileUA && window.innerWidth <= 860;
}

function detectMobileBrowser() {
  if (typeof window === "undefined") return "other";
  const ua = (navigator.userAgent || "").toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) && !/crios|fxios|opios/.test(ua)) return "ios-safari";
  if (/crios/.test(ua)) return "ios-chrome";
  if (/fxios|firefox/.test(ua)) return "firefox";
  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/opr|opera/.test(ua)) return "opera";
  if (/edg|edge/.test(ua)) return "edge";
  if (/chrome|chromium/.test(ua)) return "chrome";
  return "other";
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [browserType, setBrowserType] = useState("other");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Only prompt on mobile devices (never on laptop/desktop/windows)
    if (!isMobileDevice()) return;

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

    const detected = detectMobileBrowser();
    setBrowserType(detected);

    // Standard Chromium beforeinstallprompt handler
    function handleBeforeInstall(e) {
      if (!isMobileDevice()) return;
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For all mobile browsers (iOS Safari, Firefox, Samsung, etc.), show universal install guidance after a gentle delay
    const fallbackTimer = setTimeout(() => {
      if (isMobileDevice() && !inStandalone) {
        setShowPrompt(true);
      }
    }, 2800);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(fallbackTimer);
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

  function renderInstruction() {
    if (deferredPrompt) {
      return <p>Install Aarogyam for fast offline access and an app experience on your phone.</p>;
    }
    if (browserType === "ios-safari") {
      return (
        <p>
          Tap <strong style={{ color: "var(--accent)" }}>Share ⎋</strong> at the bottom, then choose <strong>“Add to Home Screen”</strong>.
        </p>
      );
    }
    if (browserType === "ios-chrome") {
      return (
        <p>
          Tap <strong style={{ color: "var(--accent)" }}>Share ⎋</strong> in the address bar, then select <strong>“Add to Home Screen”</strong>.
        </p>
      );
    }
    if (browserType === "firefox") {
      return (
        <p>
          Tap menu <strong style={{ color: "var(--accent)" }}>⋮</strong>, then select <strong>“Install”</strong> or <strong>“Add to Home screen”</strong>.
        </p>
      );
    }
    if (browserType === "samsung") {
      return (
        <p>
          Tap menu <strong style={{ color: "var(--accent)" }}>☰</strong>, then tap <strong>“+ Add page to” ➔ “Home screen”</strong>.
        </p>
      );
    }
    if (browserType === "edge") {
      return (
        <p>
          Tap menu <strong style={{ color: "var(--accent)" }}>⋯</strong>, then select <strong>“Add to phone”</strong>.
        </p>
      );
    }
    return (
      <p>
        Tap your browser menu <strong style={{ color: "var(--accent)" }}>(⋮)</strong>, then select <strong>“Install App”</strong> or <strong>“Add to Home screen”</strong>.
      </p>
    );
  }

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
          {renderInstruction()}
        </div>

        <div className="pwa-install-actions">
          {deferredPrompt && (
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
