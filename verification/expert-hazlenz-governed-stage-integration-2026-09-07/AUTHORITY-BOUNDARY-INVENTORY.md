# §202 — AUTHORITY-BOUNDARY INVENTORY

**Agent C — authority-boundary sweep.** Mode: analysis + bounded deterministic hardening.
**Provider calls: 0 · Database operations: 0 · Files modified: 0 · Files created: 4.**
Date 2026-09-07.

---

## What was swept, and how

The complete **development** Expert path, end to end:

```
raw observation
  -> first pass            expert-prompt.ts · expert-first-pass-instruction-vnext.ts
  -> transport             anthropic-expert-provider.ts · execute-199-structured-e2e-2026-09-07.ts
  -> declaration parsing   expert-normalization.ts · expert-first-pass-owed-fact-projection.ts
  -> projection            verifier-v3-development-boundary.ts::projectOwedFact
  -> OwedFact              owed-fact.types.ts · owed-fact-ledger.ts
                           (and the parallel scripts/lib/expert-owed-facts.ts)
  -> governed binding      expert-202-governed-binding-*.ts   [Agent B1 — READ ONLY, see G-1]
  -> verifier              expert-verifier-instruction-v3-2.ts
  -> admission             expert-verifier-contract-v3 -> v3-2 -> v3-3
  -> settlement            settlement-review.ts
  -> persistence           owed-fact-observability.ts
  -> customer-inactive     verifier-v3-development-boundary.ts · expert-authority-merge.ts
```

Method: comments were treated as **claims to be checked**, never as evidence. Every finding below
that is marked `DEMONSTRATED` was reproduced by **executing the real production function** in
`backend/scripts/test-202-authority-boundary-guards.ts` — not by reading. Anything reached by
reading alone is marked `READ_ONLY_EVIDENCE`, and anything I could not settle is marked
`UNVERIFIED`.

The machine-readable form of this inventory is `AUTHORITY_BOUNDARY_FINDINGS` in
`backend/scripts/lib/expert-202-authority-boundary-guards.ts`; the suite asserts the two agree.

---

## THE STRUCTURAL FINDING THAT GOVERNS EVERY OTHER ONE

**Every category-A fix in this sweep lands on a file whose sha256 is frozen.**

`verification/expert-hazlenz-required-structured-verifier-validation-2026-09-05/PREREGISTRATION.json`
pins four runtime files under `owedFactSourceHashes`, and eleven `verify-19x-source-integrity-*.ts`
scripts re-assert them:

| file | §187 pinned sha256 | recomputed 2026-09-07 |
|---|---|---|
| `owed-fact.types.ts` | `102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a` | identical |
| `owed-fact-ledger.ts` | `4fe3319046281bdbc6e527aad04042fa3892e4b4117a5a9c2362141144ab3701` | identical |
| `owed-fact-binding.ts` | `e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0` | identical |
| `verifier-v3-development-boundary.ts` | `5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245` | identical |

Two more are pinned elsewhere: `expert-prompt.ts` by `P187.firstPassIdentity.promptFileSha256`
(`bfe564c2…`, matches) and `scripts/lib/expert-verifier-contract-v3.ts` by
`P192.verifierIdentity.admissionValidatorSha256` (`475a9577…`, matches).

So the narrowest trust boundary that can enforce most of these invariants is, in three cases,
**inside a frozen verification contract**. Editing one under §202's own authority would mean
breaking a protected gate to obtain a better result, which the repository's operating instructions
forbid outright. Combined with the §202 file-ownership map — which assigns Agent C exactly four new
files and no existing one — the disposition is:

> **NO EXISTING FILE WAS MODIFIED. Every guard is a pure function in
> `expert-202-authority-boundary-guards.ts` with the exact signature its call site needs, and the
> one-line insertion each requires is recorded in `CALL_SITE_INSERTIONS` for the product owner to
> authorize.**

This is reported as a finding rather than as an obstacle: **the §202 authorization to perform
"bounded category-A hardening" and the §187 hash pin are in direct conflict, and only the product
owner can resolve it.** See AUTHORIZATION REQUIRED at the end.

---

## Category counts

| category | count | finding ids |
|---|---|---|
| **A** — pure deterministic enforcement defect | **5** | ABF-1, ABF-2, ABF-3, ABF-7, ABF-8 |
| **B** — architecture / policy decision required | **5** | ABF-4, ABF-5, ABF-6, ABF-9, ABF-10 |
| **C** — semantically dependent on §202 adjudication | **0** | — |
| **D** — false positive / documentation mismatch | **1** | ABF-11 |

