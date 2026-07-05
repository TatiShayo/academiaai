import { NextRequest, NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  const { type } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ url: "/dashboard" });
  }

  try {
    const baseUrl = APP_URL.replace(/\/$/, "");

    if (type === "subscription") {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: user.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AcademiaAI Pro",
                description: "Unlimited document processing, all tools, priority support.",
              },
              unit_amount: 1900,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        metadata: { type: "pro", user_id: user.id },
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
      });
      return NextResponse.json({ url: session.url });
    }

    if (type === "pay_per_doc") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: user.id,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Single Document Processing",
                description: "Unlock one document processing.",
              },
              unit_amount: 500,
            },
            quantity: 1,
          },
        ],
        metadata: { type: "pay_per_doc", user_id: user.id },
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/dashboard?checkout=cancelled`,
      });
      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
