# §306 — EM-2: password recovery, finished and proven without sending an email

## The premise §306 told me not to trust

EM-2 has been carried for several sections as *"production has no Resend credential"* — which sounds
like a procurement errand. §306 said not to assume the implementation is correct merely because the
blocker was described that way.

It was not correct. **Two concurrent completions of the same reset token both returned "Password
reset successful", and only one of the two passwords actually worked.** One caller was told they had
set a password they had not set, and would have been locked out believing otherwise.

## What was already right

Worth stating, because most of the flow was sound and §306's job was to finish it, not rebuild it:

- **32 random bytes (256 bits)**, hex, fresh per request.
- **Only the SHA-256 digest is stored.** A production database read returns nothing presentable to
  the reset endpoint — verified by recomputing the digest, not by trusting the column name.
- **30-minute expiry**, enforced server-side.
- **Generic public response** for known, unknown and case-variant addresses — identical byte for
  byte, not merely similar in tone.
- **Password strength on reset matches registration.** A recovery path that accepted a weaker
  password than signup would be the way in.
- **Sessions already die on reset.** `jwt.strategy` refuses any access token whose `iat` precedes
  `passwordChangedAt`, and every refresh token is revoked. A session stolen before the reset stops
  working immediately rather than surviving to its own expiry.
- **The reset URL is built from configuration only** — no Host, X-Forwarded-Host, Origin or Referer
  participates.
- **Throttled** 3/minute on request, 5/minute on completion.

## What §306 found and repaired

### 1. Single use was not atomic — the defect that mattered

`resetPassword` was a read-modify-write: SELECT by token hash, hash the new password, SAVE. The
middle step is deliberately slow — bcrypt at 12 rounds — which is a generous window for a second
request carrying the same token to pass the same SELECT.

Measured on the pre-§306 logic:

```
J-1  2 of 2 succeeded (201/201)        <- both callers told "Password reset successful"
J-2  1 of 2 passwords work             <- only one of them was true
```

Repaired by **claiming the token in a single conditional UPDATE** that matches and clears it in one
statement and returns the affected row. Postgres serialises concurrent updates to the same row, so
exactly one caller can observe a row; the loser matches nothing and gets the same refusal an invalid
token gets. The password is hashed **after** the claim, which also stops every invalid-token attempt
from paying for a bcrypt round.

```
J-1  1 of 2 succeeded (201/400)
J-2  1 of 2 passwords work
```

### 2. Delivery outcomes were indistinguishable from the inside

`send()` threw a bare `Error`; `requestPasswordReset` caught it with `catch {}` and discarded it. So
*"no credential is configured"*, *"the provider rejected that address"* and *"the network is down"*
looked identical to an operator — the same shape as **OB-1**, which §305 closed in account deletion.

`send` now returns a typed outcome (`DELIVERED` / `NOT_CONFIGURED` / `PROVIDER_REJECTED` /
`NETWORK_FAILURE`) and a failure emits `auth.password_reset_delivery_failed` carrying the outcome and
the transport name — **no token, no URL, no message, no address**. The public response is unchanged
in all three cases, which the suite asserts directly: a provider outage must not become an
enumeration oracle.

### 3. The provider was the abstraction

`PasswordResetDeliveryService` both *defined* the boundary and *spoke Resend's HTTP API*, so
"change provider" and "change the reset flow" were the same edit. Split: `password-reset-transport.ts`
holds the interface, the message composition, and the Resend / capture / unconfigured transports;
the service composes and hands over. **Auth logic no longer references Resend at all.**

### 4. The brand was baked into the email

Subject and body read *"Reset your Safety InSite password"*. §306 forbids writing the temporary brand
into recovery infrastructure, because the name changes before external Beta. The product name now
comes from `PRODUCT_NAME`, with the current name as fallback so an unconfigured environment still
sends something sensible.

### 5. Readiness said nothing about email

*"We cannot send recovery email"* looked exactly like *"everything is fine"* from outside.
`/health/ready` now reports `passwordResetEmail` as `CONFIGURED` / `NOT_CONFIGURED` / `DEGRADED`
with the missing variable names. It reads only whether variables are **present** — no secret value is
read, compared or returned — and `NOT_CONFIGURED` does not make the service unready, because that is
the honest expected state until a sending domain exists.

### 6. The expiry was written twice

`30 * 60 * 1000` in the token and `expiresMinutes: 30` in the email. That is exactly how an email
comes to promise a window the server does not enforce. One exported constant now feeds both.

### 7. A driver detail nearly shipped a dead feature

The atomic claim initially rejected every valid token: TypeORM's Postgres driver returns bare rows
for a SELECT but `[rows, rowCount]` for an `UPDATE … RETURNING`. The suite caught it as *"a valid
token inside the window is rejected"* — a total failure of the feature, not a subtlety. Both shapes
are now handled.

## The capture transport

`PASSWORD_RESET_PROVIDER=capture` records messages in memory so the harness can read the message and
the reset URL without sending anything. It **refuses to initialise under `NODE_ENV=production`** —
asserted directly (case W), not assumed from a comment. A capture transport reachable in production
would turn real password recovery into a silent recorder, and every locked-out customer would get a
cheerful generic response and no email, forever.

The pre-existing `DEV_EXPOSE_RESET_TOKEN` escape hatch is left as it was: it is mechanically
forbidden in production by `validate-production-environment.ts`, which throws at boot. §306 did not
need to remove it and did not.

## The matrix — 51 assertions, 0 failed

All of A–W, driven against a real running application and a real database, with **zero emails sent**.
Highlights beyond the list above:

- **A/B/C** — identical status *and* identical body for known / unknown / uppercase, plus a **timing**
  comparison (median 2 ms vs 2 ms) so a synchronous provider call on only the known-account path
  would be caught. Case normalization is proven *real*: the known address and its uppercase variant
  each produced a message and the unknown address produced none, so the identical public response is
  genuinely hiding a different internal outcome.
- **M** — a token issued for one account cannot reset another.
- **N/O** — stdout and stderr are captured during a real reset request and searched for the **exact**
  token; monitoring payloads likewise.
- **U-3** — a failed delivery leaves **no stranded reset credential**: the token is rolled back rather
  than left live on an account whose owner never received it.
- **V-3** — a request carrying `Host`, `X-Forwarded-Host` and `Origin` pointed at
  `attacker.example.com` still produces a reset URL on the configured origin.

**Watched to fail:** `01-WATCHED-TO-FAIL-PRE-306.txt` is the suite run against the pre-§306 reset
logic with the new transport in place, isolating the defects rather than the missing transport — 7
failures, including `J-1  2 of 2 succeeded`.

## What is deliberately not proven

Whether a real mailbox receives a real message. That needs a sending domain, which needs the brand
decision. **EM-2 is therefore not closed**, and §306 was explicit that it should not be.
