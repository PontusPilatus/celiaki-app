"use client";

import { useState } from "react";
import type { SavedProduct } from "@/lib/products";

const BADGE = {
  safe: "bg-green-100 text-green-900",
  warning: "bg-yellow-100 text-yellow-900",
  unsafe: "bg-red-100 text-red-900",
} as const;

const EMOJI = { safe: "🟢", warning: "🟡", unsafe: "🔴" } as const;

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
      <input className="mb-3 w-full rounded border p-2" placeholder="Sök produkt…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mb-4 flex gap-2 text-sm">
        {(["all", "safe", "warning", "unsafe"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded px-3 py-1 ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            {f === "all" ? "Alla" : EMOJI[f]}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map((p) => (
          <li key={p.id} className={`flex items-center justify-between rounded-lg p-3 ${BADGE[p.status]}`}>
            <div>
              <div className="font-medium">{EMOJI[p.status]} {p.name}</div>
              {(p.brand || p.category) && <div className="text-sm opacity-80">{[p.category, p.brand].filter(Boolean).join(" · ")}</div>}
              {p.note && <div className="text-sm opacity-80">{p.note}</div>}
            </div>
            <button
              className="text-sm underline"
              onClick={() => { if (confirm(`Ta bort ${p.name}?`)) onDelete(p.id); }}
            >
              Ta bort
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="text-gray-500">Inga produkter ännu.</li>}
      </ul>
    </div>
  );
}
