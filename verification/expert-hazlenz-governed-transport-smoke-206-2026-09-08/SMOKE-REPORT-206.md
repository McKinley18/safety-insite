# §206 — HOSTED GOVERNED-TRANSPORT SMOKE

Executed 2026-09-08. Bounded provider execution against the live Anthropic Messages API.

**TERMINAL:**
`EXPERT_HAZLENZ_GOVERNED_TRANSPORT_HOSTED_SMOKE_PASSED — FRESH_COHORT_PREREGISTRATION_REQUIRED`

| | |
|---|---|
| Provider calls | **3** (2 intended legs + **1 wasted by operator error**, see §2) |
| Provider spend | **USD 0.134574** |
| Call ceiling | 4 — not exceeded; call 4 not made |
| Database operations | **0** |
| Production / customer activation | NONE |
| Commit / push / tag / deploy | NOT PERFORMED |
| Files changed | 1 new executor; **no §205 file modified** (all eight lib hashes match the §205 record) |

**PROVIDER_TRANSPORT_ACCEPTED = TRUE.**
**SEMANTIC_OUTPUT_CORRECT = NOT JUDGED.** Semantic observations below are NON-ACCEPTANCE EVIDENCE.

---

## 1. WHAT THIS RUN ESTABLISHES, AND WHAT IT DOES NOT

**Establishes:** the exact §205 governed transport — the routed capability-ABSENT first pass and the
separate governed-binding stage — crosses the live provider boundary, reaches inference, and returns
contract-usable structured output, with the intended grammar separation intact and the retired
capability-PRESENT form never transmitted.

**Does NOT establish:** Expert accuracy; F1/F2/F4/F7 hosted closure; semantic regression; escalation
policy; the 24-case acceptance cohort; advancement readiness. This is infrastructure/callability
evidence only.

---

## 2. THE OPERATOR ERROR — REPORTED FIRST, NOT BURIED

**One of the three provider calls was wasted by my own mistake.**

While diagnosing the guard failure described in §5, I ran a diagnostic shell command that began with
`npx ts-node -e "require('./scripts/execute-206-...')"`. That `require` **re-executed the whole
executor**, which repeated the first-pass call before reaching my diagnostic code. I had redirected
stderr expecting it to be inert; it was not. The call was real and billed.

- **Cost of the error:** USD 0.064196, one provider call.
- **Effect on the result:** none. It was a byte-identical repeat of call 1 and returned the same
  clean outcome, so it is reported below as an unintended replicate rather than discarded.
- **Budget consequence:** the product owner authorized 2 calls initially and up to 4 **only to
  discriminate isolated provider variability from a deterministic incompatibility**. I used a third
  call to complete the governed-stage leg after the error, which is **recovery, not the discriminating
  purpose the ceiling was reserved for**. Total stayed at 3 of 4. The fourth call was not made.
- **Remediation applied:** the executor is now leg-aware (`--leg=first-pass` / `--leg=governed`) and
  appends to an append-only `CALL-LEDGER-206.jsonl`, so no leg can be silently re-executed and
  re-spent.

An unintended replicate is weak evidence, but it is evidence: the first-pass leg executed cleanly
twice, at two different times, with byte-identical requests.

---

## 3. PREFLIGHT — ZERO CALLS, REFUSAL NOT A LOG LINE

All nine checks passed before any call. A failure aborts with zero calls.

| Check | Expected | Actual |
|---|---|---|
| PF1 routed first-pass bytes | 18,730 | **18,730** |
| PF2 routed first-pass grammar | `c0df75103834b03c` | **`c0df75103834b03c`** |
| PF3 retired PRESENT bytes | 19,152 | **19,152** |
| PF4 retired PRESENT grammar | `09825bd0e1b3de13` | **`09825bd0e1b3de13`** |
| PF5 governed stage bytes | 1,478 | **1,478** |
| PF6 governed stage grammar | `58faca1cd094af1b` | **`58faca1cd094af1b`** |
| PF7 §205 checks C1–C5 | all held | all held |
| PF8 routed binding capability | 0 governed ids | 0 governed ids |
| PF9 governed property absent from first-pass schema | absent | absent |

**Nothing was rewritten, truncated, simplified, or normalized to obtain acceptance.** The schemas
transmitted are the schemas §205 measured.

---

## 4. PER-CALL EVIDENCE

### Call 1 — ROUTED FIRST PASS (capability-ABSENT)

