#!/usr/bin/env python3
"""
§179 — post-run integrity verification and mechanical scoring. ZERO provider calls.

Recomputes every aggregate from the thirty persisted execution records rather than trusting the
runner's own summary, checks that the executed order is exactly the preregistered frozen order, and
evaluates the eight preregistered success criteria as far as mechanical evidence allows.

WHAT THIS DOES NOT DO. It does not decide strict REQUIRED recall. Whether an emitted clarification
addresses the material owed fact is a human semantic judgement — the frozen §174 record carries
MATERIAL_UNRESOLVED_FACTS = null on all ten rows, and §169 established that a question can name the
right fact and still fail to resolve it. Criteria 2 and 5 are therefore reported PENDING, with the
mechanical upper bound stated beside them. This model supplied no verdict and must not.

Run from the repository root:
  python3 verification/expert-hazlenz-v15-replicated-clarification-validation-2026-09-05/section-179-verify-and-score.py
"""

import json
import sys
from pathlib import Path

D = Path('verification/expert-hazlenz-v15-replicated-clarification-validation-2026-09-05')

REQUIRED_ROWS = ['HR-01', 'HR-04', 'HR-06', 'HR-08', 'HR-09']
SILENCE_ROWS = ['HR-02', 'HR-03', 'HR-05', 'HR-07', 'HR-10']
# The four REQUIRED rows §175 and §177 recovered. HR-04 is the targeted row and is excluded.
PREVIOUSLY_RECOVERED = ['HR-01', 'HR-06', 'HR-08', 'HR-09']

FROZEN_V15_PROMPT_SHA = '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979'


