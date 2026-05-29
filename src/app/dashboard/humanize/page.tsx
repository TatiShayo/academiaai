"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/lib/documents-provider";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function HumanizePage() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState("balanced");
  const [result, setResult] = useState<{
    original: string;
    humanized: string;
    aiScoreBefore: number;
    aiScoreAfter: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveDocument } = useDocuments();

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, level }),
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

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!result || !saveName.trim()) return;
    saveDocument({
      name: saveName.trim(),
      original: result.original,
      processed: result.humanized,
      tool: "humanize",
      wordCount: result.humanized.split(/\s+/).filter(Boolean).length,
    });
    setSaved(true);
    setSaveName("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Humanizer</h1>
        <p className="text-muted-foreground">
          Make AI-generated text undetectable. Paste your text and choose a humanization level.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Paste your AI-generated text</Label>
            <Textarea
              id="text"
              placeholder="Paste AI-generated text here..."
              className="min-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Humanization level</Label>
            <Select value={level} onValueChange={(v) => v && setLevel(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subtle">Subtle</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleHumanize} disabled={loading || !text.trim()} className="w-fit">
            {loading ? "Humanizing..." : "Humanize"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Original
                <Badge variant="destructive" className="text-xs">
                  {result.aiScoreBefore}% AI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {result.original}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Humanized
                <Badge className="text-xs bg-green-500 hover:bg-green-500">
                  {result.aiScoreAfter}% AI
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {result.humanized}
              </p>
              <Button variant="outline" size="sm" className="w-fit" onClick={() => handleCopy(result.humanized)}>
                {copied ? "Copied!" : "Copy output"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
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
      )}
    </div>
  );
}
