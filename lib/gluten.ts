// 🔴 Röd flagga — innehåller gluten.
export const GLUTEN_SOURCES = [
  "vete", "vetemjöl", "fullkornsvetemjöl", "durum", "grahamsmjöl",
  "råg", "korn", "kornmalt", "maltmjöl", "bulgur", "couscous",
  "mannagryn", "brödsmulor", "ströbröd", "panko", "dinkel", "spelt", "seitan",
] as const;

// 🟢 Grön flagga — normalt glutenfritt.
export const SAFE_INGREDIENTS = [
  "ris", "majs", "potatis", "bovete", "quinoa", "hirs", "teff",
  "glutenfri havre", "kikärtor", "linser", "sojabönor", "baljväxter",
] as const;

// 🟡 Gul flagga — kräver kontroll (kan innehålla gluten beroende på produkt).
export const WARNING_INGREDIENTS = [
  "havre", "kan innehålla spår av gluten", "malt", "modifierad stärkelse",
  "maltodextrin", "kryddblandning", "arom", "sojasås", "vetestärkelse",
  "glukossirap från vete", "buljong", "jästextrakt",
] as const;

export function containsGlutenSource(text: string): string[] {
  const lower = text.toLowerCase();
  return GLUTEN_SOURCES.filter((src) => lower.includes(src));
}
