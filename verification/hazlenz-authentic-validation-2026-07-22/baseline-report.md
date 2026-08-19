# Baseline HazLenz Authentic Validation Report

Generated: 2026-07-23T02:01:06.337Z
Git commit: 24e37703
Live backend: http://127.0.0.1:4000
Live frontend: http://127.0.0.1:3001

## Summary
```json
{
  "total": 120,
  "pass": 64,
  "needsReview": 13,
  "fail": 43,
  "averageScore": 0.8566666666666667,
  "categoryScores": {
    "hazardIdentification": 0.6916666666666667,
    "jurisdiction": 1,
    "primaryStandardApplicability": 0.675,
    "falsePositiveControl": 0.9666666666666667,
    "evidenceDiscipline": 1,
    "clarificationQuality": 0.9916666666666667,
    "riskAssessment": 0.6599999999999996,
    "mechanismChainQuality": 1,
    "correctiveActionQuality": 0.725
  },
  "falsePositiveRate": 0.033333333333333326,
  "falseNegativeRate": 0.32499999999999996,
  "clarificationSuccessRate": 0.9655172413793104,
  "citationApplicabilityRate": 0.675,
  "correctiveActionQualityRate": 0.725,
  "criticalFailures": [
    "pair-trench-deep",
    "pair-tank-entry",
    "pair-asbestos-disturbance"
  ]
}
```

## Critical Failures
- pair-roof-edge-guarded: major, score 0.73, One or more strict failure conditions triggered.
- pair-trench-deep: critical, score 0.89, One or more strict failure conditions triggered.
- pair-chemical-aisle-spill: major, score 0.89, One or more strict failure conditions triggered.
- pair-chemical-contained: major, score 0.62, One or more strict failure conditions triggered.
- pair-tank-entry: critical, score 0.89, One or more strict failure conditions triggered.
- pair-asbestos-disturbance: critical, score 0.89, One or more strict failure conditions triggered.
- pair-handrail-missing: major, score 0.89, One or more strict failure conditions triggered.
- pair-hotwork-controlled: minor, score 0.62, One or more strict failure conditions triggered.
- pair-noise-high: major, score 0.84, One or more strict failure conditions triggered.
- pair-bloodborne-exposure: major, score 0.78, One or more strict failure conditions triggered.
- pair-exit-blocked: major, score 0.73, One or more strict failure conditions triggered.
- gi-ladder-top-step: major, score 0.84, One or more strict failure conditions triggered.
- gi-stacked-material: major, score 0.84, One or more strict failure conditions triggered.
- gi-respirator-voluntary: major, score 0.84, One or more strict failure conditions triggered.
- gi-flammable-cabinet: major, score 0.84, One or more strict failure conditions triggered.
- gi-fire-extinguisher-missing: major, score 0.84, One or more strict failure conditions triggered.
- gi-open-floor-hole: major, score 0.84, One or more strict failure conditions triggered.
- gi-chemical-symptoms: major, score 0.84, One or more strict failure conditions triggered.
- gi-press-two-hand: major, score 0.84, One or more strict failure conditions triggered.
- gi-saw-guard: major, score 0.73, One or more strict failure conditions triggered.
- gi-emergency-action: major, score 0.73, One or more strict failure conditions triggered.
- gi-ppe-splash: major, score 0.84, One or more strict failure conditions triggered.
- cx-scaffold-plank: major, score 0.84, One or more strict failure conditions triggered.
- cx-silica-cutting: major, score 0.84, One or more strict failure conditions triggered.
- cx-trench-egress: major, score 0.73, One or more strict failure conditions triggered.
- cx-traffic-control: major, score 0.84, One or more strict failure conditions triggered.
- cx-confined-space: major, score 0.84, One or more strict failure conditions triggered.
- cx-concrete-impalement: major, score 0.84, One or more strict failure conditions triggered.
- cx-temporary-light: major, score 0.73, One or more strict failure conditions triggered.
- cx-vague-edge: moderate, score 0.84, One or more strict failure conditions triggered.
- msha-grounding: major, score 0.84, One or more strict failure conditions triggered.
- msha-berm-dump: major, score 0.84, One or more strict failure conditions triggered.
- msha-ladder-travelway: major, score 0.84, One or more strict failure conditions triggered.
- msha-cylinder: major, score 0.84, One or more strict failure conditions triggered.
- msha-parking: major, score 0.62, One or more strict failure conditions triggered.
- msha-stored-energy: major, score 0.84, One or more strict failure conditions triggered.
- msha-fall-crusher: major, score 0.84, One or more strict failure conditions triggered.
- msha-nonmine-trap: major, score 0.84, One or more strict failure conditions triggered.
- msha-illumination: major, score 0.73, One or more strict failure conditions triggered.
- msha-exit-blocked: major, score 0.73, One or more strict failure conditions triggered.
- msha-fire-ext: major, score 0.84, One or more strict failure conditions triggered.
- gi-e-stop-blocked: major, score 0.84, One or more strict failure conditions triggered.
- msha-raised-crusher-blocking: major, score 0.84, One or more strict failure conditions triggered.

## Needs Review
- pair-cord-discarded: score 0.73
- pair-trench-shallow-controlled: score 0.73
- pair-labeled-closed: score 0.62
- pair-tank-outside: score 0.73
- pair-low-platform: score 0.73
- pair-cylinder-carrier: score 0.73
- pair-noise-low: score 0.73
- pair-heat-controlled: score 0.73
- pair-bloodborne-kit: score 0.73
- pair-scaffold-complete: score 0.73
- pair-exit-clear: score 0.73
- gi-harmless-dramatic: score 0.73
- gi-heat-recovered: score 0.73

## Strong Reasoning Examples
- pair-conveyor-energized: Machine Guarding; standards 30 CFR 56.14107
- pair-unguarded-production: Material Handling; standards 29 CFR 1910.219(c)
- pair-panel-live: Electrical; standards 29 CFR 1910.303(g)(2)(i)
- pair-cord-active-wet: Electrical; standards 29 CFR 1910.305(g)(2)(iii), 29 CFR 1910.305(g), 29 CFR 1910.334(a)(2)(ii)
- pair-roof-edge-open: Fall Protection; standards 29 CFR 1926.501, 29 CFR 1926.501(b)(1)
- pair-unlabeled-unknown: Hazard Communication; standards 29 CFR 1910.1200(f)(1), 29 CFR 1910.1200(f)(6)
- pair-loader-alarm-broken: Mobile Equipment / Traffic; standards 30 CFR 56.14132(a), 30 CFR 56.9100
- pair-hotwork-combustibles: Welding / Cutting / Hot Work; standards 29 CFR 1910.252(a)(2)(iv)
- pair-cylinder-unsecured: Compressed Gas Cylinders; standards 29 CFR 1910.101(b)
- pair-scaffold-no-rails: Fall Protection; standards 29 CFR 1926.451(g)(1)

## Weakness Patterns
- This automated audit evaluates observable response quality and citation-family applicability, not legal sufficiency.
- Any citation-family mismatch, unsafe control omission, or jurisdiction error is treated as safety-significant.
- Browser console inspection was attempted through the in-app browser but unavailable due runtime bootstrap failure; HTTP route checks are recorded separately.