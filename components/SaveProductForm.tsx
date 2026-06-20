"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import type { NewProduct } from "@/lib/products";

const CATEGORIES = [
  "", "Bröd", "Pasta", "Mjöl/Bakning", "Godis/Snacks", "Mejeri",
  "Flingor/Müsli", "Såser/Kryddor", "Färdigmat", "Dryck", "Övrigt",
];

export function SaveProductForm({ result, onSave }: { result: AnalysisResult; onSave: (p: NewProduct) => Promise<void> }) {
  const [name, setName] = useState(result.productName ?? "");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <p className="mt-4 text-green-700">Sparad! ✓</p>;

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({
          name: name.trim() || "Namnlös produkt",
          status: result.status,
          category: category || null,
          brand: brand.trim() || null,
          note: note.trim() || null,
        });
        setSaving(false);
        setDone(true);
      }}
    >
      <input className="w-full rounded border p-2" placeholder="Namn" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="w-full rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c || "Kategori (frivillig)"}</option>)}
      </select>
      <input className="w-full rounded border p-2" placeholder="Märke / var den finns (frivillig)" value={brand} onChange={(e) => setBrand(e.target.value)} />
      <input className="w-full rounded border p-2" placeholder="Notis (frivillig)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="w-full rounded bg-blue-600 p-3 text-white" disabled={saving}>
        {saving ? "Sparar…" : "Spara produkt"}
      </button>
    </form>
  );
}
