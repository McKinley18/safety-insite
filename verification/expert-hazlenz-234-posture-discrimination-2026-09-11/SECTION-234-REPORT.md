# §234 — HOSTED IMMEDIATE SAFETY POSTURE DISCRIMINATION: FAILED

**16 provider calls · 0 retries · USD 1.5978 of the USD 1.80 ceiling · 0 database operations ·
0 protected modules mutated · §233 implementation byte-identical before and after · no commit, push,
tag or deploy.**

The pass rule required 16 / 16 exact posture identity. **The cohort scored 5 / 16.**

`EXPERT_HAZLENZ_POSTURE_DISCRIMINATION_VALIDATION_FAILED — PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED`

The evidence is frozen. Nothing has been remediated, no prompt has been touched, and the §233
implementation was not modified at any point during execution.

---

## The five requirements

| | required | actual | |
|---|---|---|---|
| exact posture identity | 16 / 16 | **5 / 16** | FAIL |
| safety-critical under-conservative errors | 0 | **1** | FAIL |
| structural contract failures | 0 | **10** | FAIL |
| user-visible recommendation contradicting the posture | 0 | **0** | pass |
| manufactured declarations carrying action | 0 | **3** | FAIL |

Over-conservative posture errors: **0**. Not one case restricted work the frozen truth permits.

---

## What actually happened, in order of size

### One. Ten of sixteen outputs never produced an authoritative posture at all

The §233 projection refused ten analyses and they therefore have no posture to score. This is the
architecture behaving fail-closed, which is what it was built to do, but it means the cohort could
not measure most of what it was built to measure.

The refusals are not one thing. They are three, and they need different decisions.

**Wire-shape anomalies — six cases.** The provider returned output the contract could not read.

| anomaly | §234 (16 calls) | §231 base rate (30 calls) |
|---|---|---|
| whole answer wrapped in a `parameters` envelope | 2 | 1 |
| required root fields simply absent | 1 | 1 |
| a structured field the projection reads emitted as a JSON string | 3 | **0** |

The last row is the one that matters. Emitting the free-text `outcome` field as a string is a
pre-existing base-contract habit (29 of 30 in §231) and is harmless, because nothing in the
projection reads it. Emitting a field the projection *does* read as a string was not observed once
in thirty §231 calls and was observed three times here — twice on the posture object itself, and in
both of those cases the string does not even parse. That is a hypothesis about the larger §233
payload. At n = 16 it is not a rate and must not be reported as one.

**A contract-instruction gap — three cases.** The §233 projection enforces three rules that the
transmitted instruction and the schema descriptions never state:

- a reference may not appear in both `requiredBy` and `acceptedWithoutImmediateAction` (refused D1
  and D2);
- every emitted declaration must appear in one of the two lists (refused D4);
- every self-asserted ACTIVE candidate must appear in one of the two lists (refused S1).

On D1 and D2 the model named a hazard as a reason for CONTINUE *and* accepted it without action.
That is a coherent thing to mean, and it was refused by a rule it was never given. This is the §139
signature the §233 implementation applied to the posture enum and did not apply to the list
semantics.

**A genuine model omission — one case.** S1 left an ACTIVE candidate out of both lists. That fails
under any reading, and P3 was right to refuse it.

### Two. One safety-critical under-conservative error, and it has a named mechanism

**S2, expected STOP, actual HOLD_PENDING_VERIFICATION.** A curing autoclave whose door interlock was
found defeated by a jumper wire, with the shift log recording when it was fitted and forty cycles run
since. The controlling property is established. The model instead declared *whether the locking ring
is fully engaged* as an unresolved fact, put that invented unknown in the posture basis, and used it
to select a hold.

This is the §231 M4 shape. In §231 it was a restraint failure. Here it produced the unsafe answer.

P3 did not prevent it, and could not: P3 asks whether every declaration is **covered** by the
posture, and a manufactured declaration placed in `requiredBy` is covered. Coverage was never a test
of whether the declaration should exist.

Two further manufactured declarations were flagged. **S3** reached the correct STOP but still routed
it through an invented unknown. **E2** reached the correct CONTINUE_WITH_CONTROLS and put the
invented declaration into `resumeCondition`, which exposes a second gap: **§233 does not refuse a
resume condition emitted under a posture that permits continued work.** P4 requires one when the
posture does not permit work; nothing forbids one when it does. The projected recommendation
therefore carried a resume gate on work the same object said may continue.

### Three. What did not fail

- **Recommendation silence was structurally prevented, exactly as §233 claimed.** The judgment lists
  ten "recommendation contradictions", and all ten are the ten refusals seen from a second angle:
  the frozen scorer marks the check false whenever there is no recommendation state, and there is no
  recommendation state precisely when the posture was refused. On every output the contract
  admitted, the projection produced a faithful recommendation state and the completeness check
  returned no code. **Independent recommendation defects: zero.**
- **No prohibited union type appeared on the wire** on any of the sixteen transmissions.
- **Refusal behaviour was fail-closed on all ten refusals**, each preserving what was identified in
  an inadmissible record that cannot close the analysis.
- **Zero over-conservatism.** The four CONTINUE cases were built to punish indiscriminate escalation,
  including a live molten-zinc kettle and an unassessed management proposal to double-man a new
  starter, and nothing escalated.
- **Zero truncations** at the preregistered 8,000-token ceiling. The longest output was 5,100 tokens
  and a second was 4,306, so the §231 ceiling of 4,000 would have truncated at least two cases. The
  decision to raise it, recorded before the spend, was load-bearing.

