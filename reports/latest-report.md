# RAG evaluation report

Generated: 2026-09-16T05:07:51.141Z

> Synthetic local benchmark. These results are portfolio evidence for the evaluation method, not a production-performance claim.

## Summary

| Metric | Result |
| --- | ---: |
| Cases | 22 |
| Passed | 22 |
| Pass rate | 100.0% |
| Retrieval hit@3 | 100.0% |
| Mean reciprocal rank | 1.000 |
| Citation precision | 100.0% |
| Citation recall | 100.0% |
| Answer-point coverage | 100.0% |
| Abstention accuracy | 100.0% |
| p95 latency | 1.229 ms |

## Thresholds

- Retrieval hit@3 ≥ 90%
- Citation precision ≥ 90%
- Abstention accuracy = 100%
- Every failure remains visible; no cherry-picking cases

## Failed cases

No failed cases in this synthetic run.

## Limitations

- The corpus is small and synthetic.
- Retrieval is deterministic lexical matching, not the production Flowimax stack.
- Answer-point coverage uses normalized phrase matching and does not replace human review.
- Latency excludes network, hosted databases and external model calls.
