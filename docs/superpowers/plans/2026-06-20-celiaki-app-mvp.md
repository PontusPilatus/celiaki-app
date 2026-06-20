# celiaki-app MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bygg MVP av "Kan Elis äta detta?" — ta foto på en innehållsförteckning, låt Claude vision avgöra grön/gul/röd, och spara produkter i en delad lista i Supabase.

**Architecture:** Next.js (App Router) med en server-side API-route som anropar Claude vision och returnerar strukturerad utdata. En öppen Supabase-tabell (`saved_products`) lagrar den delade listan. Bilden lagras aldrig — den analyseras i minnet och slängs.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Supabase (`@supabase/supabase-js`), Anthropic SDK (`@anthropic-ai/sdk`), Vitest för tester.

## Global Constraints

- Svenskt gränssnitt genomgående.
- Mobilanpassat först (stort, tydligt, läsbart).
- Helt öppet: ingen auth. Supabase RLS tillåter anon att läsa/skapa/uppdatera/ta bort.
- `ANTHROPIC_API_KEY` används ENDAST i server-side kod (API-route). Får aldrig nå klienten.
- Bilden lagras inte — varken på disk, i Supabase eller i loggar.
- Claude-modell via konstant: `MODEL = "claude-sonnet-4-6"` (lätt att byta till `claude-opus-4-8`).
- Statusvärden överallt: `"safe" | "warning" | "unsafe"` (grön/gul/röd).
- Disclaimer måste alltid synas på resultatskärmen.
- Appen ger aldrig medicinska garantier.

---

### Task 1: Scaffolda Next.js-projektet

