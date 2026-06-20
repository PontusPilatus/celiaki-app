// 🔴 Röd flagga — innehåller gluten.
export const GLUTEN_SOURCES = [
  "vete", "vetemjöl", "fullkornsvetemjöl", "durum", "grahamsmjöl",
  "vetekli", "vetefiber", "veteprotein", "råg", "rågmjöl", "rågsikt",
  "korn", "kornmalt", "maltmjöl", "maltextrakt", "bulgur", "couscous",
  "mannagryn", "brödsmulor", "ströbröd", "panko", "dinkel", "spelt",
  "kamut", "tritikale", "seitan",
] as const;

// 🟢 Grön flagga — normalt glutenfritt.
export const SAFE_INGREDIENTS = [
  "ris", "rismjöl", "majs", "majsstärkelse", "potatis", "potatismjöl",
  "potatisstärkelse", "bovete", "quinoa", "hirs", "teff", "tapioka",
  "mandelmjöl", "kikärtsmjöl", "glutenfri havre", "kikärtor", "linser",
  "sojabönor", "baljväxter",
] as const;

// 🟡 Gul flagga — kräver kontroll (kan innehålla gluten beroende på produkt).
export const WARNING_INGREDIENTS = [
  "havre", "kan innehålla spår av gluten", "malt", "modifierad stärkelse",
  "maltodextrin", "dextrin", "kryddblandning", "arom", "sojasås",
  "vetestärkelse", "glukossirap från vete", "vegetabiliskt protein",
  "panering", "panerad", "redning", "buljong", "jästextrakt",
] as const;

export function containsGlutenSource(text: string): string[] {
  const lower = text.toLowerCase();
  return GLUTEN_SOURCES.filter((src) => lower.includes(src));
}
