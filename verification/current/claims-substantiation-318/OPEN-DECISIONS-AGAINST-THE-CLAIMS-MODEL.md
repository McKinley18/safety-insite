# §318 — HZ-12, CS-2, HZ-11 AND BETA MODE, RE-DERIVED AGAINST THE CLAIMS MODEL

Nothing here is implemented and no decision is made on the product owner's behalf.

---

# HZ-12 — SILENT DEGRADED ANALYSIS

## Re-derived

`hazlenz.service.ts` skips the full intelligence orchestrator when the runtime is production **and**
Render **and** either `HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER=true` **or** heap has reached
`HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB`, **unset in production and defaulting to 420 MB**.
It returns `degraded: true`, `fullIntelligenceAvailable: false` and a `fallbackReason` naming what
was skipped. **No frontend reader exists for any of the three** — re-confirmed at §318 against the
deployed bundle.

## What §318 adds that §317A could not

§317A evaluated HZ-12 as an operational-disclosure question. Under the claims model it is a
**substantiation** question, and that changes its weight:

1. **`/hazlenz` sells the advanced review.** "reasons across equipment, task, exposure, energy and
   control factors", "Autonomously identifies missing or ambiguous parameters", "Every finding
   includes a full visual and step-by-step AI Reasoning Trace". A degraded result is precisely the
   case in which several of those sentences become **untrue for that analysis** — and the product
   does not say so.
2. **It converts a capability claim into a per-analysis claim.** Every other limitation the product
   states is *categorical* ("candidates are not confirmed violations"). Degradation is
   *episodic*: sometimes the analysis is what was advertised and sometimes it is not, and only the
   server knows which.
3. **The safety argument still holds.** A degraded result remains advisory, still requires review,
   and still says so. §318 does not upgrade HZ-12's severity on safety grounds — the exposure is to
   the *claim*, not to the finding.

## Options and consequences

| # | option | claims consequence | engineering cost |
|---|---|---|---|
| **1** | **Surface `fallbackReason` in the HazLenz step when `degraded` is true** | **Best preserves factual transparency.** The sentence already exists, is already written for a reader, and makes the episodic claim self-correcting: on a degraded analysis the product says what it did not do | Small — one conditional block plus a contract test. The **wording is a customer-facing claim** and belongs to the same approval as everything else in §318 |
| **2** | **Measure first** — the branch already logs; route it to the MO-1 webhook | Leaves the silence in place while measuring, which is a decision to ship the silent state through Beta | Very small |
| **3** | **Set or remove the threshold** — 420 MB is a default nobody chose | Removes the "unchosen number governs what the customer receives" problem. Does not by itself make the product truthful when it *does* degrade | Configuration only for a raise (§297 read-back applies); removal is a code change needing a memory argument |
| **4** | **Do nothing for Beta** | The product may tell a participant it did something it did not do, on a page that sells exactly that capability. Weakest option under the claims model | None |

## Which option best preserves factual transparency and the demonstrated boundary

**Option 1, with option 3 alongside it.** Option 1 is the only one that closes the gap between what
`/hazlenz` sells and what a degraded analysis delivers, and it does so using the server's own words
rather than new marketing language. Option 3 is nearly free and removes an unchosen default from
control of customer-visible behaviour.

**Option 2 alone is weaker than it looked at §317A.** §317A recommended measure-then-decide because
the frequency was unknown. Under the claims model the frequency does not change whether the claim is
true — it changes only how often it is false. **The decision is the product owner's.**

---

# CS-2 — PRO ADVERTISES CAPABILITIES WITH NO SURFACE

## Re-derived

`/pricing` Pro column: **"Inspection planning and assignment tools"** and **"Dashboards, analytics,
and audit trail"**. An individual Pro account is granted `inspectionAssignments`, `analytics`,
`auditTrail`, `teamMembers`, `companyAnalytics`, `sharedReports` — all `true`. The frontend has
**no caller** for the assignment API, **no caller** for `/dashboard/*`, and `auditTrail` appears in
exactly one frontend file: the pricing copy itself.

**§318 adds a third instance of the same class**, on the same page: *"Every finding includes a full
visual and step-by-step AI Reasoning Trace"* — the string `Reasoning Trace` exists nowhere else in
the product. **CS-2 is not two lines; it is three, and all three are on `/hazlenz` or `/pricing`.**

## Evaluated against the six criteria §318 names

| criterion | assessment |
|---|---|
| **User comprehension** | Worst of the open items. A participant reads a feature list, signs in, and finds nothing. There is no navigation entry, no control, no route, and no statement that it is not built |
| **Safety significance** | Low-to-moderate, concentrated in **"audit trail"** — the phrase a safety professional would most reasonably rely on when deciding whether the product can hold a record they may have to defend. Interacts directly with RR-1 |
| **Legal / disclosure significance** | **The highest of the open items.** This is an advertised feature of a **paid** plan that does not exist. In an FTC *Operation AI Comply* posture, an unbuilt advertised capability on a payment surface is the cleanest possible example of the thing being enforced against |
| **Claims consistency** | CS-1 was the identical defect, was treated as blocking, and was repaired and deployed before Beta. Treating CS-2 differently would mean the earlier decision rested on the *words* rather than on the product promising something it does not do |
| **Beta simplicity** | Removing or rewording is the simplest possible change and reduces the surface counsel must review |
| **Engineering complexity** | Removal/rewording: under an hour, plus a §305A assertion. Building: **large and unbounded** — assignment is Company/Team, deferred at §305A |

