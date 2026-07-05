import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Send } from "lucide-react";

export default function AffiliatesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center gap-8" aria-labelledby="affiliates-title">
        <DollarSign className="size-14 text-primary" />
        <h1 id="affiliates-title" className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          Earn 30% recurring commission
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Share AcademiaAI with your audience and earn 30% of every Pro subscription they start — for as long as they stay subscribed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mt-4">
          {[
            { title: "30% Commission", desc: "On every Pro subscription your referrals start" },
            { title: "Recurring", desc: "Earn monthly for as long as they stay subscribed" },
            { title: "No cap", desc: "Unlimited earning potential — no ceiling" },
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="pt-6 text-center">
                <p className="font-semibold mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <form action="/api/extension-waitlist" method="post" className="flex gap-2 max-w-md w-full mt-4">
          <Input
            name="email"
            type="email"
            placeholder="Enter your email to join the waitlist"
            required
            className="h-10"
            aria-label="Email for affiliate waitlist"
          />
          <Button type="submit" size="sm" className="h-10 shrink-0">
            <Send className="size-4 mr-1.5" />
            Join waitlist
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          We&apos;ll notify you when the affiliate program launches.
        </p>
      </section>
    </div>
  );
}
