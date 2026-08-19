# Local-storage remediation

Canonical server API types now include persisted report metadata/download addressing, and the canonical browser gate proves database state independently of browser cache.

However, active legacy paths still use local storage for report packages, evidence caches, calendar events, offline queues, inspection programs, and report editing. They were not silently rewritten in this phase because doing so requires coordinated product-flow changes.

Production rule remains:

- local storage may hold unsynced drafts/cache
- generated reports, finalized findings, actions, and tasks require server confirmation
- legacy local report/calendar UIs are a pilot blocker until visibly separated or migrated

Logout cleanup already includes many sensitive keys, but complete user/organization namespacing and conflict resolution remain open.
