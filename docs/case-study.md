# Case study: making RAG quality reviewable

## Context

A RAG demo can sound convincing while retrieving the wrong evidence, citing irrelevant chunks or answering a question the corpus cannot support. A reviewer needs repeatable evidence, not a hand-picked conversation.

## Goal

Create a small evaluation artifact that another engineer or client can run locally, inspect case by case and adapt to a private system without exposing private documents.

## Approach

I separated the system adapter from the evaluator. The adapter returns an answer, citations, ranked evidence IDs, abstention status and latency. The evaluator compares that output with a versioned contract containing expected evidence and answer points.

The public demonstration uses a fictional corpus and deterministic lexical retrieval. This makes the run free and reproducible while keeping the quality framework independent of any production implementation.

## Delivered evidence

- 22 versioned cases, including unsupported questions that must be refused.
- Retrieval hit@3 and mean reciprocal rank.
- Citation precision and recall.
- Answer-point coverage and abstention accuracy.
- Per-case JSON plus a concise Markdown report.
- Unit tests, GitHub Actions and a pre-publication privacy audit.

## Result

All included synthetic cases pass the declared gates. This result shows that the evaluation workflow behaves as specified on its included fixtures. It is intentionally not presented as production accuracy or customer impact.

## Security decisions

- No production corpus, customer prompt, private endpoint or environment file.
- Synthetic IDs and fictional operational policies only.
- Private terms remain in a local ignored denylist.
- The publication audit checks candidate files and the complete commit history.
- A private adapter can be evaluated locally without committing documents or outputs.

## Trade-offs and limitations

- Lexical retrieval is transparent and reproducible but does not measure semantic retrieval quality.
- Phrase-based answer coverage is useful for deterministic regression checks but does not replace human or model-based grading.
- Local latency excludes networks, hosted storage and model inference.
- A small synthetic corpus cannot represent production distribution shifts.

## Next engineering step

Implement the same adapter contract for a private local endpoint, keep the private run artifacts outside this repository and compare versioned results by failure category.
