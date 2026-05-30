"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }
  return n.toLocaleString();
}

export function WordCounter({ className }: { className?: string }) {
  const [target, setTarget] = useState(0);
  const [label, setLabel] = useState("words");

  const spring = useSpring(0, { stiffness: 80, damping: 20, mass: 0.5 });
  const rounded = useTransform(spring, (v) => Math.floor(v));

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        const total = data.totalWordsProcessed || 0;
        setTarget(total);
        setLabel(formatLabel(total));
        spring.set(total);
      })
      .catch(() => {});
  }, [spring]);

  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const unsub = rounded.on("change", (v) => {
      setDisplay(formatNumber(v));
    });
    return unsub;
  }, [rounded]);

  return (
    <p className={className}>
      AcademiaAI users have humanized{" "}
      <motion.span className="font-semibold tabular-nums">{display}</motion.span>{" "}
      {label} this month
    </p>
  );
}

function formatLabel(n: number): string {
  if (n >= 1_000_000) return "words";
  if (n >= 1_000) return "words";
  return n === 1 ? "word" : "words";
}
