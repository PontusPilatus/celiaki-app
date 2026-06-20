"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecipeForm, type RecipeFormInitial } from "@/components/RecipeForm";
import { getSupabase } from "@/lib/supabase";
import { createRecipe, type NewRecipe } from "@/lib/recipes";

export default function NewRecipePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [initial, setInitial] = useState<RecipeFormInitial | null>(null);

  async function extract() {
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/extract-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-code": localStorage.getItem("eliskoll_code") ?? "",
        },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Något gick fel.");
      setInitial({
        title: data.title,
        servings: data.servings,
        cook_time: data.cook_time,
        ingredients: data.ingredients,
        steps: data.steps,
        source_url: url,
        note: data.glutenTips ? `Glutenfritt-tips: ${data.glutenTips}` : "",
      });
    } catch (e) {
      setExtractError(e instanceof Error ? e.message : "Något gick fel.");
    } finally {
      setExtracting(false);
    }
  }

  async function save(recipe: NewRecipe) {
    const created = await createRecipe(getSupabase(), recipe);
    router.push(`/recept/${created.id}`);
  }

  return (
    <main className="w-full mx-auto max-w-md px-4 py-8">
      <div className="rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        <div className="bg-teal px-6 pt-7 pb-7 text-white">
          <Link href="/recept" className="inline-flex items-center gap-1 font-body text-white/80 hover:text-white transition-colors text-sm mb-3" aria-label="Tillbaka till recept">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Tillbaka
          </Link>
          <h1 className="font-display font-extrabold text-3xl leading-tight">Nytt recept</h1>
        </div>

        <div className="p-5">
          {!initial ? (
            <div className="space-y-5">
              <div>
                <label htmlFor="recipe-url" className="block font-display font-bold text-ink mb-1.5">Klistra in en länk</label>
                <p className="text-sm text-ink/55 font-body mb-2">Vi läser receptet åt dig och fyller i det i app-stil. Du kan ändra innan du sparar.</p>
                <input
                  id="recipe-url"
                  className="w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors"
                  placeholder="https://…"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  inputMode="url"
                />
                {extractError && <p className="mt-2 rounded-2xl bg-rose-50 px-4 py-2 text-rose-700 font-body text-sm">{extractError}</p>}
                <button
                  type="button"
                  onClick={extract}
                  disabled={extracting || !url.trim()}
                  className="mt-3 w-full rounded-2xl bg-berry hover:bg-[#ef6a49] transition-colors text-white font-display font-extrabold py-3.5 focus:outline-none focus:ring-4 focus:ring-berry/30 disabled:opacity-50"
                >
                  {extracting ? "Läser receptet…" : "Hämta recept från länk"}
                </button>
              </div>

              <div className="flex items-center gap-3 text-ink/35 text-sm font-body">
                <span className="flex-1 h-px bg-sky" /> eller <span className="flex-1 h-px bg-sky" />
              </div>

              <button
                type="button"
                onClick={() => setInitial({})}
                className="w-full rounded-2xl border-2 border-teal text-teal hover:bg-teal/10 transition-colors font-display font-bold py-3 focus:outline-none focus:ring-4 focus:ring-teal/30"
              >
                Skriv receptet själv
              </button>
            </div>
          ) : (
            <RecipeForm initial={initial} onSave={save} onCancel={() => setInitial(null)} />
          )}
        </div>
      </div>
    </main>
  );
}
