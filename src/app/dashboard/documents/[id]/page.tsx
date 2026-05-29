"use client";

import { useDocuments, type SavedDocument } from "@/lib/documents-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getDocument, deleteDocument } = useDocuments();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

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
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{doc.tool}</Badge>
            <span className="text-sm text-muted-foreground">{doc.wordCount} words</span>
            <span className="text-sm text-muted-foreground">
              {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Original</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {doc.original}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {doc.processed}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
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
    </div>
  );
}
