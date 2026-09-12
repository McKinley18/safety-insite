# §203 — ABF-5 successor implementation and fact-identity architecture analysis

**Agent C — identity collision engineer.** Provider calls: 0 · Database operations: 0 ·
Pre-existing files modified: 0. Date 2026-09-07.

## 1. What was implemented (Ruling 3)

The successor admission boundary `checkBindingDeclarations203`
(`backend/scripts/lib/expert-203-successor-binding.ts`, divergence **C1**) now widens the
ancestor's collision test. The ancestor (`owed-fact-binding.ts:204-208`, §187-pinned, unmodified)
refuses a nomination-key collision only when the existing fact is `UNRESOLVED`; on any terminal
status the nomination was admitted and then silently discarded by the frozen ledger's documented
exact-key no-op (`owed-fact-ledger.ts:163`) — §202's ABF-5, measured there as ABF-5.a…a3.

The successor behavior, per terminal status (`COVERED`, `SETTLED_BY_EVIDENCE`,
`REJECTED_BY_ARBITRATION` — the list is **derived** from `OWED_FACT_STATUSES` in
`expert-203-fact-identity-collision.ts`, so a future status member cannot fall outside the rule
by omission):

- the nomination is **refused at admission** with the explicit structural state
  **`FACT_IDENTITY_COLLISION`** — the narrowest boundary holding both identities (the nominated
  key and the ledger), before question projection and before any downstream binding;
- the existing terminal fact is preserved byte-unchanged and is **not** reopened;
- no replacement factKey is synthesized;
- no clarification is projected for the rejected nomination — `projectStructuralQuestions` reads
  only `check.admitted`, and the suite additionally proves it and provides
  `collisionQuestionProjectionViolations` as a checkable gate;
- the collision is exposed as a structured `FactIdentityCollisionDiagnostic` on
  `SuccessorBindingCheckResult.collisionDiagnostics`: both identities (existing status, source,
  span; nominated span, whyUnresolved), a byte-level span comparison, and the Ruling-3
  disposition carried as data;
- an `UNRESOLVED` collision keeps the ancestor refusal **verbatim** (code and detail sentence
  byte-identical, asserted against the frozen function).

**No semantic position is taken.** `semanticPosition: 'NONE_TAKEN'` is a literal field of the
diagnostic. The module records deterministic byte observations only; whether the collision is a
duplicate, a displaced distinct fact, or an identity-construction defect is left to a human with
both records. The B5 apply-time post-condition (`nominationOutcomeViolations`) remains in place
as defense in depth behind the admission refusal.

## 2. The nine regression cases — all pass (63/63)

| case | result |
|---|---|
| 1. no collision | admitted; fact added; supplied key admitted unmodified |
| 2. UNRESOLVED collision | ancestor refusal preserved; detail byte-identical to frozen output |
| 3. settled terminal (`COVERED`) | `FACT_IDENTITY_COLLISION`; every Ruling-3 disposition asserted |
| 4. every other terminal status | same, looped over the derived terminal list |
| 5. question projection after rejection | no question binds the collided key; sibling bound fact still projected; forged-question detector proven non-vacuous |
| 6. sibling independence | bound sibling applies to `COVERED`; a following sibling nomination admits normally |
| 7. repeated collision | byte-identical results; two refusals leave the ledger byte-identical to its start; in-batch repeat also names `DUPLICATE_DECLARATION_ID` |
| 8. diagnostic vs §202 silence | **differential**: the frozen path still admits → no-ops → `preservationViolations` = [] and `bindingSideEffects` = [] (ABF-5.a reproduced, frozen modules untouched); the successor refuses the same input with the structured diagnostic |
| 9. factKey stability | five representative non-colliding keys admitted as-is; admitted key sets byte-identical between successor and frozen paths |

Case 8 is the evidence of the fix: silence measured on the ancestor, loudness proven on the
successor, same input.

## 3. Identity-construction analysis (analysis only — nothing implemented)

**Question asked:** can semantically DISTINCT facts collide under realistic input?
**Answer: yes, and the exposure is structural, not hypothetical.** Two different identity regimes
coexist:

