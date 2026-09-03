import { describe, it, expect } from "vitest";
import {
  formatAPA7,
  formatMLA9,
  formatChicago,
  formatHarvard,
  formatIEEE,
  formatCitation,
  parseAuthors,
  parseRawCitation,
  type CitationMetadata,
} from "../lib/citation-engine";

describe("Citation Engine - Author Parsing", () => {
  it("parses single author in 'Last, First M.' format", () => {
    const authors = parseAuthors("Smith, John M.");
    expect(authors).toHaveLength(1);
    expect(authors[0]).toEqual({ lastName: "Smith", firstName: "John", middleName: "M." });
  });

  it("parses single author in 'First Last' format", () => {
    const authors = parseAuthors("Albert Einstein");
    expect(authors).toHaveLength(1);
    expect(authors[0]).toEqual({ lastName: "Einstein", firstName: "Albert" });
  });

  it("parses multiple authors separated by 'and'", () => {
    const authors = parseAuthors("Watson, James D. and Crick, Francis");
    expect(authors).toHaveLength(2);
    expect(authors[0].lastName).toBe("Watson");
    expect(authors[1].lastName).toBe("Crick");
  });

  it("parses multiple authors separated by '&'", () => {
    const authors = parseAuthors("Kahneman, Daniel & Tversky, Amos");
    expect(authors).toHaveLength(2);
    expect(authors[0].lastName).toBe("Kahneman");
    expect(authors[1].lastName).toBe("Tversky");
  });

  it("parses multiple authors separated by semicolon", () => {
    const authors = parseAuthors("Doe, Jane; Smith, Bob; Johnson, Carol");
    expect(authors).toHaveLength(3);
    expect(authors.map((a) => a.lastName)).toEqual(["Doe", "Smith", "Johnson"]);
  });

  it("handles empty or undefined author input", () => {
    expect(parseAuthors(undefined)).toEqual([]);
    expect(parseAuthors("")).toEqual([]);
    expect(parseAuthors("   ")).toEqual([]);
  });
});

describe("Citation Engine - APA 7th Edition", () => {
  it("formats single author journal article", () => {
    const meta: CitationMetadata = {
      title: "Understanding quantum decoherence in open systems",
      author: "Zurek, Wojciech H.",
      year: 2003,
      journal: "Reviews of Modern Physics",
      volume: 75,
      issue: 3,
      pages: "715-775",
      doi: "10.1103/RevModPhys.75.715",
    };
    const res = formatAPA7(meta);
    expect(res).toContain("Zurek, W. H.");
    expect(res).toContain("(2003).");
    expect(res).toContain("Understanding quantum decoherence in open systems");
    expect(res).toContain("*Reviews of Modern Physics, 75(3), 715-775*");
    expect(res).toContain("https://doi.org/10.1103/RevModPhys.75.715");
  });

  it("formats two authors with ampersand", () => {
    const meta: CitationMetadata = {
      title: "Prospect Theory: An Analysis of Decision under Risk",
      author: "Kahneman, Daniel and Tversky, Amos",
      year: 1979,
      journal: "Econometrica",
      volume: 47,
      issue: 2,
      pages: "263-291",
    };
    const res = formatAPA7(meta);
    expect(res).toContain("Kahneman, D., & Tversky, A.");
    expect(res).toContain("(1979).");
  });

  it("formats book with publisher", () => {
    const meta: CitationMetadata = {
      title: "The Structure of Scientific Revolutions",
      author: "Kuhn, Thomas S.",
      year: 1962,
      publisher: "University of Chicago Press",
    };
    const res = formatAPA7(meta);
    expect(res).toBe("Kuhn, T. S. (1962). *The Structure of Scientific Revolutions*. University of Chicago Press.");
  });

  it("formats work with missing year as (n.d.)", () => {
    const meta: CitationMetadata = {
      title: "Ancient Philosophy Archive",
      author: "Aristotle",
    };
    const res = formatAPA7(meta);
    expect(res).toContain("(n.d.)");
  });

  it("formats work with missing author as Anonymous", () => {
    const meta: CitationMetadata = {
      title: "The Epic of Gilgamesh",
      year: 1853,
    };
    const res = formatAPA7(meta);
    expect(res).toContain("Anonymous (1853).");
  });

  it("formats 21+ authors with first 19 and ellipsis", () => {
    const authors = Array.from({ length: 22 }, (_, i) => `Author${i + 1}, First${i + 1}`);
    const meta: CitationMetadata = {
      title: "Genome-wide association study of complex traits",
      authors,
      year: 2024,
      journal: "Nature Genetics",
    };
    const res = formatAPA7(meta);
    expect(res).toContain("...");
    expect(res).toContain("Author22, F.");
  });
});

