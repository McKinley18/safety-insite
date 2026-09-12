# ADDENDUM — RESUMED HOSTED TRANSPORT PROBE (2026-08-29, second attempt)

> ### `EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_BLOCKED — VALID_HOSTED_PROVIDER_CREDENTIAL_REQUIRED`
> ### Hosted calls **0** · provider calls of any kind **0** · cost **$0.00** · ceiling never touched
> ### The probe is now BUILT, TYPECHECKED and ARMED. It stopped at Phase 1, before Phase 5.
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

This addendum sits beside `STATUS.md`, which records the FIRST attempt. That attempt found no
credential existed anywhere. This one was told a credential had been provisioned, and the finding is
different and narrower: **a credential may well exist on this machine, but it does not reach this
session's process environment, and this operation must not invent a way around that.**

---

## 1. Credential — checked exactly as narrowly as Phase 1 allows

Phase 1 permits recording **`PRESENT` or `ABSENT` only** — no value, prefix, suffix, length, hash or
encoded form. That is what was recorded.

| location | `ANTHROPIC_API_KEY` |
|---|---|
| process environment | **ABSENT** |
| `backend/.env` | **ABSENT** |
| `.env`, `.env.local` | **ABSENT** |
| `~/.zshrc`, `~/.zprofile`, `~/.profile` | **ABSENT** |
| `~/.local/bin/env` (sourced by `.zshrc`) | **ABSENT** |
| `~/.claude/settings.json`, `.claude/settings.local.json` `env` blocks | **ABSENT** |
| `.envrc` / direnv | not present |

**A control measurement makes this diagnosis rather than a shrug.** `OPENAI_API_KEY`, which lives in
`~/.zshrc`, **is** visible to this session's subprocesses. So the environment is not being filtered
wholesale, and "the tool cannot see keys" is not the explanation. The likely cause is ordinary: the
key was exported in a separate terminal after this session started, so it never entered this
session's environment.

The account owner chose `backend/.env` as the route in. That file is **gitignored at
`.gitignore:22`**, so the credential cannot be committed by accident, and the probe reads it through
a six-line loader rather than a dependency — see §3.

---

## 2. What was NOT done, again

- **No hosted call.** 0 attempted, 0 completed, `$0.00`. The 8-call / $3.00 ceiling was computed and
  never touched.
- **No local substitution.** Ollama is reachable and was used ONLY to re-confirm the local baseline
  (§5); it was never presented as a hosted result.
- **No credential was requested in chat, printed, logged, hashed or persisted.**
- **No `vercel env pull`**, no minting of a token, no Vercel or Render change.
- **No gate was weakened to make anything pass.** One gate was corrected; §4 is the full account.

---

## 3. What WAS built — Phases 2, 3 and 4, which do not depend on the credential

**Phase 2 — the candidate is now verifiable, and it checks out.** `claude-sonnet-5` is a current
model id; published pricing is **$2.00 / 1M input, $10.00 / 1M output**, matching the figures the
authorization stated, from an independent reference. Structured output is supported. Token usage is
reported per response.

**The worst-case spend was bounded BEFORE any code was written**, from the real prompt:

```
system prompt        4,896 chars
worst user prompt    1,020 chars
worst wire schema    6,490 chars
worst input         12,406 chars -> 4,136 tokens at a deliberately pessimistic 3 chars/token
max_tokens/call      8,000
worst cost / call    $0.0883
worst cost x 8       $0.7062      CEILING $3.00 -> BOUNDED
```

**Phase 3 — `backend/src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts`.**
In the SIBLING directory, because the §99 no-call guard forbids network primitives, endpoints,
credentials and vendor names in the core — the same guard that placed the local adapter.

Three decisions in it are worth stating because each could have been made worse:

1. **The contract is not reshaped for this vendor.** `analysis.v2` and `prompt.v3` are used exactly
   as the provider-neutral core defines them. The one provider-native transformation is
   `applyStrictSchemaWrapper()`, which injects `additionalProperties: false` because Anthropic's
   strict tool schema requires it. It adds no field, removes none, and edits no description or
   `required` list — a wrapper, which is where §100's architecture says vendor concerns belong.
2. **Structured output is a FORCED tool call**, not prose parsing. If the model answers any other
   way the adapter returns `SCHEMA_INVALID_STRUCTURED_OUTPUT` rather than salvaging JSON out of
   text — salvaging would hide exactly what the probe measures.
