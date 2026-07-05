export interface SavedDocument {
  id: string;
  title: string;
  tool: 'Humanizer' | 'Academic Enhancer' | 'Plagiarism Scanner' | 'Citation Generator' | 'Syllabus Organizer' | 'Quiz Generator';
  originalText?: string;
  processedText?: string;
  metadata?: unknown;
  wordCount: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  tool: string;
  action: string;
  timestamp: string;
  details: string;
}

const DOCUMENTS_KEY = 'academiaai_documents';
const LOGS_KEY = 'academiaai_activity_logs';

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(DOCUMENTS_KEY);
  if (!data) return getMockDocuments();
  try {
    return JSON.parse(data);
  } catch {
    return getMockDocuments();
  }
}

export function saveDocument(doc: Omit<SavedDocument, 'createdAt' | 'id'> & { id?: string; createdAt?: string }): SavedDocument {
  const docs = getSavedDocuments();
  const newDoc: SavedDocument = {
    ...doc,
    id: doc.id || Math.random().toString(36).substring(2, 9),
    createdAt: doc.createdAt || new Date().toISOString(),
  };

  const existingIndex = docs.findIndex(d => d.id === newDoc.id);
  if (existingIndex > -1) {
    docs[existingIndex] = newDoc;
  } else {
    docs.unshift(newDoc);
  }

  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
  
  // Add activity log
  addActivityLog(newDoc.tool, `Saved document: ${newDoc.title}`, `${newDoc.wordCount} words`);
  
  return newDoc;
}

export function deleteDocument(id: string): void {
  const docs = getSavedDocuments();
  const filtered = docs.filter(d => d.id !== id);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(filtered));
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOGS_KEY);
  if (!data) return getMockLogs();
  try {
    return JSON.parse(data);
  } catch {
    return getMockLogs();
  }
}

export function addActivityLog(tool: string, action: string, details: string): void {
  if (typeof window === 'undefined') return;
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substring(2, 9),
    tool,
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  logs.unshift(newLog);
  // Cap at 50 logs
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
}

export function getDraft<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(`academiaai_draft_${key}`);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function setDraft(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`academiaai_draft_${key}`, JSON.stringify(value));
}

export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`academiaai_draft_${key}`);
}

// Initial mock data to populate the app on first run
function getMockDocuments(): SavedDocument[] {
  const mocks: SavedDocument[] = [
    {
      id: 'doc-1',
      title: 'Quantum Mechanics Final Draft',
      tool: 'Humanizer',
      originalText: 'It is observed that quantum entanglement exhibits non-local properties where the spin state of electron A is directly correlated with electron B.',
      processedText: 'When studying quantum entanglement, we see these unusual non-local connections. Specifically, the spin of one electron immediately tells us the spin of the other, no matter the distance.',
      wordCount: 154,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'doc-2',
      title: 'Neural Networks Literature Review',
      tool: 'Academic Enhancer',
      originalText: 'Neural networks are really good at finding patterns in huge datasets. We use them for images and translation because they work well.',
      processedText: 'Artificial neural networks demonstrate exceptional efficacy in high-dimensional feature extraction across vast datasets. Consequently, they have become the standard paradigm for computer vision and machine translation tasks.',
      wordCount: 320,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      metadata: { level: "Master's" }
    },
    {
      id: 'doc-3',
      title: 'Macroeconomics Term Paper (Draft)',
      tool: 'Plagiarism Scanner',
      originalText: 'Inflation is a general increase in prices and fall in the purchasing value of money.',
      processedText: 'Inflation is a general increase in prices and fall in the purchasing value of money.',
      wordCount: 88,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      metadata: { riskScore: 78, flaggedCount: 1 }
    }
  ];
  return mocks;
}

function getMockLogs(): ActivityLog[] {
  return [
    {
      id: 'log-1',
      tool: 'Humanizer',
      action: 'Humanized essay text',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'Level: Balanced | AI Score reduced from 84% to 12%'
    },
    {
      id: 'log-2',
      tool: 'Academic Enhancer',
      action: 'Enhanced thesis abstract',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      details: 'Level: PhD | Improved academic tone and syntax flow'
    },
    {
      id: 'log-3',
      tool: 'Plagiarism Scanner',
      action: 'Scanned economics draft',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      details: 'Risk score: 18% (Low risk) | 2 minor citations recommended'
    }
  ];
}