Plus HIGH-1 and HIGH-2 (both **B**), dispositioned separately in `HIGH-1-HIGH-2-DISPOSITION.md`,
and one cross-agent operational finding (G-1).

Every category-A finding was nonetheless **left unimplemented at its call site**, for the ownership
and pin reasons above. Five insertions are recorded; **zero applied**.

---

# THE FINDINGS

Each entry states, in the order the task required: the invariant **as claimed** and **where**; what
**actually** enforces it today; the **narrowest boundary** that could; whether that boundary **has
the information**; and a **concrete reachable path** for an unsafe state.

---

## ABF-1 — the declaring stage is claimed to be validated and is not · **A** · DEMONSTRATED

**Claimed at** `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts:249-254` —
`OWED_FACT_FIELD_PROVENANCE`'s row for `source` records
`validation: 'member of DECLARING_STAGES; there is no wire field for it'`.
`DECLARING_STAGES` is declared at `:78`.

**Actually enforced by** nothing that names the fault. `projectDeclaredOwedFacts` writes
`source: input.stage as OwedFactSource` (`:625`) with no membership check anywhere in the file.

A non-member stage *is* refused today, by accident: `STAGE_KEY_PREFIX` (`:81-84`) has no entry for
it, `computeFactKey`'s `join('.')` (`:208-215`) renders the `undefined` prefix as the empty string,
the composed key acquires a leading `.`, and `FACT_KEY_SHAPE` (`:160`) refuses it at `:584-587`.

**Measured** (suite ABF-1.a / ABF-1.a2): stage `'DEVELOPMENT_HUMAN_TRUTH'` yields codes
`["COMPUTED_FACT_KEY_MALFORMED"]` with detail
`".REQUIRED_CONTROL.obs-1.39-77.1" is not a legal key`. No code mentions the stage.

**Narrowest boundary** `projectDeclaredOwedFacts` at entry (`:427`). **Has the information:** yes —
`DECLARING_STAGES` is in the same file.

**Reachable path** a caller passing `stage: 'DEVELOPMENT_HUMAN_TRUTH'`. That value is a legitimate
`OwedFactSource` (`owed-fact.types.ts:53`) and a PRODUCTION-forbidden one (`:65-66`). The key-shape
accident is the only thing stopping it. Add a third entry to `STAGE_KEY_PREFIX`, or give the lookup
a default, and the accident disappears while `source` stays unchecked — labelling model output as
fixture truth with `modelAuthored: false`, which is precisely the "ruler becoming part of the thing
measured" that `owed-fact.types.ts:60-66` exists to prevent.

**Guard** `declaringStageViolations`. **Insertion** recorded (unpinned file, not owned by Agent C).

---

## ABF-2 — a supplied evidence criterion is copied with an unchecked provenance · **A** · DEMONSTRATED

**Claimed at** `expert-first-pass-owed-fact-projection.ts:300-307` — `acceptableEvidence` is
`HAZLENZ_TASK_STATE`, "never authored here and never accepted from the provider" — and the refusal
code `ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ` (`:129`).

**Actually enforced by** `blank(c.requirement)` at `:602`. The code names a *provenance* check and
performs a *blank-string* check. `acceptableEvidence = c` at `:609` then copies the caller's
criterion whole, `provenance` included. Downstream, `owedFactDefects`
(`owed-fact-ledger.ts:83-85`) checks the requirement and nothing else — measured: it returns `[]`
for `provenance: 'NOT_A_MEMBER'`.

**Measured** (ABF-2.a … ABF-2.a4): a criterion `{requirement, provenance: 'MODEL_SELF_AUTHORED'}` is
copied verbatim onto the `OwedFact` and a `DEVELOPMENT` ledger admits it with no defect. So does a
provenance that is not a member of the closed set at all. **The `PRODUCTION` ledger DOES fail closed
on both** (`assertProductionAdmissible`, `owed-fact-ledger.ts:138-143`) — so this gap is
development-side only, and that is stated here rather than left for the red team to discover.

**Narrowest boundary** the projection at `:598-612`, for **membership**. The population question is
`createOwedFactLedger`'s and needs an argument the projection does not take.

