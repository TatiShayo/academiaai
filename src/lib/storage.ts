import { sanitizeForExport, sanitizeMarkdownExport } from "./prompt-sanitizer";

export type DocumentTool =
  | "Humanizer"
  | "Academic Enhancer"
  | "Plagiarism Scanner"
  | "Citation Generator"
  | "Syllabus Organizer"
  | "Quiz Generator";

export type DocumentStatus = "draft" | "processing" | "completed" | "archived";

export interface DocumentVersion {
  versionId: string;
  processedText: string;
  wordCount: number;
  createdAt: string;
  changeNote?: string;
}

export interface SavedDocument {
  id: string;
  title: string;
  tool: DocumentTool;
  originalText?: string;
  processedText?: string;
  metadata?: unknown;
  wordCount: number;
  createdAt: string;
  updatedAt?: string;
  status?: DocumentStatus;
  tags?: string[];
  folder?: string | null;
  versions?: DocumentVersion[];
}

export interface ActivityLog {
  id: string;
  tool: string;
  action: string;
  timestamp: string;
  details: string;
}

const DOCUMENTS_KEY = "academiaai_documents";
const LOGS_KEY = "academiaai_activity_logs";

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(DOCUMENTS_KEY);
  if (!data) return getMockDocuments();
  try {
    return JSON.parse(data);
  } catch {
    return getMockDocuments();
  }
}

export function saveDocument(
  doc: Omit<SavedDocument, "createdAt" | "id"> & { id?: string; createdAt?: string; updatedAt?: string }
): SavedDocument {
  const docs = getSavedDocuments();
  const now = new Date().toISOString();
  const docId = doc.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9));

  const existingIndex = docs.findIndex((d) => d.id === docId);
  let newDoc: SavedDocument;

  if (existingIndex > -1) {
    const existing = docs[existingIndex];
    const newVersion: DocumentVersion | null =
      existing.processedText && existing.processedText !== doc.processedText
        ? {
            versionId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            processedText: existing.processedText,
            wordCount: existing.wordCount,
            createdAt: existing.updatedAt || existing.createdAt,
            changeNote: `Revision prior to ${now}`,
          }
        : null;

    const existingVersions = existing.versions || [];
    const versions = newVersion ? [newVersion, ...existingVersions] : existingVersions;

    newDoc = {
      ...existing,
      ...doc,
      id: docId,
      createdAt: existing.createdAt,
      updatedAt: now,
      tags: doc.tags ?? existing.tags ?? [],
      folder: doc.folder !== undefined ? doc.folder : existing.folder ?? null,
      status: doc.status ?? existing.status ?? "completed",
      versions,
    };
    docs[existingIndex] = newDoc;
  } else {
    newDoc = {
      ...doc,
      id: docId,
      createdAt: doc.createdAt || now,
      updatedAt: now,
      tags: doc.tags ?? [],
      folder: doc.folder ?? null,
      status: doc.status ?? "completed",
      versions: doc.versions ?? [],
    };
    docs.unshift(newDoc);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
  }

  addActivityLog(newDoc.tool, `Saved document: ${newDoc.title}`, `${newDoc.wordCount} words`);

  return newDoc;
}

export function deleteDocument(id: string): void {
  const docs = getSavedDocuments();
  const filtered = docs.filter((d) => d.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
  }
}

export function restoreDocumentVersion(documentId: string, versionId: string): SavedDocument | null {
  const docs = getSavedDocuments();
  const doc = docs.find((d) => d.id === documentId);
  if (!doc || !doc.versions) return null;

  const version = doc.versions.find((v) => v.versionId === versionId);
  if (!version) return null;

  return saveDocument({
    ...doc,
    processedText: version.processedText,
    wordCount: version.wordCount,
  });
}

export function duplicateDocument(id: string): SavedDocument | null {
  const docs = getSavedDocuments();
  const doc = docs.find((d) => d.id === id);
  if (!doc) return null;

  return saveDocument({
    ...doc,
    id: undefined,
    title: `${doc.title} (Copy)`,
    createdAt: new Date().toISOString(),
    versions: [],
  });
}

