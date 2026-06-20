import type { SupabaseClient } from "@supabase/supabase-js";

export type GlutenFlag = "safe" | "warning" | "unsafe";
export type Ingredient = { term: string; flag: GlutenFlag };
export type IngredientGroups = { unsafe: string[]; warning: string[]; safe: string[] };

const TABLE = "gluten_ingredients";

// Hämtar ingrediens-flaggorna från Supabase (redigerbara där — inte hårdkodade).
export async function listIngredients(client: SupabaseClient): Promise<Ingredient[]> {
  const { data, error } = await client.from(TABLE).select("term, flag");
  if (error) throw error;
  return (data ?? []) as Ingredient[];
}

export function groupIngredients(rows: Ingredient[]): IngredientGroups {
  const groups: IngredientGroups = { unsafe: [], warning: [], safe: [] };
  for (const r of rows) {
    if (r.flag in groups) groups[r.flag].push(r.term);
  }
  return groups;
}

// Hämtar och grupperar i ett steg. Vid fel returneras tomma listor så att
// anroparen kan falla tillbaka snyggt (analysen fungerar ändå).
export async function getIngredientGroups(client: SupabaseClient): Promise<IngredientGroups> {
  return groupIngredients(await listIngredients(client));
}

// Ren hjälpfunktion: vilka av de angivna källorna förekommer i texten
// (gemener-jämförelse). Källorna skickas in — ingen hårdkodad lista.
export function containsGlutenSource(text: string, sources: readonly string[]): string[] {
  const lower = text.toLowerCase();
  return sources.filter((src) => lower.includes(src.toLowerCase()));
}