**Reachable path** `acceptableEvidenceBySourceId` is an optional parameter that **no wired caller
supplies** — not `execute-197-structured-e2e-2026-09-07.ts:660-664`, not
`execute-199-structured-e2e-2026-09-07.ts:781-785`. The invariant is held shut by the current
callers omitting an argument. Any future caller supplying criteria from an adjudication label, a
fixture, or model output injects it straight into `OwedFact.acceptableEvidence`, which
`projectOwedFact` (`verifier-v3-development-boundary.ts:176`) then puts in front of the verifier.

**Guard** `suppliedCriteriaViolations` / `owedFactCriterionViolations`.

---

## ABF-3 — the HazLenz-owned-field scan does not look where the provider writes · **A** · DEMONSTRATED

**Claimed at** `owed-fact.types.ts:255-263` — `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`, "Fields a
provider may never return" — and `owed-fact-binding.ts:136`, "A provider may not return
HazLenz-owned task state, `acceptableEvidence` above all".

**Actually enforced by** `owed-fact-binding.ts:137-142`, which tests `forbidden in d` — the
**declaration** — and never inspects `d.nomination`, which is the object a provider populates.
This is §201 Agent 4's F5, verified independently.

**Measured** (ABF-3.a): a nomination carrying `acceptableEvidence`, `status`, `source` and
`modelAuthored` is **admitted with zero codes**. Four of them are then inert, because `owedFact()`
(`owed-fact-ledger.ts:90-100`) re-derives `status`, `source`, `modelAuthored` and
`acceptableEvidence` — measured at ABF-3.a2. `priority` is **not** inert: see ABF-4.

**Narrowest boundary** `checkBindingDeclarations`, inside the `NOMINATED_NEW` branch at `:179-209`,
where `n` is already in hand. **Has the information:** yes.

**Reachable path** any producer of a `ClarificationDeclaration` other than
`bridgeV3OutputToLedgerInputs`. Today the four inert fields cause no harm; the finding is that the
published invariant is true by downstream accident rather than at the boundary that states it.

**Guard** `nominationHazLenzOwnedFieldScan`. **Target file is §187-pinned.**

---

## ABF-4 — the nomination priority is provider-authored, and two contracts disagree · **B** · DEMONSTRATED

**Claimed at** `owed-fact.types.ts:12-13` — "Every field on `OwedFact` that decides anything is
populated by HazLenz" — and `expert-verifier-contract-v3.ts:548-550` — "a model-chosen priority
would let the provider promote its own nomination past a deterministic life-critical gap".

**Actually enforced by** `bridgeV3OutputToLedgerInputs`, a **caller**, at
`expert-verifier-contract-v3.ts:589` (`priority: opts.nominatedPriority ?? 'OTHER'`), and by
`FIRST_PASS_PROJECTED_PRIORITY` on the other path
(`expert-first-pass-owed-fact-projection.ts:105`). The binding boundary validates **membership
only** (`owed-fact-binding.ts:201-203`), and `LIFE_CRITICAL` is a member.

**Measured** (ABF-4.a): a nomination declaring `priority: 'LIFE_CRITICAL'` produces a ledger fact
with `priority: 'LIFE_CRITICAL'`, via `owed-fact-binding.ts:345` (`priority: n.priority`).

**Reachable path** `priority` decides `COVERAGE_PRIORITY_GATE` (`owed-fact-binding.ts:392-393`),
`PRIORITY_RANK` and `UNDROPPABLE_PRIORITIES` (`structural-questions.ts:168-171`) and
`UNRESOLVED_SAFETY_STATE` (`structural-questions.ts:236`).

**Why B and not A.** `NominationPayload.priority` is a **required** field of the nomination contract
(`owed-fact-binding.ts:70`) that the boundary explicitly validates, while
`PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` forbids a field of that name. **Two published contracts in one
directory contradict each other.** Refusing the field breaks every well-formed nomination; forcing
it to `'OTHER'` silently overrides a declared contract field. Choosing between them — and choosing
between refusal and a forced floor — is a product decision. The guard therefore reports it as
`PROVIDER_AUTHORED_NOMINATION_PRIORITY`, an advisory that is deliberately **not** a member of
`AUTHORITY_BOUNDARY_VIOLATION_CODES`.

---

## ABF-5 — an admitted nomination can be silently discarded · **B** · DEMONSTRATED · *highest consequence*

**Claimed at** `owed-fact-ledger.ts:7-17` — the ledger exists so that a displaced fact cannot
disappear invisibly — and `owed-fact-binding.ts:320-322`, "a nomination ADDS its fact".

