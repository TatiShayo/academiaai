"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDocuments } from "@/lib/documents-provider";
import { Save } from "lucide-react";

interface FlaggedSentence {
  sentence: string;
  risk: "high" | "medium" | "low";
  reason: string;
}

export default function PlagiarismPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    score: number;
    flagged: FlaggedSentence[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveDocument } = useDocuments();

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/plagiarism-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 20) return "text-green-500";
    if (score < 50) return "text-yellow-500";
    return "text-destructive";
  };

  const getRiskColor = (risk: string) => {
    if (risk === "high") return "bg-red-500/10 text-red-500 border-red-500/20";
    if (risk === "medium") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-green-500/10 text-green-600 border-green-500/20";
  };

  const highlightInText = (sentence: string, risk: string) => {
    const riskColor = risk === "high" ? "bg-red-200 dark:bg-red-900" : risk === "medium" ? "bg-yellow-200 dark:bg-yellow-900" : "bg-transparent";
    return text.replace(sentence, `<mark class="${riskColor} px-0.5 rounded">${sentence}</mark>`);
  };

  const handleSave = () => {
    if (!result || !saveName.trim()) return;
    saveDocument({
      name: saveName.trim(),
      original: text,
      processed: `Risk score: ${result.score}%\n\nFlagged: ${result.flagged.map(f => f.sentence).join("; ")}`,
      tool: "plagiarism",
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
    setSaved(true);
    setSaveName("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plagiarism Risk Scanner</h1>
        <p className="text-muted-foreground">
          Estimate the plagiarism risk of your text with AI-powered analysis. See which sentences are flagged and get rephrasing suggestions.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Paste your text to analyze</Label>
            <Textarea
              id="text"
              placeholder="Paste text here to check for plagiarism risk..."
              className="min-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <Button onClick={handleAnalyze} disabled={loading || !text.trim()} className="w-fit">
            {loading ? "Analyzing..." : "Analyze"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                  {result.score}%
                </span>
                <div className="flex-1">
                  <Progress value={result.score} className="h-2" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {result.score < 20
                  ? "Low risk — your text appears original."
                  : result.score < 50
                  ? "Moderate risk — some passages may need rephrasing."
                  : "High risk — significant portions may match existing sources."}
              </p>
            </CardContent>
          </Card>

          {result.flagged.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Flagged sentences</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {result.flagged.map((item, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${getRiskColor(item.risk)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getRiskColor(item.risk)}>
                        {item.risk.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{item.sentence}</p>
                    <p className="text-xs mt-1 opacity-80">{item.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="py-4 flex items-center gap-3">
              <Save className="size-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Document name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="h-9"
              />
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!saveName.trim() || saved}>
                {saved ? "Saved!" : "Save to documents"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
