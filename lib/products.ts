import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductStatus } from "./types";

export type SavedProduct = {
  id: string;
  name: string;
  status: ProductStatus;
  category: string | null;
  note: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string;
};

export type NewProduct = {
  name: string;
  status: ProductStatus;
  category?: string | null;
  note?: string | null;
  brand?: string | null;
};

const TABLE = "saved_products";

export async function listProducts(client: SupabaseClient): Promise<SavedProduct[]> {
  const { data, error } = await client.from(TABLE).select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedProduct[];
}

export async function createProduct(client: SupabaseClient, input: NewProduct): Promise<SavedProduct> {
  const { data, error } = await client.from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as SavedProduct;
}

export async function updateProduct(client: SupabaseClient, id: string, patch: Partial<NewProduct>): Promise<SavedProduct> {
  const { data, error } = await client
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SavedProduct;
}

export async function deleteProduct(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
