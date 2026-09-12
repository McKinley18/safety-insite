# §193 — Verifier-v3.1 integration-readiness hardening

**2026-09-06 · zero-provider-call development slice**

```
PROVIDER_CALLS            = 0
DATABASE_OPERATIONS       = 0
DETERMINISTIC TESTS       = 46 / 46 PASS
SOURCE INTEGRITY          = PASS 23 / 23
PROTOCOL CHANGES          = 0   (no v3.2; v3 and v3.1 byte-unchanged)
COMMIT / PUSH / TAG / DEPLOY = NOT PERFORMED
```

## Terminal

```
EXPERT_HAZLENZ_VERIFIER_V3_1_CITATION_CONTRACT_MISMATCH —
REPRESENTATION_REVIEW_REQUIRED
```

**Why not `HARDENING_COMPLETE`.** That terminal requires citation enforcement to be *completed*. It
was not. The enforceable subset is now enforced — genuinely, on a path where nothing was enforced
before — but the class that FV-07 actually fell into cannot be deterministically decided, and
**FV-07 R1 and R3 remain admitted**. Claiming completion would misrepresent what the architecture
delivers. **The NUL / audit-tooling half of §193 is complete;** the terminal reflects the citation
half.

---

## What §192 state is preserved, unchanged

```
§192 MODEL-ADJUDICATED DEVELOPMENT VALIDATION   PASS — not reinterpreted as human acceptance
§189 FROZEN HUMAN SEMANTIC GATE                 UNMEASURED at 65 / 112
verifier-v3 historical population               ≠ verifier-v3.1 prospective population
verifier-v3.1                                   DEVELOPMENT VALIDATED, NOT YET CUSTOMER ACCEPTED
G7                                              15 / 18 — PASS exactly at threshold, zero slack
FV-11                                           preserved as observed; nothing excluded or reclassified
§192 admission results                          IMMUTABLE
```

The §193 replay is diagnostic and rewrites nothing. The 15/15 exclusion figure for FV-11 remains
sensitivity analysis only.

---

## Repair 1 — citation containment

**The mismatch.** The instruction says the verifier may not *"cite or quote a regulation"* and that
violating output is *"discarded"*. **Nothing enforced that on the verifier path.** Proof-suite A.3
and B.2 demonstrate a verdict containing `29 CFR 1910.212(a)(1)` being **ADMITTED** by the unchanged
v3 boundary.

**Canonical logic found and reused, not reinvented.** `CITATION_SHAPED_PATTERN` —
`/\b\d{2}\s*CFR\s*\d+/i`, `expert-contract.types.ts:701` — is the product's own
anti-citation-laundering mechanism, already applied to first-pass free text by
`expert-normalization.ts`. §193 applies that same decision to the verifier path.

**What is now closed.** `checkVerifierV3_1Output` composes the **unchanged** v3 admission with the
canonical boundary over every free-text field a verdict can carry — rationale, all four
`proposedClarification` fields, all nine `nominatedFact` fields, every `challengeReason` — refusing
**whole** with `PROHIBITED_REGULATORY_CITATION`.

**What is not closed, and this is the finding.** FV-07 wrote *"OSHA general industry requires the
work rest… not exceeding 1/8 inch"* — a regulatory requirement asserted in prose, no citation string.
The replay is unambiguous: **39/39 admitted before and after, 0 canonical violations, FV-07 not
refused.** The authorization's condition was refusal *if and only if* the outputs meet the canonical
definition. They do not.

**Why no broader rule.** Measured on the same 39 outputs: `\bOSHA\b` would refuse any verdict naming
the jurisdiction it was handed (the user prompt contains `JURISDICTION: osha-general-industry`);
`\bregulat` matches FV-11 and FV-13, where the verifier reasons **correctly** about the *absence* of
governed evidence — a false positive on the wanted behaviour. Both are keyword lists, retired at
§160 FINDING 1.

`REGULATORY_REQUIREMENT_ASSERTED_IN_PROSE = NOT_DETERMINISTICALLY_DECIDABLE` is recorded in code so
the module cannot later be "improved" into a matcher. The prompt text was **not** changed and the
contract was **not** silently weakened. Options for a separate authorization are in
`CITATION-ENFORCEMENT-ANALYSIS.md`; my reading is that rewording the claim is the smallest honest
change and a structured `regulatoryBasis` field is the one that actually closes the gap — but that is
a product-contract decision and §193 does not make it.

## Repair 2 — audit tooling (`AUDIT_TOOLING_RELIABILITY`)

**The bytes were intentional.** All four NULs in `expert-verifier-v2-v3-diff.ts` are a deliberate
delimiter in a composite map key — NUL chosen because it cannot collide with prompt-line content.
The design was sound; only the **encoding** was wrong, a literal control character where the source
should have carried the `\0` escape. Repaired accordingly, and **semantics proven identical**:
`classifyInstructionDiff` hashes to `9e143e0c…` before *and* after. The §166 suite importing it
re-runs 49/49.

**The failure mode that mattered** was not the bytes. `grep` returned no output and exit 0 on
patterns that were present — indistinguishable from a clean audit. Any grep-driven integrity scan
over that file would have reported clean while inspecting nothing. `expert-source-audit-integrity.ts`
adopts the rule that **an audit that cannot read its target must fail loudly**, via a discriminated
`SEARCHED | UNAUDITABLE` grep outcome.

The sweep caught a real instance on its first run — **the §193 test file itself**, where I had
written the NUL fixture as a literal control character. Recorded rather than quietly fixed, because
it is the best evidence the sweep works on something nobody planted for it.

---

## Versioning — no v3.2, and none needed

§193's citation enforcement is **shared admission/runtime logic in a new module**, not a protocol
change. The v3.1 prompt (`7e73d175…`) and schema (`d39c86bc…`) hash to exactly the values §192
preregistered, so the thirty-nine §192 executions stay attached to the protocol that produced them.
`expert-verifier-contract-v3.ts` was **composed with, never mutated** — its sha256 is pinned by
§192's preregistration. Same evidence-preserving principle as §191.

## No verifier semantic retuning

Conjunctive sufficiency, adjacent-property boundary, clarification policy, challenge behaviour,
owed-fact semantics, settlement authority and the v3.1 thresholds are all untouched. **G7 was not
optimised.** `PROVIDER_SETTLEMENT_AUTHORITY = NEVER`.

## Not claimed

Verifier-v3.1 customer accepted · the citation prohibition enforced as written · end-to-end Expert
HazLenz validation complete · the §189 human gate measured · §192 upgraded beyond a model-adjudicated
development validation · production or customer readiness.

## Next

**Fresh end-to-end Expert → owed-fact → verifier-v3.1 pipeline validation**, using raw observations
with **no hand-authored first-pass state** — the limit §192 recorded about itself. Not executed here.

Two things that authorization should also settle: the citation representation question above, and
the §192 fixture-design rule — *time/interval-dependent owed facts must supply the temporal rule
needed to determine whether the current state is actually deficient*, the lesson FV-11 produced.