**Actually enforced by** nothing. The collision refusal at `owed-fact-binding.ts:204-208` reads
`if (collision && collision.status === 'UNRESOLVED')`. On **any terminal status** the nomination is
admitted. `applyAdmittedDeclarations` then calls `nominateAdditiveFact` -> `addOwedFact`, and
`addOwedFact` returns the ledger **unchanged** when the key already exists
(`owed-fact-ledger.ts:163`).

**Measured** (ABF-5.a … ABF-5.a3), against a ledger whose only fact had been transitioned to
`COVERED`:

- the nomination is **admitted**, `codes: []`, and `nominationCount === 1`;
- the resulting ledger has the **same fact count**, and the pre-existing `COVERED` fact — with its
  own `evidenceSpan` — stands in for the nominated one;
- `preservationViolations(before, after)` returns `[]`;
- `bindingSideEffects(before, after, check)` returns `[]`.

So a genuinely new unresolved safety fact, with its own span, branches and decision divergence, is
discarded and **no existing audit notices**. `projectStructuralQuestions` will additionally emit a
question bound to that key (`structural-questions.ts:126-141`), so the customer-facing surface would
carry a question about a fact the ledger does not hold.

**Narrowest boundary** either `checkBindingDeclarations` (widen the collision test to all statuses)
or a post-condition on `applyAdmittedDeclarations`.

**Why B and not A.** Both candidate repairs contradict published design. Widening the collision test
changes a rule the code states specifically about `UNRESOLVED` keys. Making `addOwedFact` throw
contradicts `owed-fact-ledger.ts:152-158`, which states the exact-key no-op **is** the deduplication
policy and is "the ONLY deduplication performed anywhere". Choosing is the product owner's.

**Guard** `nominationOutcomeViolations` — a pure post-condition over keys the caller already has. It
adds detection without choosing between the two repairs, so it is safe to call today.

---

## ABF-6 — `mergeExpertIntelligence`'s fourth parameter is ungated, unlabelled and unaudited · **B** · DEMONSTRATED

This is §201 Agent 7's HIGH-4, verified independently and **extended**.

**Claimed at** `expert-authority-merge.ts:146-149` — `owedFactCoverage` is "Present ONLY when the
verifier-v3 development stage attached one, which requires
`EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` — a literal `false`".

**Actually enforced by** the absence of callers. The parameter is `owedFactCoverage?: unknown`
(`:176`), the function reads no gate, and the value is spread unconditionally (`:221`).
`MERGE_INVARIANTS` (`:227-239`) has no member covering it and `verifyMergeInvariants` (`:254-335`)
never reads it. Verified: the only call sites passing a fourth argument pass the literal `undefined`
(`test-expert-v3-development-integration.ts:177`,
`test-governed-acceptable-evidence-population.ts:396`).

**Measured** (ABF-6.a … ABF-6.a4), and this is the part §201 did not record:

```
mergeExpertIntelligence(det, gov, expert,
  { citation: '29 CFR 1910.147', approved: true, knowledgeReleaseId: 'forged-release' })
```

returns that object **verbatim** on the merged result, and `verifyMergeInvariants` returns **zero
violations**. The anti-citation-laundering predicates never run on it, because the fourth argument
does not pass through `normalizeExpertOutput` at all — the deep `findForbiddenFields` walk
(`expert-normalization.ts:218-228`) and `CITATION_SHAPED_PATTERN` (`:322-329`) are both bypassed.

Also measured: **protected authority is untouched** — `merged.authoritative` is byte-identical to
the three-argument merge and `governed.knowledgeReleaseId` is unchanged. The construction argument
in the module header holds. The defect is that a governance-shaped blob rides along **labelled as
nothing** on an object whose entire design premise (`:4-14`) is that a consumer can tell the three
authorities apart, and every other collection carries a `source`.

**Narrowest boundary** `mergeExpertIntelligence` itself, or an unforgeable attachment brand of the
kind `settlement-review.ts:230` already uses for `SettlementAuthority`.
**Has the information:** **no** — and that is the finding. The merge cannot read the gate without
importing `verifier-v3-development-boundary.ts`, which transitively imports the owed-fact module,
which is exactly the dependency `expert-authority-merge.ts:151-153` deliberately refuses.

**Why B.** Choosing between a gate import, a module-private brand token and a typed attachment is an
architecture decision; adding a member to `MERGE_INVARIANTS` additionally changes a published closed
set. **Do not implement.**

**Guard** `mergeOwedFactCoverageViolations` — reads the same gate constant the comment names, and is
callable from any test or call site today.

