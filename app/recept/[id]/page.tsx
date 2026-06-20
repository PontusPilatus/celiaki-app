"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import { ConfirmModal } from "@/components/ConfirmModal";
import { getSupabase } from "@/lib/supabase";
import { getRecipe, updateRecipe, deleteRecipe, type Recipe, type NewRecipe } from "@/lib/recipes";

export default function RecipeDetailPage() {
  const router = useRouter();
  const id = String(useParams().id);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await getRecipe(getSupabase(), id);
      if (!r) setNotFound(true);
      setRecipe(r);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function save(patch: NewRecipe) {
    await updateRecipe(getSupabase(), id, patch);
    setEditing(false);
    await load();
  }

  async function remove() {
    try {
      await deleteRecipe(getSupabase(), id);
      router.push("/recept");
    } catch {
      setConfirmDelete(false);
      alert("Kunde inte ta bort receptet.");
    }
  }

  return (
    <main className="w-full mx-auto max-w-md px-4 py-8">
      <div className="rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        <div className="bg-teal px-6 pt-7 pb-7 text-white">
          <Link href="/recept" className="inline-flex items-center gap-1 font-body text-white/80 hover:text-white transition-colors text-sm mb-3" aria-label="Tillbaka till recept">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
            Tillbaka
          </Link>
          <h1 className="font-display font-extrabold text-3xl leading-tight break-words">
            {loading ? "Laddar…" : recipe ? recipe.title : "Receptet hittades inte"}
          </h1>
          {recipe && (recipe.servings || recipe.cook_time) && (
            <p className="text-white/85 mt-1 font-body">{[recipe.servings, recipe.cook_time].filter(Boolean).join(" · ")}</p>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <p className="font-body text-ink/60 py-4">Laddar…</p>
          ) : notFound || !recipe ? (
            <Link href="/recept" className="block text-center font-display font-bold text-teal py-4">← Tillbaka till recept</Link>
          ) : editing ? (
            <RecipeForm
              initial={{
                title: recipe.title,
                servings: recipe.servings ?? "",
                cook_time: recipe.cook_time ?? "",
                ingredients: recipe.ingredients,
                steps: recipe.steps,
                source_url: recipe.source_url ?? "",
                note: recipe.note ?? "",
              }}
              onSave={save}
              onCancel={() => setEditing(false)}
              submitLabel="Spara ändringar"
            />
          ) : (
            <div className="space-y-6 font-body text-ink/85">
              {recipe.note && (
                <p className="rounded-2xl bg-sky px-4 py-3 text-ink/75">{recipe.note}</p>
              )}

              {recipe.ingredients.length > 0 && (
                <section>
                  <h2 className="font-display font-extrabold text-xl text-ink mb-2">Ingredienser</h2>
                  <ul className="space-y-1.5">
                    {recipe.ingredients.map((i, idx) => (
                      <li key={idx} className="flex gap-2.5">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                        <span className="break-words">{i}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {recipe.steps.length > 0 && (
                <section>
                  <h2 className="font-display font-extrabold text-xl text-ink mb-2">Gör så här</h2>
                  <ol className="space-y-3">
                    {recipe.steps.map((s, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-7 h-7 grid place-items-center rounded-full bg-teal text-white font-display font-bold text-sm shrink-0">{idx + 1}</span>
                        <span className="break-words pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {recipe.source_url && (
                <a href={recipe.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-display font-bold text-teal underline break-all">
                  Originalrecept
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                </a>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditing(true)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-teal text-teal hover:bg-teal/10 transition-colors font-display font-bold py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  Redigera
                </button>
                <button type="button" onClick={() => setConfirmDelete(true)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors font-display font-bold py-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  Ta bort
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Ta bort recept?"
        message={recipe ? `”${recipe.title}” tas bort. Det går inte att ångra.` : undefined}
        confirmLabel="Ta bort"
        cancelLabel="Avbryt"
        tone="danger"
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </main>
  );
}