**Files:**
- Create: hela Next.js-grundstrukturen (`package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `postcss.config.mjs`).

**Interfaces:**
- Produces: ett körbart Next.js-skelett som `npm run dev` startar på http://localhost:3000.

- [ ] **Step 1: Skapa appen i repo-roten**

Kör i `private/celiaki-app` (filerna ska hamna i repo-roten, inte i en undermapp):

```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --no-turbopack --use-npm
```

Svara "Yes" om den frågar om att fortsätta i en icke-tom katalog (specen/docs finns redan).

- [ ] **Step 2: Verifiera att appen startar**

Run: `npm run dev` och öppna http://localhost:3000
Expected: Next.js-startsidan visas utan fel. Stoppa servern (Ctrl+C).

- [ ] **Step 3: Verifiera build**

Run: `npm run build`
Expected: Build lyckas utan typfel.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app (TS, Tailwind, App Router)"
```

---

### Task 2: Installera beroenden och testverktyg

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `vitest.config.ts`
- Create: `.env.example`
- Modify: `.gitignore` (säkerställ att `.env*` ignoreras utom `.env.example`)

**Interfaces:**
- Produces: `npm test` kör Vitest; `@anthropic-ai/sdk` och `@supabase/supabase-js` finns; env-mall dokumenterad.

- [ ] **Step 1: Installera körberoenden och testberoenden**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Lägg till test-scripts i package.json**

Lägg till i `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Skapa vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 4: Skapa .env.example**

```bash
# Anthropic (server-side only)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (anon-nyckeln är publik och OK i klienten)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 5: Verifiera att .env ignoreras**

Run: `git check-ignore .env.local`
Expected: `.env.local` skrivs ut (dvs den ignoreras). Om inte: lägg till `.env*` och `!.env.example` i `.gitignore`.

- [ ] **Step 6: Verifiera att testkommandot kör**

Run: `npm test`
Expected: Vitest kör och rapporterar "no test files" (inga tester än) utan konfigfel.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: add Anthropic + Supabase deps and Vitest setup"
```

---

### Task 3: Gluten-kunskapsbas och delade typer

**Files:**
- Create: `lib/types.ts`
- Create: `lib/gluten.ts`
- Test: `lib/gluten.test.ts`

**Interfaces:**
- Produces:
  - `type ProductStatus = "safe" | "warning" | "unsafe"`
  - `type AnalysisResult = { status: ProductStatus; found: string[]; productName?: string; reasoning: string }`
  - `GLUTEN_SOURCES: string[]`, `SAFE_INGREDIENTS: string[]`, `WARNING_INGREDIENTS: string[]`
  - `containsGlutenSource(text: string): string[]` — returnerar de glutenkällor som förekommer i texten (gemener-jämförelse).

- [ ] **Step 1: Skriv det fallerande testet**

`lib/gluten.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { containsGlutenSource, GLUTEN_SOURCES } from "./gluten";

describe("containsGlutenSource", () => {
  it("hittar vetemjöl i en ingredienslista", () => {
    const found = containsGlutenSource("Socker, VETEMJÖL, salt");
    expect(found).toContain("vetemjöl");
  });

  it("returnerar tom lista när inga glutenkällor finns", () => {
    expect(containsGlutenSource("Ris, majs, salt")).toEqual([]);
  });

  it("exponerar en icke-tom lista av glutenkällor", () => {
    expect(GLUTEN_SOURCES.length).toBeGreaterThan(5);
  });
});
```

- [ ] **Step 2: Kör testet och se att det fallerar**

Run: `npx vitest run lib/gluten.test.ts`
Expected: FAIL ("Cannot find module './gluten'").

- [ ] **Step 3: Skapa lib/types.ts**

```ts
export type ProductStatus = "safe" | "warning" | "unsafe";

export type AnalysisResult = {
  status: ProductStatus;
  found: string[];
  productName?: string;
  reasoning: string;
};
```

- [ ] **Step 4: Skapa lib/gluten.ts**

```ts
export const GLUTEN_SOURCES = [
  "vete", "vetemjöl", "råg", "korn", "bulgur", "couscous", "mannagryn",
  "kornmalt", "brödsmulor", "ströbröd", "durum", "dinkel", "spelt", "seitan",
] as const;

export const SAFE_INGREDIENTS = [
  "ris", "majs", "potatis", "bovete", "quinoa", "hirs",
  "glutenfri havre", "sojabönor", "baljväxter",
] as const;

export const WARNING_INGREDIENTS = [
  "havre", "kan innehålla spår av gluten", "malt",
] as const;

export function containsGlutenSource(text: string): string[] {
  const lower = text.toLowerCase();
  return GLUTEN_SOURCES.filter((src) => lower.includes(src));
}
```

- [ ] **Step 5: Kör testet och se att det passerar**

Run: `npx vitest run lib/gluten.test.ts`
Expected: PASS (3 tester).

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/gluten.ts lib/gluten.test.ts
git commit -m "feat: add gluten knowledge base and shared types"
```

---

### Task 4: Supabase-schema och dataåtkomst

**Files:**
- Create: `supabase/schema.sql`
- Create: `lib/supabase.ts`
- Create: `lib/products.ts`
- Test: `lib/products.test.ts`

**Interfaces:**
- Consumes: `ProductStatus` från `lib/types.ts`.
- Produces:
  - `type SavedProduct = { id: string; name: string; status: ProductStatus; category: string | null; note: string | null; brand: string | null; created_at: string; updated_at: string }`
  - `type NewProduct = { name: string; status: ProductStatus; category?: string | null; note?: string | null; brand?: string | null }`
  - `getSupabase()` — returnerar en Supabase-klient.
  - `listProducts(client): Promise<SavedProduct[]>`
  - `createProduct(client, input: NewProduct): Promise<SavedProduct>`
  - `updateProduct(client, id: string, patch: Partial<NewProduct>): Promise<SavedProduct>`
  - `deleteProduct(client, id: string): Promise<void>`

- [ ] **Step 1: Skapa SQL-schemat**

`supabase/schema.sql` (körs i Supabase SQL-editor):

```sql
create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null check (status in ('safe','warning','unsafe')),
  category text,
  note text,
  brand text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_products enable row level security;

-- Appen är öppen: tillåt anon att göra allt.
create policy "open_select" on public.saved_products for select using (true);
create policy "open_insert" on public.saved_products for insert with check (true);
create policy "open_update" on public.saved_products for update using (true) with check (true);
create policy "open_delete" on public.saved_products for delete using (true);
```

- [ ] **Step 2: Skapa Supabase-klienten**

`lib/supabase.ts`:

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase-miljövariabler saknas");
  }
  return createClient(url, key);
}
```

- [ ] **Step 3: Skriv det fallerande testet för dataåtkomst**

`lib/products.test.ts` (mockar Supabase-klienten — ingen riktig nätverkstrafik):

```ts
import { describe, it, expect, vi } from "vitest";
import { listProducts, createProduct } from "./products";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockClient(returns: unknown) {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve({ data: returns, error: null })),
    single: vi.fn(() => Promise.resolve({ data: returns, error: null })),
  };
  return { from: vi.fn(() => builder) } as unknown as SupabaseClient;
}

