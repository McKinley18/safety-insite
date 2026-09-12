# ADDENDUM — ARMED HOSTED TRANSPORT PROBE, THIRD ATTEMPT (2026-08-30)

> ### `EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_BLOCKED — HOSTED_PROVIDER_ACCOUNT_OR_CREDENTIAL_REMEDIATION_REQUIRED`
> ### Hosted calls **0** · provider calls of any kind **0** · cost **$0.00** · ceiling never approached
> ### The probe ran, reached its own credential gate, and stopped at Phase 3 before the first request.
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

This is the third attempt on the same question, and each has failed at a *different and narrower*
point. `STATUS.md` records the first: no credential existed anywhere, and no hosted adapter had been
written. `ADDENDUM-RESUME.md` records the second: the adapter, fixtures, probe and eighteen gates
were built and typechecked, and the credential still did not reach the session. This one was told
the credential had been provisioned into `backend/.env`, and it has not been.

---

## 1. The finding, and why it is a diagnosis rather than a repeat

Phase 1 permits recording **`PRESENT` or `ABSENT` only**. No value, prefix, suffix, length, hash or
encoded form of any credential was read, printed, persisted or derived. Full table:
`third-attempt-pre-call-gate/CREDENTIAL_STATES.txt`.

`ANTHROPIC_API_KEY` is **ABSENT** in the process environment, in `backend/.env`, in `.env` and
`.env.local`, in `~/.zshrc` / `~/.zprofile` / `~/.profile` and the one file `.zshrc` sources, and in
both Claude settings `env` blocks. There is no `.envrc`.

**Two measurements make that a diagnosis.**

1. **The control.** `OPENAI_API_KEY` is **PRESENT** in this session's process environment. The
   environment is not filtered wholesale, so "the tool cannot see credentials" is not the
   explanation — the same control §103.1 used, and it still holds.

2. **The new one, which closes §103's explanation.** §103.1 attributed the absence to the ordinary
   cause: the key was exported in a different terminal after this session started, so it never
   entered this session's environment. **That explanation is now ruled out.** A *fresh login shell*
   (`zsh -lc`) — which reads the user's profile from scratch, exactly as a newly-opened terminal
   would — also reports `ANTHROPIC_API_KEY` **ABSENT**, while reporting `OPENAI_API_KEY` **PRESENT**.
   The credential is therefore in no persistent location that a new terminal would read either.

**And the decisive one.** `backend/.env` is the **only** file the probe loads —
`probe-expert-hosted-transport.ts:66`, a single `loadEnvFile(join(__dirname, '..', '.env'))`, and it
is deliberately the only one so the credential path stays auditable. That file's mtime is
**2026-08-16 23:08:53**, two weeks before this authorization. It carries 19 keys, none of them
Anthropic-, Claude-, model- or gateway-related, and no near-miss name. **The file §103.8 named as
the route in has not been written to.**

## 2. The probe's own gate fired, at zero cost

`npm run probe:expert-hosted-transport` was executed. It is safe to run without a credential by
construction: the credential check at line 273 precedes the request loop, so the run costs `$0.00`
and attempts no call. Captured verbatim at `third-attempt-pre-call-gate/hosted-probe-blocked.txt`:

```
EXPERT HAZLENZ — HOSTED TRANSPORT PROBE
provider   anthropic   model claude-sonnet-5
contract   hazlenz.expert.analysis.v2   prompt hazlenz.expert.prompt.v3
thinking   disabled   max_tokens 8000
ceiling    8 calls   $3.00
worst/call $0.0900   worst total $0.6300
planned    7 calls

pre-flight  both grounding anchors verified verbatim in their sources

BLOCKED — ANTHROPIC_API_KEY is not reachable. No call attempted, $0.00 spent.
```

Exit code **3**. Two things in that output are worth keeping.

**The pre-flight passed.** Both grounding anchors were re-verified verbatim in their own
observations *before* the credential gate — so the H7/H8 answer keys are sound, and a future
grounding failure will be readable as a model failure rather than a typo.

**The cost line is the probe's own recomputation, not the authorization's estimate.** The
authorization stated a worst case of approximately `$0.71`; the probe computes **`$0.0900` per call
and `$0.6300` for the seven planned**, from the real system prompt, user prompt and wire schema
sizes. Lower than the stated figure, and bounded well under the `$3.00` cap. This is recorded
because Phase 3 requires recomputing from actual sizing rather than carrying the estimate forward.

## 3. Phase 1 pre-registration — recorded before any call, as required

