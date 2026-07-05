'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSavedDocuments, SavedDocument, deleteDocument } from '../../../../lib/storage';

interface DocMetadata {
  level?: string;
  beforeScore?: number;
  afterScore?: number;
  improvements?: string[];
  riskScore?: number;
  flaggedSentences?: Array<{
    sentence: string;
    risk: 'High' | 'Medium';
    explanation: string;
    suggestion: string;
  }>;
  syllabus?: {
    courseTitle: string;
    description: string;
    weeks: Array<{
      week: number;
      topic: string;
      readings: string[];
      objectives: string[];
      assignments: string[];
    }>;
  };
  questions?: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  selectedAnswers?: Record<string, number>;
  score?: {
    correct: number;
    total: number;
  };
}

interface CustomSavedDocument extends Omit<SavedDocument, 'metadata'> {
  metadata?: DocMetadata;
}

interface DocumentDetailProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: DocumentDetailProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const docId = resolvedParams.id;

  const [doc, setDoc] = useState<CustomSavedDocument | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const metadata = doc?.metadata;

  useEffect(() => {
    const allDocs = getSavedDocuments();
    const foundDoc = allDocs.find((d) => d.id === docId);
    const timer = setTimeout(() => {
      if (foundDoc) {
        setDoc(foundDoc as CustomSavedDocument);
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [docId]);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document from the library?')) {
      deleteDocument(docId);
      router.push('/dashboard/documents');
    }
  };

  const handleCopy = () => {
    if (!doc || !doc.processedText) return;
    navigator.clipboard.writeText(doc.processedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#111118] border border-[#1e1e2e] rounded-lg w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[400px] bg-[#111118] border border-[#1e1e2e] rounded-xl" />
          <div className="h-[400px] bg-[#111118] border border-[#1e1e2e] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-12 text-center max-w-lg mx-auto">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-lg font-semibold text-white">Document Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">The document ID does not match any entry in your local library databases.</p>
        <Link
          href="/dashboard/documents"
          className="px-5 py-2.5 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-medium text-sm transition-all"
        >
          Return to Saved Library
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/documents"
            className="p-2 border border-[#1e1e2e] hover:border-slate-700 bg-[#111118] text-slate-400 hover:text-white rounded-lg transition-all"
            title="Back to library"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[#6366f1] font-mono text-[9px] font-bold uppercase tracking-tight">
                {doc.tool}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Saved {new Date(doc.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">{doc.title}</h1>
          </div>
        </div>

        {/* Delete / Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-lg border border-[#1e1e2e] bg-[#111118] text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>

          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-lg bg-[#6366f1] text-white hover:bg-indigo-600 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            {isCopied ? (
              <>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Copy Processed Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Left side details, Right side metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Texts - Split Panel (or Single depending on tool) */}
        <div className={`lg:col-span-8 space-y-6 ${doc.tool === 'Citation Generator' ? 'lg:col-span-12' : ''}`}>
          {/* Main content split */}
          {doc.tool !== 'Citation Generator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[480px]">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-3">Original Source Text</span>
                <div className="flex-1 bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-xs text-slate-400 overflow-y-auto leading-relaxed select-text font-sans">
                  {doc.originalText || <span className="italic text-slate-600">No original text saved.</span>}
                </div>
              </div>

              {/* Processed */}
              <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[480px]">
                <span className="text-[10px] font-mono font-bold text-[#6366f1] uppercase tracking-wider block mb-3">Processed Output</span>
                <div className="flex-1 bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-xs text-slate-200 overflow-y-auto leading-relaxed select-text font-sans whitespace-pre-wrap">
                  {doc.processedText || <span className="italic text-slate-600">No output text saved.</span>}
                </div>
              </div>
            </div>
          )}

          {/* Special view for Citation Generator */}
          {doc.tool === 'Citation Generator' && (
            <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-xl space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Compiled Reference Citation</span>
              <p className="text-base text-slate-200 font-mono italic p-5 bg-[#09090f] border border-[#1e1e2e] rounded-lg leading-relaxed select-text">
                &quot;{doc.processedText}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Metadata detail pane */}
        {doc.tool !== 'Citation Generator' && (
          <div className="lg:col-span-4 space-y-6">
            {/* Tool specific metadata panels */}
            {doc.tool === 'Humanizer' && metadata && (
              <div className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider block">Humanizer Metadata</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Strength Level</span>
                    <span className="text-sm font-semibold text-indigo-400 font-mono block mt-1">{metadata.level || 'Balanced'}</span>
                  </div>
                  <div className="p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Total Words</span>
                    <span className="text-sm font-semibold text-white font-mono block mt-1">{doc.wordCount}</span>
                  </div>
                </div>

                {metadata.beforeScore !== undefined && metadata.afterScore !== undefined && (
                  <div className="p-4 bg-[#09090f] border border-[#1e1e2e] rounded-lg space-y-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Integrity Bypass Check</span>
                    <div className="flex justify-between text-xs font-mono">
                      <span>Before: <span className="text-red-400 font-bold">{metadata.beforeScore}%</span></span>
                      <span>After: <span className="text-emerald-400 font-bold">{metadata.afterScore}%</span></span>
                    </div>
                    <div className="w-full h-2 bg-[#111118] rounded-full overflow-hidden flex">
                      <div className="bg-red-400 h-full" style={{ width: `${metadata.beforeScore}%` }} />
                      <div className="bg-emerald-400 h-full" style={{ width: `${100 - metadata.beforeScore}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {doc.tool === 'Academic Enhancer' && metadata && (
              <div className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider block">Enhancer Metadata</span>
                
                <div className="p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg">
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Scholarly Depth</span>
                  <span className="text-sm font-semibold text-indigo-400 font-mono block mt-1">{metadata.level || 'Undergraduate'}</span>
                </div>

                {metadata.improvements && Array.isArray(metadata.improvements) && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Rhetorical Enhancements</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {metadata.improvements.map((imp: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-[#09090f] border border-[#1e1e2e] rounded text-[11px] leading-relaxed text-slate-300">
                          {imp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {doc.tool === 'Plagiarism Scanner' && metadata && (
              <div className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider block">Plagiarism Index</span>
                
                <div className="p-4 bg-[#09090f] border border-[#1e1e2e] rounded-lg text-center space-y-2">
                  <span className="text-4xl font-extrabold text-red-400 font-mono">{metadata.riskScore || 0}%</span>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">Similarity Overlap Score</p>
                </div>

                {metadata.flaggedSentences && Array.isArray(metadata.flaggedSentences) && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Flagged Clauses ({metadata.flaggedSentences.length})</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {metadata.flaggedSentences.map((fs, idx) => (
                        <div key={idx} className="p-2.5 bg-[#09090f] border border-[#1e1e2e] rounded text-[10px] leading-relaxed space-y-1">
                          <span className="text-red-400 font-mono font-bold uppercase block">{fs.risk} Risk Clause</span>
                          <p className="text-slate-300 italic">&quot;{fs.sentence}&quot;</p>
                          <p className="text-slate-500 pt-1 border-t border-[#1e1e2e]">{fs.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {doc.tool === 'Syllabus Organizer' && metadata && metadata.syllabus && (
              <div className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider block">Curriculum Modules</span>
                
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {metadata.syllabus.weeks && metadata.syllabus.weeks.map((w) => (
                    <div key={w.week} className="p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg space-y-1">
                      <span className="text-[10px] text-[#6366f1] font-mono block">Week {w.week}</span>
                      <span className="text-xs font-semibold text-white block">{w.topic}</span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">Readings count: {w.readings?.length || 0} | Assignments: {w.assignments?.length || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.tool === 'Quiz Generator' && metadata && (
              <div className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl space-y-4">
                <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider block">Quiz Evaluation</span>
                
                {metadata.score && (
                  <div className="p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block">Grade Score</span>
                      <span className="text-sm font-semibold text-white font-mono block mt-1">{metadata.score.correct} / {metadata.score.total}</span>
                    </div>
                    <span className="text-lg font-bold text-[#6366f1] font-mono">
                      {Math.round((metadata.score.correct / metadata.score.total) * 100)}%
                    </span>
                  </div>
                )}

                {metadata.questions && Array.isArray(metadata.questions) && (
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 font-mono uppercase block">Quiz Questions ({metadata.questions.length})</span>
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {metadata.questions.map((q, idx) => {
                        const selectedAns = metadata.selectedAnswers?.[q.id];
                        const isCorrect = selectedAns === q.correctAnswer;
                        return (
                          <div key={q.id} className="p-2.5 bg-[#09090f] border border-[#1e1e2e] rounded text-[10px] leading-relaxed space-y-1">
                            <span className="text-white font-semibold">Q{idx + 1}: {q.question}</span>
                            <div className="flex gap-2 text-[9px] font-mono mt-1">
                              <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                                Selected: Option {selectedAns !== undefined ? selectedAns + 1 : 'None'}
                              </span>
                              <span className="text-slate-500">|</span>
                              <span className="text-emerald-400">Correct: Option {q.correctAnswer + 1}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
