import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: "2026-05-27.dahlia",
});

export const STRIPE_PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export function isStripeConfigured() {
  return STRIPE_SECRET.length > 0 && !STRIPE_SECRET.includes("placeholder");
}
