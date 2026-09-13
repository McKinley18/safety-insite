# §279 — versioned update delivery

Evidence that a Safety InSite client can discover it is obsolete, stop writing when it is, and never
be told it is obsolete without evidence.

The architecture is `project-docs/current/UPDATE-DELIVERY.md`.

## The measured starting point

An already-open session could keep running old code **indefinitely**. A Safety InSite tab is a
client-side application; after its first document load it navigates client-side and never
re-requests the HTML, and nothing in it ever asked the server what version it was talking to.

## Contents

| Path | What it is |
|---|---|
| `results/279-release-compatibility.txt` | The rule, proven against literal fixtures. Plan cases A–F, ordering, version parsing, and the served contract's exact public field set |
| `results/279-release-version-check.txt` | The client's scheduling and its write gate. Plan cases E, F, G, J |
| `results/279-update-delivery-browser.txt` | The real browser, real application, real sign-in. Plan cases A, C, D, E, F, H, I, J |
| `results/release-contract-parity.json` | The two copies of the rule, and the one declared value that could not be derived |
| `results/version-endpoint.json` | What `GET /version` actually returned on this build |
| `update-delivery-results.json` | The browser run's structured result |
| `screenshots/` | The update-available notice, the update-required state, and the version surface |

## The two properties worth naming

**A client stops writing only on positive evidence.** Unreachable server, malformed contract,
unparseable version on either side — all resolve to UNKNOWN, which blocks nothing. The browser gate
proves the consequence: with the version endpoint failing, an inspector can still add work.

**Nothing reloads by itself.** `/inspection-workspace` holds in-progress observation text,
clarification answers and reviewer risk selections in component state with no local persistence, so
an automatic reload would silently destroy an inspector's work. The browser gate types into a real
field, triggers the release, and asserts both that nothing navigated and that the typed text is
still on the screen.

## One correction, recorded rather than absorbed

The browser gate's first version attempted its blocked write by clicking "Start Inspection" on the
cover page. That control is a `<Link>` that saves locally and navigates — it writes nothing to the
server — and the locator matched nothing at all. **"No mutation was transmitted" was true of a click
that never happened.** That result was discarded. The gate now uses a real `POST /tasks`, asserts the
control exists before clicking it, and carries a **control run** proving the identical click from a
current client *does* reach the server.

## Scope

**Zero provider calls. Zero production migrations. Zero production DB writes. Zero deployments.**
A release is simulated by intercepting `GET /version` in the browser; the running server is never
modified and nothing is deployed.
