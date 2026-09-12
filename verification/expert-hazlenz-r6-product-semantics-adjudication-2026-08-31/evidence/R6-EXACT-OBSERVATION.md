# R6 — the exact frozen fixture, and what it does and does not state

Source of truth: `backend/src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures.ts`
(`R6_OBS`, lines 102–103; fixture body lines 215–233). SHA-256 of that file at adjudication
time: `e444b6920454a9d5cee6d72eece1aadddde141b7f84ead54ea42efe6f85c70cf`.

## The observation, verbatim

> The press was locked out with the supervisor tag applied and stored energy bled down and
> verified at zero before the guard was removed, and a second worker verified the isolation.

Length: 179 characters. It is the **only** authoritative source supplied (`obs-1`,
`sourceType: 'observation'`).

## The rest of the frozen input

| field | value |
|---|---|
| `inspectionContext` | `{ location: 'Plant 2', task: 'routine walkthrough' }` |
| `jurisdiction` | `osha-general-industry` |
| `deterministicFindings` | **one** finding: `lockout_tagout` / `CONTROLLED` / `isLifeCritical: false` / `isActionable: false` / `requiredActions: []` |
| `governedStandards` | **`[]` — empty. Expert was supplied no regulatory record of any kind.** |
| `answeredClarifications` | `[]` |
| `allowedHazardFamilies` | includes `machine_guarding` and `lockout_tagout` |
| `expectations` | `expect('FORBIDDEN','FORBIDDEN','FORBIDDEN','FORBIDDEN')` — all four collections |
| `probes` | `[]` |

The fixture's own inline rationale (lines 229–231):

> Everything is stated: locked out, tagged, bled down, verified at zero, second-person verified.
> A candidate or a question here is invention, and that is what this fixture catches.

## Fact classification — required by Phase 1, without paraphrasing away distinctions

### Explicitly stated

1. The press **was locked out**. (A lockout, not tagout-only: the verb is "locked out".)
2. **The supervisor tag** was applied.
3. **Stored energy** was **bled down**.
4. Stored energy was **verified at zero**.
5. The guard **was removed**.
6. The ordering is explicit: 1–4 occurred **"before the guard was removed."**
7. **A second worker verified the isolation** (independent, second-person verification).

### Explicitly controlled

- **Energy isolation** — stated, and stated as *verified*, and stated as *independently
  re-verified*. This is the strongest form of energy-control assertion the observation
  vocabulary supports.
- **Stored energy** — stated as bled down **and** verified at zero. Not merely "isolated".
- **Sequencing** — the guard came off *after* a completed, verified isolation. The observation
  forecloses the single most dangerous real-world variant (guard off first, isolate later).

### Explicitly unresolved (genuinely not stated)

- **U1.** Whether the guard is *still* off at the moment of the walkthrough, or has been
  reinstalled.
- **U2.** What servicing task, if any, is being performed.
- **U3.** Whether any person is currently at or near the point of operation.
- **U4.** Whether the press has since been, or is about to be, re-energized.
- **U5.** Whether the servicing employee affixed a **personal** lock, or whether the
  supervisor's device is the only one. ("locked out with the supervisor tag applied" is
  ambiguous on ownership of the isolating device — see PHASE3 note.)

### Inferred, not stated

- That a servicing/maintenance activity is underway. This is a *reasonable* inference — a
  completed LOTO sequence followed by guard removal has essentially no other reading — and the
  adjudication accepts it. It is recorded here because five of the nine hosted responses state
  it as though the observation said it ("the guard was removed **to perform work on the
  press**", "**to allow access to** the press"). The observation says neither.

### Hypothetical future conditions (introduced by the responder, not by the text)

- Re-energization / return to service. Never mentioned, never described as imminent or
  contemplated.
- Any other worker approaching the machine.
- "gravity-fed components, unexpected motion" (v6 rep 3) — a mechanism the observation not
  only omits but *contradicts*, since it states stored energy was bled down and verified at
  zero.

## Grounding check (independent, this adjudication)

All nine hosted candidates declared `EXACT_QUOTE_SUPPLIED` and quoted one of two spans:

| offsets | text | binds? |
|---|---|---|
| `[106,134)` | `before the guard was removed` | **yes, exactly** |
| `[113,134)` | `the guard was removed` | **yes, exactly** |

Verified by direct half-open slice against `R6_OBS`. Every quote binds. **The defect under
adjudication is not a grounding defect** — the model is quoting the observation correctly and
then reasoning past it.
