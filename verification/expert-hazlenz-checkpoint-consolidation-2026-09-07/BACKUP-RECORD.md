# Checkpoint consolidation — full local backup record

Date: 2026-09-07 · Slice: documentation / organization / preservation only ·
Provider calls = 0 · Database operations = 0 · No behavioral changes.

## Backup

| | |
|---|---|
| absolute source path | `/Users/mckinley/Desktop/Safety_InSite` |
| absolute backup path | `/Users/mckinley/Desktop/Safety_InSite_PRE_CONSOLIDATION_2026-09-07_150109` |
| method | `rsync -a` of the entire repository tree, **zero exclusions** — tracked files, untracked development files, all historical verification evidence, current worktree modifications (16 modified + 1 deleted pre-existing entries), §203 successor modules, documentation, scripts, `.git` history, `node_modules`, and build outputs all included |
| regular files | **91,714** (source) = **91,714** (backup) |
| total bytes | **9,135,604,705** (source) = **9,135,604,705** (backup), summed per-file via `stat`, not block-allocated size |
| content verification | full `rsync --checksum` re-comparison of every path (100,626 filesystem entries): **0 file-content differences**; the only 57 itemized lines are directory-mtime metadata (`.d..t....`), no `>f` lines |
| timing | copy completed and checksum-verified BEFORE any consolidation edit touched the repository; the pre-consolidation baseline manifest (`PRE-CONSOLIDATION-BASELINE.sha256`, 2,512 files) was also captured before any edit |

The backup destination is outside the active repository tree and is not to be modified. No cloud
upload was performed or authorized. Secrets posture unchanged: the backup contains exactly what the
repository already contained, nothing added.

## Restore note for future sessions

The backup represents the exact pre-consolidation state, including uncommitted intentional work
that git history alone would not reproduce. To compare any file: the backup path mirrors the
repository layout 1:1.
