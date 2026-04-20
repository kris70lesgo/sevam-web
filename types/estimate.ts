export interface PriceEstimate {
  base: number;
  distanceSurcharge: number;
  total: number;
  currency: "INR";
}

export interface PriceEstimateV2 extends PriceEstimate {
  surgeMultiplier: number;
  surgeLabel: string | null;
  workerRatingMultiplier: number;
  /** Human-readable breakdown string for logging / UI tooltips. */
  breakdown: string;
}