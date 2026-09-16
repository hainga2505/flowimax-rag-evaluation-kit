# Evaluation plan

## Objective

Demonstrate a reproducible method for evaluating source-grounded RAG behavior without exposing a private corpus or claiming production results.

## Scope

- Retrieval hit@3 and reciprocal rank.
- Citation precision and recall.
- Expected answer-point coverage.
- Correct abstention for unsupported questions.
- Local end-to-end latency for the demo adapter.

## Out of scope

- Semantic equivalence grading by an LLM.
- Production scalability, hosted-vector latency or real-user satisfaction.
- Claims about Flowimax production accuracy.

## Ground-truth policy

Each case names the synthetic chunk IDs expected to support the answer and concise answer points copied from that synthetic corpus. Unsupported cases contain no evidence IDs and require abstention.

## Failure taxonomy

- `RETRIEVAL_MISSING`: expected evidence is absent from top-k.
- `RETRIEVAL_IRRELEVANT`: returned context does not answer the question.
- `ANSWER_INCOMPLETE`: one or more expected answer points are missing.
- `ANSWER_UNGROUNDED`: the answer contains an unsupported factual claim.
- `CITATION_MISMATCH`: a citation does not support the claim.
- `ABSTENTION_FAILURE`: the system answers an unsupported question or refuses a supported one.
- `LATENCY_EXCEEDED`: measured latency exceeds the declared objective.

## Acceptance gate

- At least 20 versioned test cases.
- Retrieval hit@3 ≥ 90%.
- Citation precision ≥ 90%.
- Abstention accuracy = 100%.
- Every failed case remains in the report.