---

## ABF-7 — the projection's governance-field scan is shallow where the canonical one is deep · **A** · DEMONSTRATED

**Claimed at** `expert-first-pass-instruction-vnext.ts:326-328` — a non-compliant producer "is
refused by `additionalProperties: false` at the transport **and by `DECLARATION_FORBIDDEN_FIELDS` at
the boundary**". And at `expert-normalization.ts:214-217`, which states in terms that a top-level
check would pass `{extra: {citation: ...}}`, which is why `findForbiddenFields` recurses to depth 8
(`:218-228`).

**Actually enforced by** a **top-level scan only** — `for (const forbidden of
DECLARATION_FORBIDDEN_FIELDS) if (forbidden in d)`
(`expert-first-pass-owed-fact-projection.ts:462-467`) — plus a citation scan limited to the eight
named `DECLARATION_FREE_TEXT_FIELDS` (`:141-144`, applied at `:552-560`).

**Measured** (ABF-7.a): a declaration carrying
`extra: { citation: '29 CFR 1910.147', approved: true }` is **admitted with zero codes**.

**Narrowest boundary** the projection at `:462-467`. **Has the information:** yes — the deep walk
already exists eight files away and uses the same imported constant.

**Reachable path** the only thing refusing it today is `applyStrictSchemaWrapper`'s
`additionalProperties: false` (`anthropic-expert-provider.ts:129-136`) — a keyword the **provider**
honours, not a check HazLenz performs — and it is absent entirely for any non-transport caller of
the projection (a replay, a fixture harness, a governed-stage prototype). The instruction file names
two layers of defence; only one of them is a HazLenz boundary.

Scoped honestly: the vNext comment's specific claim, about `governedEvidenceSourceIds`, **is**
accurate, because that field is top-level. The gap is the other names in
`FORBIDDEN_EXPERT_FIELD_NAMES` when nested.

**Guard** `nestedForbiddenGovernanceFields` — the same walk over the same imported constant, with
depth 0 deliberately excluded so it closes a gap rather than double-reporting an existing refusal
(asserted at ABF-7.c2).

---

## ABF-8 — the nomination ceiling is a default parameter and nothing else · **A** · DEMONSTRATED

**Claimed at** `scripts/lib/expert-owed-fact-binding.ts:134` — "`maxNominations` is 1 by default —
the frozen v2 ceiling — and is a parameter only so the proof suite can exercise the refusal path
without editing the contract".

**Actually enforced by** the default parameter value (`owed-fact-binding.ts:122`). There is **no
named ceiling constant anywhere in `backend`** — asserted mechanically at ABF-8.a2.

**Measured** (ABF-8.a): five nominations, one call. Default -> 1 admitted. `maxNominations: 5` -> 5
admitted.

**Reachable path** a caller passing a wider ceiling. Verified: **the only four-argument call to
`checkBindingDeclarations` in the whole repository is §202's own demonstration** — an AST-bracket-
aware scan of `backend/scripts` and `backend/src` finds no other.

**Honest mitigation, stated rather than omitted:** the ceiling is genuinely real on the v3 path by a
different mechanism — `ExpertVerifierV3Output.nominatedFact` is a **single object, not a list**
(`expert-verifier-contract-v2.ts:117`, `:41`), so no v3 verdict can produce two. The parameter is
defence in depth whose depth is one caller's default.

**Guard** `nominationCeilingViolations`, against a named `FROZEN_NOMINATION_CEILING`.
**Target file is §187-pinned**, so the constant is named in the guard module instead.

---

## ABF-9 — provider priority reaches the question surface even when it cannot reach the fact · **B** · DEMONSTRATED

**Claimed at** `expert-first-pass-owed-fact-projection.ts:88-104` — "the wire has no priority field
and a provider cannot escalate itself", with the cost recorded honestly in
`PROJECTION_RESIDUAL_LIMITS` (`:353-362`).

**Actually enforced by** `FIRST_PASS_PROJECTED_PRIORITY` on the fact path, and by **nothing** on the
question path. `structural-questions.ts:138` reads
`priority: fact?.priority ?? d.nomination?.priority ?? 'OTHER'`. When the nomination has not yet been
applied to the ledger — which is the state on the very call that projects it, because
`projectStructuralQuestions` takes the ledger and `applyAdmittedDeclarations` is a separate call —
`fact` is `undefined` and **the provider's value is used**.

