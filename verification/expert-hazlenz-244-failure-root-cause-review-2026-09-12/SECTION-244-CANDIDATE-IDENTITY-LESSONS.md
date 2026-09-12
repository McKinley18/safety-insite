# §244 — Candidate Identity Lessons

Zero provider calls.

## What the frozen candidate identity binds today

The successor candidate digest is a hash over prior-section digests, the 29-module protected
composite, ladder and suite results, consistency results and evidence integrity. In other words:
**source bytes and test outcomes.**

## What it does not bind

The assembled provider request. Specifically: the tool-level strict flag, `tool_choice`, the thinking
setting, the first-pass and verifier token limits, the model identifier, the endpoint, and which
system prompt and wire schema the caller actually assembles.

§243's pre-spend record did capture a per-case system-prompt, user-prompt and wire-schema digest
before transmission, which is the right instinct. But those digests sit beside the candidate rather
than inside it, and the request envelope was never hashed anywhere at all.

## Why that is load-bearing and not bookkeeping

§243 demonstrates it twice over.

First, the same 29 modules produce materially different reliability depending on the caller. The
production builder asks the provider to enforce the schema; the acceptance executor does not. Five of
fifteen structural failures sit on that difference.

Second, and more seriously, **no file under `src/` imports any of the experiment posture contracts.**
The candidate that §243 measured has no production caller. The thing accepted or rejected is not the
thing the product currently ships. A candidate identity built from module bytes cannot detect that,
because the modules are identical in both worlds; what differs is whether anything calls them.

The programme already knew the principle. The §138 and §139 record states that an experiment which
cannot prove its own configuration cannot serve as anyone's baseline, and responded by hashing the
prompt and the schema. The hashing stopped one layer short of the request.

## Recommended expansion

A future frozen candidate identity should bind, in addition to what it binds today:

| Element | Why |
|---|---|
| model identifier and endpoint | a different model is a different candidate |
| tool-level strict flag, `tool_choice`, thinking setting | each materially changes what the provider will return |
| first-pass and verifier max-token limits | truncation is a measured failure mode |
| the assembled system-prompt, user-prompt and wire-schema digests per leg | already captured at §243; promote from record to binding |
| the caller identity for each leg | so that "which builder assembled this" is part of what froze |
| a declared equivalence between the acceptance caller and the production caller, or an explicit statement that none exists | this is the gap §243 exposed and the one that matters most |

## The procedural rule that follows

A freeze should refuse to complete when the acceptance caller and the production caller differ in any
bound element, unless the difference is declared and accepted in writing as part of the freeze. §243
would have failed that check at freeze time on the strict flag and on the absence of a production
caller, and the product owner would have had the information before USD 3.02 was spent rather than
after.

## What this does not imply

It does not imply the §243 result is invalid. The run measured exactly what it said it measured, the
instrument was frozen before execution, and the decision follows from the frozen rule. It implies
that the scope of what was measured was narrower than the word "candidate" suggests, and that the
next freeze should say so in its own identity rather than in a report.
