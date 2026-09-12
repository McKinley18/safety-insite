# §193 — Embedded NUL bytes: root cause

**Classification: `AUDIT_TOOLING_RELIABILITY`. Not a verifier defect, not scored against any verifier
gate.**

## Confirmed before modification

```
file:      backend/scripts/lib/expert-verifier-v2-v3-diff.ts
before:    d5405204afcabe14cdc68bff92987423df5acd5035cce68f5e4282579d201a99   20206 bytes
NUL bytes: 4
valid UTF-8 otherwise: yes
file(1):   "data"
grep:      returned NOTHING and exit 0 on patterns that were present
```

## The bytes were INTENTIONAL — and that changes the repair

They are not corruption. All four are a deliberate delimiter:

```ts
const keyOf = (op: DiffOp, line: string): string => `${op}<NUL>${line}`;   // byte 12734
…
unclassified.push(`UNCLASSIFIED_CHANGE: ${k.replace('<NUL>', ' ')}`);       // bytes 14032, 14125
stale.push(`STALE_CLASSIFICATION: ${k.replace('<NUL>', ' ')} (…)`);        // byte 14326
```

The design is sound: `expert-verifier-v2-v3-diff.ts` builds a composite map key from a diff operation
and a source line, and NUL is the one character guaranteed not to occur inside a line of prompt text,
so it cannot collide with content. **The intent was correct and is preserved.**

The defect is purely one of **encoding**: the author wrote the *literal control character* where the
source should have carried the two-character escape `\0`. The runtime string is identical either
way; only the bytes on disk differ.

## How they entered the file

**Not recoverable from repository evidence, and I will not guess further than the evidence supports.**
The file is untracked (`??` in `git status`) and has no history to inspect. What the bytes themselves
show is that the character was emitted directly into the source rather than escaped — the signature
of a tool or editor writing a raw U+0000 where a JavaScript escape was meant. That is as far as the
evidence goes.

## The repair

Four literal `U+0000` bytes replaced by the two-character escape `\0`. Nothing else in the file was
touched.

```
after:     ebc687252ee615a2df2603adacd66a07b0a660ac725f017678745756ecc4571d   20210 bytes  (+4)
NUL bytes: 0
file(1):   "Unicode text, UTF-8 text"
grep -c "export": 15   (previously: no output at all)
```

`\0` is a valid escape here — in both occurrences it is followed by `$` or `'`, never by a digit, so
there is no legacy-octal ambiguity.

## Semantics proven preserved, not asserted

`classifyInstructionDiff` was exercised on inputs that drive **both** `keyOf` call sites (the
actual-diff side and the declared-table side) and both `.replace` reporting paths, before and after:

```
BASELINE classify sha256  9e143e0c928d49de83db82d45bb41a1aa2e0f6ce92e462365420c8f5771c076d   BEFORE
BASELINE classify sha256  9e143e0c928d49de83db82d45bb41a1aa2e0f6ce92e462365420c8f5771c076d   AFTER
```

Identical. Proof-suite E.3 additionally asserts the `\0` escape is present in the source, so a
regression back to a literal control character fails visibly.

The existing §166 suite that imports this module — `test-expert-verifier-v3-binding-protocol.ts` —
was re-run after the repair: **49/49 PASS**.
