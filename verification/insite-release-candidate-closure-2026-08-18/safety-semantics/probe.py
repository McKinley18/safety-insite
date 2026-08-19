#!/usr/bin/env python3
"""Focused probe for control-state / contradiction semantics against the live classify endpoint."""
import json, os, sys, time
import hz

INSPECTIONS = {}
def inspection_for(ctx):
    if ctx not in INSPECTIONS:
        body = {"siteId": hz.first_site(), "title": f"Semantics probe {ctx}"}
        if ctx != "unknown":
            body["regulatoryContext"] = ctx
        d = hz.call("POST", "/inspections", body)
        assert d.get("regulatoryContext") == ctx, d
        INSPECTIONS[ctx] = d["id"]
    return INSPECTIONS[ctx]

def run(ctx, text):
    d = hz.classify(inspection_for(ctx), text, "unknown")
    tries = 0
    while d.get("__error__") == 429 and tries < 6:
        time.sleep(31); tries += 1
        d = hz.classify(inspection_for(ctx), text, "unknown")
    time.sleep(2.3)
    return d

def brief(d):
    if "__error__" in d: return {"error": d}
    g = d.get("guidedFinding") or {}
    hs = (d.get("multiHazardDecomposition") or {}).get("hazards") or []
    return {
        "risk": (g.get("riskAssessment") or {}).get("overallRisk"),
        "conditionState": d.get("conditionState"),
        "hazards": [(h.get("domainId"), h.get("conditionState"), (h.get("observationFragment") or "")[:50]) for h in hs],
        "decisions": [(x.get("citation"), x.get("status")) for x in (d.get("applicabilityDecisions") or [])],
        "primary": ((g.get("primaryStandard") or {}).get("citation"), (g.get("primaryStandard") or {}).get("applicability")),
        "questions": [q.get("question") for q in (d.get("clarificationQuestions") or [])],
        "contradictions": d.get("unresolvedContradictions") or [],
        "contradictionIntelligence": (d.get("contradictionIntelligence") or {}).get("summary") if isinstance(d.get("contradictionIntelligence"), dict) else None,
        "confidence": d.get("confidence"), "band": d.get("confidenceBand"),
        "stage": d.get("resultStage"), "mayFinalize": d.get("mayFinalize"),
        "requiresHumanReview": d.get("requiresHumanReview"),
        "family": g.get("hazardCategory") or d.get("hazardCategory"),
    }

if __name__ == "__main__":
    cases = json.load(open(sys.argv[1]))
    out = []
    for c in cases:
        d = run(c.get("context", "osha-general-industry"), c["text"])
        b = brief(d)
        out.append({"id": c["id"], "text": c["text"], "context": c.get("context", "osha-general-industry"), "out": b})
        print(f"{c['id']:<10} risk={b.get('risk')!r:<14} haz={[(x[0],x[1]) for x in b.get('hazards',[])]} "
              f"dec={b.get('decisions')} q={len(b.get('questions',[]))}", flush=True)
    json.dump(out, open(sys.argv[2], "w"), indent=1)
