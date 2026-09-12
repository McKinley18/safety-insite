# §184 — RUNTIME FIXTURE DERIVATION (DESIGN ONLY, NOT EXECUTED)

How approved owed-fact truth would become an `OwedFact` the §182 architecture can hold. **No code was
written, no schema redesigned, no provider called.**

---

## The straightforward half: REQUIRED rows

The five REQUIRED rows map cleanly. Every field the runtime needs has a truthful source:

| `OwedFact` field | from the truth record |
|---|---|
| `factKey` | `factKey` |
| `affectedDecision` | `affectedDecision` |
| `evidenceSpan` | `evidenceSpan` (verbatim, checked) |
| `whyUnresolved` | `whyUnresolved` |
| `branchA` / `branchB` | derived from `factStatement` — the fact established, and not established |
| `decisionDivergence.ifA` / `.ifB` | `decisionIfEstablished` / `decisionIfNotEstablished` |
| `priority` | `priority` |
| `status` | `UNRESOLVED` |
| `acceptableEvidence` | `deriveAcceptableEvidence(governed record)` where one exists, else `null` |
| `source` | a development population source; `modelAuthored` follows from it |

Nothing is manufactured. `whyUnresolved` says what the observation does not state, which is what the
field means.

## The problem: SETTLED rows

`owedFactDefects()` requires `whyUnresolved` to be non-blank **regardless of `status`**
(`owed-fact-ledger.ts:56`). There is no branch on status. So a settled fact cannot enter a ledger
without a non-blank "why unresolved" sentence.

For HR-10 — where the fitter torque-checked all six fastenings this morning and recorded them tight —
any such sentence is false. And it would not merely sit in a file: `projectOwedFact` sends
`whyUnresolved` to the provider, so a fabricated sentence would **actively mislead the model on
exactly the rows that exist as settled controls**. That is worse than a type inconvenience; it would
corrupt the controls.

> **`SETTLED_FIXTURE_TYPE_MISMATCH = TRUE`**

Recorded per the authorization, which is explicit: *"Do NOT manufacture semantic language just to
satisfy a type."* No schema change is proposed here.

## Three handling options, for a later decision

**Option A — admit as `UNRESOLVED`, settle through the §182 review path.**
The fact enters the ledger unresolved and reaches `SETTLED_BY_EVIDENCE` only when a human review
approves a settlement claim. *For:* uses the §182 path exactly as built, needs no type change, and is
the most faithful simulation of production. *Against:* `whyUnresolved` must still say something, and
for HR-10 anything it says is false — so this option **does not actually escape the problem**, it
relocates it.

**Option B — allow `whyUnresolved: null` when `status !== 'UNRESOLVED'`.**
A one-line change to `owedFactDefects` and a nullable field. *For:* smallest honest fix; the field
becomes truthful by construction, since a settled fact has no reason to be unresolved. *Against:* it
is a change to an existing runtime contract, which needs its own authorization, and every consumer of
`whyUnresolved` would need checking.

**Option C — carry a separate `factStatement` and stop overloading `whyUnresolved`.**
The truth record already has a neutral `factStatement` that is true for settled and unresolved rows
alike. `whyUnresolved` would become optional commentary rather than the fact's identity. *For:* the
cleanest semantics, and it is what the truth instrument already does. *Against:* a new field on a
production type — larger than anything §182 or §184 was allowed to do, and it edges toward the
representation redesign §181 argued was **not** needed.

**Provisional recommendation: Option B**, as the narrowest change that makes the settled controls
expressible without a false projection. It is a runtime contract change and therefore explicitly not
taken here.

## What this blocks, precisely

Without a decision, a future §183 can run the **five REQUIRED rows** faithfully and **cannot express
the five SILENCE rows** without projecting a false sentence.

That matters because the SILENCE rows are the containment and settled-control half of §183 — the
HR-05 and HR-07 shapes. §183 already stopped partly because no authoritative settled owed facts
existed; §184 creates them as *truth*, and this is the remaining step to make them *runnable*.

## Derivation properties to preserve whenever it is built

- **Deterministic.** Same approved truth in, same fixture bytes out, hashable before any run.
- **No new provider field.** The projection stays the eight existing fields.
- **The firewall holds.** `evaluationRationale`, the expected disposition, the settled/unresolved
  label and the verdicts never enter a fixture that is projected. A future run should assert the
  projected payload contains none of them.
- **`acceptableEvidence` derived, never authored.** Where no governed record applies — the flame-failure
  pair — the value is `null`, and null is correct rather than a gap to fill.
