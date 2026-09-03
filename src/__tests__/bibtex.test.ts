import { describe, it, expect } from "vitest";
import { parseBibTeX, generateBibTeX, type CitationMetadata } from "../lib/citation-engine";

describe("BibTeX Parser & Generator", () => {
  it("parses single @article BibTeX entry", () => {
    const bib = `@article{einstein1905photoelectric,
      author = {Albert Einstein},
      title = {Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt},
      journal = {Annalen der Physik},
      year = {1905},
      volume = {17},
      number = {6},
      pages = {132--148},
      doi = {10.1002/andp.19053220607}
    }`;

    const entries = parseBibTeX(bib);
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.entryType).toBe("article");
    expect(entry.title).toBe("Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt");
    expect(entry.journal).toBe("Annalen der Physik");
    expect(entry.year).toBe("1905");
    expect(entry.volume).toBe("17");
    expect(entry.issue).toBe("6");
    expect(entry.pages).toBe("132-148");
    expect(entry.doi).toBe("10.1002/andp.19053220607");
    expect(entry.authors).toHaveLength(1);
    expect(entry.authors![0]).toEqual({ lastName: "Einstein", firstName: "Albert" });
  });

  it("parses @book BibTeX entry with quotes instead of braces", () => {
    const bib = `@book{russell2010ai,
      author = "Stuart Russell and Peter Norvig",
      title = "Artificial Intelligence: A Modern Approach",
      publisher = "Prentice Hall",
      year = "2010",
      edition = "3rd"
    }`;

    const entries = parseBibTeX(bib);
    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.entryType).toBe("book");
    expect(entry.title).toBe("Artificial Intelligence: A Modern Approach");
    expect(entry.publisher).toBe("Prentice Hall");
    expect(entry.year).toBe("2010");
    expect(entry.edition).toBe("3rd");
    expect(entry.authors).toHaveLength(2);
  });

  it("parses multiple BibTeX entries in one string", () => {
    const bib = `
      @article{paper1,
        author = {Smith, John},
        title = {First Research Study},
        year = {2020}
      }

      @inproceedings{paper2,
        author = {Doe, Jane and Brown, Bob},
        title = {Second Conference Paper},
        year = {2021}
      }
    `;

    const entries = parseBibTeX(bib);
    expect(entries).toHaveLength(2);
    expect(entries[0].title).toBe("First Research Study");
    expect(entries[1].title).toBe("Second Conference Paper");
    expect(entries[1].entryType).toBe("inproceedings");
  });

  it("handles empty or malformed BibTeX gracefully", () => {
    expect(parseBibTeX("")).toEqual([]);
    expect(parseBibTeX("   ")).toEqual([]);
    expect(parseBibTeX("not a bibtex entry")).toEqual([]);
  });

  it("generates clean BibTeX string from metadata", () => {
    const meta: CitationMetadata = {
      title: "Deep Learning Foundations",
      author: "Goodfellow, Ian and Bengio, Yoshua and Courville, Aaron",
      year: 2016,
      publisher: "MIT Press",
    };

    const bib = generateBibTeX(meta);
    expect(bib).toContain("@book{goodfellow2016deep,");
    expect(bib).toContain("author = {Goodfellow, Ian and Bengio, Yoshua and Courville, Aaron},");
    expect(bib).toContain("title = {Deep Learning Foundations},");
    expect(bib).toContain("publisher = {MIT Press},");
    expect(bib).toContain("year = {2016},");
  });

  it("generates BibTeX for journal article with custom cite key", () => {
    const meta: CitationMetadata = {
      title: "Attention Is All You Need",
      author: "Vaswani, Ashish and Shazeer, Noam",
      journal: "NeurIPS",
      year: 2017,
      volume: 30,
      pages: "5998-6008",
    };

    const bib = generateBibTeX(meta, "vaswani2017attention");
    expect(bib).toContain("@article{vaswani2017attention,");
    expect(bib).toContain("journal = {NeurIPS},");
    expect(bib).toContain("pages = {5998-6008},");
  });

  it("round-trips generation and parsing", () => {
    const meta: CitationMetadata = {
      title: "Self-Attention Mechanism",
      author: "Vaswani, Ashish",
      journal: "AI Review",
      year: 2018,
      volume: 12,
      pages: "10-20",
    };

    const bib = generateBibTeX(meta, "vaswani2018");
    const parsed = parseBibTeX(bib);

    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe("Self-Attention Mechanism");
    expect(parsed[0].journal).toBe("AI Review");
    expect(parsed[0].year).toBe("2018");
    expect(parsed[0].volume).toBe("12");
  });
});
