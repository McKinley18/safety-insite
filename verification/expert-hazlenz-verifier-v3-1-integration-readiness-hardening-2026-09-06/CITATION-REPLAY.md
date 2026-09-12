# §193 — Citation boundary replay over the persisted §192 outputs

**Diagnostic only. Zero provider calls. §192's historical admission results are immutable and were
not rewritten.** This is what the corrected boundary *would* have done.

## Result

```
executions replayed                      39
OLD_ADMISSION  ADMITTED                  39 / 39
NEW_ADMISSION  ADMITTED                  39 / 39
admission changed                         0
canonical citation violations             0
```

**The boundary refuses nothing in this cohort — including the two outputs that motivated §193.**

| execution | OLD | NEW | citation violations |
|---|---|---|---|
| FV-07 R1 | ADMITTED | ADMITTED | 0 |
| FV-07 R2 | ADMITTED | ADMITTED | 0 |
| FV-07 R3 | ADMITTED | ADMITTED | 0 |
| all other 36 | ADMITTED | ADMITTED | 0 |

## Why FV-07 is not refused

The authorization set the condition precisely: refuse FV-07 R1 and R3 **if and only if** those
outputs meet the actual canonical prohibited-citation definition. They do not. They assert a
regulatory requirement in prose — *"OSHA general industry requires… not exceeding 1/8 inch"* — with
no CFR-shaped citation string for `CITATION_SHAPED_PATTERN` to match.

Refusing them would have required a broader rule, and `CITATION-ENFORCEMENT-ANALYSIS.md` shows every
broader candidate either false-positives on behaviour the architecture wants (`\bregulat` hits FV-11
and FV-13 reasoning correctly about *absent* governed evidence) or refuses a verdict for naming the
jurisdiction it was given (`\bOSHA\b`, since the user prompt contains
`JURISDICTION: osha-general-industry`).

## What the zero-change result does and does not mean

**It does not mean the boundary is useless.** Proof-suite sections A and B show it refusing
`29 CFR 1910.212(a)(1)` in the rationale, in `proposedClarification.question`, in a
`challengeReason`, and inside `nominatedFact` — every one of which the **unchanged v3 boundary
admitted**. The hole was real and is now closed on the verifier path. No output in this particular
cohort happened to exercise it.

**It does mean §193 did not fix what it was convened to fix.** The gap FV-07 exposed is still open,
and the terminal says so.

## Negative-case coverage

Section C of the proof suite checks eleven categories of legitimate content that must **not** be
refused, all passing: measurements (`1/8 inch`), two-digit numbers followed by words (`24 months`),
dates (`12 March 2026`), pressures and durations (`0 bar`, `2 minutes`), percentages (`60%`),
factKeys containing digits, run identifiers (`replicate 3 block 2 sequence 14`), the word
*regulation* without a citation, the jurisdiction token itself, a standard named without CFR shape,
and `CFR` appearing far from any number.

That last one matters: the canonical pattern requires `\d{2}` adjacent to `CFR`, so prose mentioning
the CFR without citing a section is not caught. The boundary decides **citation shape**, not subject
matter.
