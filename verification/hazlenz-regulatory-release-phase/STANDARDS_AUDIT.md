# Standards audit

## Finding

The previous eight-standard result was a disposable-fixture packaging limitation, not proof that the original database contained only eight standards.

Read-only measurements:

| Source | Total | Active | OSHA | MSHA | Text present | Source key present |
|---|---:|---:|---:|---:|---:|---:|
| Original `safescope` database | 19 | 19 | 13 | 6 | 19 | 14 |
| Disposable closure database | 8 | 8 | 7 | 1 | 8 | 0 |
| `STANDARDS_INTELLIGENCE_SEED` | 14 unique | 14 | 8 | 6 | summary-derived | 14 |

The intelligence-sync dry run reports:

- Original database: 14 updates, 0 inserts.
- Disposable closure database: 3 updates, 11 inserts.

Therefore the original database already contains the full 14-record intelligence release plus five starter standards. The disposable environment ran only `safescope-standards.seed.ts`, whose literal array contains eight records.

## Pipeline

1. `safescope-standards.seed.ts` installs the eight starter records.
2. `sync-standards-intelligence-to-master.ts` maps the reviewed intelligence release into `standards_master`.
3. `ApplicableStandardsService.hydrateStandardReferences` performs candidate-scoped lookup and hydrates text/source fields.
4. The production HazLenz service calls hydration before output shaping.

## Deficiencies

- The canonical seed command previously omitted the intelligence sync.
- `standards_master` has source key/name/type and authority tier, but no source URL, effective date, revision date, release checksum, or per-record checksum.
- Five original starter rows lack a source key.
- The 19-row release is not comprehensive federal coverage. It is the actual approved runtime release, not a claim of completeness.

## Correction

`seed:safescope-standards` now runs both the starter seed and the approved intelligence sync. This makes new disposable environments converge on 19 rows without modifying the original database.

No regulatory text or metadata was fabricated. Full effective-date/checksum governance remains a release blocker for a later authoritative-ingestion phase.
