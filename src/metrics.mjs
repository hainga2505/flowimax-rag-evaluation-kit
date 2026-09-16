import { normalize } from "./retriever.mjs";

function ratio(numerator, denominator) {
  return denominator === 0 ? 1 : numerator / denominator;
}

function round(value) {
  return Number(value.toFixed(4));
}

export function evaluateCase(testCase, result, topK = 3) {
  const expected = new Set(testCase.expectedEvidenceIds);
  const retrievedIds = result.retrieved.slice(0, topK).map((item) => item.id);
  const firstRelevant = retrievedIds.findIndex((id) => expected.has(id));
  const citedRelevant = result.citations.filter((id) => expected.has(id)).length;
  const normalizedAnswer = normalize(result.answer);
  const coveredPoints = testCase.expectedAnswerPoints.filter((point) => normalizedAnswer.includes(normalize(point))).length;
  const answerCoverage = ratio(coveredPoints, testCase.expectedAnswerPoints.length);
  const abstentionCorrect = testCase.answerable ? !result.abstained : result.abstained;
  const retrievalHit = testCase.answerable ? firstRelevant >= 0 : result.retrieved.length === 0 || result.abstained;
  return {
    id: testCase.id,
    category: testCase.category,
    difficulty: testCase.difficulty,
    retrievalHitAtK: retrievalHit ? 1 : 0,
    reciprocalRank: firstRelevant >= 0 ? round(1 / (firstRelevant + 1)) : testCase.answerable ? 0 : 1,
    citationPrecision: testCase.answerable ? round(ratio(citedRelevant, result.citations.length)) : result.citations.length === 0 ? 1 : 0,
    citationRecall: testCase.answerable ? round(ratio(citedRelevant, expected.size)) : result.citations.length === 0 ? 1 : 0,
    answerPointCoverage: round(answerCoverage),
    abstentionCorrect,
    latencyMs: result.latencyMs,
    passed: retrievalHit && abstentionCorrect && (!testCase.answerable || (answerCoverage === 1 && citedRelevant > 0)),
    retrievedIds,
    citedIds: result.citations
  };
}

export function summarize(caseResults) {
  const average = (key) => round(caseResults.reduce((sum, item) => sum + Number(item[key]), 0) / caseResults.length);
  const sortedLatency = caseResults.map((item) => item.latencyMs).sort((a, b) => a - b);
  const p95Index = Math.min(sortedLatency.length - 1, Math.ceil(sortedLatency.length * 0.95) - 1);
  return {
    cases: caseResults.length,
    passed: caseResults.filter((item) => item.passed).length,
    passRate: average("passed"),
    retrievalHitAt3: average("retrievalHitAtK"),
    meanReciprocalRank: average("reciprocalRank"),
    citationPrecision: average("citationPrecision"),
    citationRecall: average("citationRecall"),
    answerPointCoverage: average("answerPointCoverage"),
    abstentionAccuracy: average("abstentionCorrect"),
    p95LatencyMs: Number(sortedLatency[p95Index].toFixed(3))
  };
}