**Measured** (ABF-9.a … ABF-9.a3): with a deterministic `LIFE_CRITICAL` fact in the ledger and a
provider nomination declaring itself `LIFE_CRITICAL`, under `selectQuestionsForBudget(..., 1)`:

- the **provider-escalated question is `SELECTED`**;
- the **deterministic life-critical question is `SUPPRESSED_BY_BUDGET`**.

**Scoped honestly, and this matters:** `UNRESOLVED_SAFETY_STATE` is **not** fabricated by this. It
is computed from ledger facts (`structural-questions.ts:226-228`) and correctly reported `true` with
`unresolvedLifeCriticalFactKeys = ['owed:securement']` in the same measurement. The effect is
**ordering and suppression of the customer-visible question**, not a forged safety state.

**Narrowest boundary** `projectStructuralQuestions` at `:126-141`.

**Why B.** Removing `d.nomination?.priority` from the fallback chain changes what a not-yet-applied
nomination ranks as. Whether that is a repair or the loss of intended function is a product
decision, and `structural-questions.ts` is not an Agent C owned file.

**Guard** `structuralQuestionPriorityViolations` — reports the divergence, chooses no replacement.

---

## ABF-10 — the citation prohibition's blind spots · **B** · DEMONSTRATED · **deliberately not repaired**

**Claimed at** `expert-contract.types.ts:696-700` — `CITATION_SHAPED_PATTERN` is "the
anti-citation-laundering contract applied to free text, not only to field names".

**Actually enforced by** `/\b\d{2}\s*CFR\s*\d+/i` (`:701`), which requires the literal token `CFR`
after exactly two digits; and by an exact, case-sensitive `Array.includes` over
`FORBIDDEN_EXPERT_FIELD_NAMES` (`expert-normalization.ts:225`).

**Measured** through the real §196 projection (ABF-10.a):

| form | outcome |
|---|---|
| `29 CFR 1910.147` | **refused** — `PROHIBITED_REGULATORY_CITATION` |
| `29 C.F.R. 1910.147` | admitted |
| `1910.147` | admitted |
| `§ 1910.147` | admitted |
| `1926.501(b)(1)` | admitted |

**NOT REPAIRED, and the refusal is the finding.** Broadening a citation regex is deciding *what
counts as a citation* — semantic inference inside deterministic code. A guard that re-derives
meaning is worse than the gap it closes, and this programme has retired matchers of exactly that
shape before. Escalated as a representation question for the product owner. The suite asserts
(ABF-10.b) that the guard module executes **no** `test`/`exec`/`match`/`search`/`RegExp` anywhere,
and (ABF-10.b2) that every membership decision reads an **imported** closed set rather than a
restated one.

---

## ABF-11 — the model-identity check is opt-in · **D** · READ_ONLY_EVIDENCE

`expert-runner.ts:186-189` states "A provider that answers as a model other than the one it was
qualified as has invalidated the qualification", and `:190-191` runs the check only when
`provider.qualifiedModelIdentity !== null`.

This looks like the defect class and **is not one**: `expert-provider.ts:130` documents the
condition explicitly — "`null` means identity is not checked" — and
`UnavailableExpertProvider` (`:146`) is the only provider in `src` that declares `null`. Both real
adapters bind it to their configured model (`anthropic-expert-provider.ts:233`,
`ollama-expert-provider.ts:97`), and `expert-cohort-harness.ts:352-355` refuses a provider whose
qualified model differs from the frozen cohort's before any request. The code matches its
documentation. **Classified D; no change recommended.**

---

# Boundaries checked and found SOUND

Recorded so the inventory can be checked rather than only read.

1. **The customer-inactive boundary holds.** Re-verified independently, all four ways:
   `grep -rn --include='*.ts' "expert-hazlenz" backend/src` outside the Expert directories returns
   **zero**; `grep -i expert backend/src/safescope-v2/safescope-v2.module.ts` returns **zero**; the
   only `require(`/`import(` hit inside the Expert layer is a regex literal
   (`expert-measurement-contract.ts:646`). `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false`
   (`verifier-v3-development-boundary.ts:41`) is a literal type reading no configuration.
2. **`SettlementAuthority` cannot be forged.** `settlement-review.ts:230` uses a real module-private
   `unique symbol`, never exported, so the brand holds at runtime and not only at compile time. This
   is the pattern ABF-6 should probably adopt.
