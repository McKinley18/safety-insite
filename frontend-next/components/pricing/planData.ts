// Single source of truth for the customer-facing v1.0 plan presentation.
//
// LAUNCH CONTRACT: FREE = $0, PRO = $24.99/month, EXPERT = NOT_A_V1_PLAN.
//
// Both /pricing (acquisition) and /upgrade (in-product conversion) read this module.
// They are deliberately DIFFERENT experiences built from the SAME data: before this
// existed, each surface authored its own copy of the plan table, which is how the
// registration page shipped a price two repricings out of date (blueprint 71.12).
// Change a price or a claim here and every surface moves together.
//
// Every claim below is a MEASURED entitlement, not an aspiration. A Free account
// receives 402 PAID_SUBSCRIPTION_REQUIRED from classify, applicable-standards/suggest,
// actions and report generation, so none of those may be advertised under Free.
// Keep this synchronised with backend/src/billing/plan-entitlements.ts, which is the
// enforcement source of truth.

export const PRO_PRICE_DISPLAY = "$24.99";
export const PRO_PRICE_CADENCE = "/month";
export const FREE_PRICE_DISPLAY = "$0";

export type PlanSection = {
  title: string;
  items: readonly string[];
};

export type LaunchPlan = {
  name: string;
  tier: "free" | "pro";
  price: string;
  cadence: string;
  audience: string;
  position: string;
  cta: string;
  publicHref: string;
  featured: boolean;
  badge: string | null;
  sections: readonly PlanSection[];
};

export const LAUNCH_PLANS: readonly LaunchPlan[] = [
  {
    name: "Free",
    tier: "free",
    price: FREE_PRICE_DISPLAY,
    cadence: PRO_PRICE_CADENCE,
    audience: "Keep a clean record of what you saw and where you saw it.",
    position:
      "Free is the record-keeping tier. It captures and stores the observation. Everything HazLenz reasons about is on Pro.",
    cta: "Create free account",
    publicHref: "/register?plan=free",
    featured: false,
    badge: null,
    sections: [
      {
        title: "Included",
        items: [
          "Inspection and site records",
          "Written observations with photo evidence",
          "Location, work area, and task notes",
          "Saved inspection history",
          "Safety calendar tasks and reminders",
        ],
      },
      {
        title: "Not included on Free",
        items: [
          "HazLenz AI hazard analysis",
          "Suggested MSHA / OSHA standards",
          "Recorded findings and risk scoring",
          "Corrective actions and tracking",
          "Generated inspection reports",
        ],
      },
    ],
  },
  {
    name: "Pro",
    tier: "pro",
    price: PRO_PRICE_DISPLAY,
    cadence: PRO_PRICE_CADENCE,
    audience: "For the safety professional who has to defend the finding later.",
    position:
      "Pro turns the observation into a finding: hazard analysis, the standard behind it, the corrective action, and the report.",
    cta: "Start Pro",
    publicHref: "/register?plan=pro",
    featured: true,
    badge: "Full access",
    sections: [
      {
        title: "HazLenz AI review",
        items: [
          "Hazard analysis of the observation and its photos",
          "Suggested MSHA / OSHA standards for the hazard",
          "Risk and confidence signals on each finding",
          "Prompts for the evidence a finding is missing",
        ],
      },
      {
        title: "Findings and corrective actions",
        items: [
          "Recorded findings with risk scoring",
          "Corrective action recommendations and tracking",
          "Action owners, due dates, and status",
          "Human review before a finding is accepted",
        ],
      },
      /*
       * §319 (CS-2). TWO ADVERTISED CAPABILITIES HAD NO CUSTOMER-REACHABLE SURFACE.
       *
       * §318 verified it three ways: there is no frontend caller for the assignment API, no
       * frontend caller for `/dashboard/*`, and the string `auditTrail` appeared in exactly one
       * file in the whole frontend — this one. A participant paying $24.99/month read "inspection
       * planning and assignment tools" and "dashboards, analytics, and audit trail", signed in, and
       * found neither.
       *
       * This is CS-1's defect on different words. §305A swept the customer surface for TEAM
       * vocabulary and removed the "team members" promise; these survived because they are not
       * team-worded.
       *
       * §319's direction is to PREFER FACTUAL REWORDING over deletion where useful information
       * survives — so each line is treated on its own merits rather than struck as a group:
       *
       *   "Inspection planning and assignment tools" — DELETED. Assignment is Company/Team, which
       *   §305A deferred deliberately, and there is no planning surface to describe instead.
       *   Nothing true remains to say, so nothing is said.
       *
       *   "Dashboards, analytics, and audit trail" — REWORDED. The real capability underneath it is
       *   report revision history (D-046, §286): finishing an inspection again issues a new revision
       *   and keeps the one it replaced, so a report already filed stays available exactly as
       *   issued. That is the record-keeping property the line was gesturing at, it is Pro-gated,
       *   and it is worth naming.
       *
       * The entitlement flags (`inspectionAssignments`, `analytics`, `auditTrail`) are NOT touched
       * here. They remain true for Pro and are harmless while nothing on a customer path reads
       * them; making them agree with this copy is registered under CS-2 rather than done in a
       * pricing file.
       */
      {
        title: "Reports and records",
        items: [
          "Professional inspection reports",
          "Cloud reports",
          "Report revision history — reissuing a report keeps the one it replaced",
        ],
      },
    ],
  },
] as const;

