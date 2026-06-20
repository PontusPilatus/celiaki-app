"use client";

import { useState } from "react";
import Link from "next/link";
import { CameraButton } from "@/components/CameraButton";
import { ResultCard } from "@/components/ResultCard";
import { Disclaimer } from "@/components/Disclaimer";
import { SaveProductForm } from "@/components/SaveProductForm";
import { getSupabase } from "@/lib/supabase";
import { createProduct, type NewProduct } from "@/lib/products";
import type { AnalysisResult } from "@/lib/types";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) throw new Error("fel");
      setResult(await res.json());
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8 space-y-6">
      {/* Hero card */}
      <div className="rounded-[2.5rem] bg-white shadow-xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        {/* Teal header */}
        <div className="bg-teal px-6 pt-7 pb-9 text-white relative">
          <div className="font-display font-semibold text-sm flex items-center gap-2">
            <span className="grid place-items-center w-7 h-7 rounded-full bg-white/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
            Elis-koll
          </div>
          <h1 className="font-display font-extrabold text-[2.4rem] leading-[1.05] mt-3">
            Kan Elis äta detta?
          </h1>
          <p className="text-white/85 mt-1 font-body">Fota &amp; få svar på sekunden</p>
        </div>

        {/* Main content area */}
        <div className="px-6 -mt-5 pb-6">
          <CameraButton onFile={analyze} disabled={loading} />

          {loading && (
            <p className="mt-4 text-center font-body text-ink/70">Analyserar bilden…</p>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 font-body text-sm">{error}</p>
          )}

          {/* Verdict legend chips */}
          {!result && (
            <div className="mt-5 flex gap-2.5">
              <div className="flex-1 rounded-3xl bg-emerald-100 py-4 grid place-items-center">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-emerald-500 text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </span>
                <span className="font-display font-bold text-emerald-700 text-xs mt-1">Får äta</span>
              </div>
              <div className="flex-1 rounded-3xl bg-amber-100 py-4 grid place-items-center">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-amber-500 text-white font-display font-extrabold text-lg leading-none">!</span>
                <span className="font-display font-bold text-amber-700 text-xs mt-1">Kolla</span>
              </div>
              <div className="flex-1 rounded-3xl bg-rose-100 py-4 grid place-items-center">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-rose-500 text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </span>
                <span className="font-display font-bold text-rose-700 text-xs mt-1">Gluten</span>
              </div>
            </div>
          )}

          <Link
            href="/produkter"
            className="mt-5 block text-center font-display font-bold text-teal hover:text-tealdk transition-colors"
          >
            Sparade produkter →
          </Link>
        </div>
      </div>

      {result && (
        <div className="space-y-0">
          <ResultCard result={result}>
            <SaveProductForm
              result={result}
              onSave={async (p: NewProduct) => { await createProduct(getSupabase(), p); }}
            />
          </ResultCard>
          <Disclaimer />
        </div>
      )}
    </main>
  );
}
