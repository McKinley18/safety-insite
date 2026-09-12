# §242 — Regulatory Truth Corrections and Re-Freeze

Produced 2026-09-12. Provider calls: 0. Database operations: 0.

## Result

All three authorized corrections are applied and verified. The re-freeze is blocked by one
consequence of correction 1 that the directive reserved to the product owner.

    TERMINAL: EXPERT_HAZLENZ_FINAL_FRESH_ACCEPTANCE_REFREEZE_BLOCKED —
              PRODUCT_OWNER_REVIEW_REQUIRED

No new instrument digest was issued. `SECTION-242-FROZEN-PROTOCOL.json` is deliberately absent,
because §242 authorizes a freeze only once regulatory verification reaches 7 / 7, and it reaches
6 / 7. The §240 package and the §241 package are unchanged.

## Why the freeze is blocked

Correction 1 makes M4 explicitly a surface metal/nonmetal mineral concentrator. Official scope
text decides what follows. 30 CFR 56.1 scopes part 56 to each surface metal or nonmetal mine.
30 CFR 57.1 scopes part 57 to each underground metal or nonmetal mine including related surface
operations. So part 56 governs M4, which is exactly why the on-point record moves to 30 CFR
56.14105.

The same fact disqualifies the companion off-point record. 30 CFR 57.15005 is a part 57
standard, and part 57 does not govern a surface operation. It cannot be verified under §241
criterion 5, which requires the supplied text to be the current applicable obligation for the
case, and its frozen status as a genuinely off-point record cannot be confirmed under criterion
7. While it stands, 7 / 7 is unreachable.

The fix is mechanical and exact. The official text of 30 CFR 56.15005 is character-identical to
the frozen quotation, so substituting the part 56 counterpart preserves the off-point design,
the title, the provider-visible text and the HS9 trap untouched. It is as mechanical as the
authorized 57.14105 change. It is not applied here, because §242 forbids choosing a new
off-point record without explicit authorization and instructs this section to stop and report
first.

### What is not claimed

The model-facing exercise is not damaged. The first pass renders governed records under opaque
handles with citation tokens redacted, so the provider never sees a part number in the record
text, and the transmitted jurisdiction field is unchanged. The off-point trap still functions
from the provider side. The defect is in the instrument's own governed truth.

The §240 preflight would not have caught this. Check P11, as coded, is structural: it tests that
allowed authority equals the on-point identifiers, that the two authority flags agree, and that
the text and rationale are not thin. It does not test jurisdictional applicability, and it still
passes on the corrected artifacts.

A model naming the supplied off-point identifier would not wrongly fire HS8. The model can only
copy supplied identifiers and cannot write a citation at all, so that false-positive route does
not exist.

## The three corrections

**Correction 1, M4.** Jurisdiction is now explicit as a surface metal/nonmetal mineral
concentrator. The governing citation moves from 30 CFR 57.14105 to 30 CFR 56.14105, the frozen
quotation is preserved verbatim because the official part 56 text is character-identical to it,
and the allowed-authority set and the one slot question that named the old identifier are
updated mechanically. Observation, hazard, controlling property, posture, prohibited proxies,
human action, settlement expectation and scoring logic are untouched.

The jurisdiction fact is recorded in the truth contract, in the case setting and three new
explicit fields, and not in the transmitted jurisdiction field. Two reasons. All 24 cases
transmit the value "US", so writing a part designation into M4 alone would be a payload
difference rather than a truth correction. And the first-pass prompt deliberately strips
citation-shaped tokens, because a model that echoes one is condemned by the citation pattern.
Putting a CFR part reference into the inspection context would reintroduce the forbidden token
class that the design removed. The provider payload is therefore byte-unchanged for all 24
cases.

