# EXPERT HAZLENZ — ARCHITECTURE MAP

Consolidated 2026-09-07 after §203. Authority-boundary legend: **[P]** = provider authority ends
here · **[D]** = deterministic (HazLenz-owned) authority · **[H]** = human authority required ·
**[X]** = customer-inactive boundary (nothing beyond it is customer-reachable today).

## The pipeline

```
RAW OBSERVATION (customer text, externally supplied ids)
  │
  ▼
ORDINARY FIRST PASS (hosted model, capability-ABSENT grammar)                 [P]
  │   provider may: describe, declare unresolved facts, nominate
  │   provider may NOT: name factKeys on the wire, settle, prioritize,
  │   cite as authority, attach governance fields
  ▼
STRUCTURED UNRESOLVED-FACT DECLARATION (closed schema)                        [P]→[D]
  │
  ▼
DETERMINISTIC VALIDATION / IDENTITY                                           [D]
  │   computeFactKey, FACT_KEY_SHAPE, admission codes,
  │   forbidden-field scans, 17 projection refusal codes
  ▼
SUCCESSOR BOUNDARY GUARDS (§203, SUCCESSOR PATH ONLY)                         [D]
  │   ABF-1 stage membership · ABF-2 provenance membership ·
  │   ABF-3 owned-field scan · ABF-7 recursive governance scan ·
  │   ABF-8 frozen ceiling · FACT_IDENTITY_COLLISION (terminal-status
  │   collision fails closed, diagnostic emitted, no semantic position)
  ▼
OPTIONAL SEPARATE GOVERNED-BINDING STAGE (§202, mode REDACTED)                [P]→[D]
  │   model SELECTS among supplied sourceIds and minted factRefs;
  │   it never NAMES either side. Verbatim-evidence mode NOT authorized.
  │   No hosted transport validation yet (D12).
  ▼
OWEDFACT / TASK STATE (ledger)                                                [D]
  │   priority deterministically assigned (Ruling 5);
  │   urgencyNomination non-authoritative if present at all
  ▼
VERIFIER (v3.x — development gate literal false)                              [P]→[D]  [X]
  │
  ▼
ADMISSION (closed codes, closed vocabularies)                                 [D]
  │
  ▼
HUMAN-AUTHORIZED SETTLEMENT (consumer present, producer deliberately absent)  [H]
  │   PROVIDER_SETTLEMENT_AUTHORITY = NEVER (runtime brand);
  │   clarification-evidence sufficiency = SEMANTIC_JUDGMENT_REQUIRED
  ▼
PERSISTENCE                                                                   [D]  [X]
```

## FROZEN HISTORICAL PATH vs §203 SUCCESSOR DEVELOPMENT PATH

| | FROZEN PATH | SUCCESSOR PATH |
|---|---|---|
| modules | §187-pinned four (`owed-fact.types`, `owed-fact-ledger`, `owed-fact-binding`, `verifier-v3-development-boundary`) + `expert-prompt.ts` + `expert-verifier-contract-v3.ts` + `expert-first-pass-owed-fact-projection.ts` | `backend/scripts/lib/expert-203-successor-{identity,projection,binding}.ts`, `expert-203-fact-identity-collision.ts`, `expert-203-effective-grammar-identity.ts` |
| contract | §187 `owedFactSourceHashes` (historical experimental identity — immutable) | **`hazlenz.expert.203-successor-boundary.v1`** with own manifest + integrity gate |
| guards | five §202 guards exist as pure functions, **uncalled here by design** | all five integrated with exercised call sites |
| ABF-5 | **silently no-ops** on terminal-status collision (measured, preserved) | `FACT_IDENTITY_COLLISION` fails closed |
| priority field | `NominationPayload.priority` required (ABF-4 contradiction open) | field removed; deterministic priority; `urgencyNomination` non-authoritative |
| schema closure | partial (BYPASS-2 class recorded) | `additionalProperties: false` at every node, runtime-enforced, red-teamed (107 cases) |
| callers | all existing execution paths | **none — §203 tests only, until D10** |
| lineage | ancestor | wraps the frozen projection (ABF-1/2/7); copies exactly two binding functions (ABF-3/8, collision); imports the frozen ledger unchanged |

## Where the boundaries are enforced (not merely described)

- Production reachability: `backend/tsconfig.json` `include: ["src/**/*"]` — no `expert-20x-*`
  module is in the production build. **[X]** verified §202 and §203.
- Provider naming authority: denied by construction on the first-pass wire; **still present at the
  frozen binding boundary** (`NominationPayload.factKey` free string — D01).
- Known places where a claimed invariant is weaker than described: the KNOWN_DEFECT register in
  `CURRENT-EXPERT-HAZLENZ-STATE.md` (ABF-*, AB203-*, RT203-*, HIGH-1/2), each with evidence.
