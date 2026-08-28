# Regulatory reviewer governance and immutable knowledge release versioning — 2026-08-28

```
TERMINAL = HAZLENZ_GOVERNED_STANDARDS_RELEASE_READY
           — FINDING_LEVEL_GOVERNED_STANDARDS_INTEGRATION_REQUIRED
```

All 72 source-verified records were reviewed record by record against their authoritative text.
64 passed and were approved individually through the checksum-protected governance mechanism; 8
pre-existing records failed the fidelity rubric and were **excluded rather than approved**. An
immutable, reproducible candidate release now exists under its own identity, and the release-identity
defect that let one identifier name three different artifacts is repaired.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / deploy / production mutation / provider call | **none** |
| stashes / tags | 4 / 24, untouched |
| production release activated | **no** — the candidate is local only |

### Protected baselines, re-measured

| metric | required | measured |
|---|---|---|
| required hazard recognition | 43/43 | **43/43** |
| actionable coverage | 43/43 | **43/43** |
| life-critical actionable | 35/35 | **35/35** |
| Population A precision | 100 % | **100.0 %** |
| forbidden emissions | 0 | **0** |
| governed source records | 72 | **72** (corpus unchanged; the release is a reviewed subset) |
| `SOURCE_AUTHORITY_MISSING` | 0 | **0** |

## 2. Phase 1-2 — the release-identity defect, corrected diagnosis and repair

**The previous phase's diagnosis was imprecise and is corrected here.** It reported that "the
finalizer reuses the release identifier for materially different content", implying a missing
guard. The guard exists and is correct: `finalize-regulatory-release.ts` is an idempotent no-op
when it reproduces the stored manifest and an explicit refusal when it would not.

**Its scope is one database.** The check reads `regulatory_releases.manifestChecksum` from the
database it is connected to, so in a fresh database `priorRecordCount` is 0, the guard does not
engage, and the script mints its default identifier over whatever the corpus holds. That is how
`federal-core-2026-07-30.1` named three artifacts across three disposable databases — 35 records
(`14a34fea…`), 64 (`156a6c87…`), 72 (`702339e5…`). No guard was bypassed and nothing was rewritten;
the identifier was simply not bound to a manifest anywhere that survives a database.

**The repair uses the mechanism the architecture already defines**, not a new one. KG-5B release
definitions are version-controlled and may pin `expectedManifestChecksum`, which it defines as "a
VERIFICATION, never an input — the builder REFUSES if a pin disagrees". `prepareGovernedRelease`
already honours that pin; the seed finalizer did not, because it predates definitions. New module
`backend/src/standards/releases/release-identity.ts`
(SHA-256 `19e6f682bf47fa3c39e8749d6fa24c2c9f29cd73bdc03a6893be29cf3e0779d7`) is the missing half of
an existing contract, applied by the finalizer in one call.

**Failing test written first**:
`backend/src/standards/tests/release-identity-immutability.ts`
(SHA-256 `cb7f71f2f177536928a73860b9fd1ecdf1d75f5b355c09e1648d8712df9f95c9`), registered as the 37th
suite of `npm run test:hazlenz-core` and as `npm run test:release-identity-immutability` —
**8 checks, all passing.**

| requirement | how it is met |
|---|---|
| an existing finalized id never silently acquires different content | the pin is checked in every environment, before any write |
| materially different manifests require materially different identities | refusal names the pinned manifest and directs the operator to a new identity |
| identical manifest reproduces deterministically | unchanged: idempotent no-op, measured |
| different manifest under an existing id fails closed | **measured: exit code 1, nothing written** |
| historical artifacts immutable | `federal-core-2026-07-30.1` still pins `14a34fea…` at 35 members, asserted by the gate |
| existing inspection provenance stays valid | no identifier renamed, no historical definition edited |
| production not mutated | no production connection was opened |

### The one exemption, and why it is not a weakening

Wiring the guard broke `test:release-integrity-and-approval`, which finalizes synthetic fixture
releases (`kg3a-release.A`) over deliberately fabricated corpora **in order to prove the integrity
machinery refuses what it should**. Requiring a version-controlled definition for those fixtures
would make the guard disable the tests protecting the same invariant.

The fix composes with the KG-4C ownership marker exactly as the legacy-corpus guard already does:
an **unregistered** identifier is permitted **only** in a database carrying an ownership marker
written INTO it by a suite that claimed it — which production can never carry. A **registered**
identifier whose pinned manifest disagrees is refused **everywhere, ownership or not**, because no
fixture needs to re-point a real release identity. Both branches are asserted by the gate, so the
exemption cannot quietly widen.

## 3. Phase 3 — the reviewer acceptance rubric

Written before any approve operation. Full text in `REVIEWER_LEDGER.json`.

