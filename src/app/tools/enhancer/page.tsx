import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Check, ArrowRight, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Academic Writing Enhancer — Improve Essays & Papers | AcademiaAI",
  description:
    "Elevate your academic writing from high school to PhD level. Our AI enhancer improves vocabulary, structure, and academic tone. Free for 3 documents per month.",
  openGraph: {
    title: "Academic Writing Enhancer — Improve Essays & Papers | AcademiaAI",
    description:
      "Elevate your academic writing from high school to PhD level. Our AI enhancer improves vocabulary, structure, and academic tone.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does the academic enhancer do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The academic enhancer elevates your writing by improving vocabulary, sentence structure, academic tone, and formal register. You can target four levels: High School, Undergraduate, Masters, and PhD.",
      },
    },
    {
      "@type": "Question",
      "name": "Can it help ESL students?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — the academic enhancer is particularly effective for ESL students. It corrects grammatical errors, improves natural phrasing, and adjusts the writing to match native-level academic standards.",
      },
    },
    {
      "@type": "Question",
      "name": "Will my ideas stay the same?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. The enhancer preserves your original ideas and arguments while improving how they're expressed. Use the diff view to see exactly what words were changed.",
      },
    },
    {
      "@type": "Question",
      "name": "Which academic level should I choose?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "High School for clear, straightforward writing. Undergraduate for college-level papers. Masters for graduate-level sophistication. PhD for doctoral-level precision with discipline-specific vocabulary.",
      },
    },
  ],
};

export default function EnhancerPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-6">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
          <Pencil className="size-8 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          Academic Writing Enhancer
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Elevate essays, papers, and research from rough drafts to polished academic prose.
          Choose your level — High School to PhD.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-base px-8 h-12 gap-2">
            Enhance your writing free <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste your draft", desc: "Drop in your essay, research paper, thesis chapter, or any academic text." },
            { step: "2", title: "Choose your level", desc: "Pick from High School, Undergraduate, Masters, or PhD — the enhancer adjusts vocabulary and complexity." },
            { step: "3", title: "Get enhanced text", desc: "Receive writing with improved vocabulary, formal register, and academic structure." },
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
          <h2 className="text-3xl font-bold text-center mb-12">Four academic levels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: "High School", desc: "Clear, straightforward language with proper grammar and paragraph structure." },
              { level: "Undergraduate", desc: "College-level vocabulary, thesis statements, and argument development." },
              { level: "Masters", desc: "Graduate-level sophistication, discipline-appropriate terminology, and critical analysis framing." },
              { level: "PhD", desc: "Doctoral precision, advanced vocabulary, research-ready phrasing, and field-specific conventions." },
            ].map((l) => (
              <Card key={l.level} className="text-center">
                <CardHeader>
                  <GraduationCap className="size-8 mx-auto text-primary mb-2" />
                  <CardTitle className="text-base">{l.level}</CardTitle>
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
        <h2 className="text-3xl font-bold text-center mb-4">See the transformation</h2>
        <p className="text-muted-foreground text-center mb-12">From rough draft to polished prose.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-destructive">✕</span> Before
              </CardTitle>
              <CardDescription>Basic writing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This paper looks at how social media affects teenagers. A lot of studies show that it can make people feel bad about themselves because they compare themselves to others.
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-green-500">✓</span> After (Undergraduate)
              </CardTitle>
              <CardDescription>Academic register</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                This paper examines the psychological impact of social media usage on adolescent well-being. Empirical research consistently demonstrates a correlation between social media consumption and diminished self-esteem, attributable to upward social comparison mechanisms.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-primary/5 py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Elevate your academic writing</h2>
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
