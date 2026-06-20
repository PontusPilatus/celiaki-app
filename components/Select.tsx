"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type SelectOption = { value: string; label: string };

type Props = {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
};

const triggerClass =
  "w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink text-left flex items-center justify-between gap-2 focus:outline-none focus:border-teal transition-colors cursor-pointer";

export function Select({ id, label, value, onChange, options }: Props) {
  const reactId = useId();
  const listId = id ?? `select-${reactId}`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rect, setRect] = useState<{ left: number; top: number; width: number; below: boolean } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef<{ str: string; at: number }>({ str: "", at: 0 });

  const selected = options.find((o) => o.value === value);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const below = spaceBelow > 280 || spaceBelow > r.top;
    setRect({
      left: r.left,
      top: below ? r.bottom + 8 : r.top - 8,
      width: r.width,
      below,
    });
  }, []);

  const openMenu = useCallback(() => {
    position();
    setActiveIndex(selectedIndex);
    setOpen(true);
  }, [position, selectedIndex]);

  const closeMenu = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const choose = useCallback(
    (i: number) => {
      const opt = options[i];
      if (opt) onChange(opt.value);
      closeMenu();
    },
    [options, onChange, closeMenu],
  );

  // Keep the panel glued to the trigger while open.
  useLayoutEffect(() => {
    if (!open) return;
    position();
    const onScrollResize = () => position();
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
    };
  }, [open, position]);

  // Move DOM focus into the list when it opens.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  // Close on outside pointer.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      closeMenu(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, closeMenu]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function onListKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "Tab":
        closeMenu(false);
        break;
      default:
        if (e.key.length === 1) {
          const now = Date.now();
          typeahead.current.str =
            now - typeahead.current.at < 600 ? typeahead.current.str + e.key : e.key;
          typeahead.current.at = now;
          const q = typeahead.current.str.toLowerCase();
          const idx = options.findIndex((o) => o.label.toLowerCase().startsWith(q));
          if (idx >= 0) setActiveIndex(idx);
        }
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={selected ? "text-ink" : "text-ink/40"}>
          {selected ? selected.label : label}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`text-teal transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && rect &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            aria-activedescendant={`${listId}-opt-${activeIndex}`}
            tabIndex={-1}
            onKeyDown={onListKeyDown}
            style={{
              position: "fixed",
              left: rect.left,
              width: rect.width,
              ...(rect.below
                ? { top: rect.top }
                : { bottom: window.innerHeight - rect.top }),
            }}
            className="z-50 max-h-72 overflow-y-auto overscroll-contain rounded-2xl bg-white py-1.5 shadow-2xl ring-1 ring-sky focus:outline-none"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === activeIndex;
              return (
                <li
                  key={o.value}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  data-index={i}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => choose(i)}
                  className={`flex items-center justify-between gap-2 px-4 py-3 font-body cursor-pointer ${
                    isActive ? "bg-sky" : ""
                  } ${isSelected ? "text-teal font-bold" : "text-ink"}`}
                >
                  <span className={o.value === "" ? "text-ink/50" : ""}>{o.label}</span>
                  {isSelected && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
