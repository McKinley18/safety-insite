# §192 — Conjunctive sufficiency results

**G9: 6/6 insufficiency identified, against a threshold of ≥ 5/6.** This is the §191 repair-2 target
and the defect §190 found on HR-08 ×3.

## FV-04 — A ∧ B, existing question reaches A only

*Owed:* the conveyor drive is isolated **AND** the gravity take-up tension is released and confirmed
at zero. *Existing question:* "Was the conveyor drive isolator locked off before work started at the
tail drum?"

The trap is that conjunct A is **already stated done in the observation** — the fitter locked the
isolator — so a topic-level reading finds the question well-aimed and answered. All three replicates
saw through it:

> "The first-pass question only asks whether the drive isolator was locked off — which the
> observation already states was done… **A locked-off drive does not de-tension a gravity take-up;
> that is a separate stored-energy source** that must be independently released and confirmed at
> zero." *(R1)*

All three proposed a question reaching the open conjunct, each naming it as independent of the
isolator, and each bound to the supplied fact under a legal `ADD_OR_REPLACE` pairing.

## FV-05 — A ∧ B ∧ C, existing question reaches A and B

*Owed:* the dosing line is isolated **AND** flushed **AND** confirmed at zero pressure. *Existing
question:* "Was the upstream supply valve locked closed and the line flushed before the filter
housing was opened?"

The harder case: two of three conjuncts covered, both stated done in the observation.

> "The first-pass question asks only whether the valve was locked closed and the line flushed — both
> of which the observation already states as done… **Isolation and flushing do not guarantee zero
> residual pressure** (trapped pressure can remain even after valve closure and flushing)." *(R1)*

R2 and R3 went further and recited the covered conjuncts inside the proposed question — *"in
addition to the valve being locked closed and the line flushed"* — which makes the decomposition
visible in the artifact a person would actually receive.

## Judged on meaning, not token overlap

The preregistration required this, and it matters on FV-05: the proposals reach **only the open
conjunct** rather than restating all three. That is correct. The owed fact's other conjuncts are
already established in the observation, so a question re-asking them would add nothing. Sufficiency
was judged as *what a truthful answer leaves open*, not as clause coverage.

## The contrast with §187B

HR-08's three v3 executions certified a question whose disjunction — *"locked out (or otherwise
verified de-energized)"* — admitted a truthful yes on the weaker branch alone. Not one of the six
v3.1 conjunctive executions made that class of error, and the FV-01 regression rationale shows the
same rule being applied in the other direction, to confirm a question that genuinely has no weaker
branch: *"No weaker branch is offered — the question does not use 'or'."*

**The limit:** two rows, six executions, one adjudicator, and both conjunctive rows were authored to
be identifiable. This shows the rule operating; it does not measure how it behaves on a conjunct
that is subtle or contested.
