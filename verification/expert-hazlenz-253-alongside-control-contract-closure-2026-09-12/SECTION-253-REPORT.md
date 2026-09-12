# §253 — Alongside-Control Contract Consistency Closure: Final Report

Zero provider calls. Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_CONTRACT_CONSISTENCY_CLOSED —
    DRIVER_ROLE_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED

## 1. Adjudication

**Null is not a legitimate semantic state for `alongsideControlConsidered`.** The full argument is in
`SECTION-253-ADJUDICATION.md`; the two load-bearing points are:

The frozen §247 artifacts do settle it, in three places §252 did not consult. The §247 acceptance
fixture builds a cessation driver with both fields null, names it *"a cessation driver that never
confronts the alongside control"*, and requires the refusal. The §247 design record says a cessation
driver *must name* both fields, and marks only `unresolvedElement` as nullable. The §247 report says
the same. Four frozen artifacts agree; one sentence in one schema description disagrees.

Admitting null would also make the C5 mechanism bypassable. A model could discharge the confrontation
with two nulls, and deterministic code could never separate *"the observation genuinely names no
control"* from *"I did not look"*, because separating them means reading the observation for meaning.

**The intended non-null representation** is a required string stating the finding: the control the
model considered, named from the observation, or that the observation names no such control. That
preserves the distinction because the distinction was never machine-readable — the only deterministic
consumer is a presence test — and what the contract wants is an accountable assertion a reviewer can
check, which text carries and null does not.

## 2. The exact contradiction

Transmitted schema: `alongsideControlConsidered: ["string","null"]`, required on the cessation
branch, described with *"Write null only if the observation states no such control at all."*
Deterministic projection: `nonEmpty` is false for null, so
`CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT` refuses the analysis.

## 3. Files changed

| File | Change |
|---|---|
| `contract/expert-253-posture-contract.ts` | **new** — additive successor to §247; the whole repair |
| `expert-hazlenz-analysis.ts` | invokes `buildExpert253WireSchema`; prompt builder unchanged |
| `expert-hazlenz-adapters/anthropic-expert-provider.ts` | same one-line successor selection |
| `scripts/lib/expert-253-candidate-identity.ts` | **new** — v2.3 derivation |
| `scripts/test-253-alongside-control-closure.ts` | **new** — the bounded local proof |
| `scripts/test-253-candidate-identity.ts` | **new** — v2.3 suite |
| `scripts/run-253-regression.ts` | **new** — successor regression runner |
| `scripts/emit-253-refreeze.ts` | **new** — metadata-only successor freeze |
| `scripts/test-246-productionization.ts` | one line: `expert-253-` added to the declared-successor prefixes |

`scripts/lib/expert-252-candidate-identity.ts` was edited during the work and then **restored
byte-for-byte**, because the accepted §252 package pins the document it produces.

## 4. The bounded repair

On the cessation branch of the K6 union, and nowhere else: two fields stop admitting null, and their
descriptions say how to express the no-control case in words. The deterministic projection is not
touched — it was already correct.

Everything else is inherited from §247 by construction and asserted at module load: no role, no
carrier, no field, no required list, no vocabulary and no posture changes; K6 stays 6 admissible / 0
inadmissible; and `buildBasisEntryUnion253` reduces back to `buildBasisEntryUnion247` byte for byte.

**The system prompt is byte-identical.** §253 introduces no prompt builder, because the transmitted
instruction block never mentioned null. The entry point still calls `build247SystemPrompt`, and its
digest is unchanged at `a2f53370…`.

## 5. Protected artifacts touched

**None edited.** §233, §235, §237, §239, §247 and the §247 role-justification projection are all
byte-unchanged.

The repair was written as an additive successor rather than as an in-place edit of §247 for a
concrete reason: three frozen packages — §247, §249 and §252 — pin the SHA-256 of
`expert-247-posture-contract.ts`. Editing it would have silently falsified all three, including the
§252 package the product owner accepted at digest `a08844f9…`. The successor keeps every historical
digest re-derivable from the tree, which is what the §247 module says about its own relationship to
§239.

The one suite edited is `test-246-productionization.ts`, adding `expert-253-` to the
declared-successor prefix list. That control exists to require explicit registration of successor
modules, and the product owner accepted the identical change for §252.

## 6. Local proof results

`test-253-alongside-control-closure.ts` — **27 passed, 0 failed**, every fixture admitted through the
real production entry point.

| Requirement | Result |
|---|---|
| A — the circumstance that previously called for null | **ADMITTED** as text, with zero justification codes |
| B — a materially invalid representation stays fail-closed | **REFUSED**: the null pair, a whitespace-only value, and an absent field |
| C — no deterministic invention | **0** across all five probes |
| D — no owed unresolved fact erased | **PRESERVE_UNRESOLVED** still reached with the driver refused |
| E — malformed declarations still rejected | **PASS** (matrix F12, F13) |
| F — F11 distinction preserved | **PASS** — ADMIT with exactly one contained declaration refusal |
| G — matrix disposition-equivalent | **PASS** — 18/18, and the evidence file is byte-identical |
| H — historical replay | **0 unsafe admitted, 0 inventions**, evidence file byte-identical |

