import { useEffect, useState } from "react";

// Shared "only one open at a time, click-outside-to-close" behavior used by the
// notification bell + avatar menu popovers in both the patient and doctor shells.
export function usePopoverGroup() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    function onDocClick(e) {
      // If clicking outside any open popover or trigger button, close it
      if (!e.target.closest(".pt-popover") && !e.target.closest(".pt-avatar-btn") && !e.target.closest(".pt-icon-btn")) {
        setOpen(null);
      }
    }

    document.addEventListener("click", onDocClick);
    document.addEventListener("pointerdown", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("pointerdown", onDocClick);
    };
  }, []);

  function toggle(key, e) {
    if (e) e.stopPropagation();
    setOpen((current) => (current === key ? null : key));
  }

  function close() {
    setOpen(null);
  }

  function stop(e) {
    if (e) e.stopPropagation();
  }

  return { open, toggle, close, stop };
}
