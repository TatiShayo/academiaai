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
}

interface DocumentsContextType {
  documents: SavedDocument[];
  saveDocument: (doc: Omit<SavedDocument, "id" | "createdAt">) => SavedDocument;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => SavedDocument | undefined;
}

const DocumentsContext = createContext<DocumentsContextType | null>(null);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("academiaai_documents");
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("academiaai_documents", JSON.stringify(documents));
  }, [documents]);

  const saveDocument = useCallback((doc: Omit<SavedDocument, "id" | "createdAt">) => {
    const newDoc: SavedDocument = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
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

  return (
    <DocumentsContext.Provider value={{ documents, saveDocument, deleteDocument, getDocument }}>
      {children}
    </DocumentsContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentsProvider");
  return ctx;
}
