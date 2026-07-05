'use client';

import React, { useState, useEffect } from 'react';
import { getDraft, setDraft, saveDocument, addActivityLog } from '../../../lib/storage';

interface SyllabusWeek {
  week: number;
  topic: string;
  readings: string[];
  objectives: string[];
  assignments: string[];
}

interface SyllabusData {
  courseTitle: string;
  description: string;
  weeks: SyllabusWeek[];
}

export default function SyllabusOrganizerPage() {
  const [inputText, setInputText] = useState('');
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [editingWeekIdx, setEditingWeekIdx] = useState<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = getDraft<{
      inputText: string;
      syllabus: SyllabusData | null;
    }>('syllabus', {
      inputText: '',
      syllabus: null,
    });

    const loadTimer = setTimeout(() => {
      setInputText(savedDraft.inputText);
      setSyllabus(savedDraft.syllabus);
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (inputText || syllabus) {
      setDraft('syllabus', { inputText, syllabus });
      const timer = setTimeout(() => {
        setDraftSaved(true);
      }, 0);
      const timer2 = setTimeout(() => setDraftSaved(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [inputText, syllabus]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyllabus(data);
        addActivityLog('Syllabus Organizer', 'Generated academic syllabus outline', data.courseTitle);
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during syllabus generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDoc = () => {
    if (!syllabus) return;
    const title = saveTitle.trim() || `Syllabus - ${syllabus.courseTitle}`;
    
    // Convert syllabus object to readable text format for library catalog
    let formattedText = `# ${syllabus.courseTitle}\n\n${syllabus.description}\n\n`;
    syllabus.weeks.forEach((w) => {
      formattedText += `## Week ${w.week}: ${w.topic}\n`;
      formattedText += `### Readings:\n${w.readings.map((r) => `- ${r}`).join('\n')}\n`;
      formattedText += `### Objectives:\n${w.objectives.map((o) => `- ${o}`).join('\n')}\n`;
      formattedText += `### Assignments:\n${w.assignments.map((a) => `- ${a}`).join('\n')}\n\n`;
    });

    saveDocument({
      title,
      tool: 'Syllabus Organizer',
      originalText: inputText,
      processedText: formattedText,
      wordCount: formattedText.split(/\s+/).filter(Boolean).length,
      metadata: { syllabus }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setSaveTitle('');
    }, 1500);
  };

  const handleExportMarkdown = () => {
    if (!syllabus) return;
    let md = `# ${syllabus.courseTitle}\n\n${syllabus.description}\n\n`;
    syllabus.weeks.forEach((w) => {
      md += `## Week ${w.week}: ${w.topic}\n\n`;
      md += `### Core Readings\n`;
      w.readings.forEach(r => { md += `- ${r}\n`; });
      md += `\n### Learning Objectives\n`;
      w.objectives.forEach(o => { md += `- ${o}\n`; });
      md += `\n### Deliverables & Assignments\n`;
      w.assignments.forEach(a => { md += `- ${a}\n`; });
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${syllabus.courseTitle.replace(/\s+/g, '_')}_Syllabus.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Editing helper functions
  const updateWeekTopic = (weekIndex: number, newTopic: string) => {
    if (!syllabus) return;
    const newWeeks = [...syllabus.weeks];
    newWeeks[weekIndex].topic = newTopic;
    setSyllabus({ ...syllabus, weeks: newWeeks });
  };

  const updateWeekList = (weekIndex: number, key: 'readings' | 'objectives' | 'assignments', itemIndex: number, value: string) => {
    if (!syllabus) return;
    const newWeeks = [...syllabus.weeks];
    newWeeks[weekIndex][key][itemIndex] = value;
    setSyllabus({ ...syllabus, weeks: newWeeks });
  };

  const addWeekListItem = (weekIndex: number, key: 'readings' | 'objectives' | 'assignments') => {
    if (!syllabus) return;
    const newWeeks = [...syllabus.weeks];
    newWeeks[weekIndex][key].push('');
    setSyllabus({ ...syllabus, weeks: newWeeks });
  };

  const removeWeekListItem = (weekIndex: number, key: 'readings' | 'objectives' | 'assignments', itemIndex: number) => {
    if (!syllabus) return;
    const newWeeks = [...syllabus.weeks];
    newWeeks[weekIndex][key] = newWeeks[weekIndex][key].filter((_, idx) => idx !== itemIndex);
    setSyllabus({ ...syllabus, weeks: newWeeks });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Syllabus Organizer</h1>
          <p className="text-sm text-slate-400 mt-0.5">Transforms course notes and bullet points into fully structured week-by-week academic syllabus guidelines.</p>
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
        {/* Left Input Pane */}
        <div className="lg:col-span-5 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[580px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Course Notes Input</span>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw course notes, topics to cover, or a short course description (e.g. 'Course Title: Microeconomics 101. Topics: Demand-supply curve, elasticity, consumer surplus, monopoly vs oligopoly...')"
            className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#6366f1] resize-none font-sans leading-relaxed"
          />

          <div className="mt-4 pt-4 border-t border-[#1e1e2e] flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-3 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Organizing Curriculum...
                </>
              ) : (
                <>
                  Generate Course Syllabus
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output/Editor Pane */}
        <div className="lg:col-span-7 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Structured Course Plan</span>
            {syllabus && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMarkdown}
                  className="px-2.5 py-1 rounded bg-[#1e1e2e] hover:bg-[#2e2e42] border border-[#3e3e52] text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export MD File
                </button>
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-[#6366f1] border border-[#6366f1]/30 text-[10px] font-mono font-bold text-[#6366f1] hover:text-white transition-all"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 w-full bg-[#09090f] border border-[#1e1e2e] rounded-lg p-5 overflow-y-auto space-y-6">
            {syllabus ? (
              <div className="space-y-6">
                {/* Course Details */}
                <div className="border-b border-[#1e1e2e] pb-4">
                  <input
                    type="text"
                    value={syllabus.courseTitle}
                    onChange={(e) => setSyllabus({ ...syllabus, courseTitle: e.target.value })}
                    className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-[#1e1e2e] focus:border-[#6366f1] focus:outline-none w-full pb-1"
                  />
                  <textarea
                    value={syllabus.description}
                    onChange={(e) => setSyllabus({ ...syllabus, description: e.target.value })}
                    className="text-xs text-slate-400 mt-2 bg-transparent border border-transparent hover:border-[#1e1e2e] focus:border-[#6366f1] focus:outline-none w-full p-1 resize-none h-16 leading-relaxed"
                  />
                </div>

                {/* Weeks Accordion */}
                <div className="space-y-4">
                  {syllabus.weeks.map((w, wIdx) => {
                    const isEditing = editingWeekIdx === wIdx;
                    return (
                      <div key={w.week} className="border border-[#1e1e2e] rounded-xl bg-[#111118]/40 overflow-hidden">
                        {/* Accordion header */}
                        <div
                          onClick={() => setEditingWeekIdx(isEditing ? null : wIdx)}
                          className="px-4 py-3 bg-[#111118]/80 flex items-center justify-between cursor-pointer hover:bg-[#151520] transition-all"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-[#6366f1] uppercase block">Week {w.week}</span>
                            <span className="text-sm font-semibold text-white truncate block mt-0.5">{w.topic || 'Click to edit topic name...'}</span>
                          </div>
                          <svg className={`w-4 h-4 text-slate-400 transform transition-transform ${isEditing ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>

                        {/* Accordion content */}
                        {isEditing && (
                          <div className="p-4 bg-[#09090f] border-t border-[#1e1e2e] space-y-4 animate-fade-in">
                            {/* Edit Topic */}
                            <div>
                              <label className="text-[10px] text-slate-500 font-mono uppercase block mb-1">Topic Title</label>
                              <input
                                type="text"
                                value={w.topic}
                                onChange={(e) => updateWeekTopic(wIdx, e.target.value)}
                                className="w-full bg-[#111118] border border-[#1e1e2e] rounded p-2 text-xs text-white focus:outline-none focus:border-[#6366f1]"
                              />
                            </div>

                            {/* Readings List */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] text-slate-500 font-mono uppercase">Required Readings</label>
                                <button
                                  onClick={() => addWeekListItem(wIdx, 'readings')}
                                  className="text-[9px] text-[#6366f1] hover:underline font-mono"
                                >
                                  + Add Reading
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {w.readings.map((r, rIdx) => (
                                  <div key={rIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={r}
                                      onChange={(e) => updateWeekList(wIdx, 'readings', rIdx, e.target.value)}
                                      className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#6366f1]"
                                    />
                                    <button
                                      onClick={() => removeWeekListItem(wIdx, 'readings', rIdx)}
                                      className="p-1 rounded text-red-400 hover:bg-red-500/10"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Objectives List */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] text-slate-500 font-mono uppercase">Learning Objectives</label>
                                <button
                                  onClick={() => addWeekListItem(wIdx, 'objectives')}
                                  className="text-[9px] text-[#6366f1] hover:underline font-mono"
                                >
                                  + Add Objective
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {w.objectives.map((o, oIdx) => (
                                  <div key={oIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={o}
                                      onChange={(e) => updateWeekList(wIdx, 'objectives', oIdx, e.target.value)}
                                      className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#6366f1]"
                                    />
                                    <button
                                      onClick={() => removeWeekListItem(wIdx, 'objectives', oIdx)}
                                      className="p-1 rounded text-red-400 hover:bg-red-500/10"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Assignments List */}
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[10px] text-slate-500 font-mono uppercase">Assignments</label>
                                <button
                                  onClick={() => addWeekListItem(wIdx, 'assignments')}
                                  className="text-[9px] text-[#6366f1] hover:underline font-mono"
                                >
                                  + Add Assignment
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {w.assignments.map((a, aIdx) => (
                                  <div key={aIdx} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={a}
                                      onChange={(e) => updateWeekList(wIdx, 'assignments', aIdx, e.target.value)}
                                      className="flex-1 bg-[#111118] border border-[#1e1e2e] rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#6366f1]"
                                    />
                                    <button
                                      onClick={() => removeWeekListItem(wIdx, 'assignments', aIdx)}
                                      className="p-1 rounded text-red-400 hover:bg-red-500/10"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-600 text-sm py-12 flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2" />
                  </svg>
                </div>
                <p className="max-w-[240px]">Submit course raw text notes to generate structured curriculum weeks.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <h3 className="text-base font-semibold text-white mb-2">Save Syllabus</h3>
            <p className="text-xs text-slate-400 mb-4">Provide a title to archive this weekly syllabus catalog inside your library database.</p>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Advanced Calculus Course Syllabus"
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
                  'Save Syllabus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
