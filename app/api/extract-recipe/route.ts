import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { cleanHtml, extractRecipe } from "@/lib/recipe-extract";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Servern saknar API-nyckel (ANTHROPIC_API_KEY är inte satt)." },
      { status: 500 },
    );
  }

  let url: string;
  try {
    const body = await req.json();
    url = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Klistra in en giltig länk (https://…)." }, { status: 400 });
  }

  // Hämta sidan.
  let pageText: string;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Kunde inte läsa länken (status ${res.status}). Fyll i receptet manuellt.` },
        { status: 502 },
      );
    }
    pageText = cleanHtml(await res.text());
  } catch {
    return NextResponse.json(
      { error: "Kunde inte hämta sidan. Den kan kräva inloggning — fyll i receptet manuellt." },
      { status: 502 },
    );
  }

  if (pageText.replace(/\s/g, "").length < 200) {
    return NextResponse.json(
      { error: "Hittade för lite text på sidan. Fyll i receptet manuellt." },
      { status: 422 },
    );
  }

  // Extrahera receptet med Claude.
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const recipe = await extractRecipe(client, pageText);
    if (!recipe.title && recipe.ingredients.length === 0) {
      return NextResponse.json(
        { error: "Hittade inget recept på sidan. Fyll i manuellt." },
        { status: 422 },
      );
    }
    return NextResponse.json(recipe);
  } catch (err) {
    console.error("extract-recipe error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Något gick fel vid tolkningen. Försök igen eller fyll i manuellt." },
      { status: 502 },
    );
  }
}
