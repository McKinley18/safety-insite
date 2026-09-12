# Provenance chain — sealed candidate to reviewed corpus

Every stage, in order, with the hash that identifies it. Nothing earlier in the chain was
overwritten to produce anything later in it.

## 1. Frozen construction policy — before a single case existed

| | |
|---|---|
| file | `backend/scripts/lib/expert-semantic-augmentation-construction-policy.ts` |
| original hash | `2eff227febef2b36b5c8db65b1957564c101675299f03e0a9b3abd338ef94454` |
| effective hash | `c7dc1c682ccde56e54e4259632154b7ba364012e51d6c646e9173648355ebe4f` |
| record | `policy/POLICY-FREEZE.txt` |

The amendment was a TS1355 syntax fix with byte-identical rule text, recorded rather than
re-frozen silently. **Not modified by the review or the application pass.**

## 2. Original sealed candidate corpus

| | |
|---|---|
| identifier | `FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE` |
| manifest | `6a2c564c81c79acb5c267963f0b12483684a2a5ce8ad0173c9af663332b0dfdf` |
| truth keys | `1628f2e4a338a4a96b7eb4ee11acb4ac97963cae495ff5874913eed63d1b50f0` |
| provenance | `272cf02b369821524200615fb6703628adac4361e388245a80393caeae609574` |
| seal proof | `proofs/semantic-augmentation.txt` — preserved unmodified |

## 3. The packet the review was written against

| | |
|---|---|
| file | `review/SEMANTIC-REVIEW-PACKET.md` |
| hash | `29ec877ccf5fe2277b71a2aa09ee425d5d8d77c4cdbc893eaf9d9a53acba9c59` |

**Preserved unmodified.** Every verdict in stage 4 binds to this document.

## 4. Four independent product-owner verdict batches — 35 of 35 rows

| batch | rows | file |
|---|---|---|
| 1 | SEM-01 … SEM-09 | `HUMAN-REVIEW-VERDICTS-BATCH-1.md` |
| 2 | SEM-10 … SEM-18, plus the SEM-08 conflict resolution | `HUMAN-REVIEW-VERDICTS-BATCH-2.md` |
| 3 | SEM-19 … SEM-27 | `HUMAN-REVIEW-VERDICTS-BATCH-3.md` |
| 4 | SEM-28 … SEM-35, plus provisional confirmations and the manifest-order correction | `HUMAN-REVIEW-VERDICTS-BATCH-4.md` |

All four recorded verbatim and **not applied at the time of recording** — deliberately, so
corrections landed in controlled passes rather than churning the seal four times.

## 5. Owner-call supplements

| call | file | corpus effect |
|---|---|---|
| Open item 7b — five forbidden rationales tightened | `OWNER-CALL-OPEN-ITEM-7B.md` | provenance only |
| SEM-27 final adjudication | `OWNER-CALL-SEM-27.md` | truth key + provenance |
| SEM-27 negated/safe overlay retained | `OWNER-CALL-SEM-27.md` (adjudication section) | none — already in the ruled state |
| The application pass, open items 2–8 and all batch corrections | `OWNER-CALL-APPLICATION-PASS.md` | truth key + provenance |

### Intermediate seals, in order

| stage | manifest | truth keys | provenance |
|---|---|---|---|
| original seal | `6a2c564c…` | `1628f2e4…` | `272cf02b…` |
| after open item 7b | `6a2c564c…` | `1628f2e4…` | `7489d826…` |
| after SEM-27 | `6a2c564c…` | `e6875742…` | `d573798f…` |
| after the application pass | `6a2c564c…` | `2e4377ea…` | `16b76f48…` |

`manifestSha256` is byte-identical at every stage: no observation was ever edited and the array was
never reordered.

## 6. Fully applied reviewed corpus

| | |
|---|---|
| module | `backend/src/safescope-v2/expert-hazlenz/fixtures/semantic-augmentation-v1.ts` |
| hash | `a6c9a36f1d85db5fd25819f5fd1e764055cc486d85f226aa6c7a26388568a3fa` |
| array order | `SEM-01 … SEM-30, SEM-35, SEM-31 … SEM-34` — SEM-35 at index 30, verified |

## 7. Reviewed seal and its evidence

| artifact | hash |
|---|---|
| `corpus/SEAL.json` | `68c1e17536b4dc843c75d63dea5b0825a24eb9338dbcb3e2f4aa42cec8a7c3e6` |
| `proofs/semantic-augmentation-post-human-review-application.txt` | validator transcript, 35 passed / 2 failed |
| `review/SEMANTIC-REVIEW-PACKET-POST-HUMAN-REVIEW.md` | `3da036a159ee94038cc5f94266ed63b087aea345fa2b87594f395c24052ad8d6` |
| validator | `ad98ca709466eb77a6bca5b615ec63ee5ce201d2fc6b39772882e33bafededcf` |

### Proof artifacts, all preserved

