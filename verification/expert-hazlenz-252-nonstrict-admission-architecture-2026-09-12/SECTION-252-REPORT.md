# §252 — Expert Single-Call Transport Architecture Decision and Structural Admission Proof: Final Report

Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_SINGLE_CALL_ADMISSION_ARCHITECTURE_VALIDATED —
    DRIVER_ROLE_HOSTED_CONFIRMATION_REAUTHORIZATION_REQUIRED

The complete Expert semantic contract transmits in one non-strict call, the deterministic admission
layer contains every historical structural failure fail-closed, no malformed output from the matrix
or the historical corpus was admitted, and nothing was invented.

## Required report fields

| Field | Value |
|---|---|
| §243 | **D HOLD RELEASE — PRESERVED** |
| §251 strict single-call | INFEASIBLE — CLOSED |
| Provider architecture | **SINGLE CALL** |
| Provider strict | **FALSE** |
| Complete Expert contract | **PRESERVED** — no field removed, no capability reduced |
| Driver-role semantics changed | **NO** |
| Historical §243 outputs replayed | **24** |
| Malformed outputs admitted unsafely | **0** |
| Deterministic semantic inventions | **0** |
| RR-7 | **PASS** — preserved unresolved truth on G1, the one output that owed it |
| K6 | **6 admissible / 0 inadmissible**, enforced deterministically |
| Property authority | **PASS** — 43/43 |
| Evidence authority | **PASS** |
| Settlement | **PASS** |
| KR-1 | **PASS** (remains OPEN, human-gated) |
| Review artifacts | **PASS** — 113/113 |
| Full real request transport | **PASS** — HTTP 200, tool call returned, admission reached |
| Candidate Identity | **v2.2, EXECUTION-DERIVED, 23/23 elements, digest `39e9ed9b4e5f93f7d39b9805d5fc2f00ab94588155930743eb8baccf13631abb`** |
| `alongsideControlConsidered` | **SEPARATE DEFECT** — not mechanically established, returned as one bounded follow-up |
| Provider capability calls | **0** |
| Synthetic transport calls | **1** |
| Spend | **USD 0.101856** |
| Six frozen driver-role cases | **UNCHANGED** |
| Cases exposed to inference | **0 / 6** |
| Substantive confirmation changes | **0** — verified by construction, not by transcription |
| Commit / push / tag / deploy | **NONE** |

## Success criteria

| | Criterion | Verdict |
|---|---|---|
| 1 | complete Expert contract transmits non-strict | **MET** |
| 2 | deterministic admission handles the historical structural failures fail-closed | **MET** |
| 3 | no unsafe malformed output from the test matrix is admitted | **MET** — 18/18 |
| 4 | no deterministic semantic invention occurs | **MET** — 0 across matrix, replay and smoke |
| 5 | K6 admission remains 6 / 0 | **MET** |
| 6 | authority and settlement protections pass | **MET** |
| 7 | RR-7 still preserves unresolved decision-critical truth | **MET** |
| 8 | production and validation paths are identical | **MET** — one composition; every harness admits through `runExpertHazLenzAnalysis` |
| 9 | Candidate Identity binds strict = FALSE and the actual admission implementation | **MET** |
| 10 | all protected regressions pass | **MET** — 0 hard failures; 3 suites superseded, every failure traced to the strict flag |
| 11 | no new TypeScript error appears | **MET** — only the frozen `POSTURE_REF_KINDS_237` error |
| 12 | the six confirmation observations remain untouched | **MET** |

## What changed in the tree

Three changes, and no others. `strictSchema` is bound to `false` on the canonical envelope; a new
`expert-252-structural-admission.ts` supplies a whole-output conformance gate and the admission
verdict rule; and the production entry point invokes both. No protected contract module was edited,
and every one of §233, §235, §237, §239, §247, §210J and §205 is called rather than copied.

The composition stayed in the entry point deliberately. An earlier implementation moved the whole
pipeline into the admission module, which gave the codebase two compositions of the same pipeline and
broke the §246 check that the entry point composes the validated modules. That was reverted rather
than accommodated, because relaxing the check to accept it would have removed the guarantee the check
exists for.

## The gap that was closed

