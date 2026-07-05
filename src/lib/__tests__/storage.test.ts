import { beforeEach, describe, expect, it, vi } from 'vitest';
import { 
  getSavedDocuments, 
  saveDocument, 
  deleteDocument, 
  getActivityLogs, 
  addActivityLog 
} from '../storage';

// In-memory store to simulate localStorage
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value.toString();
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    for (const key in store) {
      delete store[key];
    }
  }),
};

// Stub globals for the Node test environment
vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', localStorageMock);

describe('storage utility library', () => {
  beforeEach(() => {
    // Clear the store and reset mock call history before each test
    for (const key in store) {
      delete store[key];
    }
    vi.clearAllMocks();
  });

  describe('getSavedDocuments', () => {
    it('should return mock documents when localStorage is empty', () => {
      const docs = getSavedDocuments();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('academiaai_documents');
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].id).toBe('doc-1');
    });

    it('should return stored documents when they exist in localStorage', () => {
      const testDocs = [
        { id: 'doc-test', title: 'Test Document', tool: 'Humanizer' as const, wordCount: 10, createdAt: new Date().toISOString() }
      ];
      store['academiaai_documents'] = JSON.stringify(testDocs);

      const docs = getSavedDocuments();
      expect(docs).toEqual(testDocs);
    });

    it('should return mock documents and not crash when localStorage contains invalid JSON', () => {
      store['academiaai_documents'] = 'invalid-json';
      const docs = getSavedDocuments();
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].id).toBe('doc-1');
    });
  });

  describe('saveDocument', () => {
    it('should create a new document with generated ID and timestamp and store it', () => {
      const newDoc = {
        title: 'New Essay',
        tool: 'Humanizer' as const,
        wordCount: 120,
        originalText: 'Original text here',
        processedText: 'Processed text here'
      };

      const saved = saveDocument(newDoc);

      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
      expect(saved.title).toBe('New Essay');

      // Verify it was prepended to the saved documents list in localStorage
      const storedData = JSON.parse(store['academiaai_documents']);
      expect(storedData[0].id).toBe(saved.id);
      expect(storedData[0].title).toBe('New Essay');
    });

    it('should update an existing document if ID matches', () => {
      const existingDoc = {
        id: 'doc-existing',
        title: 'Old Title',
        tool: 'Humanizer' as const,
        wordCount: 50,
        createdAt: new Date().toISOString()
      };
      store['academiaai_documents'] = JSON.stringify([existingDoc]);

      const updatedDoc = {
        ...existingDoc,
        title: 'Updated Title',
        wordCount: 60
      };

      const saved = saveDocument(updatedDoc);
      expect(saved.id).toBe('doc-existing');
      expect(saved.title).toBe('Updated Title');

      const storedData = JSON.parse(store['academiaai_documents']);
      expect(storedData.length).toBe(1);
      expect(storedData[0].title).toBe('Updated Title');
    });

    it('should add an activity log when saving a document', () => {
      const newDoc = {
        title: 'Activity Test Doc',
        tool: 'Plagiarism Scanner' as const,
        wordCount: 150
      };

      saveDocument(newDoc);

      const logs = JSON.parse(store['academiaai_activity_logs'] || '[]');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].tool).toBe('Plagiarism Scanner');
      expect(logs[0].action).toBe('Saved document: Activity Test Doc');
      expect(logs[0].details).toBe('150 words');
    });
  });

  describe('deleteDocument', () => {
    it('should remove the document with the given ID from localStorage', () => {
      const doc1 = { id: 'doc-1', title: 'Doc 1', tool: 'Humanizer' as const, wordCount: 5, createdAt: new Date().toISOString() };
      const doc2 = { id: 'doc-2', title: 'Doc 2', tool: 'Humanizer' as const, wordCount: 5, createdAt: new Date().toISOString() };
      store['academiaai_documents'] = JSON.stringify([doc1, doc2]);

      deleteDocument('doc-1');

      const storedData = JSON.parse(store['academiaai_documents']);
      expect(storedData.length).toBe(1);
      expect(storedData[0].id).toBe('doc-2');
    });
  });

  describe('getActivityLogs and addActivityLog', () => {
    it('should return mock logs when localStorage is empty', () => {
      const logs = getActivityLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].id).toBe('log-1');
    });

    it('should add a log and cap at 50 logs', () => {
      // Seed with 50 mock logs
      const initialLogs = Array.from({ length: 50 }, (_, i) => ({
        id: `log-${i}`,
        tool: 'Humanizer',
        action: `Action ${i}`,
        timestamp: new Date().toISOString(),
        details: `Details ${i}`
      }));
      store['academiaai_activity_logs'] = JSON.stringify(initialLogs);

      // Add one more
      addActivityLog('Academic Enhancer', 'Enhanced text', 'PhD level');

      const logs = getActivityLogs();
      expect(logs.length).toBe(50); // capped at 50
      expect(logs[0].tool).toBe('Academic Enhancer');
      expect(logs[0].action).toBe('Enhanced text');
      expect(logs[0].details).toBe('PhD level');
      // The last one of the initial list should have been dropped
      expect(logs.find(l => l.id === 'log-49')).toBeUndefined();
    });
  });
});
