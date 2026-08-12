import { useEffect, useState } from "react";

// Shared "only one open at a time, click-outside-to-close" behavior used by the
// notification bell + avatar menu popovers in both the patient and doctor shells.
export function usePopoverGroup() {
  const [open, setOpen] = useState(null);

  useEffect(() => {
    function onDocClick() {
      setOpen(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function toggle(key, e) {
    if (e) e.stopPropagation();
    setOpen((current) => (current === key ? null : key));
  }

  function stop(e) {
    e.stopPropagation();
  }

  return { open, toggle, stop };
}
