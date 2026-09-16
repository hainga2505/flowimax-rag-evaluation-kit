import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { answerQuestion } from "./demo-system.mjs";
import { readJsonl } from "./io.mjs";
import { evaluateCase, summarize } from "./metrics.mjs";
import { toMarkdown } from "./report.mjs";

const root = resolve(import.meta.dirname, "..");
const corpus = await readJsonl(resolve(root, "fixtures/corpus.jsonl"));
const dataset = await readJsonl(resolve(root, "evals/dataset.jsonl"));
const caseResults = dataset.map((testCase) => evaluateCase(testCase, answerQuestion(testCase.question, corpus)));
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  dataset: "evals/dataset.jsonl",
  corpus: "fixtures/corpus.jsonl",
  summary: summarize(caseResults),
  caseResults
};

await mkdir(resolve(root, "reports"), { recursive: true });
await writeFile(resolve(root, "reports/latest-report.json"), `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resolve(root, "reports/latest-report.md"), toMarkdown(report));
console.log(JSON.stringify(report.summary, null, 2));