| axis | question |
|---|---|
| **A. Regulatory identity** | correct CFR title, part, section, paragraph/subparagraph, jurisdiction |
| **B. Source integrity** | the source reference resolves to the captured authoritative provision; retrieval metadata present; source evidence checksummed |
| **C. Summary fidelity** | accurate to the cited provision; does not broaden or narrow it; does not convert a conditional requirement into an unconditional one; does not omit a qualification essential to applicability; introduces no obligation absent from the provision |
| **D. Applicability** | hazard-family mapping defensible; regime correct; sibling-paragraph interaction represented; OSHA not treated as MSHA authority; construction and general-industry distinctions preserved |
| **E. Governance and schema** | provenance populated, checksum valid, no duplicate regulatory identity, no conflicting record, schema valid |

Dispositions: `APPROVE`, `REJECT_CORRECTION_REQUIRED`, `ESCALATE_INTERPRETATION_REQUIRED`,
`OUT_OF_SCOPE`. **No blanket disposition was used.**

## 4. Phase 4 — all 72 records reviewed

The 35 pre-existing records were **not** assumed correct. Source evidence was obtained for every
record: 37 sections from the acquisition phase plus **33 further sections retrieved from the eCFR
versioner API** for the pre-existing records, all HTTP 200. 70 sections total.

```
reviewed: 72
APPROVE:  64
REJECT_CORRECTION_REQUIRED: 8
ESCALATE_INTERPRETATION_REQUIRED: 0
OUT_OF_SCOPE: 0
```

### The 8 rejections — all in PRE-EXISTING records, none in the 37 acquired this week

| citation | rubric | defect |
|---|---|---|
| `30 CFR 57.14107(a)` | C | omits 57.14107(b), the seven-foot exemption — the very limit its sibling record for 56.14107(a) names explicitly. A reader shown (a) alone concludes guarding is always required. |
| `30 CFR 56.14105` | C | **materially narrows the rule.** The regulation requires repairs to be performed only after power is off and the equipment blocked, unconditionally, with a narrow adjustment/testing exception. The summary conditions the duty on miners being "exposed to hazardous motion" and drops the exception. |
| `1910.219` | C | **materially broadens the rule.** A one-line summary omits the section's own scope exemptions at (a)(1), which exclude enumerated small and slow-moving belts. |
| `29 CFR 1910.132(a)` | C | **the summary is not a statement of the provision at all** — it is HazLenz's own selection heuristic ("may be relevant when an active operational hazard is present, requiring qualified review of body part exposure…"). |
| `29 CFR 1926.95(a)` | C | same defect |
| `30 CFR 56.15006` | C | same defect |
| `29 CFR 1926.602(a)(9)(ii)` | C | same defect |
| `30 CFR 56.9100(a)` | C | same defect |

The heuristic-prose class matters more than it looks: the projection derives
`standards_master.standardText` **from** `plainLanguageSummary`, so those five records would have
shown a customer engine prose where the regulation's content belongs.

**Independent corroboration:** the 8 rejected records are exactly the 8 records in the corpus
lacking `sourceUrl`/`retrievalDate` provenance. Two independent rubric axes selected the same set.

## 5. Phase 5 — why the rejected records were excluded rather than edited

The KG architecture forbids the in-place correction the phase contemplates, and this was verified
rather than assumed: `npm run release -- prepare --release-id federal-core-2026-07-30.1` still
computes `14a34fea…` from the current source arrays, because membership is explicit. Editing any
of those 35 records' content would change that manifest and break the pin that makes the
historical release self-checking and reproducible.

So the smallest correction consistent with the governing data model is **supersession, not
mutation**: the 8 stay in the source set (which is what keeps the historical release reproducible)
and are simply **not members** of the new release. Correcting their summaries is follow-on work
that will produce a further release identity, and it must not be done by editing the records the
pinned 35-record release reproduces from.

**No record was silently modified during review.** No record reached approval without passing the
rubric.

## 6. Phases 6-7 — controlled approval and reviewer identity

All 64 approvals went through `npm run review:release-record -- approve` **one record at a time,
each with its own `--expected-checksum`**. No bulk path, no alternate path, no HTTP endpoint added.

```
approval decisions recorded : 64
distinct record checksums   : 64   (one explicit reviewed checksum per approval)
effectiveReviewState        : reviewer_approved on 64/64
decisions carrying a timestamp: 64/64
```

Full log: `APPROVAL_DECISIONS.json`.

### Reviewer identity — stated honestly

```
reviewerId   : insite-product-owner-authorized-regulatory-content-review
reviewerRole : regulatory-content-reviewer (non-attorney, non-agency)
```

The authorization basis is the product owner's directive for this phase. **No attorney review, no
OSHA or MSHA review, no government approval, and no PE, CIH or CSP review is claimed or implied,
because none occurred.** The role string says so on its face so that anyone reading the audit
record later cannot mistake what it represents.

**A successful command is not the evidence.** `REVIEWER_LEDGER.json` carries the per-record
rationale, and the 8 rejections are what demonstrate the review was substantive rather than
ceremonial.

