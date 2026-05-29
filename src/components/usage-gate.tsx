"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isStripeConfigured } from "@/lib/stripe";
import { Loader2 } from "lucide-react";

interface UsageState {
  docCount: number;
  month: string;
  plan: string;
  remaining: number;
  limit: number;
}

export function UsageGate({ children }: { children: React.ReactNode }) {
  const [usage, setUsage] = useState<UsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUsage(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (type: "subscription" | "pay_per_doc") => {
    setCheckoutLoading(type);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.url && data.url !== "/dashboard") {
        window.location.href = data.url;
      }
    } catch {
      // silent
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!usage) return <>{children}</>;

  const blocked =
    usage.plan !== "pro" && usage.docCount >= usage.limit;

  if (!blocked) {
    return <>{children}</>;
  }

  return (
    <Card className="border-destructive/30 max-w-lg mx-auto mt-6">
      <CardHeader>
        <CardTitle>Limit reached</CardTitle>
        <CardDescription>
          You&apos;ve used {usage.docCount} of {usage.limit} free documents this month. Choose an option to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="default"
          className="w-full"
          onClick={() => handleCheckout("subscription")}
          disabled={checkoutLoading !== null}
        >
          {checkoutLoading === "subscription"
            ? "Loading..."
            : "Go Pro — $19/mo unlimited"}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleCheckout("pay_per_doc")}
          disabled={checkoutLoading !== null}
        >
          {checkoutLoading === "pay_per_doc"
            ? "Loading..."
            : "Unlock one document — $5"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          {isStripeConfigured()
            ? "Secure payment via Stripe. Cancel anytime."
            : "Demo mode: set up Stripe keys in .env.local."}
        </p>
      </CardContent>
    </Card>
  );
}