```
P2_DETERMINISM_CONTROL = ABSENT        for claude-sonnet-5
```

No seed control. `temperature`, `top_p` and `top_k` are unavailable on this model and are not sent
by the adapter. Evidence and reasoning: §103.3 item 3. Per the authorization this is **not** a probe
failure by itself: for the hosted probe, reproducibility is **OBSERVED / REPORTED**, not a
deterministic hard gate. The distinction is preserved for the later 17-measure evaluation, and this
pre-registration exists so the property is not rediscovered mid-cohort the way L3's G9 was.

## 4. Phase 2 pre-call safety gate — EXECUTED AND GREEN

Run at HEAD `37a5d1b5`. Raw output per suite in `third-attempt-pre-call-gate/`.

| suite | result |
|---|---|
| `expert-contract-foundation` | **56 passed / 0 failed** |
| `expert-authority-merge` | **51 / 0** |
| `expert-provider-failure` | **131 / 0** |
| `expert-nocall-harness` | **141 / 0** |
| `expert-routing-contract` | **57 / 0** |
| `l32i-clarification-carrier` | **61 / 0** — Level-3 quarantine intact |
| `l32j-carrier-activation` | **37 / 0** — Level-3 quarantine intact |
| backend `tsc --noEmit -p tsconfig.json` | **exit 0** |
| hosted adapter + hosted probe typecheck under project options | **exit 0** |

Every figure reproduces §102.6 and §103.5 **field for field**. The `141/0` is the one that carries
the most: `test:expert-nocall-harness` scans `expert-hazlenz/` for network primitives, endpoints,
credentials and vendor names, and it is still green **with a hosted adapter in the tree** — because
the adapter lives in the sibling directory, exactly as §99's guard forced.

**No protected invariant regressed, so Phase 2 did not stop the operation.** The stop came from the
credential at Phase 3.

## 5. Confinement — re-proved, not assumed

Full output: `third-attempt-pre-call-gate/CONFINEMENT.txt`.

- **12** files reference the Expert module — nine scripts, two adapters, one core file. §102 recorded
  ten at a HEAD that predated the hosted adapter and the hosted probe; those two files are the
  delta. An expected `+2`, not a regression.
- **No** `*.controller.ts`, `*.service.ts` or `*.module.ts` is among them. Zero matches.
- The **hosted adapter has exactly one importer**: the hosted probe script itself. Matched as a
  *construct* — a quoted specifier introduced by `from` or `require(` — never as a bare word, per
  the §103.4 correction.
- **No** frontend file references `expert-hazlenz` or the hosted adapter. Zero matches.

## 6. Phases 4–9 — NOT MEASURED, which is not zero

No hosted call was attempted, so every hosted measurement is unavailable. It is recorded as
**NOT MEASURED** rather than as `0`, because an unmeasured field translated into a zero is a
fabricated result:

calls attempted · calls completed · provider/API failures · reported model identity · schema-valid
responses · normalization outcomes · validation outcomes · candidate routing · clarification routing
· cross-hazard routing · disagreement routing · negative-control behaviour · hosted
`EXPLANATION_ONLY_LOSSES` · `EVIDENCE_OPPORTUNITIES` · `EVIDENCE_QUOTES_EMITTED` ·
`EVIDENCE_QUOTES_EXACTLY_BOUND` · `EVIDENCE_QUOTES_UNBINDABLE` · `EVIDENCE_QUOTES_FABRICATED` ·
`GROUNDED_TYPED_OBJECTS` · `UNGROUNDED_TYPED_OBJECTS` · input tokens · output tokens · per-call
latency · p50 · max latency · cost.

§101's finding therefore stands untouched: `quotes = 0/0` across 14 local calls, so **every Expert
candidate produced so far is ungrounded**. H7 and H8 remain the most important unanswered
measurements in the programme.

**Actual hosted spend: `$0.00`**, against the `< $3.00` requirement. Satisfied trivially, and it is
worth saying that a cost gate satisfied by never spending is not evidence the cost model is right.

## 7. Phase 9 — the eighteen hard gates

**0 of 18 EVALUATED. Not 0 passed.** The probe exits before gate construction, so no gate has a
verdict.

