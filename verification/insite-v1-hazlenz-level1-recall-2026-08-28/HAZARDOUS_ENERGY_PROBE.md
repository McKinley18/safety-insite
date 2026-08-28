# Hazardous-energy / MCC probe family — Phase 6

Frozen at `backend/src/safescope-v2/tests/hazlenz-level1-recall-probe-corpus.ts`
(SHA-256 `808b4c6613624819d91c25282c4e29fd7e30157ccd7d50aa11aac3a6ed16cb56`).

Authored 2026-08-28 **before** any source change and before any engine output
for these rows was inspected. Every exposure case is paired with the safe state
that must not produce the same finding, because the point of the family is not
"does the engine find hazardous energy" but "can the engine tell hazardous
energy apart from a correctly isolated machine".

The family was recorded as evaluation evidence and was **not** tuned after
inspecting output. Two rows failed on the unmodified engine for precision
reasons (HE-07, HE-08); the engine was repaired at source and the rows were left
exactly as authored.

| id | intent | expectation | before | after |
|---|---|---|---|---|
| HE-01 | MCC bucket opened, disconnect closed, no lock, live terminals exposed | require `lockout_tagout` **and** `electrical` | emitted nothing — **FAIL** | `electrical`, `lockout_tagout` — PASS |
| HE-02 | same task after the disconnect was opened, a personal lock applied and absence of voltage verified | forbid both | nothing — PASS | nothing — PASS |
| HE-03 | 480 V panel door standing open, energized conductors exposed | require `electrical` | `electrical` — PASS | `electrical` — PASS |
| HE-04 | MCC doors closed and latched, no work being performed | forbid both | nothing — PASS | nothing — PASS |
| HE-05 | disconnect opened but absence of voltage never verified before work began | require `lockout_tagout` or `electrical` | emitted nothing — **FAIL** | `lockout_tagout` — PASS |
| HE-06 | conveyor drive locked out and tagged, zero energy verified, lockout log signed | forbid both | `machine_guarding` — PASS | `machine_guarding` — PASS |
| HE-07 | electrical safety training matrix and annual lockout procedure audit both current | forbid both | `electrical` + `lockout_tagout` — **FAIL** | nothing — PASS |
| HE-08 | a spare MCC bucket stored on a shelf in the electrical room | forbid both | `electrical` — **FAIL** | nothing — PASS |

HE-06's `machine_guarding` emission is correct — the row describes a guard
repair — and `machine_guarding` is not a forbidden family for that row.

## What the family establishes

* The engine now recognises hazardous-energy exposure from the three forms that
  matter in the field: **no lock applied** (HE-01), **verification omitted**
  (HE-05), and **exposed energized parts** (HE-01, HE-03).
* It distinguishes that exposure from three genuinely safe states: **verified
  isolation with a personal lock** (HE-02), **a closed enclosure with no work
  occurring** (HE-04), and **documented, logged, zero-energy-verified LOTO**
  (HE-06).
* It no longer manufactures an electrical or hazardous-energy finding from
  **administrative records** that merely name the family (HE-07) or from
  **equipment named as stored stock in a place** (HE-08).

## What it does not establish

Eight rows are a discrimination probe, not a coverage estimate. The family says
nothing about arc-flash boundary determination, qualified-person status, group
lockout, or shift-transfer lockout, and it uses one phrasing per concept. It is
sufficient to answer the Phase 6 question and no more.
