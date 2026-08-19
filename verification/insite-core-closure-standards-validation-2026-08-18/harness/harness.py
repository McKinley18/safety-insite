#!/usr/bin/env python3
"""Live-endpoint harness for Sections D (jurisdiction narrowing), E (manual findings) and
F–J (autonomy / clarification burden). Writes JSON + markdown tables into the verification dir.

Every case is run against the REAL /safescope-v2/classify endpoint with a REAL persisted
inspection whose regulatoryContext is the case's context (so the backend's authoritative
inheritance path is what is being measured, not a unit shortcut).
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hz

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(hz.SP, "harness-out")
os.makedirs(OUT, exist_ok=True)

INSPECTIONS = {}
def inspection_for(ctx):
    if ctx not in INSPECTIONS:
        body = {"siteId": hz.first_site(), "title": f"Harness {ctx}"}
        if ctx != "unknown":
            body["regulatoryContext"] = ctx
        d = hz.call("POST", "/inspections", body)
        assert d.get("regulatoryContext") == ctx, d
        INSPECTIONS[ctx] = d["id"]
    return INSPECTIONS[ctx]

def cites(d):
    return [(a["citation"], a["status"], a.get("jurisdictionProvenance")) for a in d.get("applicabilityDecisions", [])]

def hazards(d):
    return [{"domain": h.get("domainId"), "state": h.get("conditionState"),
             "fragment": (h.get("observationFragment") or "")[:90],
             "cands": [(c["citation"], c["applicability"], c.get("jurisdictionProvenance")) for c in h.get("standardCandidates", [])]}
            for h in d.get("multiHazardDecomposition", {}).get("hazards", [])]

def questions(d):
    gf = d.get("guidedFinding") or {}
    qs = gf.get("clarificationQuestions") or d.get("clarificationQuestions") or []
    return [{"id": q.get("id"), "q": q.get("question"), "options": q.get("options"), "materialTo": q.get("materialTo") or q.get("impactedDecisions")} for q in qs]

def run_case(case):
    ctx = case.get("context", "unknown")
    insp = inspection_for(ctx)
    d = hz.classify(insp, case["text"], "unknown", case.get("answers"))
    tries = 0
    while d.get("__error__") == 429 and tries < 4:
        time.sleep(31); tries += 1
        d = hz.classify(insp, case["text"], "unknown", case.get("answers"))
    time.sleep(2.2)
    if "__error__" in d:
        return {"id": case["id"], "error": d}
    rc = d.get("regulatoryContext") or {}
    ps = (d.get("guidedFinding") or {}).get("primaryStandard")
    raw_qs = d.get("clarificationQuestions") or d.get("clarifyingQuestions") or []
    return {
        "rawQuestions": [{k: q.get(k) for k in ("id", "question", "priority", "requiredFor", "safetyDecisive", "blocksFinalization", "answerType", "options")} for q in raw_qs if isinstance(q, dict)],
        "resultStage": d.get("resultStage"), "mayFinalize": d.get("mayFinalize"),
        "evidenceSufficiency": (d.get("evidenceSufficiency") or {}).get("sufficiencyLevel") if isinstance(d.get("evidenceSufficiency"), dict) else d.get("evidenceSufficiency"),
        "finalizationGate": d.get("finalizationGate") or d.get("finalizationDecision"),
        "id": case["id"], "context": ctx, "text": case["text"],
        "regulatoryContext": {k: rc.get(k) for k in ("value", "provenance", "source", "basis")},
        "decisions": cites(d), "hazards": hazards(d), "questions": questions(d),
        "conditionState": d.get("conditionState"), "requiresHumanReview": d.get("requiresHumanReview"),
        "primaryStandard": ps and {"citation": ps["citation"], "applicability": ps["applicability"], "confidenceLabel": ps["confidenceLabel"]},
        "reviewStateLabel": d.get("reviewStateLabel"), "assessmentDisposition": d.get("assessmentDisposition"),
        "riskBand": (d.get("risk") or {}).get("riskBand"),
    }

if __name__ == "__main__":
    cases = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else []
    results = []
    for c in cases:
        r = run_case(c)
        results.append(r)
        print(json.dumps({k: r.get(k) for k in ("id", "regulatoryContext", "decisions", "questions")}, default=str)[:400])
    json.dump(results, open(os.path.join(OUT, "results.json"), "w"), indent=1, default=str)
    json.dump(INSPECTIONS, open(os.path.join(OUT, "inspections.json"), "w"))
    print("wrote", OUT)
