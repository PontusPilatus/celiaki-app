"use client";

import { useState } from "react";
import type { SavedProduct, NewProduct } from "@/lib/products";
import type { ProductStatus } from "@/lib/types";
import { Select } from "./Select";
import { CATEGORY_OPTIONS } from "@/lib/categories";

const STATUS_OPTS: { value: ProductStatus; label: string; active: string; idle: string }[] = [
  { value: "safe", label: "Får äta", active: "bg-emerald-500 text-white", idle: "bg-emerald-100 text-emerald-700" },
  { value: "warning", label: "Kolla", active: "bg-amber-500 text-white", idle: "bg-amber-100 text-amber-700" },
  { value: "unsafe", label: "Gluten", active: "bg-rose-500 text-white", idle: "bg-rose-100 text-rose-700" },
];

const inputClass =
  "w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors";

export function EditProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: SavedProduct;
  onSave: (patch: Partial<NewProduct>) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product.name);
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [category, setCategory] = useState(product.category ?? "");
  const [brand, setBrand] = useState(product.brand ?? "");
  const [note, setNote] = useState(product.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="px-4 pb-4 pt-1 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
          await onSave({
            name: name.trim() || "Namnlös produkt",
            status,
            category: category || null,
            brand: brand.trim() || null,
            note: note.trim() || null,
          });
        } catch {
          setError("Kunde inte spara ändringen. Försök igen.");
          setSaving(false);
        }
      }}
    >
      <div>
        <label htmlFor={`edit-name-${product.id}`} className="sr-only">Produktnamn</label>
        <input
          id={`edit-name-${product.id}`}
          className={inputClass}
          placeholder="Produktnamn"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex gap-2" role="group" aria-label="Status">
        {STATUS_OPTS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={status === o.value}
            onClick={() => setStatus(o.value)}
            className={`flex-1 rounded-2xl py-2.5 text-sm font-display font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 ${
              status === o.value ? o.active : o.idle
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <Select
        id={`edit-cat-${product.id}`}
        label="Kategori (frivillig)"
        value={category}
        onChange={setCategory}
        options={CATEGORY_OPTIONS}
      />

      <div>
        <label htmlFor={`edit-brand-${product.id}`} className="sr-only">Märke eller var den finns</label>
        <input
          id={`edit-brand-${product.id}`}
          className={inputClass}
          placeholder="Märke / var den finns (frivillig)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor={`edit-note-${product.id}`} className="sr-only">Notis</label>
        <input
          id={`edit-note-${product.id}`}
          className={inputClass}
          placeholder="Notis (frivillig)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-2 text-rose-700 font-body text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-sky bg-sky text-ink font-display font-bold py-3 hover:bg-teal/10 transition-colors focus:outline-none focus:ring-4 focus:ring-teal/30"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-2xl bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold py-3 focus:outline-none focus:ring-4 focus:ring-teal/40 disabled:opacity-50"
        >
          {saving ? "Sparar…" : "Spara"}
        </button>
      </div>
    </form>
  );
}
