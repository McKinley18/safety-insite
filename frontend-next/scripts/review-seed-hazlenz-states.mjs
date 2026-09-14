// §280 — SYNTHETIC HAZLENZ ANALYSES FOR THE PRESENTATION REVIEW. ZERO PROVIDER CALLS.
//
// ==================== WHY SYNTHETIC ====================
//
// The §280 batch reaches the HazLenz output surfaces, and the product owner's direction is
// explicit on two points: review PRESENTATION only, and do not call the provider. Those are
// compatible because the workspace renders a SAVED analysis on load — `currentDeterministicAnalysis`
// picks the newest non-superseded, non-server-authored row and restores its `resultSnapshot`. So
// a snapshot written through the ordinary authenticated API produces exactly the screens a real
// analysis produces, and costs nothing.
//
// ==================== WHAT THESE ARE AND ARE NOT ====================
//
// These snapshots are STIMULI FOR A PRESENTATION REVIEW. They are shaped to the published
// `HazLenzAnalysisResult` contract so the UI renders them the way it renders real output, and the
// text in them is written to exercise a presentation question — a long conclusion, a repeated
// caveat, several candidates at once, an unresolved applicability.
//
// They are NOT evidence about HazLenz. Nothing here says anything about whether the engine would
// reach these conclusions, whether they are correct, or how often it produces them. No semantics
// are tuned, nothing is scored, and no conclusion in this file may be cited as an engine result.
// The one question they are admissible for is: given output of this shape, what does the product
// SHOW the inspector?
//
// The five states are the ones the review has to look at:
//
//   A  a straightforward finding with one supporting standard
//   B  clarification — questions outstanding, one of them marked decision-critical
//   C  unresolved / refused — no primary standard, applicability not supported, critical unknowns
//   D  human confirmation — a conclusion the product must not act on until a person confirms it
//   E  multiple findings from one observation
//
// ==================== WHY EACH STATE ALSO GETS A PERSISTED FINDING ====================
//
// The first version of this seeder wrote only the analysis snapshot, and every one of the five
// states rendered an identical, nearly empty "HazLenz assessment" panel -- no standard, no
// clarification question, no critical unknown, not even in state A. That was the FIXTURE, not the
// product: `resolveFindingStandards` reads `finding.sourceCandidate.standardCandidates`, so the
// standards, the confidence disclosure and the clarification questions nested inside it are all
// driven by a PERSISTED FINDING. An analysis with no finding has nothing to draw them from.
//
// Reporting that first reading as "the product does not show unresolved states" would have been a
// tooling failure written up as a product verdict. Each state therefore also gets the review and
// the finding the real flow would create, so the screens under review are the screens a real
// analysis produces.
//
// Usage: API_URL=... VAL_EMAIL=... VAL_PASSWORD=... node scripts/review-seed-hazlenz-states.mjs

const API = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;

