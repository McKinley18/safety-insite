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
      {
        title: "Reports and records",
        items: [
          "Professional inspection reports",
          "Cloud reports and team members",
          "Inspection planning and assignment tools",
          "Dashboards, analytics, and audit trail",
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
      "Applicable MSHA and OSHA standards are suggested for the hazard so the finding has something behind it.",
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
  ["Cloud reports and team members", "No", "Yes"],
  ["Advanced review controls and audit trail", "No", "Yes"],
  ["Inspection planning and assignment tools", "No", "Yes"],
  ["Advanced dashboards", "No", "Yes"],
] as const;
