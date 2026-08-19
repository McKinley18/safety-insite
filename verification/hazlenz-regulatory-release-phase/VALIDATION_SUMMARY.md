# Validation summary

## Final production-path results

| Corpus | Cases | PASS | NEEDS REVIEW | FAIL |
|---|---:|---:|---:|---:|
| Original | 165 | 120 | 45 | 0 |
| Prior holdout, rerun | 80 | 69 | 11 | 0 |
| Expanded unseen field-language corpus | 200 | 170 | 30 | 0 |
| **Total** | **445** | **359** | **86** | **0** |

Across all final runs:

- Life-safety misses: 0
- Unsupported definitive promotions: 0
- Fabricated citations/text: 0
- Unsafe corrective actions: 0
- Safe-state failures: 0

The expanded corpus contains MSHA, OSHA General Industry, OSHA Construction, unknown/mixed jurisdiction, safe states, contradictions, minimal descriptions, adversarial wording, multi-hazard ambiguity, and near-neighbor language. It uses twenty independently reasoned material fact patterns expressed through ten distinct field-note forms (200 unique observations).

## Review reduction

The original corpus remains 45 reviews. The prior holdout improved from 13 to 11 reviews after the full standards release was available and generalized extraction fixes were applied. The expanded set retains 30 conservative review outcomes.

No definitive-promotion threshold was lowered to obtain these results.

## Defects discovered by validation

1. `current` could match a distant control word and falsely mark an active condition corrected.
2. `no ... stable rock` was parsed as the stable-rock exception.
3. `missing guard` was not recognized when condition preceded object.
4. word-number excavation shorthand such as `four-foot cut` could bypass excavation evaluation.
5. newly hydrated powered-industrial-truck data allowed a legacy engine to cite a toy display model.

Each was corrected through bounded temporal matching, negation-aware exception extraction, order-independent condition parsing, general word-number area recognition, and nonoperational-replica suppression. Focused coverage now passes 35 assertions.

## Rate-limit integrity

Two preliminary expanded runs were invalidated because they exceeded the endpoint throttle and produced HTTP 429 results. Final runs were paced at 2.1 seconds/request. Rate limiting was not disabled or bypassed.