Before §252 the pipeline validated the whole output against the transmitted schema in exactly one
place: inside the §235 normalizer, and only for a field that arrived as a JSON string. A field that
arrived as a well-formed array of wrongly-shaped members passed through untouched. That was adequate
while the provider refused such an output first, and it is not adequate now.

The §243 replay shows the gate catching a required-field failure the §243 pipeline never caught
structurally: `crossHazardInsights[0].confidence` absent on M4, which §243 refused only on an
unrelated semantic-coherence code.

## The admission matrix

Eighteen fixtures, each a named mutation of one valid baseline, admitted through the real production
entry point. Every one matched its preregistered disposition: 15 refusals, 2 admissions, 1
preserve-unresolved, plus a duplicate-declaration case admitted with the duplicate contained.

Zero unsafe admissions and zero inventions. Two properties are asserted alongside: the schema closure
the gate uses is byte-identical to the transport's own strict wrapper, and on the subset the §235
validator models, the §252 validator agrees with it on every fixture — so the new validator is a
superset, not a second and laxer standard.

## Two findings from the historical bytes

**§244's characterization of C7 and M5 was too broad.** It recorded that neither carried analysis
content. The preserved bytes show both wrappers contained a complete nine-field analysis; only the
wrapper key differed. C7's `parameters` is in the closed inert-wrapper set and unwraps cleanly; M5's
`$PARAMETER_NAME` is not, and is left wrapped fail-closed. The refusal of M5 is a deliberate
narrowness, not an absence of content.

**One contained declaration refusal must not refuse the analysis.** The first implementation
escalated it into a refusal of the whole output. That is over-restriction rather than extra safety,
and fixture F11 now enforces the distinction.

## Superseded, not regressed

Three suites fail assertions that state the pre-§252 architecture: `test-249-identity-hardening`
(P2, P4, P5), `test-246-productionization` (F1, F4, F6) and
`test-expert-anthropic-adapter-repair` (A.19). Every one of those assertions says strict enforcement
is on.

None was edited. Editing them to accept `strict: false` would rewrite a protected gate to obtain a
passing result. They remain true statements about the architecture they were written for, and §252
carries its own identity suite instead. A suite is recorded SUPERSEDED only when **every** assertion
it failed is on the preregistered strict-flag list; one unexplained failure would make the whole
suite a hard failure.

The one edit to a suite was registering `expert-252-` in the §246 declared-successor prefix list.
That check exists precisely to force a new module to be declared rather than arrive unexplained, and
declaring it is the action it asks for.

## Candidate Identity v2.2

Twenty-three elements, all execution-derived, zero written declarations. It binds the strict setting
**as a value** rather than as a required constant: the assembled request, the envelope and the
candidate must all agree, and a flip in either direction fails the derivation. Eleven negative
fixtures confirm it, including one where strict is flipped back on.

The admission layer is proved by execution, not by existence. The entry point is driven with an output
carrying a property the contract does not declare — a shape no pre-§252 check refuses — and the
refusal is required. K6 admission, roleJustification validation and RR-7 are proved the same way, and
a valid output is required to be admitted so the guarantees cannot pass as blanket over-refusal.

## The successor instrument

The same six frozen observations are re-frozen against the new executable candidate. The substantive
half was **copied from the §249 instrument, not retyped**, and the emitter verifies it is unchanged,
so a substantive change would have to be an explicit edit. Only mechanical fields moved: the
candidate identity, the strict setting, the structural admission identity, the per-case request
digests and the freeze metadata.

    instrument digest  8bfa478cbda71d565f32a0a9906ac87af65bed767dfb5ca1252c59dfc86ffeef
    substantive changes from §249  0
    cases exposed to inference  0 / 6

## One bounded follow-up

`alongsideControlConsidered` is transmitted as nullable with a description instructing the model to
write null in a named case, and `checkRoleJustification247` refuses that exact value. Both statements
are frozen §247 artifacts and nothing in the contract adjudicates between them, so §252 records the
defect and does not choose. Today's behaviour is safe and not silent: a null is refused fail-closed
under its own code. The defect costs usable outputs; it does not admit unsafe ones.

## What this returns

The architecture is validated and the instrument is frozen. Executing the six frozen driver-role
observations requires explicit product-owner authorization, which §252 does not grant itself and did
not take.

STOP.
