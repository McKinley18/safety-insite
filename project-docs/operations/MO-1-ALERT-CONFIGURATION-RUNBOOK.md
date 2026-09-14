# MO-1 — configuring the production alert destination, and proving it arrives

Written at **§295**, unexecuted. This is the ordered procedure for closing `MO-1`, prepared so that
the moment the owner supplies a destination the closure is a sequence of commands with pass
conditions rather than an improvisation against production.

**Every step has a pass condition. A step that does not pass stops the closure.** Nothing here may
be skipped on the grounds that the previous step looked fine.

---

## 0. What §295 established, and why it changes the choice

§293 recorded the remaining work as *"name a destination and supply a credential."* §295 found that
the email architecture the owner selected has a **prerequisite nobody had checked**: Resend will only
send from a domain verified in the account, verification is DNS records published on a domain you
control, and **the Vercel account holds zero custom domains** — the product is served from
`safety-insite.vercel.app`, whose apex `vercel.app` belongs to Vercel.

So there are three real options, and the first two are genuinely different in cost.

| | what it needs | what it gets |
|---|---|---|
| **A — webhook** | one URL for a receiver the owner controls. **No domain, no DNS, no mail provider, no account beyond the receiver.** | Closes `MO-1`. Does **not** help `EM-2`. |
| **B — email via Resend on an owned domain** | a domain the owner controls, its DNS records published for Resend, a Resend account, a key | Closes `MO-1` **and** unblocks `EM-2`, which needs a verified sender regardless. |
| **C — email via Resend on `resend.dev`** | a Resend account only | **Not recommended and not authorised here.** `onboarding@resend.dev` is Resend's shared test sender: it is rate-limited and can only deliver to the account holder's own address. It would close `MO-1` on an affordance that breaks the moment a second recipient exists, and it does nothing for `EM-2`. |

**§293 said not to prefer a webhook merely to obtain a faster green gate "if an approved Resend
configuration is now available."** It is not available — there is no verified domain and no account
session. Option A is therefore a legitimate architecture on the merits, not a shortcut, and the
choice between A and B is the product owner's.

**`EM-2` is only closable through B.** Password reset must send from a verified sender; a webhook
cannot deliver a reset link to a user. If the owner wants password reset to work, B is required
eventually, and doing B now closes both.

> ### §296 — the owner chose **A**, for a reason that outlives this section
>
> Not on cost and not on speed: **the product name is going to change before external beta**, and a
> verified sending domain is exactly the kind of infrastructure that entrenches a name. A webhook
> URL can be replaced in one environment variable; a verified domain, its DNS, its warmed sending
> reputation and every address on it cannot. **`EM-2` stays open deliberately** and transactional
> email is deferred until after the brand decision or until Threshold C forces it — whichever comes
> first. This runbook's Option B remains written and unexecuted for that day.

### §296 — what was proven about the webhook branch before choosing it

§291 and §292 proved the webhook branch against a local receiver, but that was **before §294 rewrote
the dispatcher**, and §294's own gate proved the new outcome machinery entirely on the **email**
branch — the string `webhook` does not appear in it. So at the moment the architecture was selected,
the webhook branch's outcome recording had never been executed.

`npm run test:296-webhook-channel` — **15/15**, 0 network, 0 provider calls. It covers configuration
and precedence, all four bounded outcomes, `DEGRADED` and recovery, dedupe and the ceiling on this
channel, containment, the real `ServerErrorAlertFilter` for the quiet statuses, and an anti-vacuity
case showing the retired `.catch(() => undefined)` would have recorded nothing for a 404.

**Two response shapes are asserted because real receivers return them.** Discord answers `204 No
Content` and Slack answers `200` with the plain-text body `ok`; both are `DELIVERY_ACCEPTED`. A
dispatcher that only recognised a JSON acknowledgement would have reported every successful Slack
delivery as a failure — which is why the webhook branch deliberately does **not** apply the email
branch's `MALFORMED_RESPONSE` rule. An arbitrary receiver has no acknowledgement schema, so 2xx *is*
the acknowledgement.

**What is on the wire was measured, not assumed.** A payload carrying a planted observation text, a
planted `Authorization` header and a planted API key transmits the identifiers and `[redacted]`, and
none of the three planted strings. The alert body is the same redacted metadata the log line already
carried.

---

## 1. Preflight — before anything reaches production

Run the product's own resolver over the candidate values. **0 network, 0 provider calls.**

```bash
cd backend
OPERATIONAL_ALERT_EMAIL='<monitored mailbox>' \
RESEND_API_KEY='<key>' \
PASSWORD_RESET_FROM_EMAIL='<verified sender>' \
npx ts-node scripts/preflight-295-alert-configuration.ts
```

**Pass condition:** `READY TO CONFIGURE`. If it says `DO NOT CONFIGURE YET`, the reason names the
missing or malformed value — fix it here, not in production.

