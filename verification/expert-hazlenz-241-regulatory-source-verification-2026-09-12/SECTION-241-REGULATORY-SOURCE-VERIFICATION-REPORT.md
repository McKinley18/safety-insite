# §241 — Pre-Spend Official-Source Verification of the Frozen §240 Governed Records

Produced 2026-09-12. Provider calls: 0. Database operations: 0.

## Result

**REGULATORY-SOURCE VERIFICATION: 4 / 7 VERIFIED. 7 / 7 NOT ACHIEVED.**

The single pre-spend obligation attached to the conditional execution authorization did not
pass. Under §241 this is terminal and execution is not authorized.

    TERMINAL: EXPERT_HAZLENZ_FINAL_FRESH_ACCEPTANCE_REGULATORY_SOURCE_VERIFICATION_FAILED —
              INSTRUMENT_REFREEZE_REQUIRED

No provider call was made. No frozen artifact was changed. Nothing was committed, pushed,
tagged or deployed.

## Source discipline

All seven cited sections were retrieved from the official eCFR current-text service operated
by the Government Publishing Office and the National Archives, which is the source both OSHA
and MSHA direct users to for current CFR text. Title 29 was up to date as of 2026-09-10
(latest amendment 2026-09-09); title 30 was up to date as of 2026-09-10 (latest amendment
2026-09-10). Retrieval date 2026-09-12. Retrieved XML is preserved under `official-sources/`
with per-file digests recorded in the verification artifact.

No blog, compliance summary, vendor page, training slide, secondary safety site or
AI-generated quotation was used. No historical CFR edition was used; no frozen case requires
historical law.

## Per-record result

| Record | Case | Citation | Exact text | Applicability | Verdict |
|---|---|---|---|---|---|
| GOV-OSHA-1910-151C | G2 | 29 CFR 1910.151(c) | character-identical | applicable | **NOT VERIFIED** |
| GOV-OSHA-1910-212A1 | G3 | 29 CFR 1910.212(a)(1) | exact contiguous subspan | applicable | VERIFIED, partial quotation recorded |
| GOV-OSHA-1910-141A3I | G3 | 29 CFR 1910.141(a)(3)(i) | character-identical | applicable, off point as frozen | VERIFIED |
| GOV-OSHA-1926-1153C1 | C1 | 29 CFR 1926.1153(c)(1) | character-identical | applicable | **NOT VERIFIED** |
| GOV-OSHA-1926-62D1I | C6 | 29 CFR 1926.62(d)(1)(i) | character-identical | applicable | VERIFIED |
| GOV-MSHA-57-14105 | M4 | 30 CFR 57.14105 | **not exact** | indeterminate on the frozen case | **FAILED** |
| GOV-MSHA-57-15005 | M4 | 30 CFR 57.15005 | character-identical | applicable, off point as frozen | VERIFIED |

## The three records that must change

### 1. GOV-MSHA-57-14105 — the quoted text belongs to a different section

The frozen record quotes "Repairs or maintenance **of** machinery or equipment shall be
performed only after the power is off ...". The official text of 30 CFR 57.14105 reads
"Repairs or maintenance **on** machinery or equipment ...".

This is not a typographical slip. The frozen quotation is character-identical to the official
text of **30 CFR 56.14105**, the surface metal and nonmetal counterpart, which reads "of". The
section actually cited, 57.14105, is the underground counterpart and reads "on". The record
presents the verbatim text of one section under the citation of another.

Which correction is right depends on a fact the frozen case does not state. M4 is set at "a
mineral concentrator, ball mill relining", sector MINERAL_PROCESSING_GRINDING, and says
nothing about underground or surface. 30 CFR 57.1 scopes part 57 to each underground metal or
nonmetal mine including related surface operations, so a concentrator at an underground mine
is a part 57 facility and a concentrator at a surface mine is a part 56 facility. The two
corrections are mutually exclusive:

* **(a)** keep the citation 30 CFR 57.14105 and correct the quotation "of" to "on". This
  asserts M4 is an underground mine or a related surface operation of one.
