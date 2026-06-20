import type { AnalysisResult } from "@/lib/types";

const STYLES = {
  safe: {
    headerBg: "bg-emerald-500",
    chipBg: "bg-emerald-100 text-emerald-700",
    title: "Ja, Elis får äta detta!",
    subtitle: "Inga glutenkällor hittades",
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
  },
  warning: {
    headerBg: "bg-amber-500",
    chipBg: "bg-amber-100 text-amber-700",
    title: "Kontrollera en extra gång",
    subtitle: "Osäkra ingredienser hittades",
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  unsafe: {
    headerBg: "bg-rose-500",
    chipBg: "bg-rose-100 text-rose-700",
    title: "Ajaj — detta innehåller gluten",
    subtitle: "Glutenkällor hittades i listan",
    icon: (
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
} as const;

export function ResultCard({ result, children }: { result: AnalysisResult; children?: React.ReactNode }) {
  const s = STYLES[result.status];
  return (
    <div className="rounded-[2.5rem] bg-white overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(14,155,142,0.2)" }}>
      {/* Colored header */}
      <div className={`${s.headerBg} px-6 py-8 text-white text-center`}>
        <div className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-white/25 mb-3">
          {s.icon}
        </div>
        <div className="font-display font-extrabold text-2xl">{s.title}</div>
        {result.productName && (
          <div className="text-white/85 text-sm mt-1 font-body">{result.productName}</div>
        )}
        {!result.productName && (
          <div className="text-white/85 text-sm mt-1 font-body">{s.subtitle}</div>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {result.found.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {result.found.map((item) => (
              <span key={item} className={`rounded-full px-3 py-1 text-sm font-display font-bold ${s.chipBg}`}>
                {item}
              </span>
            ))}
          </div>
        )}

        {result.reasoning && (
          <p className="font-body text-ink/70 text-sm leading-relaxed">{result.reasoning}</p>
        )}

        {children}
      </div>
    </div>
  );
}
