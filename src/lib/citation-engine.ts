export type CitationStyle = "APA" | "MLA" | "Chicago" | "Chicago-Notes" | "Harvard" | "IEEE" | "BibTeX";

export interface Author {
  firstName?: string;
  lastName: string;
  middleName?: string;
  isOrganization?: boolean;
}

export interface CitationMetadata {
  title: string;
  authors?: Author[] | string[];
  author?: string; // Single string convenience
  year?: number | string;
  publicationDate?: string;
  publisher?: string;
  journal?: string;
  volume?: string | number;
  issue?: string | number;
  pages?: string;
  url?: string;
  doi?: string;
  accessDate?: string;
  edition?: string;
  city?: string;
  entryType?: "article" | "book" | "inproceedings" | "techreport" | "phdthesis" | "mastersthesis" | "misc";
}

/**
 * Parse an author string (e.g. "Smith, John", "John Doe", "Doe, J. M.", "Jane Smith and John Doe")
 * into a structured Author array.
 */
export function parseAuthors(authorsInput: string | string[] | Author[] | undefined): Author[] {
  if (!authorsInput) return [];
  if (Array.isArray(authorsInput)) {
    if (authorsInput.length === 0) return [];
    if (typeof authorsInput[0] === "object" && authorsInput[0] !== null && "lastName" in authorsInput[0]) {
      return authorsInput as Author[];
    }
    return (authorsInput as string[]).flatMap((a) => parseAuthors(a));
  }

  const raw = String(authorsInput).trim();
  if (!raw) return [];

  // Split multiple authors by " and ", " & ", or semicolon
  const parts = raw.split(/\s+and\s+|;\s*|\s+&\s+/i).map((p) => p.trim()).filter(Boolean);

  return parts.map((part) => {
    // If format is "LastName, FirstName MiddleName"
    if (part.includes(",")) {
      const [last, firstAndMiddle] = part.split(",").map((s) => s.trim());
      if (!firstAndMiddle) {
        return { lastName: last };
      }
      const names = firstAndMiddle.split(/\s+/).filter(Boolean);
      const firstName = names[0];
      const middleName = names.slice(1).join(" ") || undefined;
      return { lastName: last, firstName, middleName };
    }

    const names = part.split(/\s+/).filter(Boolean);
    if (names.length === 1) {
      return { lastName: names[0] };
    }
    const lastName = names[names.length - 1];
    const firstName = names[0];
    const middleName = names.slice(1, -1).join(" ") || undefined;
    return { lastName, firstName, middleName };
  });
}

function formatAuthorInitials(author: Author): string {
  if (author.isOrganization || !author.firstName) {
    return author.lastName;
  }
  const fInitial = author.firstName.charAt(0).toUpperCase() + ".";
  const mInitial = author.middleName ? ` ${author.middleName.charAt(0).toUpperCase()}.` : "";
  return `${author.lastName}, ${fInitial}${mInitial}`;
}

function formatAuthorFirstLast(author: Author): string {
  if (author.isOrganization) return author.lastName;
  const parts = [author.firstName, author.middleName, author.lastName].filter(Boolean);
  return parts.join(" ");
}

/**
 * Format citation in APA 7th Edition format
 */
export function formatAPA7(meta: CitationMetadata): string {
  const authors = parseAuthors(meta.authors || meta.author);
  let authorStr = "";

  if (authors.length === 0) {
    authorStr = "Anonymous";
  } else if (authors.length === 1) {
    authorStr = formatAuthorInitials(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorInitials(authors[0])}, & ${formatAuthorInitials(authors[1])}`;
  } else if (authors.length <= 20) {
    const allExceptLast = authors.slice(0, -1).map(formatAuthorInitials).join(", ");
    const last = formatAuthorInitials(authors[authors.length - 1]);
    authorStr = `${allExceptLast}, & ${last}`;
  } else {
    // 21+ authors: first 19, ellipsis, last author
    const first19 = authors.slice(0, 19).map(formatAuthorInitials).join(", ");
    const last = formatAuthorInitials(authors[authors.length - 1]);
    authorStr = `${first19}, ... ${last}`;
  }

  const yearStr = meta.year ? `(${meta.year})` : "(n.d.)";
  const title = (meta.title || "Untitled Document").trim().replace(/\.$/, "");

  let sourceStr = "";
  if (meta.journal) {
    let journalPart = meta.journal.trim();
    if (meta.volume) {
      journalPart += `, ${meta.volume}`;
      if (meta.issue) {
        journalPart += `(${meta.issue})`;
      }
    }
    if (meta.pages) {
      journalPart += `, ${meta.pages}`;
    }
    sourceStr = `${title}. *${journalPart}*.`;
  } else {
    const pub = meta.publisher ? ` ${meta.publisher.trim()}.` : "";
    sourceStr = `*${title}*.${pub}`;
  }

  let locator = "";
  if (meta.doi) {
    const cleanDoi = meta.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    locator = ` https://doi.org/${cleanDoi}`;
  } else if (meta.url) {
    locator = ` Retrieved from ${meta.url}`;
  }

  return `${authorStr} ${yearStr}. ${sourceStr}${locator}`.trim();
}

