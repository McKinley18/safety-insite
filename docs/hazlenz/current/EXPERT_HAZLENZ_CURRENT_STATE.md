# EXPERT HAZLENZ — CURRENT STATE

**This is the default development-context source for Expert HazLenz work.** It describes the
current architecture and the current known state only. It deliberately does not narrate the section
history. Where a claim rests on evidence, it names the archive location rather than restating it.

Consolidated at §223, refreshed at §229 (2026-09-11). Supersedes the pre-§209 state package, which
was archived in §229 to `docs/hazlenz/validation/superseded-209/`.

---

## 1. Product purpose

Safety InSite is a safety inspection product. A duty holder records an observation of a real
workplace condition, and the system produces an analysis a competent person can act on and defend.

Expert HazLenz is the model-authored reasoning layer for that analysis. Its job is not to be
articulate about hazards. Its job is to be exact about **what is not yet known and must be
established before a decision is safe** — and to make that gap survive, visibly and unsettled, all
the way into authoritative state.

## 2. Supported expert tasks

1. **Hazard identification** — name the matter in hand from the observation.
2. **Decision-critical unresolved-fact declaration** — emit, as structured output, each fact that
   must be established before the situation can be judged, with both branches, the decision under
   each branch, and what is done today while it remains open.
3. **Clarification authoring** — the question that would actually resolve the fact.
4. **Governed regulatory grounding** — bind reasoning to supplied authoritative source records
   only.
5. **Verification (second pass)** — an independent review of the first pass's declared property.
6. **Human review packet assembly** — present the property, the observation span, both branches and
   the controls to a human reviewer.

## 3. Current pipeline

```
observation
  -> FIRST PASS            model authors semantics (hazards, declarations, clarifications)
  -> PROJECTION            deterministic: validate, project or refuse. Never repair.
  -> OWED-FACT LEDGER      admitted facts become authoritative unresolved state
  -> VERIFIER              second model pass over the admitted declaration
  -> SCOPE CONTAINMENT     refuses sibling/adjacent nomination under a single-target contract
  -> PROPERTY AUTHORITY    a human must confirm the property before it can be settled
  -> HUMAN REVIEW PACKET   the reviewer sees span, property, branches, decisions, controls
  -> SETTLEMENT REVIEW     settlement applies only on recorded human authority
```

Both model legs are assembled by one module so the bytes inspected before a freeze are the bytes
transmitted after it. The first-pass contract is an additive successor chain: each version inserts a
block into its predecessor and can reconstruct the predecessor byte for byte.

## 4. Semantic-authority model

**The model authors safety semantics.** Property identity, branch meaning, what is unresolved, what
the clarification should ask — these originate in the model and nowhere else. If the model does not
say it, the system does not know it.

## 5. Deterministic-authority model

Deterministic code may **validate**, **project** and **refuse**. It may not invent, repair,
reconstruct or infer safety meaning — including by parsing prose, inferring a role from vocabulary,
or reading meaning out of a malformed field. A declaration that fails validation is refused whole;
it is never partially rescued.

## 6. Owed-fact contract

An owed fact is an authoritative record that a decision-critical question is open. It carries the
observation span it came from, the proposed property, both branches, the decision under each branch,
and the action to take while it is unresolved. Its lifecycle is append-only: `UNRESOLVED` is the
birth state, and a fact leaves it only by a recorded, authorised transition.

An unknown becomes an owed fact only when resolving it is material to the decision under analysis. A
real unknown that does not bear on the decision is not a gap.

## 7. Verifier contract

The verifier is a second, independent model pass over an **admitted** declaration. It is advisory:
it may nominate a controlling property, and consistency checking refuses its output whole when the
disposition and the property disagree. It cannot admit a fact the first pass never declared, and it
cannot settle anything. Its development gate is a literal `false` constant, so it does not run
outside experiments.

## 8. Property authority and the KR-1 boundary

Property authority and evidence authority are **distinct**. Evidence may be approved while the
property it bears on is still unconfirmed, and approving evidence settles nothing on its own.

