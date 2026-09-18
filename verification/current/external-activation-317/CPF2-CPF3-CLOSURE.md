# §317 — CPF-2 AND CPF-3, CLOSED OR DEFERRED, ENTRY BY ENTRY

Both entries were **re-derived from the register before any implementation**, not from the §316
summary and not from memory.

- **CPF-2** — *"Batch 6/7 surfaces never page-reviewed: /profile, /upgrade, /unlock, /pricing,
  /about, /hazlenz, /legal, /forgot-password, /reset-password, 404 / error / loading states."*
  Remediation: a bounded Batch 6/7 review, public claim-bearing pages first. Retest: a page-review
  batch at 390/768/1280/1440 in both themes with the §286 instrument discipline.
- **CPF-3** — *"/settings, /inspections and /login carry ADJUSTMENTS_REQUIRED from earlier batches;
  the adjustments were never closed."* Remediation: record each adjustment as closed or deliberately
  deferred. Retest: re-review of the three surfaces.

**One discrepancy, recorded rather than silently resolved.** CPF-2's register text enumerates ten
surfaces and omits `/` and `/register`, while the batch table's batch 7 includes both. §317 swept
all sixteen but claims CPF-2 closure only over the ten the register names; `/` and `/register` are
reported separately. This matters because `/register` turned out to carry the most consequential
finding of the whole sweep — every form field unlabelled — and widening a register entry to absorb
one's own finding is how a register stops being an authority.

---

## CPF-3 — EACH REGISTERED ADJUSTMENT

### `/login`

| # | Adjustment as recorded at batch 1 | Disposition |
|---|---|---|
| **O-14** | The email field is not `type="email"` (it carries `inputMode="email"` only), so the browser performs no email validation and offers no email autofill affordance. | **CLOSED.** `type="email"` added. Verified live before the change (`AppInput` passes props through and none set a type, so it rendered `text`) and after (gate case `CPF3-1`). Nothing else on `/login` was touched — §317 forbids using CPF-3 as permission for a login redesign, and no redesign was made. |

### `/inspections`

| # | Adjustment | Disposition |
|---|---|---|
| **O-4** | Two different left margins inside one card: headings at 121px, form controls at 256px. | **CLOSED.** Re-measured at §317 before the change and still live: at 1280px the headings sat at **105px** and the controls at **256px**. The heading was given the same `max-w-3xl` measure as the form rather than the form being widened, because widening would stretch two selects across 1440px to fix a 151px misalignment. `SectionHeader` itself is untouched — it is shared by every panel in the product. Gate case `CPF3-2a`. |
| **O-5** | The workflow cards truncate mid-sentence and leave double terminal punctuation — `…notes.…`. | **CLOSED.** Re-measured before the change and clipped at **every width** (390/768/1280/1440: `scrollHeight` 60 and 80 against a `clientHeight` of 40). `line-clamp-2` removed; the card is already `h-auto`. Gate case `CPF3-2b`. |
| **O-6** | *"Regulatory context not established"* appears twice within three lines of the same footnote, which is also the only centred text on a left-aligned page. | **CLOSED, both halves.** The footnote named the Settings default AND the value saved on the inspection; before either is chosen they are the same value, so a new account read the phrase twice. The two are now stated separately only when they actually differ. The footnote is also no longer centred and shares the form's measure. Gate case `CPF3-2d`. |
| **O-7** | *"Saved to Safety InSite · 0 persisted inspections"* — "persisted" is engineering vocabulary on a customer surface. | **CLOSED.** Now *"… · N inspections on your account"*, which also draws the distinction this page needs, because the sentence beside it is about Field Capture holding work on the device. Gate case `CPF3-2c`. |
| S-7, S-12 | Subjective: the relative loudness of *Open Field Capture*; "HazLenz AI" appearing five times. | **DEFERRED — product-owner direction.** Unchanged, per the standing rule that subjective changes are recorded rather than made unilaterally. |

### `/settings`

| # | Adjustment | Disposition |
|---|---|---|
| **O-10** | Subscription status renders the raw value `none` in lower case where every neighbouring value is title case. | **CLOSED.** The normalized Stripe vocabulary is mapped to customer words, with an unmapped value falling back to the raw string de-underscored rather than to a guess. The same class of defect on `/profile` — the raw plan **code** where the plan **name** belongs, in two places — was closed with it. Gate case `CPF3-3a`. |
| **O-11** | *"…checkout and portal actions are unavailable until the **Stripe** environment is set."* names an internal vendor dependency to the customer. | **CLOSED.** Reworded on the shared billing panel and on `/upgrade`, which carried its own *"on this environment"* variant. Sweep count `INTERNAL_VENDOR_NAMED_TO_CUSTOMER` fell **16 → 0**. Gate case `CPF3-3b`. |
| S-8, S-11 | Subjective: centred hero over left-aligned cards; disabled controls at 3.86:1 being hard to read. | **DEFERRED.** S-11 is now measured separately by the instrument as `CONTRAST_BELOW_AA_ON_INACTIVE_CONTROL` at APP_FORMAT severity, so it is visible without being misfiled as a standards failure. |

