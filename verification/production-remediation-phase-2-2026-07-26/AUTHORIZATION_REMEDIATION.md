# Authorization remediation

Phase 1 organization equality on `GET /organization/:id` and invitation routes remains preserved. Report, inspection, corrective-action and dashboard service predicates remain intact.

No broad new authorization abstraction was introduced. Review showed substantial ambiguity between global regulatory/knowledge administration and tenant-owned review data, plus direct static upload access that cannot be scoped with the current URL model. Per the stop condition, those semantics were not invented.

Residual: route-level authorization objective is incomplete and blocks a pilot.
