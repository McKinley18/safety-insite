# Rollback plan

Stop deployment, preserve logs/audit evidence, route traffic to the prior known-good application image, and do not roll back database schema without an explicitly tested down/forward migration plan. Disable new HazLenz/report/upload entry points if needed while preserving read-only historical access. Restore from the latest verified database/storage backup only under incident authorization, then run the authenticated smoke and tenant-isolation checks before reopening traffic. A production rollback rehearsal is still required.