---

## The diagnostic read, and why it is not the result

The product-owner remediation decision turns on whether the *degree judgment underneath* the wire
failures is sound. Withholding that would leave the decision less informed for no gain in rigour, so
it is recorded — and fenced.

Unwrapping the tool envelopes and parsing the stringified fields recovers a posture value on 13 of
16 cases. Of those, **12 agree with the frozen truth and one does not, which is S2.**

**This is not the §234 result and it does not change a single verdict.** The pass rule scores the
authoritative projected posture. An output the contract refuses has no authoritative posture, and
reading one out of it by hand is the output repair the execution discipline forbids. The frozen
5 / 16 stands, and two of the three unreadable cases could not be recovered at all because the
stringified JSON is itself malformed.

What the diagnostic supports is narrow and it is this: **the dominant failure in §234 is
representational, not a collapse of posture judgment.** It supports no claim about a rate.

---

## Failure classification, as the authorization requires

| class | cases |
|---|---|
| wrong posture degree | S2 |
| wrong controlling property | none |
| malformed or incomplete structured posture | D1 D2 D4 E1 E3 F1 F3 S1 |
| recommendation projection defect | none |
| control / timing / resume inconsistency | E2 |
| provider or transport anomaly | F4 S4 |
| manufactured declaration carrying action | E2 S2 S3 |
| no failure | D3 E2 E4 F2 S3 |

F3 is classified on its malformation and not as a referential defect: its hazard candidates arrived
as a string, so the projection saw no candidate keys and every posture reference was unresolvable. A
tooling failure is not converted into a semantic verdict.

---

## What was frozen before the spend

The truth preflight ran seventeen machine checks and passed 17 / 17. It failed once on the first
run — two CONTINUE cases refuted STOP in a clause too thin to adjudicate against — and both were
rewritten in the development instrument before the freeze and before any spend, which is the only
point at which repair is permitted. No expected posture, observation or truth field was changed.

Frozen before the first provider call, and re-verified by the executor before it transmitted:

| | |
|---|---|
| instrument digest | `d988f2904c77185c047f06fd680a83d8733e1d5d7451d8e4e6b1128145cd7c64` |
| package digest | `856b564802d0f36dbd702cce535f9a64f48d6fc392b2dc8d40ac31f94bcabc42` |
| §233 implementation digest | `5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af` |
| protected composite identity | `37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb` |
| protected modules mutated | 0 of 29 |
| §233 evidence manifest | 6 / 6 verify |

The **scorer was written and digested before the first call**, so the scoring code cannot have been
shaped by the output it scores. The manufactured-declaration test was defined in the same freeze, in
terms of labels the model itself authors, so it is decidable without reading prose.

The freshness rule was checked mechanically rather than asserted: no §234 observation overlaps any of
the thirty §230 observations above threshold, no case paraphrases another, and no excluded
prior-cohort subject term appears anywhere in the cohort.

**One defect in the frozen scorer is recorded and deliberately not repaired.** Its console line
prints `over` for a case that has no posture at all, because the mark expression falls through to
the over-conservative branch. The recorded data is correct — those ten cases are stored as
`NO_POSTURE` and the over-conservative list is empty — and editing the scorer after seeing the
output would destroy the pre-spend guarantee for a cosmetic gain.

---

## Cohort design, stated plainly

Sixteen fresh scenarios, four per posture, single arm, first-pass leg only. Subjects: water
treatment, galvanizing, glass containers, brewing, materials recovery, ferry loading, theatre
rigging, cooling towers, ship repair, foundry melting, exchange batteries, aircraft jacking, chemical
warehousing, tyre retreading, magnetic resonance imaging and scrap metal recovery. None appears in
§221, §225, §227, §228 or §230/§231, and none is derived from a §231 hard-gate failure.

Expected postures were derived from one declared axis — is the property controlling continued work
established or unresolved — and frozen before any call. The cohort also freezes one disambiguation
the §233 vocabulary leaves open: a control counts towards CONTINUE_WITH_CONTROLS only if it is not
already in effect. Every CONTINUE case owes no new control at all, so all four are correct under
either reading.

Two of the four STOP cases require professional knowledge rather than alarm to recognise. None of the
four CONTINUE cases is a trivial safe control: three carry a real present hazard or a real adverse
event and are correct only if the analysis declines to escalate.

**Authoring independence: none.** This session wrote the cases, the truth and the scoring rules,
having read the §231 failure evidence and the §233 implementation. That is the same limitation §230
recorded and writing it down does not remove it.

---

## What this result does and does not license

At n = 16 this is not a population-level accuracy rate, and a pass would not have been one either.
It answers whether the targeted remediation demonstrated correct discrimination on a preregistered
fresh boundary set, and it did not.

The §234 cases are now **spent validation evidence**. They may not become the successor acceptance
cohort, and neither may the §231 cases.

**No remediation has been performed and none is proposed here.** Three distinct decisions are owed
and they do not have the same answer:

1. the wire-shape anomalies, which may be a payload-size effect and are not a posture-contract
   defect;
2. the contract-instruction gap in P2 and P3, which is a §233 defect of the kind §233 itself
   identified and closed for the enum but not for the list semantics;
3. the manufactured-declaration mechanism, which produced the one unsafe answer and which coverage
   was never capable of catching.

---

**TERMINAL:
`EXPERT_HAZLENZ_POSTURE_DISCRIMINATION_VALIDATION_FAILED —
PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED`**
