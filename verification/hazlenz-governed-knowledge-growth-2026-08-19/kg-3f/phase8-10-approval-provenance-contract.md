# KG-3F Phases 8–10 — the approval / provenance contract

## The question KG-3E left open

KG-3E measured that editing `source_url` or `retrieval_date` did **not** change the reviewer-bound
checksum, and deliberately declined to rule on whether that was correct.

It was neither. It was **undecided**. Approval had no contract of its own: it reused
`recordChecksum`, which is the release **manifest** identity. The two answer different questions —

| identity | question it answers |
|---|---|
| `recordChecksum` (v1) | was this release tampered with? |
| approval digest (v2) | does this reviewer's decision still truthfully name this content? |

— and reusing one for the other meant the approval contract was whatever the manifest projection
happened to contain. That is how two field groups a reviewer's decision plainly depends on ended up
**outside** the binding:

* **granularity** (`part_number`, `subpart`) — a record could be re-scoped from general industry to
  construction with its approval intact;
* **force** (`deprecation_status`, `superseded_by_citation`, `effective_date`, `revision_date`) — a
  record could be marked *superseded* and still read as reviewer-approved authority.

Meanwhile `keywords` was inside the binding by accident rather than by decision.

## The decision: Option 2 — two digests, composed into one versioned approval digest

```
substantiveContentDigest   the regulatory obligation itself
sourceIdentityDigest       the authoritative artifact/edition it was drawn from
approvalDigest             canonicalDigest(version + both) — what an approval names
```

A single digest can say *something changed*; it cannot say **what kind** of thing changed, and the
two kinds have different remedies. A revised regulation needs a fresh legal reading. A record
re-derived from a different authoritative edition may still be legally correct but no longer matches
the provenance that was attested. Collapsing both into one opaque hash forces every provenance
correction through a full regulatory re-review — the pressure that produces bulk rubber-stamping.

### Axis A — substantive regulatory artifact (changes MUST invalidate)

`agency` · `citation` · `part_number` · `subpart` · `title` · `standard_text` ·
`plain_language_summary` · `scope_code` · `hazard_codes` · `required_controls` · `keywords` ·
`severity_weight` · `is_active` · `effective_date` · `revision_date` · `deprecation_status` ·
`superseded_by_citation` · `applicability_schema_version`

`keywords` is **retained deliberately, not inherited**. The argument for excluding it is real — a
reviewer approves regulation, not a synonym list. It stays in because KG-3F Phase 4 *measured* that
keywords are not cosmetic: adding `keywords` to the scoring SELECT moved 1926.1153 from 15 to 51 and
changed which citation was emitted for a silica finding. A record whose keywords changed can be
surfaced against materially different hazards than the one the reviewer approved.

### Axis B — authoritative source identity (changes MUST invalidate)

`source_key` · `source_name` · `source_type` · `authority_tier` · `allowed_use` ·
`source_publication_date` · `source_document_checksum` · `transformation_version`

**The URL is not here, and that is the point.** `source_url` is one retrieval path to an artifact;
it is not the artifact. eCFR serves 29 CFR 1910.212 from several paths, and the govinfo mirror
serves identical codified text under a different host. If the URL carried identity, every mirror
migration would invalidate the whole corpus's approvals. What *does* carry identity is the registry
key, the issuing authority, the dataset family, the codification edition, and decisively
`source_document_checksum` — a hash of the fetched artifact. If a different URL yields a different
document, the checksum moves and approval falls. If it yields the same document, nothing moved.

### Axis C — retrieval / transport metadata (excluded from both, by decision)

`source_url` · `retrieval_date` · `created_at` · `updated_at`

These describe **how a copy was obtained**, not **what was obtained**. Making them
approval-material would mean routine re-crawls silently revoked regulatory approvals corpus-wide — a
governance mechanism that fires constantly for no regulatory reason trains its operators to bypass
it. The safety argument is discharged better by `source_document_checksum` (Axis B), which detects a
re-fetch that returned *different* content — the only case where a retrieval event has regulatory
meaning.

## The contract test matrix — `npm run test:approval-contract` → **57/57**

| # | change | verdict | axis |
|---|---|---|---|
| 1 | regulatory text | BECOME_INEFFECTIVE | substantive |
| 2 | title | BECOME_INEFFECTIVE | substantive |
| 3 | canonical citation | BECOME_INEFFECTIVE | substantive |
| 4 | **paragraph granularity (part/subpart)** | BECOME_INEFFECTIVE | substantive — **defect fixed** |
| 5 | jurisdiction | BECOME_INEFFECTIVE | substantive |
| 6 | source document checksum + edition | BECOME_INEFFECTIVE | source identity |
| 7 | source registry key | BECOME_INEFFECTIVE | source identity |
| 8 | equivalent authoritative URL | **REMAIN_EFFECTIVE** | none |
| 9 | retrieval date only | **REMAIN_EFFECTIVE** | none |
| 10 | irrelevant transport metadata | **REMAIN_EFFECTIVE** | none |

