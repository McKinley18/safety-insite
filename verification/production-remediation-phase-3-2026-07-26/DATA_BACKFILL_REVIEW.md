# Data backfill review

The clone contains 5 users and 7 organizations. All 5 users have an organization ID, and each belongs to a different organization. There are no case-insensitive duplicate emails. The knowledge store contains 8 documents and 8 chunks.

This data does not answer:

- whether multiple users should collaborate within an organization;
- how individual users own sites;
- whether legacy knowledge data is global or tenant-owned;
- how local reports/inspections map to database rows;
- which report fields are authoritative.

No ownership was fabricated, no rows were quarantined or changed, and no backfill was attempted. A future migration must emit an exception table/report for every record whose owner cannot be proven.