**KR-1 is OPEN — HUMAN-GATED V1.0 LIMITATION.** The system cannot itself decide whether a
model-nominated property is the real underlying safety property or a proxy for it. The v1.0
containment for that is a human: a fact is born `REQUIRED_NOT_OBTAINED`, and settlement is refused
with `PROPERTY_AUTHORITY_NOT_OBTAINED` until a human confirms the property. A reviewer who declines
produces `DECLINED_KEEP_UNRESOLVED` and the fact stays open with zero transitions. This is an
intentional v1.0 boundary, not a defect awaiting a patch.

## 9. Human settlement authority

No provider or model output can mint customer-authoritative settlement. Confirming a property and
approving evidence are two separately recorded human decisions. A satisfactory settlement moves
exactly one fact on exactly one ledger transition. A human correction takes effect exactly and is
never overwritten by later model output.

## 10. Governed evidence boundary

Regulatory authority must come from supplied, authorised source records. The model may not invent a
citation, a requirement or a regulatory text, and an available-but-off-point supplied record must
not enter controlling reasoning merely because it was in the payload. Grounding supports a decision;
it never settles an open fact.

## 11. Fail-closed invariants

- A malformed decision-critical declaration is refused, and the identified property is preserved in
  a `STRUCTURALLY_INVALID_DECLARATION` record rather than discarded (RR-7).
- A non-semantic filler in a required field is refused as `NON_SEMANTIC_PLACEHOLDER_VALUE`.
- A declarations field that is not an array is recorded as a structural provider defect; the field
  is never parsed, and the verifier leg is elided.
- Absence of evidence is never converted into established adverse truth.
- An established-safe or adequately-negated condition is never manufactured into a decision-critical
  hazard.
- Safety-critical gates are pass/fail at zero occurrence and can never be offset by an aggregate
  score.

## 12. Current known limitations

1. **Silent non-declaration (Class A, open).** The first pass can return a well-formed, complete
   response with an empty declarations array while naming the concern in prose or in a hazard
   candidate. Nothing downstream can act on a fact that was never declared, so no containment
   mechanism applies. **This is the one failure mode with no architectural containment.** Recall was
   7/7 on §227's eight fresh cases and every §228 declaration arrived, but it has never been measured
   on a population.
2. **Wrong-property selection (Class A, containment now proven; rate unmeasured).** The first pass can
   emit a well-formed declaration naming a property that is not the controlling one. **§228B saw this
   happen live and the containment held**: a human correction replaced the property, the authority
   outcome was `CORRECTED`, and the settlement was refused with `PROPERTY_AUTHORITY_NOT_OBTAINED`
   even with an approved evidence authority in hand. How often it happens, and whether a real
   reviewer would notice, are not established.
3. **Structured-output reliability (Class B, contained).** Across §221, §227, §228B and §228C: three
   truncations at `max_tokens`, one 45-token degenerate response, and required fields returned as
   JSON strings. Each was refused fail-closed and named in the end state. On §228B's C1 the model's
   own `outcome` field read `ANALYZED` while the result was structurally unusable; the unusability
   signal came from the deterministic layer.
4. **KR-1 property authority is human-gated** (section 8). The containment is now exercised, not just
   designed.
5. **C7 immediate-decision language (contained material quality defect).** On a case where a steam
   boiler was established to be running with no written scheme of examination in force, the adverse
   branch said continued operation "should be reviewed" and the while-unresolved action did not stop
   it. Nothing authoritative moved because of it — zero transitions, no evidence authority,
   `impliesWorkRelease: false` — so it is contained. It is **not accepted as desirable behaviour** and
   is carried in the improvement register.
6. **`assertedConditionState` is non-authoritative but verifier-visible.** It is **not load-bearing in
   deterministic authority logic**: zero occurrences in projection, the verifier payload, the ledger,
   owed-fact binding, property authority, settlement review or governed-evidence derivation. It **is**
   rendered into the verifier's user prompt as prose. Measured across §228B and §228C, a contradictory
   label never moved a verifier nomination. Nothing downstream should be written that reads it.
