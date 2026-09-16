import { readFile } from "node:fs/promises";

const report = JSON.parse(await readFile(new URL("../reports/latest-report.json", import.meta.url), "utf8"));
const checks = [
  ["at least 20 cases", report.summary.cases >= 20],
  ["retrieval hit@3 >= 90%", report.summary.retrievalHitAt3 >= 0.9],
  ["citation precision >= 90%", report.summary.citationPrecision >= 0.9],
  ["abstention accuracy = 100%", report.summary.abstentionAccuracy === 1],
  ["report exposes every case", report.caseResults.length === report.summary.cases]
];
const failed = checks.filter(([, passed]) => !passed);
if (failed.length) throw new Error(`Report gate failed: ${failed.map(([name]) => name).join(", ")}`);
console.log(`Report gate passed: ${checks.length}/${checks.length}.`);
