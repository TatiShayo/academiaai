"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/documents-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Trash2, Search, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";

const ALL_TAGS = ["Essay", "Research", "Thesis", "Report"] as const;

export default function DocumentsPage() {
  const { documents, deleteDocument } = useDocuments();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  let filtered = documents;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.original.toLowerCase().includes(q) ||
        d.processed.toLowerCase().includes(q)
    );
  }

  if (activeTag) {
    filtered = filtered.filter((d) => d.tags.includes(activeTag));
  }

  const folders = [...new Set(documents.map((d) => d.folder).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Your saved processed documents.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {ALL_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant={activeTag === tag ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
        {folders.map((folder) => (
          <Badge
            key={folder}
            variant={activeTag === folder ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setActiveTag(activeTag === folder ? null : folder!)}
          >
            {folder}
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {documents.length === 0
                ? "No saved documents yet."
                : "No documents match your search."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {documents.length === 0
                ? "Process a document using any tool and save it here."
                : "Try a different search term or tag."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <FileText className="size-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <Link href={`/dashboard/documents/${doc.id}`} className="font-medium hover:underline truncate block">
                      {doc.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{doc.tool}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.wordCount} words</span>
                      {doc.tags.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Tag className="size-3" />
                          {doc.tags.join(", ")}
                        </span>
                      )}
                      {doc.folder && (
                        <Badge variant="outline" className="text-xs">{doc.folder}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteDocument(doc.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
