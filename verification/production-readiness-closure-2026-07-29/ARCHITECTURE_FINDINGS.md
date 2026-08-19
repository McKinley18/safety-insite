# Architecture Findings

The canonical server path is PostgreSQL-backed `Site -> Inspection -> Observation -> HazLenzAnalysis -> HumanReview -> InspectionFinding -> CorrectiveAction/Task -> InspectionReportVersion -> StorageObject`.

The active inspection launcher now routes new work to `/inspection-workspace`, which uses that path. Older `/inspection`, `/inspection-quick`, `/inspection-cover`, and `/inspection-review` implementations remain in the repository as compatibility/legacy UI and retain substantial browser-storage logic. They must not be treated as the production source of truth.

Global taxonomy, knowledge, regulatory ingestion, reviewer-console, persistence, and feedback mutation routes now enforce role guards. The prior `@Roles` metadata was ineffective on several controllers because no `RolesGuard` was installed.

The original development database remains a legacy schema with zero migration history. Supported adoption is clean-target ETL with provenance, never insertion of fabricated migration records.
