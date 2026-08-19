# Lint baseline

Initial audit: 528 errors, 120 warnings. Current full run: 526 errors, 120 warnings. Modified frontend workflow scripts pass ESLint.

This phase did not disable rules or reformat the application. Critical hook, type-safety, accessibility and correctness debt remains in active pages, so the full lint command correctly fails.

Enforce now: modified files must pass targeted ESLint; production build must pass; repository lint must publish and compare the 526/120 debt count and fail on any increase. Next phase should reduce active-route errors by rule family, beginning with hooks, unsafe `any`, and image/accessibility defects.
