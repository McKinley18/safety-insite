# File storage and authorization

## Decision

Use an S3-compatible private object-storage abstraction for pilot and production. PostgreSQL stores metadata only. All access is authorized by the backend; short-lived signed GET URLs may be issued after authorization.

## Options considered

| Option | Decision |
|---|---|
| Ephemeral local disk | rejected; data loss on deploy |
| Render persistent disk | acceptable emergency pilot fallback but single-instance/backup/portability limitations |
| S3-compatible object storage | selected; durable, portable, private, lifecycle capable |
| PostgreSQL blobs | rejected; backup and database growth |

The exact provider is an external decision. The adapter must support AWS S3 semantics so provider choice does not affect the domain model.

## Classification

- Public: compiled application assets and explicitly published marketing assets only.
- Private: inspection evidence, report PDFs, avatars, organization logos, exports, and any user upload.

## File metadata

`FileAttachment(id, storageKey, originalName, detectedMimeType, sizeBytes, sha256, parentType, parentId, organizationId?, ownerUserId?, uploadedByUserId, status pending|active|quarantined|deleted, createdAt, deletedAt)`.

Scope is copied from and validated against the parent. Storage keys are random and never accepted from clients. Parent type is allowlisted. Orphan cleanup removes pending objects after 24 hours and deleted objects after the approved retention window.

## Access and security

- Authenticated download route validates parent access; foreign/unknown IDs return 404.
- Signed URL maximum lifetime: 60 seconds; no public bucket.
- Upload limits: JPEG/PNG/WebP up to 10 MB each; PDF up to 25 MB where explicitly allowed. SVG, HTML, executables, archives, and active formats rejected.
- Validate MIME, extension, signature, image decoding, dimensions, and filename normalization.
- `nosniff`; attachments use safe disposition. Approved images/PDFs may render inline with restrictive CSP.
- Malware scanning is required before public production; for a restricted pilot, signature/type validation plus quarantine and a provider malware-scanning integration plan is acceptable.

## Consequences and testing

Existing static `/uploads` becomes noncanonical and must not serve private data. Reports store object IDs, not paths. Test owner/same-org role/foreign/unauthenticated access, enumeration, traversal, spoofing, size, quarantine, signed expiry, parent archive, deletion, and orphan cleanup.

## Risks and deferred work

Provider/account, region, encryption key policy, legal residency, and retention are external decisions. CDN delivery and client direct-upload are deferred.