* **(b)** change the citation, sourceId and `M4.allowedAuthority` to 30 CFR 56.14105 and keep
  the quotation. This asserts M4 is a surface operation.

Either route changes governed truth and the admissible-authority set that HS8 scores, so this
section does not choose between them. The companion off-point record, 57.15005, is identical
in part 56, so the part question does not touch it.

### 2. GOV-OSHA-1910-151C — the frozen applicability statement contradicts the frozen G2 truth

The quotation is character-identical and the obligation is the right one. But `whyFrozen`
states the decision is whether hydrofluoric acid work may continue "where the drenching
facility in the work area cannot be shown to function". The frozen G2 truth establishes the
opposite: the drench shower and eyewash were tested on the morning of the shift and both
flowed, `negatedOrSafeConditions` records them as proven working, and `nonFacts` lists "that
the drench shower is inoperable" as a non-fact. The controlling property frozen for G2 is
whether the route from the bench to the facility is clear.

The record is the sole admissible authority on G2 and is scored under HS8 and Q9. An
adjudicator reading its stated premise is primed to accept a rationale the truth contract
forbids. The fix is to restate `whyFrozen` on the real basis: 1910.151(c) requires the
facility to be provided within the work area for immediate emergency use, and the established
fact is a half-obstructed route to a facility that is proven to work.

### 3. GOV-OSHA-1926-1153C1 — the frozen applicability statement names a task not in the cohort

The quotation is character-identical and the obligation is genuinely applicable. But
`whyFrozen` states the decision is whether "dry shotcrete application" may continue on the
controls in use. No shotcrete case exists in the frozen 24-case cohort. The only case carrying
this record is C1, which is mortar removal from a heritage brick façade with a handheld
grinder. The string "shotcrete" occurs exactly once in the instrument and once in the truth
contract, in this field alone.

Applicability itself is sound and was verified against the official Table 1, which lists
"Handheld grinders for mortar removal (i.e., tuckpointing)". Only the stated basis is wrong.

## One difference recorded rather than normalized

GOV-OSHA-1910-212A1 quotes 29 CFR 1910.212(a)(1) exactly as far as it goes and stops before
the trailing official sentence "Examples of guarding methods are—barrier guards, two-hand
tripping devices, electronic safety devices, etc." That sentence is a non-exhaustive
illustration. It neither narrows nor broadens the duty imposed by the quoted sentence, so the
obligation as supplied is the obligation as enacted. Recorded here explicitly rather than
normalized away, and it does not on its own require correction.

## Collateral integrity checks, read-only

* All 11 files in the frozen §240 manifest match their recorded digests. 0 mismatches.
* All 29 protected modules are byte-identical to their frozen digests. 0 mismatches.
* Every per-case copy of a governed record is field-identical to the instrument-level record,
  including the two defective `whyFrozen` fields, which are defective in both copies.

The §240 freeze builder was not re-run, because running it rewrites the frozen package. The
successor candidate digest is defined over live test-suite results and is therefore recomputed
only by that builder, so the pre-spend candidate identity re-check was **NOT REACHED**;
execution never became authorized. The protected composite inputs were verified read-only.

## Frozen execution-stage fields

Not reached. No case was executed, so every execution-stage field of the §241 final report
template is NOT_REACHED rather than measured: cases executed 0 / 24, provider calls 0,
retries 0, actual spend USD 0.0000 against the USD 3.60 ceiling, database operations 0,
judgment slots completed 0 / 131, and no gate, quality, posture or decision figure exists.

Candidate changed: NO. Prompt changed: NO. Schema changed: NO. Protected modules changed: NO.
Commit/push/tag/deploy: NONE. Authoring-independence limitation: PRESERVED. External-validation
claim: NOT MADE.

## Stop

Execution is not authorized. Three governed truth fields must change, one of them requiring a
product-owner decision about the M4 jurisdictional setting that this section is forbidden to
make. The instrument must be corrected and re-frozen, and the new digest returned for
product-owner authorization, before any provider call.
