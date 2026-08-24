# Operation 2 — governed release package push + remote verification

**Date:** 2026-08-21 · **Verdict:** `KG_RELEASE_PACKAGE_PUSHED — REMOTE_VERIFIED — DEPLOYMENT_NOT_AUTHORIZED — PRODUCTION_UNCHANGED`

**UNCOMMITTED EVIDENCE ARTIFACT.** Deliberately not staged and not committed: Operation 2 is
authorized to create no commit and to amend none of the six. A later authorized packaging operation
may reconcile persistent documentation state.

## Ref mutation

| | |
|---|---|
| Remote | `origin` → `https://github.com/McKinley18/safety-insite.git` (no credentials in URL) |
| Ref | `refs/heads/release/insite-rc-2026-08-18` |
| Before (live `ls-remote`) | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| After (live `ls-remote`) | `bd700640eeabb59c96afc96d5bd34de4e73662a1` |
| Kind | normal fast-forward, six commits, no force |
| Refs changed | **1 of 34** — verified by full `ls-remote` diff before/after |
| Tags pushed | **0** (24 remote tags, none moved) |
| `refs/heads/main` | `97941ca23c0be880395fe0d51ceb72ca22d8bfaa` — unchanged |

## Package identity on the remote (Git object proof, no rebuild)

| # | SHA | Tree |
|---|---|---|
| 1 | `21a8585d5b3dbd2c135a64f9c1f34d6220377133` | `aca89ab0e526a9b0a5d56da2ad0a46f0df23c359` |
| 2 | `b357599dd1664c8d4d8893b0760c8ce0777bba8e` | `6abd18de23f77d0690407ddf1dc731023b9e3bba` |
| 3 | `25f426f6a1356d6a5bc386f54887066ea3fc5aa0` | `dc672b1e22bc69e13a86407134a868084a95a2f3` |
| 4 | `17314dc3f369d599c2bd046c6c8bfcace68aa1b3` | `5d9f6cdab5dbac4a75de637930114a7f29a47f7a` |
| 5 | `38115da4342f337a4eca58c500f213c6e621e488` | `a381a2bb81831392d6fc7a5680d986d3c1bb9c76` |
| 6 | `bd700640eeabb59c96afc96d5bd34de4e73662a1` | `8e4e600f4f94a4c62307ee186fa82e7fd924b171` |

Immediate pre-package ancestor: `5f050858227ca11cf90d2f6bf64148e70a018b64`.
Every tree id equals the locally verified package. **No new implementation verification campaign was
run, and none is claimed** — Git transported existing, already-verified objects.

## Automation observed

* **Vercel — EXPECTED NON-PRODUCTION AUTOMATION.** `dpl_4SiWTo6XDH8KZRYJ3Rgp8Dtn4oZU`, commit
  `bd700640`, ref `release/insite-rc-2026-08-18`, **`target: null` (preview)**, state READY. The same
  branch's previous push (`5f050858`, 2026-08-19) produced the same `target: null` shape, so this is
  the branch's established preview behaviour, not a new consequence.
* **Vercel production target unchanged:** newest `target: "production"` deployment remains
  `dpl_3jN5LAB2fpFHvCUuejpwyEQ3QDqd`, commit `97941ca2`, ref `main`, 2026-08-18T02:14:00Z.
* **Render — no activity.** `safety-insite-backend` tracks branch `main` with
  `previews.generation: off`, so a release-branch push cannot reach it. Latest deploy still
  `live` on `97941ca23c0be880395fe0d51ceb72ca22d8bfaa`, finished 2026-08-18T02:15:28Z — identical to
  the KG-5D preflight fact.
* **GitHub Actions — no run.** The only workflow triggers on `workflow_dispatch` and
  `pull_request` to `main`; latest run in the repository is 2026-05-12.

## Production preservation

Live backend commit `97941ca2` · Vercel production `97941ca2` · `main` ref `97941ca2` — all unchanged.
No migration applied, no governed release created/finalized/activated/rolled back, no environment
variable changed, no production database contacted. SHADOW OFF, CUTOVER OFF.

**Stated limitation:** production environment variables were **not** re-measured in Operation 2 — the
installed Render CLI exposes no `env` command, and Phase 10 forbids unnecessary production access.
The claim rests on the KG-5D preflight (34 vars, **zero** `GOVERNED_CUTOVER_*`) plus the fact that
this operation's only remote mutation was a single Git ref.

## Worktree / protected work

32 worktree entries throughout; nothing staged, nothing committed, nothing amended. HEAD unchanged at
`bd700640`. 4 stashes · 23 local tag targets unchanged · gold set `93184abc677cf7a5…` unchanged.

**Recorded anomaly, classified, not caused by this operation.** Four files under the protected
`UNRELATED_FRONTEND_THEME_WORK` set — `app/command-center/page.tsx`, `app/globals.css`,
`components/command-center/WeekAtAGlancePanel.tsx`, `components/layout/AppShell.tsx` — were edited
concurrently by the user between the end of Operation 1 and this operation, and `globals.css` again
during it (mtimes 19:27–19:38; dark-mode CSS overrides and a fixed light theme for public account
pages; **0 KG tokens**). All four are **absent from all six commits**, so they were structurally
incapable of entering the push. The remaining 14 theme files are byte-identical to the
`kg-3e` baseline. The 4 changed files' hashes should be re-baselined by whichever operation next
owns theme work.