> **What the preflight cannot tell you.** It checks *structure*, not *ownership*. A well-formed
> address on a domain the owner does not control passes here and is rejected by Resend at send time.
> That is the correct division: §294 made the provider's rejection visible, so the failure surfaces
> as `PROVIDER_REJECTED` and `DEGRADED` rather than as silence.

## 2A. Configure — the webhook path

One variable, server-side only:

```bash
OPERATIONAL_ALERT_WEBHOOK_URL=<the receiver URL>
```

**The URL is the credential.** It carries no auth header, so anyone holding it can post to the
channel. It therefore belongs in the Render service environment and **nowhere else**: not in
`frontend-next`, not in any `NEXT_PUBLIC_*` variable, not in Preview, not in source control, not in
an evidence file. Record its *host* in evidence, never the full path.

**Pass condition:** the Render environment-variable count increases by exactly one, no Vercel
variable is added, and no other variable changed.

## 2B. Configure — the email path, secrets straight into the secret store

The credential is set **in the Render dashboard or by the owner**, never pasted into chat, never
committed, never echoed by a command. `OPERATIONAL_ALERT_EMAIL` and the sender are configuration
rather than secrets and may be set through the API.

Key hygiene, per §295: **Sending Access permission only**, and **restricted to the verified domain**
if the account offers it.

**Pass condition:** the service's environment-variable count increases by exactly the number of
values added, and no other variable changed.

## 3. Restart and confirm the claim

Render restarts on an environment change. Then:

```bash
curl -s https://safescope-backend.onrender.com/health/ready | jq '.monitoring'
```

**Pass condition:** `alerting` is `CONFIGURED`, `channel` is `email` (or `webhook`), and
`lastDelivery` is `null`. **`NOT_CONFIGURED` here means the sender is missing or malformed and the
`detail` says which** — that is §294 working, not a failure of this runbook.

## 4. Induce ONE qualifying failure

The alert must be raised by a **real** error-severity operational event, not by a test hook.

The bounded way to do that in production is the one §291 used locally: point storage at a bucket
that does not exist, generate one report on a **synthetic** account, and restore the bucket
immediately. That produces `storage.operation_failed` and `report.generation_failed` — two alerts,
one per kind — with no customer-visible consequence at a threshold where there are no customers.

**Before starting:** record the current `STORAGE_S3_BUCKET` value so the restore is exact.
**Time-box it.** Report generation is unavailable for the duration, so the window is one report, not
one session. **Restore the bucket before verifying anything**, so a failure to verify cannot leave
production misconfigured.

**Pass condition:** the report request returns HTTP 500 and `STORAGE_S3_BUCKET` is back to its
recorded value with `/health/ready` reporting `ready`.

## 5. Prove submission, then prove ARRIVAL

```bash
curl -s https://safescope-backend.onrender.com/health/ready | jq '.monitoring.lastDelivery'
render logs -r srv-d7kl74jeo5us73deaor0 --text monitoring.alert_
```

**Pass condition, submission:** `lastDelivery.outcome` is `DELIVERY_ACCEPTED` with a 2xx status, and
a `monitoring.alert_delivered` line is in the log store.

**Pass condition, ARRIVAL — and this is the one that closes `MO-1`:** the alert is **in the
monitored mailbox**, with the event name in the subject. A provider 2xx is submission, not receipt;
§291's whole point was that "retrievable" is not "visible", and `DELIVERY_ACCEPTED` is the same
distinction one layer up. **Do not close `MO-1` on step 5's first half.**

If `lastDelivery.outcome` is `PROVIDER_REJECTED`, the status says why — `403` is almost always an
unverified sending domain. Fix and repeat from step 1.

## 6. Re-prove the noise policy on the configured channel

With a destination now attached, confirm the quiet path is still quiet.

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://safescope-backend.onrender.com/section295-probe-404
curl -s -o /dev/null -w '%{http_code}\n' https://safescope-backend.onrender.com/auth/me
curl -s -o /dev/null -w '%{http_code}\n' -X POST -H 'content-type: application/json' \
  -d '{"nope":1}' https://safescope-backend.onrender.com/auth/login
```

**Pass condition:** 404, 401, 400 returned; **zero** new alerts in the mailbox; `serverErrorsInWindow`
still `0`; `lastDelivery` unchanged from step 5.

## 7. Record

`MO-1` closes on: the configured channel, `alerting: CONFIGURED`, one `DELIVERY_ACCEPTED`, **the
mailbox screenshot or message id**, and the step-6 silence. Anything less is an emission layer with a
destination attached, which is what §291 already had.

---

## Rollback

Remove `OPERATIONAL_ALERT_EMAIL` (or `OPERATIONAL_ALERT_WEBHOOK_URL`). The channel returns to
`NOT_CONFIGURED` and the product returns to the state it is in today. No schema, no data, no
deployment is involved in any step above, so rollback is one variable and a restart.
