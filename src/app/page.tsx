import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Pencil, ScanSearch, Quote, Check, Puzzle, Send } from "lucide-react";
import { WordCounter } from "@/components/word-counter";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AcademiaAI",
  "description": "AI text humanizer, academic writing enhancer, plagiarism risk scanner, and citation generator for students and researchers.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "USD",
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "19",
      "priceCurrency": "USD",
      "description": "Monthly subscription",
    },
    {
      "@type": "Offer",
      "name": "Pay-per-doc",
      "price": "5",
      "priceCurrency": "USD",
      "description": "Single document credit",
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center gap-8" aria-labelledby="hero-title">
        <Badge variant="secondary" className="text-xs">
          Phase 2 complete — core tools live
        </Badge>
        <h1 id="hero-title" className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          Your work. <span className="text-primary">Just better.</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
          Humanize AI-generated text, elevate academic writing, scan for plagiarism risk,
          and generate citations — all in one platform.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 h-12" aria-label="Get started free">
              Get started free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-base px-8 h-12" aria-label="Sign in to your account">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Free for 3 documents per month. No credit card required.
        </p>
        <WordCounter className="text-sm text-muted-foreground mt-4" />
      </section>

      {/* Tool Cards */}
      <section className="max-w-6xl mx-auto px-4 py-24" aria-labelledby="tools-title">
        <h2 id="tools-title" className="text-3xl font-bold text-center mb-4">
          Four tools. One pipeline.
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Everything you need to take AI-assisted writing from obvious to outstanding.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "AI Humanizer",
              desc: "Rewrite AI-generated text so it reads like a human wrote it. Undetectable by AI detectors.",
            },
            {
              icon: Pencil,
              title: "Academic Enhancer",
              desc: "Elevate your writing to any academic level — high school through PhD.",
            },
            {
              icon: ScanSearch,
              title: "Plagiarism Scanner",
              desc: "Estimate plagiarism risk with AI-powered analysis. Find and fix flagged passages.",
            },
            {
              icon: Quote,
              title: "Citation Generator",
              desc: "Generate perfect citations in APA, MLA, Chicago, or Harvard from URLs, DOIs, or titles.",
            },
          ].map((tool) => (
            <Card key={tool.title} className="text-center">
              <CardHeader>
                <tool.icon className="size-10 mx-auto text-primary mb-2" />
                <CardTitle className="text-lg">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Before/After Demo */}
      <section className="bg-white dark:bg-black border-y py-24" aria-labelledby="demo-title">
        <div className="max-w-4xl mx-auto px-4">
          <h2 id="demo-title" className="text-3xl font-bold text-center mb-4">
            See the difference
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Watch AcademiaAI transform AI-generated text into natural, academic writing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-destructive">✕</span> Before
                </CardTitle>
                <CardDescription>AI-generated text, 94% detection score</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The implementation of artificial intelligence in educational settings has demonstrated significant potential for enhancing student learning outcomes through personalized instruction and adaptive feedback mechanisms.
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-green-500">✓</span> After
                </CardTitle>
                <CardDescription>Humanized, 2% detection score</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">
                  AI in the classroom is showing real promise — it adapts to how each student learns, giving them the right help at the right time rather than a one-size-fits-all approach.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-24" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="text-3xl font-bold text-center mb-4">
          Simple pricing
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Start free. Upgrade when you need more. No hidden fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For occasional use</CardDescription>
              <p className="text-3xl font-bold mt-2">$0</p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "3 documents per month",
                  "All four tools",
                  "Basic AI humanization",
                  "Standard support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block w-full">
                <Button variant="outline" className="w-full">
                  Get started
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary ring-1 ring-primary/20">
            <CardHeader>
              <Badge className="w-fit mb-2">Most popular</Badge>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious researchers</CardDescription>
              <p className="text-3xl font-bold mt-2">$19<span className="text-base font-normal text-muted-foreground">/mo</span></p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Unlimited documents",
                  "All four tools",
                  "Aggressive humanization",
                  "All academic levels",
                  "Document history",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block w-full">
                <Button className="w-full">Start Pro</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay-per-doc</CardTitle>
              <CardDescription>One-off processing</CardDescription>
              <p className="text-3xl font-bold mt-2">$5<span className="text-base font-normal text-muted-foreground">/doc</span></p>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {[
                  "Single document processing",
                  "All four tools",
                  "Full quality output",
                  "No subscription needed",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-6 block w-full">
                <Button variant="outline" className="w-full">
                  Pay as you go
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chrome Extension */}
      <section className="bg-gradient-to-br from-primary/5 to-primary/10 py-24" aria-labelledby="extension-title">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Puzzle className="size-12 mx-auto text-primary mb-4" />
          <h2 id="extension-title" className="text-3xl font-bold mb-4">
            Coming Soon: AcademiaAI Extension
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Humanize text and check grammar directly in Google Docs, Word Online, and any text editor — no copy-paste needed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto mb-8">
            {[
              "One-click humanization in any text field",
              "Grammar & style check while you type",
              "Works with Google Docs, Word Online, Notion",
              "All four tools at your fingertips",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2">
                <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
          <form action="/api/extension-waitlist" method="post" className="flex gap-2 max-w-md mx-auto">
            <Input
              name="email"
              type="email"
              placeholder="Enter your email for early access"
              required
              className="h-10"
              aria-label="Email for extension waitlist"
            />
            <Button type="submit" size="sm" className="h-10 shrink-0">
              <Send className="size-4 mr-1.5" />
              Notify me
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            No spam. We&apos;ll email you once when the extension launches.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-sm text-muted-foreground">
        <p>© 2026 AcademiaAI. Built for students and researchers.</p>
      </footer>
    </div>
  );
}
