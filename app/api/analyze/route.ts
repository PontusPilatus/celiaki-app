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
