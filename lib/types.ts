export type ProductStatus = "safe" | "warning" | "unsafe";

export type AnalysisResult = {
  status: ProductStatus;
  found: string[];
  productName?: string;
  reasoning: string;
};
