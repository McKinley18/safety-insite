# §259 — Contract Representation Successor: H3/H4 Carrier Coherence

Provider calls: **0**. Database operations: **0**. Pushes, tags, deployments: **0**. `main` not used.

Provider self-cross-reference between parallel semantic carriers is removed. Every safety invariant
is preserved at equal strictness, and two new fail-closed conditions are added.

**CASE A.**

The full carrier map is in `SECTION-259-REPRESENTATION-MAP.md`, written before any edit, and is the
answer to deliverables 1 and 2. This report states the change and the proof.

---

## 3. Exact root representation defect

Two distinct defects presenting as one failure family.

**H3 — the authoritative structural reference already existed and the rule did not read it.**
Coverage was computed over `requiredBy ∪ acceptedWithoutImmediateAction` only. The posture's third
reference-bearing member, `resumeCondition.resolvedByDeclarationIds`, names declarations **by their
stable identifier** and is already validated against invention. On §254 H3 the model named
`decl-slab-capacity` there, as the condition gating resumption, and the analysis was still refused
for not covering it. No provider bookkeeping was ever actually required; the rule was incomplete.

**H4 — a control had no identity, so prose was forced to serve as identity.**
`RequiredControl233` is `{ control, timing }`. The only way to name a control was to reproduce its
text, so the contract mandated duplicate natural-language content and adjudicated safety on string
equality. On §254 H4 the model authored one control and referred to it in different words with the
same actor, the same two clock times and the same three outcomes.

## 4 and 5. Source-of-truth model

| entity | before | after |
|---|---|---|
| Unresolved fact | `declarationId`, referenced by id everywhere. Correct already | unchanged; the coverage rule now **reads** the id reference it was ignoring |
| Hazard candidate | `candidateKey`, referenced by id. Correct already | unchanged |
| **Required control** | **the prose is the identity**, copied verbatim into `dischargingControlRef` | **`controlId`**, referenced by id. The prose is authored exactly once |

Controls were the only entity in the contract not already referenced by stable identity. After
§259 no duplicated natural-language content remains on any affected path, and no location carries a
second independent authorship of the same fact.

---

## 6. Files changed

| file | change |
|---|---|
| `contract/expert-259-control-identity-contract.ts` | **new.** The additive successor to §253 |
| `contract/expert-233-posture-projection.ts` | P3 coverage reads the resume condition |
| `contract/expert-247-role-justification-projection.ts` | M8 resolves by `controlId`; two new codes |
| `expert-hazlenz-analysis.ts` | selects the §259 builders |
| `expert-hazlenz-adapters/anthropic-expert-provider.ts` | **PROTECTED MODULE.** selects the same builders |
| `scripts/test-259-carrier-coherence.ts` | **new.** The generalized fixtures |
| `scripts/verify-252-admission-matrix.ts` | baseline moved to the successor representation |
| `scripts/test-247-driver-role-and-k6.ts` | three M8 fixtures moved to identity |

### The protected-module change, flagged explicitly

`anthropic-expert-provider.ts` is one of the 29 protected modules. It was modified.

    was 5077d9feb0207216f6907d79a6a831b20b5611ce706bc7be7709adb271832d7c
    now 9878b580a4939df734bb4aebb63ce4b89862098e9b31f357f259828e79c0cefb

The change is an import swap and two call sites. It is **not opportunistic**: the candidate identity
requires the production entry point and the adapter to reproduce **one** wire schema, checked by
`adapterIsSuccessor` in the identity derivation, so a schema successor that moved only the entry
point would break the identity by construction. §249 and §253 moved this same file for the same
reason. It is called out here rather than absorbed silently, and it is the one item in §259 that
warrants explicit ratification.

The other 28 protected modules are unchanged: **28 matching, 1 changed, 0 missing.**

## 7. Exact representation change

**H3, deterministic only.** Coverage becomes the union of three model-authored id references:

```ts
const coveredDeclarations = new Set<string>([
  ...[...requiredBy, ...accepted]
    .filter(r => r.refKind === 'UNRESOLVED_DECLARATION').map(r => r.ref),
  ...resume.resolvedByDeclarationIds.filter(id => seen.declarationIds.has(id)),
]);
```

Active candidates are deliberately excluded from this route: the resume condition cannot name a
candidate, so `ACTIVE_CANDIDATE_NOT_COVERED` is untouched.

**H4, additive schema plus retargeted validator.** Each `requiredControls` item gains a required
`controlId`; `dischargingControlRef` names that id; M8 resolves against the id set. A duplicated id
is **removed from the resolvable set entirely** rather than resolved to the first occurrence, so an
ambiguous safety reference can never be satisfied by accident.

## 8. System-prompt change

**One line**, and it was required rather than optional: retargeting the field without retargeting
the sentence would leave the transmitted instruction and the validator stating different rules,
which is the §253 class of contradiction in a new place.

