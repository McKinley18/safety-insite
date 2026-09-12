# §202 — RED TEAM CHALLENGE

**Agent D. Strict read-only.** Provider calls: 0. Database operations: 0. Files modified: 0.
This document is the only file created. Every probe script was written to the session scratchpad
outside the repository and executed with `npx tsx` against the repository's real modules.

**Scope of what follows.** Nine of the eleven findings below were produced by executing the real
code and reading its actual output; those are marked **DEMONSTRATED** and the observed output is
quoted. Two are marked **INFERRED** and say exactly what was and was not executed. Nothing here is a
§199 semantic verdict, and no `CORRECT` / `PARTIALLY_CORRECT` / `INCORRECT` / `AMBIGUOUS` /
`TRUTH_SPECIFICATION_DEFECT` judgement is supplied or implied.

**The organising observation.** §201's recorded defect class is *an invariant held by a caller
default rather than by the receiving boundary*. That class is not closed. It reproduces in the §201
prototype, it is carried forward verbatim into Agent B1's §202 successor, and — in the two most
consequential cases below — it now also describes the *remedies*: Agent C's guards and the §201
evidence-immutability guard are both correct code that nothing calls.

---

## EVIDENCED BYPASSES

### BYPASS-1 — HIGH — an unsupplied regulatory citation is admitted as a BOUND binding

**Boundary.** `backend/scripts/lib/expert-202-governed-binding-contract.ts:1139-1141`

```ts
const m = CITATION_SHAPED_PATTERN.exec(v);
if (m === null) continue;          // <-- the entire citation-authority contract is downstream of this
```

**Detector.** `backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts:701`
`export const CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i;`

**The state that gets through.** A `bearingStatement` naming a regulatory authority that appears in
no supplied governed record, on an entry whose outcome is `BOUND`, with zero refusal codes.

**Reachable path.** `checkGoverned202Bindings(raw, input)` with
`governedTextExposure: 'SUPPLIED_VERBATIM'` and a valid `verbatimExposureRuling`. Executed against
the real module; observed output:

```
REFUSED  codes=["UNAUTHORISED_REGULATORY_CITATION"]  citationReuse=checked  "29 CFR 1910.147 requires this"
BOUND    codes=[]                                    citationReuse=null     "29 C.F.R. 1910.147 requires this"
BOUND    codes=[]                                    citationReuse=null     "the standard at 1910.147(c)(4) requires this"
BOUND    codes=[]                                    citationReuse=null     "NFPA 70E Article 130 requires this"
BOUND    codes=[]                                    citationReuse=null     "OSHA 1926.1153 requires this"
```

Four of five ordinary citation forms are admitted. None of the four appears in the supplied record.

**Why the check misses it.** `STAGE_202_CITATION_AUTHORITY`, `UNAUTHORISED_REGULATORY_CITATION` and
`decideCitationReuse` are all *gated behind* a detector that matches only the literal shape
`NN[ws]CFR[ws]NNN`. A dotted `C.F.R.`, a bare section number, a `§` between the parts, or any
non-CFR standards body never enters the authorisation branch — the loop `continue`s and the entry is
scored as if it carried no citation at all. The authorisation contract is sound; it is simply
unreachable for most real citation formats.

**Why this is worse in §202 than in §201.** `SUPPLIED_VERBATIM`
(`expert-202-governed-binding-contract.ts:231`) is a new mode that deliberately shows the model
un-redacted regulatory text, and its safety argument is explicitly that returned tokens are checked
for reuse against the supplied set. That argument rests entirely on this detector.

**Same defect, redaction side.** `redactCitationTokens`
(`backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts:1431-1434`) is built from the same
pattern, so even the `REDACTED` default leaves `29 C.F.R. 1910.146`, `§1910.146` and bare
`1910.146` in the text shown to a model that is instructed never to write one. The §201 module
comment at `expert-201-governed-binding-stage.ts:400-403` says showing a citation to that model
"would be setting a trap"; the trap is still set.

**Narrowest place to stop it.** One detector, one place: widen `CITATION_SHAPED_PATTERN` (or add a
second, deliberately broader `CITATION_SUSPECT_PATTERN` used only for *routing into* the
authorisation branch, leaving the frozen pattern untouched for scoring). See
`AUTHORIZATION REQUIRED`, item 2 — widening the frozen constant changes historical denominators and
is not an engineering decision alone.