export function exportDocumentContent(
  doc: SavedDocument,
  format: "txt" | "md" | "json"
): { content: string; mimeType: string; fileName: string } {
  const safeTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, "_");

  switch (format) {
    case "json":
      return {
        content: JSON.stringify(doc, null, 2),
        mimeType: "application/json",
        fileName: `${safeTitle}.json`,
      };
    case "md": {
      const rawMd = `# ${doc.title}\n\n**Tool**: ${doc.tool}\n**Created**: ${doc.createdAt}\n**Word Count**: ${doc.wordCount}\n\n---\n\n## Content\n\n${doc.processedText || doc.originalText || ""}\n`;
      return {
        content: sanitizeMarkdownExport(rawMd),
        mimeType: "text/markdown",
        fileName: `${safeTitle}.md`,
      };
    }
    case "txt":
    default:
      return {
        content: sanitizeForExport(doc.processedText || doc.originalText || ""),
        mimeType: "text/plain",
        fileName: `${safeTitle}.txt`,
      };
  }
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) return getMockLogs();
  try {
    return JSON.parse(data);
  } catch {
    return getMockLogs();
  }
}

export function addActivityLog(tool: string, action: string, details: string): void {
  if (typeof window === "undefined") return;
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    tool,
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  logs.unshift(newLog);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
}

export function getDraft<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const data = localStorage.getItem(`academiaai_draft_${key}`);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function setDraft(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`academiaai_draft_${key}`, JSON.stringify(value));
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`academiaai_draft_${key}`);
}

function getMockDocuments(): SavedDocument[] {
  return [
    {
      id: "doc-1",
      title: "Quantum Mechanics Final Draft",
      tool: "Humanizer",
      originalText: "It is observed that quantum entanglement exhibits non-local properties where the spin state of electron A is directly correlated with electron B.",
      processedText: "When studying quantum entanglement, we see these unusual non-local connections. Specifically, the spin of one electron immediately tells us the spin of the other, no matter the distance.",
      wordCount: 154,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: "completed",
      tags: ["physics", "quantum"],
      folder: "Physics 101",
      versions: [],
    },
    {
      id: "doc-2",
      title: "Neural Networks Literature Review",
      tool: "Academic Enhancer",
      originalText: "Neural networks are really good at finding patterns in huge datasets. We use them for images and translation because they work well.",
      processedText: "Artificial neural networks demonstrate exceptional efficacy in high-dimensional feature extraction across vast datasets. Consequently, they have become the standard paradigm for computer vision and machine translation tasks.",
      wordCount: 320,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      metadata: { level: "Master's" },
      status: "completed",
      tags: ["AI", "CS"],
      folder: "Research",
      versions: [],
    },
    {
      id: "doc-3",
      title: "Macroeconomics Term Paper (Draft)",
      tool: "Plagiarism Scanner",
      originalText: "Inflation is a general increase in prices and fall in the purchasing value of money.",
      processedText: "Inflation is a general increase in prices and fall in the purchasing value of money.",
      wordCount: 88,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      metadata: { riskScore: 78, flaggedCount: 1 },
      status: "completed",
      tags: ["economics"],
      folder: null,
      versions: [],
    },
  ];
}

function getMockLogs(): ActivityLog[] {
  return [
    {
      id: "log-1",
      tool: "Humanizer",
      action: "Humanized essay text",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: "Level: Balanced | AI Score reduced from 84% to 12%",
    },
    {
      id: "log-2",
      tool: "Academic Enhancer",
      action: "Enhanced thesis abstract",
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      details: "Level: PhD | Improved academic tone and syntax flow",
    },
    {
      id: "log-3",
      tool: "Plagiarism Scanner",
      action: "Scanned economics draft",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      details: "Risk score: 18% (Low risk) | 2 minor citations recommended",
    },
  ];
}
