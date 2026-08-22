import json, re, sys
from collections import Counter, defaultdict

SP='/private/tmp/claude-501/-Users-mckinley/ff3d7df0-fd45-4d52-8a43-8832ca2b19f6/scratchpad'
matrix=json.load(open(f'{SP}/matrix/hazlenz-acceptance-matrix.json'))
SC={s['id']:s for s in matrix['scenarios']}
rows=[json.loads(l) for l in open(sys.argv[1])]

HIGH_CONSEQUENCE = re.compile(r'fall|electric|loto|energy|guard|confined|mobile|forklift|excavat|trench|fire|explos|respirat|chemical|struck', re.I)

def citations(p):
    out=[]
    pc=str(p.get('primaryCitation') or '').strip()
    if pc: out.append(pc)
    for s in (p.get('standardDecisions') or []):
        if s.get('citation'): out.append(str(s['citation']))
    for s in (p.get('suggestedStandards') or []):
        if s.get('citation'): out.append(str(s['citation']))
    for s in (p.get('primaryStandards') or []):
        if isinstance(s,dict) and s.get('citation'): out.append(str(s['citation']))
    for s in (p.get('standards') or []):
        if isinstance(s,dict) and s.get('citation'): out.append(str(s['citation']))
        elif isinstance(s,str): out.append(s)
    for s in (p.get('needsMoreEvidenceStandards') or []):
        if isinstance(s,dict) and s.get('citation'): out.append(str(s['citation']))
        elif isinstance(s,str): out.append(s)
    tr=(p.get('standardsTraceability') or {}).get('suggestedCitations') or []
    out += [str(x) for x in tr]
    return sorted(set(x for x in out if x))

def hazards(p):
    """Authoritative decomposition axis, with additionalHazards as the companion surface."""
    mh=(p.get('multiHazardDecomposition') or {})
    hs=list(mh.get('hazards') or [])
    out=[]
    for h in hs:
        out.append({'family':str(h.get('hazardFamily') or h.get('domainId') or ''),
                    'state':str(h.get('conditionState') or '').upper(),
                    'fragment':str(h.get('observationFragment') or ''),
                    'src':'decomposition'})
    for h in (p.get('additionalHazards') or []):
        out.append({'family':str(h.get('family') or h.get('hazardCategory') or ''),
                    'state':str(h.get('conditionState') or '').upper(),
                    'fragment':str(h.get('observationFragment') or ''),
                    'src':'additionalHazards'})
    return out

def distinct_hazard_families(p):
    fams=set()
    for h in hazards(p):
        f=h['family'].lower().strip()
        if f: fams.add(f)
    return fams

def forced_questions(p):
    out=[]
    for q in (p.get('clarifyingQuestions') or []):
        if q.get('required') is True or q.get('safetyDecisive') is True or q.get('blocksFinalization') is True:
            out.append(q)
    return out

def advisory_questions(p):
    out=[]
    for q in (p.get('clarifyingQuestions') or []):
        if not (q.get('required') is True or q.get('safetyDecisive') is True or q.get('blocksFinalization') is True):
            out.append(q)
    return out

def action_text(p):
    parts=[]
    for a in (p.get('generatedActions') or []):
        parts.append(str(a.get('title') or ''))
        parts.append(str(a.get('description') or ''))
        for f in (a.get('suggestedFixes') or []): parts.append(str(f))
        orig=a.get('originalSuggestion') or {}
        parts.append(str(orig.get('hazard') or ''))
        for f in (orig.get('fixes') or []): parts.append(str(f))
        car=orig.get('correctiveActionReasoning') or {}
        for k in ['immediateActionNarrative','interimControlNarrative','permanentCorrectionNarrative',
                  'administrativeFollowUpNarrative','verificationNarrative']:
            parts.append(str(car.get(k) or ''))
    return ' \n '.join(parts)

def narrative_text(p):
    parts=[str(p.get('narrative') or ''), str(p.get('explanation') or '')]
    de=p.get('decisionExplainability')
    parts.append(json.dumps(de) if de else '')
    parts.append(json.dumps(p.get('riskReasoning') or {}))
    return ' \n '.join(parts)