async function call(path, init = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

const CAVEAT =
  "HazLenz AI is advisory. Applicability depends on the facts and the jurisdiction, and a "
  + "qualified safety professional must verify this finding before it is finalized.";

function base(overrides) {
  return {
    regulatoryContext: {
      value: "osha-general-industry",
      provenance: "USER_CONFIRMED",
      source: "inspection",
      basis: ["Set on the inspection at start"],
    },
    evidenceSnapshot: {
      id: "synthetic-evidence-1",
      schemaVersion: "1.0",
      facts: [
        { id: "f1", type: "equipment", value: "belt conveyor", source: "observation", confidence: 0.9, status: "extracted", temporalState: "current", reviewerStatus: "unreviewed" },
        { id: "f2", type: "guard_state", value: "removed", source: "observation", confidence: 0.85, status: "extracted", temporalState: "current", reviewerStatus: "unreviewed" },
        { id: "f3", type: "exposure", value: "operator within reach", source: "observation", confidence: 0.7, status: "extracted", temporalState: "current", reviewerStatus: "unreviewed" },
      ],
      criticalUnknowns: [],
      contradictions: [],
    },
    ...overrides,
  };
}

function guided(overrides) {
  return {
    contractVersion: "synthetic-presentation-review",
    observedCondition: "Fixed guard removed from a conveyor nip point with an operator working within reach.",
    hazardCategory: "Machine guarding",
    additionalStandards: [],
    clarificationQuestions: [],
    riskAssessment: {
      severity: "Major", likelihood: "Likely", exposure: "Frequent", overallRisk: "High",
      riskLevel: "high", provisional: true, reviewerConfirmed: false,
      rationale: "An unguarded in-running nip point with routine hand feeding gives a credible amputation mechanism.",
    },
    correctiveAction: {
      immediateAction: "Stop the conveyor and bar access to the infeed until the guard is refitted.",
      permanentCorrection: "Refit the fixed guard and interlock it so the drive cannot run with the panel removed.",
      verificationStep: "Confirm the guard is in place and the interlock stops the drive when it is opened.",
      responsibleRole: "Maintenance supervisor", urgency: "immediate",
      rationale: "Guarding is the only control that removes the contact mechanism.",
    },
    reviewStatus: { status: "pending_review", reviewerConfirmed: false, editableFields: ["riskAssessment", "correctiveAction"] },
    limitations: [CAVEAT],
    provenance: { evidenceSnapshotId: "synthetic-evidence-1", rulesRelease: "synthetic", deterministicInputHash: "synthetic" },
    ...overrides,
  };
}

const STANDARD = {
  citation: "29 CFR 1910.212(a)(1)", title: "Machine guarding — general requirements", agency: "OSHA",
  simplifiedRequirement: "One or more methods of machine guarding must protect operators from hazards such as in-running nip points.",
  whyOffered: "The observation records a removed fixed guard on an in-running nip point with an operator within reach.",
  confidence: 0.86, confidenceLabel: "High", applicability: "direct",
  evidenceSupporting: ["Guard removed", "In-running nip point", "Operator within reach"],
  evidenceMissing: [], sourceStatus: "governed",
};

const STATES = [
  {
    key: "A-finding",
    title: "HazLenz state A — a straightforward finding",
    observation:
      "Fixed guard missing from the infeed nip point on the number two conveyor. The panel is leaning "
      + "against the adjacent column and operators were feeding cartons by hand within reach of the nip.",
    snapshot: base({ guidedFinding: guided({ primaryStandard: STANDARD }) }),
    findings: [
        {
            "hazardCategory": "Machine guarding",
            "segmentKey": "machine_guarding",
            "conclusion": "A fixed guard has been removed from an in-running nip point that an operator reaches into during normal hand feeding.",
            "sourceCandidate": {
                "observationFragment": "the fixed guard panel has been removed and is leaning against the adjacent column",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.212(a)(1)",
                        "family": "Machine guarding",
                        "status": "SUPPORTED",
                        "confidence": 0.86,
                        "applicability": "direct",
                        "explanation": "The observation records a removed fixed guard on an in-running nip point with an operator within reach.",
                        "missingPredicates": [],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Machine guarding \u2014 general requirements",
                        "plainLanguageSummary": "One or more methods of machine guarding must protect operators from hazards such as in-running nip points.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        }
    ],
  },
  {
    key: "B-clarification",
    title: "HazLenz state B — clarification outstanding",
    observation:
      "Two employees replacing a light fitting from a rolling scaffold at roughly 4.5 metres. Neither "
      + "was tied off, the guardrail on the open side had been removed to pass the fitting up, and the "
      + "casters were not locked.",
    snapshot: base({
      guidedFinding: guided({
        observedCondition: "Work at height from a mobile scaffold with the guardrail removed and no fall arrest in use.",
        hazardCategory: "Fall protection",
        primaryStandard: {
          ...STANDARD,
          citation: "29 CFR 1926.451(g)(1)", title: "Scaffolds — fall protection", agency: "OSHA",
          simplifiedRequirement: "Each employee on a scaffold more than 10 feet above a lower level must be protected from falling.",
          whyOffered: "The observation records work at approximately 4.5 metres with the guardrail removed.",
          confidence: 0.61, confidenceLabel: "Moderate", applicability: "candidate",
          evidenceMissing: ["Whether this is construction work or general industry maintenance"],
          confidenceLimitReason: "The applicable subpart depends on whether the work is construction.",
        },
        clarificationQuestions: [
          {
            id: "jurisdiction",
            question: "Is this work construction, or general industry maintenance?",
            reason: "Scaffold fall-protection triggers differ between 1926 and 1910, and the trigger height is not the same.",
            options: ["Construction", "General industry", "Not sure"],
            materialTo: ["29 CFR 1926.451(g)(1)"], priority: "high", decisionCritical: true, scope: "inspection",
          },
          {
            id: "scaffold-height",
            question: "Was the working platform above or below 10 feet?",
            reason: "The general-industry trigger is 4 feet; the construction scaffold trigger is 10.",
            options: ["Above 10 feet", "Below 10 feet", "Not sure"],
            materialTo: ["29 CFR 1926.451(g)(1)"], priority: "medium", decisionCritical: false, scope: "finding",
          },
        ],
      }),
    }),
    findings: [
        {
            "hazardCategory": "Fall protection",
            "segmentKey": "fall_protection",
            "conclusion": "Work at height from a mobile scaffold with the guardrail removed and no fall arrest in use.",
            "sourceCandidate": {
                "observationFragment": "Neither was tied off and the guardrail on the open side had been removed",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1926.451(g)(1)",
                        "family": "Fall protection",
                        "status": "UNKNOWN",
                        "confidence": 0.61,
                        "applicability": "candidate",
                        "explanation": "Which subpart applies depends on whether this is construction work or general industry maintenance.",
                        "missingPredicates": [
                            "Whether this is construction work or general industry maintenance",
                            "Whether the platform was above 10 feet"
                        ],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Scaffolds \u2014 fall protection",
                        "plainLanguageSummary": "Each employee on a scaffold more than 10 feet above a lower level must be protected from falling.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        }
    ],
  },
  {
    key: "C-unresolved",
    title: "HazLenz state C — unresolved / not supported",
    observation:
      "Chemical storage cabinet in the wash bay is unlabelled and holds four decanted containers of "
      + "what the operator described as 'the acid cleaner'. No secondary labels, no SDS binder in the "
      + "area, and the eyewash station had a missing inspection tag.",
    snapshot: base({
      evidenceSnapshot: {
        id: "synthetic-evidence-2", schemaVersion: "1.0",
        facts: [
          { id: "g1", type: "container", value: "four decanted containers", source: "observation", confidence: 0.9, status: "extracted", temporalState: "current", reviewerStatus: "unreviewed" },
          { id: "g2", type: "labelling", value: "absent", source: "observation", confidence: 0.9, status: "extracted", temporalState: "current", reviewerStatus: "unreviewed" },
        ],
        criticalUnknowns: [
          "The identity of the decanted substance. 'The acid cleaner' is an operator's description, not a product identity.",
          "Whether the containers are for immediate use by the person who filled them, which changes the labelling duty.",
        ],
        contradictions: [],
      },
      applicabilityDecisions: [
        {
          citation: "29 CFR 1910.1200(f)(6)", family: "Hazard communication", status: "UNKNOWN",
          explanation: "Whether a workplace label is required here depends on facts the observation does not establish.",
          missingPredicates: ["Product identity", "Whether the container is for immediate use by the transferring employee"],
        },
        {
          citation: "29 CFR 1910.151(c)", family: "Emergency eyewash", status: "NOT_SUPPORTED",
          explanation: "A missing inspection tag is not, by itself, evidence that suitable facilities are absent.",
          missingPredicates: ["Whether the eyewash is present and functional", "Whether a corrosive is in use in this area"],
        },
      ],
      guidedFinding: guided({
        observedCondition: "Unlabelled decanted containers of an unidentified substance in a wash bay.",
        hazardCategory: "Hazard communication",
        primaryStandard: null,
        riskAssessment: {
          severity: "Not established", likelihood: "Not established", exposure: "Not established",
          overallRisk: "Not established", riskLevel: "unknown", provisional: true, reviewerConfirmed: false,
          rationale: "Risk cannot be established while the substance is unidentified.",
        },
        correctiveAction: {
          immediateAction: "Identify the contents before anyone handles the containers.",
          permanentCorrection: "", verificationStep: "", responsibleRole: "Area supervisor", urgency: "prompt",
          rationale: "No corrective action can be specified against an unidentified substance.",
        },
        limitations: [
          CAVEAT,
          "HazLenz could not determine an applicable standard for this observation. The substance is not identified.",
        ],
      }),
    }),
    findings: [
        {
            "hazardCategory": "Hazard communication",
            "segmentKey": "hazard_communication",
            "conclusion": "Unlabelled decanted containers of a substance the observation does not identify.",
            "sourceCandidate": {
                "observationFragment": "four decanted containers of what the operator described as 'the acid cleaner'",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.1200(f)(6)",
                        "family": "Hazard communication",
                        "status": "UNKNOWN",
                        "confidence": 0.31,
                        "applicability": "candidate",
                        "explanation": "Whether a workplace label is required here depends on facts the observation does not establish.",
                        "missingPredicates": [
                            "Product identity",
                            "Whether the container is for immediate use by the transferring employee"
                        ],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Hazard communication \u2014 workplace labelling",
                        "plainLanguageSummary": "Containers of hazardous chemicals in the workplace must be labelled, tagged or marked.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    },
                    {
                        "citation": "29 CFR 1910.151(c)",
                        "family": "Emergency eyewash",
                        "status": "NOT_SUPPORTED",
                        "confidence": 0.12,
                        "applicability": "candidate",
                        "explanation": "A missing inspection tag is not, by itself, evidence that suitable facilities are absent.",
                        "missingPredicates": [
                            "Whether the eyewash is present and functional",
                            "Whether a corrosive is in use in this area"
                        ],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Medical services and first aid",
                        "plainLanguageSummary": "Suitable facilities for quick drenching or flushing must be provided where corrosives may injure the eyes or body.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        }
    ],
  },
  {
    key: "D-confirmation",
    title: "HazLenz state D — awaiting human confirmation",
    observation:
      "Extension cord run across the main walkway from the maintenance bay to a portable work light. "
      + "The cord is taped down with duct tape and the strain relief at the plug is split, exposing "
      + "roughly 15mm of the inner conductors.",
    snapshot: base({
      guidedFinding: guided({
        observedCondition: "Damaged flexible cord with exposed conductors in a trafficked walkway.",
        hazardCategory: "Electrical",
        primaryStandard: {
          ...STANDARD,
          citation: "29 CFR 1910.334(a)(2)(i)", title: "Portable cord and plug equipment — visual inspection",
          simplifiedRequirement: "Portable cord and plug connected equipment must be visually inspected for external defects before use.",
          whyOffered: "The observation records a split strain relief with exposed conductors.",
          confidence: 0.58, confidenceLabel: "Moderate", applicability: "candidate",
          evidenceMissing: ["Whether the exposed conductors are energised in normal use"],
          confidenceLimitReason: "The cord's live status at the time of observation is not established.",
        },
        reviewStatus: { status: "awaiting_human_confirmation", reviewerConfirmed: false, editableFields: ["riskAssessment", "correctiveAction"] },
        riskAssessment: {
          severity: "Major", likelihood: "Possible", exposure: "Frequent", overallRisk: "High",
          riskLevel: "high", provisional: true, reviewerConfirmed: false,
          rationale: "Exposed conductors in a walkway present both a shock and a trip mechanism.",
        },
      }),
    }),
    findings: [
        {
            "hazardCategory": "Electrical",
            "segmentKey": "electrical",
            "conclusion": "A flexible cord with a split strain relief and exposed conductors is in use across a trafficked walkway.",
            "sourceCandidate": {
                "observationFragment": "the strain relief at the plug is split, exposing roughly 15mm of the inner conductors",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.334(a)(2)(i)",
                        "family": "Electrical",
                        "status": "UNKNOWN",
                        "confidence": 0.58,
                        "applicability": "candidate",
                        "explanation": "Whether the exposed conductors are energised in normal use is not established by the observation.",
                        "missingPredicates": [
                            "Whether the cord is energised in normal use"
                        ],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Portable cord and plug equipment \u2014 visual inspection",
                        "plainLanguageSummary": "Portable cord and plug connected equipment must be visually inspected for external defects before use.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        }
    ],
  },
  {
    key: "E-multiple",
    title: "HazLenz state E — several findings from one observation",
    observation:
      "Walkthrough of the finishing line: the emergency stop on the wrapper was painted over, a pallet "
      + "of finished goods blocked the marked egress route to the east door, the eyewash in the glue "
      + "station had no signage, and a forklift was left running and unattended at the dock with the "
      + "forks raised.",
    snapshot: base({
      guidedFinding: guided({
        observedCondition: "Four separate conditions recorded in one walkthrough of the finishing line.",
        hazardCategory: "Multiple",
        primaryStandard: {
          ...STANDARD,
          citation: "29 CFR 1910.37(a)(3)", title: "Exit routes must be kept free of obstruction",
          simplifiedRequirement: "Exit routes must be free and unobstructed.",
          whyOffered: "A pallet of finished goods is recorded across the marked egress route.",
          confidence: 0.81, confidenceLabel: "High",
        },
        additionalStandards: [
          { citation: "29 CFR 1910.147(c)(4)", title: "Energy control procedures", applicability: "candidate", whyOffered: "An emergency stop painted over may indicate a defeated control.", evidenceMissing: ["Whether the stop still functions"] },
          { citation: "29 CFR 1910.178(m)(5)(i)", title: "Powered industrial trucks — unattended", applicability: "direct", whyOffered: "A truck left running and unattended with forks raised.", evidenceMissing: [] },
          { citation: "29 CFR 1910.151(c)", title: "Medical services and first aid", applicability: "candidate", whyOffered: "An eyewash without signage in an area where glue is used.", evidenceMissing: ["Whether a corrosive is present"] },
        ],
        findingCandidates: [
          { citation: "29 CFR 1910.37(a)(3)", family: "Egress", applicability: "direct", evidenceFactIds: ["f1"] },
          { citation: "29 CFR 1910.178(m)(5)(i)", family: "Powered industrial trucks", applicability: "direct", evidenceFactIds: ["f2"] },
          { citation: "29 CFR 1910.147(c)(4)", family: "Energy control", applicability: "candidate", evidenceFactIds: ["f3"] },
          { citation: "29 CFR 1910.151(c)", family: "Emergency eyewash", applicability: "candidate", evidenceFactIds: ["f3"] },
        ],
        multiHazardReview: {
          requiresSplitReview: true,
          instruction: "These conditions are separate hazards and should be reviewed and recorded one at a time.",
        },
      }),
    }),
    findings: [
        {
            "hazardCategory": "Egress",
            "segmentKey": "egress",
            "conclusion": "A pallet of finished goods obstructs the marked exit route to the east door.",
            "sourceCandidate": {
                "observationFragment": "a pallet of finished goods blocked the marked egress route to the east door",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.37(a)(3)",
                        "family": "Egress",
                        "status": "SUPPORTED",
                        "confidence": 0.81,
                        "applicability": "direct",
                        "explanation": "A pallet is recorded across the marked egress route.",
                        "missingPredicates": [],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Exit routes must be kept free of obstruction",
                        "plainLanguageSummary": "Exit routes must be free and unobstructed.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        },
        {
            "hazardCategory": "Powered industrial trucks",
            "segmentKey": "powered_industrial_trucks",
            "conclusion": "A forklift was left running and unattended at the dock with the forks raised.",
            "sourceCandidate": {
                "observationFragment": "a forklift was left running and unattended at the dock with the forks raised",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.178(m)(5)(i)",
                        "family": "Powered industrial trucks",
                        "status": "SUPPORTED",
                        "confidence": 0.88,
                        "applicability": "direct",
                        "explanation": "A truck left running and unattended with the forks raised.",
                        "missingPredicates": [],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Powered industrial trucks \u2014 unattended",
                        "plainLanguageSummary": "When a truck is left unattended, load engaging means must be fully lowered and the power shut off.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        },
        {
            "hazardCategory": "Energy control",
            "segmentKey": "energy_control",
            "conclusion": "The emergency stop on the wrapper has been painted over.",
            "sourceCandidate": {
                "observationFragment": "the emergency stop on the wrapper was painted over",
                "standardCandidates": [
                    {
                        "citation": "29 CFR 1910.147(c)(4)",
                        "family": "Energy control",
                        "status": "UNKNOWN",
                        "confidence": 0.44,
                        "applicability": "candidate",
                        "explanation": "Whether the control still functions is not established by the observation.",
                        "missingPredicates": [
                            "Whether the emergency stop still operates"
                        ],
                        "jurisdictionProvenance": "USER_CONFIRMED",
                        "title": "Energy control procedures",
                        "plainLanguageSummary": "Procedures must be developed and used to control potentially hazardous energy.",
                        "backingStatus": "APPROVED_GOVERNED_CONTENT",
                        "corpusBacked": true
                    }
                ]
            }
        }
    ],
  },
];

(async () => {
  if (!EMAIL || !PASSWORD) throw new Error("VAL_EMAIL and VAL_PASSWORD are required");

  const login = await call("/auth/login", { method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }) });
  const token = login.accessToken || login.access_token || login.token;
  const sites = await call("/sites?limit=100", {}, token);
  const siteId = (sites.data || sites)[0].id;

  const created = [];
  for (const state of STATES) {
    const inspection = await call("/inspections", {
      method: "POST",
      body: JSON.stringify({
        siteId, title: state.title, regulatoryContext: "osha-general-industry",
        clientRequestId: `hazlenz-state-${state.key}-${Date.now()}`,
      }),
    }, token);

    const observation = await call(`/inspections/${inspection.id}/observations`, {
      method: "POST",
      body: JSON.stringify({
        rawText: state.observation, evidenceSource: "direct_observation",
        clientRequestId: `hazlenz-state-obs-${state.key}-${inspection.id}`,
      }),
    }, token);

    const analysis = await call(`/inspections/observations/${observation.id}/analyses`, {
      method: "POST",
      body: JSON.stringify({
        engineVersion: "synthetic-presentation-review",
        idempotencyKey: `synthetic-${state.key}-${observation.id}`.slice(0, 120),
        requestVersion: 1,
        resultSnapshot: state.snapshot,
      }),
    }, token);

    // The review + finding the real flow creates once the reviewer confirms a candidate. Without
    // these the HazLenz step has no finding to render, and the whole panel is blank whatever the
    // snapshot says.
    let findingIds = [];
    if (state.findings?.length) {
      for (const [index, finding] of state.findings.entries()) {
        const review = await call(`/inspections/observations/${observation.id}/reviews`, {
          method: "POST",
          body: JSON.stringify({
            analysisId: analysis.id,
            decision: "accepted",
            rationale: "Synthetic fixture for the §280 presentation review. Not an engine result.",
            idempotencyKey: `synthetic-review-${state.key}-${index}-${observation.id}`.slice(0, 120),
          }),
        }, token);
        const persisted = await call(`/inspections/observations/${observation.id}/findings`, {
          method: "POST",
          body: JSON.stringify({
            reviewId: review.id,
            hazardCategory: finding.hazardCategory,
            conclusion: finding.conclusion,
            segmentKey: finding.segmentKey,
            sourceCandidate: finding.sourceCandidate,
            reviewerDisposition: state.findings.length > 1 ? "split" : "single",
          }),
        }, token);
        findingIds.push(persisted.id);
      }
    }

    created.push({ key: state.key, title: state.title, inspectionId: inspection.id, observationId: observation.id, analysisId: analysis.id, findingIds });
    console.log(`${state.key.padEnd(16)} inspection ${inspection.id}`);
  }

  console.log(`\n${JSON.stringify({ providerCalls: 0, states: created }, null, 2)}`);
})();
