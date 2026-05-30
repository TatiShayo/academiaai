"use client";

import { useDocuments } from "@/lib/documents-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, RotateCcw, Tag, Save } from "lucide-react";
import { useState } from "react";
import { DiffView } from "@/components/diff-view";

const ALL_TAGS = ["Essay", "Research", "Thesis", "Report"] as const;

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getDocument, deleteDocument, updateDocument } = useDocuments();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showV2, setShowV2] = useState<string | false>(false);
  const [compareVersion, setCompareVersion] = useState<string | null>(null);
  const [folderName, setFolderName] = useState("");

  const doc = getDocument(id);

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Document not found.</p>
        <Link href="/dashboard/documents">
          <Button variant="outline">Back to documents</Button>
        </Link>
      </div>
    );
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    deleteDocument(doc.id);
    router.push("/dashboard/documents");
  };

  const toggleTag = (tag: string) => {
    const has = doc.tags.includes(tag);
    const newTags = has ? doc.tags.filter((t) => t !== tag) : [...doc.tags, tag];
    updateDocument(doc.id, { tags: newTags });
  };

  const handleSetFolder = () => {
    updateDocument(doc.id, { folder: folderName.trim() || null });
    setFolderName("");
  };

  const getReprocessLink = () => {
    const toolMap: Record<string, string> = {
      humanize: "/dashboard/humanize",
      enhance: "/dashboard/enhance",
      plagiarism: "/dashboard/plagiarism",
      citations: "/dashboard/citations",
    };
    return toolMap[doc.tool] ?? "/dashboard";
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{doc.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary">{doc.tool}</Badge>
            <span className="text-sm text-muted-foreground">{doc.wordCount} words</span>
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs gap-1">
                <Tag className="size-3" />
                {tag}
              </Badge>
            ))}
            {doc.folder && (
              <Badge variant="secondary" className="text-xs">{doc.folder}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            Processed
            {doc.versions.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                ({doc.versions.length + 1} version{doc.versions.length + 1 !== 1 ? "s" : ""})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <DiffView original={doc.original} processed={doc.processed} />
        </CardContent>
      </Card>

      {doc.versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Badge className="bg-green-500 text-xs">V{doc.versions.length + 1}</Badge>
                <span className="text-muted-foreground">Current version</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setCompareVersion(null); setShowV2(false); }}
                >
                  Show
                </Button>
              </div>
              {doc.versions.map((v, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Badge variant="secondary" className="text-xs">V{i + 1}</Badge>
                  <span className="text-muted-foreground">
                    {v.wordCount} words
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowV2(v.processed);
                        setCompareVersion(null);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCompareVersion(v.processed);
                        setShowV2(false);
                      }}
                    >
                      Compare
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {compareVersion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <DiffView original={compareVersion} processed={doc.processed} />
          </CardContent>
        </Card>
      )}

      {showV2 && typeof showV2 === "string" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{showV2}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <Button variant="outline" onClick={() => handleCopy(doc.processed)}>
          <Copy className="size-4 mr-2" />
          {copied ? "Copied!" : "Copy processed"}
        </Button>
        <Link href={getReprocessLink()}>
          <Button variant="outline">
            <RotateCcw className="size-4 mr-2" />
            Re-process
          </Button>
        </Link>
        <Button variant="outline" className="text-destructive hover:text-destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {ALL_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={doc.tags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Folder</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Input
            placeholder={doc.folder ?? "Enter folder name..."}
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="h-9 max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={handleSetFolder}>
            <Save className="size-4 mr-1" />
            {doc.folder ? "Change" : "Set"}
          </Button>
          {doc.folder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateDocument(doc.id, { folder: null })}
            >
              Remove
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
