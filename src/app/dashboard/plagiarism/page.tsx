'use client';

import React, { useState, useEffect } from 'react';
import { getDraft, setDraft, saveDocument, addActivityLog } from '../../../lib/storage';

interface FlaggedSentence {
  sentence: string;
  risk: 'High' | 'Medium';
  explanation: string;
  suggestion: string;
}

export default function PlagiarismScannerPage() {
  const [inputText, setInputText] = useState('');
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [flaggedSentences, setFlaggedSentences] = useState<FlaggedSentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [selectedFlagIdx, setSelectedFlagIdx] = useState<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = getDraft<{
      inputText: string;
      riskScore: number | null;
      flaggedSentences: FlaggedSentence[];
    }>('plagiarism', {
      inputText: '',
      riskScore: null,
      flaggedSentences: [],
    });

    const loadTimer = setTimeout(() => {
      setInputText(savedDraft.inputText);
      setRiskScore(savedDraft.riskScore);
      setFlaggedSentences(savedDraft.flaggedSentences);
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (inputText) {
      setDraft('plagiarism', { inputText, riskScore, flaggedSentences });
      const timer = setTimeout(() => {
        setDraftSaved(true);
      }, 0);
      const timer2 = setTimeout(() => setDraftSaved(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [inputText, riskScore, flaggedSentences]);

  const handleScan = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setSelectedFlagIdx(null);
    try {
      const res = await fetch('/api/tools/plagiarism-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (res.ok) {
        setRiskScore(data.riskScore);
        setFlaggedSentences(data.flaggedSentences);
        addActivityLog('Plagiarism Scanner', 'Scanned text for citation risk', `Risk Score: ${data.riskScore}% | Flagged: ${data.flaggedSentences.length} items`);
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during scan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDoc = () => {
    if (!inputText.trim()) return;
    const title = saveTitle.trim() || `Plagiarism Scan - ${new Date().toLocaleDateString()}`;
    const wordCount = inputText.split(/\s+/).filter(Boolean).length;
    
    saveDocument({
      title,
      tool: 'Plagiarism Scanner',
      originalText: inputText,
      processedText: `Risk Score: ${riskScore}%\nFlagged Sentences: ${flaggedSentences.length}`,
      wordCount,
      metadata: { riskScore, flaggedSentences }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setSaveTitle('');
    }, 1500);
  };

  // Helper to render text with highlighted flagged sentences
  const renderHighlightedText = () => {
    if (flaggedSentences.length === 0) return <p className="leading-relaxed">{inputText}</p>;

    const text = inputText;
    // Map of flagged sentences to highlight styling
    const highlights = flaggedSentences.map((fs, idx) => {
      return {
        sentence: fs.sentence,
        idx,
        risk: fs.risk
      };
    });

    // We can split the text by the flagged sentences. To prevent regex issues, we can just look up sentences.
    // For safety, let's render standard segments.
    // If we split by sentence, we can render each sentence as a styled inline element.
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    return (
      <div className="leading-relaxed whitespace-pre-wrap select-text">
        {sentences.map((sentence, idx) => {
          const trimmed = sentence.trim();
          const match = highlights.find(h => trimmed.includes(h.sentence) || h.sentence.includes(trimmed));
          
          if (match) {
            const isSelected = selectedFlagIdx === match.idx;
            const bgClass = match.risk === 'High' 
              ? isSelected ? 'bg-red-500/35 border-b-2 border-red-500 text-white cursor-pointer' : 'bg-red-500/15 border-b border-red-500/50 cursor-pointer hover:bg-red-500/25'
              : isSelected ? 'bg-amber-500/35 border-b-2 border-amber-500 text-white cursor-pointer' : 'bg-amber-500/15 border-b border-amber-500/50 cursor-pointer hover:bg-amber-500/25';
            
            return (
              <span
                key={idx}
                onClick={() => setSelectedFlagIdx(match.idx)}
                className={`px-1 rounded-sm transition-all duration-200 ${bgClass}`}
                title={`Click to view ${match.risk} Risk explanation`}
              >
                {sentence}
              </span>
            );
          }
          return <span key={idx}>{sentence}</span>;
        })}
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score < 15) return 'text-emerald-400';
    if (score < 45) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Plagiarism Risk Scanner</h1>
          <p className="text-sm text-slate-400 mt-0.5">Identifies verbatim structures and syntax trends matching pre-published papers.</p>
        </div>
        {/* Autosave Badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono transition-all duration-300 ${
          draftSaved 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-100'
            : 'bg-[#111118] border-[#1e1e2e] text-slate-500 opacity-80'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${draftSaved ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          {draftSaved ? 'Draft saved' : 'Synced'}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Editor or Scanned View */}
        <div className="lg:col-span-7 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[560px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              {riskScore !== null ? 'Scanned Document Report' : 'Source Document Input'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {inputText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {riskScore !== null ? (
            <div className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-5 text-sm text-slate-300 overflow-y-auto font-sans leading-relaxed">
              {renderHighlightedText()}
            </div>
          ) : (
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the research content, term paper chapter, or draft essay you wish to scan..."
              className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6366f1] resize-none font-sans leading-relaxed"
            />
          )}

          {/* Controls Footer */}
          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex items-center justify-between gap-4">
            <div>
              {riskScore !== null && (
                <button
                  onClick={() => {
                    setRiskScore(null);
                    setFlaggedSentences([]);
                    setSelectedFlagIdx(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-[#1e1e2e] bg-[#111118] text-xs font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Edit Text Again
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {riskScore !== null && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-4 py-2.5 rounded-lg bg-indigo-500/10 border border-[#6366f1]/20 text-[#6366f1] hover:bg-[#6366f1] hover:text-white transition-all text-xs font-semibold"
                >
                  Save Report
                </button>
              )}
              {riskScore === null && (
                <button
                  onClick={handleScan}
                  disabled={isLoading || !inputText.trim()}
                  className="px-6 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Scanning...
                    </>
                  ) : (
                    <>
                      Scan Plagiarism Risk
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Risk Report Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Risk Score Gauge */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Integrity Index</span>
            
            {riskScore !== null ? (
              <div className="space-y-4 w-full">
                {/* Radial metric representation */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="#09090f"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke={riskScore < 15 ? '#34d399' : riskScore < 45 ? '#fbbf24' : '#f87171'}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 60}
                      strokeDashoffset={2 * Math.PI * 60 * (1 - riskScore / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(riskScore)}`}>
                      {riskScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Similarity</span>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-semibold text-white">
                    {riskScore < 15 ? 'Excellent Originality' : riskScore < 45 ? 'Moderate Similarity Risk' : 'High Overlap Flagged'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    {riskScore < 15 
                      ? 'The manuscript displays excellent syntactical independence from published indices.' 
                      : riskScore < 45 
                      ? 'Several clauses share syntactical patterns with public theses. Double check citation references.' 
                      : 'Severe verbatim overlap detected. Rephrase flagged clauses to preserve academic integrity.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#1e1e2e] flex items-center justify-center text-slate-600 mb-4 animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 max-w-[200px]">Submit text to activate integrity index verification scans.</p>
              </div>
            )}
          </div>

          {/* Collapsible/List of flagged items */}
          <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex-1 overflow-y-auto max-h-[300px]">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono block mb-4">
              Overlap Details ({flaggedSentences.length})
            </span>

            {riskScore !== null && flaggedSentences.length === 0 && (
              <div className="text-center py-8 text-emerald-400 text-xs font-mono flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No citation violations flagged!
              </div>
            )}

            {riskScore === null && (
              <div className="text-center py-8 text-slate-600 text-xs">
                Scan summary details will appear here.
              </div>
            )}

            {riskScore !== null && flaggedSentences.length > 0 && (
              <div className="space-y-3">
                {flaggedSentences.map((fs, idx) => {
                  const isSelected = selectedFlagIdx === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedFlagIdx(isSelected ? null : idx)}
                      className={`p-3 bg-[#09090f] border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? fs.risk === 'High' ? 'border-red-500' : 'border-amber-500'
                          : 'border-[#1e1e2e] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          fs.risk === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {fs.risk} Similarity
                        </span>
                        <svg className={`w-3.5 h-3.5 text-slate-500 transform transition-transform ${isSelected ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 italic">&quot;{fs.sentence}&quot;</p>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#1e1e2e] space-y-2 text-[11px] animate-fade-in">
                          <div>
                            <span className="font-mono text-slate-500 block uppercase">Source Match:</span>
                            <p className="text-slate-300 font-sans mt-0.5 leading-relaxed">{fs.explanation}</p>
                          </div>
                          <div>
                            <span className="font-mono text-[#6366f1] block uppercase">Suggestion:</span>
                            <p className="text-slate-300 font-sans mt-0.5 leading-relaxed">{fs.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <h3 className="text-base font-semibold text-white mb-2">Save Integrity Report</h3>
            <p className="text-xs text-slate-400 mb-4">Name this scanned document to include it inside the library archives.</p>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Physics Quantum Mechanics Review Scan"
              className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6366f1] mb-5 font-sans"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveDoc();
              }}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveTitle('');
                }}
                className="px-4 py-2 border border-[#1e1e2e] bg-[#111118] hover:bg-[#1a1a26] text-slate-400 hover:text-white rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDoc}
                disabled={saveSuccess}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:bg-emerald-500"
              >
                {saveSuccess ? (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Saved Successfully
                  </>
                ) : (
                  'Save Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
