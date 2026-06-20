import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, ProductStatus } from "./types";
import { GLUTEN_SOURCES, SAFE_INGREDIENTS, WARNING_INGREDIENTS } from "./gluten";

export const MODEL = "claude-sonnet-4-6";

export function buildPrompt(): string {
  return [
    "Du är en hjälpsam assistent som läser ingredienslistor på svenska livsmedel",
    "och avgör om en produkt är säker för en person med celiaki (glutenintolerans).",
    "",
    "Läs av ingredienslistan i bilden (OCR) och avgör status utifrån de ingredienser du kan tyda:",
    `- "unsafe" (rött) om någon av dessa glutenkällor finns: ${GLUTEN_SOURCES.join(", ")}.`,
    `- "warning" (gult) om något kräver kontroll: ${WARNING_INGREDIENTS.join(", ")}, eller "kan innehålla spår av gluten".`,
    `- "safe" (grönt) om inga gluteninnehållande ingredienser hittas. Normalt OK: ${SAFE_INGREDIENTS.join(", ")}.`,
    "",
    'Havre (havregryn, havremjöl m.m.) är "warning" om förpackningen INTE uttryckligen är märkt "glutenfri"/"glutenfree", eftersom vanlig havre ofta är korskontaminerad med gluten. Förklara det i reasoning — skyll INTE på bildkvaliteten när du faktiskt kan läsa ingredienserna.',
    "Basera alltid svaret på den text du KAN läsa. Sätt bara status warning med hänvisning till otydlig bild om du genuint inte kan tyda någon del av ingredienslistan; be då om en tydligare bild i reasoning.",
    "Håll reasoning kort, konkret och på svenska. Svara ENDAST enligt det angivna JSON-schemat.",
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
};

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
    output_config: {
      format: {
        type: "json_schema",
        schema: ANALYSIS_SCHEMA as { [key: string]: unknown },
      },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Kan Elis (celiaki) äta denna produkt? Läs innehållsförteckningen.",
          },
        ],
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  return parseAnalysis(raw);
}
