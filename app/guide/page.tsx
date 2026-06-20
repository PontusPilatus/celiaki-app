import type { Metadata } from "next";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getIngredientGroups, type IngredientGroups } from "@/lib/ingredients";

export const metadata: Metadata = {
  title: "Guide — Kan Elis äta detta?",
  description: "Kort guide om celiaki och gluten för familj, vänner och förskola.",
};

// Hämta alltid färska ingrediens-flaggor från Supabase.
export const dynamic = "force-dynamic";

function Chips({ items, tone }: { items: readonly string[]; tone: "red" | "green" | "amber" }) {
  const cls =
    tone === "red"
      ? "bg-rose-100 text-rose-800"
      : tone === "green"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-amber-100 text-amber-800";
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className={`rounded-full px-3 py-1 text-sm font-bold ${cls}`}>
          {i}
        </span>
      ))}
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-2">{children}</section>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display font-extrabold text-xl text-ink">{children}</h2>;
}

export default async function GuidePage() {
  let groups: IngredientGroups = { unsafe: [], warning: [], safe: [] };
  try {
    groups = await getIngredientGroups(getSupabase());
  } catch {
    // Faller tillbaka till tomma listor — texten i avsnitten står ändå på egna ben.
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
          <h1 className="font-display font-extrabold text-3xl leading-tight">Guide för familj &amp; vänner</h1>
          <p className="text-white/85 mt-1 font-body">Det viktigaste om celiaki och gluten — kort och enkelt.</p>
        </div>

        {/* Content */}
        <div className="p-5 space-y-7 font-body text-ink/80 leading-relaxed">
          <Section>
            <Heading>Vad är celiaki?</Heading>
            <p>
              Celiaki är en livslång autoimmun sjukdom. Hos en person med celiaki reagerar
              immunförsvaret på <strong>gluten</strong> — ett protein som finns i vete, råg och
              korn — och skadar tunntarmen. Den enda behandlingen är att helt undvika gluten.
            </p>
            <p>
              Det är alltså inte en allergi eller en trend, och även små mängder kan ge besvär.
              Därför gäller det att vara noggrann — för Elis är glutenfritt ett måste.
            </p>
          </Section>

          <Section>
            <Heading>🔴 Innehåller gluten</Heading>
            <p>Gluten finns i vete, råg och korn — och i allt som görs av dem:</p>
            <Chips items={groups.unsafe} tone="red" />
          </Section>

          <Section>
            <Heading>🟢 Naturligt glutenfritt</Heading>
            <p>Dessa innehåller inte gluten i sig:</p>
            <Chips items={groups.safe} tone="green" />
            <p className="text-sm text-ink/55">
              Men kolla ändå alltid förpackningen — i färdiga produkter kan de blandas med
              glutenhaltiga ingredienser.
            </p>
          </Section>

          <Section>
            <Heading>🟡 Havre — en extra koll</Heading>
            <p>
              Havre innehåller inte gluten naturligt, men odlas och hanteras ofta tillsammans med
              vete och blir då <strong>korskontaminerad</strong>. Använd därför bara havre som är
              märkt <strong>&quot;glutenfri&quot;</strong>.
            </p>
          </Section>

          <Section>
            <Heading>Tips i köket</Heading>
            <ul className="space-y-2">
              {[
                "Egen smör/bredbart och egen burk med pålägg — brödsmulor från vanligt bröd räcker för att ställa till det.",
                "Egen brödrost, eller rosta i ugn / på folie.",
                "Ren skärbräda, kniv och arbetsyta — torka av eller använd separata.",
                "Koka glutenfri pasta i eget vatten, inte samma som vanlig pasta.",
                "Läs innehållsförteckningen varje gång — recept och förpackningar ändras.",
                "Osäker? Hör av er till oss, Christina & Pontus (Elis föräldrar) — eller fota innehållsförteckningen i appen.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-0.5 text-teal shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section>
            <Heading>Vad betyder &quot;glutenfri&quot;?</Heading>
            <p>
              En produkt får märkas <strong>&quot;glutenfri&quot;</strong> om den innehåller högst
              20 mg gluten per kg. Det är den nivå som anses säker även vid celiaki. Leta efter
              ordet &quot;glutenfri&quot; eller den överkorsade ax-symbolen på förpackningen.
            </p>
          </Section>

          <Section>
            <div className="rounded-2xl bg-sky px-4 py-3 text-sm text-ink/70 space-y-2">
              <p>
                Faktan bygger på Livsmedelsverket.{" "}
                <a
                  href="https://www.livsmedelsverket.se/matvanor-halsa--miljo/sjukdomar-allergier-och-halsa/allergi-och-overkanslighet/gluten-celiaki-spannmalsallergi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-teal underline"
                >
                  Läs mer hos Livsmedelsverket →
                </a>
              </p>
              <p>
                Det här är allmän information, inte medicinsk rådgivning. Vid frågor om Elis kost,
                prata med oss — Christina &amp; Pontus, Elis föräldrar — eller vården.
              </p>
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}
