#!/usr/bin/env python3
"""
PREREGISTERED SHORTCUT-SEPARABILITY SCAN FOR THE RETAINED CORPUS. §174.

================================ WHY THIS IS WRITTEN FIRST ================================

This file was authored and frozen BEFORE any human verdict was returned, and before it was
known which rows would be retained. That ordering is the whole point. A confound scan chosen
after seeing the outcome can be tuned -- consciously or not -- to the answer that is wanted.
Preregistering it means the scan that runs is the scan that was committed to.

Its hash is recorded in the §174 report. If this file changes before it is run on real
verdicts, the preregistration is void and must be declared void.

================================ WHAT IT ACTUALLY TESTS ================================

The governing rule is broader than the four shortcuts already discovered (length, verification
vocabulary, hazard domain, negation count):

    If a simple non-semantic classifier can materially separate REQUIRED from SILENCE using
    surface or metadata features available in the instrument, precision results are not
    interpretable until that separability is remediated.

So this does not check a fixed list of known defects. It enumerates a broad family of SIMPLE
classifiers and reports the BEST accuracy any of them achieves:

  * every numeric surface feature, swept over every threshold in both directions
  * every token, as a presence rule and as a count rule
  * every metadata field, as an equality rule
  * first token and last token of the row

"Simple" means a rule a person could state in one sentence without reading for meaning. If the
best such rule beats chance materially, the corpus leaks regardless of which feature carries it.

Chance is computed from the actual class balance, not assumed to be 0.5, because a pruned
corpus is usually unbalanced and a majority-class rule already scores above half.

Usage:
    python3 preregistered-retained-corpus-scan.py <verdicts.json> [--out <report.json>]

<verdicts.json> must contain a "rows" list of objects with REVIEW_ROW_ID and
HUMAN_CLARIFICATION_REQUIRED (true/false). Rows with a null verdict are excluded from the
scan and reported as unadjudicated. Row text is read from the frozen packet and its hash is
re-verified, so a scan can never run against mutated wording.
"""

import json, sys, re, hashlib, argparse, collections
from pathlib import Path

D = Path(__file__).resolve().parent

# Sweeping thousands of candidate rules over ten rows will find a perfect separator by luck
# alone. This is reported alongside every result so a "perfect classifier" is not mistaken for
# evidence of leakage when the corpus is too small to distinguish luck from structure.
def expected_best_by_chance(n_a, n_b, n_rules):
    """Rough guard: probability a given rule splits a random labelling perfectly."""
    from math import comb
    n = n_a + n_b
    if n == 0:
        return None
    p_one = 1.0 / comb(n, min(n_a, n_b)) if comb(n, min(n_a, n_b)) else 1.0
    return {'perfectSplitsPossibleByChance': True,
            'probabilityOneFixedRuleSplitsPerfectly': round(p_one, 6),
            'candidateRulesSwept': n_rules,
            'expectedNumberOfPerfectRulesUnderNoSignal': round(p_one * n_rules, 3),
            'readThisBeforeConcluding':
                'With a corpus this small a perfect single-feature rule is expected even with no '
                'real leakage. Treat a perfect rule as a prompt to inspect the feature by hand, '
                'not as proof of a confound; and treat a HIGH best-accuracy on a small corpus as '
                'uninformative rather than as a clean bill of health.'}


NEGATIONS = ['not', 'no', 'never', 'without', 'cannot', "n't", 'nor', 'unread', 'does not']


def tokens(text):
    return re.findall(r"[a-z][a-z'-]*", text.lower())


def numeric_features(text):
    toks = tokens(text)
    sentences = [s for s in re.split(r'(?<=[.!?])\s+', text.strip()) if s]
    low = text.lower()
    return {
        'charCount': len(text),
        'wordCount': len(toks),
        'sentenceCount': len(sentences),
        'meanWordLength': round(sum(len(t) for t in toks) / max(len(toks), 1), 4),
        'meanSentenceLength': round(len(toks) / max(len(sentences), 1), 4),
        'uniqueTokenRatio': round(len(set(toks)) / max(len(toks), 1), 4),
        'commaCount': text.count(','),
        'semicolonCount': text.count(';'),
        'periodCount': text.count('.'),
        'digitCount': sum(c.isdigit() for c in text),
        'questionMarkCount': text.count('?'),
        'negationCount': sum(low.count(n) for n in NEGATIONS),
        'longWordCount': sum(1 for t in toks if len(t) >= 9),
        'hyphenCount': text.count('-'),
    }


