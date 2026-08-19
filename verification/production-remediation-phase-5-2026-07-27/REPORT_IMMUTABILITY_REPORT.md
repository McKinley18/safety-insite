# Report immutability report

Each generation creates a new version number and JSONB source snapshot. Generated versions are never updated with new content. On successful generation of a later version, the preceding generated version becomes `superseded` and links to the successor; its snapshot and object remain intact.

The browser gate amended and recompleted an inspection, generated version 2, and verified:

- version IDs differ
- storage-object IDs differ
- version 1 remains downloadable
- version 1 is `superseded`
- version 2 is `generated`
- both artifacts remain in PostgreSQL/private storage

Generator version: `safety-insite-pdf/1`.
