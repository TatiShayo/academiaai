You are a senior fullstack engineer. Build AcademiaAI — an AI academic writing humanizer SaaS — in this Next.js project. YOLO MODE.

PRODUCT: AcademiaAI helps students and researchers humanize AI-generated text and enhance academic writing quality. 4 tools: Humanizer, Academic Enhancer, Plagiarism Risk Scanner, Citation Generator.

READ PLAN.md FIRST. Complete every [ ] task in order. Git commit after each.

DESIGN: Dark theme. Indigo accent #6366f1. Background #09090f. Surface #111118. Border #1e1e2e. Academic/scholarly aesthetic — clean, trustworthy, serious.

KEY IMPLEMENTATIONS:

/api/tools/humanize (POST):
  Input: {text, level: 'subtle'|'balanced'|'aggressive'}
  System prompt (subtle): "Rewrite this text to sound naturally human-written by a student. Make small vocabulary swaps, vary sentence rhythm, add minor imperfections, remove overly formal AI patterns. Preserve all meaning and academic content. Return only the rewritten text."
  System prompt (aggressive): "Completely rephrase this text so it reads as authentic student writing. Change structure, vocabulary, sentence variety significantly. Keep all facts and arguments. Sound like a real person wrote this during a late-night study session. Return only the rewritten text."
  Model: gpt-4o (not mini — quality matters here)

/api/tools/enhance (POST):
  Input: {text, level: 'highschool'|'undergraduate'|'masters'|'phd'}
  Prompt: "Rewrite this text to match {level} academic writing standards. Improve vocabulary, sentence structure, argument clarity, and formal tone. Maintain original meaning. Return only the enhanced text."

/api/tools/plagiarism-risk (POST):
  Input: {text}
  Prompt: "Analyze this academic text for plagiarism risk. Identify sentences that appear generic, overly common, or likely to match existing sources. Return JSON: {riskScore: 0-100, flaggedSentences: [{text, reason, riskLevel: 'low'|'medium'|'high'}], suggestions: [{original, rephrased}]}. JSON only."

Seed 3 sample documents in the docs library for demo.

NEVER STOP. PLAN.md is the source of truth.