---

### BYPASS-2 — HIGH — the governed-stage wire schema has no `additionalProperties: false`, in either section, while the module claims it as a second layer

**Boundary.** `backend/scripts/lib/expert-201-governed-binding-stage.ts:453-506` and its §202
successor `backend/scripts/lib/expert-202-governed-binding-contract.ts:786-838`.

**The claim being falsified.** `expert-201-governed-binding-stage.ts:66-68`:

> `BINDING_FORBIDDEN_FIELDS` refuses each of them by name at the boundary, and
> `additionalProperties: false` refuses them at the transport, **so the protection does not depend on
> either one alone.**

**DEMONSTRATED.** Counting the literal in the serialised schema each builder returns:

| schema | `additionalProperties` occurrences |
|---|---|
| §201 `buildGovernedBindingWireSchema` | **0** |
| §202 `buildGoverned202WireSchema` | **0** |
| verifier `applyCandidates([]).schema` | 3 (root, declaration item, `regulatoryBasis`) — all `false` |

The verifier path implements it; the governed-binding path does not, in either section. The
protection *does* depend on the boundary alone, contrary to the stated design.

**Why it matters beyond the false comment.** The verifier comparison is the point. Because the
verifier declaration item is closed, a model cannot deliver a field the enabled-candidate set did
not open — which is what keeps BYPASS-3 narrow. The governed-binding item is open, so every
undeclared property a model returns arrives at the boundary, and the boundary's protection is
whatever `GOVERNED_STAGE_202_FORBIDDEN_FIELDS` happens to name.

**Narrowest fix.** Add `additionalProperties: false` to the two object nodes in
`buildGoverned202WireSchema` (the root and `bindings.items`), and correct or delete the §201 comment
so no successor inherits the claim. Note the grammar-budget interaction: this adds two keywords, and
§199's rejection was about compiled grammar size — `measureSchemaComplexity202` should be re-run and
reported, not assumed negligible.

---

### BYPASS-3 — MEDIUM-HIGH — an unvalidated model-authored value enters a closed vocabulary through a TypeScript cast, when the candidate that validates it is not enabled

**Boundary.** `backend/scripts/lib/expert-201-verifier-vnext-candidates.ts:1723-1745`

```ts
ground: String(d.challengeGround) as ChallengeGround,
```

**The validating code, and what gates it.** `expert-201-verifier-vnext-candidates.ts:1572-1618`,
entirely inside `if (on('C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE'))`, where
`on = (id) => enabled.includes(id)` and `enabled` is the third argument the *caller* passes to
`checkVnextOutput`.

**The state that gets through.** DEMONSTRATED. Same hostile verdict, same input, only the caller's
`enabled` list changed:

```
--- enabled = ["C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE"] ---
admitted: false | codes: CHALLENGE_GROUND_NOT_A_MEMBER
arbitration packets emitted: 0

--- enabled = [] ---
admitted: true | codes: (none)
arbitration packets emitted: 1
  factKey            : "owed:generic:lamp_reflects_the_protective_circuit"   <-- supplied? true
  ground             : "THE_FACT_IS_NOT_DECISION_CRITICAL"   <-- in CHALLENGE_GROUNDS? false
  spanVerbatimVerified: false
  observationSpan     : "a span nobody ever wrote in the observation"
  commonAction        : "stop the line anyway"
```

Three separate contract rules are violated in one packet and none is refused: the ground is outside
`CHALLENGE_GROUNDS`; the span is not a substring of the observation; and the span and the common
action are present *together*, which the two grounds are defined to be mutually exclusive about. The
value I chose for the ground is not incidental — `THE_FACT_IS_NOT_DECISION_CRITICAL` is an assertion
that the fact should be dropped, and C6a's own `requiresHumanTruth` says "whether the challenge
should be granted — **which no field here may express**".

**Why the check misses it.** `reviewableArbitrationRequests` gates only on `result.admitted`. It
never reads `result.enabledCandidates`, which is present on the very result object it is handed
(`expert-201-verifier-vnext-candidates.ts:1302`). The projection therefore trusts a validation that
may not have run.

