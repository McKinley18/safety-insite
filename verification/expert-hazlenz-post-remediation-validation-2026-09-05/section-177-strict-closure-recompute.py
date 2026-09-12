#!/usr/bin/env python3
"""
§177 strict semantic closure — integrity verification and metric recomputation.

Zero provider calls, zero database operations, zero source-code changes. Reads only files already
on disk and recomputes every hash from the actual bytes rather than trusting any recorded value.

Two independent things are established here:

  1. PRE_CLOSURE_INTEGRITY — the frozen instrument text, the frozen §174 truth, the §177
     preregistration, the §177 adjudication packet and the live v14 prompt identity all still agree.
     If any of them had drifted, the recorded adjudications would attach to material the product
     owner did not review, and the closure would be void (see the §174 freeze rule:
     ROW_TEXT_MUTATION_ALLOWED = FALSE).

  2. The four strict metrics, recomputed from the run records plus the recorded product-owner
     adjudications. The expected values from the authorization are checked but never copied.

The live prompt identity check is deliberately excluded from this file: it requires executing the
TypeScript module. It was performed separately and its result is recorded in
POST-REMEDIATION-STRICT-ADJUDICATION-CLOSURE.json under `promptIdentityVerification`.

Run from the repository root:  python3 verification/expert-hazlenz-post-remediation-validation-2026-09-05/section-177-strict-closure-recompute.py
"""

import hashlib
import json
import sys

INSTRUMENT = 'verification/expert-hazlenz-balanced-clarification-instrument-2026-09-05/'
RUN = 'verification/expert-hazlenz-post-remediation-validation-2026-09-05/'

# The product-owner strict adjudications recorded at §177 closure. HIGH confidence on all four.
# AI_ASSISTED_STRICT_ADJUDICATION = TRUE: GPT-5.6 Sol reviewed the exact emitted clarifications
# before product-owner finalisation, so this is NOT fully independent human adjudication.
STRICT_ADJUDICATIONS = {'HR-01': True, 'HR-06': True, 'HR-08': True, 'HR-09': True}

EXPECTED = {
    'REQUIRED_RECALL_STRICT': 0.80,
    'SILENCE_PRECISION': 1.00,
    'BALANCED_ACCURACY': 0.90,
    'ROW_LEVEL_ACCURACY': 0.90,
}