### Shell-scoped adjustments, which CPF-3 does NOT name — status reported for completeness

| # | Status at §317 |
|---|---|
| **O-2** shared `<title>` | **CLOSED by earlier work.** Measured: every surface now has a distinct route-derived title — `Pricing · Safety InSite`, `About · Safety InSite`, `Sign in · Safety InSite`, `Settings · Safety InSite`, and so on. |
| **O-12** Settings absent from the mobile tab bar | **CLOSED by earlier work.** The shell now carries five items — Home, Inspect, Reports, Calendar, Settings. |
| **O-3** two competing page shells; **O-13** hard-coded `v1.0` marker | Not re-measured by §317 and **not claimed closed.** They belong to the shell row, which the register did not place in CPF-3. |

### One item CPF-3's closure does NOT cover

An intermittent **React hydration text mismatch (#418)** on `/settings`, observed in 1 of 128
page/theme/width visits in the final sweep and 3 of 128 in an earlier one. React recovers from it by
re-rendering on the client, so it is a recoverable warning rather than a crash, and every other
measurement on the affected visits was normal. §317 could not reproduce it in eleven targeted
attempts across both themes and four widths; it removed the one candidate cause inside its own
change — a newly introduced empty-text branch in the billing panel — and the mismatch still occurred.
**Cause not established. Recorded as open.** `/settings` is a CPF-3 surface, so CPF-3 closes with
this item explicitly outstanding rather than by declaring it absent.

---

## CPF-2 — THE TEN SURFACES THE REGISTER NAMES

Every surface measured at **390 / 768 / 1280 / 1440 in both themes**, on a production build, with
every `<details>` opened first so nothing behind a closed disclosure went unmeasured, and with
accessibility measured by real keyboard traversal rather than programmatic focus.

| Surface | Outcome |
|---|---|
| `/pricing` | **PASS with one claim finding.** No objective defect on the surface itself. `CS-2` opened against two Pro feature lines with no customer-reachable implementation. |
| `/about` | **PASS.** |
| `/hazlenz` | **PASS with one recorded item** — the inline "legal disclaimer" link measures 105x18, under the product's 36px floor. Deferred: §281 decided that standalone action links get a 44px target and words inside a sentence do not, and this is the latter. Claims captured for CM-1. |
| `/legal` | **PASS.** Still DRAFT / NOT COUNSEL APPROVED / NOT OPERATIVE; `check:legal-documents` 23/23 with 0 published and 0 ACTIVE. |
| `/forgot-password` | **ADJUSTMENTS MADE AND CLOSED.** It promised an email the service cannot send. See `LOCKOUT-AND-RECOVERY.md`. Gate cases `RC-1`, `RC-2`. |
| `/reset-password` | **PASS**, measured with no token and with an invalid token. Neither produces a blank page, a stuck loading state or a raw error. |
| `/profile` | **ADJUSTMENTS MADE AND CLOSED** — raw plan code, the named vendor, and a comped account shown a price it does not pay. |
| `/upgrade` | **ADJUSTMENTS MADE AND CLOSED** — "on this environment" reworded. One recorded item: *See the complete plan comparison* measures 175x34 at 390px. |
| `/unlock` | **PASS with one objective finding, DEFERRED.** The *Local Security* eyebrow measures **3.59:1 at 11px bold** against a 4.5:1 requirement, in light theme, at every width. It is a genuine AA failure and it is a **colour-token decision**: the value is the product's orange, whose semantics are an open product-owner question (S-5), and §317's authority explicitly excludes branding. Repairing it by darkening one brand colour unilaterally would be exactly the kind of change §317 forbids. Opened as **AC-2**. |
| 404 / error / loading states | **PASS for a signed-in user.** For a signed-out visitor an unknown URL redirects to `/login` rather than rendering the 404 — behaviour §280 recorded and deliberately left as a product decision. It violates none of §317's four criteria and is reported as an observation. |

## SURFACES SWEPT BUT OUTSIDE THE CPF-2 REGISTER TEXT

| Surface | Outcome |
|---|---|
| `/register` | **ADJUSTMENTS MADE.** All six form fields — first name, last name, email, password, confirm password, promo code — had **no programmatic label of any kind**, only placeholders. This is the first surface an invited participant meets and the only one between them and an account, so a screen-reader user could not reliably create one. `aria-label` added to each, matching the placeholder exactly. The email field also gained `type="email"` — the same defect as O-14 and worse here, because a participant who mistypes their own address at registration owns an account at an address that does not exist and password recovery can never reach them. The Terms and Privacy links were given the same tap target `/login`'s action links received at §281. |
| `/` | **PASS.** |
