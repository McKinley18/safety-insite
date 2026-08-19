# Cross-tenant test results

Passed real-database smoke tests:

- Organization A corrective action create/list/update.
- Organization B cannot list or update A’s corrective action.
- Dashboard aggregates remain organization-scoped.

Not completed: the required A1/A2/B1 matrix across all protected resource types, nested identifiers, uploads, PDFs, snapshots, knowledge queues, subscriptions, searches and aggregates. Static file URLs remain accessible without record authorization once known.

Cross-tenant failures found: incomplete protection model for direct files and unproven tenant scope in several review/knowledge paths. Resolved in this phase: zero additional route families, because ownership semantics were not determinable without a product decision.
