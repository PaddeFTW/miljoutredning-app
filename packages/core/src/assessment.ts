/** Original bedömningsmodell: mängd 1–3 × miljöpåverkan 1–6. */

export type QuantityScore = 1 | 2 | 3;
export type ImpactScore = 1 | 2 | 3 | 4 | 5 | 6;
export type AspectClass = "mindre" | "mattlig" | "betydande";

export function calculateResult(quantity: number, impact: number): number {
  if (!Number.isFinite(quantity) || !Number.isFinite(impact)) {
    return 0;
  }
  return quantity * impact;
}

export function classifyAspect(result: number): AspectClass | null {
  if (!Number.isFinite(result) || result <= 0) {
    return null;
  }
  if (result <= 6) return "mindre";
  if (result <= 12) return "mattlig";
  if (result <= 18) return "betydande";
  return null;
}

export function aspectClassLabel(classification: AspectClass | null): string {
  switch (classification) {
    case "mindre":
      return "Mindre";
    case "mattlig":
      return "Måttlig";
    case "betydande":
      return "Betydande";
    default:
      return "Ej bedömd";
  }
}

export function isSignificant(result: number): boolean {
  return classifyAspect(result) === "betydande";
}

export function isValidQuantity(value: number): value is QuantityScore {
  return Number.isInteger(value) && value >= 1 && value <= 3;
}

export function isValidImpact(value: number): value is ImpactScore {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}
