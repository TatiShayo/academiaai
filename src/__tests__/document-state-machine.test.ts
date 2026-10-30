import { describe, it, expect, beforeEach } from "vitest";
import {
  saveDocument,
  getSavedDocuments,
  deleteDocument,
  restoreDocumentVersion,
  duplicateDocument,
  exportDocumentContent,
  addActivityLog,
  getActivityLogs,
  type SavedDocument,
} from "../lib/storage";

describe("Document Revision State Machine & Lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a new document with generated ID and timestamp", () => {
    const doc = saveDocument({
      title: "New AI Thesis",
      tool: "Humanizer",
      originalText: "Original text content.",
      processedText: "Humanized text content.",
      wordCount: 3,
    });

    expect(doc.id).toBeDefined();
    expect(doc.createdAt).toBeDefined();
    expect(doc.title).toBe("New AI Thesis");
    expect(doc.status).toBe("completed");
    expect(doc.versions).toEqual([]);

    const docs = getSavedDocuments();
    expect(docs.some((d) => d.id === doc.id)).toBe(true);
  });

  it("creates a version history snapshot when updating processedText", () => {
    const doc = saveDocument({
      title: "Draft 1",
      tool: "Academic Enhancer",
      originalText: "Simple words",
      processedText: "Elevated words v1",
      wordCount: 3,
    });

    const updated = saveDocument({
      ...doc,
      processedText: "Elevated words v2 (rigorous)",
      wordCount: 4,
    });

    expect(updated.id).toBe(doc.id);
    expect(updated.processedText).toBe("Elevated words v2 (rigorous)");
    expect(updated.versions).toHaveLength(1);
    expect(updated.versions![0].processedText).toBe("Elevated words v1");
    expect(updated.versions![0].wordCount).toBe(3);
  });

  it("restores a previous document version", () => {
    const doc = saveDocument({
      title: "Versioning Test",
      tool: "Humanizer",
      processedText: "Version 1 text",
      wordCount: 3,
    });

    const v2 = saveDocument({
      ...doc,
      processedText: "Version 2 text",
      wordCount: 3,
    });

    const v1Snapshot = v2.versions![0];
    expect(v1Snapshot).toBeDefined();

    const restored = restoreDocumentVersion(v2.id, v1Snapshot.versionId);
    expect(restored).not.toBeNull();
    expect(restored!.processedText).toBe("Version 1 text");
  });

  it("duplicates an existing document with a new ID", () => {
    const original = saveDocument({
      title: "Literature Review",
      tool: "Syllabus Organizer",
      processedText: "Curriculum content",
      wordCount: 2,
    });

    const duplicate = duplicateDocument(original.id);
    expect(duplicate).not.toBeNull();
    expect(duplicate!.id).not.toBe(original.id);
    expect(duplicate!.title).toBe("Literature Review (Copy)");
    expect(duplicate!.processedText).toBe("Curriculum content");
  });

  it("deletes a document completely from storage", () => {
    const doc = saveDocument({
      title: "To be deleted",
      tool: "Quiz Generator",
      wordCount: 0,
    });

    deleteDocument(doc.id);
    const remaining = getSavedDocuments();
    expect(remaining.find((d) => d.id === doc.id)).toBeUndefined();
  });

  it("exports document in json, md, and txt with sanitization", () => {
    const doc: SavedDocument = {
      id: "doc-exp",
      title: "Quantum <script>alert(1)</script>",
      tool: "Academic Enhancer",
      originalText: "Original draft",
      processedText: "Enhanced <script>evil()</script> [Link](javascript:hack())",
      wordCount: 5,
      createdAt: "2026-08-14T00:00:00.000Z",
    };

    // JSON export
    const jsonExp = exportDocumentContent(doc, "json");
    expect(jsonExp.mimeType).toBe("application/json");
    expect(JSON.parse(jsonExp.content).id).toBe("doc-exp");

    // MD export
    const mdExp = exportDocumentContent(doc, "md");
    expect(mdExp.mimeType).toBe("text/markdown");
    expect(mdExp.content).not.toContain("<script>");
    expect(mdExp.content).not.toContain("javascript:hack()");
    expect(mdExp.content).toContain("[Link](#blocked-url)");

    // TXT export
    const txtExp = exportDocumentContent(doc, "txt");
    expect(txtExp.mimeType).toBe("text/plain");
    expect(txtExp.content).not.toContain("<script>");
  });

  it("caps activity logs at 50 entries", () => {
    for (let i = 0; i < 60; i++) {
      addActivityLog("Humanizer", `Action ${i}`, `Details ${i}`);
    }

    const logs = getActivityLogs();
    expect(logs.length).toBeLessThanOrEqual(50);
  });
});