**Reachability, stated honestly.** The declaration item carries `additionalProperties: false`
(verified above), so a provider honouring the schema cannot deliver `challengeGround` when C6a is
off. The live path is a *mismatch* between the two independent candidate lists: `applyCandidates(ids)`
builds the request and `checkVnextOutput(raw, input, enabled)` validates it, and **nothing in the
module binds one to the other**. A harness that sends the C6a schema and validates with a different
list gets this outcome with a fully schema-conformant response. `applyCandidates` currently has zero
production call sites, so this is a development-path exposure today, not a customer one.

**The same gating applies to the citation scan.** DEMONSTRATED: `vnextScannedStrings`
(`:1168-1197`) also branches on `enabled`, so a citation in `owedPropertyAsUnderstood` is scanned
only when C1a is enabled — `enabled=["C1a…"] -> scanned: true`, `enabled=[] -> scanned: false`.

**Narrowest fix.** Have `reviewableArbitrationRequests` return `[]` unless
`result.enabledCandidates.includes('C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE')`, and re-check
`CHALLENGE_GROUNDS` membership in the projection instead of casting. Better still, derive `enabled`
once and carry it on the built request so the two lists cannot diverge.

---

### BYPASS-4 — MEDIUM — Agent C's guards, as delivered, are in no execution path

**Boundary.** `backend/scripts/lib/expert-202-authority-boundary-guards.ts` — eight guard functions
(`:121`, `:143`, `:169`, `:202`, `:249`, `:285`, `:348`, `:380`).

**DEMONSTRATED.** External call sites, counting every file in `backend/` except the guards module
itself and its own test:

```
declaringStageViolations                 -> 0 external call sites
acceptableEvidenceProvenanceViolations   -> 0 external call sites
owedFactCriterionViolations              -> 0 external call sites
nominationHazLenzOwnedFieldScan          -> 0 external call sites
nestedForbiddenGovernanceFields          -> 0 external call sites
nominationCeilingViolations              -> 0 external call sites
mergeOwedFactCoverageViolations          -> 0 external call sites
structuralQuestionPriorityViolations     -> 0 external call sites
```

**This is not a criticism of Agent C's judgement.** C was right not to apply them: every target file
is owned by another party under the §202 map and three are §187 sha256-pinned. C records the exact
insertions in `CALL_SITE_INSERTIONS` (`:673-708`) and declares `modifiesAnyExistingFile: false`
(`:731`).

**The red-team point is about what §202 may claim.** A guard that must be called is an invariant held
by a caller — the §201 defect class applied to its own remedy. Until `CALL_SITE_INSERTIONS` is
applied under authorization, **no §202 artifact may state that these boundaries are hardened.** The
accurate statement is that the hardening is specified, tested in isolation, and unapplied. This is a
reporting-integrity risk more than a code risk, and it is exactly the shape the launch-readiness
standard exists to catch: a long list of green guard tests that does not mean the guarded path is
guarded.

---

### BYPASS-5 — MEDIUM — orphan entries bypass every content check, so four refusal codes systematically under-count

**Boundary.** `expert-201-governed-binding-stage.ts:694-697` and, carried forward verbatim,
`expert-202-governed-binding-contract.ts:1074-1079`:

```ts
if (!minted.refs.includes(ref)) { orphanEntries += 1; continue; }
```

**DEMONSTRATED.** One entry naming an unminted `factRef` and simultaneously carrying a forbidden
`factKey`, a forbidden `status`, a forbidden `priority: 'LIFE_CRITICAL'`, an unsupplied `sourceId`
and a citation:

```
orphanEntries= 1 | perFact codes= [] | responseCodes= []
```

**Why the check misses it.** The `continue` precedes the forbidden-field loop, the supplied-set
check, the determination check and the citation scan. No unsafe state is *stored* — the entry is
discarded — so this is an **accounting-integrity** defect, not a state-injection one. Its
consequence is that `PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD`,
`GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET`, `PROHIBITED_REGULATORY_CITATION` and
`UNAUTHORISED_REGULATORY_CITATION` will read **zero** for a model whose violations happen to ride on
orphan entries. A measure that reports zero because the behaviour never reached the counter is
indistinguishable in the evidence from a measure that reports zero because the behaviour never
occurred.