3. **There is no `temperature` and no `seed`, and that is a finding, not an omission.** On Sonnet 5
   `temperature`, `top_p` and `top_k` are removed and return 400, and no seed parameter exists. The
   local transport forwards both, and §100 recorded cheap repeatability because of it. **That
   property does not transfer.** `P2_DETERMINISM_CONTROL` must record NO determinism control on this
   provider — the same shape of fact that made L3's G9 reproducibility gate unreachable.

**Raw `fetch`, not `@anthropic-ai/sdk`, and the reason is stated rather than assumed.** The SDK is
the normal default. It is not installed, and installing it would add a package to
`backend/package.json` and `package-lock.json` — the dependency tree of a service where
`autoDeploy=yes` on `main` makes a push a production deployment — to support code imported by
nothing on the customer path. The sibling adapter already establishes `fetch` here and Node 20
provides it. If this adapter is ever promoted to a customer path, that decision should carry the SDK
with it.

**Two grounding fixtures**, `H7` and `H8`, in
`backend/src/safescope-v2/expert-hazlenz/fixtures/grounding-fixtures.ts`. Both make an **additional
hazard candidate** the groundable object, because `evidence` exists on exactly one collection —
`expertHazardCandidates` — and `bindWireAnalysis` binds nothing else. A grounding fixture built
around a clarification would have measured nothing. Each hands the model a short exact phrase:

- **H7** — `anchor point recertification is overdue by 14 months`
- **H8** — `the ventilation blower will be offline for the entire shift`

The probe asserts **before any spend** that each anchor is verbatim in its own observation, so a typo
in an answer key can never be misread as a model failure.

**The probe** — `backend/scripts/probe-expert-hosted-transport.ts`, `probe:expert-hosted-transport`.
Seven planned calls under an eight-call ceiling (H1 and H2 share one fixture; the brief says not to
consume calls merely to reach eight). The cost ceiling is enforced **before** each request against
that request's worst case, because checking afterwards is checking after the money is gone. It
evaluates the 18 hard gates, reports `NOT MEASURED` distinctly from `FAIL`, and never counts an
unmeasured gate as a pass.

**Grounding is measured with `UNBINDABLE` and `FABRICATED` kept apart**, because collapsing them
would hide the one that matters:

- `UNBINDABLE` — not found verbatim in the source it named (paraphrase, whitespace slip, invention);
- `FABRICATED` — a **strict subset**: absent from every supplied source even after aggressive
  normalization. That is invented text, not a copying error.

Neither is converted into "no evidence" and nothing is discarded — the unbindable quote is already
bound to `[-1,-1)` by the adapter and refused by the core validator, unchanged.

---

## 4. One gate was corrected, and it is not a relaxation

`G14` in the LOCAL routing probe asserted *"no hosted client exists anywhere in the adapter
directory."* That was true and useful while the only authorized providers were local. A hosted
adapter now exists **by product-owner authorization**, so the assertion became **stale** — not
wrong-and-inconvenient, stale in the precise sense the repository's own rule names.

Deleting the gate or loosening its pattern until it passed would both have been wrong. Instead it
keeps its strength and gains precision, and it now proves **two** things where it proved one:

1. every adapter file **except the one explicitly named authorized hosted adapter** is free of
   hosted clients, endpoints, SDKs and credential reads — same pattern, same comment stripping; and
2. **this probe does not import the hosted adapter at all** — a check the old gate never made, and
   the one that actually backs its `$0.00` claim.

A new hosted adapter dropped in tomorrow still fails (1). This probe gaining a hosted import still
fails (2). **Nothing that used to fail now passes.**

### 4.1 The first correction was itself wrong, and that is recorded rather than absorbed

The first rewrite **failed G14** — and the cause is the trap this programme keeps springing. Check
(2) tested `require\(|from ...` as an alternation and separately asked whether the file *contained*
the adapter's name. So it matched this script's own `require('fs')` and its own
`AUTHORIZED_HOSTED_ADAPTER` constant, and reported a hosted import that does not exist.

**That is the FOURTH content-grep-matches-its-own-text incident here** — §99.5 the Level-3
quarantine, §100 the corpus path, §101.6 this gate's credential check, now this — and the correction
is the same one every time: **match the CONSTRUCT, not the WORD.** The pattern is now anchored to
import syntax: a module name only means an import inside a quoted specifier introduced by `from` or
`require(`.

