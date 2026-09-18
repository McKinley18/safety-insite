# §317A — HZ-12 AND CS-2: THE DECISION INPUT

**Neither is implemented, and neither was decided implicitly during deployment.** §317A asked for the
exact current descriptions and the available product choices; this is that, and nothing in the
deployed build changed either one.

---

# HZ-12 — HAZLENZ CAN DEGRADE SILENTLY IN PRODUCTION

## Exact current description

`hazlenz.service.ts` skips the full intelligence orchestrator when **all** of the following hold:
the runtime is production, the runtime is Render, and **either** `HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER=true`
**or** heap usage has reached `HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB`, **which is unset in
production and therefore defaults to 420 MB**.

It then returns `buildDegradedHazLenzIntelligence(...)`, which sets:

```
degraded: true
fullIntelligenceAvailable: false
fallbackReason: "HazLenz AI advanced review was skipped because heap usage reached the
                 configured 420 MB pre-import guard. Core classification, risk, standards
                 candidates, and corrective actions were still generated."
governance: { advisoryOnly: true, requiresQualifiedReview: true, degradedMode: true }
```

**The server is honest. The interface is silent.** None of `degraded`, `fullIntelligenceAvailable`
or `fallbackReason` is read anywhere in the frontend — §317 searched and found no reader, and the
§317A deployed-bundle scan found none either.

## What the user experiences

Nothing distinguishes the two outcomes. A degraded analysis arrives in the same panel, with the same
headings, the same standard candidates, the same risk scoring and the same corrective actions. The
inspector cannot tell that the advanced review did not run, and neither can the product owner
looking at the record afterwards.

## Safety and compliance consequence

This is the more serious half. The product's position — stated on `/legal`, `/hazlenz` and the
workspace banner — is that HazLenz is advisory and a qualified person must verify every finding.
That position survives degradation: a degraded result is still advisory, still requires review, and
still says so. **So the safety argument does not collapse.**

What degrades is the *basis* of the reviewer's confidence. An inspector who has learned what a
HazLenz analysis normally contains will read a thinner one as "there was less to find here" rather
than as "less looked". That is a false negative in the reviewer's own reasoning rather than in the
engine's output, and it is exactly the class of error §281's D-040 was raised about: the product
knowing something and not saying it.

For claims, it interacts with CM-1 directly. `/hazlenz` says the engine "reasons across equipment,
task, exposure, energy, and control factors" and that "every finding includes a full visual and
step-by-step AI Reasoning Trace". A degraded result may not satisfy either sentence, and the product
does not currently say when it does not.

## Beta consequence

**Unknown frequency, and §317 deliberately did not guess.** Measuring how often the 420 MB guard
trips would require production load measurement, which §317 was not authorised to perform. What is
known: the guard exists, its threshold is a default nobody chose for this instance, and external
Beta traffic is the first traffic that would push the instance towards it.

## Options

| # | Option | What it costs | What it leaves open |
|---|---|---|---|
| **1** | **Surface it.** Render the server's own `fallbackReason` in the HazLenz step when `degraded` is true. | Small — one conditional block in the workspace; the sentence already exists and is already written for a reader. Half a day including a contract test. | The wording is a customer-facing statement about analysis completeness, so it is CM-1's to approve. |
| **2** | **Measure first, then decide.** Instrument how often the guard trips in production before changing anything. | Small — the branch already logs; it needs the log to reach somewhere a human reads, which MO-1's webhook already is. | Leaves the silence in place while measuring, which is a decision to ship the silent state through Beta. |
| **3** | **Raise or remove the threshold.** 420 MB is a default, not a decision. If the production instance has headroom, raise it; if the orchestrator is no longer the memory risk it was, remove the guard. | Configuration only for a raise (one variable, §297 read-back applies). Removing the guard is a code change and needs a memory argument. | If the guard never trips, the disclosure question becomes theoretical — but only until the next instance-size or corpus change. |
| **4** | **Do nothing for Beta.** Record it and revisit before public availability. | Nothing. | Accepts that a Beta participant may receive a reduced analysis and not be told. |

## Recommended factual tradeoff