**Narrowest fix.** Run the content checks before the orphan `continue` and accumulate their codes
into a response-level `orphanEntryCodes` array, so the entry is still discarded but its violations
are counted. Do not attach them to a fact.

---

### BYPASS-6 — MEDIUM — refused free text is retained verbatim in the record the refusal produced

**Boundary.** `expert-201-governed-binding-stage.ts:777` and
`expert-202-governed-binding-contract.ts:~1170`:

```ts
bearingStatement: typeof entry.bearingStatement === 'string' ? entry.bearingStatement : null,
```

**DEMONSTRATED.**

```
outcome= REFUSED | codes= [ 'PROHIBITED_REGULATORY_CITATION' ]
bearingStatement = "Per 29 CFR 1910.147 the collar must be locked out."
```

**Why the check misses it.** The refusal clears `boundGovernedSourceIds` to `[]` but not the field
the refusal was *about*. `FactBindingRecord.bearingStatement` is documented as "Recorded for human
review", so the prohibited citation survives into the artifact a reviewer reads, carrying only a
code beside it. Any consumer that renders `bearingStatement` without also rendering `codes` surfaces
the exact content the boundary refused.

**Narrowest fix.** On a `REFUSED` outcome set `bearingStatement: null` and record the offending text
under a separate, explicitly-quarantined field (`refusedText`) that no rendering path reads by
default — preserving the evidence that the event occurred without presenting it as review material.

---

### BYPASS-7 — MEDIUM — the verbatim-disclosure renderer performs the disclosure without the authorization check

**Boundary.** `expert-202-governed-binding-contract.ts:747-758`

```ts
export function renderSuppliedGovernedRecords202(
  records: readonly Governed202Record[], exposure: GovernedTextExposureMode,
): string { … exposure === 'SUPPLIED_VERBATIM' ? r.text : redactCitationTokens(r.text) … }
```

**DEMONSTRATED.** Calling the exported renderer directly with `'SUPPLIED_VERBATIM'` and no ruling
anywhere in scope:

```
AVAILABLE GOVERNED EVIDENCE — these sourceIds and no others
  - sourceId: GOV-1
      text: Machine guarding under 29 CFR 1910.212 requires ...
```

versus the composed builder, which correctly refuses:

```
THREW: GOVERNED_BINDING_202_ABORT: governedTextExposure=SUPPLIED_VERBATIM changes what regulatory …
```

**Credit where due.** B1 put `assertExposureAuthorised` *inside* `buildGoverned202UserPrompt`
(`:762`) and again in the pipeline (`expert-202-governed-stage-pipeline.ts:199`), and it demands a
non-empty ruling string rather than a boolean (`:527-538`). That is the §201 lesson applied
correctly, and it holds at both composed entry points.

**Why the check still misses.** The function that actually performs the disclosure takes a bare mode
string and checks nothing. The invariant is held one level up, by the composed builder — a caller.
Both functions are exported from the same module.

**Narrowest fix.** Give `renderSuppliedGovernedRecords202` the `Governed202StageInput` (or a ruling
token minted by `assertExposureAuthorised`) rather than a bare mode, so the disclosure is not
expressible without the authorisation.

---

### BYPASS-8 — MEDIUM — the evidence-immutability guard covers 6 of 97 directories, exempts §201's own package, has no production call site, and is defeated by a symlink

**Boundary.** `expert-201-harness-hardening.ts:774-781` (the list), `:814-839` (`checkEvidenceWrite`),
`:858-865` (`guardedWriter`).

Four independent weaknesses, all DEMONSTRATED:

**(a) Scope.** `IMMUTABLE_EVIDENCE_DIRECTORIES` names six directories, §195–§200. The repository
holds **97** `expert-hazlenz-*` verification directories, and the §202 ownership map (§5) declares
"§195–§201" immutable. Executed:

```
refused        verification/expert-hazlenz-successor-structured-e2e-2026-09-07/RUN-SUMMARY.json
WRITE ALLOWED  verification/expert-hazlenz-parallel-development-2026-09-07/RUN-SUMMARY.json
WRITE ALLOWED  verification/expert-hazlenz-verifier-accuracy-2026-09-03/anything.json
refused        verification/expert-hazlenz-semantic-adjudication-2026-09-07/x.json
```

