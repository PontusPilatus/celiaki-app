"use client";

import { useState } from "react";
import Link from "next/link";
import { CameraButton } from "@/components/CameraButton";
import { ResultCard } from "@/components/ResultCard";
import { Disclaimer } from "@/components/Disclaimer";
import { SaveProductForm } from "@/components/SaveProductForm";
import { getSupabase } from "@/lib/supabase";
import { createProduct, type NewProduct } from "@/lib/products";
import { resizeImage } from "@/lib/resizeImage";
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
      const image = await resizeImage(file);
      const form = new FormData();
      form.append("image", image, "foto.jpg");
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) {
        let msg = "Något gick fel. Försök igen.";
        try {
          const body = await res.json();
          if (body?.error) msg = body.error;
        } catch {
          /* behåll standardmeddelandet */
        }
        throw new Error(msg);
      }
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Något gick fel. Försök igen.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  // Resultatskärm — ersätter startskärmen när ett svar finns.
  if (result) {
    return (
      <main className="w-full mx-auto max-w-md px-4 py-6">
        <button
          type="button"
          onClick={reset}
          aria-label="Tillbaka till start"
          className="flex items-center gap-1.5 font-display font-bold text-teal hover:text-tealdk transition-colors py-2 -ml-1 pr-3 focus:outline-none focus:ring-4 focus:ring-teal/30 rounded-xl"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Tillbaka
        </button>

        <div className="mt-3">
          <ResultCard result={result}>
            <SaveProductForm
              result={result}
              onSave={async (p: NewProduct) => { await createProduct(getSupabase(), p); }}
            />
          </ResultCard>
          <Disclaimer />
        </div>

        <button
          type="button"
          onClick={reset}
          className="mt-5 w-full rounded-[1.4rem] border-2 border-teal text-teal hover:bg-sky transition-colors font-display font-extrabold py-3.5 focus:outline-none focus:ring-4 focus:ring-teal/30"
        >
          Ta ny bild
        </button>
      </main>
    );
  }

  // Startskärm — kamera + förklaring.
  return (
    <main className="w-full mx-auto max-w-md px-4 py-8 space-y-6">
      {/* Hero card */}
      <div className="rounded-[2.5rem] bg-white shadow-xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        {/* Teal header */}
        <div className="bg-teal px-6 pt-7 pb-9 text-white relative">
          <div className="font-display font-semibold text-sm flex items-center gap-2">
            <span className="grid place-items-center w-7 h-7 rounded-full bg-white/25" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m2 22 10-10"/>
                <path d="m16 8-1.17 1.17"/>
                <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>
                <path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/>
                <path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/>
                <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/>
                <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/>
                <path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/>
                <line x1="2" x2="22" y1="2" y2="22"/>
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
        <div className="px-6 pt-6 pb-7">
          <CameraButton onFile={analyze} disabled={loading} />

          {loading && (
            <p className="mt-4 text-center font-body text-ink/70">Analyserar bilden…</p>
          )}

          {error && (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-700 font-body text-sm">{error}</p>
          )}

          {/* Verdict legend chips */}
          {!loading && !error && (
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

          <div className="mt-5 flex flex-col items-center gap-2.5">
            <Link
              href="/produkter"
              className="block text-center font-display font-bold text-teal hover:text-tealdk transition-colors"
            >
              Sparade produkter →
            </Link>
            <Link
              href="/guide"
              className="block text-center font-display font-bold text-teal hover:text-tealdk transition-colors"
            >
              Guide för familj &amp; vänner →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
