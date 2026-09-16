const STOP_WORDS = new Set(["the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are", "what", "which", "how", "does", "can", "when", "after", "happens", "keeps", "one", "northstar", "workspace"]);

const SYNONYMS = new Map([
  ["upload", ["file", "ingestion"]],
  ["ingested", ["ingestion", "file"]],
  ["failing", ["failed"]],
  ["split", ["chunk", "chunking"]],
  ["traceability", ["metadata", "location", "version"]],
  ["permissions", ["access", "authorized", "rules"]],
  ["wrong", ["mismatch", "incorrect"]],
  ["choices", ["approve", "edit", "reject"]]
]);

export function normalize(value) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

export function tokenize(value) {
  const base = normalize(value).split(" ").filter((term) => term.length > 2 && !STOP_WORDS.has(term));
  const expanded = [...base];
  for (const term of base) expanded.push(...(SYNONYMS.get(term) ?? []));
  return [...new Set(expanded)];
}

export function retrieve(question, corpus, limit = 3) {
  const queryTerms = tokenize(question);
  const corpusTerms = corpus.map((chunk) => new Set(tokenize(`${chunk.title} ${chunk.text}`)));
  const documentFrequency = new Map(queryTerms.map((term) => [term, corpusTerms.filter((terms) => terms.has(term)).length]));
  const weight = (term) => Math.log((corpus.length + 1) / ((documentFrequency.get(term) ?? 0) + 1)) + 1;
  const totalQueryWeight = queryTerms.reduce((sum, term) => sum + weight(term), 0);
  return corpus.map((chunk) => {
    const textTerms = tokenize(`${chunk.title} ${chunk.text}`);
    const textSet = new Set(textTerms);
    const titleSet = new Set(tokenize(chunk.title));
    const matches = queryTerms.filter((term) => textSet.has(term));
    const matchedWeight = matches.reduce((sum, term) => sum + weight(term), 0);
    const titleBonus = matches.filter((term) => titleSet.has(term)).reduce((sum, term) => sum + weight(term) * 0.2, 0);
    const score = totalQueryWeight ? (matchedWeight + titleBonus) / totalQueryWeight : 0;
    return { ...chunk, score: Number(score.toFixed(4)), matchedTerms: matches };
  }).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
