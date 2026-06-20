"use client";

import { useEffect, useState } from "react";

const KEY = "eliskoll_code";

async function verify(code: string | null): Promise<"open" | "locked"> {
  try {
    const res = await fetch("/api/check-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!data.required || data.ok) return "open";
    return "locked";
  } catch {
    // Vid nätverksfel: släpp igenom UI:t — AI-endpointsen skyddas ändå server-side.
    return "open";
  }
}

export function CodeGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "open" | "locked">("checking");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    verify(saved).then(setState);
  }, []);

  if (state === "checking") {
    return (
      <main className="min-h-dvh grid place-items-center">
        <p className="font-display font-bold text-teal text-lg">Elis-koll</p>
      </main>
    );
  }

  if (state === "open") return <>{children}</>;

  return (
    <main className="min-h-dvh grid place-items-center px-4 py-8">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
        <div className="bg-teal px-6 pt-7 pb-7 text-white text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-2xl bg-white/20 mb-3">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl">Elis-koll</h1>
          <p className="text-white/85 mt-1 font-body text-sm">Ange koden för att fortsätta.</p>
        </div>
        <form
          className="p-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            const result = await verify(code.trim());
            if (result === "open") {
              localStorage.setItem(KEY, code.trim());
              setState("open");
            } else {
              setError("Fel kod. Försök igen.");
              setSubmitting(false);
            }
          }}
        >
          <label htmlFor="app-code" className="sr-only">Kod</label>
          <input
            id="app-code"
            className="w-full rounded-2xl border-2 border-sky bg-sky px-4 py-3 font-body text-ink text-center tracking-widest placeholder:text-ink/40 placeholder:tracking-normal focus:outline-none focus:border-teal transition-colors"
            placeholder="Kod"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-2 text-rose-700 font-body text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !code.trim()}
            className="w-full rounded-2xl bg-teal hover:bg-tealdk transition-colors text-white font-display font-extrabold py-3.5 focus:outline-none focus:ring-4 focus:ring-teal/40 disabled:opacity-50"
          >
            {submitting ? "Kollar…" : "Fortsätt"}
          </button>
        </form>
      </div>
    </main>
  );
}
