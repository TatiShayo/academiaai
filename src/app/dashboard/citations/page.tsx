"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocuments } from "@/lib/documents-provider";
import { Save } from "lucide-react";

export default function CitationsPage() {
  const [source, setSource] = useState("");
  const [format, setFormat] = useState("APA");
  const [result, setResult] = useState<{
    source: string;
    format: string;
    citation: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveDocument } = useDocuments();

  const handleGenerate = async () => {
    if (!source.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tools/citations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, format }),
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
      original: result.source,
      processed: `[${result.format}] ${result.citation}`,
      tool: "citations",
      wordCount: result.citation.split(/\s+/).filter(Boolean).length,
    });
    setSaved(true);
    setSaveName("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Citation Generator</h1>
        <p className="text-muted-foreground">
          Generate perfectly formatted citations. Paste a URL, DOI, book title, or author name.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Paste a URL, DOI, book title, or author..."
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Citation format</Label>
            <Select value={format} onValueChange={(v) => v && setFormat(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="Harvard">Harvard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !source.trim()} className="w-fit">
            {loading ? "Generating..." : "Generate"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your citation ({result.format})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-mono leading-relaxed break-all">
                {result.citation}
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-fit" onClick={() => handleCopy(result.citation)}>
              {copied ? "Copied!" : "Copy citation"}
            </Button>
            <div className="flex items-center gap-3 border-t pt-3 mt-1">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