/**
 * Format citation in MLA 9th Edition format
 */
export function formatMLA9(meta: CitationMetadata): string {
  const authors = parseAuthors(meta.authors || meta.author);
  let authorStr = "";

  if (authors.length === 1) {
    const a = authors[0];
    const firstPart = [a.firstName, a.middleName].filter(Boolean).join(" ");
    authorStr = firstPart ? `${a.lastName}, ${firstPart}.` : `${a.lastName}.`;
  } else if (authors.length === 2) {
    const a1 = authors[0];
    const a1First = [a1.firstName, a1.middleName].filter(Boolean).join(" ");
    const a1Str = a1First ? `${a1.lastName}, ${a1First}` : a1.lastName;
    const a2Str = formatAuthorFirstLast(authors[1]);
    authorStr = `${a1Str}, and ${a2Str}.`;
  } else if (authors.length >= 3) {
    const a1 = authors[0];
    const a1First = [a1.firstName, a1.middleName].filter(Boolean).join(" ");
    const a1Str = a1First ? `${a1.lastName}, ${a1First}` : a1.lastName;
    authorStr = `${a1Str}, et al.`;
  }

  const title = (meta.title || "Untitled Document").trim().replace(/\.$/, "");
  const isArticle = !!meta.journal;

  let titlePart = isArticle ? `"${title}."` : `*${title}*.`;
  if (authorStr) {
    titlePart = `${authorStr} ${titlePart}`;
  }

  const parts: string[] = [];
  if (meta.journal) {
    parts.push(`*${meta.journal.trim()}*`);
  }
  if (meta.volume) {
    parts.push(`vol. ${meta.volume}`);
  }
  if (meta.issue) {
    parts.push(`no. ${meta.issue}`);
  }
  if (meta.publisher && !meta.journal) {
    parts.push(meta.publisher.trim());
  }
  if (meta.year) {
    parts.push(String(meta.year));
  }
  if (meta.pages) {
    const isSingle = !meta.pages.includes("-") && !meta.pages.includes(",");
    parts.push(`${isSingle ? "p." : "pp."} ${meta.pages}`);
  }
  if (meta.doi) {
    const cleanDoi = meta.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    parts.push(`https://doi.org/${cleanDoi}`);
  } else if (meta.url) {
    parts.push(meta.url);
  }

  const containerStr = parts.join(", ");
  return containerStr ? `${titlePart} ${containerStr}.` : `${titlePart}`;
}

/**
 * Format citation in Chicago 17th Edition (Author-Date) format
 */
