# Current HazLenz Pipeline

1. `POST /safescope-v2/classify` accepts text, scopes, evidence text, visual attachments, structured observation, prior structured observation, and clarification answers.
2. `SafescopeV2Controller` derives governance context and calls `SafescopeV2Service.classify`.
3. The service normalizes the prior/current structured observation and clarification answers, merges them, detects some contradictions, and flattens structured fields into evidence text.
4. A weighted text classifier selects a classification. Primary-promotion logic may then replace it.
5. Risk is calculated early from the promoted classification and fused text.
6. Scope normalization and the knowledge router select jurisdiction, shard, sources, and bundles.
7. Applicable-standards retrieval, inspection intelligence, expert applicability rules, citation ranking/recovery, standards hydration, and later fallback paths build candidate citations.
8. Clarification generation combines deterministic questions with existing pipeline questions.
9. Scenario, mechanism, risk, confidence, corrective-action, and output-policy components enrich the result.
10. `enforceHazLenzEvidenceBoundary` and display sanitation apply at the controller boundary.
11. The frontend separately persists the returned object as an immutable `HazLenzAnalysis.resultSnapshot`.
12. Human review and finding finalization are separate persisted records.
13. Report generation snapshots observations, analyses, reviews, findings, and actions.

## Structural loss and duplication

- Structured facts are converted back into prose before classification; provenance and predicate status are not first-class inputs to all downstream stages.
- Facts use heterogeneous arrays/strings rather than one canonical fact record.
- Narrative keyword classifiers can outrank explicit safe-state or threshold evidence.
- Risk is computed before regulatory applicability is settled.
- Multiple standards candidate, ranking, recovery, and fallback paths compete.
- Applicability results are not a single authoritative decision ledger.
- Clarification questions are often generic because material missing predicates are not explicit.
- Persistence stores a result snapshot but not a separately queryable, versioned evidence snapshot.
- The closure API boundary can demote output, but it cannot repair missing life-safety candidate generation upstream.
