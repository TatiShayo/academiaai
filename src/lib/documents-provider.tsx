"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface SavedDocument {
  id: string;
  name: string;
  original: string;
  processed: string;
  tool: string;
  wordCount: number;
  createdAt: string;
  tags: string[];
  folder: string | null;
  versions: { processed: string; wordCount: number; createdAt: string }[];
}

interface DocumentsContextType {
  documents: SavedDocument[];
  saveDocument: (doc: Omit<SavedDocument, "id" | "createdAt" | "tags" | "folder" | "versions"> & Partial<Pick<SavedDocument, "tags" | "folder" | "versions">>) => SavedDocument;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => SavedDocument | undefined;
  updateDocument: (id: string, updates: Partial<SavedDocument>) => boolean;
  reprocessDocument: (id: string, processed: string, wordCount: number) => boolean;
}

const DocumentsContext = createContext<DocumentsContextType | null>(null);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("academiaai_documents");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((d: SavedDocument) => ({
          ...d,
          tags: d.tags ?? [],
          folder: d.folder ?? null,
          versions: d.versions ?? [],
        }));
        setDocuments(migrated);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("academiaai_documents", JSON.stringify(documents));
  }, [documents]);

  const saveDocument = useCallback(
    (doc: Omit<SavedDocument, "id" | "createdAt" | "tags" | "folder" | "versions"> & Partial<Pick<SavedDocument, "tags" | "folder" | "versions">>) => {
    const name = doc.name.trim() || doc.original.trim().slice(0, 60);
    const newDoc: SavedDocument = {
      ...doc,
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      tags: doc.tags ?? [],
      folder: doc.folder ?? null,
      versions: doc.versions ?? [],
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getDocument = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  );

  const updateDocument = useCallback((id: string, updates: Partial<SavedDocument>) => {
    let found = false;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          found = true;
          return { ...d, ...updates };
        }
        return d;
      })
    );
    return found;
  }, []);

  const reprocessDocument = useCallback(
    (id: string, processed: string, wordCount: number) => {
      let found = false;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === id) {
            found = true;
            const versionEntry = {
              processed: d.processed,
              wordCount: d.wordCount,
              createdAt: d.createdAt,
            };
            return {
              ...d,
              processed,
              wordCount,
              createdAt: new Date().toISOString(),
              versions: [versionEntry, ...d.versions],
            };
          }
          return d;
        })
      );
      return found;
    },
    []
  );

  return (
    <DocumentsContext.Provider
      value={{ documents, saveDocument, deleteDocument, getDocument, updateDocument, reprocessDocument }}
    >
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
