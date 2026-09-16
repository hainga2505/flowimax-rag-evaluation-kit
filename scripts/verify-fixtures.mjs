import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { readJsonl } from "../src/io.mjs";

const root = resolve(import.meta.dirname, "..");
const localDenylistPath = resolve(root, ".publication-denylist.local");
const localDenylist = await readFile(localDenylistPath, "utf8").catch(() => "");
const forbiddenTerms = localDenylist
  .split(/\r?\n/)
  .map((term) => term.trim().toLowerCase())
  .filter((term) => term && !term.startsWith("#"));
const secretPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/,
  /\bAIza[A-Za-z0-9_-]{30,}\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bBearer\s+[A-Za-z0-9._~+/-]{20,}\b/i,
  /\b(?:api[_-]?key|client[_-]?secret|password)\s*[:=]\s*["']?[^\s"']{8,}/i
];
const privacyPatterns = [
  /\/Users\/[^/\s]+\//,
  /[A-Z]:\\Users\\[^\\\s]+\\/i,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  /\b[A-Z0-9._%+-]+@(?!(?:example\.(?:com|org)|users\.noreply\.github\.com)\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else files.push(path);
  }
  return files;
}

const files = await collectFiles(root);
const violations = [];
for (const file of files) {
  if (file.endsWith("verify-fixtures.mjs") || file.endsWith("prepublish-audit.mjs") || file.endsWith(".publication-denylist.local")) continue;
  const text = await readFile(file, "utf8").catch(() => "");
  const lower = text.toLowerCase();
  for (const term of forbiddenTerms) if (lower.includes(term)) violations.push(`${file}: forbidden private/domain term '${term}'`);
  for (const pattern of secretPatterns) if (pattern.test(text)) violations.push(`${file}: possible credential`);
  for (const pattern of privacyPatterns) if (pattern.test(text)) violations.push(`${file}: possible personal or machine-specific information`);
}

const corpus = await readJsonl(resolve(root, "fixtures/corpus.jsonl"));
const cases = await readJsonl(resolve(root, "evals/dataset.jsonl"));
const unique = (values) => new Set(values).size === values.length;
if (corpus.length < 10 || !unique(corpus.map((item) => item.id))) violations.push("Corpus needs at least ten unique synthetic chunks.");
if (cases.length < 20 || !unique(cases.map((item) => item.id))) violations.push("Dataset needs at least twenty unique cases.");
for (const item of cases) {
  if (!Array.isArray(item.expectedEvidenceIds) || !Array.isArray(item.expectedAnswerPoints) || typeof item.answerable !== "boolean") violations.push(`${item.id}: invalid evaluation contract`);
}
if (violations.length) throw new Error(`Fixture safety gate failed:\n- ${violations.join("\n- ")}`);
console.log(`Fixture safety gate passed: ${corpus.length} synthetic chunks, ${cases.length} cases, ${files.length} files scanned.`);