**Options 2 and 3 together, then 1 with CM-1's wording.** The sequence matters and it is cheap:
setting the threshold explicitly is one environment variable and removes the "nobody chose this"
problem immediately; the log already exists, so learning whether it ever trips costs almost nothing;
and if it never trips, option 1 becomes a small robustness improvement rather than a customer-facing
claims decision made under time pressure. Doing option 1 first inverts that — it puts a new sentence
about analysis completeness in front of customers before anyone knows whether it will ever be shown.

**What argues against deferring entirely (option 4):** the threshold is a default rather than a
choice, and external Beta is the first traffic that could reach it. Leaving an unchosen number in
control of what the customer receives is the part that is hard to defend later.

---

# CS-2 — THE PRO PLAN ADVERTISES CAPABILITIES WITH NO CUSTOMER-REACHABLE SURFACE

## Exact current description

`/pricing`'s Pro column offers:

- **"Inspection planning and assignment tools"**
- **"Dashboards, analytics, and audit trail"**

An individual Pro account is granted `inspectionAssignments`, `analytics`, `auditTrail`,
`teamMembers`, `companyAnalytics` and `sharedReports`, **all `true`** — verified at §317 against a
real grant-derived Pro account's `/billing/status`.

The frontend contains **no caller for the assignment API**, **no caller for `/dashboard/*`**, and the
string `auditTrail` appears in exactly one file in the entire frontend: `components/pricing/planData.ts`
— the pricing copy itself.

## What the user experiences

A participant who pays $24.99/month, or who is comped onto Pro, reads that they are getting planning,
assignment, dashboards, analytics and an audit trail, signs in, and finds none of them. There is no
navigation entry, no control and no route. Nothing tells them the capability is not built; it simply
is not there.

## Safety and compliance consequence

Lower than HZ-12 and not zero. "Audit trail" is the phrase a safety professional would most
reasonably rely on when deciding whether the product can hold a record they may have to defend, and
RR-1 already flags that an inspector may treat this product's output as their statutory examination
record. A promised audit trail that does not exist is the kind of reliance the RR-1 wording is meant
to prevent.

## Beta consequence

**Direct and certain, unlike HZ-12's.** Every Beta participant who reads `/pricing` meets this. It is
the same defect class as CS-1, which §305A treated as blocking and repaired before deployment; the
only reason these two lines survived is that §305A's sweep searched for *team* vocabulary and these
are not team-worded.

## Options

| # | Option | What it costs | What it leaves open |
|---|---|---|---|
| **1** | **Remove the two lines.** | Trivial — two entries in `planData.ts`, plus an assertion in the §305A suite so they cannot return. Under an hour. | Pro's feature list gets shorter, which is a marketing question rather than an engineering one. |
| **2** | **Reword to what Pro actually delivers.** Pro genuinely delivers cloud reports, report revision history, corrective actions with owners and due dates, and the calendar. | Small, and it is copy — so it is CM-1's to approve. | Needs someone to decide the honest replacement wording. |
| **3** | **Build the surfaces.** The APIs exist; the UI does not. | Large and unbounded for Beta. Assignment needs a person-picker and a notion of who can be assigned, which is Company/Team — **explicitly deferred at §305A**. Analytics and audit trail need screens that do not exist. | Reopens the Company/Team scope decision §305A closed. |
| **4** | **Ship as is.** | Nothing. | The product tells every paying and comped Beta participant something untrue about what they are buying. |

## Recommended factual tradeoff

**Option 1 or 2, before any external participant sees `/pricing`.** They are the same size and the
choice between them is purely whether the Pro column needs the length. Option 3 is not a Beta option:
assignment is Company/Team, which §305A deferred deliberately, and building it to satisfy a line of
marketing copy would reopen a scope decision for the worst possible reason.

**Option 4 is the one to argue against explicitly.** CS-1 was the identical defect, was treated as
blocking, and was repaired and deployed before Beta. Treating CS-2 differently would mean the earlier
decision rested on the words rather than on the fact that the product was promising something it does
not do.

**One caution about option 1.** Removing the copy does **not** remove the entitlement flags, which
remain `true` for Pro. That is harmless today because nothing reads them on a customer path, and it
will stop being harmless the moment something does. Whichever option is chosen, the entitlement set
and the pricing copy should be made to agree, and the §305A suite is where that agreement belongs.
