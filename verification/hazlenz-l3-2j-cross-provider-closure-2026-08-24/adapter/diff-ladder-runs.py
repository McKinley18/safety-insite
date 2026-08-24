"""Field-by-field comparison of two shipped-pipeline (ladder) corpus artifacts.

The comparison set is stated explicitly rather than inferred, and is the same seven measured fields
section 41 compared when it proved the revert at 0/168 (24 scenarios x 7 fields).
"""
import json, sys

FIELDS = ['outcome', 'candidateCount', 'modelStates', 'modelAssertsActive',
          'candidateBorneClarification', 'validationState', 'validatedAssertsActive']

def load(p):
    d = json.load(open(p))
    return d, {r['scenarioId']: r for r in d['rows']}

a, ra = load(sys.argv[1])
b, rb = load(sys.argv[2])
ids = [r['scenarioId'] for r in a['rows']]
assert set(ids) == set(rb), 'cohort mismatch'

diffs = []
for i in ids:
    for f in FIELDS:
        if json.dumps(ra[i].get(f)) != json.dumps(rb[i].get(f)):
            diffs.append((i, f, ra[i].get(f), rb[i].get(f)))

out = {
    'left': {'path': sys.argv[1], 'pid': a['processIsolation']['pid'], 'model': a['provider']['model'],
             'promptSha256': a['shippedPath']['promptUsedSha256'], 'schemaSha256': a.get('schemaSha256')},
    'right': {'path': sys.argv[2], 'pid': b['processIsolation']['pid'], 'model': b['provider']['model'],
              'promptSha256': b['shippedPath']['promptUsedSha256'], 'schemaSha256': b.get('schemaSha256')},
    'fieldsCompared': FIELDS,
    'comparisonsMade': len(ids) * len(FIELDS),
    'differingFields': len(diffs),
    'differingScenarios': sorted({d[0] for d in diffs}),
    'differences': [{'scenarioId': d[0], 'field': d[1], 'left': d[2], 'right': d[3]} for d in diffs],
}
if len(sys.argv) > 3:
    json.dump(out, open(sys.argv[3], 'w'), indent=2)
print(f"{len(diffs)} differing fields of {out['comparisonsMade']}  "
      f"({len(out['differingScenarios'])} of {len(ids)} scenarios)")
for d in diffs:
    print(f"  {d[0]:12s} {d[1]:30s} {json.dumps(d[2])}  ->  {json.dumps(d[3])}")
