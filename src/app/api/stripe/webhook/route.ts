import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { headers } from "next/headers";
import { setPro, setFree, unlockSingle } from "@/lib/usage";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature") ?? "";

  if (!isStripeConfigured()) {
    return NextResponse.json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );

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