/**
 * The four Pro capabilities that answer "what do I get for $24.99?" fastest.
 * Used by /upgrade, which has to make the case in one phone viewport rather
 * than in a full plan table.
 */
export const PRO_HEADLINE_BENEFITS: readonly { title: string; detail: string }[] = [
  {
    title: "HazLenz AI reviews the observation",
    detail:
      "Photos and notes come back as an organized hazard analysis with the evidence gaps called out.",
  },
  {
    title: "Findings cite the standard",
    detail:
      // §319 (CM-2 consistency). "Applicable … are suggested" mixed the two vocabularies in one
      // sentence. The verb was already right; the adjective is now consistent with the workflow.
      "Potentially applicable MSHA and OSHA standards are suggested for the hazard, for your review, so the finding has something behind it.",
  },
  {
    title: "Corrective actions get tracked",
    detail: "Recommended actions with an owner, a due date, and a status you can report on.",
  },
  {
    title: "Reports come out finished",
    detail:
      "Professional inspection reports built from the findings, actions, and evidence already captured.",
  },
] as const;

/** What a Free account cannot do today. Drives the /upgrade limitation list. */
export const FREE_LIMITATIONS: readonly string[] = [
  "HazLenz AI hazard analysis is unavailable",
  "No suggested MSHA / OSHA standards",
  "Findings and risk scoring cannot be recorded",
  "Corrective actions cannot be created or tracked",
  "Inspection reports cannot be generated",
] as const;

/**
 * Feature comparison. Each row is [feature, free, pro].
 * Every Free value is the measured behaviour of a Free account against the running
 * API. Rows that once read "Yes", "Preview only", "Limited" or "Manual only" for
 * Free were corrected to "No" after the corresponding endpoint was confirmed to
 * return 402 PAID_SUBSCRIPTION_REQUIRED for that tier.
 */
export const COMPARISON_ROWS: readonly (readonly [string, string, string])[] = [
  ["Observations, photos, and notes", "Yes", "Yes"],
  ["Saved inspection and site history", "Yes", "Yes"],
  ["Safety calendar tasks", "Yes", "Yes"],
  ["HazLenz AI hazard analysis", "No", "Yes"],
  ["Suggested MSHA / OSHA standards", "No", "Yes"],
  ["Evidence gap prompts", "No", "Yes"],
  ["Recorded findings and risk scoring", "No", "Yes"],
  ["Corrective action reasoning and tracking", "No", "Yes"],
  ["Generated inspection reports", "No", "Yes"],
  /*
   * §319 (CS-2). THE COMPARISON TABLE CARRIED THREE MORE INSTANCES THAN §318 COUNTED, and
   * re-deriving them was the point of being told to re-derive rather than to work from the list.
   *
   *   "Advanced review controls and audit trail" -> REWORDED. Human review recorded against each
   *   finding is real: the reviewer's decision, rationale and the facts they settled are persisted
   *   on the finding and appear in the report. That is what a reader wanted from "audit trail" and
   *   it is the part that exists.
   *
   *   "Inspection planning and assignment tools" -> DELETED, for the reason above.
   *
   *   "Advanced dashboards" -> DELETED. There is no advanced dashboard, and the dashboard that
   *   does exist is available on Free, so listing it as a Pro differentiator would be wrong twice.
   */
  ["Cloud reports", "No", "Yes"],
  ["Report revision history", "No", "Yes"],
  ["Human review recorded against each finding", "No", "Yes"],
] as const;
