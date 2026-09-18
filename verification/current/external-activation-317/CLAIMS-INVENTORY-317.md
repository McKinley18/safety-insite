# §317 — CUSTOMER-VISIBLE CLAIMS ENCOUNTERED

**This is input to CM-1, not CM-1.** §317 was told to inventory the claims it met while reviewing
surfaces and not to perform the claims audit. Nothing here is adjudicated against
`project-docs/legal/CLAIMS-GUARDRAILS.md` or against FTC substantiation expectations; each row
records the surface, the claim as it is worded today, and what its truth depends on.

Captured from the running product on the §317 build, with every `<details>` opened so nothing behind
a closed disclosure was missed. Full page text: `claim-surfaces.json`.

## `/hazlenz` — the engine page

| Claim, as worded | Evidence dependency |
|---|---|
| "A governed hazard intelligence engine that interprets inspection observations, extracts structured hazard context, reasons across equipment, task, exposure, energy, and control factors, identifies evidence gaps, and supports advisory corrective action review." | Six capability assertions in one sentence. Each needs to hold on the deterministic path a Free-to-Pro Beta participant actually reaches. |
| "Matches structured observations against **approved** MSHA and OSHA (General Industry and Construction) regulatory frameworks" | The word *approved*. The product's own workspace says of a citation it returns: *"The regulatory text shown for this standard has not completed source review."* Those two statements need reconciling. |
| "when a single observation describes more than one hazard, it **decomposes** the passage into separate, independently tracked findings" | Multi-hazard decomposition, on the production path. §317 exercised a single-hazard observation only. |
| "**Autonomously** identifies missing or ambiguous parameters … and flags them as critical questions" | Observed true for one case: the unresolved fact *"moving or accessible energy"* was raised with a settling question. Generality not established by §317. |
| "**Every** finding includes a full visual and step-by-step AI Reasoning Trace." | A universal. Not measured at §317. |
| "Designed with a **strict fail-safe**." | A design characterisation, not a measurement. |
| "Proposes a layered action plan … structured on the hierarchy of controls" | Observed true: an immediate action, a permanent correction and a verification step were offered. |
| "the engine's observation understanding is supported by an automated multi-scenario benchmark covering core industrial hazard scenarios" | **The load-bearing substantiation claim on the page.** Depends on a benchmark that exists, is current against the shipped engine, and covers what "core industrial hazard scenarios" implies. |
| "HazLenz AI supports professional judgment. It does not replace qualified safety review, declare violations, create citations, determine compliance, or make final decisions." | A limitation, not a capability claim. Consistent with `/legal`. |

## `/about`

| Claim, as worded | Evidence dependency |
|---|---|
| "Safety InSite helps safety professionals turn field observations into documented findings, risk review, standards support, corrective action, and inspection-ready records." | The whole chain. §317 executed it end to end on a Pro account. |
| "Support MSHA and OSHA review by tying standards, reasoning, and inspection evidence back to the original finding." | Standards-to-evidence linkage. |
| "HazLenz AI is advisory decision support. It does not replace professional judgment, declare violations, create citations, or override regulatory requirements." | Limitation; consistent. |

## `/pricing`

| Claim, as worded | Evidence dependency |
|---|---|
| "$24.99/mo" | The price. Production holds `STRIPE_PRO_PRICE_ID`; §317 made no charge and verified no price object. |
| "HazLenz AI reviews it — The observation comes back as an organized hazard analysis with the evidence gaps named." | Observed true on Pro. |
| "Applicable MSHA and OSHA standards are suggested for the hazard so the finding has support." | Observed: `29 CFR 1910.212(a)(1)` on a machine-guarding observation. |
| "Risk and confidence signals on each finding" | Observed: High (16), Confidence: Low with a stated reason. |
| "Human review before a finding is accepted" | Observed. |
| **"Inspection planning and assignment tools"** | **NO CUSTOMER-REACHABLE SURFACE.** No frontend caller for the assignment API. Opened as **CS-2**. |
| **"Dashboards, analytics, and audit trail"** | **NO CUSTOMER-REACHABLE SURFACE.** No frontend caller for `/dashboard/*`; `auditTrail` appears in exactly one frontend file — the pricing copy itself. Opened as **CS-2**. |
| "Cloud reports" | Delivered. §305A established this. |
| "Free is the record-keeping tier. It captures and stores the observation. Everything HazLenz reasons about is on Pro." | Observed true, including the 402 boundary and its wording. |
| "A basic audit app records the issue. Pro helps you say what it means and what happens next." | Comparative marketing framing. |

## `/legal`

The disclaimer page carries the limitation claims — no compliance determination, no citations,
professional review required, user responsibility — and is internally consistent with `/about` and
`/hazlenz`. It is **DRAFT / NOT COUNSEL APPROVED / NOT OPERATIVE**, and §317 neither modified nor
activated it. `check:legal-documents` passes 23/23 with **0 published documents and 0 ACTIVE in
production**, and 17 temporary-brand occurrences remain in the draft text for counsel.

## `/register`

| Claim, as worded | Evidence dependency |
|---|---|
| "Every account is created on Free. Choosing Pro takes you to secure checkout after you sign in." | Observed true. |
| "Free keeps the inspection record. Pro adds the HazLenz AI review, the standards, the corrective actions and the reports. You can move up later without losing anything you have already captured." | The no-loss-on-upgrade promise. §317 did not exercise an upgrade. |
| The acknowledgement checkbox: "I understand Safety InSite and HazLenz AI provide decision-support only…" plus "This is an internal pre-release acknowledgement and has not been reviewed by legal counsel. It is not the Terms of Service." | Server-validated against the registry; the acceptance row records `counselStatusAtAcceptance NOT_COUNSEL_REVIEWED`. |

## Product-wide

"Field safety intelligence powered by HazLenz AI." — in the footer of every page and, per batch 1's
O-2, in the `<title>` of most of them.
