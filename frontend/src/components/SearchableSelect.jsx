import { useEffect, useRef, useState } from "react";

// Drop-in replacement for a plain <select> on long option lists (country, state,
// city, hospital, degree, specialization...). Native <select> popups can't be
// height-capped with CSS and take over the whole screen on mobile — this opens a
// small panel instead, capped to ~5 visible rows with a scrollbar, plus a filter
// input so a 190-option country list stays usable without native type-ahead.
export default function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  invalid = false,
  clearable = true
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selected = options.find((o) => String(o.value) === String(value));
  const allOptions = clearable ? [{ value: "", label: placeholder, isClear: true }, ...options] : options;
  const term = query.trim().toLowerCase();
  const filtered = term ? allOptions.filter((o) => o.label.toLowerCase().includes(term)) : allOptions;

  function toggle() {
    if (disabled) return;
    setOpen((v) => !v);
    setQuery("");
  }

  function selectOption(opt) {
    onChange(String(opt.value));
    setOpen(false);
    setQuery("");
  }

  return (
    <div className={"searchable-select" + (open ? " open" : "") + (disabled ? " disabled" : "")} ref={rootRef}>
      <button
        type="button"
        id={id}
        className={"searchable-select-trigger" + (invalid ? " invalid" : "")}
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "searchable-select-value" : "searchable-select-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open ? (
        <div className="searchable-select-panel">
          {options.length > 8 ? (
            <input
              ref={searchRef}
              type="text"
              className="searchable-select-search"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          ) : null}
          <ul className="searchable-select-list" role="listbox">
            {filtered.length === 0 ? (
              <li className="searchable-select-empty">No matches</li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.isClear ? "__clear__" : opt.value}
                  role="option"
                  aria-selected={String(opt.value) === String(value)}
                  className={
                    "searchable-select-option" +
                    (opt.isClear ? " clear-option" : "") +
                    (String(opt.value) === String(value) ? " selected" : "")
                  }
                  onClick={() => selectOption(opt)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