def sha256_text(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()


def sha256_file(path):
    with open(path, 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def load(path):
    with open(path, encoding='utf-8') as handle:
        return json.load(handle)


def main():
    packet_blinded = load(INSTRUMENT + 'BLINDED-HUMAN-REVIEW-PACKET.json')
    frozen = load(INSTRUMENT + 'FROZEN-ROW-HASHES.json')
    adjudication_record = load(INSTRUMENT + 'HUMAN-ADJUDICATION-RECORD.json')
    prereg = load(RUN + 'PRE-SPEND-PREREGISTRATION-V14.json')
    strict_packet = load(RUN + 'POST-REMEDIATION-STRICT-ADJUDICATION-PACKET.json')
    summary = load(RUN + 'POST-REMEDIATION-RUN-SUMMARY.json')
    with open(RUN + 'POST-REMEDIATION-RUN-RECORDS.jsonl', encoding='utf-8') as handle:
        records = [json.loads(line) for line in handle if line.strip()]

    failures = []

    def check(label, ok):
        print(f"  {'PASS' if ok else 'FAIL'}  {label}")
        if not ok:
            failures.append(label)

    # ---- 1. frozen row text -------------------------------------------------------------------
    print('FROZEN ROW TEXT — recomputed from BLINDED-HUMAN-REVIEW-PACKET.json')
    prereg_rows = {row['id']: row for row in prereg['4_frozen_rows']}
    for row in packet_blinded['rows']:
        rid = row['REVIEW_ROW_ID']
        digest = sha256_text(row['TEXT'])
        recorded = frozen['rowTextHashes'][rid]
        check(
            f"{rid} text sha256 {digest[:16]}… — freeze / adjudication binding / §177 preregistration",
            digest == recorded['rowTextSha256']
            and len(row['TEXT']) == recorded['charCount']
            and digest == adjudication_record['boundToFrozenHashes'][rid]['rowTextSha256']
            and digest == prereg_rows[rid]['textSha256'],
        )

    # ---- 2. the adjudicated packet quotes the frozen text ---------------------------------------
    print('\nSTRICT ADJUDICATION PACKET — observations must be the frozen wording verbatim')
    for row in strict_packet['rows']:
        rid = row['rowId']
        check(
            f"{rid} packet observation matches frozen row text",
            sha256_text(row['observation']) == frozen['rowTextHashes'][rid]['rowTextSha256'],
        )

    # ---- 3. the review packets themselves are unmutated ------------------------------------------
    print('\nREVIEW PACKET FILES — unchanged since the §174 freeze')
    for name, recorded in frozen['REVIEW_PACKET_HASH'].items():
        check(f"{name} sha256", sha256_file(INSTRUMENT + name) == recorded)

    # ---- 4. frozen truth agrees everywhere -------------------------------------------------------
    print('\nFROZEN TRUTH — §174 record vs §177 preregistration vs run records')
    truth = {row['REVIEW_ROW_ID']: row['HUMAN_CLARIFICATION_REQUIRED'] for row in adjudication_record['rows']}
    for record in records:
        rid = record['rowId']
        check(
            f"{rid} truthRequired = {truth[rid]}",
            truth[rid] == prereg_rows[rid]['truthRequired'] == record['truthRequired'],
        )

    # ---- 5. emitted clarifications adjudicated are the ones actually returned --------------------
    print('\nEMISSIONS — adjudicated questions must be the executed ones, verbatim')
    by_id = {record['rowId']: record for record in records}
    for row in strict_packet['rows']:
        rid = row['rowId']
        check(
            f"{rid} packet clarifications identical to run record",
            json.dumps(row['emittedClarifications'], sort_keys=True)
            == json.dumps(by_id[rid]['clarifications'], sort_keys=True),
        )

    # ---- 6. run summary aggregates recompute from the records -------------------------------------
    print('\nRUN AGGREGATES — recomputed from the ten records')
    check('provider invocation count', len(records) == summary['PROVIDER_INVOCATION_COUNT'] == 10)
    check(
        'total cost USD',
        round(sum(r['telemetry']['computedCostUsd'] for r in records), 5)
        == summary['TOTAL_ACTUAL_COST_USD'],
    )
    check(
        'prompt/output tokens and mean latency',
        sum(r['telemetry']['promptTokens'] for r in records) == summary['totalPromptTokens']
        and sum(r['telemetry']['outputTokens'] for r in records) == summary['totalOutputTokens']
        and round(sum(r['telemetry']['latencyMs'] for r in records) / len(records))
        == summary['meanLatencyMs'],
    )
    check('all ten normalized VALID', all(r['normalizationState'] == 'VALID' for r in records))
    check('zero contract failures', not any(r.get('contractFailure') for r in records))
    check('raw provider output persisted for every row', all(r.get('rawProviderOutput') for r in records))

    # ---- 7. strict metrics ------------------------------------------------------------------------
    required = [r for r in records if r['truthRequired']]
    silence = [r for r in records if not r['truthRequired']]

    strict_hits, strict_misses = [], []
    for record in required:
        rid = record['rowId']
        if record['clarificationCount'] == 0:
            # Nothing was emitted, so nothing could address the owed fact. Not adjudicable.
            strict_misses.append({'rowId': rid, 'reason': 'NO_EMISSION'})
        elif STRICT_ADJUDICATIONS.get(rid) is True:
            strict_hits.append(rid)
        elif STRICT_ADJUDICATIONS.get(rid) is False:
            strict_misses.append({'rowId': rid, 'reason': 'EMITTED_BUT_DID_NOT_ADDRESS_THE_OWED_FACT'})
        else:
            strict_misses.append({'rowId': rid, 'reason': 'UNADJUDICATED'})

    silence_correct = [r['rowId'] for r in silence if r['clarificationCount'] == 0]
    silence_wrong = [r['rowId'] for r in silence if r['clarificationCount'] > 0]

    recall = len(strict_hits) / len(required)
    precision = len(silence_correct) / len(silence)
    balanced = (recall + precision) / 2
    row_level = (len(strict_hits) + len(silence_correct)) / len(records)

    print('\nSTRICT METRICS — recomputed, never copied')
    print(f"  REQUIRED_RECALL_STRICT = {len(strict_hits)}/{len(required)} = {recall:.2f}")
    print(f"  SILENCE_PRECISION      = {len(silence_correct)}/{len(silence)} = {precision:.2f}")
    print(f"  BALANCED_ACCURACY      = ({recall:.2f} + {precision:.2f}) / 2 = {balanced:.2f}")
    print(f"  ROW_LEVEL_ACCURACY     = {len(strict_hits) + len(silence_correct)}/{len(records)} = {row_level:.2f}")
    print(f"  strict hits   : {strict_hits}")
    print(f"  strict misses : {strict_misses}")
    print(f"  silence wrong : {silence_wrong}")

    print('\nRECONCILIATION against the authorization\'s expected values')
    computed = {
        'REQUIRED_RECALL_STRICT': recall,
        'SILENCE_PRECISION': precision,
        'BALANCED_ACCURACY': balanced,
        'ROW_LEVEL_ACCURACY': row_level,
    }
    for name, expected in EXPECTED.items():
        check(f"{name} expected {expected:.2f} recomputed {computed[name]:.2f}", abs(computed[name] - expected) < 1e-9)

    print()
    if failures:
        print('PRE_CLOSURE_INTEGRITY = BROKEN')
        print('SECTION_177_STRICT_CLOSURE = BLOCKED — EVIDENCE_RECONCILIATION_REQUIRED')
        for item in failures:
            print(f'  - {item}')
        return 1

    print('PRE_CLOSURE_INTEGRITY = INTACT')
    print('METRICS_REPRODUCE = TRUE')
    return 0


if __name__ == '__main__':
    sys.exit(main())