export function formatChicago(meta: CitationMetadata): string {
  const authors = parseAuthors(meta.authors || meta.author);
  let authorStr = "";

  if (authors.length === 1) {
    const a = authors[0];
    const firstPart = [a.firstName, a.middleName].filter(Boolean).join(" ");
    authorStr = firstPart ? `${a.lastName}, ${firstPart}` : a.lastName;
  } else if (authors.length === 2) {
    const a1 = authors[0];
    const a1First = [a1.firstName, a1.middleName].filter(Boolean).join(" ");
    const a1Str = a1First ? `${a1.lastName}, ${a1First}` : a1.lastName;
    const a2Str = formatAuthorFirstLast(authors[1]);
    authorStr = `${a1Str}, and ${a2Str}`;
  } else if (authors.length >= 3) {
    const a1 = authors[0];
    const a1First = [a1.firstName, a1.middleName].filter(Boolean).join(" ");
    const a1Str = a1First ? `${a1.lastName}, ${a1First}` : a1.lastName;
    authorStr = `${a1Str} et al.`;
  } else {
    authorStr = "Anonymous";
  }

  const yearStr = meta.year ? `${meta.year}.` : "n.d.";
  const title = (meta.title || "Untitled").trim().replace(/\.$/, "");

  let middle = "";
  if (meta.journal) {
    let j = `"${title}." *${meta.journal.trim()}*`;
    if (meta.volume) {
      j += ` ${meta.volume}`;
      if (meta.issue) j += `, no. ${meta.issue}`;
    }
    if (meta.pages) {
      j += `: ${meta.pages}`;
    }
    middle = `${j}.`;
  } else {
    const pub = meta.publisher ? ` ${meta.publisher.trim()}.` : "";
    middle = `*${title}*.${pub}`;
  }

  let locator = "";
  if (meta.doi) {
    const cleanDoi = meta.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    locator = ` https://doi.org/${cleanDoi}.`;
  } else if (meta.url) {
    locator = ` Available at: ${meta.url}.`;
  }

  const cleanAuthor = authorStr.replace(/\.$/, "");
  return `${cleanAuthor}. ${yearStr} ${middle}${locator}`.trim();
}

/**
 * Format citation in Harvard style
 */
export function formatHarvard(meta: CitationMetadata): string {
  const authors = parseAuthors(meta.authors || meta.author);
  let authorStr = "";

  if (authors.length === 0) {
    authorStr = "Anon.";
  } else if (authors.length === 1) {
    authorStr = formatAuthorInitials(authors[0]);
  } else if (authors.length === 2) {
    authorStr = `${formatAuthorInitials(authors[0])} and ${formatAuthorInitials(authors[1])}`;
  } else {
    authorStr = `${formatAuthorInitials(authors[0])} et al.`;
  }

  const yearStr = meta.year ? `${meta.year}` : "n.d.";
  const title = (meta.title || "Untitled").trim().replace(/\.$/, "");

  let sourceStr = "";
  if (meta.journal) {
    let j = `"${title}", *${meta.journal.trim()}*`;
    if (meta.volume) {
      j += `, ${meta.volume}`;
      if (meta.issue) j += `(${meta.issue})`;
    }
    if (meta.pages) {
      j += `, pp. ${meta.pages}`;
    }
    sourceStr = `${j}.`;
  } else {
    const pub = meta.publisher ? ` ${meta.publisher.trim()}` : "";
    sourceStr = `*${title}*.${pub}.`;
  }

  let locator = "";
  if (meta.url) {
    const accessed = meta.accessDate ? ` [Accessed ${meta.accessDate}]` : "";
    locator = ` Available at: <${meta.url}>${accessed}.`;
  } else if (meta.doi) {
    const cleanDoi = meta.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    locator = ` doi: ${cleanDoi}.`;
  }

  return `${authorStr}, ${yearStr}. ${sourceStr}${locator}`.trim();
}

/**
 * Format citation in IEEE style
 */