3. **`transition()` is the only exit from `UNRESOLVED`**, it refuses a non-member authority and an
   authority/status mismatch (`owed-fact-ledger.ts:189-226`), and it preserves `whyUnresolved` onto
   the transition record before nulling it (`:210`, `:223`).
4. **`nominateAdditiveFact` cannot express replacement** (`owed-fact-ledger.ts:173-179`): it takes no
   key to remove.
5. **`owedFact()` derives `modelAuthored` from `source`** so no call site can disagree
   (`owed-fact-ledger.ts:98`), and `owedFactDefects` refuses a mismatch (`:79-81`) — measured
   indirectly at ABF-3.a2.
6. **The top-level declaration scan works.** A `BOUND_TO_OWED_FACT` declaration carrying
   `acceptableEvidence` is refused with `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD` (ABF-3.c3).
7. **`consumeSettlementClaims` changes nothing** — `ledgerUnchanged` is the literal `true` and the
   fact remains `UNRESOLVED` after consumption (HIGH-2.c), and its structural sanity check still
   fires on a forged `settles: true` (HIGH-2.b).
8. **`selectQuestionsForBudget` validates its budget** (`structural-questions.ts:200-202`) and
   records no transition.

---

# G-1 — CROSS-AGENT OPERATIONAL FINDING (observed, then resolved by Agent B1 mid-run)

**Recorded because it happened, not because it is still broken.**

On the first execution of the required regression set,
`backend/scripts/test-expert-193-hardening.ts` failed one assertion:

```
FAIL  G.1 no unauditable file remains under backend/scripts
      -- backend/scripts/lib/expert-202-governed-binding-contract.ts
```

`checkFileAuditability` reported that file as
`{ auditable: false, failures: ['EMBEDDED_NUL_BYTE'], nulCount: 1, bytes: 64695 }`. The file is
**Agent B1's**, concurrently in progress; Agent C did not touch it. Agent C's own two files were
checked with the same function at the same moment and were clean (`auditable: true`, `nulCount: 0`).

On the final execution the same file reports
`{ auditable: true, failures: [], nulCount: 0, bytes: 64700 }` and
`test-expert-193-hardening.ts` reports **46 passed, 0 failed**. Agent B1 repaired it during the run.

It is kept in this inventory for one reason: `expert-source-audit-integrity.ts` exists precisely
because "a text audit over this file would report no matches while inspecting nothing". While the
NUL byte was present, **any source-scanning gate running over B1's file was at risk of a false
clean** — including gates that reported success. Whether any §202 result was produced during that
window is B1's and the orchestrator's to check, not Agent C's.

# Items I could NOT settle — recorded as UNVERIFIED

- **UNVERIFIED-1.** Whether Anthropic's `strict` tool-schema mode actually rejects a nested
  additional property in every case, which is the premise behind ABF-7's "held shut by the
  transport". Establishing it requires a provider call, which §202 forbids. Treated throughout as an
  *unverified* mitigation rather than as a guarantee.
- **UNVERIFIED-2.** §201 V-1 (repeated spans producing an ambiguous `indexOf` anchor). I did not scan
  the §197/§199 cohort observations for a repeated candidate span and therefore cannot say whether a
  real row exhibits it. `expert-prompt.ts:1610` and
  `expert-first-pass-owed-fact-projection.ts:495` both take the first occurrence; that much is read.
- **UNVERIFIED-3.** §201 V-3 (`PLACEHOLDER_CITATION_MARKERS` spelling in the live registry). I did
  not read the registry.
- **UNVERIFIED-4.** Whether any Agent B1 governed-stage code introduces a new authority boundary.
  The module was treated as read-only per the ownership map, and for part of the run a text scan over
  it was untrustworthy (G-1). **No claim of any kind is made about the governed stage's invariants.**

---

# Corrections to the §201 register, from independent verification

The task required not taking the §201 write-up on trust. Three of its claims are imprecise:

1. **MED-9** states `execute-199-structured-e2e-2026-09-07.ts` "uses exactly two owed-fact symbols".
   It imports **four**: `projectDeclaredOwedFacts`, `resolveClarificationLinks`, `computeFactKey`
   (`:62`) and `projectOwedFact` (`:66`). §197 additionally imports `createOwedFactLedger` (`:71`).
   The register's conclusion — that the chain terminates at admission — still holds; the count does
   not.
2. **HIGH-1** cites `expert-verifier-contract-v3.ts:519` as driving the scripts prototype. That line
   is a **doc comment**; the file imports neither owed-fact module (its only imports are `:41-50`).
   The real prototype driver is `execute-verifier-v3-scoped-falsification-2026-09-04.ts:62-69`. The
   substantive finding is unaffected and is confirmed below.
