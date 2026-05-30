"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Trash2, Plus } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  api_key: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
};

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/keys");
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setNewKey(data.api_key);
        fetchKeys();
      }
    } catch {
      setError("Failed to generate key");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      const res = await fetch(`/api/keys?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) setError(data.error);
      else fetchKeys();
    } catch {
      setError("Failed to revoke key");
    } finally {
      setRevoking(null);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your API keys and account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Use these keys to access the AcademiaAI API. Keep them secret.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {newKey && (
            <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950/20 rounded-lg flex flex-col gap-2">
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                New API key generated — copy it now. You won&apos;t see it again.
              </p>
              <div className="flex items-center gap-2">
                <Input value={newKey} readOnly className="font-mono text-sm h-9" />
                <Button variant="outline" size="sm" onClick={() => handleCopy(newKey)}>
                  <Copy className="size-4 mr-1" />
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {keys.filter((k) => !k.revoked).length} active key(s)
            </p>
            <Button size="sm" onClick={handleGenerate} disabled={generating}>
              <Plus className="size-4 mr-1" />
              {generating ? "Generating..." : "Generate key"}
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {key.api_key.slice(0, 12)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  {key.revoked ? (
                    <Badge variant="destructive" className="text-xs">Revoked</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(key.id)}
                      disabled={revoking === key.id}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Make POST requests to our API with your key in the Authorization header.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Humanize endpoint</Label>
            <p className="font-mono text-sm">{process.env.NEXT_PUBLIC_SITE_URL || "https://academia.ai"}/api/v1/humanize</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Auth header</Label>
            <p className="font-mono text-sm">Authorization: Bearer YOUR_API_KEY</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Rate limit</Label>
            <p className="text-sm">100 requests per minute</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
