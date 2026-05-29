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

  const highlightChanges = (text: string, changes: { original: string; enhanced: string }[]) => {
    if (!changes.length) return text;
    let result = text;
    changes.forEach(({ original, enhanced }) => {
      result = result.replace(original, `<mark class="bg-green-200 dark:bg-green-900 px-0.5 rounded">${enhanced}</mark>`);
    });
    return result;
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

      {result && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {result.original}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Enhanced
                  <Badge variant="secondary" className="text-xs">{level}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: highlightChanges(result.enhanced, result.changes),
                  }}
                />
                <Button variant="outline" size="sm" className="w-fit" onClick={() => handleCopy(result.enhanced)}>
                  {copied ? "Copied!" : "Copy output"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {result.changes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Changes made</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1 text-sm">
                  {result.changes.map((change, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground line-through">{change.original}</span>
                      <span>→</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{change.enhanced}</span>
                    </div>
                  ))}
                </div>
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
