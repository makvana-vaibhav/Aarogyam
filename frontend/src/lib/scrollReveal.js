// Ported from script.js's scroll-reveal behavior — call from a useEffect keyed on the route
// so it re-scans the newly-rendered page's .reveal elements after each navigation.
export function initScrollReveal() {
  const revealed = document.querySelectorAll(".reveal:not(.in)");
  if (!revealed.length) return;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealed.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }

  revealed.forEach((el) => el.classList.add("in"));
}