7. **No production activation.** Deterministic HazLenz remains the only customer-authoritative
   analysis path. Expert HazLenz is not wired into any NestJS runtime consumer, and the production
   build (`backend/tsconfig.json`, `include: ["src/**/*"]`) cannot reach the experiment modules under
   `backend/scripts/lib/`. §229 confirmed this by building: `backend/scripts/` contributes zero of the
   1,071 emitted files.

## 13. Current validation status

**The targeted Expert capability-development and integrated-revalidation phase is CLOSED.**

| section | question | result |
|---|---|---|
| §223 | frozen acceptance computation over §221 | **NOT PASSED** — 3 PASS, 3 FAIL, 6 COVERAGE_INSUFFICIENT |
| §227 | first-pass targeted semantic capability, hosted | **CONFIRMED** — 7/7 capability gates on 8 fresh cases |
| §228B | targeted integrated revalidation, 8 cases, 68 slots | **INCONCLUSIVE** — 12/14 hard requirements PASS, **0 FAIL**, HR4 and HR7 COVERAGE_INSUFFICIENT |
| §228C | KR-1 coverage completion, 1 fresh case | **KR1-A PASS, KR1-B PASS** |

**Combined targeted engineering evidence: 14 / 14 integrated hard requirements demonstrated, with
explicit provenance — §228B plus a separately frozen §228C coverage completion.** §228B is **not**
rewritten as PASS. HR4 and HR7 rest on one fresh case executed under its own frozen instrument, and
that provenance travels with the number.

**Established.** Declaration survives projection into authoritative unresolved state. The controlling
proposition is preserved through the ledger, the verifier, the review packet and into a terminal
status. The verifier routes underlying safety state, required act and required artifact. A
model-authored property cannot settle without recorded human property authority, and an approved
evidence authority does not substitute for it. A human confirmation grants property authority and
nothing else. A human correction takes effect and the original property cannot then settle. A
satisfactory settlement moves exactly one fact on exactly one transition. A reviewer who declines
leaves the fact open with the sibling intact. RR-7 preserves an identified property through a refusal
into a record that cannot settle. An established-safe case declares nothing. Governed grounding binds
only the supplied on-point record and settles nothing.

**Not established.** Population-level reliability of anything above. Six hard requirements rest on a
single case each, and a single case never generalises.

## 14. Active blockers

**None.** No requirement failed anywhere in §228B or §228C, and no residual defect escaped
containment.

The two Class A first-pass defects (section 12, items 1 and 2) are **measurement obligations for
final acceptance, not remediation work**. Remediating either before its rate is known would repeat
the §224–§227 pattern of tuning before measuring.

## 15. Next authorized product phase

**FINAL FRESH EXPERT HAZLENZ ACCEPTANCE**, against the §229 candidate baseline.

Expert HazLenz is **not finally validated**. §229 froze a candidate baseline and produced a design
envelope for final acceptance; it executed no acceptance. The final cohort must be substantially
fresher and more independent than the targeted engineering cohorts: case authorship independent of
the development session, a fresh unseen cohort, and a denominator not chosen by the party being
measured.

## 16. Detailed historical evidence

Do not load these for ordinary development. Read them when investigating provenance, reproducing a
historical defect, auditing a frozen decision, or changing an invariant one of them established.

| what | where |
|---|---|
| §221 frozen instrument, raw provider legs, end state | `verification/expert-hazlenz-221-integrated-pipeline-validation-2026-09-10/` |
| §222 product-owner adjudication ledger and classification | same directory, `*-222.*` |
| §223 gate results, defect classification, report | `verification/expert-hazlenz-223-frozen-acceptance-computation-2026-09-11/` |
| validation archive §209–§222 | `verification/expert-hazlenz-*/` by section |
| superseded state package (stops at §209) | `docs/expert-hazlenz/` |
| architectural rules that must not be violated | `docs/hazlenz/current/HAZLENZ_INVARIANTS.md` |
| what to read for a given task | `docs/hazlenz/current/CONTEXT_INDEX.md` |
