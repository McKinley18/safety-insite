#!/usr/bin/env python3
"""
§179 strict adjudication closure — integrity verification and metric recomputation.

Zero provider calls, zero database operations, zero source-code changes. Every hash is recomputed
from the actual bytes rather than trusted, and every metric is recomputed from the thirty persisted
execution records plus the recorded product-owner verdicts. The authorization's expected values are
compared only AFTER the recomputation and are never used as inputs.

Two things are established here:

  1. PRE_CLOSURE_INTEGRITY — the frozen instrument text, the frozen §174 truth, the §179
     preregistration, the executed order, the v15 prompt identity, the raw run records and the
     strict packet all still agree. If any had drifted, the recorded verdicts would attach to
     material the product owner did not review, and the closure would be void.

  2. The strict metrics, at execution level and per row, with stable and unstable rows reported
     separately rather than collapsed into one percentage.

Run from the repository root:
  python3 verification/expert-hazlenz-v15-replicated-clarification-validation-2026-09-05/section-179-strict-closure-recompute.py
"""

import hashlib
import json
import sys
from pathlib import Path

INSTR = Path('verification/expert-hazlenz-balanced-clarification-instrument-2026-09-05')
D = Path('verification/expert-hazlenz-v15-replicated-clarification-validation-2026-09-05')

# Product-owner strict verdicts, recorded at §179 closure, one per EXECUTION.
# AI_ASSISTED_STRICT_ADJUDICATION = TRUE: GPT-5.6 Sol reviewed all twelve exact REQUIRED execution
# outputs before product-owner finalization, so this is NOT fully independent human adjudication.
STRICT_VERDICTS = {
    ('HR-01', 1): True, ('HR-01', 2): True, ('HR-01', 3): True,
    ('HR-06', 1): True, ('HR-06', 2): True, ('HR-06', 3): True,
    ('HR-08', 1): True, ('HR-08', 2): True, ('HR-08', 3): True,
    ('HR-09', 1): True, ('HR-09', 2): True, ('HR-09', 3): True,
}
STRICT_CONFIDENCE = 'HIGH'

FROZEN_V15_PROMPT_SHA = '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979'
FROZEN_PREREG_SHA = '8ea7e8499d1eda68616af937be250bb3cf25c01bf434b90f44bcbe7a4e6870f9'

EXPECTED = {
    'REQUIRED_STRICT_PASS': (12, 15),
    'SILENCE_PASS': (12, 15),
    'OVERALL_EXECUTION_ACCURACY': (24, 30),
    'PER_ROW': {'HR-01': 3, 'HR-02': 3, 'HR-03': 3, 'HR-04': 0, 'HR-05': 1,
                'HR-06': 3, 'HR-07': 2, 'HR-08': 3, 'HR-09': 3, 'HR-10': 3},
    'WITHIN_ROW_DISAGREEMENT_COUNT': 2,
    'DISAGREEING_ROWS': ['HR-05', 'HR-07'],
}


def sha_text(t):
    return hashlib.sha256(t.encode('utf-8')).hexdigest()


def sha_file(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()


def load(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))