def main():
    records = [json.loads(line) for line in (D / 'V15-REPLICATED-RUN-RECORDS.jsonl').read_text().splitlines() if line.strip()]
    summary = json.loads((D / 'V15-REPLICATED-RUN-SUMMARY.json').read_text())
    prereg = json.loads((D / 'PRE-SPEND-PREREGISTRATION-V15.json').read_text())
    packet = json.loads((D / 'V15-REPLICATED-STRICT-ADJUDICATION-PACKET.json').read_text())

    failures = []

    def check(label, ok, detail=''):
        print(f"  {'PASS' if ok else 'FAIL'}  {label}{f'  [{detail}]' if detail else ''}")
        if not ok:
            failures.append(label)

    def valid(r):
        return r['ok'] and r['normalizationState'] == 'VALID' and not r['contractFailure']

    print('EXECUTION INTEGRITY')
    frozen_order = [(o['sequencePosition'], o['rowId'], o['replicateNumber'])
                    for o in prereg['7_execution_order']['frozenOrder']]
    executed = [(r['sequencePosition'], r['rowId'], r['replicateNumber']) for r in records]
    check('executed order is exactly the preregistered frozen order', frozen_order == executed)
    check('thirty executions recorded', len(records) == 30, str(len(records)))
    check('every execution ran at the frozen v15 identity',
          all(r['promptVersion'] == 'hazlenz.expert.prompt.v15'
              and r['promptSha256'] == FROZEN_V15_PROMPT_SHA for r in records))
    check('returned model identity matched on every execution',
          all(r['respondedModelMatches'] for r in records))
    check('all thirty normalized VALID', all(r['normalizationState'] == 'VALID' for r in records))
    check('zero contract failures', not any(r['contractFailure'] for r in records))
    check('zero provider errors', all(r['ok'] for r in records))
    check('raw provider output persisted on every execution', all(r['rawProviderOutput'] for r in records))
    check('cost recomputes from per-execution telemetry',
          round(sum(r['telemetry']['computedCostUsd'] for r in records), 5) == summary['TOTAL_ACTUAL_COST_USD'],
          f"${summary['TOTAL_ACTUAL_COST_USD']}")

    print('\nADJUDICATION PACKET')
    emitting_required = sorted((r['rowId'], r['replicateNumber'])
                               for r in records if r['truthRequired'] and r['clarificationCount'] > 0)
    packet_executions = sorted((e['rowId'], e['replicateNumber'])
                               for e in packet['executions'] if e['emittedClarifications'])
    check('every emitting REQUIRED execution is in the packet',
          emitting_required == packet_executions, f'{len(packet_executions)} executions')
    check('every packet question is byte-identical to its run record',
          all(json.dumps(e['emittedClarifications'], sort_keys=True) ==
              json.dumps(next(r for r in records if r['rowId'] == e['rowId']
                              and r['replicateNumber'] == e['replicateNumber'])['clarifications'], sort_keys=True)
              for e in packet['executions']))
    check('no strict verdict was supplied by this model',
          all(e['HUMAN_ADDRESSES_THE_OWED_FACT'] is None for e in packet['executions']))

    # ---- mechanical scoring
    required = [r for r in records if r['truthRequired']]
    silence = [r for r in records if not r['truthRequired']]
    silence_pass = [r for r in silence if valid(r) and r['clarificationCount'] == 0]
    required_loose = [r for r in required if valid(r) and r['clarificationCount'] > 0]

    print('\nEXECUTION-LEVEL RESULTS')
    print(f"  SILENCE_PASS_RATE        = {len(silence_pass)}/15  (exact and mechanical, final)")
    print(f"  REQUIRED_LOOSE_PASS_RATE = {len(required_loose)}/15  (mechanical upper bound)")
    print(f"  REQUIRED_STRICT_PASS     = PENDING_HUMAN_ADJUDICATION  (<= {len(required_loose)}/15)")
    print(f"  OVERALL_EXECUTION_ACCURACY = PENDING  (<= {len(silence_pass) + len(required_loose)}/30)")

    print('\nROW-LEVEL STABILITY')
    row_fail = {}
    for rid in REQUIRED_ROWS + SILENCE_ROWS:
        ex = sorted([r for r in records if r['rowId'] == rid], key=lambda r: r['replicateNumber'])
        is_required = ex[0]['truthRequired']
        if is_required:
            ok = [valid(r) and r['clarificationCount'] > 0 for r in ex]
            label = 'loose'
        else:
            ok = [valid(r) and r['clarificationCount'] == 0 for r in ex]
            label = 'exact'
        row_fail[rid] = sum(1 for o in ok if not o)
        disagree = len(set(ok)) > 1
        print(f"  {rid}  {'REQUIRED' if is_required else 'SILENCE ':8}  {sum(ok)}/3 {label:5}  "
              f"clarifications={[r['clarificationCount'] for r in ex]}  "
              f"{'WITHIN-ROW DISAGREEMENT' if disagree else ''}")
    disagreeing = [rid for rid in REQUIRED_ROWS + SILENCE_ROWS
                   if len(set((valid(r) and (r['clarificationCount'] > 0) == r['truthRequired'])
                              for r in records if r['rowId'] == rid)) > 1]
    print(f"  WITHIN_ROW_DISAGREEMENT_COUNT = {len(disagreeing)}  ({', '.join(disagreeing) or 'none'})")

    print('\nPREREGISTERED SUCCESS CRITERIA')
    hr04_emitting = sum(1 for r in records if r['rowId'] == 'HR-04' and r['clarificationCount'] > 0)
    c1 = hr04_emitting >= 2  # strict cannot exceed the number that emitted anything
    print(f"  {'PASS' if c1 else 'FAIL'}  1. HR-04 strict >= 2/3 — {hr04_emitting}/3 replicates emitted anything at all, "
          f"so strict is {hr04_emitting if hr04_emitting else 0}/3 at best")
    print(f"  PEND  2. REQUIRED_STRICT >= 12/15 — upper bound {len(required_loose)}/15, "
          f"so it is met only if EVERY emitting execution is adjudicated correct")
    c3 = len(silence_pass) >= 13
    print(f"  {'PASS' if c3 else 'FAIL'}  3. SILENCE_EXECUTION_PASS >= 13/15 — {len(silence_pass)}/15")
    silence_row_failures = {rid: row_fail[rid] for rid in SILENCE_ROWS}
    c4 = all(v < 2 for v in silence_row_failures.values())
    print(f"  {'PASS' if c4 else 'FAIL'}  4. no SILENCE row fails >= 2 of 3 — {silence_row_failures}")
    recovered_loose = {rid: 3 - row_fail[rid] for rid in PREVIOUSLY_RECOVERED}
    print(f"  PEND  5. no previously recovered REQUIRED row below 2/3 — loose {recovered_loose}, strict pending")
    c6 = summary['CONTRACT_FAILURE_COUNT'] == 0
    print(f"  {'PASS' if c6 else 'FAIL'}  6. contract failures = 0 — {summary['CONTRACT_FAILURE_COUNT']}")
    c7 = summary['NORMALIZATION_REJECTED_COUNT'] == 0
    print(f"  {'PASS' if c7 else 'FAIL'}  7. normalization rejected = 0 — {summary['NORMALIZATION_REJECTED_COUNT']}")
    c8 = all(r['ok'] and r['rawProviderOutput'] and r['respondedModelMatches'] for r in records)
    print(f"  {'PASS' if c8 else 'FAIL'}  8. provider execution evidence interpretable")

    print('\nTERMINAL')
    if not c1:
        terminal = ('EXPERT_HAZLENZ_CONTROL_PROPERTY_SUFFICIENCY_REMEDIATION_NOT_CONFIRMED — '
                    'REMEDIATION_REVIEW_REQUIRED')
        why = ('HR-04 strict pass is 0/3. The authorization states a 0/3 result is failure to confirm, '
               'and this is determinable without adjudication because nothing was emitted on any '
               'replicate — an absence cannot address the owed fact.')
    elif not (c3 and c4):
        terminal = ('EXPERT_HAZLENZ_CONTROL_PROPERTY_RECALL_GAIN_WITH_PRECISION_REGRESSION — '
                    'REMEDIATION_REVIEW_REQUIRED')
        why = 'HR-04 met its target but the preregistered silence-precision floor was violated.'
    else:
        terminal = 'PENDING_STRICT_ADJUDICATION'
        why = 'the mechanical criteria hold; criteria 2 and 5 require the human strict verdicts.'
    print(f'  {terminal}')
    print(f'  {why}')
    if not c3 or not c4:
        print('  ALSO FAILED, independently: the silence-precision floor (criterion 3) and/or the '
              'per-row silence rule (criterion 4). Reported beside the terminal, not folded into it.')

    print(f"\nINTEGRITY = {'INTACT' if not failures else 'BROKEN'}")
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())
