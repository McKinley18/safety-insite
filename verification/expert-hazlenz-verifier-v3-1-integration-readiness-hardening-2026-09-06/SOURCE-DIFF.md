# §193 — Source diff

Two repairs, one additive and one in-place. **No verifier prompt, schema, contract or semantic
instruction was modified.**

## Added — citation containment

```
NEW  backend/scripts/lib/expert-verifier-citation-boundary.ts
```

Composes the **unchanged** `checkVerifierV3Output` with the canonical `CITATION_SHAPED_PATTERN`
imported from `expert-contract.types.ts`. Exports `checkVerifierV3_1Output`,
`checkVerifierCitationContainment`, `verifierFreeTextStrings`, `PROHIBITED_REGULATORY_CITATION`, and
`CITATION_BOUNDARY_RULE_CLASSIFICATION` — which records in code that
`REGULATORY_REQUIREMENT_ASSERTED_IN_PROSE` is `NOT_DETERMINISTICALLY_DECIDABLE`, so a later reader
cannot "improve" the module into a keyword list without contradicting it.

**Why a new module rather than editing `expert-verifier-contract-v3.ts`:** §192's preregistration
pins that file's sha256 (`475a9577…`). Mutating it would detach the thirty-nine §192 executions from
the admission logic that produced them. Same evidence-preserving principle as §191.

## Added — audit tooling

```
NEW  backend/scripts/lib/expert-source-audit-integrity.ts
NEW  backend/scripts/replay-193-citation-boundary-2026-09-06.ts
NEW  backend/scripts/test-expert-193-hardening.ts
NEW  backend/scripts/verify-193-source-integrity-2026-09-06.ts
```

## Repaired in place — the only existing file touched

```
backend/scripts/lib/expert-verifier-v2-v3-diff.ts
before  d5405204afcabe14cdc68bff92987423df5acd5035cce68f5e4282579d201a99   20206 bytes   4 NUL
after   ebc687252ee615a2df2603adacd66a07b0a660ac725f017678745756ecc4571d   20210 bytes   0 NUL
```

Four literal `U+0000` bytes → the two-character escape `\0`, at bytes 12734, 14032, 14125 and 14326.
`+4 bytes` is exactly the four one-character-to-two-character substitutions. Conceptually:

```diff
- const keyOf = (op: DiffOp, line: string): string => `${op}<U+0000>${line}`;
+ const keyOf = (op: DiffOp, line: string): string => `${op}\0${line}`;

- unclassified.push(`UNCLASSIFIED_CHANGE: ${k.replace('<U+0000>', ' ')}`);
+ unclassified.push(`UNCLASSIFIED_CHANGE: ${k.replace('\0', ' ')}`);

- unclassified.push(`COUNT_MISMATCH: ${k.replace('<U+0000>', ' ')} — table ${d}, actual ${n}`);
+ unclassified.push(`COUNT_MISMATCH: ${k.replace('\0', ' ')} — table ${d}, actual ${n}`);

- stale.push(`STALE_CLASSIFICATION: ${k.replace('<U+0000>', ' ')} (table ${n}, actual 0)`);
+ stale.push(`STALE_CLASSIFICATION: ${k.replace('\0', ' ')} (table ${n}, actual 0)`);
```

The runtime string is identical in every case. Proven, not asserted: `classifyInstructionDiff`
exercised on inputs driving both `keyOf` call sites and both `.replace` paths hashes to
`9e143e0c928d49de83db82d45bb41a1aa2e0f6ce92e462365420c8f5771c076d` **before and after**. The §166
suite importing this module re-runs 49/49.

## Not modified

```
expert-verifier-instruction-v3.ts        v3 prompt 678160c9…  schema 1bddc1a5…
expert-verifier-instruction-v3-1.ts      v3.1 prompt 7e73d175…  schema d39c86bc…
expert-verifier-contract-v3.ts           475a9577…
expert-contract.types.ts                 CITATION_SHAPED_PATTERN imported, not edited
expert-prompt.ts, owed-facts/*           §187-frozen hashes
§187 / §188 / §189 / §190 / §192 evidence
```

**No v3.2 was created and none was needed.** §193's citation enforcement is shared admission/runtime
logic sitting beside the protocol, not a change to it — so §192 remains attached to the hashes that
produced it. Had the prompt's prohibition wording been changed, that *would* have required a
prospective version; it was not changed, and the recommendation to change it is escalated instead.
