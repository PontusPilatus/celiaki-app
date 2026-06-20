"use client";

import { useState } from "react";
import Link from "next/link";
import { CameraButton } from "@/components/CameraButton";
import { ResultCard } from "@/components/ResultCard";
import { Disclaimer } from "@/components/Disclaimer";
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
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold">Kan Elis äta detta?</h1>
      <CameraButton onFile={analyze} disabled={loading} />
      {loading && <p className="mt-4 text-center">Analyserar bilden…</p>}
      {error && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-800">{error}</p>
      )}
      {result && (
        <div className="mt-6">
          <ResultCard result={result} />
          <Disclaimer />
        </div>
      )}
      <Link href="/produkter" className="mt-8 block text-center text-blue-600 underline">
        Sparade produkter →
      </Link>
    </main>
  );
}