def sweep_numeric(rows, labels, feature_names):
    """Every numeric feature, every threshold, both directions."""
    best, swept = [], 0
    n = len(rows)
    for f in feature_names:
        vals = sorted({rows[i]['features'][f] for i in range(n)})
        cuts = [(vals[i] + vals[i + 1]) / 2 for i in range(len(vals) - 1)] or [vals[0]]
        for c in cuts:
            for direction in ('>=', '<'):
                swept += 1
                pred = [(rows[i]['features'][f] >= c) if direction == '>='
                        else (rows[i]['features'][f] < c) for i in range(n)]
                acc = sum(pred[i] == labels[i] for i in range(n)) / n
                acc = max(acc, 1 - acc)  # a rule and its negation are the same rule
                best.append((acc, f'{f} {direction} {c}'))
    best.sort(key=lambda x: -x[0])
    return best, swept


def sweep_tokens(rows, labels):
    """Every token as a presence rule, and as a count-threshold rule."""
    n = len(rows)
    vocab = sorted({t for r in rows for t in set(tokens(r['text']))})
    best, swept = [], 0
    for tok in vocab:
        swept += 1
        pred = [tok in tokens(rows[i]['text']) for i in range(n)]
        acc = sum(pred[i] == labels[i] for i in range(n)) / n
        acc = max(acc, 1 - acc)
        best.append((acc, f'contains "{tok}"'))
    best.sort(key=lambda x: -x[0])
    return best, swept, len(vocab)


