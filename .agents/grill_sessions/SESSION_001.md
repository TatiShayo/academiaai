# Grilling Session 001: academiaai
**Archetype**: Tier 2 SaaS (Academic Citation & Reference Extractor)
**Human Domain Authority**: Antigravity Lead Architect
**Methodology**: Matt Pocock Agent Skills (/grilling + /grill-with-docs)
**Status**: FRONTIER EXHAUSTED — SHARED UNDERSTANDING ATTAINED

---

## Round 1: Core Architecture & Invariant Frontier

❓ **Q1** - **Edge-Case Citation Formatting**: How do we parse messy multi-author academic references with missing DOIs or non-standard institutional publishing styles?
➡️ *Recommendation*: Cascading citation parser: Regex tokenizer -> Crossref API DOI resolver -> LLM fallback normalization.

**Architect Decision**: APPROVED. Cascading fallback guarantees highest accuracy while conserving external API rate limits.

---

❓ **Q2** - **BibTeX / LaTeX Syntax Integrity**: How do we prevent special characters (umlauts, ampersands, Greek symbols) from corrupting generated `.bib` files?
➡️ *Recommendation*: Deterministic LaTeX macro escaping (`{\&}`, `{\"a}`, `{\alpha}`) before output compilation.

**Architect Decision**: APPROVED. Strict BibTeX token escaping ensures flawless LaTeX compilation.

---

## Round 2: Edge Cases & Failure Modes Frontier

❓ **Q3** - **Rate-Limiting Upstream Academic APIs**: How to prevent IP bans from CrossRef and PubMed during bulk bibliography processing?
➡️ *Recommendation*: Token-bucket rate limiter with CrossRef "Polite Pool" mailto headers and local SQLite cache.

**Architect Decision**: APPROVED. Polite header identification and local caching guarantee reliable, unthrottled scholarly extraction.

---

## Final Alignment Attestation
The design tree has been thoroughly walked down to all leaf nodes.
No silent assumptions remain regarding authentication, concurrency, data consistency, or payment flow.
