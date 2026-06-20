"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import type { NewProduct } from "@/lib/products";
import { Select } from "./Select";
import { CATEGORY_OPTIONS } from "@/lib/categories";

const inputClass =
  "w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors";

export function SaveProductForm({ result, onSave }: { result: AnalysisResult; onSave: (p: NewProduct) => Promise<void> }) {
  const [name, setName] = useState(result.productName ?? "");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 font-body flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        Sparad!
      </div>
    );
  }

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveError(null);
        try {
          await onSave({
            name: name.trim() || "Namnlös produkt",
            status: result.status,
            category: category || null,
            brand: brand.trim() || null,
            note: note.trim() || null,
          });
          setDone(true);
        } catch {
          setSaveError("Kunde inte spara. Försök igen.");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div>
        <label htmlFor="product-name" className="sr-only">Produktnamn</label>
        <input
          id="product-name"
          className={inputClass}
          placeholder="Produktnamn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <Select
        id="product-category"
        label="Kategori (frivillig)"
        value={category}
        onChange={setCategory}
        options={CATEGORY_OPTIONS}
      />

      <div>
        <label htmlFor="product-brand" className="sr-only">Märke eller var den finns</label>
        <input
          id="product-brand"
          className={inputClass}
          placeholder="Märke / var den finns (frivillig)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="product-note" className="sr-only">Notis</label>
        <input
          id="product-note"
          className={inputClass}
          placeholder="Notis (frivillig)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {saveError && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-rose-700 font-body text-sm">{saveError}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-[1.4rem] bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold py-4 focus:outline-none focus:ring-4 focus:ring-teal/40 disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "Sparar…" : "Spara produkt"}
      </button>
    </form>
  );
}
