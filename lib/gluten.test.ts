import { describe, it, expect } from "vitest";
import { containsGlutenSource, GLUTEN_SOURCES } from "./gluten";

describe("containsGlutenSource", () => {
  it("hittar vetemjöl i en ingredienslista", () => {
    const found = containsGlutenSource("Socker, VETEMJÖL, salt");
    expect(found).toContain("vetemjöl");
  });

  it("returnerar tom lista när inga glutenkällor finns", () => {
    expect(containsGlutenSource("Ris, majs, salt")).toEqual([]);
  });

  it("exponerar en icke-tom lista av glutenkällor", () => {
    expect(GLUTEN_SOURCES.length).toBeGreaterThan(5);
  });
});
