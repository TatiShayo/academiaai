import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-4">
      <main className="flex flex-col items-center text-center max-w-2xl gap-8">
        <h1 className="text-5xl font-bold tracking-tight leading-tight">
          Your work. Just better.
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Humanize AI text, elevate academic writing, scan for plagiarism risk, and
          generate citations — all in one platform.
        </p>
        <div className="flex gap-4">
          <Link href="/signup">
            <Button size="lg">Get started free</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Sign in</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
