# §262 — Authoritative server-side Expert execution service and protected product route

Terminal: **EXPERT_HAZLENZ_AUTHORITATIVE_EXECUTION_ROUTE_IMPLEMENTED — HUMAN_CONFIRMATION_ACTION_AUTHORIZATION_REQUIRED**

## 1. The statement this section had to make true

> The analysis stored as `server_authored` is the analysis the server actually obtained from the
> frozen §259 Expert execution path.

Each clause is carried by a mechanism rather than by care:

| clause | mechanism |
|---|---|
| the server actually obtained it | the result is the return value of `runExpertHazLenzAnalysis`, invoked inside `ExpertAnalysisExecutionService`. No parameter, field or path lets a caller supply one. |
| from the frozen path | the entry point is called directly; no lower-level provider function is reachable from that file, so admission, projection and the verifier orchestration cannot be bypassed. |
| §259 | the digest of the first-pass system prompt the transport **actually received** is compared with frozen element 2 before anything is attributed to the candidate. A mismatch settles the execution as `ANALYSIS_FAILED`. |
| stored as `server_authored` | the producer literal lives in `ExpertAnalysisService`, behind a database CHECK constraint that requires a real execution row. |

## 2. What the client may send, and why the rejection is structural

Accepted: `idempotencyKey`, `requestVersion`, and optionally `taskContext` and
`answeredClarifications`. Nothing else.

The rejection list §260 section 3 wrote out is delivered as an **absence**. The DTO declares no
server-owned property, and the global `ValidationPipe` is `whitelist + forbidNonWhitelisted`, so a
body carrying one is a 400 before the controller runs. Ten server-owned fields were attempted over
real HTTP; ten were refused and none created a row. The eleventh — minting `server_authored`
directly in SQL — was refused by `ck_hazlenz_analysis_producer_execution`.

## 3. Authorization: the production profile, not the persistence profile

The route carries `JwtGuard`, `EntitlementGuard('fullSafeScope')`, `RolesGuard` and its own
`Throttle(10/60s)` — the `classify` profile, tightened, because an admitting Expert analysis is two
hosted legs plus a deterministic analysis. It does **not** inherit
`POST /inspections/observations/:id/analyses`, which carries `JwtGuard` alone.

It lives on its own controller rather than on `InspectionController`, whose class-level
`@UseGuards(JwtGuard)` would have put the product's most expensive endpoint one careless edit away
from its weakest profile. The path is unchanged — the resource is still an observation.

Proven over HTTP: unauthenticated 401, no entitlement 402, excluded role 403, cross-workspace 404,
and a live 429 once the route's own limit is passed.

## 4. One change to shared security code, and why it was made rather than reported

§262 requires that a cross-tenant attempt not reveal whether the target exists. The inherited
behaviour did reveal it: both answers were 404, but a cross-workspace observation said
`Inspection not found.` while a non-existent one said `Observation not found.`, so a caller could
enumerate real observation ids by reading the body.

`InspectionService.accessibleObservation` now answers both identically. It was fixed at the shared
choke point rather than at the Expert route, because a route-local fix would have been a second
implementation of tenant behaviour — the thing this module exists to avoid. Every observation route
gains it. An `UnauthorizedException` is deliberately **not** normalised to NotFound: telling an
unauthenticated caller that a resource does not exist is a claim the server has not established.

No test asserted the old messages.

## 5. Pre-spend idempotency, measured at the only exit

Three concurrent requests sharing one identity produced **one** execution row, **one** spender,
**one** simulated provider entry and **one** analysis. A later duplicate reused the authoritative
result and the counter did not move.

The count is taken at the transport seam — the single place a provider can be reached — so a
duplicate that never reaches it is *proven* not to have spent rather than assumed not to have.

## 6. The confirmation rule, corrected in one direction

§261 ran the rule unconditionally. §262 found the consequence: a refused or failed outcome has no
posture, the rule fails closed on an unreadable posture, and the row would have been stored with
`confirmationRequired = true` — inviting a human to confirm a classification that does not exist,
and making the flag mean two different things on two different rows.

