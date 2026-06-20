import { describe, it, expect } from "vitest";
import { containsGlutenSource, groupIngredients } from "./ingredients";

describe("containsGlutenSource", () => {
  it("hittar en glutenkälla i en ingredienslista (oberoende av versaler)", () => {
    const found = containsGlutenSource("Socker, VETEMJÖL, salt", ["vetemjöl", "råg"]);
    expect(found).toContain("vetemjöl");
  });

  it("returnerar tom lista när inga källor förekommer", () => {
    expect(containsGlutenSource("Ris, majs, salt", ["vetemjöl", "råg"])).toEqual([]);
  });
});

describe("groupIngredients", () => {
  it("grupperar rader på flagga", () => {
    const groups = groupIngredients([
      { term: "vete", flag: "unsafe" },
      { term: "havre", flag: "warning" },
      { term: "ris", flag: "safe" },
      { term: "korn", flag: "unsafe" },
    ]);
    expect(groups.unsafe).toEqual(["vete", "korn"]);
    expect(groups.warning).toEqual(["havre"]);
    expect(groups.safe).toEqual(["ris"]);
  });
});
