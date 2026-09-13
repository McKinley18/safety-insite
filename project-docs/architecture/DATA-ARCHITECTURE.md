# Data architecture

PostgreSQL through TypeORM, plus S3-compatible object storage for binary evidence and generated
reports. `TYPEORM_SYNCHRONIZE` is `false` in production and boot refuses to start if it is `true`:
schema changes arrive only as migrations, and `/health/ready` fails closed when required migrations
are absent.

## The workflow spine

```
organization → site → inspection → observation → finding → analysis → review → report
```

| concept | tables |
|---|---|
| tenancy and identity | `organization_memberships`, `workspace_invites`, `refresh_tokens`, `entitlement_grants`, `platform_support_grants` |
| inspection workflow | `audit_sessions`, `audit_entries`, `audit_entry_findings`, `audit_entry_attachments`, `observations`, `inspection_findings`, `inspection_assignments` |
| analysis | `hazlenz_analyses`, `expert_analysis_executions`, `safescope_reasoning_snapshots`, `safescope_supervisor_validations` |
| human review | `human_reviews`, `reviews`, `control_verifications`, `decision_governance_logs` |
| corrective action | `corrective_actions`, `corrective_action_templates`, `outcomes`, `tasks` |
| standards and regulation | `standards_master`, `hazard_standard_mappings`, `hazard_categories`, `classifications`, `classification_rules`, `classification_rule_versions`, `regulatory_releases`, `regulatory_release_records`, `regulatory_release_record_reviews` |
| governed knowledge | `safescope_knowledge_sources`, `safescope_knowledge_documents`, `safescope_knowledge_chunks`, `safescope_knowledge_ingestion_runs`, `safescope_knowledge_retrieval_logs`, `knowledge_release_events`, `reviewcore_knowledge_review_queue_records`, `reviewcore_knowledge_review_queue_audit_events` |
| reporting | `inspection_reports`, `inspection_report_versions`, `report_attachments`, `report_language_templates`, `legacy_report_quarantine` |
| storage | `storage_objects` |
| audit and feedback | `audit_logs`, `security_audit_events`, `safescope_audit_records`, `fix_feedback`, `standard_feedback`, `standard_match_feedback`, `classification_feedback` |

Table names carrying `safescope_` are **physical names created by applied migrations**. Their
TypeORM classes were renamed to `HazLenzKnowledge*` in §272 while the `@Entity()` decorators keep
the original table names verbatim, so the code reads correctly and no stored row moved. See the
[brand compatibility register](../current/BRAND-COMPATIBILITY-REGISTER.md).

## Analysis persistence

An analysis is persisted with its provenance: which producer authored it, against which candidate
identity, and with what execution record. Deterministic and Expert analyses coexist on one
observation as separate families rather than as versions of a single stream, so a currentness slot
exists per producer.

Human settlements are durable and are treated as more valuable than code: the rollback model
forbids destroying settlements in order to restore older code.

## Object storage

Evidence attachments and generated reports live in S3-compatible object storage (Cloudflare R2),
indexed by `storage_objects`. Objects are private — unsigned reads and bucket listing are refused,
and access is through authorised, time-limited requests. §269 verified this end to end against the
live bucket: upload, authorised download with checksum match, unsigned GET and LIST refused,
delete, and no residue.

## Lifecycle

Findings, analyses, reviews and reports accumulate rather than overwrite; report versions are
retained so an issued report remains reproducible. Backup posture and the rehearsed restore are in
[operations/BACKUP-AND-RESTORE.md](../operations/BACKUP-AND-RESTORE.md).
