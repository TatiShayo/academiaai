# TICKETS — AcademiaAI Citation Pipeline

## [TICKET-001] Institutional & Multi-Author Citation Parser
- **Blocked by**: None
- **Delivers**: Robust regex and heuristic extractor for messy academic reference lists.
- **Verification**: `src/__tests__/citation-edge-cases.test.ts`

## [TICKET-002] Canonical DOI Resolver & Crossref Polite Client
- **Blocked by**: TICKET-001
- **Delivers**: Metadata enricher querying official DOI repositories with local cache.
- **Verification**: DOI lookup mock unit tests.