describe("Citation Engine - MLA 9th Edition", () => {
  it("formats single author article in quotes", () => {
    const meta: CitationMetadata = {
      title: "The Narrative Structure of Frankenstein",
      author: "Shelley, Mary",
      year: 2018,
      journal: "Romanticism Studies",
      volume: 14,
      issue: 2,
      pages: "100-115",
    };
    const res = formatMLA9(meta);
    expect(res).toContain('Shelley, Mary. "The Narrative Structure of Frankenstein."');
    expect(res).toContain("*Romanticism Studies*");
    expect(res).toContain("vol. 14, no. 2, 2018, pp. 100-115.");
  });

  it("formats two authors (Last, First, and First Last)", () => {
    const meta: CitationMetadata = {
      title: "Machine Learning Foundations",
      author: "Bishop, Christopher and Jordan, Michael",
      year: 2021,
      publisher: "Springer",
    };
    const res = formatMLA9(meta);
    expect(res).toContain("Bishop, Christopher, and Michael Jordan.");
    expect(res).toContain("*Machine Learning Foundations*");
  });

  it("formats three or more authors with et al.", () => {
    const meta: CitationMetadata = {
      title: "Deep Residual Learning for Image Recognition",
      author: "He, Kaiming and Zhang, Xiangyu and Ren, Shaoqing and Sun, Jian",
      year: 2016,
      journal: "CVPR",
      pages: "770-778",
    };
    const res = formatMLA9(meta);
    expect(res).toContain("He, Kaiming, et al.");
  });

  it("formats single page with p. and multiple pages with pp.", () => {
    const single = formatMLA9({ title: "Brief Note", author: "Smith, John", pages: "42" });
    expect(single).toContain("p. 42.");

    const multi = formatMLA9({ title: "Long Paper", author: "Smith, John", pages: "42-50" });
    expect(multi).toContain("pp. 42-50.");
  });
});

describe("Citation Engine - Chicago 17th Edition", () => {
  it("formats single author book", () => {
    const meta: CitationMetadata = {
      title: "A Theory of Justice",
      author: "Rawls, John",
      year: 1971,
      publisher: "Harvard University Press",
    };
    const res = formatChicago(meta);
    expect(res).toBe('Rawls, John. 1971. *A Theory of Justice*. Harvard University Press.');
  });

  it("formats journal article with volume and issue", () => {
    const meta: CitationMetadata = {
      title: "Computing Machinery and Intelligence",
      author: "Turing, Alan M.",
      year: 1950,
      journal: "Mind",
      volume: 59,
      issue: 236,
      pages: "433-460",
    };
    const res = formatChicago(meta);
    expect(res).toBe('Turing, Alan M. 1950. "Computing Machinery and Intelligence." *Mind* 59, no. 236: 433-460.');
  });
});

describe("Citation Engine - Harvard Style", () => {
  it("formats journal reference with year and issue", () => {
    const meta: CitationMetadata = {
      title: "Quantum Information and Computation",
      author: "Nielsen, Michael A. and Chuang, Isaac L.",
      year: 2000,
      journal: "Physics Today",
      volume: 54,
      issue: 2,
      pages: "60-61",
      url: "https://physicstoday.org/article",
      accessDate: "12 May 2024",
    };
    const res = formatHarvard(meta);
    expect(res).toContain("Nielsen, M. A. and Chuang, I. L., 2000.");
    expect(res).toContain('"Quantum Information and Computation", *Physics Today*, 54(2), pp. 60-61.');
    expect(res).toContain("Available at: <https://physicstoday.org/article> [Accessed 12 May 2024].");
  });

  it("handles missing author in Harvard as Anon.", () => {
    const res = formatHarvard({ title: "Statistical Digest", year: 2023 });
    expect(res).toContain("Anon., 2023.");
  });
});