§201's own ten-file evidence package is writable. This is not an oversight in the test — the §201
suite *asserts* it, at `backend/scripts/test-201-harness-hardening.ts:557`:
`checkEvidenceWrite(join(E201, 'HARNESS-HARDENING-REPORT.md')).allowed === true`.

**(b) No call site.** `guardedWriter`, `assertEvidenceWriteAllowed`, `checkEvidenceWrite` and
`isImmutableEvidencePath` appear nowhere in `backend/` except `expert-201-harness-hardening.ts`
itself and `test-201-harness-hardening.ts`. Every real harness writes with unguarded `fs`. The
module's own comment (`:769-772`) says "a protection that cannot actually refuse is
indistinguishable from no protection" — which is the current state of this protection.

**(c) Symlink.** `checkEvidenceWrite` uses `path.resolve`, which is purely lexical. Its docstring
correctly claims `..` cannot walk in sideways; symlinks are a different mechanism. Through a symlink
pointing at the §199 package:

```
checkEvidenceWrite through the symlink -> allowed = true | section = null
```

`realpath` would close this; `resolve` does not.

**(d) Where it will bite in §202.** §202 adds a seventh protected package
(`expert-hazlenz-governed-stage-integration-2026-09-07`) that is not in the list either.

**Narrowest fix.** Derive the protected set by *enumerating* `verification/expert-hazlenz-*` rather
than by a hand-maintained list of six — a list that must be edited each section is an invariant held
by whoever remembers to edit it — resolve with `realpathSync` where the path exists, and route the
§202 harness's writes through `guardedWriter`.

---

### BYPASS-9 — LOW — `citationReuse: null` means both "no citation present" and "the detector saw nothing"

**Boundary.** `expert-202-governed-binding-contract.ts:1138-1156`. `citationReuse` is initialised
`null` and assigned only inside the `SUPPLIED_VERBATIM` branch, which is itself downstream of the
`m === null` `continue` from BYPASS-1.

**DEMONSTRATED** by the BYPASS-1 output: every one of the four admitted unsupplied citations carries
`citationReuse=null`, the identical value carried by a clean statement containing no citation at all.
An audit reading `citationReuse === null` as "nothing to check here" would be reading a detector miss
as a clean result. Silence and success are the same observable outcome.

**Narrowest fix.** Make the field a three-state (`NOT_APPLICABLE` / `NO_TOKEN_DETECTED` / a verdict)
so a miss is distinguishable from an absence.

---

### BYPASS-10 — LOW — two `FACT_REF_SHAPE` constants are defined and never used

**DEMONSTRATED** by repository-wide grep: `FACT_REF_SHAPE`
(`expert-201-governed-binding-stage.ts:249`) and `FACT_REF_SHAPE_202`
(`expert-202-governed-binding-contract.ts:549`) each appear exactly once — at their own definition.
Neither `mintFactRefs`/`mintFactRefs202` nor either boundary references them.

This is a check that will always report zero, in the family §201 recorded for
`CONTRACT_VERSION_MISMATCH` and `ANALYSIS_ID_MISMATCH`. The functional risk is nil today — the
boundaries use `minted.refs.includes(ref)`, which is *stronger* than a shape test — but a reader
inspecting the module will believe a shape is enforced. Note that `mintFactRefs` generates
`F${i+1}` with no upper bound, so a 1000-fact input mints `F1000`, which the unused shape would have
rejected. Either wire the constant into minting as an assertion, or delete it.

---

### BYPASS-11 — LOW — the invocation guard is advisory, and the builder without it emits an unsatisfiable schema

**Boundary.** `stageInvocation` (`expert-201-governed-binding-stage.ts:288-298`) /
`stageInvocation202` (`:614`) is a separate function that returns advice.
`buildGovernedBindingWireSchema` does not consult it.

**DEMONSTRATED.**

```
governedEvidenceSourceIds items: {"type":"string","enum":[]}
factRef enum with zero facts: []
```

An empty `enum` is an unsatisfiable JSON Schema node. A caller that forgets the advisory function
builds a request that can only fail, and — given §199's history — would likely fail in a way charged
to grammar rather than to the caller. Have the builder call the invocation check and throw, rather
than publishing the answer and hoping.

