# §194 — Source diff

**Four files added. No existing runtime file was modified.**

```
NEW  backend/scripts/lib/expert-verifier-instruction-v3-2.ts    prompt + schema, built from v3.1
NEW  backend/scripts/lib/expert-verifier-contract-v3-2.ts       admission, composed from v3 + §193
NEW  backend/scripts/test-expert-194-regulatory-basis.ts        48 assertions
NEW  backend/scripts/verify-194-source-integrity-2026-09-06.ts  the §194 gate
```

Protocol identities in `V3_2-PROTOCOL-DIFF.md`. The full byte-level unchanged list is in
`SOURCE-INTEGRITY.txt`, recomputed from disk at 21/21.

## Why nothing was edited in place

Three prior versions are load-bearing and each is pinned by a preregistration or an integrity gate:

- `expert-verifier-instruction-v3.ts` — §187B's fifteen executions
- `expert-verifier-instruction-v3-1.ts` — §192's thirty-nine executions
- `expert-verifier-contract-v3.ts` — the admission logic **both** cohorts were scored under, pinned
  at `475a9577…` by §192's preregistration
- `expert-verifier-citation-boundary.ts` — §193 evidence

Editing any of them would detach results from the logic that produced them. §194 composes instead,
the same evidence-preserving principle §191 used for v3 → v3.1 and §193 used for the citation
boundary.

One consequence worth naming: when the §194 suite found that §193's `verifierFreeTextStrings` does
not scan the new `proposition` field, the fix went into **v3.2's contract**, not into the §193
module. §193 is closed evidence.