describe("Citation Engine - IEEE Style", () => {
  it("formats single author with bracket index", () => {
    const meta: CitationMetadata = {
      title: "A Mathematical Theory of Communication",
      author: "Shannon, Claude E.",
      year: 1948,
      journal: "Bell Syst. Tech. J.",
      volume: 27,
      issue: 3,
      pages: "379-423",
      doi: "10.1002/j.1538-7305.1948.tb01338.x",
    };
    const res = formatIEEE(meta, 1);
    expect(res).toContain("[1] C. E. Shannon,");
    expect(res).toContain('"A Mathematical Theory of Communication,"');
    expect(res).toContain("*Bell Syst. Tech. J.*, vol. 27, no. 3, pp. 379-423, 1948.");
    expect(res).toContain("doi: 10.1002/j.1538-7305.1948.tb01338.x");
  });

  it("formats multiple authors (2 authors) with 'and'", () => {
    const meta: CitationMetadata = {
      title: "Digital Image Processing",
      author: "Gonzalez, Rafael C. and Woods, Richard E.",
      year: 2018,
      publisher: "Pearson",
      edition: "4th",
    };
    const res = formatIEEE(meta, 5);
    expect(res).toContain("[5] R. C. Gonzalez and R. E. Woods,");
    expect(res).toContain("*Digital Image Processing*, 4th ed., Pearson, 2018.");
  });

  it("formats 7+ authors with et al.", () => {
    const authors = [
      "Alpha, A.", "Beta, B.", "Gamma, G.", "Delta, D.",
      "Epsilon, E.", "Zeta, Z.", "Eta, H."
    ];
    const meta: CitationMetadata = {
      title: "Large-scale collaborative experiments",
      authors,
      year: 2025,
      journal: "IEEE Trans. Neural Netw.",
    };
    const res = formatIEEE(meta, 2);
    expect(res).toContain("[2] A. Alpha *et al.*,");
  });
});

describe("Citation Engine - Universal formatCitation & parseRawCitation", () => {
  it("formats across styles via formatCitation dispatcher", () => {
    const meta: CitationMetadata = {
      title: "General Relativity",
      author: "Einstein, Albert",
      year: 1915,
      publisher: "Prussian Academy of Sciences",
    };

    expect(formatCitation(meta, "APA")).toContain("Einstein, A. (1915).");
    expect(formatCitation(meta, "MLA")).toContain("Einstein, Albert. *General Relativity*.");
    expect(formatCitation(meta, "Chicago")).toContain("Einstein, Albert. 1915.");
    expect(formatCitation(meta, "Harvard")).toContain("Einstein, A., 1915.");
    expect(formatCitation(meta, "IEEE", 1)).toContain("[1] A. Einstein,");
    expect(formatCitation(meta, "BibTeX")).toContain("@book{");
  });

  it("parses DOI and URL from raw citation text", () => {
    const raw = "Smith, J. (2021). Neural Mechanisms. 10.1038/nature12345 https://example.com/paper";
    const meta = parseRawCitation(raw);
    expect(meta.doi).toBe("10.1038/nature12345");
    expect(meta.url).toBe("https://example.com/paper");
    expect(meta.year).toBe("2021");
  });

  it("parses BibTeX raw input seamlessly", () => {
    const raw = `@article{knuth84,
      author = {Donald E. Knuth},
      title = {Literate Programming},
      journal = {The Computer Journal},
      year = {1984}
    }`;
    const meta = parseRawCitation(raw);
    expect(meta.title).toBe("Literate Programming");
    expect(meta.journal).toBe("The Computer Journal");
    expect(meta.year).toBe("1984");
  });
});
