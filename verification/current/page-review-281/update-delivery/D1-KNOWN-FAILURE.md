# KNOWN FAILURE — §279 update delivery, case D1

**This gate FAILS and was deliberately not repaired, not weakened, and not waived.**

`npm run validate:279-update-delivery` · exit code **1** · transcript: `RUN-TRANSCRIPT.txt`

---

## What fails

```
ok   A  a current client shows no update notice of any kind
ok   C1 a newer release shows the update-available notice
ok   C2 it reads as an offer, not a demand
ok   C3 it offers both Refresh now and Later
ok   C4 it does NOT block the application — the page behind it is still usable
ok   C5 Later dismisses it
ok   J  once dismissed, repeated checks do not re-open the same notice
FAIL D1 an unsupported client is shown the update-required state
```

The run aborts at D1: `locator.innerText: Timeout 30000ms exceeded` waiting for
`[data-testid="update-required"]`. Because the script throws at the first failing assertion, the
cases after D1 — **D2, H1, H2, H3, E0, E1, E2 and the control run** — are **NOT EXERCISED**. They
are unmeasured, not passing.

## What this means, and why it matters

Cases C1–C5 and J pass, so the version-check mechanism itself works: a current client learns about a
newer release, the notice reads as an offer rather than a demand, and dismissal sticks.

What does not fire is the **background re-check on a tab left open** — §279's Part A mechanism. That
is the path that turns an unsupported client into one that **stops writing to the server**. A tab
left open for hours on an obsolete client is exactly the case the mechanism exists for, and on this
evidence it does not reach the update-required state.

**This is safety-relevant.** The write gate is what stops an out-of-date client submitting against a
schema it no longer matches.

## What was established about the cause, and what was not

**Established — §281 did not cause it.** Isolated with two independent controls:

1. `HEAD`'s version of the script (`2d893da9`), with only the retired `/inspection-cover` URL
   swapped for an active route, fails at the same case.
2. It fails identically on `/settings`, `/command-center` and `/safety-calendar` — three pages §281
   did not modify — so it is not a consequence of the D-038 route removal or the D-041 dashboard
   work.

**Established — it is not a build-identity artifact.** An earlier run failed because the production
build carried no `NEXT_PUBLIC_FRONTEND_VERSION`, so the client version resolved to `unknown`, which
correctly blocks nothing. Rebuilding with `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0` fixed *that* and D1
still fails. The run recorded here is against a `1.0.0` build; C1 passing proves the client knows
its own version and can compare it.

**Tested and found WRONG.** The hypothesis that `/safety-calendar`'s own polling perturbed
`page.clock.runFor(31 minutes)` was written down, tested, and disproved — it fails on pages with no
polling too. Recorded so it is not tried again.

**NOT established.** Why the scheduled re-check does not fire. No root cause has been identified and
none is asserted here.

## Disposition

Open. Carried into §282's preservation commit **visibly failing**, by product-owner direction:

> A failing release/update gate must remain visibly failing in the evidence.

The candidate is **not** release-ready and nothing in this package says otherwise.

## Note on the earlier §281 evidence

The §281 run of this gate produced only `screenshots/update-available-1280.png`: the script throws
an uncaught exception at D1 and never reaches the line that writes its results JSON, so no
structured record of the failure existed. This directory was regenerated at §282 with the full
transcript captured, so the failure is preserved as evidence rather than only as a claim in prose.
The gate's own abort-on-first-failure behaviour is a limitation of the instrument; it was **not**
changed here, because §282 is preservation, not repair.
