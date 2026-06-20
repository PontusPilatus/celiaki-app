"use client";

import { useState } from "react";
import type { NewRecipe } from "@/lib/recipes";

const inputClass =
  "w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors";

export type RecipeFormInitial = {
  title?: string;
  servings?: string;
  cook_time?: string;
  ingredients?: string[];
  steps?: string[];
  source_url?: string;
  note?: string;
};

export function RecipeForm({
  initial,
  onSave,
  onCancel,
  submitLabel = "Spara recept",
}: {
  initial?: RecipeFormInitial;
  onSave: (recipe: NewRecipe) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [servings, setServings] = useState(initial?.servings ?? "");
  const [cookTime, setCookTime] = useState(initial?.cook_time ?? "");
  const [ingredients, setIngredients] = useState((initial?.ingredients ?? []).join("\n"));
  const [steps, setSteps] = useState((initial?.steps ?? []).join("\n"));
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
          await onSave({
            title: title.trim() || "Namnlöst recept",
            servings: servings.trim() || null,
            cook_time: cookTime.trim() || null,
            ingredients: toLines(ingredients),
            steps: toLines(steps),
            source_url: sourceUrl.trim() || null,
            note: note.trim() || null,
          });
        } catch {
          setError("Kunde inte spara receptet. Försök igen.");
          setSaving(false);
        }
      }}
    >
      <input className={`${inputClass} font-display font-bold`} placeholder="Rättens namn" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Rättens namn" />
      <div className="flex gap-3">
        <input className={inputClass} placeholder="Portioner (t.ex. 4)" value={servings} onChange={(e) => setServings(e.target.value)} aria-label="Portioner" />
        <input className={inputClass} placeholder="Tid (t.ex. 30 min)" value={cookTime} onChange={(e) => setCookTime(e.target.value)} aria-label="Tillagningstid" />
      </div>
      <div>
        <label htmlFor="rf-ingredients" className="block font-display font-bold text-ink mb-1.5">Ingredienser <span className="font-body font-normal text-ink/45 text-sm">(en per rad)</span></label>
        <textarea id="rf-ingredients" rows={6} className={inputClass} placeholder={"2 dl glutenfritt mjöl\n1 ägg\n…"} value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
      </div>
      <div>
        <label htmlFor="rf-steps" className="block font-display font-bold text-ink mb-1.5">Gör så här <span className="font-body font-normal text-ink/45 text-sm">(ett steg per rad)</span></label>
        <textarea id="rf-steps" rows={6} className={inputClass} placeholder={"Blanda de torra ingredienserna.\nVispa i ägget.\n…"} value={steps} onChange={(e) => setSteps(e.target.value)} />
      </div>
      <input className={inputClass} placeholder="Notis (frivillig) — t.ex. Elis favorit!" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Notis" />
      <input className={inputClass} placeholder="Källa / länk (frivillig)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} aria-label="Källa eller länk" inputMode="url" />

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-2 text-rose-700 font-body text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border-2 border-sky bg-sky text-ink font-display font-bold py-3 hover:bg-teal/10 transition-colors focus:outline-none focus:ring-4 focus:ring-teal/30">
            Avbryt
          </button>
        )}
        <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold py-3 focus:outline-none focus:ring-4 focus:ring-teal/40 disabled:opacity-50">
          {saving ? "Sparar…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
