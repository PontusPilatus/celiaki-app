import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { analyzeImage } from "@/lib/analyze";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("analyze error: ANTHROPIC_API_KEY saknas i miljön");
    return NextResponse.json(
      { error: "Servern saknar API-nyckel (ANTHROPIC_API_KEY är inte satt)." },
      { status: 500 },
    );
  }

  let base64: string;
  let mediaType: string;
  try {
    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Ingen bild bifogad." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    base64 = buffer.toString("base64");
    mediaType = file.type || "image/jpeg";
  } catch {
    return NextResponse.json(
      { error: "Bilden kunde inte tas emot. Försök igen." },
      { status: 400 },
    );
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await analyzeImage(client, base64, mediaType);
    return NextResponse.json(result);
  } catch (err) {
    // Logga fullt på servern (Vercel-loggar) — men aldrig bildens innehåll.
    console.error(
      "analyze error:",
      err instanceof Error ? `${err.name}: ${err.message}` : err,
    );

    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "API-nyckeln nekades. Kontrollera ANTHROPIC_API_KEY i Vercel." },
        { status: 502 },
      );
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
      return NextResponse.json(
        { error: "Åtkomst nekad — kontrollera att Anthropic-kontot är aktiverat." },
        { status: 502 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "För många förfrågningar just nu. Vänta en stund och försök igen." },
        { status: 502 },
      );
    }
    if (err instanceof Anthropic.BadRequestError) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("credit") || msg.includes("billing")) {
        return NextResponse.json(
          { error: "Anthropic-kontot saknar credits. Lägg till i Billing och försök igen." },
          { status: 502 },
        );
      }
      return NextResponse.json(
        { error: "Bilden kunde inte behandlas (kan vara för stor eller fel format)." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Något gick fel vid analysen. Försök igen." },
      { status: 500 },
    );
  }
}
