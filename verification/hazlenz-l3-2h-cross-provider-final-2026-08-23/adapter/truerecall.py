import json,subprocess
L32H="/Users/mckinley/Desktop/Safety_InSite/verification/hazlenz-l3-2h-cross-provider-2026-08-23/results"
# R1_MISSING_FIRST, transcribed verbatim from score-l32g-order-sensitivity.ts
def resolveR1(f):
    settled = (f['hazardExplicitlyDenied'] and not f['hazardAsserted']) or f['disposition']!='NONE' \
              or (f['framing']=='CONDITIONAL' and not f['hazardAsserted'])
    if f['decisionCriticalFactMissing'] and not settled:
        return ('INSUFFICIENT_EVIDENCE', True)
    return (None, None)  # placeholder; full resolver lives in TS

def load(paths):
    rows=[]
    for p in paths: rows.extend(json.load(open(p))['rows'])
    return rows

def report(name, rows):
    print(f'===== {name} =====')
    print(f'  {"variant":20s} {"HCfull":>8} {"falseACT_full":>14} {"clarRecall_full":>16} {"missed"}')
    for v in ['V_S_STRUCT','V_S_STRUCT_MOVE1','V_S_STRUCT_REPEAT']:
        rs=[r for r in rows if r['variant']==v]
        if not rs: continue
        # HC: expectActive must be derived ACTIVE. No candidates => miss.
        hc=[r for r in rs if r['expectActive']]
        hchit=[r for r in hc if r.get('derivedAssertsActive') is True]
        # false ACTIVE over ALL non-HC scenarios, no-candidate counts as no-false-active
        neg=[r for r in rs if not r['expectActive']]
        fa=[r for r in neg if r.get('derivedAssertsActive') is True]
        cl=[r for r in rs if r['expectClarification']]
        clhit=[r for r in cl if r.get('derivedClarification') is True]
        missed=[r['scenarioId'] for r in cl if not r.get('derivedClarification')]
        print(f'  {v:20s} {len(hchit)}/{len(hc):<6} {len(fa)}/{len(neg):<12} {len(clhit)}/{len(cl):<14} {",".join(missed) or "-"}')
    print()

report('GEMINI-3.1-PRO (thinkingLevel=low)', load(['l32h-gemini-merged.json']))
report('QWEN3-CODER:30B (L3-2g/h baseline)', load([f'{L32H}/baseline-repro.json']))
