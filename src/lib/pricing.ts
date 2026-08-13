import type { Plan } from "./types";

export const GST_RATE = 0.18;

export interface Quote {
  monthly: number;
  annual: number;
  term: number;
  base: number; // base premium before GST for full term
  gst: number;
  total: number;
}

/**
 * Deterministic premium quote.
 * monthlyPremium is the plan's base. Coverage multiplier lets the
 * calculator scale cover up/down relative to the plan default.
 */
export function computeQuote(plan: Plan, term: number, coverageMultiplier = 1): Quote {
  const monthly = Math.round(plan.premium * coverageMultiplier);
  const annual = monthly * 12;
  const base = annual * term;
  const gst = Math.round(base * GST_RATE);
  const total = base + gst;
  return { monthly, annual, term, base, gst, total };
}