**Correction 2, G2.** The applicability rationale for 29 CFR 1910.151(c) no longer says the
decision turns on the drenching facility being unproven. It now rests on what the case
establishes: the shower and eyewash were tested that morning and both flowed, and the route to
them is half obstructed, against a regulation that requires the facility to be provided within
the work area for immediate emergency use. The quotation is unchanged. No new uncertainty about
operability was created. No posture or controlling-property change was required, because neither
was derived from the incorrect statement, so none was made.

**Correction 3, C1.** The task description for 29 CFR 1926.1153(c)(1) changes from dry shotcrete
application to removing mortar joints with a handheld grinder, the wording the frozen case
already uses. Table 1 authority was re-verified against the official table, which lists handheld
grinders for mortar removal. Observation, hazard, silica reasoning, posture, authority boundary
and thresholds are untouched.

**29 CFR 1910.212(a)(1).** No correction, as directed. The §241 finding is carried: the frozen
quotation is exact, the official text continues with a non-exhaustive illustrative sentence, and
that omission does not alter the duty. The sentence was not appended.

## Change audit

Fourteen semantic field changes, all inside the three authorized corrections. Zero unauthorized
semantic differences.

| Bucket | Changes |
|---|---|
| Correction 1, citation and allowed authority | 5 |
| Correction 1, explicit jurisdiction | 4 |
| Correction 1, mechanical slot reference | 1 |
| Correction 2, G2 applicability | 2 |
| Correction 3, C1 applicability | 2 |

Nine §240 artifacts have zero changes, including the candidate identity record, the protected
identities record, the coverage map and both earlier check records.

## Integrity

Thirty re-run checks passed out of thirty. Capability axes 26 / 26, each exercised by at least
two cases. Hard gates 17, each with a case and a slot. Quality measures 13, each with a case and
a slot. Judgment slots 131, with the same 102 product-owner and 29 deterministic split and
identical slot wiring. Posture distribution unchanged at 5 continue, 7 continue with controls, 6
hold pending verification, 6 stop. Declaration counts, owed properties, thresholds, gates,
decision rule, containment model, call plan, K6 treatment, authoring-independence limitation and
exact-property treatment are all byte-identical.

The scoped typecheck was re-run and reports exactly the two disclosed frozen-module annotation
errors, with no third error and none missing.

Candidate identity was verified by the non-mutating path only. The successor candidate digest is
recomputed solely by the §240 freeze builder, which writes into the frozen §240 directory, so it
was not run. Instead all 29 protected modules were byte-compared against their frozen digests
and all 29 match, and the 11-file §240 manifest was re-verified intact. No TypeScript file was
edited by this section, so the candidate digest inputs are untouched by construction.

## Final report

    Authorized semantic corrections:            3 / 3
    Unauthorized semantic differences:          0
    M4 jurisdiction:                            SURFACE METAL/NONMETAL
    M4 governing citation:                      30 CFR 56.14105
    G2 applicability corrected:                 YES
    C1 applicability corrected:                 YES
    1910.212(a)(1):                             UNCHANGED — VERIFIED WITH NON-MATERIAL
                                                TRAILING OMISSION
    Regulatory verification:                    6 / 7  (7 / 7 REQUIRED, NOT ACHIEVED)
    Pre-freeze checks:                          30 / 30 re-run
    Capability coverage:                        26 / 26
    Hard gates:                                 17
    Quality measures:                           13
    Judgment slots:                             131
    Posture distribution changed:               NO
    Protected composite:                        PASS
    Candidate changed:                          NO
    Prompt changed:                             NO
    Schema changed:                             NO
    Protected modules changed:                  NO
    Provider calls:                             0
    Database operations:                        0
    Commit/push/tag/deploy:                     NONE
    Old §240 instrument digest:                 cccf242b8910a1225e37bf6075b5ee706acd49b8d7ab9f2a
                                                56e225ea8f8f67a2
    New instrument digest:                      NOT ISSUED — freeze blocked

## Stop

One decision remains. Authorize the off-point substitution to 30 CFR 56.15005, which changes no
quoted text and preserves the frozen off-point design, or direct a different resolution. The
freeze can then be issued with no further semantic work.
