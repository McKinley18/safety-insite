#!/usr/bin/env python3
"""HazLenz capability harness (sections B3, B4, B5, B7, B10).

Every case runs against the REAL /safescope-v2/classify endpoint on :4010 with a REAL persisted
inspection whose regulatoryContext is the case's context, so what is measured is the production
inheritance path, not a unit shortcut. Raw responses are written out so every score can be
re-derived from evidence.
"""
import json, os, sys, time
import hz
import scenarios

OUT = os.path.join(hz.SP, sys.argv[1] if len(sys.argv) > 1 else "capability-out")
os.makedirs(OUT, exist_ok=True)
PACE = 2.3

INSPECTIONS = {}


def inspection_for(context):
    if context not in INSPECTIONS:
        body = {"siteId": hz.first_site(), "title": f"Capability harness {context}"}
        if context != "unknown":
            body["regulatoryContext"] = context
        data = hz.call("POST", "/inspections", body)
        assert data.get("regulatoryContext") == context, data
        INSPECTIONS[context] = data["id"]
    return INSPECTIONS[context]


def run(context, text):
    inspection = inspection_for(context)
    data = hz.classify(inspection, text, "unknown")
    tries = 0
    while data.get("__error__") == 429 and tries < 6:
        time.sleep(31)
        tries += 1
        data = hz.classify(inspection, text, "unknown")
    time.sleep(PACE)
    return data


# --------------------------------------------------------------------------------------------
# Feature extraction: only customer-facing / decision-bearing fields are read.
# --------------------------------------------------------------------------------------------
SAFE_STATES = {"SAFE_VERIFIED", "CONTROLLED", "CONTROL_VERIFIED", "HISTORICAL", "RESOLVED"}
UNSAFE_STATES = {"ACTIVE_UNCONTROLLED", "UNSAFE", "ACTIVE", "UNCONTROLLED", "DEFICIENT"}


def features(d):
    if "__error__" in d:
        return {"error": d}
    guided = d.get("guidedFinding") or {}
    decomposition = (d.get("multiHazardDecomposition") or {}).get("hazards") or []
    decisions = d.get("applicabilityDecisions") or []
    questions = d.get("clarificationQuestions") or []
    primary = guided.get("primaryStandard") or {}
    risk = guided.get("riskAssessment") or {}
    rc = d.get("regulatoryContext") or {}
    return {
        "classification": d.get("classification"),
        "hazardCategory": guided.get("hazardCategory") or d.get("hazardCategory"),
        "conditionState": d.get("conditionState"),
        "guidedConditionState": guided.get("conditionState"),
        "confidence": d.get("confidence"),
        "confidenceBand": d.get("confidenceBand"),
        "resultStage": d.get("resultStage"),
        "mayFinalize": d.get("mayFinalize"),
        "requiresHumanReview": d.get("requiresHumanReview"),
        "isVague": d.get("isVague"),
        "regulatoryContext": {k: rc.get(k) for k in ("value", "provenance", "source")},
        "hazards": [{
            "domainId": h.get("domainId"), "family": h.get("hazardFamily"),
            "state": h.get("conditionState"),
            "fragment": (h.get("observationFragment") or "")[:120],
            "citations": [(c.get("citation"), c.get("applicability")) for c in (h.get("standardCandidates") or [])],
        } for h in decomposition],
        "decisions": [{"citation": x.get("citation"), "status": x.get("status"),
                       "confidence": x.get("confidence"),
                       "provenance": x.get("jurisdictionProvenance")} for x in decisions],
        "primaryStandard": {"citation": primary.get("citation"), "applicability": primary.get("applicability"),
                            "confidenceLabel": primary.get("confidenceLabel"), "title": primary.get("title")},
        "risk": {"overall": risk.get("overallRisk"), "provisional": risk.get("provisional"),
                 "rationale": risk.get("rationale")},
        "correctiveAction": guided.get("correctiveAction") or {},
        "questions": [{"id": q.get("id"), "q": q.get("question"), "requiredFor": q.get("requiredFor"),
                       "priority": q.get("priority"), "blocksFinalization": q.get("blocksFinalization"),
                       "safetyDecisive": q.get("safetyDecisive")} for q in questions],
        "narrative": (d.get("narrative") or {}).get("findingSummary"),
        "explanation": d.get("explanation"),
        "evidenceGapQuestions": d.get("evidenceGapQuestions") or [],
        "observedCondition": guided.get("observedCondition"),
    }


def supported_citations(f):
    return [x["citation"] for x in f["decisions"] if x["status"] == "SUPPORTED"]


def is_safe_state(f):
    states = {str(f.get("conditionState") or ""), str(f.get("guidedConditionState") or "")}
    states |= {str(h.get("state") or "") for h in f["hazards"]}
    return bool(states & SAFE_STATES) and not (states & UNSAFE_STATES)


def main():
    results = {"B3": [], "B4": [], "B5": [], "B7": [], "B10": []}

    for case in scenarios.B3:
        f = features(run(case["context"], case["text"]))
        results["B3"].append({"id": case["id"], "context": case["context"], "text": case["text"],
                              "expect": case["expect"], "features": f})
        print("B3", case["id"], f.get("hazardCategory"), f.get("conditionState"),
              supported_citations(f), len(f.get("questions", [])), flush=True)

    for case in scenarios.B4:
        hz_f = features(run(case["context"], case["hazard"]))
        ct_f = features(run(case["context"], case["control"]))
        results["B4"].append({"id": case["id"], "context": case["context"],
                              "hazardText": case["hazard"], "controlText": case["control"],
                              "hazardFeatures": hz_f, "controlFeatures": ct_f})
        print("B4", case["id"], "| hazard:", hz_f.get("conditionState"), supported_citations(hz_f),
              "| control:", ct_f.get("conditionState"), supported_citations(ct_f), flush=True)

    for case in scenarios.B5:
        f = features(run(case["context"], case["text"]))
        results["B5"].append({"id": case["id"], "context": case["context"], "text": case["text"],
                              "expect": case["expect"], "features": f})
        print("B5", case["id"], len(f.get("hazards", [])), "hazards", flush=True)

    for case in scenarios.B7:
        f = features(run(case["context"], case["text"]))
        results["B7"].append({"id": case["id"], "context": case["context"], "text": case["text"],
                              "expect": case["expect"], "features": f})
        print("B7", case["id"], f.get("resultStage"), f.get("mayFinalize"),
              len(f.get("questions", [])), flush=True)

    for cid, context, text in scenarios.B10:
        f = features(run(context, text))
        results["B10"].append({"id": cid, "context": context, "text": text, "features": f})
        print("B10", cid, f.get("hazardCategory"), supported_citations(f), flush=True)

    json.dump(results, open(os.path.join(OUT, "capability-results.json"), "w"), indent=1)
    print("wrote", os.path.join(OUT, "capability-results.json"))


if __name__ == "__main__":
    main()
