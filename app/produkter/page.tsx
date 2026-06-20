"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductList } from "@/components/ProductList";
import { getSupabase } from "@/lib/supabase";
import { listProducts, deleteProduct, type SavedProduct } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setProducts(await listProducts(getSupabase()));
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <Link href="/" className="text-blue-600 underline">← Tillbaka</Link>
      <h1 className="my-4 text-2xl font-bold">Sparade produkter</h1>
      {loading ? <p>Laddar…</p> : (
        <ProductList
          products={products}
          onDelete={async (id) => { await deleteProduct(getSupabase(), id); refresh(); }}
        />
      )}
    </main>
  );
}
