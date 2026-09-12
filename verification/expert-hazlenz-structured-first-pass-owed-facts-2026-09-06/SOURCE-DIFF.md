# §196 — source diff

Every sha256 below was computed from the file on disk by the script that wrote this
document. `SOURCE-INTEGRITY.txt` recomputes the protocol identities independently.

## Files ADDED — six, all development-only, none reachable from production

| file | lines | sha256 |
|---|---|---|
| `backend/scripts/lib/expert-first-pass-instruction-vnext.ts` | 394 | `ec89b349d246e983cee9e8b9b07f693941ff9491e12a9eb9257ac73e287801ed` |
| `backend/scripts/lib/expert-first-pass-owed-fact-projection.ts` | 684 | `f5b602a00860628690723cec1b7050c123e883c6c58c04f0ec27faaae7c9b423` |
| `backend/scripts/lib/expert-governed-citation-reuse.ts` | 211 | `248d78831b77b875df750561bd56ce4494a2a4a7b38b3c8000832d9de1c4ec58` |
| `backend/scripts/lib/expert-verifier-contract-v3-3.ts` | 201 | `43497985c58cf8e7108e7132cccdab15f10485cc65a2d9cf025b67a1c948fd88` |
| `backend/scripts/test-196-structured-first-pass-owed-facts.ts` | 666 | `67ea52d14e51522af6b8f0211dd10d76e2c804355cc944a623e4264e5867af1d` |
| `backend/scripts/verify-196-source-integrity-2026-09-06.ts` | 171 | `587a0cd93f0387a1a934ee8a8109657a4b37c952823edc6e38923a166edb9ca3` |

- **`expert-first-pass-instruction-vnext.ts`** — the prospective first-pass vNext protocol: v15 plus one prompt block and two schema additions, built by construction and reversible
- **`expert-first-pass-owed-fact-projection.ts`** — the deterministic bridge: structured declaration to OwedFact, fail-closed, with the total field-provenance table as data
- **`expert-governed-citation-reuse.ts`** — the authorised supplied-source citation reuse rule and the admission matrix as data
- **`expert-verifier-contract-v3-3.ts`** — v3.3 admission: v3.2 plus that rule. Composes; mutates nothing. No v3.3 instruction exists
- **`test-196-structured-first-pass-owed-facts.ts`** — the A-O proof matrix plus the P-S preservation, carrier-independence, pattern-discipline and honesty cases
- **`verify-196-source-integrity-2026-09-06.ts`** — the source integrity gate

## Files MODIFIED — three, all additive

- **`backend/package.json`** — two script entries added: test:196-structured-owed-facts and verify:196-source-integrity. No other key touched.
- **`docs/INSITE_ENGINEERING_BLUEPRINT.md`** — one new section appended before FUTURE-SESSION BOOTSTRAP. No prior section edited.
- **`docs/INSITE_CURRENT_STATE.json`** — one new top-level key appended: expertHazlenzStructuredFirstPassOwedFacts2026_09_06. No prior key edited.

**No existing runtime file was modified.** The three modified files are a manifest and two
documents; none of them is production behaviour.

## Files DELIBERATELY UNCHANGED, with their current sha256

The projection writes *into* the owed-fact runtime contract and the v3.3 admission *composes*
over the verifier contracts. Neither edits what it builds on, which is what keeps §184, §187,
§192, §193, §194 and §195 attached to the code that produced them.

