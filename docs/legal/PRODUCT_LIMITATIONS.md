# Safety InSite — Product Limitations (Controlled Beta)

> ### INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED
>
> Authored at §269 by engineering. Not reviewed by an attorney.

This is not a generic disclaimer. Every limitation below is something we have measured or verified,
with the source of the measurement named. Participants should read it before recording anything.

Sources: `docs/PRODUCT-CLAIMS-REGISTER.md` (measured development results, §156–§160);
§269 live production verification.

---

## Analysis quality

**Hazard coverage is incomplete and measured as incomplete.** On the hardened development set,
analysis covered 5 of 9 truth families. We do not claim, and the evidence does not support, that
HazLenz identifies all hazards present in an observation.

**The advisory layer is not repeatable.** Two executions of byte-identical input — provider-attested
at the same metered token count both times — returned different verdicts: one nominated a
clarification, the other concluded none was required. Re-running an analysis may give you a
different answer. Neither answer is authoritative.

**The formal evaluation of the advisory layer failed and was not accepted.** No accuracy rate is
claimed, and none should be inferred. Development figures come from small sets and are explicitly
not production rates.

**Output was degenerate in 4 of 48 development executions.** The architecture detects and refuses
degenerate output rather than presenting it, which is why you are more likely to see a refusal than
a bad analysis — but the underlying rate is what it is.

**Analysis reads your words, not your workplace.** HazLenz analyses the text you wrote. A hazard you
did not describe cannot be identified. The quality of the analysis is bounded by the quality and
completeness of the observation.

## Regulatory reasoning

**Regulatory identification is not exhaustive and is not a legal determination.** The governed
knowledge base has a defined corpus and a retrieval date. Standards outside that corpus, and
standards changed after that date, will not be reflected. Nothing the product outputs is a
determination of what the law requires of you.

**No regulatory approval, endorsement or certification exists.** None has been sought.

## Images and documents

**Photographs and attached documents are not analysed.** They are stored and displayed. The AI
analysis operates on observation text only. A hazard visible in a photograph but not described in
words will not be identified.

## Availability and performance

**The backend runs on a free hosting plan with a single instance, and it sleeps when idle.**
Verified live at §269: a request arriving after an idle period took **39.8 seconds and returned a
503** before the service woke; the next request succeeded in 5.2 seconds. There is no redundancy
and no automatic failover. For a small invited cohort this is workable, but the first request of the
day will frequently be slow or fail and need retrying.

**Analysis is not instantaneous.** Measured first-pass latency during development ranged 5.7–38.2
seconds, median 15.7 seconds. An Expert analysis performs two provider calls plus a deterministic
analysis and is slower still, with a hard per-call ceiling of 180 seconds.

**There is no automatic retry.** A failed analysis call is reported as a failure. Retrying is a
deliberate action you take.

**Spending ceilings can stop analysis.** Each workspace is limited to 25 Expert analyses and USD 10
of analysis cost per 24 hours during the beta. Reaching either ceiling refuses further Expert
analysis until the window rolls. Deterministic analysis is unaffected.

## Data handling

**There is no automated deletion or retention enforcement during the beta.** Records persist until
the beta ends or you ask us to delete them.

**Only the person who uploaded a file can delete it through the product.** A colleague in the same
organisation cannot, and must ask us.

**Most deletion is a manual request, not a self-service control.** No in-product control exists to
delete an inspection, an analysis or an account.

## What has never been exercised in production

Stated because "not yet proven" is different from "working", and conflating them is how beta
software hurts people:

* **Expert analysis has never run for a customer in production.** The hosted provider path has never
  been exercised from the product route in the live environment. At beta start it is switched off,
  and the first live execution will be a single controlled smoke test.
* **Billing metering of Expert execution has not been verified live.**
* **Report generation has not been exercised end-to-end in production during this beta**, although
  the object storage it depends on was verified working at §269.

## Acknowledgement in product copy

No claim of accuracy, completeness, compliance, autonomy or professional replacement appears in the
product interface, and none may be added while these limitations stand. See
[`BETA_CLAIMS_GUARDRAILS.md`](BETA_CLAIMS_GUARDRAILS.md).
