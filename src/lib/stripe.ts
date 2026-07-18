import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";

// The Stripe SDK throws if constructed with an empty key, which would break the
// production build when Stripe isn't configured. Fall back to a clearly-fake
// placeholder; all call sites gate real usage behind isStripeConfigured().
export const stripe = new Stripe(STRIPE_SECRET || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});

export const STRIPE_PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export function isStripeConfigured() {
  return STRIPE_SECRET.length > 0 && !STRIPE_SECRET.includes("placeholder");
}