## 7. Phase 8 — the immutable candidate release

`backend/src/standards/releases/definitions/federal-core-2026-08-28.1.json`
(SHA-256 `64192865209068e4956ab4ae8c7d7ec6260742cdc6479bc36f615b432cb49da1`)

| field | value |
|---|---|
| release id | **`federal-core-2026-08-28.1`** |
| release version | `2026-08-28.1` |
| predecessor | `federal-core-2026-07-30.1` |
| members / approved | **64 / 64** |
| manifest checksum | **`680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb`** |
| jurisdictions | OSHA general industry, OSHA construction, MSHA |
| reviewer ledger | `verification/insite-v1-reviewer-governance-2026-08-28/REVIEWER_LEDGER.json` |
| status | `provisional` — **not activated anywhere** |

```
RELEASE_REPRODUCIBLE                = TRUE   (two clean disposable databases, identical manifest,
                                              reproducedPinnedManifest: true both times)
SAME_RELEASE_ID_SAME_MANIFEST       = TRUE   (re-prepare -> idempotent_no_op)
DIFFERENT_MANIFEST_SAME_RELEASE_ID  = REJECTED
```

The rejection was measured on both identities: finalizing the 72-row corpus under the 64-member
`federal-core-2026-08-28.1` was refused with exit code 1 and nothing written, and the same refusal
protects `federal-core-2026-07-30.1`.

## 8. Phases 9-10 — non-activation and candidate validation

**Production was not activated, not migrated, not pointed at anything.** Validation ran entirely in
disposable databases. `npx ts-node` candidate validation — **11 checks, 0 failures**:

* release materializes with 64 records and reproduces the pinned manifest;
* approved status persists across a reconnect (64/64);
* source identity persists on every release record, and the approval contract's
  `sourceIdentityDigest` persists on 64/64;
* jurisdiction metadata persists on 64/64;
* a retrievable `source_url` exists for every approved corpus row (64/64);
* the release holds exactly the 64 approved records;
* **no rejected record resolves as `APPROVED_GOVERNED_CONTENT`**;
* an approved governed record *can* resolve `APPROVED_GOVERNED_CONTENT`, so the check is not vacuous;
* `standards_master` retains all 72 source records, unmutated by the release.

## 9. Phases 11-12 — hazard floor and the carried-forward defect

The hazard floor is unchanged (§1). The standards-review operation altered no hazard behaviour.

**The unresolved-jurisdiction ranking defect is carried forward unrepaired, as instructed**: 4/5
obvious unresolved cases recovered, pinned-jurisdiction behaviour sound, **0 wrong-jurisdiction
candidates in pinned runs**, the remaining LOTO miss caused by ranking rather than admission, and
one administrative false positive. It is to be evaluated against the reviewed corpus during
finding-level integration, where customer behaviour is observable.

## 10. Phase 14 — regression

| suite | result |
|---|---|
| `npm run test:hazlenz-core` | **37/37 PASS**, unrelaxed |
| `npx tsc --noEmit` | clean |
| `test:release-identity-immutability` (new) | PASS, 8 checks |
| `test:hazlenz-precision` / `-level1-recall` / `-actionable-coverage` / `-standards-jurisdiction` / `-source-authority` | PASS |
| `test:kg5b-release-construction` | **102/102** |
| `test:regulatory-release-lifecycle` | PASS |
| `test:release-integrity-and-approval` | PASS |
| `golden-standards-tests` | 15/15 against the reviewed release database |
| `standard-applicability-regression`, `hazlenz-generalization-regression`, `validate-safescope-multi-hazard-decomposition-v1` | PASS |

**NEW_REGRESSION: none.** The four known failures are byte-identical to the prior accepted state.

One stale assertion was corrected, not relaxed: `test:kg5b-release-construction` pinned "a corpus
of exactly the governed records is seedable" to the literal `governedRows === 35`. The property it
protects is `foreignRows === 0`, which passed throughout; the literal made it fail on any
authorized growth of the governed set. It now compares against the source set's own size, which is
true at any size — a strengthening.

Two governance suites initially failed on **unmet prerequisites**, not defects: they refused an
unclaimed database (the KG-4C guard working correctly) and needed a seeded corpus. Given a claimed,
seeded disposable database both pass.

**Still UNVERIFIED:** production legacy corpus behaviour (not reachable); the
`safescope_knowledge_chunks` retrieval path (0 rows in every available database); governed cutover
modes above `LEGACY` (not enabled, out of scope).

## 11. Phase 13 — finding-level integration contract

See `FINDING_LEVEL_INTEGRATION_CONTRACT.md`. Nothing was implemented;
`evidence-foundation.ts` is unmodified.

## 12. Expert readiness

Six blockers remain open. Expert HazLenz is not authorised and must never become the regulatory
source of truth.

```
EXPERT_HAZLENZ_IMPLEMENTED = FALSE
PROVIDER_CALLS_MADE        = 0
```
