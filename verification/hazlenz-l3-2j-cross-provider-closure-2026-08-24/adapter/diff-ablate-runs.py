"""Field-by-field comparison of two LOCKED-HARNESS (ablate-l32g) artifacts, per scenario.

Fields are stated explicitly. `derived` is compared only when BOTH sides carry it (structural runs);
ladder runs have `derived: null` by construction and that is not a difference.
"""
import json, sys

FIELDS = ['outcome', 'candidateCount', 'modelStates', 'modelAssertsActive',
          'raisedClarification', 'derivedAssertsActive', 'derivedClarification']

def load(p, variant=None):
    d = json.load(open(p))
    rows = [r for r in d['rows'] if variant is None or r['variant'] == variant]
    return d, {r['scenarioId']: r for r in rows}

lp, lv = (sys.argv[1].split('::') + [None])[:2]
rp, rv = (sys.argv[2].split('::') + [None])[:2]
a, ra = load(lp, lv)
b, rb = load(rp, rv)
ids = [i for i in ra if i in rb]

diffs = []
for i in ids:
    for f in FIELDS:
        if json.dumps(ra[i].get(f)) != json.dumps(rb[i].get(f)):
            diffs.append((i, f, ra[i].get(f), rb[i].get(f)))

out = {
  'left':  {'path': lp, 'variant': lv, 'model': a['heldConstant']['model'], 'generatedAt': a['generatedAt']},
  'right': {'path': rp, 'variant': rv, 'model': b['heldConstant']['model'], 'generatedAt': b['generatedAt']},
  'fieldsCompared': FIELDS, 'scenariosCompared': len(ids),
  'comparisonsMade': len(ids) * len(FIELDS),
  'differingFields': len(diffs),
  'differingScenarios': sorted({d[0] for d in diffs}),
  'differences': [{'scenarioId': d[0], 'field': d[1], 'left': d[2], 'right': d[3]} for d in diffs],
}
if len(sys.argv) > 3:
    json.dump(out, open(sys.argv[3], 'w'), indent=2)
print(f"{len(diffs)} differing fields of {out['comparisonsMade']}; "
      f"{len(out['differingScenarios'])} of {len(ids)} scenarios differ")
for d in diffs:
    print(f"  {d[0]:12s} {d[1]:22s} {json.dumps(d[2])}  ->  {json.dumps(d[3])}")
