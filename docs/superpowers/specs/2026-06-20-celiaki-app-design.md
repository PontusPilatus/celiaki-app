# Design: "Kan Elis äta detta?" (celiaki-app)

**Datum:** 2026-06-20
**Status:** Godkänd design — redo för implementationsplan

## Bakgrund

Vår son Elis har celiaki. Vi (föräldrar) och vår omgivning — släkt, vänner och
andra som lagar mat till honom — behöver ofta snabbt avgöra om en produkt är
säker att äta. Den viktigaste användaren står i en butik eller hemma i köket och
vill veta: **"Kan Elis äta detta?"**

Målet är ett praktiskt familjeverktyg, inte en kommersiell app. Ingen ska behöva
läsa och tolka långa ingredienslistor själv.

## Omfattning (MVP)

Första versionen fokuserar på ett huvudflöde — **ta foto på en
innehållsförteckning → få ett tydligt grönt/gult/rött svar** — plus möjligheten
att spara resultatet i en delad lista som hela familjen ser.

**Ingår i MVP:**

1. Foto-analys av ingredienslista (hjältefunktionen).
2. Spara produkter i en delad lista (säker/osäker-lista).
3. Lista med sparade produkter (sökbar, färgkodad).

**Senare versioner (ej i MVP):** streckkodsskanning, familjens recept,
favoritlista, historik, AI-chat ("vad ska jag tänka på när jag lagar
köttbullar?"), guide-sida för släkt/vänner/förskola.

## Användare och åtkomst

- **Helt öppet** — ingen inloggning. Vem som helst med länken kan se och redigera
  den delade listan. Innehållet är inte känsligt.
- **Mobilanpassat i första hand** — appen används från telefonen i butik/på besök.
  Stort och tydligt så att även t.ex. mor- och farföräldrar kan läsa det enkelt.
- **Svenskt gränssnitt.**

## Teknik

Samma stack som övriga privata projekt (vantesörgen, bokstavligt-talat):

- **Next.js** (App Router) + **React 19** + **TypeScript**.
- **Tailwind CSS 4** för styling.
- **Supabase** för delad lagring (en tabell). Öppna läs-/skrivregler (RLS som
  tillåter anon), ingen auth — minimalt krångel eftersom appen är öppen.
- **Claude (Anthropic)** för bildanalys. Börjar med **Claude Sonnet**
  (`claude-sonnet-4-6`) eftersom uppgiften (OCR + matchning mot gluten-lista) är
  avgränsad och Sonnet är billigare. Byt till Opus (`claude-opus-4-8`) om svaren
  blir osäkra. Modell-id sätts i en konstant så det är lätt att byta.

## Arkitektur

Systemet delas i tre väl avgränsade delar:

### 1. Klient (UI)

- **Startskärm:** en stor, tydlig knapp "📷 Ta foto på innehållsförteckningen"
  (HTML `<input type="file" accept="image/*" capture="environment">` öppnar
  kameran på mobil). Länk till "Sparade produkter".
- **Resultatskärm:** stort färgkodat svar (🟢 grön / 🟡 gul / 🔴 röd), vilka
  glutenkällor som hittades, kort förklaring, alltid synlig disclaimer, samt en
  knapp **"Spara produkt"**.
- **Sparade produkter:** den delade listan, sökbar och filtrerbar på status och
  kategori, färgkodad. Möjlighet att lägga till/redigera manuellt och ta bort
  (med bekräftelse, eftersom alla kan redigera).

### 2. Server (Next.js API-route)

- **`POST /api/analyze`** — tar emot bilden, anropar Claude vision med
  strukturerad utdata (structured outputs), returnerar resultatet. **API-nyckeln
  (`ANTHROPIC_API_KEY`) ligger bara här på servern** och exponeras aldrig i
  webbläsaren.
- Anropet använder Claudes vision (bild som content-block) + `output_config`
  med ett JSON-schema, så att svaret alltid har samma form.

**Svarsschema från analysen:**

```ts
type AnalysisResult = {
  status: "safe" | "warning" | "unsafe";   // grön / gul / röd
  found: string[];        // hittade glutenkällor, t.ex. ["vetemjöl", "kornmalt"]
  productName?: string;   // om Claude kan utläsa ett produktnamn ur bilden
  reasoning: string;      // kort förklaring på svenska
};
```

**Status-regler (i prompten till Claude):**

- 🔴 **röd (`unsafe`)** — innehåller en känd glutenkälla (se kunskapslistan).
- 🟡 **gul (`warning`)** — havre utan glutenfri-märkning, otydliga ingredienser,
  "kan innehålla spår av gluten", eller annat som kräver manuell kontroll.
- 🟢 **grön (`safe`)** — inga gluteninnehållande ingredienser hittade.

### 3. Lagring (Supabase)

En tabell `saved_products`:

| Fält         | Typ        | Beskrivning                                   |
|--------------|------------|-----------------------------------------------|
| `id`         | uuid (pk)  | Genereras automatiskt.                         |
| `name`       | text       | Produktens/matens namn.                        |
| `status`     | text       | `safe` / `warning` / `unsafe`.                 |
| `category`   | text, null | T.ex. Bröd, Pasta, Godis, Mejeri, Snacks.      |
| `note`       | text, null | Fritext, t.ex. "bara glutenfri variant".       |
| `brand`      | text, null | Märke/var den finns, t.ex. "Semper", "ICA".    |
| `image_url`  | text, null | Ev. sparad bild på ingredienslistan.           |
| `created_at` | timestamptz| Sätts automatiskt.                             |
| `updated_at` | timestamptz| För "senast ändrad".                           |

RLS-policy som tillåter anon-rollen att läsa, skapa, uppdatera och ta bort
(eftersom appen är öppen). Bildlagring (`image_url`) kan göras via Supabase
Storage; om det blir för mycket i MVP sparar vi bara textresultatet och lägger
bildlagring i en senare iteration.

## Kunskapsstöd (intern lista)

Skickas med i prompten så Claude blir konsekvent:

**Vanliga glutenkällor (→ röd):** vete, vetemjöl, råg, korn, bulgur, couscous,
mannagryn, kornmalt, brödsmulor, ströbröd, durum, dinkel, spelt, malt (från
korn), seitan.

**Normalt OK (→ grön om inget annat hittas):** ris, majs, potatis, bovete,
quinoa, hirs, glutenfri havre, sojabönor, baljväxter.

**Kräver kontroll (→ gul):** havre utan glutenfri-märkning, "kan innehålla spår
av gluten", otydliga eller ofullständiga ingredienser.

## Disclaimer

Visas alltid på resultatskärmen och kan inte missas:

> Appen hjälper till att tolka ingredienslistor men kan inte garantera att en
> produkt är säker. Vid osäkerhet gäller produktens märkning och tillverkarens
> information.

Appen ger aldrig medicinska garantier.

## Felhantering

- **Oläslig bild / ingen ingredienslista hittad:** Claude ombeds returnera
  `status: "warning"` med en `reasoning` som ber användaren ta en tydligare bild.
- **Claude-anrop misslyckas (nätverk/timeout/rate limit):** API-routen svarar med
  ett tydligt felmeddelande; UI visar "Något gick fel, försök igen" och en
  retry-knapp.
- **Supabase nere:** spara-knappen visar fel men analysresultatet finns kvar på
  skärmen så inget arbete går förlorat.

## Testning

- **Analyslogik:** enhetstester för API-routens svarshantering (rätt status/form
  ut givet ett mockat Claude-svar; felhantering vid timeout/ogiltig bild).
- **Lagring:** test för att skapa/läsa/uppdatera/ta bort produkter mot Supabase
  (kan köras mot en lokal/test-instans).
- **Manuell verifiering:** ta foton på riktiga förpackningar (en med vete, en
  glutenfri, en med havre) och kontrollera grön/gul/röd.

## Öppna frågor (avgörs i implementationsplanen)

- Ska bilden sparas (Supabase Storage) i MVP eller skjutas till nästa iteration?
- Kategori-listan: fast uppsättning eller fritext först?