| gate | label | verdict |
|---|---|---|
| HG01 | hosted credential usable | `NOT_EVALUATED` |
| HG02 | exact model callable | `NOT_EVALUATED` |
| HG03 | provider identity from response body | `NOT_EVALUATED` |
| HG04 | transport errors = 0 on intended-success calls | `NOT_EVALUATED` |
| HG05 | responses parse | `NOT_EVALUATED` |
| HG06 | responses normalize through the adapter | `NOT_EVALUATED` |
| HG07 | responses validate at the Expert boundary | `NOT_EVALUATED` |
| HG08 | zero-candidate clarification survives | `NOT_EVALUATED` |
| HG09 | typed cross-hazard routing survives | `NOT_EVALUATED` |
| HG10 | candidate routing survives | `NOT_EVALUATED` |
| HG11 | multi-collection sibling routing survives | `NOT_EVALUATED` |
| HG12 | negative control not materially over-routed | `NOT_EVALUATED` |
| HG13 | protected merge halves invariant | `NOT_EVALUATED` |
| HG14 | token usage measurable | `NOT_EVALUATED` |
| HG15 | latency measured | `NOT_EVALUATED` |
| HG16 | cost below cap | `NOT_EVALUATED` |
| HG17 | fabricated/unbindable evidence cannot cross as grounded | `NOT_EVALUATED` |
| HG18 | production/customer path untouched | `NOT_EVALUATED` |

**HG18 deserves one sentence of care rather than a promotion.** Its underlying invariant *was*
independently proved in §5 above, outside the probe. That is not the same thing as the gate having
been evaluated, because the gate asserts the invariant **after** seven hosted calls, and no hosted
call happened. It stays `NOT_EVALUATED`. Collapsing it into `PASS` is exactly the move Phase 9
forbids.

## 8. Phase 10 — post-probe regression

The Phase 2 gate is also the post-probe measurement, and that is a statement about what happened
rather than a shortcut. Between the gate and this line, **zero hosted calls were made and zero
production files were modified** — the probe's only write was an empty
`transport/hosted-probe.jsonl`, truncated at startup before the credential check. There is no
mechanism by which the suites could differ, and re-running them to produce a visually distinct
second table would add a row without adding evidence.

Tracked worktree state was re-inspected afterwards and is unchanged. In particular
`frontend-next/tsconfig.json` is still sha256
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — byte-identical to the §99/§102
protected record, deliberately excluded and untouched.

## 9. Why no workaround was attempted

Four were available and all four were refused, for the same reason §102.4 refused its two.

- **No credential was searched for outside the locations Phase 1 names**, and no value was read at
  any point. `PRESENT`/`ABSENT` only.
- **The key was not written into `backend/.env` by this operation.** Provisioning a credential is
  the owner's action in their own terminal; an agent that writes one has removed the human step that
  makes the spend authorized.
- **`OPENAI_API_KEY` was not substituted.** It is present and it is a hosted credential, but the
  authorization names Anthropic and `claude-sonnet-5`, no OpenAI adapter exists, and writing one
  would be exactly the speculative hosted adapter §102.4 already declined to write.
- **Ollama was not substituted.** It is reachable and it costs nothing, and a local result reported
  against a hosted question is the failure mode this whole programme is built to avoid.

## 10. Residual debt

**Unchanged:** hosted transport unmeasured · every Expert candidate ungrounded · routing measured on
one local model only · live malformed-output behaviour unobserved · `test:kg5b-operator-cli` 64/65 ·
the unresolved-jurisdiction ranking · `directObjectStatus: NOT_VERIFIED_LOCAL_TEST_PROVIDER` ·
`LIVE_PAYMENT_PROOF = FALSE`.

**Narrowed:** §103 could not distinguish "the key exists but is not visible here" from "the key does
not exist". The fresh-login-shell control now separates them: **it is not a visibility problem.**
The remedy is a file write, not an environment or tooling fix.

**New:** nothing. No engineering work was found outstanding, and none was invented.

## 11. Exact next operation

In the account owner's own terminal:

```
cd /Users/mckinley/Desktop/Safety_InSite/backend
printf 'ANTHROPIC_API_KEY=%s\n' 'sk-ant-...' >> .env     # real key, typed by the owner
npm run probe:expert-hosted-transport
```

`backend/.env` is gitignored at `.gitignore:22`, so the credential cannot be committed by accident.
Appending is deliberate — the file holds 19 live database and auth settings that must not be
disturbed. Then seven calls, worst case `$0.63`, hard-stopped at 8 calls or `$3.00`.

Verify with `grep -c '^ANTHROPIC_API_KEY=' backend/.env` — it should print `1`. That prints a count,
never the value.

No provider selection, no customer activation, no evaluation corpus, no Render or Vercel change, no
production access, no Stripe action, and **no commit, push, tag or deploy**.
