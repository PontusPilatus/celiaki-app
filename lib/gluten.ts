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
