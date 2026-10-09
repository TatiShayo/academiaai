import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { headers } from "next/headers";
import { setPro, setFree, unlockSingle } from "@/lib/usage";
import { recordStripeEvent } from "@/lib/stripe-events";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature") ?? "";

  // Fail closed: acking with 200 when Stripe is not configured makes Stripe
  // mark the event as delivered and never retry it — a customer pays, the
  // event is silently dropped, and the plan is never provisioned. Return 503
  // so Stripe retries once billing is configured.
  if (!isStripeConfigured()) {
    console.error("Stripe webhook received but STRIPE_SECRET_KEY is not configured");
    return NextResponse.json(
      { error: "Stripe is not configured; event will be retried" },
      { status: 503 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

    // Idempotency guard: record the event id before any side effect. A
    // duplicate (unique violation 23505) means a Stripe retry or a replay —
    // ack and stop before provisioning the plan twice.
    if (event.id) {
      try {
        const { duplicate } = await recordStripeEvent(event.id, event.type);
        if (duplicate) {
          return NextResponse.json({ received: true, duplicate: true });
        }
      } catch (ledgerError) {
        console.error("Webhook idempotency check failed:", ledgerError);
        return NextResponse.json(
          { error: "Webhook handler failed. Please check server logs." },
          { status: 500 }
        );
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const type = session.metadata?.type;

      if (!userId) {
        console.error("Webhook: no user_id in session metadata", session.id);
        return NextResponse.json({ received: false }, { status: 400 });
      }

      if (type === "pro") {
        await setPro(userId);
        console.log(`Pro subscription activated for user ${userId}`);
      } else if (type === "pay_per_doc") {
        await unlockSingle(userId);
        console.log(`Single doc unlocked for user ${userId}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;
      if (userId) {
        await setFree(userId);
        console.log(`Subscription cancelled for user ${userId}, reset to free`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