1. **Computed identity (first-pass projection).**
   `computeFactKey` (`expert-first-pass-owed-fact-projection.ts:200-215`) composes
   `STAGE.affectedDecision.observationSourceId.start-end.ordinal`. The wire deliberately has no
   `factKey` field — "a provider cannot name a fact" (`:33`). Distinct facts sharing stage,
   decision, source and span are separated only by `ordinal`, and ordinal assignment is
   order-dependent (Agent A's documented D1 divergence is a measured instance of that
   sensitivity). Within one analysis `seenKeys` refuses duplicates; **across** analyses or paths
   the same construction can both alias (same semantic fact, different key — which defeats
   exact-key dedup) and collide (different facts exchanging ordinals under reordering). The key
   also omits every content-bearing field (branches, decision divergence, whyUnresolved), which
   is deliberate — content dedup is a separate digest — but means the key alone cannot
   distinguish two genuinely different questions anchored on one span.

2. **Supplied identity (the binding/nomination boundary — where ABF-5 lives).**
   `NominationPayload.factKey` is a **provider-authored free string**. At this boundary (frozen
   and successor alike) it is blank-checked only — it is not even tested against
   `FACT_KEY_SHAPE`, and nothing reserves the computed-key namespace (`FP.`/`VN.` prefixes), so a
   provider can lexically occupy or accidentally echo any computed identity it has seen in its
   request context. A distinct new fact colliding with a terminal key is therefore REALISTIC
   under ordinary operation, not adversarial construction: the provider has the projected keys in
   view and echoing one back is a plausible failure mode. This asymmetry is the deep finding:
   **the first-pass wire denies the provider naming authority by construction, while the
   nomination contract requires the provider to exercise exactly that authority.**

`FACT_IDENTITY_COLLISION` handles the collision **event** correctly, but it cannot tell the
product owner which of the two situations produced it — that is why the diagnostic abstains.

### Recommendation to the product owner (decision required, not §203-authorized)

Identity revision **is warranted** for the successor contract. Options, with trade-offs:

- **Option 1 — validate the supplied key (interim, cheap).** At the successor nomination
  boundary: enforce `FACT_KEY_SHAPE`, and reserve the computed-key prefixes so a nomination
  cannot lexically occupy the projection namespace. Preserves both contracts; does not remove the
  underlying naming authority; collisions remain possible within the nomination namespace.
- **Option 2 — remove provider naming authority from nominations (recommended direction).**
  HazLenz computes the nominated fact's identity exactly as the first pass does (stage,
  affectedDecision, observationSourceId, HazLenz-measured span offsets, ordinal); the wire's
  `factKey` becomes at most a within-response handle. This aligns the nomination boundary with
  the projection's own published doctrine and with the standing principle that authority comes
  from binding to externally supplied identifiers, not from model-emitted values. Cost: the
  successor nomination contract needs the observation source id and span measurement available at
  the binding boundary, and the §167-era replay shapes that carry provider-authored keys remain a
  historical artifact to be read under the old contract.
- **Option 3 — content-bearing identity (digest of branches/divergence/span).** Distinguishes
  same-span distinct facts, but makes identity hostage to wording and would merge or split on
  paraphrase — the exact similarity-shaped dedup the ledger's design forbids. Not recommended.

Ordinal instability (the aliasing direction) is not fixed by any of the three alone and should be
part of the same decision. No option is implemented in §203.

## 4. Files created / modified (owned set only)

- created `backend/scripts/lib/expert-203-fact-identity-collision.ts`
- modified `backend/scripts/lib/expert-203-successor-binding.ts` (post-handoff: header C1 note,
  seam implementation, `collisionDiagnostics` on the result; B's B1–B5 divergences and guard
  integrations untouched)
- created `backend/scripts/test-203-identity-collision.ts`
- created this document
- `expert-203-successor-ledger.ts` was NOT created — A's no-ledger-copy design held; the frozen
  ledger is imported unchanged. Design deviations from A: none.

## 5. Verification executed

| check | result |
|---|---|
| `npx ts-node scripts/test-203-identity-collision.ts` | **63 passed, 0 failed** |
| `npx ts-node scripts/test-203-boundary-guards.ts` (B's suite, unmodified) | **52 passed, 0 failed** |
| `EXPERIMENT_SCOPE_TYPECHECK (§203)` — `npx tsc --noEmit -p tsconfig.scripts-203.json` | exit 0 |
| `npx ts-node scripts/verify-203-text-integrity.ts` | PASS — 16 files, 0 raw NUL |

No repository-wide type claim is made. Provider calls 0; database operations 0; no semantic
verdict supplied; adjudication remains 0/120.

## AUTHORIZATION REQUIRED

- The identity-construction revision (§3) — a successor-contract design decision for the product
  owner. Nothing in §203 blocks on it; `FACT_IDENTITY_COLLISION` is complete without it.
