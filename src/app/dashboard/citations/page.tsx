'use client';

import React, { useState, useEffect } from 'react';
import { getDraft, setDraft, saveDocument, addActivityLog } from '../../../lib/storage';

interface CitationFields {
  style: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
  title: string;
  author: string;
  year: string;
  publisher: string;
  url: string;
}

export default function CitationsPage() {
  const [fields, setFields] = useState<CitationFields>({
    style: 'APA',
    title: '',
    author: '',
    year: '',
    publisher: '',
    url: '',
  });
  const [generatedCitation, setGeneratedCitation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = getDraft<{
      fields: CitationFields;
      generatedCitation: string;
    }>('citations', {
      fields: {
        style: 'APA',
        title: '',
        author: '',
        year: '',
        publisher: '',
        url: '',
      },
      generatedCitation: '',
    });

    const loadTimer = setTimeout(() => {
      setFields(savedDraft.fields);
      setGeneratedCitation(savedDraft.generatedCitation);
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (fields.title || fields.author || generatedCitation) {
      setDraft('citations', { fields, generatedCitation });
      const timer = setTimeout(() => {
        setDraftSaved(true);
      }, 0);
      const timer2 = setTimeout(() => setDraftSaved(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [fields, generatedCitation]);

  const handleGenerate = async () => {
    if (!fields.title.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCitation(data.citation);
        addActivityLog('Citation Generator', `Generated citation in ${fields.style} style`, fields.title);
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCitation) return;
    navigator.clipboard.writeText(generatedCitation);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveDoc = () => {
    if (!generatedCitation.trim()) return;
    const title = saveTitle.trim() || `Citation - ${fields.title || 'Source Reference'}`;
    
    saveDocument({
      title,
      tool: 'Citation Generator',
      originalText: `Source detail:\nTitle: ${fields.title}\nAuthor: ${fields.author}\nYear: ${fields.year}\nPublisher: ${fields.publisher}\nURL: ${fields.url}`,
      processedText: generatedCitation,
      wordCount: generatedCitation.split(/\s+/).filter(Boolean).length,
      metadata: { style: fields.style, fields }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setSaveTitle('');
    }, 1500);
  };

  const handleFieldChange = (key: keyof CitationFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Citation Generator</h1>
          <p className="text-sm text-slate-400 mt-0.5">Generates properly structured bibliographical references for essays and reviews.</p>
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

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fields configuration - Left */}
        <div className="lg:col-span-7 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[520px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Metadata Form</span>

          {/* Form items */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Style tabs */}
            <div>
              <label className="text-[11px] text-slate-500 font-mono uppercase block mb-2">Bibliography Style</label>
              <div className="flex gap-1.5">
                {(['APA', 'MLA', 'Chicago', 'Harvard'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFieldChange('style', s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition-all ${
                      fields.style === s
                        ? 'bg-[#6366f1] text-white'
                        : 'border border-[#1e1e2e] bg-[#09090f] text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="text-[11px] text-slate-500 font-mono uppercase block mb-1.5">Source Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={fields.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. The Theory of Moral Sentiments"
                className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#6366f1] font-sans"
              />
            </div>

            {/* Authors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-mono uppercase block mb-1.5">Author / Editor</label>
                <input
                  type="text"
                  value={fields.author}
                  onChange={(e) => handleFieldChange('author', e.target.value)}
                  placeholder="e.g. Smith, Adam"
                  className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#6366f1] font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-mono uppercase block mb-1.5">Year of Publication</label>
                <input
                  type="text"
                  value={fields.year}
                  onChange={(e) => handleFieldChange('year', e.target.value)}
                  placeholder="e.g. 1759"
                  className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#6366f1] font-sans"
                />
              </div>
            </div>

            {/* Publisher / URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-mono uppercase block mb-1.5">Publisher / Journal</label>
                <input
                  type="text"
                  value={fields.publisher}
                  onChange={(e) => handleFieldChange('publisher', e.target.value)}
                  placeholder="e.g. Millar & Kincaid"
                  className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#6366f1] font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-mono uppercase block mb-1.5">Resource URL</label>
                <input
                  type="text"
                  value={fields.url}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  placeholder="e.g. https://domain.edu/moral-sentiments"
                  className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-3 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-[#6366f1] font-sans"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !fields.title.trim()}
              className="px-6 py-3 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Compiling...
                </>
              ) : (
                <>
                  Generate Citation
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output rendering - Right */}
        <div className="lg:col-span-5 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[520px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Compiled Citation</span>
          
          <div className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-5 flex items-center justify-center text-center">
            {generatedCitation ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-100 font-mono italic select-text p-4 bg-[#111118]/80 border border-[#1e1e2e] rounded-lg leading-relaxed max-w-sm mx-auto shadow-sm">
                  &quot;{generatedCitation}&quot;
                </p>
                <div className="inline-flex gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-[#6366f1]/20 text-[#6366f1] uppercase">
                    Style: {fields.style}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-600 text-xs py-12 flex flex-col items-center">
                <div className="w-12 h-12 rounded-lg bg-[#09090f] border border-[#1e1e2e] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <p className="max-w-[200px]">Fill in the metadata form and generate to view formatted reference structures.</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500 font-mono">Academic citation compiled</span>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!generatedCitation}
                className="px-3.5 py-2 rounded-lg border border-[#1e1e2e] bg-[#111118] text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
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
                disabled={!generatedCitation}
                className="px-3.5 py-2 rounded-lg bg-indigo-500/10 border border-[#6366f1]/20 text-[#6366f1] hover:bg-[#6366f1] hover:text-white transition-all text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
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
          <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <h3 className="text-base font-semibold text-white mb-2">Save Citation Reference</h3>
            <p className="text-xs text-slate-400 mb-4">Title this citation entry inside your saved document database.</p>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Adam Smith (1759) Citation"
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
                  'Save Reference'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
