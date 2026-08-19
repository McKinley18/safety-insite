# Final HazLenz Authentic Validation Report

Generated: 2026-07-24T02:06:58.190Z
Git commit: 24e37703
Live backend: http://127.0.0.1:4000
Live frontend: http://127.0.0.1:3001

## Summary
```json
{
  "total": 120,
  "pass": 104,
  "needsReview": 14,
  "fail": 2,
  "averageScore": 0.8983333333333322,
  "categoryScores": {
    "hazardIdentification": 0.7333333333333333,
    "jurisdiction": 1,
    "primaryStandardApplicability": 0.9833333333333333,
    "falsePositiveControl": 0.9916666666666667,
    "evidenceDiscipline": 1,
    "clarificationQuality": 0.975,
    "riskAssessment": 0.6599999999999996,
    "mechanismChainQuality": 1,
    "correctiveActionQuality": 0.7416666666666667
  },
  "falsePositiveRate": 0.008333333333333304,
  "falseNegativeRate": 0.01666666666666672,
  "clarificationSuccessRate": 0.896551724137931,
  "citationApplicabilityRate": 0.9833333333333333,
  "correctiveActionQualityRate": 0.7416666666666667,
  "criticalFailures": []
}
```

## Critical Failures
- pair-bloodborne-kit: minor, score 0.62, One or more strict failure conditions triggered.
- msha-nonmine-trap: major, score 0.84, One or more strict failure conditions triggered.

## Needs Review
- pair-cord-discarded: score 0.73
- pair-trench-shallow-controlled: score 0.73
- pair-chemical-contained: score 0.73
- pair-labeled-closed: score 0.62
- pair-tank-outside: score 0.73
- pair-low-platform: score 0.73
- pair-hotwork-controlled: score 0.73
- pair-cylinder-carrier: score 0.73
- pair-noise-low: score 0.73
- pair-heat-controlled: score 0.73
- pair-scaffold-complete: score 0.73
- pair-exit-clear: score 0.73
- gi-harmless-dramatic: score 0.73
- gi-heat-recovered: score 0.73

## Strong Reasoning Examples
- pair-conveyor-energized: Machine Guarding; standards 30 CFR 56.14107
- pair-unguarded-production: Material Handling; standards 29 CFR 1910.219(c), 29 CFR 1910.212
- pair-panel-live: Electrical; standards 29 CFR 1910.303(g)(2)(i)
- pair-cord-active-wet: Electrical; standards 29 CFR 1910.305(g)(2)(iii), 29 CFR 1910.305(g), 29 CFR 1910.334(a)(2)(ii)
- pair-roof-edge-open: Fall Protection; standards 29 CFR 1926.501, 29 CFR 1926.501(b)(1)
- pair-trench-deep: Trenching & Shoring; standards 29 CFR 1926.651(c)(2)
- pair-chemical-aisle-spill: Walking/Working Surfaces; standards 29 CFR 1910.22(a)(2)
- pair-unlabeled-unknown: Hazard Communication; standards 29 CFR 1910.1200(f)(1), 29 CFR 1910.1200(f)(6)
- pair-loader-alarm-broken: Mobile Equipment / Traffic; standards 30 CFR 56.14132(a), 30 CFR 56.9100
- pair-tank-entry: Confined Space; standards 1910.146

## Changes Made
Production repairs were made after the saved baseline to address reusable, evidence-based defects in safe-state suppression and direct citation recovery for controlled fall/hot-work/spill conditions, trenching, confined-space entry, asbestos renovation exposure, noise, handrail/stair hazards, and MSHA raised hydraulic stored-energy exposure.

## Weakness Patterns
- This automated audit evaluates observable response quality and citation-family applicability, not legal sufficiency.
- Any citation-family mismatch, unsafe control omission, or jurisdiction error is treated as safety-significant.
- Browser console inspection was attempted through the in-app browser but unavailable due runtime bootstrap failure; HTTP route checks are recorded separately.