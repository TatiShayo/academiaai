import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Pencil, Sparkles, ScanSearch, Quote } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const tools = [
    {
      title: "AI Humanizer",
      description: "Make AI-generated text undetectable",
      icon: Sparkles,
      href: "/dashboard/humanize",
    },
    {
      title: "Academic Enhancer",
      description: "Elevate writing to academic standards",
      icon: Pencil,
      href: "/dashboard/enhance",
    },
    {
      title: "Plagiarism Scanner",
      description: "Estimate plagiarism risk in your text",
      icon: ScanSearch,
      href: "/dashboard/plagiarism",
    },
    {
      title: "Citation Generator",
      description: "Generate citations in any format",
      icon: Quote,
      href: "/dashboard/citations",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Words processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Free</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Tools</h2>
        <div className="grid grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <tool.icon className="size-5" />
                    {tool.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
