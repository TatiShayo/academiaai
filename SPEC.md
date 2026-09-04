# SPEC 001: Academic Reference Extraction & BibTeX Generator

## Problem Statement
Scholars spend hours correcting garbled reference lists and debugging LaTeX compilation errors caused by malformed BibTeX entries.

## Solution
An automated reference extractor that parses messy citation text, resolves official DOIs, and exports validated BibTeX and APA/MLA files.

## User Stories
1. As a researcher, I want to paste a messy reference list and receive clean BibTeX entries, so that my LaTeX manuscript builds without errors.
2. As a student, I want missing DOIs looked up automatically, so that my citations are academically complete.

## Implementation Decisions
- Citation edge-case tokenizer in `src/lib/citations.ts`.
- LaTeX escaping engine in `src/lib/bibtex.ts`.

## Testing Decisions
- Seam: `src/__tests__/citation-edge-cases.test.ts`.
- Verify institutional parsing, multi-author et al. handling, and special character sanitization.
