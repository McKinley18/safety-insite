# §242A — M4 Off-Point Substitution and Final Re-Freeze

Produced 2026-09-12. Provider calls: 0. Database operations: 0.

## Result

The substitution is applied, regulatory verification reached 7 / 7, every pre-freeze check passed,
and the corrected instrument is frozen under a new digest.

    TERMINAL: EXPERT_HAZLENZ_SUCCESSOR_FINAL_FRESH_ACCEPTANCE_INSTRUMENT_REFROZEN —
              PRODUCT_OWNER_EXECUTION_REAUTHORIZATION_REQUIRED

    New frozen instrument digest  cb36885a07fa5b14bbf257dbe69663f1829dbc9f6f4aef13a1460d05e2ec151c

Nothing was executed. §240, §241 and §242 were re-verified against their manifests after this
package was written and all three are intact. No commit, push, tag or deploy.

## The substitution

The M4 companion off-point record moves from 30 CFR 57.15005 to 30 CFR 56.15005. It touched four
fields: the identifier and citation in the instrument record, and the same two in the M4 case
record. The off-point record appears in no allowed-authority list and in no judgment slot, so
there was nothing else to update. No part 57 citation or identifier survives anywhere in the
instrument.

The quoted text is unchanged, because official 30 CFR 56.15005 is character-identical to the
quotation frozen at §240 for the part 57 counterpart.

Both M4 records now sit inside the governing regime. 30 CFR 56.1 scopes part 56 to each surface
metal or nonmetal mine, and M4 is explicitly a surface metal/nonmetal concentrator.

## The trap is the intended one

The off-point record remains genuinely irrelevant to the proposition the authority gates test.
30 CFR 56.15005 addresses fall protection and lifeline attendance on entry to bins, tanks or
other dangerous areas. The M4 question is whether the mill is isolated from every source of
motion and blocked against rotation before entry. The section is silent on both, and a second
person tending a line does not stop the shell turning. It stays tempting because it names entry
into a dangerous area, which is the whole point.

So the discrimination under test is on-point authority against off-point authority inside the
applicable regime. It is not applicable part against inapplicable jurisdiction, which is what it
would have become had the part 57 record stayed.

## Provider-visible payload

Exactly one line of the M4 payload differs, and it is the opaque identifier.

    before:   - sourceId: GOV-MSHA-57-15005
    after :   - sourceId: GOV-MSHA-56-15005

Rendered line count is 10 before and after, and the rendered block is 1106 bytes in both cases.
I verified this with the real code rather than a reimplementation: a temporary read-only script
imported the actual render function, the identifier shape constant, the redaction function and
the citation pattern, rendered both variants and diffed them. The script was deleted immediately
and no module was modified.

The quoted text and the record title survive redaction unchanged, because neither contains a
citation token, so the opaque-handle section of the base prompt is byte-identical. The new
identifier is a legal identifier shape and is not citation-shaped, so a model copying it is not
condemned by the citation pattern. The transmitted jurisdiction field remains "US" for all 24
cases and no part hint was injected anywhere.

## Change audit, §240 through §242A

Eighteen semantic field changes. Zero unauthorized.

| Family | Changes |
|---|---|
| M4 on-point citation and allowed authority | 5 |
| M4 off-point substitution | 4 |
| M4 explicit jurisdiction | 4 |
| G2 applicability | 2 |
| C1 applicability | 2 |
| Mechanical slot reference | 1 |

29 CFR 1910.212(a)(1) carries no correction in any section. Its illustrative trailing sentence was
never appended. The successor artifacts also carry their own artifact names and version string;
those are provenance labels and are listed separately rather than counted as semantic changes.

## Pre-freeze verification

Forty-six checks, all passed.

| Requirement | Result |
|---|---|
| Regulatory verification | 7 / 7 |
| Capability axes, each in two or more cases | 26 / 26 |
| Hard gates, each with a case and a slot | 17 |
| Quality measures, each with a case and a slot | 13 |
| Judgment slots, split 102 product-owner and 29 deterministic | 131 |
| Protected modules byte-identical | 29 / 29 |
| Scoped TypeScript errors | exactly 2, no third |

Posture distribution is unchanged at 5 continue, 7 continue with controls, 6 hold pending
verification, 6 stop. Declaration counts, owed properties, thresholds, gates, decision rule, call
plan, containment model, K6 treatment, exact-property treatment and the authoring-independence
limitation are byte-identical to §240. Coverage regenerated from the corrected cases equals the
§240 coverage.

## Identity method

The candidate is byte-identical to the one §240 named, and no TypeScript file was edited by §242
or §242A, so the candidate digest inputs are unchanged by construction. The candidate digest
itself was not recomputed, because the only path that computes it writes into the frozen §240
directory. Instead all 29 protected modules were byte-compared against their frozen digests and
all 29 match.

The new instrument digest uses a method declared in the freeze protocol and reproducible from the
four frozen content files with no excluded fields. It is not the §240 formula, which hashes
TypeScript constants and cannot be run without overwriting frozen evidence. The two digest values
identify their own artifacts and are not comparable as numbers.

## Final report

    M4 on-point authority:                      30 CFR 56.14105
    M4 off-point authority:                     30 CFR 56.15005
    Off-point quotation preserved:              YES
    Off-point design preserved:                 YES
    Provider-visible payload materially changed: NO — one opaque identifier line only
    Regulatory verification:                    7 / 7
    Authorized correction families:             3
    Unauthorized semantic differences:          0
    Capability axes:                            26 / 26
    Hard gates:                                 17
    Quality measures:                           13
    Judgment slots:                             131
    Protected modules:                          29 / 29
    Scoped TypeScript errors:                   exactly 2
    Candidate changed:                          NO
    Prompt changed:                             NO
    Schema changed:                             NO
    Protected modules changed:                  NO
    Provider calls:                             0
    Database operations:                        0
    Commit/push/tag/deploy:                     NONE
    Old §240 instrument digest:                 cccf242b8910a1225e37bf6075b5ee706acd49b8d7ab9f2a
                                                56e225ea8f8f67a2
    New frozen instrument digest:               cb36885a07fa5b14bbf257dbe69663f1829dbc9f6f4aef13
                                                a1460d05e2ec151c

The new frozen package digest is recorded in EVIDENCE-PACKAGE-DIGEST-242A.json.

## Stop

The instrument is frozen and not executed. Execution requires explicit reauthorization against
the new frozen instrument digest.
