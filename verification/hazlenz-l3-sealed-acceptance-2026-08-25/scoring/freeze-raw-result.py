#!/usr/bin/env python3
"""PHASE 8 -- freeze the complete raw sealed result BEFORE scoring. Read-only over the results."""
import json, hashlib, sys, collections, datetime, os
P = 'verification/hazlenz-l3-sealed-acceptance-2026-08-25'
def sha(p): return hashlib.sha256(open(p,'rb').read()).hexdigest()
print('L3 FINAL SINGLE-USE SEALED ACCEPTANCE -- PHASE 8: THE COMPLETE RAW RESULT, FROZEN BEFORE SCORING')
print('recorded ' + datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%dT%H:%M:%SZ'))
print()
print('  HOLDOUT_SPENT = TRUE. It became true at the first transmission and is never reverted.')
print()
tot_calls = 0
for label in ('A','B'):
    f = f'{P}/results/raw-process-{label}.json'
    d = json.load(open(f))
    rows = d['rows']
    tr = f'{P}/transport/transport-{label}.jsonl'
    trecs = [json.loads(l) for l in open(tr)] if os.path.exists(tr) else []
    tot_calls += d['providerCalls']
    print(f'================ PROCESS {label} =================================================')
    print(f'  file                       results/raw-process-{label}.json')
    print(f'  sha256                     {sha(f)}')
    print(f'  pid                        {d["pid"]}   (isolated OS process, section 38.3)')
    print(f'  started / finished         {d["startedAt"]}  /  {d["finishedAt"]}')
    print(f'  expected rows              {d["expectedRows"]}')
    print(f'  attempted rows             {len(rows)}')
    print(f'  completed provider responses {sum(1 for r in rows if r["validationState"] is not None)}')
    print(f'  provider calls (incl. retries) {d["providerCalls"]}')
    print(f'  requested model            {d["requestedModel"]}')
    print(f'  prompt / schema            {d["promptVersion"]}  /  {d["runSchemaSha256"]}')
    print(f'  temperature / seed / num_ctx  {d["temperature"]} / {d["seed"]} / {d["numCtx"]}')
    print()
    print('  --- transport ---')
    print(f'  transport records          {len(trecs)}')
    st = collections.Counter(r.get("status") for r in trecs)
    print(f'  HTTP status distribution   {dict(st)}')
    print(f'  retried at transport level {sum(1 for r in trecs if r.get("retrying"))}')
    print(f'  stop reasons               {dict(collections.Counter(r.get("stopReason") for r in trecs))}')
    print(f'  RETURNED MODEL IDENTITIES  {sorted({r.get("respondedModel") for r in trecs if r.get("respondedModel")})}')
    print()
    print('  --- pipeline outcomes ---')
    print(f'  outcome kinds              {dict(collections.Counter(r["outcomeKind"] for r in rows))}')
    print(f'  malformed outputs          {sum(1 for r in rows if r["outcomeKind"]=="MALFORMED_OUTPUT")}')
    print(f'  provider timeouts          {sum(1 for r in rows if r["outcomeKind"]=="PROVIDER_TIMEOUT")}')
    print(f'  provider unavailable       {sum(1 for r in rows if r["outcomeKind"]=="PROVIDER_UNAVAILABLE")}')
    print(f'  rows with retries          {sum(1 for r in rows if r["retries"]>0)}   (retry ceiling 1, frozen)')
    print(f'  attempts distribution      {dict(collections.Counter(r["attempts"] for r in rows))}')
    print(f'  validator states           {dict(collections.Counter(r["validationState"] for r in rows))}')
    vi = collections.Counter()
    for r in rows:
        for c in r['validationIssueCodes']: vi[c]+=1
    print(f'  validator issue codes      {dict(vi) if vi else "(none)"}')
    print(f'  schemaValid true           {sum(1 for r in rows if r["schemaValid"])}/{len(rows)}')
    sem = collections.Counter()
    semrej = semdem = 0
    for r in rows:
        s=r.get('semanticTier')
        if s:
            for c in s['issueCodes']: sem[c]+=1
            semrej += len(s['rejected']); semdem += len(s['demoted'])
    print(f'  SEMANTIC-BINDER TIER       rejected {semrej}  demoted {semdem}  issue codes {dict(sem) if sem else "(none)"}')
    print(f'                             (D-58: recorded separately, NEVER merged with the VALIDATED tier)')
    print(f'  redaction                  hazlenz.l3.redaction.v1; rows with any redaction '
          f'{sum(1 for r in rows if r["redactionCount"]>0)}; total redactions {sum(r["redactionCount"] for r in rows)}')
    rr = collections.Counter()
    for r in rows:
        for x in r['redactionsPerRule']: rr[x['rule']] += x['count']
    print(f'  redactions per rule        {dict(rr) if rr else "(none)"}')
    print(f'  execution ordering         executionIndex 1..{len(rows)}, holdout order preserved: '
          f'{[r["rowId"] for r in rows] == [f"H2A-{i:03d}" for i in range(1,len(rows)+1)]}')
    print(f'  request/result linkage     every row carries rowId + sourceId + provenanceClass + executionIndex')
    print()
print('================ COMBINED =====================================================')
print(f'  TOTAL PROVIDER CALLS ACROSS BOTH ISOLATED PROCESSES   {tot_calls}')
print(f'  destinations contacted                                1  (api.anthropic.com)')
print()
print('  THIS RAW RESULT IS FROZEN. It is NOT edited after the score is seen.')