```
- ON A CONTROLS DRIVER you must name dischargingControlRef: the exact control text from your own
+ ON A CONTROLS DRIVER you must name dischargingControlRef: the controlId of the entry in your own
```

The two following lines are untouched. No driver-role coaching was added, and nothing was tuned
against H3 or H4 hosted wording. `reconstruct247SystemPrompt` reduces the §259 prompt back to §247
byte for byte, asserted at load.

    §247-era prompt  a2f53370753526ad2a5ae8c07a8b81956c91bbdc67fc7b82e84da9e110d6a957
    §259 prompt      680f5127776427963d89244eafa32ce57973575ffbfae2f3326ed92fc17be34a

## 9. Wire-schema change

**Changed, and stated as changed.** This is not §258's byte-identical case and is not presented as
one.

| | |
|---|---|
| Added | `controlId`, required, `minLength: 1`, on each `requiredControls` item |
| Retargeted | `dischargingControlRef` description: the id, not the control text |
| Reduces back to §253 byte for byte | **yes**, asserted at load and re-proved in fixture Z2 |
| Role branches, carrier vocabularies, justification field sets | **unchanged**, asserted by `assertNarrowness259()` |

**Semantic information gained:** a control now has an identity, so the analysis can state which
control discharges which driver without restating it, and a reader can resolve the binding exactly.
**Semantic information lost:** none. Every field that existed still exists and still means what it
meant.

**Why the safety property is equivalent or stronger.** M8 still requires a controls driver to bind
to a control that exists in this analysis; a nonexistent reference still refuses; a reference to a
different control is still the wrong control. What changed is that the binding is resolved by
identifier rather than by string equality over prose, so a correct binding can no longer be
destroyed by paraphrase. Two refusal conditions are **added**: a control with no id and a duplicated
id. The refusal surface is strictly larger, never smaller.

## 10. Projection and admission change

The deterministic layer resolves references by structural identity, rejects nonexistent identities,
rejects ambiguous ones, preserves unresolved facts, prevents cross-entity substitution, and infers
nothing from natural-language similarity. **No fuzzy, normalized-prose or semantic-equivalence test
was introduced anywhere.** Nothing manufactures a missing reference.

---

## 11 and 12. Generalized fixture results

`scripts/test-259-carrier-coherence.ts`, driven through `runExpertHazLenzAnalysis`. **19 passed, 0
failed.** No row reproduces §254 H3 or H4 wording; each states a structural relationship.

| row | expectation | observed |
|---|---|---|
| H3-A | declaration covered by the resume condition alone → ADMIT | **ADMIT**, no codes |
| H3-B | declaration in no consequential relationship → REFUSE | **REFUSE** `DECLARATION_NOT_COVERED` |
| H3-C | wrong declaration id → REFUSE | **REFUSE** `DECLARATION_NOT_COVERED` |
| H3-D | invented declaration id → REFUSE | **REFUSE** `RESUME_CONDITION_REF_UNRESOLVED` + `DECLARATION_NOT_COVERED` |
| H4-A | control authored once, referenced by id → ADMIT | **ADMIT**, no codes |
| H4-B | wrong control id → REFUSE | **REFUSE** `DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS` |
| H4-C | nonexistent control id → REFUSE | **REFUSE** same code |
| H4-D | exact control prose in place of the id → REFUSE | **REFUSE** same code. Identity is structural and prose cannot override it |
| H4-E | no duplicate wording requirement remains | **ADMIT** with the control text and the reference sharing no word over three characters |
| H4-F | control with no `controlId` → REFUSE | **REFUSE** `REQUIRED_CONTROL_WITHOUT_CONTROL_ID` |
| H4-G | duplicate `controlId` → REFUSE | **REFUSE** `DUPLICATE_CONTROL_ID`, resolving to neither control |
| Z1–Z8 | invariants | 0 inventions; schema and prompt both reduce back byte for byte; schema genuinely differs from §253; instruction matches validator; role vocabulary, the six admissible pairs and both carriers for `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` all unchanged |

Two fixtures failed on their first run and **both were defects in the fixtures, not the
implementation**: H3-A gave a controlling role to a candidate the baseline marks `ACTIVE` and used
an epistemic character outside the vocabulary, and H4-E used a descriptive control id that happened
to share words with the control prose. `DECLARATION_NOT_COVERED` was absent from H3-A's first run,
which is what established that the H3 repair was already working. Both fixtures were corrected; no
implementation was changed to make either pass.

---

## Historical regression

