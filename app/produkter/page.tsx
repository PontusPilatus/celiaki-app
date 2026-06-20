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
    <main className="w-full mx-auto max-w-md px-4 py-8">
      <div className="rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        {/* Teal header */}
        <div className="bg-teal px-6 pt-7 pb-7 text-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-body text-white/80 hover:text-white transition-colors text-sm mb-3"
            aria-label="Tillbaka till startsidan"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Tillbaka
          </Link>
          <h1 className="font-display font-extrabold text-3xl leading-tight">Sparade produkter</h1>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <p className="font-body text-ink/60 py-4">Laddar…</p>
          ) : error ? (
            <div className="space-y-3">
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 font-body text-sm">{error}</p>
              <button
                className="rounded-[1.4rem] bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold px-6 py-3 focus:outline-none focus:ring-4 focus:ring-teal/40"
                onClick={refresh}
              >
                Försök igen
              </button>
            </div>
          ) : (
            <ProductList products={products} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </main>
  );
}