---

## SPECULATIVE — reported separately because I could not demonstrate reachability

1. **Prototype-chain keys in the criterion lookup.** `applyGovernedBindings` selects with
   `bound.find(id => criteriaBySourceId[id] !== undefined)`
   (`expert-201-governed-binding-stage.ts:846`), and `GOVERNED_SOURCE_ID_SHAPE`
   (`expert-first-pass-instruction-vnext.ts:515`) permits `constructor`, `toString`, `valueOf`. I
   **demonstrated** that a supplied record with `sourceId: 'constructor'` makes an *empty* criteria
   map return a non-`undefined` value, so the `NO_CRITERION_HELD` branch became unreachable and the
   outcome was mislabelled `ENRICHED_FACT_INVALID` with `sourceId: 'constructor'`. `owedFactDefects`
   caught the bogus value downstream, so nothing invalid was stored. **I could not demonstrate that
   any real governed record is named this**, so this is latent, not live. The same pattern makes
   `mintFactRefs` throw a false "supplied more than once" abort on the *first* `factKey` of
   `'constructor'` — blocked today because `computeFactKey`
   (`expert-first-pass-owed-fact-projection.ts:200-215`) always prefixes `FP.` or `VN.`, but
   `mintFactRefs` accepts a caller-supplied key from any source and only shape-checks it. Use `Map`
   or `Object.create(null)` in both places; the fix is smaller than the analysis.

2. **`mergeExpertIntelligence`'s fourth parameter is unaudited.** `owedFactCoverage?: unknown`
   (`expert-authority-merge.ts:155, 176`) is spread into the customer-facing merged object, and
   `verifyMergeInvariants` (`:254`) does not take it as a parameter, so none of the eleven merge
   invariants can see it. I **verified** it is unused today (below), so there is no live bypass — but
   it is the natural destination for B1's binding output, and if §202 ever routes a
   `Governed202StageResult` through it, `bearingStatement` free text reaches the merged intelligence
   with no invariant looking at it. Worth a twelfth invariant before, not after.

3. **Grammar-identity sensitivity may make the memo rarely fire.** Each governed-stage row's schema
   embeds enums sized by that row's fact and record counts, so two rows differing only in record
   count produce distinct identities (**demonstrated**: `1 record vs 2 records identity equal? false`).
   Clause (b)'s memo may therefore seldom match across rows. That fails in the *spend* direction, not
   the safety direction, and I did not model the real cohort's shape distribution — so this is a
   question for B2/the orchestrator to measure, not a finding.

---

## THINGS I TRIED TO BREAK AND COULD NOT

These are reported because they are load-bearing and because the §202 report should be able to cite
an adversarial attempt rather than an assumption.

**The customer-inactive boundary held under four independent probes.** I attacked it specifically
rather than re-verifying §201's conclusion.
- `backend/tsconfig.json` sets `"rootDir": "./src"` and `"include": ["src/**/*"]`. Everything under
  `backend/scripts/` — every `expert-201-*` and `expert-202-*` module — is **outside the production
  build entirely** and cannot be emitted to `dist/`. This is the strongest of the four and it is
  mechanical.
- Grep for any import of `scripts/` from `backend/src/`: three hits, all in comments.
- No dynamic `await import(` or `require(` anywhere in
  `backend/src/safescope-v2/expert-hazlenz/`. The single `require` hit is the substring inside a
  natural-language regex (`expert-measurement-contract.ts:646`).
- `mergeExpertIntelligence` has 17 call sites; **not one passes a fourth argument** except two tests
  passing `undefined` explicitly to prove the key is absent. `applyCandidates` has zero production
  call sites. No Nest module references the expert layer.

**A model-authored `factKey` could not reach a verifier declaration.** My first hostile verdict named
`owed:INVENTED:a_fact_nobody_supplied`; the base v3 boundary refused it with
`OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED` under *every* enabled list, including `[]`. That check is
not candidate-gated, which is why BYPASS-3 is confined to the ground/span fields. The identity
defence here is genuinely at the boundary.