| file | sha256 |
|---|---|
| `backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts` | `bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694` |
| `backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts` | `456d736f2fb291cc405494b19e9380e82f5a2904b0c692ea02911374d6dc7e8a` |
| `backend/src/safescope-v2/expert-hazlenz/expert-normalization.ts` | `606dd1a7d468eecf00de773fd322f2018b00888dc18544c7894f4e5b0082d4ae` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts` | `102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts` | `4fe3319046281bdbc6e527aad04042fa3892e4b4117a5a9c2362141144ab3701` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts` | `e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/structural-questions.ts` | `cb6faef78455a693309a198b0378c606d9b812e1140e568b7995f9768aaf0519` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts` | `206895009d8b7e80d1f381e2dbb6fa26d5de02e2e1f8f862debac3800b86ff32` |
| `backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts` | `5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245` |
| `backend/scripts/lib/expert-verifier-contract-v3.ts` | `475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc` |
| `backend/scripts/lib/expert-verifier-contract-v3-2.ts` | `5ce73ab97ecdfa088390ac8d2abc6c2aab74f0dbce875f6cc4bc2aa307b1bfb2` |
| `backend/scripts/lib/expert-verifier-citation-boundary.ts` | `4a189c7edb3afc991f3c026fa67eb8b156e976467481e58e41a863f2e1c6b0e4` |
| `backend/scripts/lib/expert-verifier-instruction-v3.ts` | `db71ce6bc91bfd791b1ddedae06260b1230d67ead17dd4f4b49d89840559bc9f` |
| `backend/scripts/lib/expert-verifier-instruction-v3-1.ts` | `384823e2821f3da454e5093dcfc874ec7a1b925b3c676cdb971e0a9940ad73cb` |
| `backend/scripts/lib/expert-verifier-instruction-v3-2.ts` | `9ab0321212f9100f3c2eb4d6b0d4a8170ce93ed97f596430fb8a02ae554292e5` |

Four of these — `owed-fact.types.ts`, `owed-fact-ledger.ts`, `owed-fact-binding.ts` and
`verifier-v3-development-boundary.ts` — plus `expert-prompt.ts` are additionally asserted
against §187's pinned values by the integrity gate, and `expert-prompt.ts` again against
§195's frozen `PROTOCOL-HASHES.txt`. `structural-questions.ts`,
`governed-evidence-derivation.ts`, `expert-contract.types.ts` and `expert-normalization.ts`
carry no external pin; the hashes above are recorded so a later slice can detect a change.

## Verification directories

- **ADDED**: `verification/expert-hazlenz-structured-first-pass-owed-facts-2026-09-06/`
- **UNCHANGED**: `verification/expert-hazlenz-v3-2-end-to-end-validation-2026-09-06/` — every
  §195 file is byte-untouched, and each of its eleven absent execution artifacts is asserted
  still absent, file by file, by the §196 gate.

## Git

```
M backend/package.json
 M backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts
 M backend/src/safescope-v2/expert-hazlenz/expert-normalization.ts
 M backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts
 M docs/INSITE_CURRENT_STATE.json
 M docs/INSITE_ENGINEERING_BLUEPRINT.md
?? backend/scripts/lib/expert-first-pass-instruction-vnext.ts
?? backend/scripts/lib/expert-first-pass-owed-fact-projection.ts
?? backend/scripts/lib/expert-governed-citation-reuse.ts
?? backend/scripts/lib/expert-verifier-citation-boundary.ts
?? backend/scripts/lib/expert-verifier-contract-v3-2.ts
?? backend/scripts/lib/expert-verifier-contract-v3-3.ts
?? backend/scripts/lib/expert-verifier-contract-v3.ts
?? backend/scripts/lib/expert-verifier-instruction-v3-1.ts
?? backend/scripts/lib/expert-verifier-instruction-v3-2.ts
?? backend/scripts/lib/expert-verifier-instruction-v3.ts
?? backend/scripts/test-196-structured-first-pass-owed-facts.ts
?? backend/scripts/verify-196-source-integrity-2026-09-06.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/structural-questions.ts
?? backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts
?? verification/expert-hazlenz-structured-first-pass-owed-facts-2026-09-06/
?? verification/expert-hazlenz-v3-2-end-to-end-validation-2026-09-06/
```

**Read this listing carefully, because git alone does not establish what §196 changed.**

The Expert HazLenz programme has been running for many slices without committing, so most of
the files above are either untracked or already modified relative to `HEAD` by work that
predates §196. Specifically:

- `??` on the six §196 files and the §196 evidence directory — new and uncommitted, as
  expected. The §195 directory is `??` for the same reason and was already so before §196
  began.
- `??` on every `owed-facts/` module and every `scripts/lib/expert-verifier-*` file — these
  have never been committed. Git cannot show them as modified, so **their unchanged-ness is
  established by sha256, not by git**: the integrity gate asserts all four `owed-facts/`
  hashes against §187's pinned `owedFactSourceHashes`, and the v3 / v3.1 / v3.2 prompts,
  schemas and the v3 admission validator against §187's and §192's pinned values.
- ` M` on `expert-prompt.ts`, `expert-contract.types.ts` and `expert-normalization.ts` —
  **pre-existing uncommitted work from earlier slices. §196 edited none of them.** For
  `expert-prompt.ts` this is proven rather than asserted: its file sha256 and its
  `EXPERT_SYSTEM_PROMPT` sha256 both match §187's pinned values AND §195's frozen
  `PROTOCOL-HASHES.txt`, which is the identity that actually matters.
- ` M` on `backend/package.json`, `docs/INSITE_ENGINEERING_BLUEPRINT.md` and
  `docs/INSITE_CURRENT_STATE.json` — these also carry substantial pre-existing uncommitted
  work, which §196 preserved. Every §196 edit to the three is purely additive: two script
  entries, one appended blueprint section, one appended JSON key.

**NO COMMIT. NO PUSH. NO TAG. NO DEPLOY. NO BRANCH CREATED.**

