'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSavedDocuments, deleteDocument, SavedDocument } from '../../../lib/storage';

export default function DocumentsLibraryPage() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('All');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDocs(getSavedDocuments());
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved document?')) {
      deleteDocument(id);
      setDocs(getSavedDocuments());
    }
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#111118] border border-[#1e1e2e] rounded-lg w-1/3" />
        <div className="h-12 bg-[#111118] border border-[#1e1e2e] rounded-lg" />
        <div className="space-y-4">
          <div className="h-20 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
          <div className="h-20 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
        </div>
      </div>
    );
  }

  // Filter lists
  const toolOptions = [
    'All',
    'Humanizer',
    'Academic Enhancer',
    'Plagiarism Scanner',
    'Citation Generator',
    'Syllabus Organizer',
    'Quiz Generator',
  ];

  // Filtering logic
  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.originalText && d.originalText.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.processedText && d.processedText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTool = selectedToolFilter === 'All' || d.tool === selectedToolFilter;

    return matchesSearch && matchesTool;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Saved Library</h1>
        <p className="text-sm text-slate-400 mt-0.5">Browse, search, and manage your archived research outputs and drafts.</p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#111118] border border-[#1e1e2e] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or text content..."
            className="w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6366f1] font-sans"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter dropdown / selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono uppercase whitespace-nowrap">Filter:</span>
          <select
            value={selectedToolFilter}
            onChange={(e) => setSelectedToolFilter(e.target.value)}
            className="bg-[#09090f] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-300 focus:outline-none focus:border-[#6366f1] font-mono cursor-pointer"
          >
            {toolOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-[#111118] font-sans">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-12 text-center text-slate-500">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm font-medium text-slate-400">No matching documents found</p>
          <p className="text-xs text-slate-600 mt-1">Try refining your search query or tool filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => (
            <Link
              key={doc.id}
              href={`/dashboard/documents/${doc.id}`}
              className="bg-[#111118] border border-[#1e1e2e] p-5 rounded-xl hover:border-[#6366f1]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Info columns */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[#6366f1] font-mono text-[9px] font-bold uppercase tracking-tight whitespace-nowrap">
                    {doc.tool}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-[#6366f1] transition-colors truncate">
                  {doc.title}
                </h3>
                {doc.originalText && (
                  <p className="text-xs text-slate-400 truncate max-w-xl">
                    {doc.originalText}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0 justify-end">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Word Count</span>
                  <span className="text-xs font-semibold text-slate-300 font-mono block mt-0.5">
                    {doc.wordCount} words
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-2 border border-[#1e1e2e] hover:border-red-500/30 bg-[#09090f] rounded-lg text-slate-400 hover:text-red-400 transition-all"
                    title="Delete document"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div className="p-2 border border-[#1e1e2e] bg-[#09090f] rounded-lg text-slate-400 group-hover:text-white group-hover:border-[#6366f1]/40 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