| proof | stage |
|---|---|
| `semantic-augmentation.txt` | original seal |
| `semantic-augmentation-open-item-7b-reseal.txt` | after 7b |
| `semantic-augmentation-sem27-adjudication-reseal.txt` | after SEM-27 |
| `semantic-augmentation-post-human-review-application.txt` | after the application pass |

## 8. Verification-phase model repair — §129

The blocker recorded at the end of stage 7 was classified by the product owner as a
`VERIFICATION_PHASE_MODEL_DEFECT`, not a corpus semantic failure, and the repair was authorized.
See `OWNER-CALL-VERIFICATION-PHASE-MODEL.md`.

| artifact | hash | note |
|---|---|---|
| `backend/scripts/lib/expert-semantic-augmentation-review-record.ts` | `427674f394e0c285a9a9757d9e2f0dd6bafc6fac45eb8b9fd9d6e45a45153e22` | new — phase model and authoritative review record |
| `backend/scripts/validate-semantic-augmentation.ts` | `288111c01410a38e3875d47e9ec1e985c20fb4387634f638a41433bfd0e4c495` | phase-aware; section F only. Was `ad98ca70…` |
| `backend/scripts/test-semantic-augmentation-phase-contract.ts` | `3a4dca43c83edf5ba91afbac623beaac806373f555b2213ee554ad81e75ca014` | new — 40-assertion regression |
| `corpus/SEAL.json` | `7f559c026ece73a25f871306841dc2e546ac511e67a98733866456fe4a56e0e4` | re-emitted with the reviewed lifecycle status. Was `68c1e175…` |
| `review/OWNER-CALL-VERIFICATION-PHASE-MODEL.md` | `87f273fc504098fc2f2198cd750e66645fa34b54127b654e8ac9b1e9a4600040` | new — the owner call and the repair record |
| `backend/scripts/lib/expert-semantic-augmentation-construction-policy.ts` | `c7dc1c682ccde56e54e4259632154b7ba364012e51d6c646e9173648355ebe4f` | **unchanged** — identical to the POLICY-FREEZE effective hash |
| corpus module | `a6c9a36f1d85db5fd25819f5fd1e764055cc486d85f226aa6c7a26388568a3fa` | **unchanged** — row truth was not touched |

| stage | manifest | truth keys | provenance |
|---|---|---|---|
| after the application pass | `6a2c564c…` | `2e4377ea…` | `16b76f48…` |
| after the phase-model repair | `6a2c564c…` | `2e4377ea…` | `16b76f48…` |

All three corpus hashes are byte-identical across the repair. The operation changed the verification
surface and the seal's lifecycle metadata; it changed no row.

### Proof artifacts added

| proof | hash | what it establishes |
|---|---|---|
| `semantic-augmentation-post-human-review-validation.txt` | `a5187ba157b5d9b3229c587720e579f4862a6f08b3dda35f6468208936a26108` | 46 passed / 0 failed under `POST_HUMAN_REVIEW`, exit 0 |
| `semantic-augmentation-phase-contract-regression.txt` | `776606f5b521fdf9c8953c454638e4d43df42d1fecc9040b8099e6223adb4494` | 40 passed / 0 failed; `PRE_REVIEW_CANDIDATE` still enforces 26 / 14 |
| `semantic-augmentation-pre-review-target-preservation.txt` | `4a3a109822f6a52b435fe70f68de012d162e5ab70c94771eef55ddd8a25e8426` | the reviewed corpus still FAILS F.1 (22 ≥ 26) and F.2 (12 ≥ 14) under `PRE_REVIEW_CANDIDATE`, exit 1 |

The four earlier proof transcripts are preserved unmodified, including
`semantic-augmentation-post-human-review-application.txt` (`eea5267566cd9fa9a4bc29b694b8640efc483dae63b8cf25eb72a6d77def34f6`),
which records the 35-passed / 2-failed run that identified the defect.

## Status at the end of the chain

The corpus is **REVIEWED — human adjudication complete, sealed, formal evaluation unspent**. The
independent product-owner safety review is complete for all 35 rows and every recorded adjudication
has been applied. `FORMAL_COHORT_SPENT = FALSE`, `PROVIDER_INVOCATION_COUNT = 0`,
`RESERVED_MATERIAL_OPENED = FALSE`, `P4_PRESPEND_AUTHORIZATION = FALSE`.

The stage-7 blocker is **resolved by the §129 phase model, not by relaxation**. Under
`POST_HUMAN_REVIEW` every gate passes, including the frozen-minimum gates — 25 countable
clarification cases against 20, and 17 countable interaction cases against 10. Under
`PRE_REVIEW_CANDIDATE` the candidate-authoring targets are still 26 and 14, are still enforced, and
still reject this corpus.

**The formal evaluation cohort is still NOT authorized.** Reviewed truth is not evaluation
authorization; that decision belongs to the product owner.
