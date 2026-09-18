# §317 — LOCKOUT, PASSWORD RECOVERY, AND THE MINIMUM SAFE TEMPORARY SUPPORT PROCEDURE

## CAN AN EXTERNAL PARTICIPANT BECOME PERMANENTLY LOCKED OUT DURING BETA?

**Yes — by one route only, and it is EM-2.**

### Routes that do NOT lock anyone out

There is **no account lockout mechanism**: no `failedLoginAttempts`, no `lockedUntil`, no
disable-after-N-attempts. Authentication is protected by per-minute throttling only — 5 attempts per
minute on login, 3 per minute on the reset request — so a participant who mistypes their password
waits sixty seconds, not forever. There is no email-verification gate to fail, no admin approval to
wait for, and no agreement re-acceptance lockout (§308 deliberately declined to build an aggressive
one).

### The route that does

A participant who **forgets their password** cannot recover it.

Read live from production at §317, read-only:

```
passwordResetEmail.state     NOT_CONFIGURED
passwordResetEmail.provider  resend
passwordResetEmail.missing   RESEND_API_KEY, PASSWORD_RESET_FROM_EMAIL
```

Measured behaviour, executed: a reset request mints a 256-bit token, attempts delivery, fails, and
— correctly, per §306 — **rolls the token back**, so no live credential is left on an account whose
owner never received it. The database confirms it: after a reset request against a real account,
`passwordResetTokenHash` is still NULL.

Nothing is written. Nothing is sent. The software path is complete and proven (§306, 51 assertions);
what is missing is a sending domain and a credential, and both are brand-gated.

**So during Beta, forgetting your password ends the account's usefulness to its owner**, and until
§317 the product told them an email was on its way.

---

## WHAT §317 CHANGED, AND WHY IT DOES NOT WEAKEN THE SECURITY PROPERTY

§317's instruction is explicit: *do not pretend password recovery is operational if email cannot be
delivered.* `/forgot-password` now reads the service's own published capability from
`/health/ready` and, when password-reset email is not configured, states plainly that no reset
email can be sent, that nothing is wrong with the account, and that a participant who cannot sign in
should contact whoever invited them. The submit control is disabled in that state, because a control
whose only possible outcome is a false success message is worse than no control.

**Why this does not leak whether an account exists.** The distinction is whose fact is disclosed.

- §306 proved **byte-identical responses** for known, unknown and case-variant addresses, plus a
  timing comparison. None of that is touched: the request, the response and the wording of the
  generic answer are unchanged, and gate case `RC-2` re-asserts all three on every run.
- What is disclosed instead is a property of the **service** — whether it can send password-reset
  email at all. That answer is the same for every visitor, is account-independent, and is already
  served publicly at `/health/ready`. A statement identical for all callers cannot distinguish one
  account from another.

**And it fails towards the form.** If the capability cannot be read — the probe fails, the shape
changes, the service is mid-deploy — the page behaves exactly as it did before. The cost of wrongly
offering the form is a visitor who waits; the cost of wrongly withdrawing it is a visitor who cannot
recover an account that could have recovered itself. Only one of those is worth risking.

Gate cases `RC-1` and `RC-2`.

---

## THE MINIMUM SAFE TEMPORARY SUPPORT PROCEDURE

This is a **design**, not an implementation. §317 forbids implementing an insecure manual reset and
forbids exposing reset tokens, and neither was done. Nothing below has been built.

### What it must not be

- **Not** an operator-set password. Anyone who can set a customer's password can read that
  customer's safety records, and the audit trail would show the customer acting.
- **Not** a reset token read out of the database, a log or a support console. A reset token is a
  bearer credential; `DEV_EXPOSE_RESET_TOKEN` is refused in production for exactly this reason.
- **Not** a support channel that accepts "I forgot my password" from an unverified requester. During
  an invitation-only Beta, the person asking may not be the person who owns the account.

### What it should be, given what already exists

**The invitation IS the identity proof.** Every Beta participant was invited by the product owner
out of band, to an address the owner chose. That is a stronger binding than any support workflow
could reconstruct, and it costs nothing to use.

1. **The participant contacts the person who invited them**, through the channel the invitation
   came through. The `/forgot-password` page now says this. No new address, no new infrastructure,
   nothing brand-dependent.
2. **The owner verifies the requester out of band** — the same channel, the same person, the
   invitation itself as the record.
3. **The owner does NOT reset the password.** The participant's existing account is left alone.
4. **Recovery is by deletion and re-invitation, which the product already supports end to end.**
   `DELETE /auth/me` exists, was built at §313 and exercised in production at §313A and §314A, and
   erases the account's evidence from R2. Registration is self-serve and takes a minute. A
   participant who has lost access and has little captured work loses little; one who has captured
   work has, by definition, been able to sign in recently.
5. **If the participant HAS captured work they cannot afford to lose**, the honest answer during
   Beta is that the owner should not improvise. Either wait for EM-2 to close, or accept the loss
   and re-invite. Inventing a credential path to preserve a draft inspection is the wrong trade.

### The single change that retires this whole procedure

Close EM-2: register the domain, verify a sending domain with the provider, set `RESEND_API_KEY`,
`PASSWORD_RESET_FROM_EMAIL`, `PRODUCT_NAME` and the reset frontend URL. **No code change is
required** — §306 finished the software and §317's page change is self-cancelling, because the
notice only renders while the service reports `NOT_CONFIGURED`. The moment the credential is set,
`/forgot-password` returns to offering the form, with no second deployment.

It is brand-gated, which is why §317 did not do it: a sending domain established under a temporary
name has to be torn down.
