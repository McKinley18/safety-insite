# Residual risks and stop conditions

| Risk | Evidence | Required next action | Pilot blocker |
|---|---|---|---|
| No canonical immutable report/storage implementation | Existing mutable report model and static file paths remain | Select/configure private S3-compatible provider and test service; implement report/file metadata and quarantine | Yes |
| Existing DB incompatible | 636 catalog differences, 0/24 history, dry run rejected | Complete operator ownership/report mapping, two-clone reconciliation, row conservation and restore drill | Yes |
| Local/legacy finalized paths remain | Report, calendar and evidence libraries still use local storage | Convert active screens to canonical APIs; label draft-only local state | Yes |
| Authorization matrix incomplete | Canonical paths pass; legacy/admin/global routes not exhaustive | Inventory and test every active route with A1/A2/B1/admin/support identities | Yes |
| Legacy corrective-action smoke broken | Constructor compile mismatch | Rewrite as a real disposable controller/database test without fake tenant identifiers | No, if canonical suite remains green; yes for final release gate |
| Dependency highs | Backend 3 high; frontend production 3 high | Analyze compatible Nest and Next dependency upgrades separately | Public production; pilot risk acceptance required |
| Missing knowledge tables in clean DB | HazLenz logged missing `safescope_knowledge_chunks` and used existing fallback behavior | Add canonical knowledge migrations or controlled global seed before pilot | Yes for defensible HazLenz operation |
| Platform pilot grant operations incomplete | Test grants work; audited pilot assignment command absent | Add audited platform-admin grant/revoke command with expiration | Yes |

