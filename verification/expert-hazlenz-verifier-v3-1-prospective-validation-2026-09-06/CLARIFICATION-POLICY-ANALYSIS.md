# §192 — Clarification policy analysis

**`CLARIFICATION_POLICY` was `INCONCLUSIVE` after §190** because the §187 cohort contained only
three unconditional proposal opportunities and all three were on one row. §192 was designed to fix
that, and it did.

## The denominator, as preregistered

The raw emission count is **21 / 39**. **That is not the denominator and is never reported as the
policy result.** The preregistered analysis is:

```
OPPORTUNITIES            18     (6 rows x 3 replicates, first pass asked nothing, genuine REQUIRED gap)
PROPOSALS                15
APPROPRIATE_PROPOSALS    15
MISSED_PROPOSALS          3     (all FV-11)
UNNECESSARY_PROPOSALS     0     (of 15 executions where no proposal was owed)
```

Opportunities span **six** distinct owed-property families, against a floor of three:
detection alarm function · guarding clearance · fall anchor integrity · energy separate source ·
ventilation capture · pressure relief function.

## What the two halves say

**Under-triggering: 15/18 appropriate, all three misses on one row.** Five of six opportunity rows
were taken 3/3 with a question reaching the owed property. G7 passes **at exactly its threshold**,
`>= 15/18`, with zero slack — one further miss anywhere would have failed it. The three misses are
FV-11, whose authored truth is questionable; that is examined in `MODEL-SEMANTIC-RESULTS.md` and the
figure is **not** adjusted for it.

**Over-triggering: 0/15.** Across the nine regression executions and the six challenge executions —
every execution where no proposal was owed — **not one** unnecessary proposal was emitted. This is
the half §191 could not measure at all, and it is the cleaner of the two results.

## Was the policy globally shifted?

No, and the §191 remediation was explicitly written not to do that: it contains no instruction to
ask more, to prefer clarification, or to ask when unsure, and the §191 proof suite asserts this
against eight directive patterns. The evidence here is consistent with that. Proposals track **what
the row needed**, not a raised propensity:

| design group | executions | proposals |
|---|---|---|
| existing sufficient question | 9 | **0** |
| existing insufficient conjunctive question | 6 | **6** |
| unconditional opportunity | 18 | **15** |
| no proposal owed (challenge rows) | 6 | **0** |

A verifier that had simply become more talkative would show proposals in the first and last rows.
Neither does.

## What this does not establish

A rate. Six opportunity rows, three replicates, one adjudicator, and a cohort **I designed and
whose first-pass sets I authored** — so the opportunities are as clean as I made them, and a real
first pass would not necessarily leave gaps this legible. `CLARIFICATION_POLICY` is measurable *on
this cohort* and no longer `INCONCLUSIVE` *for it*; that is not the same as a characterised
population behaviour.
