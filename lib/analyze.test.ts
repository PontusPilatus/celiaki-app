import { describe, it, expect } from "vitest";
import { parseAnalysis } from "./analyze";

describe("parseAnalysis", () => {
  it("tolkar ett giltigt rött svar", () => {
    const raw = JSON.stringify({
      status: "unsafe",
      found: ["vetemjöl"],
      productName: "Kex",
      reasoning: "Innehåller vetemjöl.",
    });
    const result = parseAnalysis(raw);
    expect(result.status).toBe("unsafe");
    expect(result.found).toEqual(["vetemjöl"]);
  });

  it("faller tillbaka till warning vid ogiltig status", () => {
    const raw = JSON.stringify({ status: "banana", found: [], reasoning: "?" });
    const result = parseAnalysis(raw);
    expect(result.status).toBe("warning");
  });

  it("kastar inte vid trasig JSON utan ger warning", () => {
    const result = parseAnalysis("inte json");
    expect(result.status).toBe("warning");
    expect(result.reasoning).toMatch(/kunde inte/i);
  });
});