| # | suite | result |
|---|---|---|
| 13. | §252 admission matrix | **18 / 18 PASS**, `unsafeAdmitted=0`, `inventions=0`, `closureMatchesTransport=true`, `validatorDisagreements=0` |
| 14. | §243 historical replay | **`total=24 admitted=2 refused=22 preserved=1`** — identical to the frozen §252 record and to §258 |
| 15. | F11 | **ADMIT** with exactly one contained declaration refusal |
| 16. | §253 alongside-control closure | **27 passed, 0 failed** |
| 17. | §247 driver-role and K6 | **33 passed, 0 failed** |
| 18. | §237 posture closure | **204 passed, 0 failed** |
| 19. | §239 contract binding closure | **336 passed, 0 failed** |
| 20. | RR-7 / owed unresolved truth | **preserved.** F13 `PRESERVE_UNRESOLVED`; §243 replay preserves 1; §253 D1–D3 preserve an owed fact while the cessation driver is refused and invent nothing |
| 21. | **Semantic inventions** | **0**, across the matrix, the replay, the §253 suite and every §259 row |
| 22. | **Unsafe malformed admissions** | **0** |

### Two instruments were moved to the successor representation, and why

The §252 matrix baseline and three §247 M8 fixtures encode the pre-§259 representation: a control
with no id, and a reference carrying the control text. Under §259 they no longer describe a valid
output.

Leaving them would have been worse than moving them. With the baseline missing a required field,
**every REFUSE row would have refused on the missing `controlId` regardless of the defect it is
supposed to test**, making the whole matrix vacuously green. That is the failure this programme
records as "not exercised versus vacuous correct." Three rows failed before the move and confirmed
it: F00, F11 and F17, the three ADMIT-expected rows.

What moved is the representation of the baseline only. **Not one expected disposition changed**, in
either instrument, and the assertion texts are untouched.

### Accepted-evidence mutation, detected and reverted

Four scripts write their results to accepted evidence paths by design. `verify-252-admission-matrix`
and `verify-252-section243-replay` overwrote two members of the frozen §252 package.

**Net effect: zero.** Both were restored from the commit with `git checkout HEAD --`, all five
accepted packages re-verify with every member OK, and `git status` reports no remaining modification
under `verification/`. Nothing mutated was staged or committed.

The diff before restoration is worth recording: the per-case conformance counts moved, because a new
required field produces additional conformance violations on historical outputs, and **none of
`totalOutputs`, `fullyAdmitted`, `refused`, `unresolvedTruthPreserved`, `unsafeMalformedOutputAdmitted`
or `semanticInventionEvents` changed at all.** The safety aggregates are unmoved.

These two scripts also wrote during §258 and produced byte-identical content, so the mutation was
invisible then. It was visible here only because results changed. The two candidate-identity suites
named in §258 were **not** run in this section.

---

## Build

| # | command | exit | errors |
|---|---|---|---|
| 23. | `npm run build` | **0** | **0** |
| 24. | `npm run build:render` | **0** | **0** |

No new build debt. The §258 repair remains in place.

## Identity

| # | | |
|---|---|---|
| 25. | Prior §258 successor identity | `10c9712d9da6217a7958a8763ebc845a7fb80f1f8b810dd969727329fb70b2ad` |
| 26. | **§259 successor candidate identity** | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| 27. | Protected modules | **29 present, 0 missing, 28 matching, 1 changed** — the adapter, above |

The §259 identity binds 22 elements: contract version, system prompt, wire schema, the §259 contract
identities, the entry point, the adapter, the envelope, the §259 and §253 contracts, the §233 and
§239 posture projections, the role-justification projection, §252 structural admission, the §235
normalizer, the §210J declaration projection, the owed-fact ledger and binding, property authority,
settlement review, and the §218 verifier instruction, schema and payload. Derivation is recorded in
`SECTION-259-SUCCESSOR-IDENTITY.json` and is reproducible from the tree.

It is **not** equal to Candidate Identity v2.3 or to the §258 successor, and is not presented as
either. The transmitted representation changed, so the identity had to.

## 28. Driver-role boundary preservation

**Unchanged.** The §255 limitation stands: autonomous distinction between continuation-controlling
and follow-up / non-controlling is not accepted for v1.0, and consequential classification remains
human-confirmed.

No role taxonomy, justification field, semantic verifier or model self-certification field was
added. `POSTURE_DRIVER_ROLES_239` still holds five roles, `admissiblePairs247()` still returns six,
and `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` still binds both carriers — all asserted in Z6,
Z7 and Z8 rather than claimed.

**§254 was not rescored and no improvement in driver-role capability is claimed.** §259 makes two
refusal mechanisms representationally cleaner. Whether that changes what a model produces is a
hosted question this section did not ask and did not spend a call on.

## 30 to 34. Git and production boundary

Recorded in `SECTION-259-POST-COMMIT.txt`. `main` unchanged at `37a5d1b5`; `origin/main` unchanged
at `de655d2f`; provider calls 0; database operations 0; pushes, tags and deployments 0.

## 35. Package digest

Recorded in `REPORT-259.sha256`. The package digest is the SHA-256 of that file.

## 36. Terminal

    EXPERT_HAZLENZ_CONTRACT_REPRESENTATION_SUCCESSOR_VALIDATED —
    PRODUCT_INTEGRATION_AUTHORIZATION_REVIEW_REQUIRED

STOP.