describe("products dataåtkomst", () => {
  it("listProducts returnerar rader sorterade på senast ändrad", async () => {
    const rows = [{ id: "1", name: "Pasta", status: "unsafe" }];
    const client = mockClient(rows);
    const result = await listProducts(client);
    expect(result).toEqual(rows);
    expect(client.from).toHaveBeenCalledWith("saved_products");
  });

  it("createProduct skickar in produkten och returnerar den skapade raden", async () => {
    const row = { id: "2", name: "Kanelbulle", status: "safe" };
    const client = mockClient(row);
    const result = await createProduct(client, { name: "Kanelbulle", status: "safe" });
    expect(result).toEqual(row);
  });
});
```

- [ ] **Step 4: Kör testet och se att det fallerar**

Run: `npx vitest run lib/products.test.ts`
Expected: FAIL ("Cannot find module './products'").

- [ ] **Step 5: Implementera dataåtkomsten**

`lib/products.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProductStatus } from "./types";

export type SavedProduct = {
  id: string;
  name: string;
  status: ProductStatus;
  category: string | null;
  note: string | null;
  brand: string | null;
  created_at: string;
  updated_at: string;
};

export type NewProduct = {
  name: string;
  status: ProductStatus;
  category?: string | null;
  note?: string | null;
  brand?: string | null;
};

const TABLE = "saved_products";

export async function listProducts(client: SupabaseClient): Promise<SavedProduct[]> {
  const { data, error } = await client.from(TABLE).select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SavedProduct[];
}

export async function createProduct(client: SupabaseClient, input: NewProduct): Promise<SavedProduct> {
  const { data, error } = await client.from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as SavedProduct;
}

export async function updateProduct(client: SupabaseClient, id: string, patch: Partial<NewProduct>): Promise<SavedProduct> {
  const { data, error } = await client
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SavedProduct;
}

export async function deleteProduct(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
```

Obs: testmocken täcker `listProducts` och `createProduct`. `updateProduct`/`deleteProduct` verifieras manuellt mot Supabase i Task 7.

- [ ] **Step 6: Kör testet och se att det passerar**

Run: `npx vitest run lib/products.test.ts`
Expected: PASS (2 tester).

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql lib/supabase.ts lib/products.ts lib/products.test.ts
git commit -m "feat: add Supabase schema and product data access"
```

---

### Task 5: API-route för bildanalys med Claude vision

**Files:**
- Create: `lib/analyze.ts`
- Create: `app/api/analyze/route.ts`
- Test: `lib/analyze.test.ts`

**Interfaces:**
- Consumes: `AnalysisResult`, `ProductStatus` från `lib/types.ts`; gluten-listorna från `lib/gluten.ts`.
- Produces:
  - `MODEL` (konstant string).
  - `buildPrompt(): string` — systeminstruktion med gluten-regler.
  - `ANALYSIS_SCHEMA` — JSON-schema för structured output.
  - `parseAnalysis(raw: string): AnalysisResult` — validerar och normaliserar Claudes svar.
  - `analyzeImage(client, base64: string, mediaType: string): Promise<AnalysisResult>`.
  - `POST` handler i route som tar emot `multipart/form-data` med fält `image`.

- [ ] **Step 1: Skriv det fallerande testet för parseAnalysis**

`lib/analyze.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseAnalysis } from "./analyze";

describe("parseAnalysis", () => {
  it("tolkar ett giltigt rött svar", () => {
    const raw = JSON.stringify({
      status: "unsafe",
      found: ["vetemjöl"],
      productName: "Kex",
      reasoning: "Innehåller vetemjöl.",
    });
    const result = parseAnalysis(raw);
    expect(result.status).toBe("unsafe");
    expect(result.found).toEqual(["vetemjöl"]);
  });

  it("faller tillbaka till warning vid ogiltig status", () => {
    const raw = JSON.stringify({ status: "banana", found: [], reasoning: "?" });
    const result = parseAnalysis(raw);
    expect(result.status).toBe("warning");
  });

  it("kastar inte vid trasig JSON utan ger warning", () => {
    const result = parseAnalysis("inte json");
    expect(result.status).toBe("warning");
    expect(result.reasoning).toMatch(/kunde inte/i);
  });
});
```

- [ ] **Step 2: Kör testet och se att det fallerar**

Run: `npx vitest run lib/analyze.test.ts`
Expected: FAIL ("Cannot find module './analyze'").

- [ ] **Step 3: Implementera lib/analyze.ts**

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, ProductStatus } from "./types";
import { GLUTEN_SOURCES, SAFE_INGREDIENTS, WARNING_INGREDIENTS } from "./gluten";