export function formatIEEE(meta: CitationMetadata, citationIndex = 1): string {
  const authors = parseAuthors(meta.authors || meta.author);
  let authorStr = "";

  if (authors.length === 0) {
    authorStr = "";
  } else if (authors.length === 1) {
    const a = authors[0];
    const fInitial = a.firstName ? `${a.firstName.charAt(0).toUpperCase()}. ` : "";
    const mInitial = a.middleName ? `${a.middleName.charAt(0).toUpperCase()}. ` : "";
    authorStr = `${fInitial}${mInitial}${a.lastName}`;
  } else if (authors.length === 2) {
    const formatIEEEAuthor = (a: Author) => {
      const fInitial = a.firstName ? `${a.firstName.charAt(0).toUpperCase()}. ` : "";
      const mInitial = a.middleName ? `${a.middleName.charAt(0).toUpperCase()}. ` : "";
      return `${fInitial}${mInitial}${a.lastName}`;
    };
    authorStr = `${formatIEEEAuthor(authors[0])} and ${formatIEEEAuthor(authors[1])}`;
  } else if (authors.length >= 3 && authors.length <= 6) {
    const formatIEEEAuthor = (a: Author) => {
      const fInitial = a.firstName ? `${a.firstName.charAt(0).toUpperCase()}. ` : "";
      const mInitial = a.middleName ? `${a.middleName.charAt(0).toUpperCase()}. ` : "";
      return `${fInitial}${mInitial}${a.lastName}`;
    };
    const allExceptLast = authors.slice(0, -1).map(formatIEEEAuthor).join(", ");
    const last = formatIEEEAuthor(authors[authors.length - 1]);
    authorStr = `${allExceptLast}, and ${last}`;
  } else {
    const a = authors[0];
    const fInitial = a.firstName ? `${a.firstName.charAt(0).toUpperCase()}. ` : "";
    const mInitial = a.middleName ? `${a.middleName.charAt(0).toUpperCase()}. ` : "";
    authorStr = `${fInitial}${mInitial}${a.lastName} *et al.*`;
  }

  const title = (meta.title || "Untitled").trim().replace(/\.$/, "");
  const isArticle = !!meta.journal;

  let body = "";
  if (isArticle) {
    const parts: string[] = [];
    parts.push(`*${meta.journal!.trim()}*`);
    if (meta.volume) parts.push(`vol. ${meta.volume}`);
    if (meta.issue) parts.push(`no. ${meta.issue}`);
    if (meta.pages) parts.push(`pp. ${meta.pages}`);
    if (meta.publicationDate) {
      parts.push(meta.publicationDate);
    } else if (meta.year) {
      parts.push(String(meta.year));
    }
    const container = parts.join(", ");
    body = `"${title}," ${container}.`;
  } else {
    const parts: string[] = [];
    if (meta.edition) parts.push(`${meta.edition} ed.`);
    if (meta.city && meta.publisher) {
      parts.push(`${meta.city}: ${meta.publisher}`);
    } else if (meta.publisher) {
      parts.push(meta.publisher);
    }
    if (meta.year) parts.push(String(meta.year));
    const container = parts.join(", ");
    body = `*${title}*${container ? `, ${container}` : ""}.`;
  }

  let locator = "";
  if (meta.doi) {
    const cleanDoi = meta.doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
    locator = ` doi: ${cleanDoi}.`;
  } else if (meta.url) {
    locator = ` [Online]. Available: ${meta.url}.`;
  }

  const prefix = authorStr ? `${authorStr}, ` : "";
  return `[${citationIndex}] ${prefix}${body}${locator}`.trim();
}

/**
 * Generate BibTeX citation entry from metadata
 */
export function generateBibTeX(meta: CitationMetadata, citeKey?: string): string {
  const authors = parseAuthors(meta.authors || meta.author);
  const authorBib = authors
    .map((a) => {
      // Corporate authors carry an inner brace pair so BibTeX does not
      // case-fold the organisation name; the outer pair is added below.
      if (a.isOrganization) return `{${a.lastName}}`;
      const first = [a.firstName, a.middleName].filter(Boolean).join(" ");
      return first ? `${a.lastName}, ${first}` : a.lastName;
    })
    .join(" and ");

  const type = meta.entryType || (meta.journal ? "article" : meta.publisher ? "book" : "misc");

  // Derive citeKey if missing
  const firstAuthorLast = (authors[0]?.lastName || "anon").toLowerCase().replace(/[^a-z0-9]/g, "");
  const yearKey = meta.year ? String(meta.year) : "nd";
  const titleFirstWord = (meta.title || "work").split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = citeKey || `${firstAuthorLast}${yearKey}${titleFirstWord}`;

  // Values are stored brace-free; the emitter adds exactly one wrapping pair,
  // so a corporate author keeps its protective inner pair ({{...}}).
  const fields: Array<[string, string | number | undefined]> = [
    ["author", authorBib || undefined],
    ["title", meta.title || undefined],
    ["journal", meta.journal || undefined],
    ["year", meta.year],
    ["volume", meta.volume],
    ["number", meta.issue],
    ["pages", meta.pages || undefined],
    ["publisher", meta.publisher || undefined],
    ["doi", meta.doi || undefined],
    ["url", meta.url || undefined],
  ];

  const fieldLines = fields
    .filter(([, val]) => val !== undefined && val !== "")
    .map(([k, val]) => `  ${k} = {${String(val)}},`)
    .join("\n");

  return `@${type}{${key},\n${fieldLines}\n}`;
}

