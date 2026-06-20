# Kan Elis äta detta?

En webbapp som hjälper familjen snabbt avgöra om en matprodukt är säker för Elis, som har celiaki.

## Vad appen gör

1. Ta ett foto på produktens ingrediensförteckning med mobilen.
2. Skicka bilden till Claude vision (Anthropic) som analyserar texten och bedömer om produkten innehåller gluten.
3. Appen visar ett tydligt utfall: **grön** (säker), **gul** (osäker/kontrollera), eller **röd** (innehåller gluten).
4. En disclaimer visas alltid — appen ger inga medicinska garantier.
5. Spara produkten i en delad lista (Supabase) som hela familjen kan se, söka i och ta bort poster från.

Bilden analyseras enbart för att ge utfallet och lagras aldrig.

## Teknikstack

- [Next.js](https://nextjs.org/) (App Router) med TypeScript
- [Tailwind CSS](https://tailwindcss.com/) för styling
- [Supabase](https://supabase.com/) (PostgreSQL + anon-åtkomst via RLS) för den delade produktlistan
- [Anthropic Claude vision](https://docs.anthropic.com/) för bildanalys av ingrediensförteckningen

## Kom igång

### 1. Miljövariabler

Kopiera exempelfilen och fyll i dina nycklar:

```bash
cp .env.example .env.local
```

Öppna `.env.local` och sätt:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://<ditt-projekt>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Filen committas aldrig (`.gitignore` exkluderar den).

### 2. Skapa databasen i Supabase

Öppna **SQL Editor** i ditt Supabase-projekt och kör innehållet i `supabase/schema.sql`. Det skapar tabellen `saved_products` och öppna RLS-policies (anon kan läsa, lägga till, uppdatera och ta bort).

### 3. Installera och starta

```bash
npm install
npm run dev
```

Appen körs sedan på [http://localhost:3000](http://localhost:3000).

## Kommandon

| Kommando | Vad det gör |
|---|---|
| `npm install` | Installera beroenden |
| `npm run dev` | Starta dev-server (hot reload) |
| `npm test` | Kör enhetstesterna |
| `npm run build` | Bygg för produktion |

## Säkerhet och ansvarsbegränsning

Appen är avsiktligt öppen — det krävs inget konto för att använda den. Alla i familjen kan komma åt den gemensamma listan direkt.

**Appen ger inga medicinska garantier.** En disclaimer visas alltid i anslutning till varje analys. Kontakta alltid tillverkaren eller en dietist vid osäkerhet.

## Driftsättning

Appen passar [Vercel](https://vercel.com). Sätt miljövariablerna `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL` och `NEXT_PUBLIC_SUPABASE_ANON_KEY` i Vercels projektinställningar.