results=[]
calib=[]
for r in rows:
    sc=SC[r['id']]; p=r['payload'] or {}
    checks=[]
    def fail(code, detail): checks.append({'check':code,'detail':detail})

    cits=citations(p)
    hz=hazards(p)
    fams=distinct_hazard_families(p)
    active=[h for h in hz if h['state']=='ACTIVE']
    cstate=str(p.get('conditionState') or '').upper()
    atext=action_text(p); ntext=narrative_text(p)
    alltext=' '.join([json.dumps(p.get('classification')), atext, ntext,
                      json.dumps([h['family'] for h in hz])])

    # 1. expected hazards detected?
    for eh in (sc.get('expectedHazards') or []):
        pat=re.compile(eh['family'], re.I)
        hit = any(pat.search(h['family'] or '') for h in hz) or pat.search(str(p.get('classification') or '')) or pat.search(str(p.get('family') or ''))
        if not hit:
            fail('FALSE_NEGATIVE_HAZARD', f"expected family /{eh['family']}/ not found; got families={sorted(fams)} classification={p.get('classification')}")

    # 2. negative control must produce no active finding
    if sc.get('mustProduceNoActiveFinding'):
        if active:
            fail('FALSE_POSITIVE_ACTIVE', f"{len(active)} ACTIVE hazard(s) on a negative control: {[h['family'] for h in active]}")
        real=[c for c in cits if re.search(r'\d{2,4}\.\d', c)]
        if real:
            fail('FALSE_POSITIVE_CITATION', f"citations emitted on a negative control: {real}")

    # 3. forbidden concepts
    for nh in (sc.get('expectedNonHazards') or []):
        if re.search(re.escape(nh), alltext, re.I):
            fail('FORBIDDEN_CONCEPT', f"'{nh}' appears in output")

    # 4. condition state -- scored on the AUTHORITATIVE per-hazard axis (see ORACLE_CORRECTION.md).
    exp_cs = sc.get('expectedConditionState')
    active_allowed = bool(exp_cs) and 'ACTIVE' in [a.strip().upper() for a in (exp_cs or '').split('|')]
    expects_active = bool(exp_cs) and (exp_cs or '').strip().upper() == 'ACTIVE'
    per_states = [h['state'] for h in hz if h['state']]
    any_active = any(s == 'ACTIVE' for s in per_states)
    if exp_cs:
        if expects_active:
            if not any_active:
                fail('CONDITION_STATE_NOT_ACTIVE',
                     f"expected an ACTIVE hazard; per-hazard states={per_states or 'none'}")
        else:
            # scenario describes a safe / controlled / corrected / hypothetical / no-violation state
            if any_active and not active_allowed:
                fail('FABRICATED_ACTIVE_STATE',
                     f"per-hazard ACTIVE on a non-active observation (expected /{exp_cs}/); states={per_states}")
    # uncertainty calibration, reported separately and never scored as a false positive
    if expects_active and cstate != 'ACTIVE':
        calib.append((r['id'], cstate))

    # 5. citations must-not
    for bad in (sc.get('citationMustNotInclude') or []):
        hits=[c for c in cits if bad.replace('(','\\(').replace(')','\\)') in c or re.search(re.escape(bad), c)]
        if hits: fail('WRONG_CITATION', f"forbidden citation {bad} emitted: {hits}")
    # 6. citations should-include
    inc = sc.get('citationShouldInclude')
    if inc:
        if not any(any(re.search(re.escape(x), c) for c in cits) for x in inc):
            fail('MISSING_CITATION', f"none of {inc} emitted; got {cits[:8]}")
    if sc.get('citationMustBeNonEmpty'):
        real=[c for c in cits if re.search(r'\d{2,4}\.\d', c)]
        if not real: fail('EMPTY_STANDARDS', f"no citations emitted; got {cits}")

    # 7. clarification behaviour
    fq=forced_questions(p); aq=advisory_questions(p)
    if sc.get('clarificationRequired') is True and not fq:
        fail('MISSED_CRITICAL_CLARIFICATION', f"expected a decision-critical question ({sc.get('clarificationMustResolve')}); forced=0 advisory={len(aq)}")
    if sc.get('clarificationRequired') is False and fq:
        fail('UNNECESSARY_CLARIFICATION', f"{len(fq)} forced question(s): {[q.get('id') for q in fq]}")
    for bad in (sc.get('clarificationMustNotAsk') or []):
        for q in (p.get('clarifyingQuestions') or []):
            if re.search(re.escape(bad), str(q.get('question') or ''), re.I):
                fail('REDUNDANT_CLARIFICATION', f"asks for a fact already stated: {str(q.get('question'))[:110]}")

    # 8. corrective action contamination
    for bad in (sc.get('correctiveActionMustNotReference') or []):
        if re.search(re.escape(bad), atext, re.I):
            fail('WRONG_HAZARD_ACTION', f"corrective action references '{bad}' (not in the observation)")
    # 9. invented evidence
    for bad in (sc.get('explanationMustNotInvent') or []):
        if re.search(re.escape(bad), atext + ' ' + ntext, re.I):
            fail('INVENTED_EVIDENCE', f"output asserts '{bad}' which the observation never states")

    # 10/11 decomposition counts
    if sc.get('minDistinctHazards') and len(fams) < sc['minDistinctHazards']:
        fail('UNDER_DECOMPOSITION', f"expected >= {sc['minDistinctHazards']} distinct families, got {len(fams)}: {sorted(fams)}")
    if sc.get('maxDistinctHazards') and len(fams) > sc['maxDistinctHazards']:
        fail('OVER_DECOMPOSITION', f"expected <= {sc['maxDistinctHazards']} distinct families, got {len(fams)}: {sorted(fams)}")

    # 12. jurisdiction behaviour
    jb=sc.get('jurisdictionBehavior')
    rc=p.get('regulatoryContext') or {}
    if jb:
        val=str(rc.get('value') or ''); prov=str(rc.get('provenance') or '')
        if jb=='should_infer_osha_general_industry' and val!='osha-general-industry':
            fail('JURISDICTION_NOT_INFERRED', f"expected inferred osha-general-industry, got value={val} provenance={prov}")
        if jb=='should_infer_osha_construction' and val!='osha-construction':
            fail('JURISDICTION_NOT_INFERRED', f"expected inferred osha-construction, got value={val} provenance={prov}")
        if jb=='should_infer_msha' and val!='msha':
            fail('JURISDICTION_NOT_INFERRED', f"expected inferred msha, got value={val} provenance={prov}")
        if jb=='must_not_assert_false_certainty' and prov=='USER_CONFIRMED' and val not in ('unknown',''):
            fail('FALSE_JURISDICTION_CERTAINTY', f"claims USER_CONFIRMED {val} on an ambiguous observation")

    results.append({'id':r['id'],'cohort':r['cohort'],'title':sc['title'],
                    'checks':checks,'nFail':len(checks),
                    'families':sorted(fams),'citations':cits[:10],'conditionState':cstate,
                    'classification':p.get('classification'),
                    'forcedQ':[q.get('id') for q in fq],'advisoryQ':len(aq),
                    'riskBand':(p.get('risk') or {}).get('riskBand'),
                    'riskScore':(p.get('risk') or {}).get('riskScore'),
                    'jurisdiction':{'value':rc.get('value'),'provenance':rc.get('provenance')}})

json.dump(results, open(sys.argv[2],'w'), indent=1)
print(f"[calibration] top-level conditionState != ACTIVE on {len(calib)} scenarios whose evidence establishes an active hazard (reported, not scored as a false positive)")
clean=[r for r in results if r['nFail']==0]
print(f"=== {sys.argv[1].split('/')[-1]} ===")
print(f"scenarios={len(results)}  clean={len(clean)}  withFailures={len(results)-len(clean)}")
print()
byc=defaultdict(lambda:[0,0])
for r in results:
    byc[r['cohort']][0]+=1
    if r['nFail']==0: byc[r['cohort']][1]+=1
print("cohort                 total  clean")
for k,(t,c) in sorted(byc.items()): print(f"{k:22s} {t:5d} {c:6d}")
print()
cc=Counter(c['check'] for r in results for c in r['checks'])
print("failure-check frequency:")
for k,v in cc.most_common(): print(f"  {k:32s} {v}")