/**
 * Parse BibTeX string into structured CitationMetadata
 */
export function parseBibTeX(bibtex: string): CitationMetadata[] {
  const results: CitationMetadata[] = [];
  const clean = bibtex.trim();
  if (!clean) return results;

  // Match each entry @type{key, ...}
  const entryRegex = /@(\w+)\s*\{\s*([^,]+),([\s\S]*?)(?=@\w+\s*\{|$)/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(clean)) !== null) {
    const entryType = match[1].toLowerCase() as CitationMetadata["entryType"];
    const body = match[3];

    const meta: CitationMetadata = {
      title: "",
      entryType,
    };

    // Match fields: fieldName = {value} or "value" or value
    const fieldRegex = /([a-zA-Z_]+)\s*=\s*(?:\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|"([^"]*)"|([0-9a-zA-Z_-]+))/g;
    let fieldMatch: RegExpExecArray | null;

    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const key = fieldMatch[1].toLowerCase();
      const value = (fieldMatch[2] ?? fieldMatch[3] ?? fieldMatch[4] ?? "").trim();

      switch (key) {
        case "title":
          meta.title = value;
          break;
        case "author":
          meta.authors = parseAuthors(value);
          break;
        case "year":
          meta.year = value;
          break;
        case "journal":
        case "journaltitle":
          meta.journal = value;
          break;
        case "publisher":
          meta.publisher = value;
          break;
        case "volume":
          meta.volume = value;
          break;
        case "number":
        case "issue":
          meta.issue = value;
          break;
        case "pages":
          meta.pages = value.replace(/--/g, "-");
          break;
        case "doi":
          meta.doi = value;
          break;
        case "url":
          meta.url = value;
          break;
        case "edition":
          meta.edition = value;
          break;
        case "address":
        case "city":
          meta.city = value;
          break;
      }
    }

    if (meta.title || meta.authors?.length) {
      results.push(meta);
    }
  }

  return results;
}

/**
 * Universal citation formatter that handles any supported style
 */
export function formatCitation(meta: CitationMetadata, style: CitationStyle = "APA", index = 1): string {
  switch (style) {
    case "APA":
      return formatAPA7(meta);
    case "MLA":
      return formatMLA9(meta);
    case "Chicago":
      return formatChicago(meta);
    case "Harvard":
      return formatHarvard(meta);
    case "IEEE":
      return formatIEEE(meta, index);
    case "BibTeX":
      return generateBibTeX(meta);
    default:
      return formatAPA7(meta);
  }
}

/**
 * Smart heuristic parser for raw bibliographic or unstructured strings
 */
export function parseRawCitation(rawText: string): CitationMetadata {
  const text = rawText.trim();
  const meta: CitationMetadata = { title: "" };

  if (text.startsWith("@") && text.includes("{")) {
    const parsed = parseBibTeX(text);
    if (parsed.length > 0) return parsed[0];
  }

  // Extract DOI
  const doiMatch = text.match(/\b10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+\b/);
  if (doiMatch) {
    meta.doi = doiMatch[0];
  }

  // Extract URL
  const urlMatch = text.match(/https?:\/\/[^\s>"]+/);
  if (urlMatch) {
    meta.url = urlMatch[0];
  }

  // Extract Year (4 digits in parentheses or standalone 19xx/20xx)
  const yearMatch = text.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    meta.year = yearMatch[1];
  }

  // Try extracting title in quotes e.g. "Title here"
  const quotedTitle = text.match(/"([^"]+)"|“([^”]+)”/);
  if (quotedTitle) {
    meta.title = quotedTitle[1] || quotedTitle[2];
  } else {
    // If title has no quotes, check for sentence splits
    const segments = text.split(/[.\n]/).map((s) => s.trim()).filter(Boolean);
    if (segments.length >= 2) {
      // First segment is often author, second title
      meta.authors = parseAuthors(segments[0]);
      meta.title = segments[1];
    } else {
      meta.title = text;
    }
  }

  return meta;
}
