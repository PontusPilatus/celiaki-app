import type { SupabaseClient } from "@supabase/supabase-js";

export type Recipe = {
  id: string;
  title: string;
  servings: string | null;
  cook_time: string | null;
  ingredients: string[];
  steps: string[];
  source_url: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type NewRecipe = {
  title: string;
  servings?: string | null;
  cook_time?: string | null;
  ingredients: string[];
  steps: string[];
  source_url?: string | null;
  note?: string | null;
};

const TABLE = "recipes";

export async function listRecipes(client: SupabaseClient): Promise<Recipe[]> {
  const { data, error } = await client.from(TABLE).select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Recipe[];
}

export async function getRecipe(client: SupabaseClient, id: string): Promise<Recipe | null> {
  const { data, error } = await client.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Recipe) ?? null;
}

export async function createRecipe(client: SupabaseClient, input: NewRecipe): Promise<Recipe> {
  const { data, error } = await client.from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as Recipe;
}

export async function updateRecipe(client: SupabaseClient, id: string, patch: Partial<NewRecipe>): Promise<Recipe> {
  const { data, error } = await client
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Recipe;
}

export async function deleteRecipe(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
