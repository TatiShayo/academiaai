import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScanSearch, Check, ArrowRight, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Plagiarism Risk Scanner — Check Papers Before Submission | AcademiaAI",
  description:
    "AI-powered plagiarism risk analysis. Identify potentially problematic passages before you submit. Get a risk score and flagged sentences with rewriting suggestions.",
  openGraph: {
    title: "Plagiarism Risk Scanner — Check Papers Before Submission | AcademiaAI",
    description:
      "AI-powered plagiarism risk analysis. Identify potentially problematic passages before you submit.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this a real plagiarism checker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AcademiaAI's Plagiarism Risk Scanner is an AI-based risk estimator that analyzes your text for patterns commonly flagged by plagiarism detection systems. It identifies sentences that may appear too similar to common source material and suggests rewrites. For comprehensive database checking, universities typically use Turnitin.",
      },
    },
    {
      "@type": "Question",
      "name": "How accurate is the risk score?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The risk score provides a directional estimate based on linguistic patterns, sentence uniqueness, and common phrasing. While not a replacement for institutional plagiarism software, it effectively identifies passages that merit closer review before submission.",
      },
    },
    {
      "@type": "Question",
      "name": "Does the scanner store my text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — AcademiaAI processes your text in real-time and does not store it in any plagiarism database. Your content remains private and is never added to comparison databases.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I check an entire paper at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can paste your entire paper up to 10,000 words. The scanner analyzes each sentence and returns a comprehensive report with an overall risk score and individual sentence flags.",
      },
    },
  ],
};

export default function PlagiarismPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <ScanSearch className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          Plagiarism Risk Scanner
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Scan your papers before submission. Get a risk score, flagged sentences,
          and rewriting suggestions — all powered by AI.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 h-12 gap-2">
            Scan your paper free <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste your text", desc: "Drop in your essay, research paper, or any academic text you want to check." },
            { step: "2", title: "Run the scan", desc: "Our AI analyzes sentence patterns, common phrases, and structural similarity markers." },
            { step: "3", title: "Review results", desc: "Get a risk score, flagged sentences highlighted in orange/red, and suggestions to rephrase." },
          ].map((s) => (
            <Card key={s.step} className="text-center">
              <CardHeader>
                <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                  {s.step}
                </div>
                <CardTitle className="text-lg">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{s.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-black border-y py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What the scanner checks</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Our AI analyzes multiple dimensions of your text to estimate plagiarism risk.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              "Sentence pattern similarity analysis",
              "Common academic phrase detection",
              "Structural uniqueness scoring",
              "Vocabulary diversity assessment",
              "Paragraph-level coherence check",
              "Source matching indicators",
              "Paraphrasing quality evaluation",
              "Citation density analysis",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <Shield className="size-5 text-primary mt-0.5 shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Sample risk report</h2>
        <p className="text-muted-foreground text-center mb-12">See how we flag potentially problematic passages.</p>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Risk Analysis</CardTitle>
              <span className="text-lg font-bold text-amber-500">Medium Risk — 42%</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>Climate change represents one of the most pressing challenges of our time. <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1 rounded">Rising global temperatures have led to unprecedented environmental changes across the planet.</span></p>
              <p>The scientific consensus is clear: <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-1 rounded">greenhouse gas emissions from human activities are the primary driver of observed warming since the mid-20th century.</span></p>
              <p>Coastal communities face particular vulnerability, with sea level rise threatening infrastructure and displacing populations at an accelerating rate.</p>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 text-xs">
              <strong>2 sentences flagged</strong> — These passages use common phrasing found across academic sources. Consider rewriting in your own words or adding proper citations.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="bg-primary/5 py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Check your paper before submitting</h2>
          <p className="text-muted-foreground mb-8">
            Start free. 3 documents per month. No credit card required.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-base px-8 h-12">
              Get started free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
