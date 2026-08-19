# Frontend lint remediation

Replaced effect-driven authentication state initialization in `app/about/page.tsx` and `app/hazlenz/page.tsx` with lazy state initialization, removing two React effect/state-update errors without changing lint policy. The remaining 505 errors and 115 warnings include production-reachable typing and hook findings and remain a release blocker; no blanket suppressions were added.

