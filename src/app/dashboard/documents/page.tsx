"use client";

import { useDocuments } from "@/lib/documents-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileText, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const { documents, deleteDocument } = useDocuments();

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Your saved processed documents.
        </p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="size-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No saved documents yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Process a document using any tool and save it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="size-5 text-muted-foreground" />
                  <div>
                    <Link href={`/dashboard/documents/${doc.id}`} className="font-medium hover:underline">
                      {doc.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{doc.tool}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.wordCount} words</span>
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
