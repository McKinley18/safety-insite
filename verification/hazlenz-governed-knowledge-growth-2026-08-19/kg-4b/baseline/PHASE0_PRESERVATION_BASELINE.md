# KG-4B — Phase 0 preservation baseline

Captured: 2026-08-21T02:14:29Z

## Git
```
branch:  release/insite-rc-2026-08-18
HEAD:    5f050858227ca11cf90d2f6bf64148e70a018b64
match expected 5f050858…: YES
stashes: 4
tags:    23
status entries: 88
```

## Inherited manifests verified BEFORE any KG-4B edit
```
KG-4A changed files:        22/22 OK
unrelated frontend files:   18/18 OK
```

## Stashes (must remain identical)
```
stash@{0}: On main: hold corrective action routing patch
stash@{1}: On main: leftover hazlenz mechanism-confidence-corrective-action work after companion patch
stash@{2}: On antigravity/render-memory-standards-compression: scratch files before memory merge
stash@{3}: On antigravity/hazlenz-candidate-qa-promotion-plan: antigravity candidate QA WIP
```

## Tags (must remain identical)
```
checkpoint-pre-ui-consolidation-20260528-172809
checkpoint-pre-ui-consolidation-f699d98
checkpoint/pre-modularization-theme-consolidation-20260528-195809
checkpoint/shared-ui-primitives-auth-settings-complete-20260528
checkpoint/shared-ui-primitives-low-risk-pages-20260528
insite-hazlenz-verified-baseline-2026-08-19
insite-inspection-ui-verified-2026-08-19
insite-visual-acceptance-verified-2026-08-19
local-expanded-scoped-knowledge-regressions-20260527
local-msha-scoped-knowledge-retrieval-20260527
local-safescope-knowledge-scoring-checkpoint-20260527
production-standards-engine-live
release-critical-standards-coverage-local
safescope-ai-upgrade-prework-20260528-173000
safescope-brain-green-2026-06-01
safescope-production-classify-working-20260524
safescope-report-workflow-live
safescope-understanding-precision-green-001
safescope-v2-standards-ui-live
safety-insite-cleanup-2026-06-17
theme-overhaul-before-reset-verified
v1-backend-stable
v1.0-condition-engine-verified
```

## Environment at KG-4B start

### Pre-existing local processes (NOT to be disturbed)
```
pid=66330 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/ts-node src/main.ts
pid=37602 node dist/main.js 
pid=69535 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/nodemon src/main.ts
pid=71572 node /Users/mckinley/Desktop/Safety_InSite/backend/node_modules/.bin/nodemon src/main.ts
```

### Listening ports
```
postgres 15690 [::1]:5432
postgres 15690 127.0.0.1:5432
node 66330 *:4000
```

Port 4000 carries a pre-existing developer backend. KG-4B never uses port 4000.
PROHIBITED targets: `safescope`, `sentinel_dev`, `sentinel_safety`, and every prior-slice
evidence database except as a READ-ONLY `pg_dump` source.

### Databases present at KG-4B start:       56

---

## FINAL preservation (end of KG-4B)

```
HEAD:    5f050858227ca11cf90d2f6bf64148e70a018b64   (unchanged)
branch:  release/insite-rc-2026-08-18   (unchanged)
stashes: 4   (the four pre-existing stashes, untouched)
tags:    23   (unchanged)
commits ahead of origin: 0   (nothing committed)
```

### Inherited manifests, re-verified at the END of KG-4B
```
unrelated frontend files:  18/18 OK
KG-4A changed files:       17/22 OK  (see the note below)
KG-4B changed files:       14/14 OK
```

### KG-4A files intentionally extended by KG-4B

* `backend/src/standards/cutover/fallback-contract.ts`
* `backend/src/standards/cutover/governed-resolution.ts`
* `backend/src/standards/cutover/governed-cutover-context.ts`
* `backend/src/safescope-v2/safescope-v2.service.ts`
* `backend/package.json`

These are the five KG-4A files KG-4B deliberately extends (the shadow record collection, the
manifest checksum on the pin, the jurisdiction field, the applicability vocabulary, the
`customerVisible` fix, and eight script registrations). The other 17 KG-4A files are byte-identical,
and every KG-4A suite still passes.

### Protected gold set — read-only throughout
```
gold-set-script-v3.ts: 93184abc677cf7a50d5f9ac11c431714  (expected 93184abc677cf7a50d5f9ac11c4317)
```
