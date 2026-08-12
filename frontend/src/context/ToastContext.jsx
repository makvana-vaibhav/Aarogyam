import { createContext, useCallback, useContext, useRef, useState } from "react";

// Replaces the original #toastHost / toast() DOM pattern used by every portal.
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const showToast = useCallback((message, isError, duration) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, message, isError: !!isError }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, duration || 3200);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div id="toastHost">
        {toasts.map((t) => (
          <div key={t.id} className={"toast" + (t.isError ? " error" : "")}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
