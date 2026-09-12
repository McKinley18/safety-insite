# HS-H1 — ADJUDICATION RESULT

**Returned by the PRODUCT OWNER, 2026-09-04, against
`HS-H1-HUMAN-ADJUDICATION-PACKET.md` (sha256
`8182cb4e324a5ac24049b1aaef1e6298b78c61e8949b510f06cc86d07e84a63f`).**

The packet itself is unaltered. This is a separate record so that the question and the answer stay
distinguishable.

---

## Disposition

```
AUTHORING_AMBIGUOUS
```

## The reviewer's determination, verbatim

> The general concern that load thermal state may remain hazardous despite zero chamber pressure is
> valid.
>
> The authored cooling-hold selector is not uniquely supported because the observation does not
> establish the load type, cycle type, manufacturer/SOP unload criteria, or that a cooling hold is
> the applicable safe-unloading mechanism.
>
> Zero chamber pressure/interlock release does not establish safe liquid-load temperature, but
> absence of a cooling hold does not by itself establish that opening must stop for every possible
> load.

## Directions issued with the disposition, verbatim

> Remove HS-H1 prospectively from strict selector-based semantic accuracy denominators. Preserve all
> historical scoring unchanged.
>
> Do not authorize the planned nomination-prior experiment yet.
>
> Next operation should be zero-cost human-truth reconciliation of the remaining load-bearing
> verifier cases, after which verifier performance should be re-derived on the human-reviewed subset.

---

## What the determination separates

Two propositions were distinguished, and only one survived.

| proposition | status |
|---|---|
| The observation does not **settle** whether the load is safe to unload | **upheld** — zero chamber pressure and interlock release do not establish safe liquid-load temperature |
| One specific named mechanism — a cooling hold — is **the** fact that governs the decision | **not established** — the observation names no load type, cycle type, or unload criterion |

The distinction generalises into a test that now applies to every authored selector on this
programme, recorded in `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md`:

> A selector naming a specific mechanism is uniquely supported only when the observation establishes
> the conditions under which that mechanism is the applicable one. Failing to settle the safe state
> is not the same as establishing which mechanism governs it.

## What this does and does not resolve

**Resolved.** Whether HS-H1's authored truth is a sound standard to grade a strict selector-based
measure against. It is not.

**Not resolved, and not addressed by this disposition.**

- Whether the verifier's silence on HS-H1 across seven executions was correct reasoning or a missed
  fact. The disposition says the standard could not decide that; it does not decide it either.
- Whether the nomination prior suppresses discovery. The experiment designed in §158 is explicitly
  **not authorized**.
- Whether the remaining load-bearing rows carry sound authored truth. That is the §159 reconciliation,
  and the HS-H1 outcome is the reason it is being done rather than assumed.

## Actions taken under this disposition

| action | artifact |
|---|---|
| Prospective exclusion recorded, historical scores preserved | `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md` |
| Disposition entered in the machine-readable ledger | `verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/ROW-TRUTH-DISPOSITIONS.json` |
| Instruction experiment moved to NOT AUTHORIZED | `docs/VERIFIER-NOMINATION-PRIOR-EXPERIMENT-DESIGN.md` |
| Reconciliation packets built for the six remaining rows | `verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/` |
| Re-derivation prepared, refusing until the ledger is complete | `backend/scripts/rederive-verifier-performance-on-human-truth.ts` |

§156 `VERIFIER-SCORES.json` and §157 `VERIFIER-V2-SCORES.json` were **not modified**. The frozen truth
manifest was **not modified**. The v9 fixture row HS-H1 was **not modified**.