## Options

| # | option | consequence |
|---|---|---|
| **1** | **Remove the three lines** | Truthful immediately. Pro's list gets shorter — a marketing question, not an engineering one |
| **2** | **Reword to what Pro actually delivers** — cloud reports, report revision history, corrective actions with owners and due dates, the calendar, and the fact record behind each finding | Truthful and keeps the list's length. The replacement wording is a claim and belongs to this same approval |
| **3** | **Build the surfaces** | Not a Beta option. Reopens the Company/Team scope decision §305A closed deliberately, to satisfy marketing copy |
| **4** | **Ship as is** | The product tells every paying and comped participant something untrue about what they bought |

## Factual tradeoff

**Options 1 and 2 are the same size and the choice between them is editorial.** Option 3 is
disproportionate and reopens a closed scope decision. Option 4 is the one to argue against
explicitly, on the CS-1 precedent.

**One caution that applies to every option: removing the copy does not remove the entitlement
flags**, which remain `true` for Pro. Harmless today because nothing reads them on a customer path;
it stops being harmless the moment something does. The pricing copy and the entitlement set should
be made to agree, and the §305A suite is where that agreement belongs.

---

# HZ-11 — THE CEILING, PURELY AS A DISCLOSURE QUESTION

**The ceilings are unchanged and §318 made no configuration change: 1 analysis and $1.00 per user
per 24 hours. No provider calls.**

### Does a Beta participant need to know the numerical ceiling in advance?

**Yes — and more than "in advance", they need it at the control.** Not because the number is
interesting, but because of what happens without it: the participant meets a `503` on their second
observation of the day, and after §317 they now *see* a refusal that says *"This workspace has
reached its Expert analysis limit for now."* That sentence is comprehensible only if a limit was
ever mentioned. Announced beforehand it is a Beta constraint; discovered at the moment of refusal it
reads as the product failing.

### Can it be described as a Beta usage limit?

**Yes, and that is the accurate description.** It is not a plan entitlement — Pro confers
`fullSafeScope` without a usage cap — and it is not a technical limitation. It is a
deliberately conservative operational ceiling from the §298 controlled activation. "During the Beta,
Expert review is limited to N analyses per day" is true, is not a plan claim, and does not imply the
limit is permanent. **One vocabulary note: the refusal says "this workspace", and an individual
participant has no workspace concept anywhere in the product.**

### Would the current ceiling materially interfere with evaluating HazLenz?

**For Expert, yes. For HazLenz as a whole, no — and the distinction is the important part.**

The deterministic path is **unlimited and is the customer-authoritative one**. A participant can
walk a whole site, capture many observations, and get a finding, a citation, a risk band, a
corrective action and a report for every one of them without touching Expert. §317 proved that on a
corpus-free database.

What one analysis per day cannot evaluate is **Expert**: whether the second opinion is worth having,
whether it disagrees usefully, whether settlement works in practice. At a ceiling of one, a
participant sees Expert approximately once and cannot form a view.

### Would a small invitation-only Beta generate useful feedback at one analysis/day?

**On the core product, yes — abundantly.** On Expert, **no.** Five participants × one analysis × the
Beta's length is a sample that answers no question worth asking, while still spending real money.

That frames the decision as a genuine either/or rather than a number to tune: **either raise the
ceiling enough that Expert can be evaluated, or disable Expert for the Beta and say so.** Leaving it
at one produces the cost of having Expert enabled with almost none of the learning. **The decision
is the product owner's and §318 does not make it.**

---

# CLAIMS UNDER THE THREE BETA MODES

§318 does not choose the mode.

| | **FREE** | **COMPED** | **PAID** |
|---|---|---|---|
| **Required claim precision** | High — FTC substantiation does not depend on payment | High | **Highest.** Every advertised capability becomes a term of a paid bargain. **CS-2 moves from a claims defect to a payment-surface defect** |
| **Subscription disclosures** | Minimal | Must state that access is granted, time-bounded and ends on a date. **§317 built exactly this** — "Included — nothing is billed to this account" and "Granted access, ends …" | Full: price, billing period, renewal, cancellation, and what happens to data at the end |
| **Availability expectations** | Low | Low-to-moderate | **Material.** Paying creates an expectation of availability the product makes no commitment about. No SLA exists |
| **Support expectations** | Informal | Informal | **Material**, and the product has **no support surface at all** — the only support route named anywhere is `/forgot-password`'s "contact the person who invited you" |
| **Recovery / email** | **EM-2 is a serious inconvenience** | Same | **EM-2 becomes a defect in a paid service.** A paying customer locked out with no recovery is a refund conversation at best |
| **Refund / cancellation** | N/A | N/A | **Required, and nothing in the product addresses it.** The portal needs a `stripeCustomerId`, which only a real purchase creates — untested |
| **HazLenz usage-limit disclosure** | Should | Should | **Must.** Selling "HazLenz AI review" for $24.99/month while capping it at one per day, undisclosed, is the sharpest single claims exposure in any mode |

**The one structural observation.** Free and comped differ mainly in disclosure *wording*. **Paid
changes the category of several open items**: CS-2 becomes a payment-surface misrepresentation,
EM-2 becomes a service defect, HZ-11 becomes a material term, and refund/cancellation appears from
nowhere as a new requirement with no implementation.
