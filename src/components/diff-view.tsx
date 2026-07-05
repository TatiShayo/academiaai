"use client";

import { useEffect, useState } from "react";
import { diffWords, type Change } from "diff";

const AI_PHRASES = [
  "furthermore",
  "in conclusion",
  "it is worth noting",
  "moreover",
  "in summary",
  "notably",
  "importantly",
  "firstly",
  "secondly",
  "thirdly",
  "lastly",
  "in light of",
  "in contrast to",
  "as a result",
  "in addition to",
  "it should be noted",
];

interface DiffViewProps {
  original: string;
  processed: string;
}

function computeDiff(original: string, processed: string): Change[] {
  return diffWords(original, processed);
}

function countChangedWords(changes: Change[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const change of changes) {
    const trimmed = change.value.trim();
    if (!trimmed) continue;
    if (change.added) {
      added += trimmed.split(/\s+/).length;
    } else if (change.removed) {
      removed += trimmed.split(/\s+/).length;
    }
  }
  return { added, removed };
}

function countAiPhrases(changes: Change[]): number {
  let count = 0;
  for (const change of changes) {
    if (!change.removed) continue;
    const lower = change.value.toLowerCase().trim();
    for (const phrase of AI_PHRASES) {
      if (lower.includes(phrase)) {
        count++;
      }
    }
  }
  return count;
}

function AnimatedWord({ children, delay }: { children: React.ReactNode; delay: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <span
      className={`inline transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </span>
  );
}

export function DiffView({ original, processed }: DiffViewProps) {
  const changes = computeDiff(original, processed);
  const { added, removed } = countChangedWords(changes);
  const aiPhrasesRemoved = countAiPhrases(changes);

  let animationIndex = 0;

  const parts = changes.map((change, i) => {
    const value = change.value;
    if (change.added) {
      const words = value.split(/(\s+)/);
      return (
        <span key={i}>
          {words.map((word, j) => {
            if (word.trim() === "") {
              return <span key={j}>{word}</span>;
            }
            const delay = animationIndex * 5;
            animationIndex++;
            return (
              <AnimatedWord key={j} delay={delay}>
                <span className="bg-indigo-200 dark:bg-indigo-900/50 rounded px-0.5">
                  {word}
                </span>
              </AnimatedWord>
            );
          })}
        </span>
      );
    }
    if (change.removed) {
      return (
        <span key={i} className="line-through text-red-500 dark:text-red-400">
          {value}
        </span>
      );
    }
    const words = value.split(/(\s+)/);
    return (
      <span key={i}>
        {words.map((word, j) => {
          if (word.trim() === "") {
            return <span key={j}>{word}</span>;
          }
          const delay = animationIndex * 5;
          animationIndex++;
          return (
            <AnimatedWord key={j} delay={delay}>
              {word}
            </AnimatedWord>
          );
        })}
      </span>
    );
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">
          {added} words humanized
        </span>
        {aiPhrasesRemoved > 0 && (
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Removed {aiPhrasesRemoved} common AI phrase{aiPhrasesRemoved !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="p-4 rounded-lg border bg-card">
        <p className="text-sm leading-relaxed">{parts}</p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-900/50 inline-block" />
        <span>Added</span>
        <span className="w-3 h-3 rounded inline-block line-through text-red-500 dark:text-red-400">
          text
        </span>
        <span>Removed</span>
      </div>
    </div>
  );
}
