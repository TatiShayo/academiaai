"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocuments } from "@/lib/documents-provider";

export function DashboardStats() {
  const { documents } = useDocuments();
  const [plan, setPlan] = useState("Free");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setPlan(data.plan === "pro" ? "Pro" : data.plan === "unlocked" ? "Pay-per-doc" : "Free");
          setRemaining(data.remaining);
        }
      })
      .catch(() => {});
  }, []);

  const wordsProcessed = documents.reduce((sum, d) => sum + d.wordCount, 0);
  const docsSaved = documents.length;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Words processed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{wordsProcessed.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Documents saved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{docsSaved}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{plan}</p>
          {remaining !== null && plan !== "Pro" && (
            <p className="text-xs text-muted-foreground mt-1">
              {remaining} document{remaining !== 1 ? "s" : ""} remaining
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
