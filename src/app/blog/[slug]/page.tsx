import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PostProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), "src/app/blog/posts");
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => ({
    slug: filename.replace(/\.mdx$/, ""),
  }));
}

async function getPost(slug: string) {
  const postsDirectory = path.join(process.cwd(), "src/app/blog/posts");
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    metadata: data as {
      title: string;
      date: string;
      description: string;
      readTime: string;
    },
    content,
  };
}

export async function generateMetadata(props: PostProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.metadata.title} | AcademiaAI Blog`,
    description: post.metadata.description,
    openGraph: {
      title: `${post.metadata.title} | AcademiaAI Blog`,
      description: post.metadata.description,
      type: "article",
      publishedTime: post.metadata.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.metadata.title,
      description: post.metadata.description,
    },
  };
}

export default async function BlogPost(props: PostProps) {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/blog" className="text-sm text-primary hover:underline mb-6 inline-block">
          ← Back to blog
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {post.metadata.title}
        </h1>
        <p className="text-xs text-muted-foreground mb-8">
          {new Date(post.metadata.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} · {post.metadata.readTime}
        </p>

        <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-p:text-sm prose-p:leading-relaxed prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-5 prose-li:text-sm">
          <MDXRemote source={post.content} />
        </div>

        <div className="mt-12 p-8 rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm text-center">
          <h3 className="text-lg font-bold mb-2">Make your AI text sound human</h3>
          <p className="text-sm text-muted-foreground mb-6">
            AcademiaAI humanizes AI text in seconds — reducing detection scores below 5%.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools/humanizer">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors">
                Try the humanizer free
              </button>
            </Link>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Share:</span>
              <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
