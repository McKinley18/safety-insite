# §204 — NEUTRAL REMAINING-UNIT TRIAGE AND MINIMUM-DISCRIMINATING-REVIEW-SET

Written 2026-09-07, immediately after batch `204-A-U09` was recorded.

**STATUS OF THIS DOCUMENT.** This is triage, not adjudication. Nothing below supplies,
implies, or pre-commits any verdict on any open slot. It states (a) the structural position
of each remaining review unit, and (b) which measurement question that unit is positioned to
answer that recorded results do not already answer. Every characterisation of a remaining
unit is drawn from the frozen §199/§200 preregistration and from structural facts of the
worksheet — never from an assessment of the provider output in that unit.

**AUTHORITY.** Sequential adjudication is STOPPED per the risk-based closure direction
already issued. This document does not resume it and does not present U10. It exists so the
product owner can choose which, if any, of the remaining units are worth adjudicating.

---

## 1. HEADLINE COUNT AFTER U09

| | |
|---|---|
| SUPPLIED | **60 / 120** |
| REMAINING | **60 / 120** |
| Supplementary (deferred by §202 product-owner decision) | 0 / 66 |
| Excluded by product-owner decision (SG-01 / SG-02 row axes) | 8 |

Units U01–U09 are complete. The 60 remaining headline slots sit in nine units across five
rows.

---

## 2. WHAT THE RECORDED RESULTS ALREADY ESTABLISH

Stated only to identify which questions are closed. No new inference is drawn.

1. **Multi-gap preservation failure — established once.** SF-02
   (`MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS`, preregistered gap count 2/2) carries recorded
   `A_FIRST_PASS_GAP_RECALL = INCORRECT` and `H_MULTI_GAP_PRESERVATION = INCORRECT`
   (batch `204-A-U04-CORRECTION`). Structurally, one projected fact exists for that row.
2. **False-gap suppression failure — established once, and not uniform.** Of the three
   `NO_REAL_GAP` rows, SF-03 is recorded all-CORRECT (U03) and SF-04 is recorded
   `B = INCORRECT`, `I = INCORRECT` (U06). SF-12 is unadjudicated.
3. **Owed-property loss with downstream clarification insufficiency — established once.**
   U09 is the first and only `Q_OWED_PROPERTY_LOSS_IMPACT` recorded as anything other than
   `NO_OBSERVABLE_LOSS` (`CLARIFICATION_INSUFFICIENCY`); U02, U05 and U07 are all
   `NO_OBSERVABLE_LOSS`. The §204 record of that judgment carries the product owner's
   explicit instruction that it must not be overgeneralised into an architectural remedy claim.
4. **Priority-floor under-escalation on life-critical facts — established twice.** U05 and
   U09 each carry `R_SAFETY_CLASSIFICATION = PLAUSIBLY_LIFE_CRITICAL` together with
   `R_PRIORITY_FLOOR_IMPACT = FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE`. Both records carry the
   measurement-evidence-only limitation verbatim.
5. **Affected-decision coverage is narrow.** Of four projected facts adjudicated, three are
   `REQUIRED_CONTROL` (U05, U07, U09) and one is `HAZARD_SEVERITY` (U02). No `EXPOSURE`
   fact has been adjudicated.

---

## 3. REMAINING UNITS — NEUTRAL STRUCTURAL POSITION

| Unit | Kind | Row | Preregistered families | Open headline slots |
|---|---|---|---|---|
| U10 | ROW_FIRST_PASS_BEHAVIOUR | SF-05 | SINGLE_REAL_UNRESOLVED_FACT, FUNCTION_VERSUS_APPEARANCE | 4 |
| U12 | ROW_FIRST_PASS_BEHAVIOUR | SF-12 | NO_REAL_GAP, FUNCTION_VERSUS_APPEARANCE | 4 |
| U13 | ROW_FIRST_PASS_BEHAVIOUR | SF-07 | SINGLE_REAL_UNRESOLVED_FACT, NEARBY_PROPERTY_COMPETITION | 4 |
| U14 | PROJECTED_FACT | SF-07 | (fact `FP.REQUIRED_CONTROL.OBS-SF-07.493-604.1`, decl `DECL-1`) | 10 |
| U15 | ROW_FIRST_PASS_BEHAVIOUR | SF-08 | CONJUNCTIVE_FACT | 4 |
| U16 | PROJECTED_FACT | SF-08 | (fact `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1`, decl `decl-cap-discharge`) | 10 |
| U17 | PROJECTED_FACT | SF-08 | (fact `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1`, decl `decl-voltage-test`) | 10 |
| U18 | ROW_FIRST_PASS_BEHAVIOUR | SF-11 | SINGLE_REAL_UNRESOLVED_FACT, EXPOSURE_DECISION, NOT_OBSERVED_IS_NOT_ABSENT | 4 |
| U19 | PROJECTED_FACT | SF-11 | (fact `FP.EXPOSURE.OBS-SF-11.357-406.1`, decl `UFD-1`) | 10 |
| | | | **TOTAL** | **60** |