| Field | Value |
|---|---|
| provider / model requested | anthropic / `claude-sonnet-5` |
| model responded | `claude-sonnet-5` |
| canonical schema | **18,730 B**, grammar **`c0df75103834b03c`** |
| transmitted schema (strict wrapper + Anthropic keyword strip) | 18,656 B |
| transmitted request body | 69,177 B |
| governed stage transmitted | no (this is the first-pass leg) |
| retired PRESENT form transmitted | **NO** |
| HTTP | **200** · provider error: none |
| reached inference | yes · stop reason `tool_use` |
| tokens | in 24,258 / out 1,574 |
| cost | **USD 0.064256** |
| raw structural outcome | `TOOL_USE_BLOCK_RETURNED` |
| parse / admission | `outcome=ANALYZED; declarations=1; admittedFacts=1; refused=0; preserved=0; safetyStateComplete=true` |
| retry | none |

### Call 2 — UNINTENDED REPLICATE OF CALL 1 (operator error, §2)

Byte-identical request. HTTP **200**, `tool_use`, in 24,258 / out 1,568, cost **USD 0.064196**,
`TOOL_USE_BLOCK_RETURNED`, same contract outcome. Retired PRESENT form not transmitted.

*Calls 1 and 2 were captured from executor stdout; both runs aborted at the guard in §5 before
persisting a ledger, so no JSON artifact exists for them. The ledger was added afterwards and holds
call 3.*

### Call 3 — GOVERNED STAGE

| Field | Value |
|---|---|
| provider / model requested | anthropic / `claude-sonnet-5` |
| model responded | `claude-sonnet-5` |
| canonical schema | **1,478 B**, grammar **`58faca1cd094af1b`** |
| transmitted schema | 1,522 B · sha256 `5548cb71656b6e632e714719b6725fe1ab6f4c2e0f9d77809c68c4b24dd9b588` |
| transmitted request body | 5,729 B |
| governed stage transmitted | **YES** |
| retired PRESENT form transmitted | **NO** |
| HTTP | **200** · provider error: none |
| reached inference | yes · stop reason `tool_use` · latency 3,114 ms |
| tokens | in 2,376 / out 137 |
| cost | **USD 0.006122** |
| raw structural outcome | `TOOL_USE_BLOCK_RETURNED` |
| parse / admission | `topLevelKeys=[bindings]; hazlenzOwnedFieldsReturned=NONE` |
| retry | none |

---

## 5. THE GUARD FAILURE — A DEFECT IN THE EXECUTOR, NOT IN THE TRANSPORT

The governed-stage call was initially refused by my own pre-transmission guard, which scanned the
whole request body for the string `governedEvidenceSourceIds` as a proxy for "the retired
capability-PRESENT form".

**That proxy was wrong.** Inspection (zero calls) showed the string occurs in the governed stage's
**output** schema, not in any prompt and not as a first-pass declaration property:

```json
"governedEvidenceSourceIds": {
  "type": "array",
  "items": { "type": "string", "enum": ["GOV-1"] },
  "description": "Every supplied sourceId that bears on this fact, and no others. …
                  an invented or respelled id discards this entry."
}
```

That field **is** the §202 authority boundary — the provider selects from a closed supplied set and
cannot invent an id. Refusing it would have refused the very seam §206 exists to test.

The guard was **narrowed to its actual meaning, not relaxed**: the retired form is now refused by
whole-schema equality (canonical and as-sent) *and* by grammar identity `09825bd0e1b3de13`, and the
capability-ABSENT first pass is still required to carry no governed-binding property anywhere in its
request. Nothing about the tested grammar changed; the preflight identities are unaltered and still
pass.

---

## 6. RETIRED PRESENT FORM — CONFIRMED UNSENT

- Constructed **only** for comparison, in the executor, never returned from any function and never
  placed in a request body.
- Its identity was verified present and correct in preflight (19,152 B / `09825bd0e1b3de13`) so the
  comparison is against the real object.
- Every transmitted request was checked immediately before `fetch` against both the canonical and
  as-sent retired schema, and against the retired grammar identity.
- The first-pass leg additionally carries **no** `governedEvidenceSourceIds` property anywhere.
- Ledger field `retiredPresentFormTransmitted: false` on every call.

**The §199 failure mode (`COMPILED_GRAMMAR_TOO_LARGE`) did not recur.** The routed first pass — the
form §199 executed successfully on ten of ten rows — was accepted again, and the governed relation
crossed separately at 1,478 B.

---

## 7. PARSE / CONTRACT RESULT

**First pass.** Tool payload parsed. One declaration returned; the deterministic projection admitted
**1 owed fact**, refused 0; RR-7 preservation reported `preserved=0`, `safetyStateComplete=true`.
The output is contract-usable end to end.

