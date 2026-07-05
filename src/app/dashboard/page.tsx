'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSavedDocuments, getActivityLogs, SavedDocument, ActivityLog } from '../../lib/storage';

export default function DashboardHome() {
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDocs(getSavedDocuments());
      setLogs(getActivityLogs());
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-[#111118] border border-[#1e1e2e] rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
          <div className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
          <div className="h-32 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
        </div>
        <div className="h-64 bg-[#111118] border border-[#1e1e2e] rounded-xl" />
      </div>
    );
  }

  // Calculate statistics
  const totalSavedDocs = docs.length;
  const totalWordsProcessed = docs.reduce((sum, d) => sum + d.wordCount, 0) + 12450; // Add standard baseline

  const tools = [
    {
      name: 'AI Humanizer',
      desc: 'Bypasses AI detectors and refines robotic prose into organic flow.',
      href: '/dashboard/humanize',
      color: 'from-indigo-600 to-indigo-900',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'Academic Enhancer',
      desc: 'Elevates text quality to High School, Undergraduate, Master\'s, or PhD level.',
      href: '/dashboard/enhance',
      color: 'from-[#6366f1] to-purple-900',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      name: 'Plagiarism Scanner',
      desc: 'Pinpoints similarities in sentence structures and suggests citation revisions.',
      href: '/dashboard/plagiarism',
      color: 'from-blue-600 to-blue-900',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Citation Generator',
      desc: 'Builds bibliographies in APA, MLA, Chicago, and Harvard formats in seconds.',
      href: '/dashboard/citations',
      color: 'from-teal-600 to-teal-900',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
    },
    {
      name: 'Syllabus Organizer',
      desc: 'Converts unstructured notes into week-by-week curriculum plans.',
      href: '/dashboard/syllabus',
      color: 'from-emerald-600 to-emerald-900',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      name: 'Quiz Generator',
      desc: 'Generates interactive review tests directly from source course materials.',
      href: '/dashboard/quiz',
      color: 'from-orange-600 to-orange-950',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Scholarly Dashboard
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-mono">
          Unified AI Workbench & Database Library
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Words count */}
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <svg className="w-28 h-28 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
          </div>
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Words Processed</span>
            <span className="text-3xl font-bold text-white block mt-1 tracking-tight">
              {totalWordsProcessed.toLocaleString()}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono block mt-1.5">
              +1,200 words today
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Saved documents */}
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <svg className="w-28 h-28 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
            </svg>
          </div>
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Saved Library</span>
            <span className="text-3xl font-bold text-white block mt-1 tracking-tight">
              {totalSavedDocs}
            </span>
            <Link href="/dashboard/documents" className="text-[10px] text-indigo-400 font-mono block mt-1.5 hover:underline flex items-center gap-1">
              View Catalog library
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6366f1]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </div>
        </div>

        {/* Tier status */}
        <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <svg className="w-28 h-28 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
            </svg>
          </div>
          <div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block">Account Tier</span>
            <span className="text-3xl font-bold text-emerald-400 block mt-1 tracking-tight">
              PRO
            </span>
            <span className="text-[10px] text-slate-500 font-mono block mt-1.5">
              Renewal: 2026-07-29
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid of tools */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white font-mono uppercase tracking-wider text-slate-400">
          Core Scholarly Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t) => (
            <Link
              key={t.name}
              href={t.href}
              className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#6366f1]/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-4`}>
                  {t.icon}
                </div>
                <h3 className="text-base font-semibold text-white group-hover:text-[#6366f1] transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {t.desc}
                </p>
              </div>
              <div className="text-[10px] font-mono text-[#6366f1] mt-4 flex items-center gap-1">
                Launch Workspace
                <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity logs */}
      <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 border-b border-[#1e1e2e] pb-3">
          <h2 className="text-base font-semibold text-white">Recent Activity Logs</h2>
          <span className="text-[10px] font-mono text-slate-500 uppercase">Tracked Operations</span>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No recent activity logged. Start using the tools to populate logs!
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#09090f] border border-[#1e1e2e] rounded-lg text-xs hover:border-[#6366f1]/20 transition-all">
                <div className="flex items-start gap-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[#6366f1] font-mono text-[10px] tracking-tight whitespace-nowrap shrink-0">
                    {log.tool}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{log.action}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{log.details}</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono sm:text-right shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