**`PLAIN_STRING` transport is boundary-equivalent to `CLOSED_ENUM`, as claimed.** Both modes route
through `supplied.has(gid)`; an unsupplied id is refused identically. The §201 comment at `:218-222`
is accurate.

**Prototype-inherited forbidden fields fail safe.** `forbidden in entry` traverses the prototype
chain, so an entry carrying an inherited `factKey` is still refused
(`PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD`, outcome `REFUSED`). Over-broad, but in the safe
direction, and no name in `FORBIDDEN_EXPERT_FIELD_NAMES` or `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS`
collides with `Object.prototype`.

**`challengeReason` is scanned for citations after all.** I initially suspected a gap because
`vnextScannedStrings` never pushes it. It is covered upstream by the pre-existing v3 boundary at
`expert-verifier-citation-boundary.ts:78`. Withdrawn.

**B1 closed the §201 cross-analysis application hole.** §201's `GovernedBindingStageResult` carried
no `analysisId` (**demonstrated**: its eight keys do not include one), so a result computed for one
analysis could be applied to another's facts with nothing to check. B1's `sealFactIdentities`
(`expert-202-governed-binding-contract.ts:487`) binds `analysisId` and the ordered `factKeys` into a
digest sealed before nomination, with `IDENTITY_SEAL_MISMATCH` as a refusal code. That is a genuine
fix to a real §201 gap.

**B2 fixed five of the six §201 grammar-identity collapses.** I found the §201 collapses
independently before reading B2's module, then compared both implementations directly:

```
COLLAPSED (201) | distinct  (202)  object vs array
COLLAPSED (201) | distinct  (202)  addProps false vs true
COLLAPSED (201) | COLLAPSED (202)  enum 3 dets vs 3 refs
COLLAPSED (201) | distinct  (202)  required [a,b] vs [x,y]
COLLAPSED (201) | distinct  (202)  minLength 1 vs 400
COLLAPSED (201) | distinct  (202)  pattern differs
```

The §201 function erases every leaf scalar to its JavaScript type, so `{type:'object'}` and
`{type:'array'}` hash identically — a cache keyed on it could declare a grammar already-rejected on
the evidence of a structurally different one. B2's successor keeps schema keywords verbatim. The one
remaining collapse — enum *member values* at equal arity — is deliberate, documented, and fails
toward a skipped row rather than a spent one. **I did not find a way to make B2's identity collapse
two grammars that differ in a way a compiler would care about, and I did not find it derivable from
model-controlled content**: it is computed from the schema HazLenz builds, which contains model
content nowhere.

**On Agent C's substantive findings.** I independently reproduced C's ABF-4, which I rate the
highest-stakes instance of the defect class anywhere in this sweep, and I record it as
corroboration rather than as my own finding.
`expert-verifier-contract-v3.ts:589` writes `priority: opts.nominatedPriority ?? 'OTHER'` — a
**caller default**. The receiving boundary (`owed-fact-binding.ts:201-203`) checks only vocabulary
membership, and `LIFE_CRITICAL` is a member. `structural-questions.ts:236` computes
`UNRESOLVED_SAFETY_STATE: unresolvedLifeCritical.length > 0`. Any producer of a
`ClarificationDeclaration` other than the v3 bridge can therefore raise a fail-closed
customer-visible safety state through a boundary that does not police it. C's finding is correct and
the reachable path is real.

One caution on C's proposed remedy: the `ABF-3` insertion at `CALL_SITE_INSERTIONS` (`:703`)
explicitly skips `'priority'` (`if (forbidden === 'priority') continue;`). That exempts precisely the
field ABF-4 identifies as the highest-authority one on the list. C is transparent about why — the two
contracts disagree and the disposition is not C's to make — but if ABF-3 is applied and ABF-4 is not,
the resulting state is a forbidden-field guard whose single exception is the escalation field. Apply
them together or neither.

---

## CONCURRENT AGENTS — WHAT EXISTED WHEN I FINISHED