export const MODEL = "claude-sonnet-4-6";

export function buildPrompt(): string {
  return [
    "Du är en hjälpsam assistent som läser ingredienslistor på svenska livsmedel",
    "och avgör om en produkt är säker för en person med celiaki (glutenintolerans).",
    "",
    "Läs texten i bilden (OCR) och avgör status:",
    `- "unsafe" (rött) om någon av dessa glutenkällor finns: ${GLUTEN_SOURCES.join(", ")}.`,
    `- "warning" (gult) vid osäkerhet: ${WARNING_INGREDIENTS.join(", ")}, otydlig/oläslig text, eller "kan innehålla spår av gluten".`,
    `- "safe" (grönt) om inga gluteninnehållande ingredienser hittas. Normalt OK: ${SAFE_INGREDIENTS.join(", ")}.`,
    "",
    "Om bilden inte går att läsa: status warning och be om en tydligare bild i reasoning.",
    "Svara ENDAST enligt det angivna JSON-schemat. All text på svenska.",
  ].join("\n");
}

export const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["safe", "warning", "unsafe"] },
    found: { type: "array", items: { type: "string" } },
    productName: { type: "string" },
    reasoning: { type: "string" },
  },
  required: ["status", "found", "reasoning"],
  additionalProperties: false,
} as const;

export function parseAnalysis(raw: string): AnalysisResult {
  try {
    const obj = JSON.parse(raw);
    const valid: ProductStatus[] = ["safe", "warning", "unsafe"];
    const status: ProductStatus = valid.includes(obj.status) ? obj.status : "warning";
    return {
      status,
      found: Array.isArray(obj.found) ? obj.found.map(String) : [],
      productName: typeof obj.productName === "string" ? obj.productName : undefined,
      reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
    };
  } catch {
    return {
      status: "warning",
      found: [],
      reasoning: "Kunde inte tolka svaret. Ta gärna en tydligare bild och försök igen.",
    };
  }
}

