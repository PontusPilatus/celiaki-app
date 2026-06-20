import Anthropic from "@anthropic-ai/sdk";
import { MODEL } from "./analyze";

export type ExtractedRecipe = {
  title: string;
  servings: string;
  cook_time: string;
  ingredients: string[];
  steps: string[];
  glutenTips: string;
};

// Plockar ut läsbar text + ev. recept-JSON (schema.org) ur en HTML-sida.
export function cleanHtml(html: string): string {
  const ldjson = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join("\n");
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${ldjson}\n\n${text}`.slice(0, 30000);
}

export const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    servings: { type: "string" },
    cook_time: { type: "string" },
    ingredients: { type: "array", items: { type: "string" } },
    steps: { type: "array", items: { type: "string" } },
    glutenTips: { type: "string" },
  },
  required: ["title", "servings", "cook_time", "ingredients", "steps", "glutenTips"],
  additionalProperties: false,
};

export function buildRecipePrompt(): string {
  return [
    "Du får texten från en receptsida. Plocka ut receptet och svara ENDAST enligt JSON-schemat.",
    "Skriv allt på svenska (översätt vid behov). Skriv i egna, korta ord — kopiera inte sidans text ordagrant.",
    "- title: rättens namn.",
    "- servings: antal portioner om det framgår, annars \"\".",
    "- cook_time: tillagningstid om det framgår, annars \"\".",
    "- ingredients: en lista, en ingrediens per rad (med mängd om angiven).",
    "- steps: en lista med korta, tydliga tillagningssteg.",
    "- glutenTips: om receptet innehåller glutenhaltiga ingredienser (t.ex. vetemjöl, ströbröd, vanlig pasta), ge ett kort tips på hur det görs glutenfritt (t.ex. byt till glutenfritt mjöl). Annars \"\".",
    "Om texten inte innehåller något recept: sätt title till \"\" och lämna listorna tomma.",
  ].join("\n");
}

export function parseRecipe(raw: string): ExtractedRecipe {
  const empty: ExtractedRecipe = { title: "", servings: "", cook_time: "", ingredients: [], steps: [], glutenTips: "" };
  try {
    const o = JSON.parse(raw);
    return {
      title: typeof o.title === "string" ? o.title : "",
      servings: typeof o.servings === "string" ? o.servings : "",
      cook_time: typeof o.cook_time === "string" ? o.cook_time : "",
      ingredients: Array.isArray(o.ingredients) ? o.ingredients.map(String) : [],
      steps: Array.isArray(o.steps) ? o.steps.map(String) : [],
      glutenTips: typeof o.glutenTips === "string" ? o.glutenTips : "",
    };
  } catch {
    return empty;
  }
}

export async function extractRecipe(client: Anthropic, pageText: string): Promise<ExtractedRecipe> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: buildRecipePrompt(),
    output_config: {
      format: { type: "json_schema", schema: RECIPE_SCHEMA as { [key: string]: unknown } },
    },
    messages: [{ role: "user", content: pageText }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";
  return parseRecipe(raw);
}
