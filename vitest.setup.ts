// Per-test-file mocks are declared with vi.hoisted()/vi.mock() inside each
// suite so they can control return values. Keeping this setup file free of
// global module mocks avoids clobbering suites (e.g. openai.test.ts) that need
// the real implementation.
export {};
