"use client";

import { useState } from "react";
import type { SavedProduct, NewProduct } from "@/lib/products";
import { ConfirmModal } from "./ConfirmModal";
import { EditProductForm } from "./EditProductForm";

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
    detailText: "text-emerald-700",
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
    detailText: "text-amber-700",
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
    detailText: "text-rose-700",
  },
} as const;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProductList({
  products,
  onDelete,
  onUpdate,
}: {
  products: SavedProduct[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<NewProduct>) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "unsafe">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedProduct | null>(null);

  function toggleExpand(id: string, isExpanded: boolean) {
    setExpandedId(isExpanded ? null : id);
    setEditingId(null);
  }

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
          const isExpanded = expandedId === p.id;
          const meta = [p.category, p.brand].filter(Boolean).join(" · ");
          return (
            <li key={p.id} className={`rounded-2xl border-2 ${s.border} overflow-hidden`}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`details-${p.id}`}
                  onClick={() => toggleExpand(p.id, isExpanded)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded-2xl"
                >
                  <span className={`w-9 h-9 grid place-items-center rounded-full ${s.iconBg} text-white shrink-0`}>
                    {s.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-display font-bold text-ink ${isExpanded ? "break-words" : "truncate"}`}>{p.name}</div>
                    {!isExpanded && meta && (
                      <div className="text-xs text-ink/50 font-body truncate">{meta}</div>
                    )}
                  </div>
                  <svg
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                    className={`text-ink/40 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="shrink-0 mr-2 text-ink/40 hover:text-rose-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={() => setPendingDelete(p)}
                  aria-label={`Ta bort ${p.name}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                  </svg>
                </button>
              </div>

              {isExpanded && editingId === p.id && (
                <EditProductForm
                  product={p}
                  onCancel={() => setEditingId(null)}
                  onSave={async (patch) => {
                    await onUpdate(p.id, patch);
                    setEditingId(null);
                  }}
                />
              )}

              {isExpanded && editingId !== p.id && (
                <div id={`details-${p.id}`} className="px-4 pb-4 pt-1 font-body text-sm">
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-ink/45 w-20 shrink-0">Status</span>
                      <span className={`font-bold ${s.detailText}`}>{s.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-ink/45 w-20 shrink-0">Kategori</span>
                      <span className="text-ink break-words min-w-0">{p.category || "—"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-ink/45 w-20 shrink-0">Märke</span>
                      <span className="text-ink break-words min-w-0">{p.brand || "—"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-ink/45 w-20 shrink-0">Notis</span>
                      <span className="text-ink break-words min-w-0">{p.note || "—"}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-ink/45 w-20 shrink-0">Sparad</span>
                      <span className="text-ink/70">{formatDate(p.created_at)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingId(p.id)}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-teal text-teal hover:bg-teal/10 transition-colors font-display font-bold px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                    Redigera
                  </button>
                </div>
              )}
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="text-ink/40 font-body text-center py-8">Inga produkter ännu.</li>
        )}
      </ul>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Ta bort produkt?"
        message={pendingDelete ? `”${pendingDelete.name}” tas bort från listan. Det går inte att ångra.` : undefined}
        confirmLabel="Ta bort"
        cancelLabel="Avbryt"
        tone="danger"
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
