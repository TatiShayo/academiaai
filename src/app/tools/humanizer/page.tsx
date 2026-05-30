import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Check, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Text Humanizer — Make AI Text Undetectable | AcademiaAI",
  description:
    "Transform AI-generated text into natural, human-like writing. Beat AI detectors with our advanced humanizer. Free for 3 documents per month — start now.",
  openGraph: {
    title: "AI Text Humanizer — Make AI Text Undetectable | AcademiaAI",
    description:
      "Transform AI-generated text into natural, human-like writing. Beat AI detectors with our advanced humanizer.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the AI text humanizer work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our humanizer uses GPT-4o to rewrite AI-generated text with natural sentence variation, idiomatic expressions, and the imperfections that characterize human writing — making it virtually undetectable by AI detection tools.",
      },
    },
    {
      "@type": "Question",
      "name": "Can Turnitin detect humanized text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AcademiaAI's humanizer restructures sentences, varies vocabulary, and introduces natural writing patterns that AI detectors like Turnitin, GPTZero, and Originality.ai typically cannot identify as machine-generated. However, no tool can guarantee 100% undetectability.",
      },
    },
    {
      "@type": "Question",
      "name": "Is the humanized text plagiarism-free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — the humanizer creates completely original text. It rewrites content rather than copying or paraphrasing from sources. For additional safety, use our Plagiarism Risk Scanner to verify your text before submission.",
      },
    },
    {
      "@type": "Question",
      "name": "How many words can I humanize at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can process up to 10,000 words per request. For longer documents, use our bulk upload feature which automatically splits your document into chunks and processes each one.",
      },
    },
  ],
};

export default function HumanizerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <Sparkles className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          AI Text Humanizer
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Turn robotic AI text into writing that sounds unmistakably human.
          Beat GPTZero, Turnitin, and Originality.ai detection.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 h-12 gap-2">
            Humanize your text free <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste your text", desc: "Drop in any AI-generated content — from ChatGPT, Claude, Jasper, or any other tool." },
            { step: "2", title: "Choose intensity", desc: "Select Subtle, Balanced, or Aggressive humanization depending on how much rewriting you need." },
            { step: "3", title: "Get humanized output", desc: "Receive text that reads naturally, with sentence variation and authentic human tone." },
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

      {/* Features */}
      <section className="bg-white dark:bg-black border-y py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why our humanizer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              "Three intensity levels — Subtle, Balanced, Aggressive",
              "GPT-4o powered for quality output",
              "AI detection score comparison (before vs after)",
              "Word-by-word diff highlighting changes",
              "Grammar & style check built in",
              "Removes common AI fingerprint phrases",
              "Bulk document processing support",
              "Privacy-first — your text is never stored",
            ].map((f) => (
              <div key={f} className="flex items-start gap-3">
                <Check className="size-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">See it in action</h2>
        <p className="text-muted-foreground text-center mb-12">Before and after — the difference is clear.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-destructive">✕</span> AI-Generated
              </CardTitle>
              <CardDescription>94% detection score</CardDescription>
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
                <span className="text-green-500">✓</span> Humanized
              </CardTitle>
              <CardDescription>2% detection score</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                AI in the classroom is showing real promise — it adapts to how each student learns, giving them the right help at the right time rather than a one-size-fits-all approach.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to humanize your writing?</h2>
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