B's refusal is now **structural as well as deterministic**: the transmitted contract itself reports
`NO_UNION_BRANCH_SATISFIED` on the null pair, before the projection is consulted. That is the
contradiction closing from both sides.

## 7. §252 admission-matrix comparison

18 / 18 fixtures, same dispositions, no fixture changed. `SECTION-252-ADMISSION-MATRIX.json` is
**byte-identical** after re-running under the §253 head.

## 8. §243 historical replay

24 outputs replayed. Unsafe malformed outputs admitted: **0**. Semantic invention events: **0**.
Unresolved truth preserved: **1**. `SECTION-252-SECTION243-STRUCTURAL-REPLAY.json` is
**byte-identical** after the repair.

The whole accepted §252 package verifies against its own manifest and still digests to
`a08844f9ca807dd514ed42952eefb54385992109b779671c4aa8d9197d3c340b`.

## 9–11. Invention, unresolved truth, F11

| | |
|---|---|
| Semantic invention events | **0** — local proof, matrix, replay |
| Unresolved-truth preservation | **PASS** — RR-7 preserves with the cessation driver refused |
| F11 | **ADMIT**, one contained declaration refusal — the distinction holds |

## 12. Candidate Identity

**v2.3, execution-derived, 24 / 24 elements, 33 / 33 suite assertions.**

    293697746d7de52c1c5b8492592189e93211a0c986975832d8d8401bb258cfbf

It binds `strictSchema = FALSE` as a value, the complete transmitted schema, request construction,
the admission module, the verdict rule, the normalizer, the projection, RR-7, the authority and
settlement controls, and element 24, the finalized `alongsideControlConsidered` semantics — read off
the executing artifacts, not declared. Sixteen negative fixtures fail the identity, including
reverting to the §247 schema, leaving the adapter behind on §247, making the cessation fields
nullable again, reinstating the null instruction, and a successor that no longer reduces to §247.

`SECTION-252-CANDIDATE-IDENTITY-V2-2.json` is left byte-unchanged and remains a true statement about
the pre-§253 head.

## 13. Six observation payloads

**Byte-identical to the §252 freeze**, proved per case by SHA-256 comparison against the digests the
§252 instrument recorded. Not redrawn, not reworded, not adapted. Cases exposed to inference: **0 / 6**.

## 14. Successor instrument digest

    674e940157b2d0647158a56c998e76d49fedf0d7c0ab4c53025a6ff886bf59ef

Substantive changes from §252: **0**, verified by copying the substantive half rather than retyping
it and then deep-comparing. Seven top-level keys differ and every one is on the declared
metadata-only allowlist: the instrument version, the supersedes block, the executable binding, the
mechanically-updated list, two verification flags and the digest. The per-case request digests moved
because the transmitted schema now carries the §253 justification representation, which is recorded
per case with that reason.

## 15. Regression and git diff summary

19 suites, 1,565 assertions, **0 hard failures**, TypeScript clean apart from the frozen
`POSTURE_REF_KINDS_237` error.

Three production files: one new contract module, and one successor-selection line each in the entry
point and the adapter. Six new scripts, one one-line suite registration, one script restored
byte-for-byte. No verification package other than §253's own was written.

**One classification needs your ruling.** Two historical suites now fail an assertion that names
`buildExpert247WireSchema` — `test-246-productionization` E3b and `test-249-identity-hardening` P7.
Both became untrue only because the schema head moved to §253. That is a **second and different
class** from the strict-flag supersession you authorized in §252, so I have recorded them as
`PENDING_RULING` rather than superseded, left both suites unedited, and made the runner refuse to
absorb any failure outside the two declared lists. `test-expert-anthropic-adapter-repair` remains
SUPERSEDED on the strict flag alone.

`test-252-candidate-identity` was deliberately **not run**: it writes the identity document the
accepted §252 package pins. Under the §253 head its element 6 would resolve to no known builder and
P2, P4 and P5 would fail. That is stated analytically rather than produced by overwriting frozen
evidence, and the §253 runner verifies the §252 package byte integrity instead.

## 16–17. Spend

Provider calls: **0**. Database operations: **0**. Spend: **USD 0.00**.

## 18. Terminal

    EXPERT_HAZLENZ_CONTRACT_CONSISTENCY_CLOSED —
    DRIVER_ROLE_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED

The six frozen driver-role observations remain unexecuted and substantively unchanged. Executing them
requires your explicit authorization, which §253 did not take.

STOP.
