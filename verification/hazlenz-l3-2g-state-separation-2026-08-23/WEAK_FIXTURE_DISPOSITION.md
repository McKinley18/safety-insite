# L3-2g — disposition of the two ambiguous development fixtures

The L3-2f exit contract offered three dispositions for `X-NC-03` and `X-WC-02` and forbade a fourth:

> Either improve their expected-label justification; classify them as ambiguous diagnostic fixtures;
> or retire them from hard-gate use. **Do not silently alter their labels after observing candidate
> output.**

**Selected disposition: classify both as `AMBIGUOUS_DIAGNOSTIC_FIXTURE`, excluded from hard-gate
use, with their text and their labels left BYTE-UNCHANGED.**

`development-l32f.json` is unmodified — sha256 `bbda27d6dbad4752b48c987c8e85929c0d3d891d7f69b4d6d8842f9750c0af51`,
the value it carried on entry. Nothing was relabelled, reworded or rescored. The disposition lives
here, where it is auditable, rather than in an edit to a dataset after its results were seen.

**No production reasoning was changed to satisfy either fixture.** That is the substantive
requirement, and it is verifiable: the only production change L3-2g makes is the
`UNAMBIGUOUS_CORRECTION` partition, whose fixtures are `F-WC-02` and the ten audited tokens — none
of them these two.

---

## `X-NC-03` — the wording is ambiguous, and the ambiguity is decision-changing

> The chargehand went over the lead replacement procedure with the crew and the **split** extension
> lead stayed plugged in at the bench.

Expected `ACTIVE` / `electrical` / high-consequence. Cohort `f4_nominal_control`, whose stated
purpose is *"GUARD: mention of a procedure corrects nothing"* — a guard against L3-2f's nominal
correction repair over-firing.

**Why the label is not safe to gate on.** `split` is a homograph in exactly the sense §35.1 warns
about. As a participial adjective it means *cracked open* — a damaged lead, and the intended
reading. As a noun-modifier it means *a splitter* — "a split extension lead" is an ordinary
multi-way adapter, and a multi-way adapter left plugged in at a bench is not a hazard. The two
readings differ on whether any hazard exists at all, so a model choosing the second reading has not
made an error the gate should punish.

**Measured behaviour across the three L3-2f development runs:** `NO_HAZARD_ESTABLISHED` on all
three, with no candidate emitted and no semantic code raised. **Stable, and stably the second
reading.** The fixture is testing the model's lexical coin-flip, not the guard it was written for.

**Disposition.** Retained as a diagnostic fixture; excluded from hard-gate scoring. Its stated
guard — that a mention of a procedure corrects nothing — is already carried by unambiguous fixtures
that DO gate: `test:l32g-state-separation` B5 ("the replacement procedure was gone over with the
crew") and `test:l32f-predicate-scope`'s F4 mention-guard. **The guard loses no coverage.**

---

## `X-WC-02` — ambiguous AND not reproducible, which settles it independently

> A DANGER DEEP PIT notice is wired to the rail beside the open drainage sump in the packing hall
> gangway.

Expected `ACTIVE` / `walking_working_surfaces|falls` / high-consequence. Cohort
`f6_control_adequacy` — signage offered as the control.

**Why the label is not safe to gate on.** The fixture names "**the rail**" and says nothing about
what the rail is. If a rail already runs beside the sump, the sump is guarded and the notice is
supplementary — `CONTROLLED` is then a defensible reading, and the scenario is no longer a
warning-as-control case at all. The fixture supplies the very control it means to withhold.

**The decisive evidence is stability, not interpretation.** Across the three L3-2f development runs
at temperature 0 with a fixed seed, this fixture returned **three different outcomes**:

| run | outcome | raw state |
|---|---|---|
| 1 | `VALIDATED` | `walking_working_surfaces/ACTIVE` |
| 2 | `INSUFFICIENT_EVIDENCE` | `walking_working_surfaces/CONTROLLED` |
| 3 | `NO_HAZARD_ESTABLISHED` | `walking_working_surfaces/CONTROLLED` |

Every other measurement in L3-2f reproduced 97/97, and L3-2g's own noise floor on 24 diagnostic
scenarios is **0/24**. A fixture that is one of the only unstable rows in the corpus cannot gate
anything: its pass or fail is decided by which run you looked at.

**Disposition.** Retired from hard-gate use and retained as an instability marker. Its `F6`
control-adequacy guard is fully covered by unambiguous sealed rows that state their control
explicitly — `F-WC-02` (a sign fixed to a handrail post, hazard stated as *"left open across the
walkway"*), `E-FLD-147` (warning tape), `F-WC-03` (a briefing) — all three of which L3-2g's
structural ablation reads correctly as `WARNS_ONLY`. **The guard loses no coverage.**

---

## What a replacement fixture must do, if either is ever rewritten

Not in this phase, and not against candidate output. Recorded so the next author does not
reintroduce the same defect:

1. **Name the control unambiguously, or not at all.** "the rail" is the whole defect in `X-WC-02`.
   Say "a scaffold pole laid across two drums" if it does not guard, or say nothing about a rail.
2. **Avoid homographs in the hazard noun phrase.** `split`, `fixed`, `ground`, `wound`, `cut` — the
   word-class work of §36.1 exists because these are hard, and a fixture should not turn on one.
3. **State the hazard in a clause that survives the other reading**, so a defensible alternative
   interpretation of one clause cannot delete the finding.
4. **Freeze the text before running it**, and never adjust it after seeing an outcome — the rule
   this disposition exists to honour.
