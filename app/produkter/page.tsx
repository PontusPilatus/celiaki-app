"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductList } from "@/components/ProductList";
import { getSupabase } from "@/lib/supabase";
import { listProducts, deleteProduct, type SavedProduct } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setProducts(await listProducts(getSupabase()));
    } catch {
      setError("Kunde inte hämta produkter. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleDelete(id: string) {
    try {
      await deleteProduct(getSupabase(), id);
    } catch {
      alert("Kunde inte ta bort produkten.");
    } finally {
      await refresh();
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/" className="text-blue-600 underline">← Tillbaka</Link>
      <h1 className="my-4 text-2xl font-bold">Sparade produkter</h1>
      {loading ? <p>Laddar…</p> : error ? (
        <div>
          <p className="text-red-600">{error}</p>
          <button
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
            onClick={refresh}
          >
            Försök igen
          </button>
        </div>
      ) : (
        <ProductList
          products={products}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}
