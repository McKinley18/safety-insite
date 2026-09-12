# §203 — canonical effective grammar identity (Agent E)

**Provider calls = 0 · database operations = 0 · no executor wiring · §201/§202 modules and all
historical evidence byte-unchanged by this workstream.**

Deliverable for product-owner Ruling 7: the §201 grammar-identity implementation containing
dangerous equivalences is retired prospectively; this section supplies the canonical
`EFFECTIVE_GRAMMAR_IDENTITY` for prospective deterministic-contract-rejection caching.

## 1. Files

| file | role |
|---|---|
| `backend/scripts/lib/expert-203-effective-grammar-identity.ts` | the canonical identity, version `hazlenz.expert.203.effective-grammar-identity.v1` |
| `backend/scripts/test-203-grammar-identity.ts` | proof matrix, **45/45** |
| this document | evidence |

The module is **self-contained** — it imports nothing from the §201 or §202 modules, so retiring
either cannot orphan it. The §201 and §202 functions are imported by the **suite only**, read-only,
to *measure* the defects and differentials rather than remember them.

## 2. What was already right, and what §203 adds

§202 had already corrected §201's three dangerous equivalences and validated its projection against
the recorded §199 cohort. Decision: **retain §202's keyword classification as the base** (the
evidence below shows it is the empirically correct one) and close the gaps found by reading the
§202 module against Ruling 7's checklist:

| gap | §202 behaviour, measured by the §203 suite | §203 behaviour |
|---|---|---|
| G1 `dependentRequired` | name arrays fell to the generic leaf rule; `{a:["x"]}` **merged** with `{a:["y"]}` (B14) | names kept, arrays order-normalised — splits |
| G2 `unevaluatedProperties` / `unevaluatedItems` | boolean erased to `@boolean`; `false` **merged** with `true` (B15) — the same closed-vs-open collapse Ruling 7 forbids for `additionalProperties` | classified subschema-or-boolean — splits |
| G3 `minContains` / `maxContains` | values erased | grammar-literal — split |
| G4 union order / nullable representations | no declared decision | declared D2 (order kept, splits) and D3 (the two nullable forms split), both directionally safe for a rejection cache |
| G5 composed cache key | identity, provider scope and rejection signature never bound in one constructor | `grammarRejectionKey203` binds version + provider + model + rejectionSignature + measured schema stage + identity, **structurally encoded** |
| G6 proxy claims | prose only | `GRAMMAR_MEASUREMENT_CLAIMS_203`, machine-readable, all five members `false`, asserted by test |

## 3. The enum rule — measured, not assumed

Ruling 7 requires both "every provider-grammar-relevant structural distinction we can
deterministically identify" and "scenario data that does not affect grammar should not fragment the
identity". For `enum` these collide, because per-row scenario identifiers travel inside enum
members. All three candidate rules were **replayed against the recorded §199 evidence** (suite
cases D5–D9; reconstruction first validated against §199's own recorded contract ids, D1):

| candidate enum rule | partition of the 12 recorded rows | SG-02 after SG-01's recorded rejection |
|---|---|---|
| member VALUES kept | 12 classes of 12 | **issued** — the §200 defect reproduced |
| member LENGTH profile kept | 10 accepted rows split into 6 classes; SG-01 ≠ SG-02 | **issued** |
| **ARITY + member KINDS (§203, = §202 R4)** | **10 / 2, matching recorded provider behaviour** | **suppressed** |

The 10 accepted capability-ABSENT rows carry 10 distinct enum-value digests and 6 distinct
length profiles yet formed **one** provider behaviour class; the 2 rejected rows differ from each
other in both values and lengths yet carried the **same** recorded grammar-size fault (D9). On the
only recorded provider evidence this repository has, enum member content and length are **not** the
provider's discriminator. Keeping arity + kinds is the only candidate that reproduces the observed
partition. Residual risk is recorded as limit L1 (direction COARSER), contained by the run-scoped
cache exactly as §202 recorded.

This closes the obvious "§202's L1 says length is invisible — just add length" repair: **measured,
that repair reproduces the §200 defect** (D8).

## 4. Declared decisions (each tested)

- **D1** `type` arrays are sets — sorted (B12).
- **D2** union alternatives keep order — unsure cases must SPLIT for a rejection cache (B11, L7).
- **D3** `{type:["string","null"]}` vs `{type:"string",nullable:true}` split (B12, L8).
- **D4** annotation keys AND values dropped (§202's correction to §201, retained; C1–C3, B16).
- **D5** `format` kept; which schema stage is measured is the caller's declared choice (L4), and
  the stage is bound into the cache key so stages can never collide.

Safety direction, stated in code and enforced by the decisions above: for a REJECTION cache the
dangerous direction is the **false merge** — a would-be-accepted grammar inheriting a recorded
rejection. Every uncertain decision resolves toward splitting; a false split costs one cache miss.

## 5. AB203-5 input (received from Agent F via the orchestrator)

Agent F demonstrated by execution that the §202 rejection-cache key derivation is vulnerable to
delimiter injection: two distinct component tuples collide into one suppression key. The §203
composed key therefore uses **structural JSON encoding of the component array, never a string
join**; suite case **E8** crafts a pair whose naive delimiter-joined encodings are byte-identical
and proves the §203 keys differ. (During this repair a raw 0x1F control byte that had entered this
module's own join expression was found and removed; the module now contains no control bytes below
0x09 and no 0x1F, verified byte-wise.)

## 6. §199 cohort replay results (suite section D, 9/9)

- reconstruction reproduces §199's recorded contract ids verbatim (SG-01 `d0713f36696e8bea`,
  SG-02 `243bb6766c05599f`) — the results are about the run, not a fixture;
- partition **10 capability-ABSENT / 2 capability-PRESENT on both the wire and the sent schema**;
- §203 and §202 induce the **same partition** of this cohort (identities differ, classes agree),
  so the §199/§201/§202 capability-split finding carries forward under the new identity;
- replay of the recorded 12-step order: §203 key issues 11 and suppresses exactly SG-02; §200's
  `requestContractId` key issues 12 and suppresses nothing (defect reproduced as a difference).

## 7. Verification actually executed

| check | result |
|---|---|
| `npx ts-node scripts/test-203-grammar-identity.ts` | **45 passed, 0 failed** |
| `EXPERIMENT_SCOPE_TYPECHECK (§203)` — `tsc --noEmit -p tsconfig.scripts-203.json` | **0 diagnostics in this workstream's two files** (the single diagnostic present at run time was in `expert-203-successor-projection.ts`, another agent's in-flight file) |
| control-byte scan of both files (bytes < 0x09, 0x0B, 0x0C, 0x1F) | **0** |

Not claimed: repository-wide type cleanliness (`backend/scripts` baseline remains 181 diagnostics);
any provider behaviour beyond the recorded §199 cohort; provider equivalence of the identity.

## 8. Limits

Eight limits carried as data (`EFFECTIVE_GRAMMAR_IDENTITY_203_LIMITS`, L1–L8, list length asserted
by test so it cannot silently shrink): enum content/length invisible (L1, now with the measured
justification), description length invisible (L2, handled by the run-scoped cache), provider size
metric unknown (L3), measured-stage caller choice (L4, bound into the key), cohort-specific 10/2
(L5), zero provider exercise (L6), union order kept (L7, FINER), nullable representations split
(L8, FINER). **This identity remains a proxy**; the disclaimer and the five false claims travel as
fields of every description the module emits.

## AUTHORIZATION REQUIRED

None for this workstream. Wiring the identity or the composed key into any executor, and any
hosted validation of the partition, remain explicitly outside §203 (provider calls = 0).
