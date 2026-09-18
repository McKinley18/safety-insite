# §317 — THE CUSTOMER-VISIBLE PAYMENT SURFACES, CLASSIFIED

No real payment was made. No checkout session was created. **Real charges: $0.00.**

## THE ENVIRONMENT DIFFERENCE THIS DOCUMENT DOES NOT BLUR

Production holds `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRO_PRICE_ID` (§307
secret scan, by exact value across 9,046 tracked files). The §317 verification environment holds
none of them. So `billingConfigured` is **true in production and false here**, and the two present
differently. Each row below states which environment its classification describes and says so when
the other could not be observed.

| Surface | State | Evidence |
|---|---|---|
| `/pricing` | **MISLEADING** | Not about payment mechanics — about what the paid plan is said to include. See CS-2 below. |
| `/upgrade` | **SAFE_BUT_INACTIVE** where billing is unconfigured; **READY** in production | The control is disabled, the state is stated, and the reassurance is correct. §317 removed the word "environment" from the explanation. |
| `/settings` → Billing | **SAFE_BUT_INACTIVE** where unconfigured; **READY** in production | Same shared panel. §317 repaired three things here: the raw status code, the named vendor, and the price shown to a comped account. |
| `/profile` → Billing | as `/settings` | Same panel, plus the account's own plan label, which was rendering the raw plan code. |
| `/register` plan chooser | **READY** | *"Every account is created on Free. Choosing Pro takes you to secure checkout after you sign in."* Measured true: self-registration never grants a paid plan. |
| Stripe portal | **SAFE_BUT_INACTIVE** | Requires a `stripeCustomerId`, which only a real purchase creates. `503 "Stripe billing is not configured on this server."` where unconfigured. |

---

## THE THREE PAYMENT-SURFACE DEFECTS §317 REPAIRED

### A comped account was shown a price it does not pay

`BillingSettingsPanel` rendered the catalogue price for the tier unconditionally. An account holding
Pro through a pilot or support **grant** — which is how every comped Beta participant would hold it
— was shown:

```
CURRENT PLAN          Pro
                      $24.99/month
SUBSCRIPTION STATUS   none
                      Not available
```

…having never paid anything, with no payment method on file, and with the grant's end date nowhere
on the page although the server had already sent it. `tierSource`, `accessSource` and
`entitlementExpiresAt` were all in the `/billing/status` payload and **none of the three was
declared in the frontend's `BillingResponse` type**, so nothing on a customer surface could read
them.

Now: `Included access` / *"Granted access, ends September 25, 2026. No payment method is on this
account."* and, in place of the price, *"Included — nothing is billed to this account."*

### The raw status code reached the customer *(O-10)*

`status` is normalized Stripe vocabulary and was rendered straight onto the account surfaces, so a
new account read a lower-case `none` in a row of title-case values and a struggling payment would
have read `past_due`. Now mapped to customer words, with an unmapped value falling back to the raw
string de-underscored rather than to a guess.

`/profile` had the same class of defect twice more, rendering the plan **code** (`free`, `pro`)
where the plan **name** belongs.

### An internal vendor was named to the customer *(O-11)*

*"…checkout and portal actions are unavailable until the Stripe environment is set."* named a
payment processor and a deployment concept to someone who can act on neither. `/upgrade` carried its
own variant, *"Checkout is not available on this environment yet."* Both now say what is true for
the reader and keep the reassurance, which is the part that matters to someone who has already
captured work on Free.

Gate cases `CPF3-3a` and `CPF3-3b`; the sweep's `INTERNAL_VENDOR_NAMED_TO_CUSTOMER` count fell from
16 to 0.

---

## CS-2 — THE ONE THAT IS *NOT* REPAIRED, AND WHY

`/pricing`'s Pro column offers:

- **"Inspection planning and assignment tools"**
- **"Dashboards, analytics, and audit trail"**

An individual Pro account is granted `inspectionAssignments`, `analytics`, `auditTrail`,
`teamMembers`, `companyAnalytics` and `sharedReports`, all `true`. The frontend contains **no caller
for the assignment API, no caller for `/dashboard/*`**, and the string `auditTrail` appears in
exactly one file in the entire frontend — `components/pricing/planData.ts`, the pricing copy itself.

This is CS-1's shape on different words. §305A inventoried the customer surface for *team*
vocabulary and removed the "team members" promise; these two lines survived because they are not
team-worded.

**Not repaired at §317.** Removing the line, rewording it and building the surface are three
different product decisions with three different costs, and the wording of a claim about what a paid
plan delivers is CM-1's subject, which §317 routes to the dedicated claims and legal pass. Opened as
**CS-2**, BLOCKS_EXTERNAL_BETA.

---

## IF BETA IS ULTIMATELY COMPED OR FREE

§317 does not make that decision. What it can say, from measurement, is exactly which surfaces would
need to change and which would not:

**Would need hiding or disabling** — every path that offers a purchase a comped participant is not
expected to make:
- `/upgrade`, in its entirety, for an account that already holds Pro through a grant. It is
  currently reachable and shows the purchase card.
- The **Upgrade to Pro** control in the billing panel on `/settings` and `/profile`.
- `/register`'s Pro plan chooser and `/pricing`'s **Start Pro** call to action, if participants are
  not meant to pay at all during Beta.

**Would NOT need changing:**
- The billing panel's plan and status tiles, which after §317 describe a granted account correctly,
  including its end date.
- **Manage Subscription**, which is already disabled without a `stripeCustomerId` and is therefore
  already correct for a comped account.
- `/pricing` as a description of the product — subject to CS-2.
