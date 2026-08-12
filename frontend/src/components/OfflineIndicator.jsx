import { useState, useEffect } from "react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }

    function handleOffline() {
      setIsOffline(true);
      setShowReconnected(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className={`pwa-network-toast ${isOffline ? "offline" : "online"}`} role="status">
      {isOffline ? (
        <>
          <span className="pwa-dot offline"></span>
          <span>Offline mode — viewing cached data</span>
        </>
      ) : (
        <>
          <span className="pwa-dot online"></span>
          <span>Connection restored</span>
        </>
      )}
    </div>
  );
}
