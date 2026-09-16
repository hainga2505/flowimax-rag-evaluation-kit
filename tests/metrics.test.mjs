import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCase, summarize } from "../src/metrics.mjs";

test("perfect evidence and answer pass", () => {
  const result = evaluateCase(
    { id: "case", category: "fact", difficulty: "easy", answerable: true, expectedEvidenceIds: ["doc-1"], expectedAnswerPoints: ["30 days"] },
    { answer: "The retention period is 30 days.", abstained: false, citations: ["doc-1"], retrieved: [{ id: "doc-1", score: 1 }], latencyMs: 2 }
  );
  assert.equal(result.passed, true);
  assert.equal(result.reciprocalRank, 1);
  assert.equal(result.citationPrecision, 1);
});

test("unsupported question must abstain", () => {
  const result = evaluateCase(
    { id: "unknown", category: "no-answer", difficulty: "easy", answerable: false, expectedEvidenceIds: [], expectedAnswerPoints: [] },
    { answer: "Not enough evidence.", abstained: true, citations: [], retrieved: [], latencyMs: 1 }
  );
  assert.equal(result.passed, true);
  assert.equal(result.abstentionCorrect, true);
});

test("summary keeps failed cases visible", () => {
  const summary = summarize([
    { passed: true, retrievalHitAtK: 1, reciprocalRank: 1, citationPrecision: 1, citationRecall: 1, answerPointCoverage: 1, abstentionCorrect: true, latencyMs: 1 },
    { passed: false, retrievalHitAtK: 0, reciprocalRank: 0, citationPrecision: 0, citationRecall: 0, answerPointCoverage: 0, abstentionCorrect: false, latencyMs: 2 }
  ]);
  assert.equal(summary.cases, 2);
  assert.equal(summary.passed, 1);
  assert.equal(summary.passRate, 0.5);
});