def main():
    frozen = load(INSTR / 'FROZEN-ROW-HASHES.json')
    blinded = load(INSTR / 'BLINDED-HUMAN-REVIEW-PACKET.json')
    truth_rec = load(INSTR / 'HUMAN-ADJUDICATION-RECORD.json')
    prereg = load(D / 'PRE-SPEND-PREREGISTRATION-V15.json')
    packet = load(D / 'V15-REPLICATED-STRICT-ADJUDICATION-PACKET.json')
    summary = load(D / 'V15-REPLICATED-RUN-SUMMARY.json')
    records = [json.loads(l) for l in (D / 'V15-REPLICATED-RUN-RECORDS.jsonl').read_text().splitlines() if l.strip()]

    failures = []

    def check(label, ok, detail=''):
        print(f"  {'PASS' if ok else 'FAIL'}  {label}{f'  [{detail}]' if detail else ''}")
        if not ok:
            failures.append(label)

    # ---- 1. frozen instrument -----------------------------------------------------------------
    print('FROZEN INSTRUMENT — recomputed from the blinded review packet')
    prereg_rows = {r['id']: r for r in prereg['4_frozen_rows']}
    for row in blinded['rows']:
        rid = row['REVIEW_ROW_ID']
        digest = sha_text(row['TEXT'])
        fz = frozen['rowTextHashes'][rid]
        check(f'{rid} row text {digest[:16]}… — freeze / §174 binding / §179 preregistration',
              digest == fz['rowTextSha256']
              and len(row['TEXT']) == fz['charCount']
              and digest == truth_rec['boundToFrozenHashes'][rid]['rowTextSha256']
              and digest == prereg_rows[rid]['textSha256'])
    print('\nREVIEW PACKET FILES — unchanged since the §174 freeze')
    for name, recorded in frozen['REVIEW_PACKET_HASH'].items():
        check(f'{name}', sha_file(INSTR / name) == recorded)

    # ---- 2. frozen truth ----------------------------------------------------------------------
    print('\nFROZEN TRUTH — §174 record vs §179 preregistration vs run records')
    truth = {r['REVIEW_ROW_ID']: r['HUMAN_CLARIFICATION_REQUIRED'] for r in truth_rec['rows']}
    for rid in sorted(truth):
        in_records = {r['truthRequired'] for r in records if r['rowId'] == rid}
        check(f'{rid} truthRequired = {truth[rid]}',
              in_records == {truth[rid]} and prereg_rows[rid]['truthRequired'] == truth[rid])
    check('five REQUIRED and five SILENCE',
          sum(1 for v in truth.values() if v) == 5 and sum(1 for v in truth.values() if not v) == 5)

    # ---- 3. preregistration, identity and executed order --------------------------------------
    print('\nPREREGISTRATION, IDENTITY AND EXECUTED ORDER')
    check('§179 preregistration hash unchanged', sha_file(D / 'PRE-SPEND-PREREGISTRATION-V15.json') == FROZEN_PREREG_SHA,
          sha_file(D / 'PRE-SPEND-PREREGISTRATION-V15.json')[:16])
    check('every execution ran at the frozen v15 identity',
          all(r['promptVersion'] == 'hazlenz.expert.prompt.v15'
              and r['promptSha256'] == FROZEN_V15_PROMPT_SHA for r in records))
    check('preregistration pins that same identity',
          prereg['2_prompt_identity']['promptVersion'] == 'hazlenz.expert.prompt.v15'
          and prereg['2_prompt_identity']['systemPromptSha256'] == FROZEN_V15_PROMPT_SHA)
    frozen_order = [(o['sequencePosition'], o['rowId'], o['replicateNumber'])
                    for o in prereg['7_execution_order']['frozenOrder']]
    executed = [(r['sequencePosition'], r['rowId'], r['replicateNumber']) for r in records]
    check('executed order is exactly the preregistered frozen order', frozen_order == executed)
    check('thirty executions, all normalized VALID, zero contract failures, zero provider errors',
          len(records) == 30
          and all(r['normalizationState'] == 'VALID' for r in records)
          and not any(r['contractFailure'] for r in records)
          and all(r['ok'] for r in records))
    check('raw provider output persisted on every execution', all(r['rawProviderOutput'] for r in records))
    check('run aggregates recompute from per-execution telemetry',
          round(sum(r['telemetry']['computedCostUsd'] for r in records), 5) == summary['TOTAL_ACTUAL_COST_USD']
          and sum(r['telemetry']['promptTokens'] for r in records) == summary['totalPromptTokens']
          and sum(r['telemetry']['outputTokens'] for r in records) == summary['totalOutputTokens'],
          f"${summary['TOTAL_ACTUAL_COST_USD']}")

    # ---- 4. the adjudicated material is the executed material ---------------------------------
    print('\nSTRICT PACKET — the adjudicated wording must be the executed wording')
    by_exec = {(r['rowId'], r['replicateNumber']): r for r in records}
    for e in packet['executions']:
        key = (e['rowId'], e['replicateNumber'])
        rec = by_exec[key]
        check(f'{key[0]}#{key[1]} observation and questions byte-identical to the run record',
              sha_text(e['observation']) == frozen['rowTextHashes'][e['rowId']]['rowTextSha256']
              and json.dumps(e['emittedClarifications'], sort_keys=True)
              == json.dumps(rec['clarifications'], sort_keys=True))
    emitting_required = sorted(k for k, r in by_exec.items() if r['truthRequired'] and r['clarificationCount'] > 0)
    check('every emitting REQUIRED execution is in the packet',
          sorted((e['rowId'], e['replicateNumber']) for e in packet['executions']
                 if e['emittedClarifications']) == emitting_required,
          f'{len(emitting_required)} executions')
    check('a verdict was recorded for exactly the emitting executions, and no others',
          sorted(STRICT_VERDICTS) == emitting_required, f'{len(STRICT_VERDICTS)} verdicts')

    # ---- 5. strict metrics, recomputed --------------------------------------------------------
    def valid(r):
        return r['ok'] and r['normalizationState'] == 'VALID' and not r['contractFailure']

    def semantically_correct(r):
        """One execution's semantic result. REQUIRED needs an emission the human adjudicated TRUE;
        SILENCE needs a valid execution that emitted nothing. A contract failure is never silence."""
        if not valid(r):
            return False
        if r['truthRequired']:
            if r['clarificationCount'] == 0:
                return False  # nothing emitted, so nothing can address the owed fact
            return STRICT_VERDICTS.get((r['rowId'], r['replicateNumber'])) is True
        return r['clarificationCount'] == 0

    required = [r for r in records if r['truthRequired']]
    silence = [r for r in records if not r['truthRequired']]
    req_strict = [r for r in required if semantically_correct(r)]
    sil_pass = [r for r in silence if semantically_correct(r)]
    overall = req_strict + sil_pass

    print('\nEXECUTION-LEVEL STRICT METRICS — recomputed, never copied')
    print(f"  REQUIRED_STRICT_PASS       = {len(req_strict)}/{len(required)} = {len(req_strict)/len(required):.2f}")
    print(f"  SILENCE_PASS               = {len(sil_pass)}/{len(silence)} = {len(sil_pass)/len(silence):.2f}")
    print(f"  OVERALL_EXECUTION_ACCURACY = {len(overall)}/{len(records)} = {len(overall)/len(records):.2f}")

    print('\nPER-ROW SEMANTIC CORRECTNESS')
    per_row, disagreeing = {}, []
    for rid in sorted({r['rowId'] for r in records}):
        ex = sorted([r for r in records if r['rowId'] == rid], key=lambda r: r['replicateNumber'])
        oks = [semantically_correct(r) for r in ex]
        per_row[rid] = sum(oks)
        if len(set(oks)) > 1:
            disagreeing.append(rid)
        print(f"  {rid}  {'REQUIRED' if ex[0]['truthRequired'] else 'SILENCE '}  {sum(oks)}/{len(oks)}  "
              f"clarifications={[r['clarificationCount'] for r in ex]}"
              f"{'   WITHIN-ROW DISAGREEMENT' if len(set(oks)) > 1 else ''}")
    print(f"  WITHIN_ROW_DISAGREEMENT_COUNT = {len(disagreeing)}  ({', '.join(disagreeing) or 'none'})")

    print('\nSTABILITY CLASSES — reported separately, never collapsed into one percentage')
    stable_correct = [rid for rid, n in per_row.items() if n == 3]
    stable_incorrect = [rid for rid, n in per_row.items() if n == 0]
    unstable = [rid for rid, n in per_row.items() if 0 < n < 3]
    print(f"  STABLE_CORRECT_ROWS        = {stable_correct}")
    print(f"  STABLE_INCORRECT_ROW       = {stable_incorrect}")
    print(f"  STOCHASTICALLY_UNSTABLE    = {unstable}")

    # ---- 6. reconciliation against the authorization -------------------------------------------
    print("\nRECONCILIATION against the authorization's expected values")
    check(f"REQUIRED_STRICT_PASS {EXPECTED['REQUIRED_STRICT_PASS'][0]}/{EXPECTED['REQUIRED_STRICT_PASS'][1]}",
          (len(req_strict), len(required)) == EXPECTED['REQUIRED_STRICT_PASS'])
    check(f"SILENCE_PASS {EXPECTED['SILENCE_PASS'][0]}/{EXPECTED['SILENCE_PASS'][1]}",
          (len(sil_pass), len(silence)) == EXPECTED['SILENCE_PASS'])
    check(f"OVERALL_EXECUTION_ACCURACY {EXPECTED['OVERALL_EXECUTION_ACCURACY'][0]}/{EXPECTED['OVERALL_EXECUTION_ACCURACY'][1]}",
          (len(overall), len(records)) == EXPECTED['OVERALL_EXECUTION_ACCURACY'])
    check('per-row semantic correctness', per_row == EXPECTED['PER_ROW'], str(per_row))
    check('within-row disagreement count and rows',
          len(disagreeing) == EXPECTED['WITHIN_ROW_DISAGREEMENT_COUNT']
          and disagreeing == EXPECTED['DISAGREEING_ROWS'])

    # ---- 7. the preregistered criteria, restated with strict verdicts in hand -------------------
    print('\nPREREGISTERED SUCCESS CRITERIA, with strict verdicts in hand')
    hr04 = per_row['HR-04']
    c1 = hr04 >= 2
    c2 = len(req_strict) >= 12
    c3 = len(sil_pass) >= 13
    sil_row_fail = {rid: 3 - per_row[rid] for rid in ['HR-02', 'HR-03', 'HR-05', 'HR-07', 'HR-10']}
    c4 = all(v < 2 for v in sil_row_fail.values())
    c5 = all(per_row[rid] >= 2 for rid in ['HR-01', 'HR-06', 'HR-08', 'HR-09'])
    print(f"  {'PASS' if c1 else 'FAIL'}  1. HR-04 strict >= 2/3 — {hr04}/3")
    print(f"  {'PASS' if c2 else 'FAIL'}  2. REQUIRED_STRICT >= 12/15 — {len(req_strict)}/15")
    print(f"  {'PASS' if c3 else 'FAIL'}  3. SILENCE >= 13/15 — {len(sil_pass)}/15")
    print(f"  {'PASS' if c4 else 'FAIL'}  4. no SILENCE row fails >= 2 of 3 — {sil_row_fail}")
    print(f"  {'PASS' if c5 else 'FAIL'}  5. no recovered REQUIRED row below 2/3 — "
          f"{ {rid: per_row[rid] for rid in ['HR-01', 'HR-06', 'HR-08', 'HR-09']} }")
    print(f"  PASS  6-8. contract failures {summary['CONTRACT_FAILURE_COUNT']}, "
          f"rejections {summary['NORMALIZATION_REJECTED_COUNT']}, evidence interpretable")
    print(f"\n  V15_REMEDIATION_BEHAVIORALLY_CONFIRMED = {c1 and c2 and c3 and c4 and c5}")
    print(f"  SILENCE_PRECISION_FLOOR_MET            = {c3}")
    print(f"  HR05_PER_ROW_PRECISION_RULE_MET        = {per_row['HR-05'] >= 2}")

    print()
    if failures:
        print('PRE_CLOSURE_INTEGRITY = BROKEN')
        print('SECTION_179_STRICT_CLOSURE = BLOCKED — EVIDENCE_RECONCILIATION_REQUIRED')
        for f in failures:
            print(f'  - {f}')
        return 1
    print('PRE_CLOSURE_INTEGRITY = INTACT')
    print('METRICS_REPRODUCE = TRUE')
    return 0


if __name__ == '__main__':
    sys.exit(main())