def sweep_metadata(rows, labels, meta_keys):
    """Every metadata field as an equality rule."""
    n = len(rows)
    best, swept = [], 0
    for k in meta_keys:
        vals = sorted({str(rows[i]['meta'].get(k)) for i in range(n)})
        for v in vals:
            swept += 1
            pred = [str(rows[i]['meta'].get(k)) == v for i in range(n)]
            acc = sum(pred[i] == labels[i] for i in range(n)) / n
            acc = max(acc, 1 - acc)
            best.append((acc, f'{k} == {v}'))
    best.sort(key=lambda x: -x[0])
    return best, swept


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('verdicts')
    ap.add_argument('--out', default=str(D / 'RETAINED-CORPUS-CONFOUND-SCAN.json'))
    a = ap.parse_args()

    packet = json.loads((D / 'BLINDED-HUMAN-REVIEW-PACKET.json').read_text(encoding='utf-8'))
    frozen = json.loads((D / 'FROZEN-ROW-HASHES.json').read_text(encoding='utf-8'))
    text_by_id = {r['REVIEW_ROW_ID']: r['TEXT'] for r in packet['rows']}

    # Refuse to scan mutated wording. A scan over text that is not what was adjudicated
    # would attribute a human verdict to a row that no human read.
    drift = [rid for rid, v in frozen['rowTextHashes'].items()
             if hashlib.sha256(text_by_id[rid].encode('utf-8')).hexdigest() != v['rowTextSha256']]
    if drift:
        sys.exit(f'REFUSED: row text changed since freeze for {drift}. '
                 f'Those rows return to PENDING_INDEPENDENT_HUMAN_ADJUDICATION.')

    vin = json.loads(Path(a.verdicts).read_text(encoding='utf-8'))
    unadjudicated = [r['REVIEW_ROW_ID'] for r in vin['rows']
                     if r.get('HUMAN_CLARIFICATION_REQUIRED') is None]
    adjudicated = [r for r in vin['rows'] if r.get('HUMAN_CLARIFICATION_REQUIRED') is not None]

    retained = set(vin.get('RETAINED_ROW_IDS') or [r['REVIEW_ROW_ID'] for r in adjudicated])
    rows, labels = [], []
    for r in adjudicated:
        rid = r['REVIEW_ROW_ID']
        if rid not in retained:
            continue
        txt = text_by_id[rid]
        rows.append({'id': rid, 'text': txt, 'features': numeric_features(txt),
                     'meta': {k: r.get(k) for k in
                              ('EVIDENCE_SUFFICIENCY_CONCERN', 'TEMPORAL_SCOPE_CONCERN',
                               'HUMAN_CONFIDENCE', 'COUNTERFACTUAL_DECISION_CHANGE')}})
        labels.append(bool(r['HUMAN_CLARIFICATION_REQUIRED']))

    n = len(rows)
    if n < 2 or len(set(labels)) < 2:
        report = {'status': 'NOT_SCANNABLE', 'retainedRows': n,
                  'bothClassesPresent': len(set(labels)) > 1,
                  'reason': 'a separability scan needs at least two rows and both classes',
                  'unadjudicatedRows': unadjudicated}
        Path(a.out).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
        print(json.dumps(report, indent=2))
        return

    n_req, n_sil = sum(labels), n - sum(labels)
    baseline = max(n_req, n_sil) / n  # majority-class rule, the real floor

    fnames = list(rows[0]['features'].keys())
    num_best, num_swept = sweep_numeric(rows, labels, fnames)
    tok_best, tok_swept, vocab_n = sweep_tokens(rows, labels)
    meta_best, meta_swept = sweep_metadata(rows, labels, list(rows[0]['meta'].keys()))

    allr = sorted(num_best + tok_best + meta_best, key=lambda x: -x[0])
    best_acc = allr[0][0]
    swept = num_swept + tok_swept + meta_swept

    # Per-class token exclusivity, kept because it is the form the §172 defect took.
    req_tok = [set(tokens(rows[i]['text'])) for i in range(n) if labels[i]]
    sil_tok = [set(tokens(rows[i]['text'])) for i in range(n) if not labels[i]]
    only_req = sorted(set.union(*req_tok) - set.union(*sil_tok)) if req_tok and sil_tok else []
    only_sil = sorted(set.union(*sil_tok) - set.union(*req_tok)) if req_tok and sil_tok else []
    widest_req = max((sum(t in s for s in req_tok) for t in only_req), default=0)
    widest_sil = max((sum(t in s for s in sil_tok) for t in only_sil), default=0)

    report = collections.OrderedDict()
    report['status'] = 'SCANNED'
    report['preregistered'] = True
    report['scannerSha256'] = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    report['retainedRowIds'] = [r['id'] for r in rows]
    report['unadjudicatedRows'] = unadjudicated
    report['classBalance'] = {'REQUIRED': n_req, 'SILENCE': n_sil, 'total': n}
    report['majorityClassBaseline'] = round(baseline, 4)
    report['bestSimpleClassifier'] = {'accuracy': round(best_acc, 4), 'rule': allr[0][1],
                                      'liftOverBaseline': round(best_acc - baseline, 4)}
    report['top10Rules'] = [{'accuracy': round(x[0], 4), 'rule': x[1]} for x in allr[:10]]
    report['candidateRulesSwept'] = swept
    report['vocabularySize'] = vocab_n
    report['perFamilyBest'] = {
        'numericSurfaceFeature': {'accuracy': round(num_best[0][0], 4), 'rule': num_best[0][1]},
        'tokenPresence': {'accuracy': round(tok_best[0][0], 4), 'rule': tok_best[0][1]},
        'metadataField': ({'accuracy': round(meta_best[0][0], 4), 'rule': meta_best[0][1]}
                          if meta_best else None)}
    report['classExclusiveTokens'] = {
        'onlyRequired': only_req, 'onlySilence': only_sil,
        'widestRequiredCoverage': f'{widest_req} of {n_req}',
        'widestSilenceCoverage': f'{widest_sil} of {n_sil}'}
    report['smallCorpusCaveat'] = expected_best_by_chance(n_req, n_sil, swept)
    report['MATERIALLY_SEPARABLE'] = bool(best_acc >= 1.0)
    report['interpretation'] = (
        'MATERIALLY_SEPARABLE is set when some simple rule separates the retained classes '
        'perfectly. It is a trigger for hand inspection of the named rule, NOT an automatic '
        'verdict: read smallCorpusCaveat first, because on a corpus of this size a perfect rule '
        'is expected by chance alone. Equally, a best accuracy below 1.0 is not a clean bill of '
        'health on a small corpus -- it is simply uninformative.')
    Path(a.out).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
