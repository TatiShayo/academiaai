# ADR 0001: Cascading Bibliographic Parsing and Polite Pool Caching

## Context
Researchers waste days formatting bibliographies and fixing corrupt LaTeX citation errors.

## Decision
1. **Cascading Parser**: Structured regex extraction with CrossRef verification and LLM normalization.
2. **Strict BibTeX Escaping**: Automated sanitization of non-ASCII and math notation characters.
3. **Polite Pool Compliance**: Transparent contact headers and local SQLite response caching.

## Consequences
- **Positive**: Pristine BibTeX generation and zero Crossref API throttling.
- **Negative**: Requires secondary network hop when references lack embedded DOIs.
