import { describe, it, expect } from "vitest";
import {
  parseAuthors,
  formatCitation,
  type CitationMetadata,
} from "../lib/citation-engine";

describe("Citation Engine Edge Cases & Formatting Integrity", () => {
  it("formats institutional / corporate authors properly", () => {
    const meta: CitationMetadata = {
      title: "Global Health Security Report",
      authors: [{ lastName: "World Health Organization", isOrganization: true }],
      year: 2024,
      publisher: "WHO Guidelines",
    };

    const apa = formatCitation(meta, "APA");
    expect(apa).toContain("World Health Organization");
    expect(apa).toContain("(2024)");

    const bibtex = formatCitation(meta, "BibTeX");
    expect(bibtex).toContain("author = {{World Health Organization}}");
  });

  it("handles complex multi-author delimiter chains in parseAuthors", () => {
    const raw = "Turing, Alan; von Neumann, John and Dijkstra, Edsger & Lovelace, Ada";
    const authors = parseAuthors(raw);

    expect(authors.length).toBe(4);
    expect(authors[0].lastName).toBe("Turing");
    expect(authors[0].firstName).toBe("Alan");
    expect(authors[1].lastName).toBe("von Neumann");
    expect(authors[2].lastName).toBe("Dijkstra");
    expect(authors[3].lastName).toBe("Lovelace");
  });

  it("generates valid IEEE bracketed in-text citation keys and BibTeX entries", () => {
    const meta: CitationMetadata = {
      title: "Distributed Consensus Protocols",
      author: "Lamport, Leslie",
      year: 2025,
      journal: "ACM Transactions",
      doi: "10.1145/1234567.890",
      entryType: "article",
    };

    const ieee = formatCitation(meta, "IEEE");
    expect(ieee).toContain("L. Lamport");
    expect(ieee).toContain('"Distributed Consensus Protocols,"');

    const bib = formatCitation(meta, "BibTeX");
    expect(bib).toContain("@article{");
    expect(bib).toContain("doi = {10.1145/1234567.890}");
  });
});
