"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/lib/documents-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { DiffView } from "@/components/diff-view";
import { Save } from "lucide-react";

export default function EnhancePage() {
  const [text, setText] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [result, setResult] = useState<{
    original: string;
    enhanced: string;
    changes: { original: string; enhanced: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveDocument } = useDocuments();

  const handleEnhance = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/enhance", {
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
      processed: result.enhanced,
      tool: "enhance",
      wordCount: result.enhanced.split(/\s+/).filter(Boolean).length,
    });
    setSaved(true);
    setSaveName("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Enhancer</h1>
        <p className="text-muted-foreground">
          Elevate your writing to any academic level. Choose your target level and get enhanced text with a formal academic tone.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Paste your text</Label>
            <Textarea
              id="text"
              placeholder="Paste your text here..."
              className="min-h-32"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Academic level</Label>
            <Select value={level} onValueChange={(v) => v && setLevel(v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High School">High School</SelectItem>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                <SelectItem value="Masters">Masters</SelectItem>
                <SelectItem value="PhD">PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleEnhance} disabled={loading || !text.trim()} className="w-fit">
            {loading ? "Enhancing..." : "Enhance"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-28 mt-2" />
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Enhanced
                <Badge variant="secondary" className="text-xs">{level}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <DiffView original={result.original} processed={result.enhanced} />
              <Button variant="outline" size="sm" className="w-fit" onClick={() => handleCopy(result.enhanced)}>
                {copied ? "Copied!" : "Copy output"}
              </Button>
            </CardContent>
          </Card>

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