The rule now runs only where `status === COMPLETE && admission === ADMIT`; every other outcome
records `confirmationNotApplicable()`, whose `failedClosed` is **false** because the rule was
inapplicable, not defeated. Conflating the two would hide genuine fail-closed events inside a
population of refusals.

**Fail-closed behaviour on an admitted analysis is unchanged**, and §261's 60 rule tests still pass.

## 7. State mapping, proven per case

| deterministic outcome | product state | evidence |
|---|---|---|
| `ADMIT`, no trigger | `ANALYSIS_AVAILABLE` | case A |
| `ADMIT`, branch (b) trigger | `ANALYSIS_AWAITING_CONFIRMATION` | case B |
| `PRESERVE_UNRESOLVED` | `ANALYSIS_UNRESOLVED` | cases F and G |
| `FIRST_PASS_REFUSED` / `REFUSE` | `ANALYSIS_REFUSED` | case E |
| `PROVIDER_FAILED` | `ANALYSIS_FAILED`, **no analysis row** | R7 |

A refusal is never presented as available, and a transport failure never produces an analysis row —
so there is nothing for a client to render as a result when the layer was simply unreachable.

## 8. H3 / H4 structural identity

`resultSnapshot.analysis` is the admitted analysis **whole**, as the §235 normalizer produced it.
There is no field list, no mapper and no projection between the admitted structure and the column,
which is why `declarationId`, `resumeCondition.resolvedByDeclarationIds`, `controlId` and
`dischargingControlRef` survive — nothing in the write path is capable of touching them. Asserted
on the persisted row *and* on the response body, on real structures rather than on the claim.

## 9. What was deliberately not done

No confirmation action, no override action, no frontend, and **no finding reconciliation**: zero
findings were created from any server-authored analysis, and the response says so rather than
leaving a client to infer it. §261's decision that an unconfirmed operational conclusion must not
become authoritative downstream is preserved intact.

Cases C and D are reported RESERVED. The actions they test do not exist, and faking them would have
been a fifth outcome the acceptance is not permitted to invent.

## 10. Limitations that are real and are not hidden by a green result

1. **Governed evidence is empty in every §262 execution.** The only place §262 could have obtained
   approved regulatory text without building a server-side governed loader is the client-supplied
   snapshot, which would let a request inject text into the transmitted prompt while it is labelled
   governed. Empty is the fail-closed answer and the contract already defines it. The consequence is
   that §262 has exercised the governed-citation path **not at all**.
2. **The deterministic analysis is run a second time, server-side.** That is what makes the premises
   server-owned, per the §260 flow. It also means Expert may reason from a deterministic analysis
   that differs from the one the inspector is looking at, if the two runs diverge. Reconciling them
   is a product question for a later slice.
3. **`ANALYSIS_UNRESOLVED` covers two different shapes.** A contained declaration refusal with an
   admitted posture and a whole-output refusal with preserved truth both derive to it, because §252
   gives `PRESERVE_UNRESOLVED` precedence deliberately. They stay distinguishable on the execution
   record, not in the product state.
4. **Verification ran on a worktree that also holds unrelated uncommitted §117 changes** to
   `evidence-foundation.ts` and `shared-evidence-facts.ts`. Those files are not in the §262 commit.
   The §262 assertions concern authority, state, provenance and idempotency rather than which hazard
   families the deterministic layer finds, so they are not expected to depend on those changes —
   that expectation is reasoned, not measured.
5. **The storage-dependent provenance suite remains environmentally blocked.** Its mechanism first
   appeared to have changed; it had not. See `SECTION-262-REGRESSION.txt` for the investigation.

## 11. Candidate integrity

22 elements recomputed from live sources, drift 0, identity
`0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` before and after. The
recomputation is read-only: it writes no file, so it cannot make the artifact agree with itself.
The literal compiled into the server is checked against that recomputation, and the execution-time
prompt binding is checked against the same frozen element — so the constant is a checked fact and
the running path is bound to it, not merely labelled with it.

29 protected modules present, 0 missing, 0 modified. One stale digest in
`PROTECTED-IDENTITIES.json` is pre-existing since §259 and was not rewritten.
