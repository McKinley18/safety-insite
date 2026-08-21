# KG-4A Phase 10 — the fallback failure matrix

`npm run test:kg4a-governed-resolution` — **99/99**, against a disposable clone of the KG-3F corpus
with a release activated **inside the clone only**. Full run: `failure-mode-run.log`.

## Classification

| Failure mode | Backing state | Health | Class | `GOVERNED_WITH_FALLBACK` | `GOVERNED_STRICT` |
|---|---|---|---|---|---|
| approved exact citation | `APPROVED_EXACT` | `OK` | `NONE` | verified text | verified text |
| no active release | `NO_ACTIVE_RELEASE` | `NO_ACTIVE_RELEASE` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| active release missing the citation | `NOT_IN_RELEASE` | `OK` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| unapproved record present | `UNAPPROVED_RECORD` | `OK` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| revoked approval | `UNAPPROVED_RECORD` | `OK` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| citation-only (approved, no text) | `APPROVED_NO_TEXT` | `OK` | `EXPECTED_FALLBACK` | citation-only | citation-only |
| section approved, paragraph absent | `APPROVED_SECTION_ONLY` | `OK` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| malformed release record (payload emptied) | `APPROVED_NO_TEXT` | `OK` | `EXPECTED_FALLBACK` | citation-only | citation-only |
| unresolvable citation string | `NOT_IN_RELEASE` | `OK` | `EXPECTED_FALLBACK` | legacy text | citation-only |
| resolver DB error / no data source | `RESOLVER_UNAVAILABLE` | `QUERY_FAILED` | **`INTEGRITY_FAILURE`** | legacy text | citation-only |
| **stale schema** (migration 1800000014000 not run) | `RESOLVER_UNAVAILABLE` | **`STALE_SCHEMA`** | **`INTEGRITY_FAILURE`** | legacy text | citation-only |
| pin lookup failed (governance outage) | `RESOLVER_UNAVAILABLE` | `QUERY_FAILED` | **`INTEGRITY_FAILURE`** | legacy text | citation-only |
| activation changes during request | pinned release unchanged | `OK` | `NONE` | unaffected | unaffected |

`LEGACY` and `SHADOW` are omitted from the two right-hand columns because they never consult the
resolver's finding at all — their `failureClass` is `NONE` in every row, which is the isolation those
modes exist to provide, and is asserted separately.

## Properties asserted for every mode

* **The resolver never throws.** Every failure is mapped onto a backing state the fallback table
  already has a row for, so **no raw 500 escapes for a condition the contract knows how to handle**.
* **Deterministic** — the same input yields the same backing and health across repeated calls.
* **`resolvedCitation === requestedCitation`** in every failure mode. No substitution, ever.
* **The citation survives** in every row.

## The three that fail closed on the *claim*, never on the response

* `RESOLVER_UNAVAILABLE` is deliberately distinct from `NOT_IN_RELEASE`: *"we do not know"* must never
  be reported as *"there is none"*. It supplies **no** governed backing input, so it cannot be
  laundered into an approval, and it is never provenance-eligible.
* **Stale schema fails loudly** — `STALE_SCHEMA`, with the reason naming migration `1800000014000` —
  while the customer still receives legacy behaviour. The KG-3F migration-order requirement is
  surfaced, not swallowed, and no NULL approval digest is silently written.
* **Revocation is immediate**: a revoked record stops being `APPROVED_EXACT`, carries **no text
  forward**, and is never presented as verified. Removing the revocation restores it.

## Database ownership (the KG-4A guardrail)

KG-3F destroyed a KG-3E verification database by running a mutating suite against a corpus another
suite depended on. This suite:

* creates its **own** `test_kg4a_resolution_run`, clones a **read-only** source into it, and drops it;
* **never imports `dotenv/config`**, so an ambient `DATABASE_URL` cannot redirect it — if one is
  present it is announced as *ignored*;
* refuses any `SOURCE_DB` that is not `test_*`;
* **proves the source unchanged afterwards**: record count identical, still no active release, no
  KG-4A fixture decision leaked in.
