# §193 — Audit tooling repair

**Classification: `AUDIT_TOOLING_RELIABILITY`. Deliberately kept out of every verifier behavioural
score.**

## The failure mode that actually mattered

Removing four NUL bytes is trivial. The reason this was worth a slice is the *second-order* effect:

```
$ grep -n "export" backend/scripts/lib/expert-verifier-v2-v3-diff.ts
$ echo $?
0
```

No output, exit code **0**. That is byte-for-byte the same observable result as a file that genuinely
contains no matches. **A silent no-match is indistinguishable from a clean audit.** Any grep-driven
check over that file — a protected-pattern scan, a forbidden-string scan, a source-integrity audit —
would have reported clean while inspecting *nothing at all*.

This programme runs exactly those kinds of audits. That is the risk: not a corrupted file, but a
**verification that believes it verified something**.

## The rule adopted

> An audit that cannot actually read its target must fail **loudly** rather than return clean.

## `expert-source-audit-integrity.ts`

Four exports, all deliberately narrow — they decide **tooling readability**, never content, and are
never a semantic gate:

- `checkFileAuditability(path)` — reports `EMBEDDED_NUL_BYTE` and `NOT_VALID_UTF8` with a NUL count.
- `sweepAuditability(root)` — walks a tree for auditable extensions, skipping `node_modules`, `dist`,
  `build`, `.git`, `coverage`, `.next`.
- `grepAuditable(path, pattern)` — returns a **discriminated** outcome:
  `{ kind: 'SEARCHED', matches }` or `{ kind: 'UNAUDITABLE', failures }`. There is no code path by
  which an unreadable file yields zero matches. This is the whole point of the module.
- `assertTextuallyAuditable(path)` — throwing form, for an audit that must abort rather than report a
  false clean.

Proof-suite **F.4/F.5** are the assertions that matter: a genuine zero-match on a *readable* file
returns `SEARCHED` with an empty array, while an unreadable file returns `UNAUDITABLE` — so the two
outcomes that were previously identical are now distinguishable by construction.

## The sweep caught a real instance immediately — mine

On the proof suite's first run, `G.1` failed and named
`backend/scripts/test-expert-193-hardening.ts`. Building the NUL-bearing fixture, I had written a
literal control character into the test source — reproducing, in the test for the defect, the exact
defect under test.

It is recorded rather than quietly fixed because it is the best available evidence that the sweep
works on something nobody planted for it. The fixture now builds its NUL at runtime via
`String.fromCharCode(0)`, so the suite can detect NUL bytes without containing one.

Current sweep state:

```
backend/scripts                                   681 files scanned   clean
backend/src/safescope-v2/expert-hazlenz            43 files scanned   clean
```

## Deliberately not done

- **No repo-wide enforcement hook or CI gate.** §193 authorizes deterministic regression coverage,
  not a new enforcement surface across the repository.
- **No change to any existing audit script.** The new module is available for adoption; retrofitting
  callers is a separate, larger change and would have expanded this slice.
- **Nothing mixed into verifier scoring.** No §192 figure, gate or classification is touched by any
  of this.
