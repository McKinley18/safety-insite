# L3-2j — evidence index

`L3_2J_COMPLETE — SHIPPED_CARRIER_ACTIVATION_MEASURED_AND_REFUSED — SHIPPED_PROMPT_BYTE-RESTORED`
Baseline HEAD `1feda622`, unchanged. Blueprint **§41**; decision log **`D-59`**, **`D-60`**, **`D-61`**.
**No sealed set opened. 0 hosted-provider calls. Nothing committed, pushed or stashed.**

## Read in this order

| file | what it settles |
|---|---|
| `STATUS.md` | the full result — what was declared, what it cost, why it was put back, the nine gates |
| `NEXT_ACTION.md` | what the next phase must and must not conclude from this one |
| `CREDENTIAL_AND_EGRESS.txt` | why item (4) was not executed, how absence was established without touching a value, and the egress count |
| `results/DENOMINATORS.json` | **`D-58`** — both clarification denominators for every variant, side by side |
| `results/` | the shipped-pipeline corpus runs, one variant per process |
| `rootcause/` | the locked L3-2h instrument re-derived against the activated prompt, and restored |
| `contracts/`, `preservation-pre.txt`, `PRESERVATION_POST.txt` | hashes before and after |

## The corpus runs — SHIPPED prompt, SHIPPED schema, SHIPPED binder, SHIPPED validator

| file | prompt | headline |
|---|---|---|
| `results/shipped-qwen-V_PRE_ACTIVATION.json` | `b8cc50fc` v6 | **the BEFORE.** HC **12/13**, false ACTIVE 0/11, clarification **5/5 on both denominators**, precision **100%**. Without it "no regression" would be an assertion (`D-54`) |
| `results/decl1/shipped-qwen-V_ACTIVATED.json` | `b7f35111` | declaration **revision 1**, the byte-identical L3-2i text. HC **9/13**. Candidate-borne clarifications 5 → **0**. `C-CS-05` and `H-AM-05` raised unnecessary questions |
| `results/decl1/…_REPEAT.json` | `b7f35111` | its noise floor, own process — **0** differing fields |
| `results/decl2/shipped-qwen-V_ACTIVATED.json` | `45862b26` | declaration **revision 2**, empty-list licence removed. HC **10/13**, and the proposal-level carrier was used **zero times** |
| `results/decl2/…_REPEAT.json` | `45862b26` | its noise floor, own process — **0** differing fields |
| `results/halves/…V_SCHEMA_ONLY.json` | `b8cc50fc` v6 | **the attribution control.** Schema half alone: HC 12/13, but `C-CS-05` still regressed — and the model filled the field on six rows with the prompt silent, because the schema is itself an input |
| `results/halves/…_REPEAT.json` | `b8cc50fc` v6 | its noise floor, own process — **0** differing fields |
| `results/reproduction/harness-side-V_ACTIVATED_REV2.json` | `45862b26` | the declaration rebuilt harness-side reproduces the in-prompt run **exactly** — 0 differing fields — once schema key order was restored (**`D-60`**) |
| `results/reproduction/post-revert-V_PRE_ACTIVATION.json` | `b8cc50fc` v6 | the baseline re-run **after** the revert reproduces the baseline run taken **before** the declaration existed — **0 differing fields / 168** |

Every artifact records its own `pid`, the prompt sha256 it actually sent, the locked-harness sha256,
and (from the schema-order finding onward) the serialised `schemaSha256`.

## The locked instrument — byte-unchanged, inputs re-derived

| file | headline |
|---|---|
| `rootcause/locked-under-activation/ablate-V_B_LADDER.json` | the baseline every L3-2g/L3-2h number is read against, under the activated prompt: HC **12/13 → 10/13**, **11 of 24** rows differ from frozen L3-2g. **The L3-2h comparison does not transfer** |
| `rootcause/locked-under-activation/ablate-V_A_LADDER.json` | §36.7's variant A under the activated prompt: **12 of 24** rows differ |
| `rootcause/locked-restored-V_B_LADDER.json` | the same variant after the revert: **0 differences** from frozen L3-2g. The instrument's input is back |

`ablate-l32g-state-separation.ts` is `73f74131…`, `score-l32g-fact-coherence.ts` and
`score-l32g-order-sensitivity.ts` are byte-unchanged. **`TERMINAL_A` cannot be reached by this phase.**

## What the reader must not take from the wrong place

1. **The carrier was not removed — its ACTIVATION was refused.** `ReasoningProposal.unresolvedDecisions`,
   the validator's two reason codes, `L3_UNDECIDED_STATES` and the binder are exactly as L3-2i left
   them, byte-unchanged, and `test-l32j-carrier-activation.ts` asserts a zero-candidate proposal still
   carries a clarification through validation. What is not shipped is the **declaration** that would
   make a provider emit one.
2. **The clarification metric never improved because it was never below ceiling.** 5/5 before, 5/5
   after, on both denominators. Any future statement that L3-2j "lost" clarification recall is wrong;
   what it lost was clarification **precision**, and high-consequence recall.
3. **`D-56` is not overturned.** Its 60% stands — for `V_S_STRUCT`, which is what it was measured on.
   L3-2j establishes that the figure does not describe the shipped ladder, which is a **scope**
   correction, not a contradiction.
4. **The provider axis is still `n = 1`.** Only `qwen3-coder:30b` ran. `GEMINI_API_KEY` was not present.

## Production code changed by this phase

**One file, and its emitted output is byte-identical to its pre-phase output:**
`backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts` — `L3_SYSTEM_PROMPT` restored to
`b8cc50fc…`, `buildProposalSchema` restored to the v6 shape and key order, one exported anchor
constant added, one duplicated schema literal expressed through a helper, and the whole episode
recorded in comments where the next reader would otherwise repeat it. The other 18 `reasoning-l3`
modules are byte-unchanged.

New scripts, none on the customer path: `activate-l32j-shipped-corpus.ts`,
`score-l32j-clarification-denominators.ts`, `test-l32j-carrier-activation.ts`.

## The one-line summary

We shipped the declaration L3-2i proved, ran it over the whole corpus instead of five scenarios,
watched it delete a roof-fall hazard and ask a question on a scenario whose entire purpose is that
nothing should be asked — and put it back, byte for byte, with the receipts for both directions.