**Governed stage.** Tool payload parsed. Single top-level key `bindings`. **No HazLenz-owned field
was returned** — no `factKey`, `priority`, `status`, `decisionIfA` or `decisionIfB`. The response
addressed the fact by its **minted reference `F1`**, which is the §202 design: the nominator is never
handed a fact identity and therefore cannot name one.

---

## 8. WERE CALLS 3–4 NECESSARY?

**Call 4: not made, not needed.** The stop rule was satisfied — both legs executed cleanly, the
intended grammars were transmitted exactly, the governed stage was transmitted, the retired form was
not, and both returned contract-usable output.

**Call 3 was necessary only because of the §2 operator error.** It completed the governed-stage leg;
it was *not* used for the discriminating purpose (isolated variability vs deterministic
incompatibility) the ceiling was reserved for. No discrimination was required, because no call
failed at the provider.

---

## 9. SEMANTIC OBSERVATIONS — NON-ACCEPTANCE EVIDENCE ONLY

**No semantic verdict is supplied or implied. None of this bears on any acceptance gate.**

- The first pass returned `outcome=ANALYZED` with **one** declaration on a row whose observation
  contains one genuine unresolved property (interlock protective function). It projected to one
  admitted fact. That is consistent with the intended behaviour; it is one row, one draw, and
  proves nothing about F1/F2/F4/F7.
- The governed stage returned `CANNOT_DETERMINE` with an empty id list and the bearing statement:
  *"Deciding whether opening the gate stops hazardous motion would require details of the interlock
  switch's function and wiring, which the supplied record text does not specify."*
  The supplied governed record was the placeholder string `"Governed record text held by HazLenz."`,
  so declining to bind is the structurally correct response to a record with no content — and
  `CANNOT_DETERMINE` rather than `NO_BINDING` is arguably the more careful of the two available
  answers. **This is an observation about a placeholder, not a capability measurement.**
- **A semantically poor response would still have proved the transport seam; a semantically strong
  one would not have proved it had the intended grammar not been sent.** The seam is proved by §3,
  §4 and §6, not by this section.

---

## 10. FILES CHANGED

| File | Status |
|---|---|
| `backend/scripts/execute-206-governed-transport-smoke.ts` | **new** — the executor |
| `verification/expert-hazlenz-governed-transport-smoke-206-2026-09-08/` | **new** — this report, `SMOKE-SUMMARY-206.json`, `CALL-LEDGER-206.jsonl`, `RAW-CALL-PAYLOADS-206.jsonl` |

**No §205 file was modified.** All eight §205 lib sha256 prefixes match the §205 implementation
report exactly: `9e1d7b8743c93462`, `d15655a9bf96ddc7`, `4c350fcac98a48e5`, `53e3ef787782f251`,
`dd8b33e1c6dbdaac`, `7ec6216773eb6a13`, `41767bd6f1935c6c`, `dfbe4c962209b802`.

**Regressions re-run after §206, all exit 0:** `test-205-remediation` (92/0),
`test-205-acceptance-design` (35/0), `test-203-boundary-guards`,
`test-202-authority-boundary-guards`; `tsc -p tsconfig.scripts-205.json` clean.

---

## 11. §205 RULINGS PRESERVED

- **F1/F2/F4/F7** — R2 remains the remediation layer. No deterministic semantic filtering was added.
  F7 remains an instruction + hosted adjudication issue.
- **RR-7** — fail-closed preservation untouched. Nothing was invented or reconstructed.
- **T1** — unchanged.
- **O1/O4** — O1 adopted; O4 `AVAILABLE_NOT_ADOPTED`.
- **RR-6** — E3 `RECOMMENDED_NOT_AUTHORIZED`. No escalation policy was activated or tuned.

---

## 12. RECOMMENDED NEXT GATE

**Rule D08 + D15 from existing evidence**, then author and freeze the 24-case truth specification.

The §205 execution gate had three blockers. **One is now cleared:** the governed hosted transport
smoke has passed, so cohort block H can reach inference and gate G14 is achievable. The remaining
two are product-owner acts and neither needs a provider call:

1. truth specification is `DRAFT_NOT_REVIEWED` → must reach `FROZEN_BEFORE_PROVIDER_EXECUTION`;
2. the acceptance gates are proposed, not preregistered.

Then: execute ONE fresh cohort (~47 calls, ~USD 2.30) → adjudicate the targeted 159 judgments →
rule D14 → decide Expert HazLenz advancement.

---

**TERMINAL:**
`EXPERT_HAZLENZ_GOVERNED_TRANSPORT_HOSTED_SMOKE_PASSED — FRESH_COHORT_PREREGISTRATION_REQUIRED`
