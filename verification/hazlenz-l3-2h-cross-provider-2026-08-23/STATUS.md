# L3-2h — CROSS-PROVIDER STRUCTURAL-STATE DISCRIMINATION

> ## `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. **Zero production or script files were modified by this phase.**
Nothing committed, pushed, merged, rebased or deployed. **No stash operation of any kind was
executed.**

The phase's central experiment could not be run. What *could* be done was done, and it produced two
results worth having: the L3-2g baseline is confirmed reproducible in every particular, and a
previously unrecognised confound in the L3-2g harness was found and quantified.

---

## 1. Why the phase is blocked

The contract required one independently hosted model credential, available through the existing
approved local environment or configuration mechanism. **None exists.** Checked by presence and
length class only — no credential value was read, printed, logged, hashed or persisted:

| mechanism | result |
|---|---|
| `ANTHROPIC_API_KEY` | unset |
| `OPENAI_API_KEY` | present, **length 11** — the placeholder §31.1 already documented |
| `GOOGLE_API_KEY` · `GEMINI_API_KEY` · `MISTRAL_API_KEY` · `COHERE_API_KEY` · `AZURE_OPENAI_API_KEY` | unset |
| `VERCEL_AI_GATEWAY_KEY` · `AI_GATEWAY_API_KEY` | unset |
| all eight repository `.env` files | **zero** hosted-provider key names |
| `~/.anthropic`, `~/.aws` profiles | absent |
| Claude Code `settings.json` `env` block | declares no variables |
| `reasoning-l3` provider code | declares only `L3_OLLAMA_*` |

**§31.1's finding is unchanged after two further phases.**

### No substitute comparator exists either

`ollama /api/tags` lists exactly **one** model: `qwen3-coder:30b`, digest `06c1097efce0…`, matching
the pin. There is no second local model, so the question of whether a local substitute would be a
legitimate provider-independence test is moot — and the contract forbids treating one as such unless
the blueprint establishes it, which it does not.

---

## 2. Baseline reproduction — CONFIRMED IN EVERY PARTICULAR

The locked L3-2g experiment was run **unchanged** (`ablate-l32g-state-separation.ts`, sha256
`73f74131…`, byte-identical before and after). Three structural variants × 24 diagnostic scenarios
= **72 calls**, plus a 24-call control described below.

> **Why 72 and not the contract's 48.** The 48-call figure in L3-2g's recommendation was for the
> *second-provider* run (2 structural variants × 24). Baseline reproduction needs a third variant —
> `V_S_STRUCT_REPEAT` — because the contract requires the **noise-floor control** to be verified, and
> that control is by definition a second run of a byte-identical prompt. 3 × 24 = 72.

Every metric matches the recorded L3-2g value exactly:

| metric | L3-2g recorded | L3-2h reproduced | |
|---|---|---|---|
| `V_S_STRUCT` + `R1_MISSING_FIRST` — HC | 12/12 | **12/12** | ✓ |
| — false ACTIVE | 0/7 | **0/7** | ✓ |
| — clarification precision | 100% | **100%** | ✓ |
| — clarification recall | 75% | **75%** | ✓ |
| `V_S_STRUCT_MOVE1` + R1 — HC · falseACT · precision · recall | 12/12 · 2/7 · 100% · 75% | **identical** | ✓ |
| order sensitivity, one block moved | 3/24 | **3/24** | ✓ |
| fact incoherence `V_S_STRUCT` / `MOVE1` | 7.1% / 12% | **7.1% / 12%** | ✓ |
| control-reading correctness | 5/6 · 6/6 | **5/6 · 6/6** | ✓ |
| `F-WC-09` structural recovery | ACTIVE via `DEFEATED` | **ACTIVE via `DEFEATED`** | ✓ |
| negative controls · corrected states | held | **held** | ✓ |

**Cross-session reproducibility of the decisive variants is perfect:** comparing L3-2g's recorded
outputs against this phase's, `V_S_STRUCT` differs on **0 of 24** and `V_S_STRUCT_MOVE1` on **0 of
24** — different day, different process, different session.

---

## 3. NEW FINDING — a same-process duplicate-prompt confound `NEW_EVIDENCE`

> ### `AN IDENTICAL PROMPT REPEATED INSIDE ONE PROCESS IS NOT A NOISE-FLOOR CONTROL`

The reproduction initially appeared to **contradict** §37: the noise-floor control came back at
**3/24** rather than the recorded 0/24, which would have put L3-2g's headline order-sensitivity
signal (3/24) *at* the noise floor and invalidated its central claim.

It does not. The 3/24 is an artifact of how this phase invoked the harness, and the difference is
isolated:

| comparison | differing |
|---|---|
| `V_S_STRUCT` vs `V_S_STRUCT_REPEAT`, **same process** (2nd issue of an identical prompt) | **3 / 24** |
| `V_S_STRUCT` vs `V_S_STRUCT_REPEAT`, **separate processes** | **0 / 24** |
| `V_S_STRUCT`(L3-2g) vs `V_S_STRUCT_REPEAT`(isolated) | **0 / 24** |
| `V_S_STRUCT_REPEAT`(L3-2g) vs `V_S_STRUCT_REPEAT`(isolated) | **0 / 24** |

L3-2g ran `V_S_STRUCT` and `V_S_STRUCT_REPEAT` in **two separate process invocations** (run-1 and
run-2), so its 0/24 was a genuine cross-process measurement. L3-2h ran all three variants in **one**
invocation, so the identical prompt was issued twice against a warm server within the same session.

**The cause is server-side state, not sampling** — temperature, seed, digest and prompt bytes were
all identical, and an isolated re-run of the very same variant reproduces the original result
exactly. This is consistent with KV-cache or slot reuse in the Ollama server.

### Consequences

1. **§37's noise floor of 0/24 STANDS**, and is now confirmed by an independent third measurement
   rather than resting on the single L3-2g observation.
2. **§37's order-sensitivity finding of 3/24 STANDS.** Both variants it rests on reproduce at 0/24
   across sessions.
3. **A real hazard is now documented for the next phase.** Any harness that issues a duplicate
   prompt inside one process manufactures ~12% false variance. The noise-floor control must be run in
   its own process — and a cross-provider comparison that got this wrong would attribute a harness
   artifact to the provider.

### A second observation, and it points the same way as §37

The three scenarios that diverge under the same-process confound — `C-CS-05`, `F-CL-03`, `F-NC-01` —
are drawn from the **same clarification/uncertainty cohort** that carries all of §37's order
sensitivity (`F-CL-01`, `F-CL-03`, `C-CS-05`). Two mechanically unrelated perturbations — prompt
block order, and server-side cache state — destabilise the **same small set of scenarios**, while the
high-consequence cohort is unmoved by either.

That is independent corroboration of §37's reading: these cases sit near a decision boundary *for
this model*, which is a provider-capability signature rather than a representation one. **It remains
n = 1** and does not license closing on terminal A.

---

## 4. What this phase did NOT do

* **No second provider was run** — no credential.
* **No fresh acceptance corpus was touched.** `safescope-gauntlet.source.v1.json`,
  `safescope-gauntlet.seed.json` and `safescope-field-realism-pack-v2.v1.json` are hash-verified
  unchanged and appear in **zero** run artifacts. Neither provider saw their text.
* **No prompt remediation, no tuning, no diagnostic-case edits.** The locked experiment is
  byte-identical before and after.
* **No provider adapter was written.** It would have been unexercisable without a credential, and
  shipping untested provider code to be trusted later is the wrong trade.
* **Binder remediation was not reopened.** `BINDER_RESIDUAL` stays CLOSED; no new binder defect was
  demonstrated.

---

## 5. Regression — unchanged from L3-2g

| suite | result |
|---|---|
| l31 · l32 · l32b · l32c · l32d · l32e · l32f · l32g | 48 · 189 · 105 · 86 · 71 · 82 · 77 · 57 — **715 assertions, 0 failed** |
| `test:hazlenz-core` | **206 pass / 2 fail** — the two §13.1 failures only, no third |
| kg4a-cutover-contract · kg4a-default-off · kg4b-shadow · kg3f-predicate · kg3f-determinism | 146 · 51 · 123 · 16 · 170, all 0 failed |
| evidence-foundation | 35 assertions, passed |

The two `hazlenz-core` failures are the documented §13.1 pair and are **not** reclassified.

## 6. Customer authority · preservation · security

Zero production files changed, so authority is preserved by construction and verified structurally:
seam, call site and `backend/src/standards/` byte-unmodified vs HEAD; **0** importers of
`reasoning-l3` outside itself; **0** importers of `state-facts` outside it; SHADOW and CUTOVER
untouched. All six frozen holdouts, `development-l32f.json`, the blueprint and current-state
re-verified at their recorded hashes. Stash list identical (4 entries) — **no stash command was run**.
HEAD, branch, upstream and all 23 tags unchanged. Worktree outside this phase's own directory
identical to the entry snapshot.

**Egress:** the only destination contacted was `http://127.0.0.1:11434`. **96 local inference calls**
(72 + 24), **0 hosted-provider calls**, no credential material read or emitted, no production data
sent anywhere.

## 7. Decision class

**None of A / B / C / D applies** — each presupposes a second-provider measurement that could not be
taken. The contract's own gate governs:

> `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`

Production provider selection remains **OPEN**. L3-3 remains **ineligible**. §37's terminal
`L3_2G_PARTIAL — STRUCTURAL_STATE_DECISION_INCONCLUSIVE` stands unrevised, and is now resting on a
baseline that has been independently reproduced.
