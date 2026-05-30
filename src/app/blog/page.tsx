import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "AcademiaAI Blog — AI Writing Tips & Academic Writing Guides",
  description:
    "Expert guides on AI text humanization, academic writing, plagiarism prevention, and citation best practices. Tips for students and researchers.",
};

const posts = [
  {
    slug: "how-to-make-chatgpt-text-undetectable",
    title: "How to Make ChatGPT Text Undetectable in 2026",
    excerpt:
      "Learn proven techniques to humanize AI-generated text so it passes Turnitin, GPTZero, and Originality.ai detection with confidence.",
    date: "2026-05-15",
    readTime: "6 min read",
  },
  {
    slug: "ai-vs-human-writing-the-differences",
    title: "AI Writing vs Human Writing: The Key Differences",
    excerpt:
      "What separates machine-generated text from human prose? We analyze sentence patterns, vocabulary choice, and the subtle markers AI detectors look for.",
    date: "2026-05-08",
    readTime: "5 min read",
  },
  {
    slug: "best-academic-writing-tools-2026",
    title: "Best Academic Writing Tools 2026 — Compared",
    excerpt:
      "Side-by-side comparison of AcademiaAI, Grammarly, QuillBot, and other top tools. Which one actually saves you time and improves your grades?",
    date: "2026-05-01",
    readTime: "7 min read",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <section className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-center gap-6 border-b">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-2xl">
          AcademiaAI Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl">
          Tips, guides, and insights on academic writing, AI humanization, and
          plagiarism prevention — for students and researchers.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-10">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <Calendar className="size-3.5" />
                <span>{post.date}</span>
                <Clock className="size-3.5 ml-2" />
                <span>{post.readTime}</span>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>
              </Link>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Read more <ArrowRight className="size-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary/5 py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to improve your writing?</h2>
          <p className="text-muted-foreground mb-8">
            Try AcademiaAI free — humanize text, enhance academic writing, and more.
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