export async function analyzeImage(
  client: Anthropic,
  base64: string,
  mediaType: string,
): Promise<AnalysisResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: buildPrompt(),
    output_config: { format: { type: "json_schema", schema: ANALYSIS_SCHEMA } },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType as "image/jpeg", data: base64 },
          },
          { type: "text", text: "Kan Elis (celiaki) äta denna produkt? Läs innehållsförteckningen." },
        ],
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  return parseAnalysis(raw);
}
```

- [ ] **Step 4: Kör testet och se att det passerar**

Run: `npx vitest run lib/analyze.test.ts`
Expected: PASS (3 tester).

- [ ] **Step 5: Implementera API-routen**

`app/api/analyze/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeImage } from "@/lib/analyze";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Ingen bild bifogad." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mediaType = file.type || "image/jpeg";

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await analyzeImage(client, base64, mediaType);
    return NextResponse.json(result);
  } catch (err) {
    console.error("analyze error:", err);
    return NextResponse.json(
      { error: "Något gick fel vid analysen. Försök igen." },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 6: Verifiera typcheck/build**

Run: `npm run build`
Expected: Build lyckas (inga typfel i route/analyze).

- [ ] **Step 7: Commit**

```bash
git add lib/analyze.ts lib/analyze.test.ts app/api/analyze/route.ts
git commit -m "feat: add Claude vision analysis API route"
```

---

### Task 6: Startskärm med kamera och resultat

**Files:**
- Modify: `app/page.tsx`
- Create: `components/CameraButton.tsx`
- Create: `components/ResultCard.tsx`
- Create: `components/Disclaimer.tsx`
- Modify: `app/globals.css` (vid behov för statusfärger)

**Interfaces:**
- Consumes: `AnalysisResult` från `lib/types.ts`; `POST /api/analyze`.
- Produces: en startsida som låter användaren ta/välja foto, anropar API:t och visar färgkodat resultat + disclaimer + "Spara produkt"-knapp (sparflödet kopplas i Task 7).

- [ ] **Step 1: Skapa Disclaimer-komponenten**

`components/Disclaimer.tsx`:

```tsx
export function Disclaimer() {
  return (
    <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
      Appen hjälper till att tolka ingredienslistor men kan inte garantera att en
      produkt är säker. Vid osäkerhet gäller produktens märkning och tillverkarens
      information.
    </p>
  );
}
```

- [ ] **Step 2: Skapa ResultCard-komponenten**

`components/ResultCard.tsx`:

```tsx
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
```

- [ ] **Step 3: Skapa CameraButton-komponenten**

`components/CameraButton.tsx`:

```tsx
"use client";

type Props = { onFile: (file: File) => void; disabled?: boolean };

export function CameraButton({ onFile, disabled }: Props) {
  return (
    <label className={`block w-full cursor-pointer rounded-2xl bg-blue-600 px-6 py-8 text-center text-xl font-semibold text-white ${disabled ? "opacity-50" : ""}`}>
      📷 Ta foto på innehållsförteckningen
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
```

- [ ] **Step 4: Bygg om startsidan**

`app/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Verifiera build**

Run: `npm run build`
Expected: Build lyckas. (Sidan `/produkter` skapas i Task 7; länken ger 404 tills dess — det är OK.)

- [ ] **Step 6: Manuell verifiering (kräver .env.local med nycklar)**

Run: `npm run dev`, öppna sidan, ta/välj ett foto på en innehållsförteckning.
Expected: Ett färgkodat resultat (🟢/🟡/🔴) visas med disclaimer. Vid fel visas felmeddelandet.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/
git commit -m "feat: add camera capture and result UI"
```

---

### Task 7: Spara produkt + delad lista (CRUD)

**Files:**
- Create: `app/produkter/page.tsx`
- Create: `components/SaveProductForm.tsx`
- Create: `components/ProductList.tsx`
- Modify: `components/ResultCard.tsx` (lägg till "Spara produkt"-knapp som öppnar formuläret)
- Modify: `app/page.tsx` (koppla sparflödet)

**Interfaces:**
- Consumes: `SavedProduct`, `NewProduct`, `listProducts`, `createProduct`, `updateProduct`, `deleteProduct` från `lib/products.ts`; `getSupabase()` från `lib/supabase.ts`; `AnalysisResult` från `lib/types.ts`.
- Produces: ett sparflöde från resultatet och en `/produkter`-sida med sökbar, filtrerbar, redigerbar lista.

- [ ] **Step 1: Skapa SaveProductForm**

`components/SaveProductForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import type { NewProduct } from "@/lib/products";

const CATEGORIES = [
  "", "Bröd", "Pasta", "Mjöl/Bakning", "Godis/Snacks", "Mejeri",
  "Flingor/Müsli", "Såser/Kryddor", "Färdigmat", "Dryck", "Övrigt",
];

export function SaveProductForm({ result, onSave }: { result: AnalysisResult; onSave: (p: NewProduct) => Promise<void> }) {
  const [name, setName] = useState(result.productName ?? "");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <p className="mt-4 text-green-700">Sparad! ✓</p>;

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({
          name: name.trim() || "Namnlös produkt",
          status: result.status,
          category: category || null,
          brand: brand.trim() || null,
          note: note.trim() || null,
        });
        setSaving(false);
        setDone(true);
      }}
    >
      <input className="w-full rounded border p-2" placeholder="Namn" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="w-full rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c || "Kategori (frivillig)"}</option>)}
      </select>
      <input className="w-full rounded border p-2" placeholder="Märke / var den finns (frivillig)" value={brand} onChange={(e) => setBrand(e.target.value)} />
      <input className="w-full rounded border p-2" placeholder="Notis (frivillig)" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="w-full rounded bg-blue-600 p-3 text-white" disabled={saving}>
        {saving ? "Sparar…" : "Spara produkt"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Koppla sparflödet i ResultCard + page.tsx**

I `components/ResultCard.tsx`: lägg till en valfri `children`-prop och rendera den under resultatet:

```tsx
export function ResultCard({ result, children }: { result: AnalysisResult; children?: React.ReactNode }) {
```

och precis före sista `</div>`:

```tsx
      {children}
```

I `app/page.tsx`: importera `SaveProductForm`, `getSupabase`, `createProduct`, och rendera formuläret som barn till `ResultCard`:

```tsx
import { SaveProductForm } from "@/components/SaveProductForm";
import { getSupabase } from "@/lib/supabase";
import { createProduct, type NewProduct } from "@/lib/products";
```

Ersätt `<ResultCard result={result} />` med:

```tsx
<ResultCard result={result}>
  <SaveProductForm
    result={result}
    onSave={async (p: NewProduct) => { await createProduct(getSupabase(), p); }}
  />
</ResultCard>
```

- [ ] **Step 3: Skapa ProductList-komponenten**

`components/ProductList.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { SavedProduct } from "@/lib/products";

const BADGE = {
  safe: "bg-green-100 text-green-900",
  warning: "bg-yellow-100 text-yellow-900",
  unsafe: "bg-red-100 text-red-900",
} as const;

const EMOJI = { safe: "🟢", warning: "🟡", unsafe: "🔴" } as const;

export function ProductList({ products, onDelete }: { products: SavedProduct[]; onDelete: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "safe" | "warning" | "unsafe">("all");

  const visible = products.filter((p) => {
    const matchesQ = p.name.toLowerCase().includes(q.toLowerCase());
    const matchesF = filter === "all" || p.status === filter;
    return matchesQ && matchesF;
  });

  return (
    <div>
      <input className="mb-3 w-full rounded border p-2" placeholder="Sök produkt…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mb-4 flex gap-2 text-sm">
        {(["all", "safe", "warning", "unsafe"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded px-3 py-1 ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
            {f === "all" ? "Alla" : EMOJI[f]}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {visible.map((p) => (
          <li key={p.id} className={`flex items-center justify-between rounded-lg p-3 ${BADGE[p.status]}`}>
            <div>
              <div className="font-medium">{EMOJI[p.status]} {p.name}</div>
              {(p.brand || p.category) && <div className="text-sm opacity-80">{[p.category, p.brand].filter(Boolean).join(" · ")}</div>}
              {p.note && <div className="text-sm opacity-80">{p.note}</div>}
            </div>
            <button
              className="text-sm underline"
              onClick={() => { if (confirm(`Ta bort ${p.name}?`)) onDelete(p.id); }}
            >
              Ta bort
            </button>
          </li>
        ))}
        {visible.length === 0 && <li className="text-gray-500">Inga produkter ännu.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Skapa /produkter-sidan**

`app/produkter/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Verifiera build**

Run: `npm run build`
Expected: Build lyckas utan typfel.

- [ ] **Step 6: Manuell verifiering (kräver Supabase-schema kört + .env.local)**

1. Kör `supabase/schema.sql` i Supabase SQL-editor.
2. `npm run dev`. Analysera ett foto → "Spara produkt" → fyll i namn → spara.
3. Gå till "Sparade produkter": produkten syns, sök och filter fungerar, "Ta bort" tar bort efter bekräftelse.
Expected: Hela flödet fungerar; listan delas (samma data syns i en annan webbläsare/enhet).

- [ ] **Step 7: Commit**

```bash
git add app/produkter/page.tsx components/ app/page.tsx
git commit -m "feat: save products and shared product list with CRUD"
```

---

### Task 8: Putsa, README och slutverifiering

**Files:**
- Create: `README.md`
- Modify: `app/layout.tsx` (titel/metadata, svensk lang)

**Interfaces:**
- Produces: dokumentation för uppsättning + en sista verifiering av hela MVP.

- [ ] **Step 1: Sätt språk och titel i layout**

I `app/layout.tsx`: sätt `<html lang="sv">` och `metadata.title = "Kan Elis äta detta?"`.

- [ ] **Step 2: Skriv README**

`README.md` ska beskriva: vad appen gör, hur man sätter upp `.env.local` (Anthropic + Supabase), hur man kör `supabase/schema.sql`, samt `npm run dev` / `npm test` / `npm run build`.

- [ ] **Step 3: Kör hela testsviten**

Run: `npm test`
Expected: Alla tester passerar (gluten, products, analyze).

- [ ] **Step 4: Kör build**

Run: `npm run build`
Expected: Build lyckas utan fel.

- [ ] **Step 5: Manuell slutverifiering**

Gå igenom hela flödet på mobilstorlek: foto → grön/gul/röd + disclaimer → spara → lista (sök/filter/ta bort). Testa med tre förpackningar (vete, glutenfri, havre).

- [ ] **Step 6: Commit**

```bash
git add README.md app/layout.tsx
git commit -m "docs: add README and finalize MVP polish"
```

---

## Anteckningar om verifiering

- **Krav före körning:** ett Supabase-projekt (URL + anon-nyckel) med `supabase/schema.sql` kört, samt en Anthropic API-nyckel. Allt i `.env.local` (committas aldrig).
- **Driftsättning (senare):** appen passar Vercel; sätt `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` som env-variabler där.