U11 (SF-05 refused declaration `decl1`, two slots) is supplementary and remains deferred under
the §202 product-owner decision; it is not part of the 60. U20/U21 (SG-01, SG-02) remain
excluded from the answerable denominator.

**Structural note on SF-05 (bears on U10 only).** SF-05's sole declaration was structurally
refused with `REQUIRED_FIELD_MISSING` on both `decisionIfA` and `decisionIfB`. Consequently no
projected fact exists for SF-05, and U10's row axes are the only place the refusal path
touches the headline count. This is a fact about the refusal record, not a judgment about the
declaration.

**Structural note on SF-08 (bears on U15/U16/U17).** SF-08 is the only `CONJUNCTIVE_FACT` row,
preregistered gap count min 1 / max 2, and two separate projected facts exist for it. Whether
that structural separation preserved or damaged the conjunctive property is exactly what
U15–U17 would decide, and is not decided here.

---

## 4. DISCRIMINATING VALUE OF EACH REMAINING UNIT

Ranked by what each would settle that recorded results leave open. Ranking is about
information position only.

### Tier 1 — settles a question no recorded result can settle

- **U12 (SF-12, 4 slots).** The third and last `NO_REAL_GAP` row. The recorded `NO_REAL_GAP`
  evidence is currently split one clean (SF-03) to one failed (SF-04). U12 is the only unit
  that can break that tie and the only one that can show whether false-gap behaviour tracks
  the pairing family (`NEARBY_PROPERTY_COMPETITION` vs `TEMPORAL_SCOPE` vs
  `FUNCTION_VERSUS_APPEARANCE`). Highest slots-to-information ratio of anything remaining.
- **U15 + U16 + U17 (SF-08, 24 slots).** The only conjunctive-fact cell in the instrument.
  Both established preservation failures so far — SF-02's independent-gap loss and SF-06's
  temporal-conjunct loss — concern whether a compound owed property survives projection. SF-08
  is the only row designed head-on for that mechanism, and it is the only remaining place the
  `Q_OWED_PROPERTY_LOSS_IMPACT` axis could produce a second non-`NO_OBSERVABLE_LOSS`
  observation under an explicitly conjunctive design. Adjudicating U16 and U17 without U15
  would leave the row-level recall/precision context unrecorded.
- **U18 + U19 (SF-11, 14 slots).** The only `EXPOSURE_DECISION` row, the only
  `NOT_OBSERVED_IS_NOT_ABSENT` row, and the only `FP.EXPOSURE` projected fact. Every recorded
  finding to date rests on `REQUIRED_CONTROL` or `HAZARD_SEVERITY` facts. U19 is the only unit
  that can show whether the recorded findings are specific to those affected-decision types or
  hold across the exposure family.

### Tier 2 — unique cell, narrower reach

- **U10 (SF-05, 4 slots).** The only row whose sole declaration was structurally refused, so
  it is the only headline measurement of row-level gap recall and precision under a refused
  declaration. It is also SF-12's preregistered pair, though the pairing is asymmetric because
  SF-05 has no projected fact. Worth adjudicating with U12 if the pair is to be read together;
  U12 does not structurally depend on it.

### Tier 3 — replication of an already-clean cell

- **U13 + U14 (SF-07, 14 slots).** SF-07 repeats SF-01's family combination
  (`SINGLE_REAL_UNRESOLVED_FACT` + `NEARBY_PROPERTY_COMPETITION`), which is recorded
  all-CORRECT across U01 and U02. These units are the pure replicate. They would strengthen or
  disturb an existing clean result but are not positioned to open a question that is currently
  unanswerable.

---

## 5. PROPOSED MINIMUM DISCRIMINATING REVIEW SET

Offered for the product owner's decision. Not started, not pre-judged.

- **Minimum set: U12, U15, U16, U17, U18, U19 — 42 of the 60 remaining headline slots.**
  This covers every remaining measurement cell that no recorded result can reach: the last
  `NO_REAL_GAP` row, the only conjunctive-fact row, and the only exposure-decision row.
- **Plus U10 (46 slots)** if the SF-05 / SF-12 pair is to be read together and the
  refused-declaration row is to carry a headline record.
- **Deferring U13 + U14 (14 slots)** costs only the replicate of an already-clean cell. If the
  minimum set produces further failures, U13/U14 becomes more informative as a contrast case
  and can be picked up afterwards.

Sequencing suggestion, if any of it is taken up: **U12 first** (4 slots, breaks the
`NO_REAL_GAP` tie), then **U15/U16/U17**, then **U18/U19**. Each is independently recordable
through the existing append-only `record-204-adjudication-verdicts.ts` machinery, so the set
can be stopped at any point without leaving a partial unit.
