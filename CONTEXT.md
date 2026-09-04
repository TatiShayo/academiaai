# CONTEXT.md — Ubiquitous Domain Language (AcademiaAI)

## Core Entities
- **CitationRecord**: Parsed scholarly reference containing authors, year, journal, volume, and DOI.
- **DoiResolver**: Crossref and OpenAlex client querying canonical bibliographic metadata.
- **BibTexExporter**: Formatter outputting syntactically clean, escaped LaTeX bibliography files.
- **PolitePoolHeader**: Contact metadata header entitling AcademiaAI to elevated academic API quotas.

## Domain Invariants
- All BibTeX export keys must be unique within a generated bibliography file.
- Unresolved DOIs must be flagged with warning badges without discarding author metadata.

## Forbidden Terminology
- Do not call citations "footnotes"; use "Citation".
- Do not call academic works "articles"; use "ScholarlyWork" or "Publication".