Transport exclusion is asserted **by construction, not by equality** — the fields are absent from
both projections, so a passing result cannot be an accident of the fixture.

## A defect the matrix caught on its first run

`DB-2` — *every stored approval digest recomputes from its frozen payload alone* — **failed on all
34 records**.

The manifest's `digest()` is `sha256(JSON.stringify(value))`, which depends on key insertion order.
That is safe for v1, because a manifest is only ever recomputed from freshly-projected rows in one
order. The approval contract has a harder requirement: an approval must be re-verifiable forever
from the frozen `approvalPayload` alone — and that payload round-trips through a `jsonb` column,
which **does not preserve key order**. Postgres re-orders jsonb keys on write, so a payload read
back and re-stringified produced a different sha256 from the one stored beside it.

Fixed with `canonicalDigest()`, which sorts keys recursively before hashing, making the digest a
function of the content. `digest()` in `release-manifest.ts` is left untouched — changing it would
move every finalized release's manifest checksum.

## Historical approval safety — nothing was rewritten

Every new column is **nullable, and NULL is load-bearing**: it means *this record predates the
approval contract*.

Existing snapshot rows **cannot** be backfilled, and deliberately are not. The frozen `payload` holds
the v1 projection, which never contained `part_number`, `deprecation_status` or
`source_document_checksum`. The digest could be recomputed from the live `standards_master`, but that
table is mutable and may have drifted since finalization — the result would attest a reviewer to
content they may never have seen. That is precisely the stale-approval failure the subsystem exists
to prevent.

So v1 approvals remain true statements about what a reviewer decided, are never reinterpreted, and
are surfaced by `describeContractReaffirmationCandidates()` as an explicit worklist. Reaffirmation is
an ordinary `approveRecord` carrying `supersedesDecisionId`: it **appends** a decision and points at
the one it supersedes. **There is no bulk approval path.**

Measured: `DB-11` reaffirmation took the decision log 1 → 3 rows and deleted none; `DB-10` confirms
enumerating a candidate does not mutate, reinterpret or upgrade the historical decision.

## A second defect the contract exposed: carry-forward matched the wrong digest

`describeCarryForwardCandidates()` matched on `recordChecksum` to decide two releases held
"identical content". The manifest projection omits granularity and deprecation status, so two records
could share a `recordChecksum` while differing in paragraph granularity, or while one had been marked
superseded upstream — and this surface would have offered such a record as a carry-forward candidate
on the strength of a digest that never looked at the fields that changed.

Matching now runs on `approvalDigest`, and `matchBasis` reports which binding established the match.

## New capability: live-corpus drift detection

The release snapshot is immutable, so within a release nothing can drift. `standards_master` is not
immutable, and it is what retrieval actually reads. `describeLiveCorpusDrift()` compares what was
approved against what is live and **reports the axis that moved**, so a provenance correction is
never mistaken for a regulatory revision.

| measured | result |
|---|---|
| `DB-15` live `source_url` + `retrieval_date` edited | **no drift** — the KG-3E observation, now an intended and tested property |
| `DB-16` live `subpart` edited | `BECOME_INEFFECTIVE` / `substantive_content` — **the change the manifest checksum cannot see** |
| `DB-17` live `source_key` edited | `BECOME_INEFFECTIVE` / `source_identity` — attributed to the other axis |

## Manifest identity preserved — proven, not asserted

Finalizing a clean seeded database reproduces
`bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2` — **byte-identical to the value
KG-3A/3B/3C/3E recorded**. The v1 field set is asserted verbatim in the matrix (`V1-2`). The approval
contract is a second, parallel identity; it did not disturb the first.

## Migration

`1800000014000-ApprovalProvenanceContract` — additive and reversible. Adds five nullable columns to
`regulatory_release_records`, five to `regulatory_release_record_reviews`, and two indexes. No
customer retrieval path reads any of them.

**Operational note:** the finalizer now writes the approval identity unconditionally, so this
migration must be applied before `seed:safescope-standards` on any database. Failing loudly is
intentional — silently skipping the approval identity would produce records with NULL digests
indistinguishable from genuinely pre-contract records, which is the exact ambiguity the NULL
semantics exist to avoid.
