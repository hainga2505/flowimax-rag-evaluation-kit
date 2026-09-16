import { retrieve } from "./retriever.mjs";

export function answerQuestion(question, corpus) {
  const startedAt = performance.now();
  const retrieved = retrieve(question, corpus, 3);
  const topScore = retrieved[0]?.score ?? 0;
  const confident = topScore >= 0.28;
  const cited = confident ? retrieved.slice(0, 1) : [];
  const answer = confident
    ? cited.map((item) => item.text).join(" ")
    : "I do not have enough evidence in the provided corpus to answer that question.";
  return {
    answer,
    abstained: !confident,
    citations: cited.map((item) => item.id),
    retrieved: retrieved.map(({ id, score }) => ({ id, score })),
    latencyMs: Number((performance.now() - startedAt).toFixed(3))
  };
}
