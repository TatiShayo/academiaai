import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote, Check, ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Citation Generator — APA, MLA, Chicago, Harvard | AcademiaAI",
  description:
    "Generate perfect citations instantly. Paste a URL, DOI, or book title and get formatted citations in APA, MLA, Chicago, or Harvard style. Free for 3 documents per month.",
  openGraph: {
    title: "Citation Generator — APA, MLA, Chicago, Harvard | AcademiaAI",
    description:
      "Generate perfect citations instantly. Paste a URL, DOI, or book title and get formatted citations in APA, MLA, Chicago, or Harvard style.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which citation formats do you support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AcademiaAI supports APA 7th edition, MLA 9th edition, Chicago 17th edition (Notes-Bibliography), and Harvard referencing. Select your required format before generating.",
      },
    },
    {
      "@type": "Question",
      "name": "What sources can I generate citations for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can generate citations from URLs (websites, online articles), DOIs (journal articles), book titles, or author names. Simply paste the reference and the AI identifies and formats it correctly.",
      },
    },
    {
      "@type": "Question",
      "name": "Are the citations accurate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The citations follow official style guide formatting rules and are generally accurate for standard source types. We recommend verifying against your institution's style guide, especially for unusual or complex sources.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I generate a bibliography?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — generate individual citations and compile them into a formatted bibliography. Citations are generated one at a time, and you can copy them into your reference list.",
      },
    },
  ],
};

export default function CitationsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <Quote className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          Citation Generator
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Generate perfectly formatted citations in seconds.
          APA, MLA, Chicago, Harvard — from URLs, DOIs, or book titles.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 h-12 gap-2">
            Generate citations free <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste a source", desc: "Enter a URL, DOI, book title, or author name — our AI identifies the source type automatically." },
            { step: "2", title: "Choose a format", desc: "Select APA, MLA, Chicago, or Harvard — the citation is formatted to the latest edition standards." },
            { step: "3", title: "Copy and use", desc: "Get your formatted citation instantly. Copy it directly into your bibliography or reference list." },
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
          <h2 className="text-3xl font-bold text-center mb-12">Four citation formats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { format: "APA 7th", desc: "American Psychological Association — standard for social sciences, education, and psychology." },
              { format: "MLA 9th", desc: "Modern Language Association — preferred for humanities, literature, and arts." },
              { format: "Chicago 17th", desc: "Notes-Bibliography style — used in history, arts, and humanities." },
              { format: "Harvard", desc: "Author-date system — widely used in UK and Australian universities across disciplines." },
            ].map((l) => (
              <Card key={l.format} className="text-center">
                <CardHeader>
                  <BookOpen className="size-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-base">{l.format}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{l.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Example citations</h2>
        <p className="text-muted-foreground text-center mb-12">See each format in action.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[
            {
              format: "APA 7th",
              example: "Smith, J. A. (2024). Artificial intelligence in education: A systematic review. Journal of Educational Technology, 45(2), 112-128. https://doi.org/10.1234/edu.2024.045",
            },
            {
              format: "MLA 9th",
              example: 'Smith, John A. "Artificial Intelligence in Education: A Systematic Review." Journal of Educational Technology, vol. 45, no. 2, 2024, pp. 112-28.',
            },
            {
              format: "Chicago 17th",
              example: "Smith, John A. \"Artificial Intelligence in Education: A Systematic Review.\" Journal of Educational Technology 45, no. 2 (2024): 112-28.",
            },
            {
              format: "Harvard",
              example: "Smith, J.A. (2024) 'Artificial intelligence in education: A systematic review', Journal of Educational Technology, 45(2), pp. 112-128.",
            },
          ].map((c) => (
            <Card key={c.format}>
              <CardHeader>
                <CardTitle className="text-sm">{c.format}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed font-mono">{c.example}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Always verify citations against your institution&apos;s official style guide.</p>
      </section>

      {/* Related articles */}
      <section className="max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-2xl font-bold text-center mb-8">Related articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: "/blog/best-academic-writing-tools-2026", title: "Best Academic Writing Tools 2026" },
            { href: "/blog/ai-vs-human-writing-the-differences", title: "AI vs Human Writing: The Differences" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="text-xs text-primary mt-1">Read article →</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Generate your citations now</h2>
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
