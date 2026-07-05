'use client';

import React, { useState, useEffect } from 'react';
import { getDraft, setDraft, saveDocument, addActivityLog } from '../../../lib/storage';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function QuizGeneratorPage() {
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = getDraft<{
      inputText: string;
      questions: QuizQuestion[];
      selectedAnswers: Record<string, number>;
      isSubmitted: boolean;
      score: { correct: number; total: number } | null;
    }>('quiz', {
      inputText: '',
      questions: [],
      selectedAnswers: {},
      isSubmitted: false,
      score: null,
    });

    const loadTimer = setTimeout(() => {
      setInputText(savedDraft.inputText);
      setQuestions(savedDraft.questions);
      setSelectedAnswers(savedDraft.selectedAnswers);
      setIsSubmitted(savedDraft.isSubmitted);
      setScore(savedDraft.score);
    }, 0);

    return () => clearTimeout(loadTimer);
  }, []);

  // Autosave draft
  useEffect(() => {
    if (inputText || questions.length > 0) {
      setDraft('quiz', { inputText, questions, selectedAnswers, isSubmitted, score });
      const timer = setTimeout(() => {
        setDraftSaved(true);
      }, 0);
      const timer2 = setTimeout(() => setDraftSaved(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(timer2);
      };
    }
  }, [inputText, questions, selectedAnswers, isSubmitted, score]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setScore(null);
    try {
      const res = await fetch('/api/tools/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        addActivityLog('Quiz Generator', 'Generated multiple-choice review test', `${data.questions.length} questions compiled`);
      } else {
        alert(data.error || 'Failed to process request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during quiz generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (questions.length === 0 || isSubmitted) return;
    
    let correctCount = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setScore({ correct: correctCount, total: questions.length });
    setIsSubmitted(true);
    addActivityLog('Quiz Generator', 'Completed review test evaluation', `Score: ${correctCount}/${questions.length} (${Math.round((correctCount/questions.length)*100)}%)`);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(null);
  };

  const handleSaveDoc = () => {
    if (questions.length === 0) return;
    const title = saveTitle.trim() || `Quiz Test - ${new Date().toLocaleDateString()}`;
    
    // Save quiz in database
    let formattedText = `### Academic Quiz Evaluation\n`;
    if (score) {
      formattedText += `Evaluation Score: ${score.correct}/${score.total} (${Math.round((score.correct/score.total)*100)}%)\n\n`;
    }
    questions.forEach((q, idx) => {
      formattedText += `${idx + 1}. ${q.question}\n`;
      q.options.forEach((opt, oIdx) => {
        const isSelected = selectedAnswers[q.id] === oIdx;
        const isCorrect = q.correctAnswer === oIdx;
        formattedText += `   [${isSelected ? 'x' : ' '}] ${opt} ${isCorrect ? '(Correct)' : ''}\n`;
      });
      formattedText += `   Explanation: ${q.explanation}\n\n`;
    });

    saveDocument({
      title,
      tool: 'Quiz Generator',
      originalText: inputText,
      processedText: formattedText,
      wordCount: formattedText.split(/\s+/).filter(Boolean).length,
      metadata: { questions, selectedAnswers, score, isSubmitted }
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowSaveModal(false);
      setSaveTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Quiz Generator</h1>
          <p className="text-sm text-slate-400 mt-0.5">Creates interactive multiple-choice tests from documents to verify reading comprehension.</p>
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
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-4">Reading Material Source</span>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste raw textbook text, research paper abstract, course lecture notes, or summaries here..."
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
                  Compiling Test...
                </>
              ) : (
                <>
                  Generate Interactive Quiz
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Interactive Test Pane */}
        <div className="lg:col-span-7 bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col h-[580px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Interactive Quiz Workspace</span>
            {questions.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleResetQuiz}
                  className="px-2.5 py-1 rounded bg-[#1e1e2e] hover:bg-[#2e2e42] border border-[#3e3e52] text-[10px] font-mono font-bold text-slate-300 transition-all"
                >
                  Restart Quiz
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
            {questions.length > 0 ? (
              <div className="space-y-8">
                {/* Score Banner */}
                {isSubmitted && score && (
                  <div className="p-4 bg-indigo-500/10 border border-[#6366f1]/30 rounded-xl flex items-center justify-between animate-scale-in">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase block">Quiz Result Summary</span>
                      <span className="text-base font-semibold text-white mt-0.5 block">
                        Correct: {score.correct} out of {score.total} questions ({Math.round((score.correct / score.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#6366f1] flex items-center justify-center font-bold text-white font-mono text-sm border border-[#6366f1]/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      {Math.round((score.correct / score.total) * 100)}%
                    </div>
                  </div>
                )}

                {/* Questions List */}
                <div className="space-y-6">
                  {questions.map((q, qIdx) => {
                    const selectedIdx = selectedAnswers[q.id];

                    return (
                      <div key={q.id} className="space-y-3 p-4 bg-[#111118]/60 border border-[#1e1e2e] rounded-xl">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded bg-[#1e1e2e] flex items-center justify-center text-xs font-mono text-[#6366f1] shrink-0 font-bold mt-0.5">
                            {qIdx + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-2 pl-7.5">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = selectedIdx === oIdx;
                            const isCorrect = q.correctAnswer === oIdx;
                            
                            // Style calculation based on state
                            let optionClass = 'border-[#1e1e2e] bg-[#09090f] hover:border-slate-700';
                            let indicatorClass = 'border-slate-600';

                            if (isSelected) {
                              optionClass = 'border-[#6366f1] bg-[#6366f1]/5';
                              indicatorClass = 'border-[#6366f1] bg-[#6366f1]';
                            }

                            if (isSubmitted) {
                              if (isCorrect) {
                                optionClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                                indicatorClass = 'border-emerald-500 bg-emerald-500';
                              } else if (isSelected) {
                                optionClass = 'border-red-500 bg-red-500/10 text-red-200';
                                indicatorClass = 'border-red-500 bg-red-500';
                              } else {
                                optionClass = 'border-[#1e1e2e] bg-[#09090f] opacity-60 cursor-not-allowed';
                                indicatorClass = 'border-slate-700';
                              }
                            }

                            return (
                              <div
                                key={oIdx}
                                onClick={() => handleOptionSelect(q.id, oIdx)}
                                className={`p-3 border rounded-lg flex items-center gap-3 text-xs cursor-pointer transition-all ${optionClass}`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${indicatorClass}`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation feedback */}
                        {isSubmitted && (
                          <div className="pl-7.5 mt-3 pt-3 border-t border-[#1e1e2e] space-y-1 animate-fade-in">
                            <span className="text-[9px] font-mono text-[#6366f1] block uppercase tracking-wider">Academic Review Explanation</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit action */}
                {!isSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < questions.length}
                    className="w-full py-3 bg-[#6366f1] text-white rounded-lg hover:bg-indigo-600 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  >
                    Submit and Evaluate Quiz
                  </button>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-slate-600 text-sm py-12 flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#111118] border border-[#1e1e2e] flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                  </svg>
                </div>
                <p className="max-w-[240px]">Submit literature source material to generate interactive learning reviews.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-[#111118] border border-[#1e1e2e] p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(99,102,241,0.15)]">
            <h3 className="text-base font-semibold text-white mb-2">Save Evaluation Quiz</h3>
            <p className="text-xs text-slate-400 mb-4">Provide a name to include this interactive quiz session inside your library archive.</p>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Microeconomics Review Quiz"
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
                  'Save Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
