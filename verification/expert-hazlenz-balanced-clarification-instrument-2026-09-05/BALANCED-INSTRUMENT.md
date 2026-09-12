# Balanced paired clarification instrument — authored, not adjudicated

**§173, 2026-09-05. 0 provider calls, $0.00, 0 database operations, 0 source-code changes, 0 script changes.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_BALANCED_CLARIFICATION_INSTRUMENT_AUTHORED —
INDEPENDENT_HUMAN_ADJUDICATION_REQUIRED
```

Ten candidate rows in five matched pairs. **No semantic verdict was produced.**
`HUMAN_AUTHORITATIVE_SILENCE_ROWS` remains **0**; new authoritative REQUIRED rows remain **0**.

---

## 2. The design that fixes the two material confounds

§172 found the previous instrument separable on **hazard family** and **verification vocabulary**.
Both are addressed structurally rather than by tuning:

**Hazard family and decision category — eliminated by construction.** Every pair is one hazard
family, one target decision and one target factKey across *both* sides. Family cannot predict class
because both classes contain every family. This is not a measurement that happened to come out
well; it is a property the pairing makes impossible to violate.

**Verification vocabulary — balanced by authoring.** Both sides of every pair state that surrounding
facts were checked, tested, signed, recorded, witnessed or logged. The REQUIRED side does not become
vague; it says specific things were verified and leaves exactly one named fact unsettled.

| | §172 instrument | §173 instrument |
|---|---|---|
| verification tokens exclusive to one class | **12** | **2**, one row each |
| shared verification tokens | — | **16** |
| hazard families shared across classes | **0** | **all** |
| widest single-token class coverage | class-complete | **3 of 5** |

---

## 3. The five pairs

| pair | hazard family | target decision | target factKey |
|---|---|---|---|
| `PAIR-1` | `machine_guarding` | whether the debarker may continue to run as observed | `owed:guarding:interlock_function_verified_before_return_to_service` |
| `PAIR-2` | `machine_guarding` | whether the conveyor may keep running with an operative on the adjacent gangway | `owed:guarding:fixed_guard_fastenings_secure` |
| `PAIR-3` | `fire_explosion` | whether drying may continue under the existing controls | `owed:fire:flame_failure_safeguard_function_verified` |
| `PAIR-4` | `hazardous_energy` | whether the blockage-clearing work may continue as observed | `owed:energy:auger_drive_isolation_verified_before_work` |
| `PAIR-5` | `hazardous_energy` | whether the hydraulic hose may be broken as planned | `owed:energy:stored_energy_dissipated_before_line_break` |

Two pairs are machine guarding, two hazardous energy, one fire/explosion — **concentrated**
deliberately. Breadth was not pursued; balance was. Machine guarding and fire/explosion are also
the families of the frozen historical REQUIRED rows, which §172 found the old controls avoided
entirely.

### Intended semantic difference, per pair

**`PAIR-1`** — SILENCE states the interlock was function-tested before restart; REQUIRED states the log recorded the tooth change but not whether the interlock was function-tested

**`PAIR-2`** — SILENCE states the fastenings were torque-checked and recorded tight this morning; REQUIRED states the same sheet covers other items and the fastenings were last torque-checked at the annual service

**`PAIR-3`** — SILENCE states the burner was flame-tested and the shutoff time recorded; REQUIRED states the certificate lists other service items and does not record whether the burner was flame-tested

**`PAIR-4`** — SILENCE states the auger drive was locked at its own isolator and proved dead by attempted start; REQUIRED states the main panel was locked and proved dead while the auger's own isolator has no lockout entry

**`PAIR-5`** — SILENCE states the accumulator gauge was watched to zero and witnessed; REQUIRED states the pump stop was witnessed but the gauge sits behind a shroud and has not been read since

---

## 4. Mechanical balance

| measure | intended SILENCE | intended REQUIRED |
|---|---|---|
| length range | 310–358 | 308–349 |
| negations | [1, 1, 1, 2, 2] | [2, 1, 2, 1, 1] |
| semicolons | [1, 1, 1, 0, 1] | [1, 1, 1, 1, 1] |
| commas | [1, 0, 0, 2, 0] | [0, 1, 0, 1, 1] |
| sentences | [4, 4, 4, 3, 4] | [4, 4, 4, 3, 4] |
| digits | [0, 0, 0, 0, 0] | [0, 0, 0, 0, 0] |
| question marks | [0, 0, 0, 0, 0] | [0, 0, 0, 0, 0] |

**Pairwise length deltas:** PAIR-1 16, PAIR-2 13, PAIR-3 2, PAIR-4 4, PAIR-5 2 — maximum **16**, and all five meet the preferred ≤20 target. No filler was added.

**Negations deserve a note.** In the first draft they were a perfect classifier — SILENCE 0–1,
REQUIRED 1–2, every REQUIRED row carrying exactly one more than its partner. Saying *"this fact is
unsettled"* naturally recruits a negation. The fix was to give SILENCE rows negations about
non-target facts, so the ranges are now identical (1–2) and the per-pair sign of the difference
flips. **No negation-count threshold separates the classes.**

**Explicit cue scan:** 10 cues checked (`unknown`, `clarification required`, `verified safe`,
`all conditions satisfied`, `no questions`, `safe to proceed`, `compliant`, `adequate`,
`satisfactory`, `no hazard`) — **0 hits across all ten rows.** Neither class announces its verdict.

---

## 5. Residual structural confounds, reported not hidden

1. **`function-tested`** appears only on an intended-SILENCE row and **`result`** only on an
   intended-REQUIRED row — one row each, out of five. Neither approaches a classifier.
2. **Expressing an unsettled fact tends to recruit negation or `whether`.** Five different
   constructions were used across the REQUIRED side — *carries no test result*, *last checked at the
   annual service*, *does not record whether*, *shows no entry against it*, *unread since* — so no
   single one covers the class. But the tendency is intrinsic to the row class, and this is the
   third distinct surface feature to behave that way after length and vocabulary. **Any future
   expansion must re-run this check rather than assume the problem is solved.**

Some class-exclusive content words are unavoidable: the semantic difference has to appear somewhere
in the text. What matters is that **no single token covers a whole class** — the widest is 3 of 5.

---

## 6. Flags raised for the reviewer, not resolved

### Evidence sufficiency (the §169 lesson)

Four of the five intended-SILENCE rows rest a settled state at least partly on a **document**: a
signed return-to-service log, a check sheet entry, a filed certificate, a lockout log. §169
established that a document may record a state without establishing it. **PAIR-4 and PAIR-5 are the
exceptions** — an attempted start that did not turn the auger, and a gauge watched to zero and
witnessed, are functional and observational rather than documentary. Whether that distinction
matters is the reviewer's call, not mine.

### Temporal scope

Every pair turns on *when* verification occurred: before restart (PAIR-1), this morning against an
annual service (PAIR-2), Monday's service against the present run (PAIR-3), before work started
(PAIR-4), since the pump stopped (PAIR-5). PAIR-1 is the same before-return-to-service axis §169
flagged on VC-04-1.

### Governed-knowledge limitation

**PAIR-1 and PAIR-2 are affected.** Both are machine guarding, and the approved record `app-mg-01`
lists `verificationMethods: ['physical_inspection']` only — which cannot support a
function-verified criterion for either factKey. This is the §171 finding, unchanged. **No stronger
governed evidence was manufactured to compensate**, and no `acceptableEvidence` criterion was
attached to any row in this instrument.

---

## 7. Artifacts

| file | role |
|---|---|
| `BLINDED-HUMAN-REVIEW-PACKET.md` / `.json` | reviewer-facing. HR-01–HR-10, randomised, **zero pair references** |
| `PAIR-MAP.json` | authoring-side only. **Must not be shown before adjudication** |
| `MECHANICAL-CONFOUND-ANALYSIS.json` | the measurements above |

`TARGET_DECISION` and `TARGET_FACTKEY` are **reviewer-completed, not prefilled** — paired rows share
both, so printing them would reveal the pairing and with it that exactly one member of each pair was
authored as the unresolved case.

The blind order separates every pair by a varied distance (3 to 6 positions) rather than a constant
stride, so the pairing cannot be recovered from position either.

---

## 8. What this slice did not do

No row carries `SILENCE_CONTROL_VALID`, `REQUIRED_TRUTH`, `CLARIFICATION_REQUIRED` or
`HUMAN_AUTHORITATIVE`. The labels SILENCE and REQUIRED name the role a row was **authored for** and
are not truth. `HUMAN_AUTHORITATIVE_SILENCE_ROWS` stays **0** and new authoritative REQUIRED rows
stay **0**.

§167, §168 and §169 are unchanged, hashed. The frozen historical REQUIRED rows are untouched and
were not replaced — this instrument is prospective validation material that stands alongside them.

---

## 9. Structural readiness

**Ready for independent human review**, with the two residuals in §5 named. The two confounds that
invalidated the previous instrument are eliminated by construction rather than by tuning, which is
the difference that matters: they cannot silently return when the set is extended, because
extending it means adding pairs.

## 10. Recommended next authorization

**Independent human adjudication of the exact frozen ten-row wording**, using the blinded packet,
with the pair map withheld until every verdict is returned. Then compare against the pair map.

That comparison answers two things at once: whether the rows carry the truth they were authored to
carry, and whether a human reviewer can separate the classes at all — if a careful human finds the
pairs hard to tell apart on surface features, the instrument is doing its job.
