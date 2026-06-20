"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { listRecipes, type Recipe } from "@/lib/recipes";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setRecipes(await listRecipes(getSupabase()));
    } catch {
      setError("Kunde inte hämta recept. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const visible = recipes.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <main className="w-full mx-auto max-w-md px-4 py-8">
      <div className="rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        <div className="bg-teal px-6 pt-7 pb-7 text-white">
          <Link href="/" className="inline-flex items-center gap-1 font-body text-white/80 hover:text-white transition-colors text-sm mb-3" aria-label="Tillbaka till startsidan">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Tillbaka
          </Link>
          <h1 className="font-display font-extrabold text-3xl leading-tight">Glutenfria recept</h1>
          <p className="text-white/85 mt-1 font-body">Rätter som Elis tycker om.</p>
        </div>

        <div className="p-5">
          <Link href="/recept/nytt" className="mb-4 w-full rounded-2xl bg-berry hover:bg-[#ef6a49] transition-colors text-white font-display font-extrabold py-3.5 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-berry/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            Lägg till recept
          </Link>

          {!loading && !error && recipes.length > 0 && (
            <div className="relative mb-4">
              <label htmlFor="recipe-search" className="sr-only">Sök recept</label>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
              <input id="recipe-search" className="w-full rounded-2xl border-2 border-sky bg-sky pl-11 pr-4 py-3 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:border-teal transition-colors" placeholder="Sök recept…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          )}

          {loading ? (
            <p className="font-body text-ink/60 py-4">Laddar…</p>
          ) : error ? (
            <div className="space-y-3">
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 font-body text-sm">{error}</p>
              <button className="rounded-[1.4rem] bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold px-6 py-3" onClick={refresh}>Försök igen</button>
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-ink/45 font-body text-center py-8">Inga recept ännu — lägg till ert första!</p>
          ) : (
            <ul className="space-y-2.5">
              {visible.map((r) => (
                <li key={r.id}>
                  <Link href={`/recept/${r.id}`} className="block rounded-2xl border-2 border-sky hover:border-teal transition-colors px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-ink truncate">{r.title}</div>
                        {(r.servings || r.cook_time || r.note) && (
                          <div className="text-xs text-ink/50 font-body truncate">
                            {[r.servings, r.cook_time, r.note].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink/30 shrink-0"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </Link>
                </li>
              ))}
              {visible.length === 0 && <li className="text-ink/40 font-body text-center py-6">Inga träffar.</li>}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
