# §181 — GOVERNED EVIDENCE ALIGNMENT AUDIT

`EVIDENCE_QUESTION_TO_VERIFICATION_METHOD_ALIGNMENT`. **Read-only. Zero governed records modified,
zero provider calls, zero database operations.**

Full per-question data in `GOVERNED-EVIDENCE-ALIGNMENT-AUDIT.json`.

---

## Method, and its honest limits

Every approved record carrying both `evidenceQuestions` and `verificationMethods` was reviewed, one
question at a time, asking: *does answering this question require establishing a property this
record's stated method can establish?*

**No automated semantic scorer was built**, and the authorization forbids one. Each classification is
an engineering judgement recorded by name in a table in
`backend/scripts/a0-governed-evidence-alignment-audit-2026-09-05.ts`. The code performs no comparison
at all — it looks each pair up, counts, and reports `UNCLASSIFIED` for any pair the table does not
cover, so a registry change surfaces as a gap rather than a guess.

> **Provenance: `AI_PERFORMED_DEVELOPMENT_AUDIT = true`, `HUMAN_ADJUDICATED = false`.** These 28
> classifications are my engineering judgement. They are not human adjudication and must not be
> recorded as such; a human review of the 28 pairs is a separate act.

## Results

| measure | value |
|---|---|
| `TOTAL_APPROVED_RECORDS_REVIEWED` | **20** |
| `RECORDS_WITH_BOTH_QUESTIONS_AND_METHODS` | 20 |
| `TOTAL_EVIDENCE_QUESTIONS` | **28** |
| `ALIGNMENT_CLEAR` | **21** |
| `QUESTION_STRONGER_THAN_METHOD` | **4** |
| `METHOD_STRONGER_THAN_QUESTION` | **1** |
| `AMBIGUOUS` | **2** |
| `NO_VERIFICATION_METHOD` | **0** |
| `UNCLASSIFIED` | 0 |

### The four misalignments

| record | question | method | why it does not reach |
|---|---|---|---|
| `app-mg-01` | *Is the guard functional?* | `physical_inspection` | function is not established by looking — the §169 class exactly |
| `rec-msha-30-56-12` | *Is equipment properly grounded?* | `physical_inspection` | the requiredFact is `grounding_integrity`; a visible conductor can be broken, corroded or unbonded |
| `app-haul-01` | *Can persons contact moving parts?* | `inspection` | reachability needs gap dimensions and body position, not a state report |
| `app-ppe-02` | *Is appropriate PPE provided?* | `observation` | "appropriate" requires comparison against an assessed hazard |

### The two ambiguous

`app-fall-01` *"Is edge protected?"* and `app-mat-01` *"Is material stable?"* — each reads either as a
presence question, which inspection settles, or an adequacy question, which it does not. The records
do not disambiguate.

### The one benign direction

`app-loto-01` *"Is lockout device applied?"* against `zero_energy_verification`: the method
establishes strictly more than the question asks. The registry's only instance.

## The finding that matters most for settlement

> **No functional-test verification method exists anywhere in the registry.**

Nine distinct methods across twenty records: `physical_inspection`, `visual_inspection`, `inspection`,
`walkthrough`, `observation` (directly observational); `audit`, `design_review` (desk-based);
`gas_detection`, `zero_energy_verification` (instrumented or procedural).

There is no `function_test`, no `functional_verification`, no `performance_test`. The
`protective_response question vs functional test` pattern the authorization asked about **does not
appear — because neither side of it exists in this registry.**

The consequence for HR-04 is direct and should not be softened: even a fully wired settlement
architecture, handed the `app-mg-01` criterion, would be offering `physical_inspection` as the
example of evidence sufficient to settle a **securement** property. A reviewer should judge that
insufficient. The architecture's correct behaviour is then to leave the fact `UNRESOLVED` — which
A0's replay confirms it does.

### On §171's figure

§171 recorded *"seven of nine distinct verification methods are looking-based."* This audit counts the
same nine and groups them five observational, two desk-based, two instrumented/procedural. **The §171
figure holds if `audit` and `design_review` are grouped with looking**, which is a defensible
grouping. The grouping is stated here rather than assumed, so a future reader can disagree with it
without re-deriving the counts.

## §180 characterisations, checked

| claim | verdict |
|---|---|
| `app-mg-01` asks presence *and* function while offering only physical inspection | **CONFIRMED** — one of its two questions has no method behind it |
| `app-loto-01` matches its isolation question, which is why §171 derived from it | **CONFIRMED** |
| `app-fire-01` is about extinguisher tags under 1910.157, not burner flame-failure safeguards | **CONFIRMED** — its only question is *"Is tag legible?"* |

## Two findings on a different axis, recorded because they surfaced

Not what the audit measured, and worth someone's attention:

- **`app-elec-01`** — `requiredFacts: ['cord_integrity']`, but its only evidence question is *"Is
  panel closed?"*. The question does not address the required fact.
- **`app-fire-01`** — `requiredFacts: ['access_path']`, but its only question is *"Is tag legible?"*.

That is a **question-to-requiredFact** mismatch rather than a question-to-method one. It matters for
settlement because `deriveAcceptableEvidence` builds its requirement sentence from `requiredFacts` —
so on these records the derived target names a fact the record's own question never asks about.

- **Placeholder citations** — `app-rig-01` and `app-mat-01`. The derivation refuses both with
  `CITATION_IS_A_PLACEHOLDER`, so no criterion reaches an owed fact from either. This confirms the
  code comment that *"two records in the live registry carry exactly this marker."*

## Classification

**`EVIDENCE_QUESTION_TO_VERIFICATION_METHOD_ALIGNMENT` = PARALLEL REMEDIATION**, unchanged from
§180's classification and now **quantified**: 4 of 28 questions demand more than their method
delivers, 2 are ambiguous, and the vocabulary contains no functional-test method at all.

It is **not** a prerequisite, because A0 demonstrated the architecture leaves a fact `UNRESOLVED` when
its criterion is null, weak or absent — the failure is transparent rather than silent. It is **not**
merely a later quality improvement either: the one property HR-04 turns on is the one the registry
cannot express.

**No governed record was modified, and none may be strengthened to make the architecture work.** The
remediation, if authorized, is a knowledge-governance act with its own review path — and the two most
defensible first steps are the smallest ones: disambiguating the two ambiguous questions, and deciding
whether a functional-test method belongs in the vocabulary at all.
