# Accuracy report

The focused authenticated reasoning run is not a valid clean score because five requests returned HTTP 402 before reasoning. Of the 15 requests that reached reasoning, all scored 100% under the existing evaluator. The clarification gauntlet passed 10/10. This evidence supports the four targeted regressions but does not establish broad accuracy, full corpus coverage, or production readiness.

Safety controls remain conservative: no fabricated citation was observed in the focused run, and the guard, chemical, scaffold, and natural-gas fixes preserve candidate/unknown behavior when material evidence is absent.

