"use client";

import { useState } from "react";
import type { SavedProduct } from "@/lib/products";

const STATUS_STYLES = {
  safe: {
    border: "border-emerald-200",
    iconBg: "bg-emerald-500",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
    filterBg: "bg-emerald-100 text-emerald-700",
    filterActiveBg: "bg-emerald-500 text-white",
    label: "Får äta",
  },
  warning: {
    border: "border-amber-200",
    iconBg: "bg-amber-500",
    icon: (
      <span className="font-display font-extrabold text-base leading-none">!</span>
    ),
    filterBg: "bg-amber-100 text-amber-700",
    filterActiveBg: "bg-amber-500 text-white",
    label: "Kolla",
  },
  unsafe: {
    border: "border-rose-200",
    iconBg: "bg-rose-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    ),
    filterBg: "bg-rose-100 text-rose-700",
    filterActiveBg: "bg-rose-500 text-white",
    label: "Gluten",
  },
} as const;

export function ProductList({ products, onDelete }: { products: SavedProduct[]; onDelete: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "unsafe">("all");

  const visible = products.filter((p) => {
    const matchesQ = p.name.toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" || p.status === filter;
    return matchesQ && matchesF;
  });

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <label htmlFor="product-search" className="sr-only">Sök produkt</label>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          id="product-search"
          className="w-full rounded-2xl border-2 border-sky bg-sky pl-11 pr-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors"
          placeholder="Sök produkt…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-display font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40 ${
            filter === "all" ? "bg-teal text-white" : "bg-sky text-ink/60 hover:bg-teal/10"
          }`}
        >
          Alla
        </button>
        {(["safe", "warning", "unsafe"] as const).map((f) => {
          const s = STATUS_STYLES[f];
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-display font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40 ${
                isActive ? s.filterActiveBg : s.filterBg
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Product rows */}
      <ul className="space-y-2.5">
        {visible.map((p) => {
          const s = STATUS_STYLES[p.status];
          return (
            <li key={p.id} className={`flex items-center gap-3 rounded-2xl border-2 ${s.border} px-4 py-3`}>
              <span className={`w-9 h-9 grid place-items-center rounded-full ${s.iconBg} text-white shrink-0`}>
                {s.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-ink truncate">{p.name}</div>
                {(p.brand || p.category) && (
                  <div className="text-xs text-ink/50 font-body">{[p.category, p.brand].filter(Boolean).join(" · ")}</div>
                )}
                {p.note && <div className="text-xs text-ink/50 font-body">{p.note}</div>}
              </div>
              <button
                className="text-sm font-body text-ink/40 hover:text-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 rounded px-1 py-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => { if (confirm(`Ta bort ${p.name}?`)) onDelete(p.id); }}
                aria-label={`Ta bort ${p.name}`}
              >
                Ta bort
              </button>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="text-ink/40 font-body text-center py-8">Inga produkter ännu.</li>
        )}
      </ul>
    </div>
  );
}
