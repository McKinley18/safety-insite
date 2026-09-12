# §192 — Good-behaviour regression

**G8: 9/9, and 0 unnecessary proposals across all 15 executions where none was owed.**

This was the risk §191 named and could not measure: *"a stricter verifier that fixes HR-04 but
begins over-triggering on these rows is not a successful remediation."* §191's proof suite could only
show that the surrounding prompt text survived byte-identically, which is context preservation, not
behaviour preservation.

## The three rows, behaviourally analogous to HR-01, HR-06 and HR-09

| row | analogous to | shape | result |
|---|---|---|---|
| FV-01 | HR-06 | protective function after maintenance, temporal window, question excludes mere presence | `VERIFIED_AS_IS` 3/3, no proposal |
| FV-02 | HR-09 | stored energy, question names the confirmation act and excludes the adjacent one | `VERIFIED_AS_IS` 3/3, no proposal |
| FV-03 | HR-01 | unobservable safety device, certificate silent | `VERIFIED_AS_IS` 3/3, no proposal |

On all nine: owed fact preserved as `STILL_UNRESOLVED`, existing question relied on, **no replacement
question, no nomination, no false settlement, no binding**.

## The single most informative rationale in the run

FV-01 R1 applies the **new** conjunctive rule and uses it to *confirm* the existing question:

> "This question, as written, **requires both the test to have occurred AND to have occurred in the
> correct window** (after repair, before return to service), and requires confirmation of the
> protective function specifically (stopping the ram), not merely that the door closes or the
> interlock is present… **No weaker branch is offered — the question does not use 'or' and does not
> allow a partial answer to satisfy it truthfully.**"

That is the strictness §191 added, running to completion, and arriving at "leave it alone". A rule
that only ever produced rejections would be indistinguishable from a bias; this shows the test
returning both answers.

FV-02 and FV-03 likewise invoke the *pre-existing* unseen-control heuristic by name — *"a control
that cannot be seen/verified is not a control that was checked"* — confirming the §191 boundary
clause did not disturb the heuristic it bounds.

## Also not over-triggered: the challenge rows

The six FV-12 / FV-13 executions are the other half of "no proposal owed", and none proposed one
either. A verifier made globally more suspicious would have been most likely to invent a gap exactly
there — on a fully-established control and on a magnitude question. Neither happened.

## The limit

Three rows, nine executions, and every row 100% stable across replicates. Over-triggering did not
occur **on shapes chosen to resemble the rows that previously worked**. A row whose existing question
is *marginally* sufficient — the genuinely hard case for a stricter rule — is not in this cohort, and
a future cohort should include one.