It was then proved falsifiable rather than assumed to work:

| sample | detected | expected |
|---|---|---|
| `import {...} from '.../anthropic-expert-provider';` | true | true |
| `require('.../anthropic-expert-provider')` | true | true |
| `const AUTHORIZED_HOSTED_ADAPTER = 'anthropic-expert-provider.ts';` | false | false |
| `require('fs')` | false | false |
| a prose mention | false | false |

---

## 5. Phase 4 pre-spend regression — executed, at the tree carrying the hosted adapter

| suite | result |
|---|---|
| `expert-contract-foundation` · `expert-authority-merge` | **56 / 0** · **51 / 0** |
| `expert-provider-failure` | **131 / 0** |
| **`expert-nocall-harness`** | **141 / 0** — **the core is still provably pure with a hosted adapter in the tree** |
| `expert-routing-contract` | **57 / 0** |
| `l32i-clarification-carrier` · `l32j-carrier-activation` | **61 / 0** · **37 / 0** |
| `kg4a-cutover-contract` · `kg4a-default-off` · `kg4d-default-off` | **146 / 0** · **52 / 0** · **121 / 0** |
| backend `tsc --noEmit` | **exit 0** |
| scripts typechecked under project options | **exit 0** |
| `probe:expert-routing` (local, `$0.00`) | **14 / 14 gates PASS** |

**The local baseline reproduced §101 exactly on a fresh run** — `OPPORTUNITIES 16 · HITS 16 ·
MISSES 0 · OVER_ROUTED 0 · EXPLANATION_ONLY_LOSSES 0`, candidates 4/4, clarifications 6/6, insights
4/4, disagreements 2/2. Adding a hosted adapter perturbed nothing. Those artifacts are under
`local-baseline-reconfirmation/` and deliberately **not** written into the accepted §101 directory.

**Confinement:** `grep -rl expert-hazlenz` finds no `*.controller.ts`, `*.service.ts` or
`*.module.ts`, and no frontend file. The probe re-checks this as gate HG18 at run time.

---

## 6. Everything measurable about the hosted provider is still NOT MEASURED

Stated as a list so none of it can be read as a zero or a pass:

```
hosted calls attempted / completed        0 / 0
HTTP / API failures                       NOT MEASURED
schema-valid responses                    NOT MEASURED
candidate / clarification / insight / disagreement routing   NOT MEASURED
negative-control behaviour                NOT MEASURED
EXPLANATION_ONLY_LOSSES (hosted)          NOT MEASURED
EVIDENCE_OPPORTUNITIES                    NOT MEASURED
EVIDENCE_QUOTES_EMITTED                   NOT MEASURED
EVIDENCE_QUOTES_EXACTLY_BOUND             NOT MEASURED
EVIDENCE_QUOTES_UNBINDABLE                NOT MEASURED
EVIDENCE_QUOTES_FABRICATED                NOT MEASURED
GROUNDED / UNGROUNDED TYPED OBJECTS       NOT MEASURED
input / output tokens                     NOT MEASURED
latency                                   NOT MEASURED
actual cost                               $0.00 (no call made)
18 hard transport gates                   0 of 18 EVALUATED — not 0 passed
```

§101's finding is therefore **exactly as open as it was**: `quotes = 0/0` across 14 local calls, so
every Expert candidate produced so far is **ungrounded**.

---

## 7. Exact next operation

One command, in the owner's own terminal, then the probe runs end to end:

```
read -rs ANTHROPIC_API_KEY && \
  printf 'ANTHROPIC_API_KEY=%s\n' "$ANTHROPIC_API_KEY" >> backend/.env && \
  unset ANTHROPIC_API_KEY

cd backend && npm run probe:expert-hosted-transport
```

Seven calls, worst case `$0.71`, hard-stopped at 8 calls or `$3.00`. The probe prints the 18 gates,
the routing totals, the grounding metrics and the terminal, and writes
`results/hosted-probe-summary.json`.

Nothing here authorizes the seventeen-measure evaluation cohort, provider selection, or customer
activation. Nothing was pushed, deployed, tagged, or run against production, the original SafeScope
database, Render, Vercel or Stripe.
