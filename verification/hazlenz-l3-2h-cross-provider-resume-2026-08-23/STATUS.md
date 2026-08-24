# L3-2h RESUME — Cross-Provider Structural-State Discrimination

> ### `L3_2H_BLOCKED — SECOND_PROVIDER_CREDENTIAL_REQUIRED`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Resume of §38, not a new phase and not a
remediation cycle. **Zero production or script files modified. No stash operation
of any kind was executed.**

## Outcome in one line

The credential gate was re-tested and **still fails**. The blocking condition
§31.1 first recorded, and §38.1 re-recorded, is unchanged three phases later.
Phases 3–8 of the entry contract were therefore not executed, and no A/B/C/D
decision class can honestly be claimed.

## What this resume adds that §38 did not have

§38.1 classified `OPENAI_API_KEY` as a placeholder **by length class** — an
inference from the fact that 11 characters cannot encode a ~160-character key.
That inference is now a **measurement**:

| | §38.1 | this resume |
|---|---|---|
| `OPENAI_API_KEY` present | yes, length 11 | yes, length 11 — unchanged |
| basis for "placeholder" | length class only | **provider returned HTTP 401** |

The probe sent the credential to `api.openai.com` — the entry contract's sole
authorized destination for it — and **no scenario, evidence or corpus content
whatsoever**. The gate outcome does not change. Its proof is stronger, and the
next attempt need not re-derive whether that variable is usable: it is not.

## What was verified and held

* **Repository identity.** Branch, HEAD `1feda622`, upstream, 0/0 divergence — all
  as expected and as recorded.
* **Preservation.** Worktree identical to the L3-2h baseline excluding this
  package's own directory. 4 stash entries identical, **no stash operation run**.
  23 tags, all targets identical.
* **Locked harness.** `ablate-l32g-state-separation.ts` verified against the
  recorded **full** digest `73f74131b4f8cbb3…`, not the abbreviation in the
  command. Three companion scorers verified too. Untouched.
* **Frozen evidence.** All six holdouts plus `development-l32f.json` identical.
* **Sealed corpus.** `a95e5480…`, `49aa40fd…`, `6f6897f1…` hash-verified unchanged,
  **not opened**, referenced in zero artifacts, seen by no provider.
* **Customer authority.** Zero importers of `reasoning-l3` outside itself; zero
  importers of `state-facts` inside `backend/src`; seam, call site and
  `backend/src/standards/` byte-unmodified. `reasoning-l3` declares only
  `L3_OLLAMA_*` — no hosted credential is required for customer execution. **No
  adapter was written, so none could become customer-authoritative.**
* **No substitute comparator.** `ollama /api/tags` still lists exactly one model,
  `qwen3-coder:30b` at the pinned digest `06c1097efce0`.

## Documentation reconciled, and found NOT stale

§29, `L3-INV-01`…`L3-INV-12`, §31–§38 (§36.7, §37 and §38 in full), §13.1 and the
current-state blocks `l31ReasoningContract`…`l32hCrossProvider` were read before
any action. **Executable evidence contradicted the documentation nowhere.** The
one apparent contradiction — four tags reading differently — was a comparison
method artefact (annotated tag object vs dereferenced commit), chased to ground,
and is recorded in `SECURITY_AND_PRESERVATION.txt` §3 rather than absorbed.

## What was deliberately NOT done

Per the entry contract's STOP: no second-provider run · **no provider adapter**
(unexercisable without a credential; §38.5's reasoning is unchanged and correct) ·
no baseline reproduction re-run (it would consume ~96 local inference calls to
re-confirm a §38.2 result whose inputs are hash-identical, and the contract
forbids engineering work to compensate for the missing credential) · no prompt
remediation · no state-representation redesign · no sealed corpus consumed · no
L3-3 · no production provider selected · no commit, push or deploy.

## Regression posture

No code changed, so the §38.6 regression record stands unaltered and was not
re-run: 715 offline assertions 0 failed; `test:hazlenz-core` 206 pass / 2 fail —
the two documented §13.1 failures only, **not reclassified**; KG contracts
unchanged. Every input those suites cover is hash-verified byte-identical to the
state in which they were recorded. This is stated as inheritance, not as a fresh
measurement.

## Egress

`api.openai.com` — **1** hosted call (auth probe, 401, credential only, no data).
`127.0.0.1:11434` — **1** metadata call, **0 inference calls**.
No production data, no corpus, no credential in any artifact.