3. **HIGH-2**'s framing is corrected in `HIGH-1-HIGH-2-DISPOSITION.md`.

---

# AUTHORIZATION REQUIRED

1. **The §202 "bounded category-A hardening" authorization conflicts with the §187 hash pin.** Three
   of the five category-A guards (ABF-3, ABF-8, and any population-aware form of ABF-2) have their
   narrowest boundary inside `owed-fact-binding.ts` or `owed-fact-ledger.ts`, both sha256-pinned by
   §187 and re-asserted by eleven gates. Applying them requires an explicit authorization to change
   the pinned files **and** to re-pin, which is an evidence-directory action §202 forbids. **Product
   owner decision required.**
2. **ABF-4** — which contract wins, `NominationPayload.priority` (required) or
   `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` (forbids it), and whether the remedy is refusal or a forced
   floor.
3. **ABF-5** — whether a nomination colliding with a terminal-status key should be refused, or
   whether `addOwedFact`'s no-op should stop being silent. Both contradict a published rule.
4. **ABF-6** — gate import vs. module-private brand vs. typed attachment for `owedFactCoverage`, and
   whether `MERGE_INVARIANTS` gains a member.
5. **ABF-9** — whether `d.nomination?.priority` should leave the question-priority fallback chain.
6. **ABF-10** — the citation-representation question, escalated rather than patched.
7. **HIGH-1 and HIGH-2** — see the companion document.
8. **npm / tsconfig entries** (orchestrator-owned, listed for application):
   ```
   "test:202-authority-boundary-guards": "ts-node scripts/test-202-authority-boundary-guards.ts"
   ```
   and, in `backend/tsconfig.scripts-202.json`, the two files
   `scripts/lib/expert-202-authority-boundary-guards.ts` and
   `scripts/test-202-authority-boundary-guards.ts`.

---

# Verification actually executed

| suite | result |
|---|---|
| `npx tsx backend/scripts/test-202-authority-boundary-guards.ts` | **83 passed, 0 failed** |
| `test-196-structured-first-pass-owed-facts.ts` | **92/92 PASS** |
| `test-198-transport-remediation.ts` | **89/89 PASS** |
| `test-199-successor-protocol.ts` | **43/43 PASS** |
| `test-expert-193-hardening.ts` | first run **45 passed, 1 failed** (G-1, Agent B1's file); final run **46 passed, 0 failed** after B1 repaired it |
| `test-expert-194-regulatory-basis.ts` | **48 passed, 0 failed** |
| `test-expert-verifier-v3-binding-protocol.ts` | **49/49 PASS** |
| `test-expert-v3-development-integration.ts` | **40/40 PASS** |
| AGENT_C_SCOPE_TYPECHECK (`tsc --noEmit`, the two §202 Agent C files only) | **0 diagnostics** |

**Evidence-immutability check, stated precisely.** `git status --porcelain verification/` is a *weak*
check here, because most `verification/` directories are untracked as wholes, so a file added inside
one would not change the porcelain line. The check that actually bears weight is the **recomputed
sha256 of the four §187-pinned runtime files**, asserted in the suite (`PIN.*`, four assertions) and
tabulated at the top of this document: all four are identical to the preregistered values, as are
`expert-prompt.ts` (`bfe564c2…`) and `expert-verifier-contract-v3.ts` (`475a9577…`). Beyond that, the
seven regression suites were each checked for write primitives before execution: only
`test-expert-193-hardening.ts` writes, and only into `mkdtempSync` temporary directories
(`:15`, `:166`, `:181`).

**Agent C created exactly four files and modified none:**

| path | sha256 |
|---|---|
| `backend/scripts/lib/expert-202-authority-boundary-guards.ts` | `d02ae46237a3bf719f561bd1e0c3433bc565f4bac6f5229980b06b4e25872960` |
| `backend/scripts/test-202-authority-boundary-guards.ts` | `756a3217663f36d2362629aaaddde36e7feb5ba1c52fbbc944cc864a98ccee8e` |
| `…/AUTHORITY-BOUNDARY-INVENTORY.md` | this file |
| `…/HIGH-1-HIGH-2-DISPOSITION.md` | companion |

**Provider calls: 0. Database operations: 0. Existing files modified: 0. Commits, pushes, branches,
deploys: 0.**
