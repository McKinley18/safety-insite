# §210A — ROOT-CAUSE AND TOKEN-BLUEPRINT EVIDENCE PACKAGE

**Provider calls: 0. Database operations: 0.** No §208, §208B or §209 artefact was altered. No §209
verdict was recomputed or reinterpreted. No remediation was applied. No new cohort was created.

| Artefact | Contents |
|---|---|
| `ROOT-CAUSE-MATRIX-210A.json` / `.md` | one row per failed slot (29), derived evidence separated from authored analysis |
| `REMEDIATION-FAMILIES-210A.md` | the five architecture families and the proposed remediation order |
| `TOKEN-WASTE-MATRIX-210A.md` | 14 payload components classified, including 6 `DO_NOT_REMOVE` |
| `SINGLE-FACT-VERIFIER-PAYLOAD-DESIGN-210A.md` | current vs proposed verifier payload, field by field |
| `TOKEN-BASELINE-210A.json` / `.md` | measured baseline from the frozen call ledgers |
| `BLUEPRINT-STATUS-210A.md` | TBR-1 … TBR-15 assessed against evidence |
| `ORDINARY-QUALITY-HARNESS-DEFECT-210A.md` | harness defect, recorded separately from behavioural failures |

Regenerate with `npx ts-node -T scripts/build-210a-root-cause-package.ts` from `backend/`.
