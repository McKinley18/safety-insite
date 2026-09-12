# §187A — REQUIRED-row structured owed-fact verifier validation: FINAL REPORT

**Terminal: `EXPERT_HAZLENZ_REQUIRED_STRUCTURED_VALIDATION_INCONCLUSIVE — EVIDENCE_OR_EXECUTION_REVIEW_REQUIRED`**

**Zero of fifteen verifier executions produced provider output.** No question from A to I was
exercised. Nothing about verifier behaviour is established by this run.

---

## What stopped it

Every one of the fifteen verifier calls was rejected at the request level:

```
HTTP 400  invalid_request_error
"Your credit balance is too low to access the Anthropic API.
 Please go to Plans & Billing to upgrade or purchase credits."
```

Zero tokens were consumed. The rejection occurred **before any model inference**, so this is a
transport/billing condition and **not** a model behavioural result, **not** a contract failure, and
**not** normalization rejection. The hard gate `provider errors = 0` is therefore NOT MET on a
technicality that says nothing about the system under test, and it must not be reported as a
behavioural failure.

The five first-pass calls immediately beforehand all succeeded, so the balance was exhausted during
this run.

**No retry was attempted.** Retrying the fifteen would take the total to 35 calls against this
authorization's 24-call hard cap. The authorization's rule in that situation is STOP.

## Spend

**Actual money spent: $0.26255** — the five first-pass calls. The fifteen failed verifier calls cost
nothing.

`RUN-SUMMARY.json` reports `TOTAL_ACTUAL_COST_USD = 1.22255`. **That figure is not money spent.** The
harness charges the frozen worst case against a failed call so that a failing run can never silently
exceed its budget; with fifteen failures that conservative accounting accumulated $0.96 of imaginary
spend. The run-evidence file was left unedited and the correction is recorded in
`COST-CORRECTION.json`. Caps were respected either way: 20 of 24 calls, $0.26 of $2.00.

## What the run did establish

Five real first-pass Expert executions on the five REQUIRED rows, provider-generated through the
actual path, all `providerOk` and all normalized **VALID**, raw persisted before any derivation.

| row | candidates | clarifications | the question asked |
|---|---|---|---|
| HR-01 | 0 | 1 | flame-failure device flame-tested during Monday's service, though not recorded on the certificate? |
| **HR-04** | 0 | **0** | **none** |
| HR-06 | 0 | 1 | rotor guard interlock functionally tested — not just visually confirmed in place — after the tooth change? |
| HR-08 | 0 | 1 | auger drive's own local isolator locked out separately from the main dryer panel? |
| HR-09 | 0 | 1 | accumulator pressure confirmed at zero by reading the gauge, rather than merely cycling the dump valve? |

`FIRST_PASS_STIMULUS_CONFOUND = MINOR`, classified and written **before** any verifier spend. HR-04's
verifier task would have been "raise what was missed" while the other four would have been "verify
what was asked" — a real asymmetry, judged minor because it is a genuine product of the real path,
the owed-fact treatment was uniform, and HR-04 carries its own gate.

Recorded alongside it, before results existed: the four non-HR-04 questions each already name the
owed property fairly precisely, so preservation on those rows would have been **easier** than
against a weak stimulus, and a high score there would have been weaker evidence about the verifier
than it appears.

### HR-04's first pass asked nothing

§179 recorded HR-04 emitting zero clarifications on all three of its first-pass replicates. This
fresh single sample is consistent with that.

**Observed result only.** One execution, not a replicated design; no causal claim; and §179 is
historical first-pass evidence, not a contemporaneous control for anything here.

## What was verified before spend, and held

- Prompt identity: `hazlenz.expert.prompt.v15`, system sha `20979d90…`, file sha `bfe564c2…`.
- §184 truth artifacts byte-identical at their recorded hashes.
- Supplied payloads derived through the existing §184/§185 fixture and projection path, **not
  hand-edited**, and asserted before spend to contain none of the twelve forbidden evaluation-only
  fields, no `evaluationRationale`, and `whyUnresolved`/`evidenceSpan` byte-identical to §184 truth.
- Exactly **one** owed fact per execution; the same frozen stimulus across a row's three replicates.
- `acceptableEvidence` is null under the existing derivation and `V3SuppliedOwedFact` carries no
  field for it, so it was **not transmitted**. Recorded rather than silently dropped; null is not a
  behavioural failure.

## Preserved unchanged

`BOUND_FACT_NOT_UNRESOLVED`; no settled fact exposed; no `ALREADY_SETTLED`, declaration mode, status,
property ontology or `requiredProperty` added. `CURRENT_REGRESSION_FAILURE = FALSE`,
`HISTORICAL_PIN_NO_LONGER_MATCHES_CURRENT_SOURCE = TRUE`,
`EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE`. Direct terminal-construction
residual and the projection-firewall declarative gap both remain OPEN and out of scope. §179 is
preserved as `HISTORICAL_FIRST_PASS_SILENCE_EVIDENCE` and is not combined with anything here. The
five SILENCE rows were not rerun.

No product or runtime source was modified; the only code added is the new verification harness
`backend/scripts/probe-required-structured-verifier-2026-09-05.ts`. Nothing committed, pushed,
tagged or deployed. Zero database operations.

## To resume

Two things are needed, and the second is not mine to grant:

1. **Credit on the Anthropic account.**
2. **A fresh authorization**, because the fifteen outstanding verifier executions would take this
   authorization's total to 35 calls against its 24-call hard cap.

The preregistration, the frozen execution order, the supplied payloads and the five persisted
first-pass stimuli are all reusable exactly as they stand — a resumed run would spend fifteen
verifier calls and nothing more, and would use the same frozen stimuli rather than regenerating
them.
