'use client';

import React, { useState, useEffect } from 'react';
import { getDraft, setDraft, saveDocument, addActivityLog } from '../../../lib/storage';

export default function HumanizerPage() {
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [level, setLevel] = useState<'Subtle' | 'Balanced' | 'Aggressive'>('Balanced');
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = getDraft<{ inputText: string; humanizedText: string; level: 'Subtle' | 'Balanced' | 'Aggressive'; beforeScore: number | null; afterScore: number | null }>('humanizer', {
      inputText: '',
      humanizedText: '',
      level: 'Balanced',
      beforeScore: null,
      afterScore: null,
    });

    const loadTimer = setTimeout(() => {
      setInputText(savedDraft.inputText);
      setHumanizedText(savedDraft.humanizedText);
      setLevel(savedDraft.level);
      setBeforeScore(savedDraft.beforeScore);
      setAfterScore(savedDraft.afterScore);
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // Autosave draft when input, humanized text, level, or scores change
  useEffect(() => {
    if (inputText || humanizedText) {
      setDraft('humanizer', { inputText, humanizedText, level, beforeScore, afterScore });
      const timer = setTimeout(() => {
        setDraftSaved(true);
      }, 0);
      const timer2 = setTimeout(() => setDraftSaved(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [inputText, humanizedText, level, beforeScore, afterScore]);

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, level: level.toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setHumanizedText(data.humanized);
        setBeforeScore(data.aiScoreBefore);
        setAfterScore(data.aiScoreAfter);
        addActivityLog('Humanizer', `Humanized text (${level} level)`, `AI score: ${data.aiScoreBefore}% -> ${data.aiScoreAfter}%`);
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during humanization.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!humanizedText) return;
    navigator.clipboard.writeText(humanizedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveDoc = () => {
    if (!humanizedText.trim()) return;
    const title = saveTitle.trim() || `Humanized Draft - ${new Date().toLocaleDateString()}`;
    const wordCount = humanizedText.split(/\s+/).filter(Boolean).length;
    
    saveDocument({
      title,
      tool: 'Humanizer',
      originalText: inputText,
      processedText: humanizedText,
      wordCount,
      metadata: { level, beforeScore, afterScore }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setSaveTitle('');
    }, 1500);
  };

  const wordCount = inputText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Humanizer</h1>
          <p className="text-sm text-slate-400 mt-0.5">Bypasses AI classification algorithms and produces highly natural prose.</p>
        </div>
        {/* Autosave badge */}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Original Text</span>
            <span className="text-[10px] text-slate-500 font-mono">{wordCount} words</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text draft here (e.g. ChatGPT, Claude outputs)..."
            className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6366f1] resize-none font-sans leading-relaxed"
          />
          {/* Controls */}
          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Level slider */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-mono uppercase">Humanization strength</span>
                <span className="font-semibold text-indigo-400 font-mono">{level}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={level === 'Subtle' ? 0 : level === 'Balanced' ? 1 : 2}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setLevel(val === 0 ? 'Subtle' : val === 1 ? 'Balanced' : 'Aggressive');
                  }}
                  className="w-full h-1.5 bg-[#09090f] rounded-lg appearance-none cursor-pointer accent-[#6366f1]"
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Subtle</span>
                <span>Balanced</span>
                <span>Aggressive</span>
              </div>
            </div>

            <button
              onClick={handleHumanize}
              disabled={isLoading || !inputText.trim()}
              className="sm:w-auto px-6 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Humanize Text
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[520px] relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Humanized Output</span>
            {humanizedText && (
              <span className="text-[10px] text-slate-500 font-mono">
                {humanizedText.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>
          
          <div className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-sm text-slate-200 overflow-y-auto leading-relaxed whitespace-pre-wrap select-text font-sans">
            {humanizedText ? (
              humanizedText
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 text-sm">
                Output will be generated here...
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex items-center justify-between gap-4">
            {/* Detection Meter */}
            <div className="flex-1">
              {beforeScore !== null && afterScore !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">AI Detection Score</span>
                    <span className="text-[#6366f1]">
                      {beforeScore}% → <span className="text-emerald-400 font-bold">{afterScore}%</span>
                    </span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-2 bg-[#09090f] rounded-full overflow-hidden flex">
                    <div 
                      className="bg-red-500 h-full transition-all duration-500" 
                      style={{ width: `${beforeScore}%` }} 
                    />
                    <div 
                      className="bg-emerald-400 h-full transition-all duration-500" 
                      style={{ width: `${100 - beforeScore}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Successfully reduced AI probability by {beforeScore - afterScore}%.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic font-sans py-2">
                  Ready to test AI bypass parameters.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!humanizedText}
                className="px-3.5 py-2.5 rounded-lg border border-[#1e1e2e] bg-[#111118] text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!humanizedText}
                className="px-3.5 py-2.5 rounded-lg bg-indigo-500/10 border border-[#6366f1]/20 text-[#6366f1] hover:bg-[#6366f1] hover:text-white transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.15)] animate-scale-in">
            <h3 className="text-base font-semibold text-white mb-2">Save Document to Library</h3>
            <p className="text-xs text-slate-400 mb-4">Give your humanized document a title to catalog it inside your library.</p>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Sociology Thesis Revision"
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
                  'Save Document'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
