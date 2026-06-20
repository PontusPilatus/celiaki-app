import type { AnalysisResult } from "@/lib/types";

const STYLES = {
  safe: { bg: "bg-green-100", text: "text-green-900", emoji: "🟢", title: "Detta ser ut att vara okej för Elis" },
  warning: { bg: "bg-yellow-100", text: "text-yellow-900", emoji: "🟡", title: "Kontrollera en extra gång" },
  unsafe: { bg: "bg-red-100", text: "text-red-900", emoji: "🔴", title: "Ajaj — detta innehåller gluten" },
} as const;

export function ResultCard({ result }: { result: AnalysisResult }) {
  const s = STYLES[result.status];
  return (
    <div className={`rounded-2xl p-6 ${s.bg} ${s.text}`}>
      <div className="text-3xl font-bold">{s.emoji} {s.title}</div>
      {result.productName && <p className="mt-2 font-medium">{result.productName}</p>}
      {result.found.length > 0 && (
        <p className="mt-3">Hittade: {result.found.join(", ")}</p>
      )}
      <p className="mt-3">{result.reasoning}</p>
    </div>
  );
}