| file | owner | status at end of my run |
|---|---|---|
| `expert-202-governed-binding-contract.ts` | B1 | **present**, reviewed (1326 lines) |
| `expert-202-governed-stage-pipeline.ts` | B1 | **present**, reviewed (381 lines) |
| `expert-202-effective-grammar-identity.ts` | B2 | **present**, reviewed and executed (489 lines) |
| `expert-202-rejection-cache.ts` | B2 | **present**, header read only — key derivation at `:238` not executed |
| `expert-202-authority-boundary-guards.ts` | C | **present**, reviewed (736 lines) |
| `expert-202-adjudication-grouping.ts` | A | present, not reviewed (outside my remit) |
| `…/AUTHORITY-BOUNDARY-INVENTORY.md` | C | **ABSENT** |
| `…/HIGH-1-HIGH-2-DISPOSITION.md` | C | **ABSENT** |
| `…/GOVERNED-STAGE-INTEGRATION.md` | B1 | **ABSENT** |
| `…/EFFECTIVE-GRAMMAR-IDENTITY.md` | B2 | **ABSENT** |
| `…/ADJUDICATION-SESSION-202.md`, `…-WORKSHEET-202.json`, `…-PRESENTATION-PACKET.md` | A | present |

**I have not read any of the four absent documents and I make no claim about their contents.** My
review of B1, B2 and C rests on their source modules alone. Two consequences the orchestrator should
weigh: C's narrative reasoning for its dispositions is in `AUTHORITY-BOUNDARY-INVENTORY.md`, which I
could not read, so my BYPASS-4 addresses only the *mechanical* state of the guards; and
`expert-202-rejection-cache.ts` arrived too late for me to execute `establishedRejectionKey` — **the
rejection cache's key derivation is UNCHALLENGED by this red team.** Its inputs come from
`effectiveGrammarIdentity`, which I did test, but the composition was not exercised.

One incidental observation: `expert-202-governed-binding-contract.ts` contains a byte that makes
`file(1)` classify it as `data` rather than text, which causes plain `grep` to treat it as binary.
Harmless to `tsx`, but it will silently break any grep-based verification over that file.

---

## AUTHORIZATION REQUIRED

1. **BYPASS-2 and BYPASS-5 through BYPASS-11 are ordinary bounded corrections**, but every target
   file is owned by B1 or by the §201 surface. None is mine to make and I made none. They need the
   orchestrator to assign them.

2. **Widening `CITATION_SHAPED_PATTERN` (BYPASS-1) is not an engineering decision alone.** The
   constant is the scorer for `O_UNSUPPLIED_CITATION_CONTAINMENT` and for citation refusals recorded
   across §195–§201. Widening it changes what those historical figures would have measured, and a
   figure computed under a different detector is not comparable to one already recorded. The
   product owner should rule on whether to (a) add a separate broader pattern used only to route
   into the authorisation branch, leaving the frozen scoring constant untouched — my recommendation,
   because it closes the hole without touching any recorded denominator — or (b) widen the frozen
   constant and re-derive the affected measures under an explicit re-measurement.

3. **`SUPPLIED_VERBATIM` must not be activated until BYPASS-1 is closed.** B1 already routes this
   through `ACTIVATING_SUPPLIED_VERBATIM_NEEDS_A_PRODUCT_OWNER_RULING: true`, which is correct. My
   addition is that the ruling should not be sought as a containment-posture question alone: as the
   code stands, the reuse check that the mode's safety argument depends on does not fire for most
   citation formats, so a ruling taken today would be authorising a weaker mechanism than the one
   described to the ruler.

4. **§202's own evidence package is not covered by any immutability guard**, and neither is §201's.
   Extending `IMMUTABLE_EVIDENCE_DIRECTORIES` touches an orchestrator-owned surface.

---

## WHAT THIS DOCUMENT DOES NOT ESTABLISH

- No provider was called and no hosted behaviour was observed. Every result is deterministic local
  execution against repository modules.
- I did not execute any §202 test suite, run any typecheck, or compute any hash of a §202 artifact.
  I therefore make **no** verification-pass claim of any kind, under any scope label.
- Absence of a finding in an area I probed is evidence about that probe, not a clearance. I did not
  examine Agent A's adjudication grouping, the cohort harness's accounting, the owed-property
  representation module, or the rejection cache's key derivation.
- Repository state on completion: **unchanged by me.** Zero files modified, zero commands run that
  write to the repository, one file created — this one. The symlink used to demonstrate BYPASS-8(c)
  was created in the session scratchpad and points into the repository; it writes nothing.
