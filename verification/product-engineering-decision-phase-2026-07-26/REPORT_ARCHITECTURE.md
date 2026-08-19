# Report architecture

## Decision

`Report` is an immutable, versioned generated artifact belonging to one completed inspection revision.

## Canonical fields

`id UUID`, `inspectionId UUID`, `organizationId UUID nullable`, `ownerUserId UUID nullable`, `version integer`, `status pending|generated|failed|archived`, `format pdf`, `sourceInspectionVersion integer`, `storageObjectKey`, `contentHash`, `generatedAt`, `generatedByUserId`, `failureCode`, `failureMessageSafe`, `createdAt`, `archivedAt`.

Unique constraint: `(inspectionId, sourceInspectionVersion, version)`. Ownership obeys the same XOR scope as the inspection and is server-derived.

## Generation behavior

- Pilot generation is synchronous with an explicit timeout and transaction boundary.
- Create `pending` metadata, render from an immutable inspection snapshot, store the object, then atomically mark `generated`.
- Failure marks `failed`; it never returns success or a downloadable ID.
- Retrying a failed generation with the same idempotency key resumes/reuses the record; intentional regeneration creates the next immutable version.
- Prior generated versions remain readable and are never silently replaced.
- If measured PDF latency/memory breaches the release budget, switch to a durable job queue before pilot rather than increasing request timeouts indefinitely.

## Storage and authorization

Metadata stays in PostgreSQL. PDF bytes use the private object-storage abstraction. Retrieval requires parent-scope authorization and returns a backend stream or a signed URL lasting at most 60 seconds. Raw keys/paths are never exposed.

## Context and alternatives

Mutable JSON reports, regeneration-on-read, and local-only documents were rejected because they cannot prove what users reviewed or issued. Database blobs simplify authorization but inflate backups. Asynchronous generation is operationally stronger but unnecessary until measurement proves it.

## Consequences

Legacy report JSON may be retained as a source snapshot or quarantined, not treated as a generated report. Frontend report history lists immutable versions/status. Backend generation requires completed inspection, entitlement, idempotency, and authorization.

## Migration, tests, risks, deferred work

Build a new canonical report table or additive version columns only after mapping legacy fields. Test success, failure, timeout, retry, duplicate generation, versions, archive, cross-tenant access, file hash, and storage rollback. Template customization, non-PDF formats, and async workers are deferred.
