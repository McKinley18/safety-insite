# §187 — Asymmetric structured owed-fact behavioural validation: PRE-SPEND STOP

**2026-09-05. Zero provider calls. Zero database operations. No source, prompt or schema change.**

> **`FIRST_PROVIDER_CALL_MADE = FALSE`**
> **`PRE_SPEND_BLOCKER = TRUE`**

The pre-spend freeze work was carried out and is recorded below. It stopped before spend because the
REQUIRED treatment as specified **is not executable on the component that §179 measured**, and every
executable variant changes what the validation measures. Spending 30 calls on a design that cannot
answer questions A, B and H would produce misleading evidence at a real cost.

---

## The blocker, established from the repository

### 1. The first-pass Expert cannot receive a supplied owed fact

§179 — the precedent this validation extends — ran the **first-pass Expert**:
`hazlenz.expert.prompt.v15`, file sha `bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694`,
ten HR rows × 3 executions, with input deliberately **uniform across every row** so the input could
not separate the classes.

`ExpertAnalysisInput` (`expert-contract.types.ts:542`) has **no owed-fact field**. Its fields are
`authoritativeSources`, `inspectionContext`, `jurisdiction`, `allowedHazardFamilies`,
`deterministicFindings` and the family-evaluation view. `expert-input-constructor.ts` and
`expert-contract.types.ts` contain **zero** occurrences of "owed". The first-pass Expert therefore
cannot be given "exactly ONE unresolved owed fact" — there is nowhere to put it.

### 2. The only component that accepts an owed fact needs a stimulus that does not exist

Owed facts reach a provider solely through `buildVerifierV3UserPrompt` (§186). That builder requires
a `firstPass` block — candidates, clarifications, stated uncertainty and summary.

**No first-pass content exists for any HR row.** The `firstPass` blocks in the repository belong to
the HS-* rows frozen at §166/§167. Producing HR-row first-pass content means either running the
first-pass Expert first (extra calls, below) or **authoring it** — which is authoring the stimulus,
the confound that stopped §183 and that this programme has refused since §162.

### 3. The zero-owed-fact branch of the frozen verifier prompt states something false

Executed, not inferred. With `owedFacts: []` the builder emits:

```
UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW
(none were identified — the first pass returned an entirely empty analysis)
```

On a SILENCE row whose first pass was **not** empty, that sentence is false. It is also a far
stronger cue than the settlement status §186 declined to expose: it tells the model outright that
nothing was found. Running the SILENCE arm through the verifier would inject that cue into exactly
the rows whose restraint is being measured.

## Cost arithmetic for each executable variant

§179 measured **30 first-pass calls at $1.53991** (~$0.0513/call). The §166 v3 preflight bounded
verifier calls at ~$0.056 worst case.

| Variant | Calls | Est. cost | Within 36 / $3.00? | What it measures |
|---|---|---|---|---|
| **1. First-pass Expert, all ten rows** (§179 design) | 30 | ~$1.54 | Yes | Silence restraint and clarification behaviour. **Cannot answer A, B or H** — the first-pass Expert emits no `owedFactDeclarations`, so there is no binding and no `CHALLENGE_FACT_VALIDITY` |
| **2. Asymmetric two-component**: verifier for REQUIRED (5 first-pass to build the stimulus + 15 verifier), first-pass for SILENCE (15) | 35 | ~$1.86 | Yes | Answers A, B, H on REQUIRED and F, G on SILENCE — **but the two arms exercise different components and different prompts** |
| **3. Verifier for all ten rows** (10 first-pass + 30 verifier) | 40 | ~$2.19 | **No — exceeds the 36-call hard cap** | The authorization's own rule: STOP |

## The measurement problem with variant 2

Variant 2 fits the budget, and it is the only one that answers the binding and declaration
questions. Its cost is not money, it is comparability.

The authorization preserves the five matched pairs and says "the matched pair controls the
underlying safety situation / owed property". Under variant 2 the pair members are analysed by
**different components under different system prompts** — the v3 verifier for the REQUIRED member,
the v15 first-pass Expert for the SILENCE member. The pair then controls the observation and the
owed property but not the analyser, so it does not control what the pairing appears to control. The
authorization already forbids describing the arms as receiving the same architecture input; this is
a stronger statement than that, and it should be recorded before spend rather than discovered in the
report.

## A fact the owner should have before choosing variant 1

Variant 1's SILENCE arm is **not a new measurement**. §179 ran precisely that treatment — first-pass
Expert, prompt v15, zero owed facts, uniform input, same five SILENCE rows, three executions each —
and recorded `SILENCE_PASS = 12/15` (exact).

The §187 SILENCE gate is **13/15**. The existing point estimate for this exact treatment sits one
execution below the gate. A re-run would be a fresh sample and could land either side of it; nothing
here predicts the outcome, and no causal claim is made about why 12/15 occurred. But authorising a
re-run of an already-measured arm against a gate its prior point estimate does not clear is a
decision that belongs to the owner, not to me.

## Freeze material already established (reusable, whichever variant is chosen)

| item | value |
|---|---|
| Frozen row hashes | 10/10 verified against `SECTION-184-INTEGRITY.json` |
| §184 truth artifacts | 5/5 byte-identical (`649a17df…`, `ce6b35a1…`, `070f40d0…`, `1973abbd…`, `172aaba1…`) |
| First-pass prompt | `hazlenz.expert.prompt.v15`, file sha `bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694` |
| Owed-fact source (post-§185) | `owed-fact.types.ts` `102d059b…`, `owed-fact-ledger.ts` `4fe33190…`, `verifier-v3-development-boundary.ts` `5273d5af…` |
| Binding admission logic | `owed-fact-binding.ts` `e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0` (unchanged since §182) |
| Model | `claude-sonnet-5` |
| Credentials | `ANTHROPIC_API_KEY` present in `backend/.env` |
| REQUIRED payload derivation | deterministic from §184 truth per §185; `acceptableEvidence` = null on all ten, preserved as null |

## Decision required

Which variant, or a different design. I did not choose one, because the choice changes what the
validation can claim and the authorization's claim boundary is written for a design that turns out
not to be executable as specified.

## Preserved unchanged

`CURRENT_REGRESSION_FAILURE = FALSE`. `HISTORICAL_PIN_NO_LONGER_MATCHES_CURRENT_SOURCE = TRUE`.
`EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE`. §182 evidence and stale pins
untouched. §186 terminal and artifacts untouched. The direct terminal-construction residual remains
OPEN and out of scope, and was not used to fake a settled provider input.
