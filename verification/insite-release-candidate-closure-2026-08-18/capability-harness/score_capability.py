#!/usr/bin/env python3
"""Scores the capability harness output per dimension. Every score is derived from the raw
recorded response; nothing is collapsed into a single headline number."""
import json, os, re, sys
import hz

RES = json.load(open(os.path.join(hz.SP, "capability-out", "capability-results.json")))

# The decomposition's own conditionState vocabulary (multi-hazard-decomposition.service.ts):
# ACTIVE | HISTORICAL | PLANNED_FUTURE | SAFE_VERIFIED | UNKNOWN.
SAFE_STATES = {"SAFE_VERIFIED", "HISTORICAL", "PLANNED_FUTURE"}
UNSAFE_STATES = {"ACTIVE"}

failures = []


def note(dim, case_id, message, detail=None):
    failures.append({"dimension": dim, "case": case_id, "failure": message, "detail": detail})


def supported(f):
    return [d["citation"] for d in f.get("decisions", []) if d.get("status") == "SUPPORTED"]


def states(f):
    s = {str(f.get("conditionState") or ""), str(f.get("guidedConditionState") or "")}
    s |= {str(h.get("state") or "") for h in f.get("hazards", [])}
    return {x for x in s if x}


def regimes(f):
    cites = [d["citation"] for d in f.get("decisions", [])] + \
            [c for h in f.get("hazards", []) for c, _ in h.get("citations", [])]
    if f.get("primaryStandard", {}).get("citation"):
        cites.append(f["primaryStandard"]["citation"])
    out = set()
    for c in cites:
        c = str(c)
        if "1910." in c:
            out.add("1910")
        elif "1926." in c:
            out.add("1926")
        elif re.search(r"\b(30 CFR|5[67]\.)", c):
            out.add("30CFR")
    return out


CONTEXT_REGIME = {"osha-general-industry": "1910", "osha-construction": "1926", "msha": "30CFR"}

scores = {}


def rate(dim, passed, total, detail=""):
    scores[dim] = {"passed": passed, "total": total,
                   "rate": round(passed / total, 3) if total else None, "note": detail}


# ---------------------------------------------------------------- HAZARD_IDENTIFICATION
def hazard_identified(f):
    return bool(f.get("hazardCategory")) or bool(f.get("hazards"))


cases = RES["B3"] + RES["B5"] + [{"id": c["id"], "features": c["features"], "expect": {}} for c in RES["B7"]] \
        + [{"id": c["id"], "features": c["features"], "expect": {}} for c in RES["B10"]]
passed = 0
for c in cases:
    if hazard_identified(c["features"]):
        passed += 1
    else:
        note("HAZARD_IDENTIFICATION", c["id"], "no hazard family produced")
rate("HAZARD_IDENTIFICATION", passed, len(cases))

# ---------------------------------------------------------------- MULTI_HAZARD_SEPARATION
multi = [c for c in RES["B3"] + RES["B5"] if c["expect"].get("min_hazards")]
passed = 0
for c in multi:
    want = c["expect"]["min_hazards"]
    hazards = c["features"].get("hazards", [])
    distinct = {str(h.get("domainId") or h.get("family") or "") for h in hazards}
    if len(distinct) >= want:
        passed += 1
    else:
        note("MULTI_HAZARD_SEPARATION", c["id"],
             f"expected >= {want} distinct hazard domains, got {len(distinct)}", sorted(distinct))
rate("MULTI_HAZARD_SEPARATION", passed, len(multi))

# duplicate / fragment-level over-splitting, reported separately (not folded into the rate above)
oversplit = []
for c in RES["B3"] + RES["B5"] + RES["B10"]:
    hazards = c["features"].get("hazards", [])
    seen = {}
    for h in hazards:
        seen.setdefault(str(h.get("domainId")), []).append((h.get("observationFragment") or h.get("fragment") or "")[:60])
    dups = {k: v for k, v in seen.items() if len(v) > 1}
    if dups:
        oversplit.append({"case": c["id"], "duplicated_domains": dups})

# ---------------------------------------------------------------- CONTROL_STATE
control_cases = []
for c in RES["B3"]:
    if c["expect"].get("controlled"):
        control_cases.append((c["id"], c["features"], "controlled"))
    elif c["expect"].get("unsafe"):
        control_cases.append((c["id"], c["features"], "unsafe"))
for pair in RES["B4"]:
    control_cases.append((pair["id"] + "-hazard", pair["hazardFeatures"], "unsafe"))
    control_cases.append((pair["id"] + "-control", pair["controlFeatures"], "controlled"))
passed = 0
for cid, f, want in control_cases:
    st = states(f)
    # "Controlled" is expressed by HazLenz in three interchangeable ways: the hazard is
    # suppressed entirely (no domain survives), its conditionState is a non-ACTIVE state, or the
    # risk band itself is "Controlled". Any of them counts, but a SUPPORTED citation never does.
    band = f.get("risk", {}).get("overall")
    if want == "controlled":
        expressed = (not f.get("hazards")) or (bool(st & SAFE_STATES) and not (st & UNSAFE_STATES)) \
            or band == "Controlled"
        ok = expressed and not supported(f)
    else:
        ok = (bool(st & UNSAFE_STATES) or bool(supported(f)) or bool(f.get("hazards"))
              or bool(f.get("primaryStandard", {}).get("citation"))) and band != "Controlled"
    if ok:
        passed += 1
    else:
        note("CONTROL_STATE", cid, f"expected {want}", {"states": sorted(st), "supported": supported(f)})
rate("CONTROL_STATE", passed, len(control_cases))

# ---------------------------------------------------------------- ADVERSARIAL_SEPARATION (B4)
passed = 0
for pair in RES["B4"]:
    h, ct = pair["hazardFeatures"], pair["controlFeatures"]
    changed = (supported(h) != supported(ct)) or (states(h) != states(ct)) or \
              (h.get("risk", {}).get("overall") != ct.get("risk", {}).get("overall")) or \
              (h.get("primaryStandard", {}).get("applicability") != ct.get("primaryStandard", {}).get("applicability"))
    control_not_violation = not supported(ct)
    if changed and control_not_violation:
        passed += 1
    else:
        note("ADVERSARIAL_SEPARATION", pair["id"],
             "controlled variant did not materially differ" if not changed else
             "controlled variant still produced a SUPPORTED citation",
             {"hazard_supported": supported(h), "control_supported": supported(ct),
              "hazard_states": sorted(states(h)), "control_states": sorted(states(ct)),
              "hazard_risk": h.get("risk", {}).get("overall"), "control_risk": ct.get("risk", {}).get("overall")})
rate("ADVERSARIAL_SEPARATION", passed, len(RES["B4"]))

# ---------------------------------------------------------------- JURISDICTION
juris = []
for c in RES["B3"] + RES["B5"] + [{"id": x["id"], "context": x["context"], "features": x["features"], "expect": {}} for x in RES["B10"]]:
    juris.append((c["id"], c["context"], c["features"]))
passed = 0
for cid, ctx, f in juris:
    want = CONTEXT_REGIME.get(ctx)
    got = regimes(f)
    if want is None:
        ok = True  # unknown context: any regime must be labelled inferred, checked separately
        # A SUPPORTED citation under an unknown INSPECTION context is legitimate when the
        # observation itself established the agency (regulatoryContext carries a non-unknown
        # value with inference basis); it is only a violation of provenance when nothing did.
        rc = f.get("regulatoryContext") or {}
        established = str(rc.get("value") or "unknown") != "unknown"
        asserted = [] if established else supported(f)
        if asserted:
            ok = False
            note("JURISDICTION", cid,
                 "regime asserted as SUPPORTED under an unknown inspection context", asserted)
    else:
        ok = not (got - {want})
        if not ok:
            note("JURISDICTION", cid, f"cross-regime leakage: context {ctx} produced {sorted(got)}")
    passed += 1 if ok else 0
rate("JURISDICTION", passed, len(juris))

# ---------------------------------------------------------------- STANDARD_PRECISION / RECALL
# Precision: every SUPPORTED citation must belong to the inspection's own regime.
sup_total = sup_ok = 0
for c in RES["B3"] + RES["B5"] + [{"id": x["id"], "context": x["context"], "features": x["features"]} for x in RES["B10"]]:
    want = CONTEXT_REGIME.get(c["context"])
    for cite in supported(c["features"]):
        sup_total += 1
        cite_regime = "1910" if "1910." in cite else "1926" if "1926." in cite else "30CFR" if re.search(r"30 CFR|5[67]\.", cite) else None
        if want is None or cite_regime == want:
            sup_ok += 1
        else:
            note("STANDARD_PRECISION", c["id"], f"SUPPORTED {cite} outside context {c['context']}")
rate("STANDARD_PRECISION", sup_ok, sup_total, "regime-correctness of every SUPPORTED citation")

# Recall proxy: clearly-unsafe scenarios in a KNOWN regime that produced no citation at all.
recall_cases = [c for c in RES["B3"] if c["expect"].get("unsafe") and c["context"] != "unknown"]
recall_cases += [{"id": x[0], "context": x[1], "features": None} for x in []]
for x in RES["B10"]:
    if x["id"] not in ("B10-15", "B10-30"):  # the two deliberately-safe scenarios
        recall_cases.append({"id": x["id"], "context": x["context"], "features": x["features"], "expect": {}})
passed = 0
for c in recall_cases:
    f = c["features"]
    any_citation = bool(supported(f)) or bool(f.get("primaryStandard", {}).get("citation")) or \
        any(h.get("citations") for h in f.get("hazards", []))
    if any_citation:
        passed += 1
    else:
        note("STANDARD_RECALL", c["id"], "unsafe scenario produced no candidate standard at all")
rate("STANDARD_RECALL", passed, len(recall_cases), "any candidate standard surfaced for an unsafe scenario")

# ---------------------------------------------------------------- RISK_COHERENCE
risk_cases = []
for c in RES["B3"] + RES["B5"]:
    risk_cases.append((c["id"], c["features"], c["expect"]))
passed = 0
for cid, f, expect in risk_cases:
    band = f.get("risk", {}).get("overall")
    if expect.get("controlled"):
        ok = band in (None, "Not established", "Low", "Moderate", "Controlled")
    elif expect.get("risk_at_least") == "High":
        ok = band in ("High", "Critical")
    else:
        ok = band not in (None, "")
    if ok:
        passed += 1
    else:
        note("RISK_COHERENCE", cid, f"risk band {band!r} incoherent with scenario", expect)
rate("RISK_COHERENCE", passed, len(risk_cases))

# ---------------------------------------------------------------- CLARIFICATION_QUALITY
clar = []
for c in RES["B3"] + RES["B7"]:
    clar.append((c["id"], c["features"], c["expect"]))
passed = 0
for cid, f, expect in clar:
    n = len(f.get("questions", []))
    if expect.get("should_ask") or expect.get("kind") in ("DECISION_CRITICAL_QUESTION", "UNKNOWN"):
        ok = n > 0 or f.get("isVague") or not f.get("mayFinalize")
    elif expect.get("questions_not_blocking") or expect.get("kind") == "ENOUGH_EVIDENCE":
        ok = True  # measured by no-unnecessary-interrogation below
    else:
        ok = True
    # no unnecessary interrogation: a well-evidenced scenario should not fire many questions
    if n > 4:
        ok = False
        note("CLARIFICATION_QUALITY", cid, f"{n} clarification questions is interrogation, not clarification")
    if ok:
        passed += 1
    elif expect.get("should_ask"):
        note("CLARIFICATION_QUALITY", cid, "incomplete observation asked nothing and did not flag vagueness")
rate("CLARIFICATION_QUALITY", passed, len(clar))

# ---------------------------------------------------------------- UNCERTAINTY (B7)
passed = 0
for c in RES["B7"]:
    f, kind = c["features"], c["expect"]["kind"]
    if kind == "ENOUGH_EVIDENCE":
        ok = bool(f.get("hazards")) or bool(f.get("primaryStandard", {}).get("citation"))
    elif kind == "DECISION_CRITICAL_QUESTION":
        ok = bool(f.get("questions")) or not f.get("mayFinalize")
    elif kind == "UNKNOWN":
        ok = bool(f.get("isVague")) or not f.get("mayFinalize")
    elif kind == "SAFE_OR_CONTROLLED":
        ok = not supported(f)
    else:
        ok = True
    if c["expect"].get("must_not_be_empty"):
        ok = ok and (bool(f.get("hazards")) or bool(f.get("primaryStandard", {}).get("citation")))
    if ok:
        passed += 1
    else:
        note("UNCERTAINTY", c["id"], f"expected {kind}",
             {"stage": f.get("resultStage"), "mayFinalize": f.get("mayFinalize"),
              "questions": len(f.get("questions", [])), "isVague": f.get("isVague")})
rate("UNCERTAINTY", passed, len(RES["B7"]))

# ---------------------------------------------------------------- NO_UNSUPPORTED_PROMOTION
promo = RES["B3"] + RES["B5"] + [{"id": x["id"], "features": x["features"], "expect": {}} for x in RES["B7"] + RES["B10"]]
passed = 0
for c in promo:
    f = c["features"]
    ok = not (f.get("mayFinalize") and f.get("resultStage") == "final" and not f.get("hazards"))
    if supported(f) and f.get("confidenceBand") == "low" and not f.get("requiresHumanReview"):
        ok = False
        note("NO_UNSUPPORTED_PROMOTION", c["id"], "SUPPORTED citation at low confidence with no human-review flag")
    passed += 1 if ok else 0
rate("NO_UNSUPPORTED_PROMOTION", passed, len(promo))

# ---------------------------------------------------------------- CORRECTIVE_ACTION_RELEVANCE
GENERIC = re.compile(r"immediate hazard control required to prevent contact/exposure to|"
                     r"address systemic factors to prevent recurrence|"
                     r"confirm the hazard control effectively removes the exposure", re.I)
ca_cases = RES["B3"] + RES["B5"] + [{"id": x["id"], "features": x["features"]} for x in RES["B10"]]
specific = generic = none = 0
for c in ca_cases:
    ca = c["features"].get("correctiveAction") or {}
    text = " ".join(str(ca.get(k) or "") for k in ("immediateAction", "permanentCorrection", "verificationStep")).strip()
    if not text:
        none += 1
        note("CORRECTIVE_ACTION_RELEVANCE", c["id"], "no corrective action produced")
    elif GENERIC.search(text):
        generic += 1
        note("CORRECTIVE_ACTION_RELEVANCE", c["id"], "corrective action is the generic template", text[:120])
    else:
        specific += 1
rate("CORRECTIVE_ACTION_RELEVANCE", specific, len(ca_cases),
     f"hazard-specific={specific} generic-template={generic} none={none}")

# ---------------------------------------------------------------- EXPLANATION_QUALITY
FILLER = re.compile(r"matched weighted .* signals|standard matched using hazard classification, "
                    r"operational context, exposure pathways, and contextual risk indicators", re.I)
exp_cases = RES["B3"] + RES["B5"] + [{"id": x["id"], "features": x["features"]} for x in RES["B10"]]
passed = 0
for c in exp_cases:
    f = c["features"]
    narrative = str(f.get("narrative") or "")
    observed = str(f.get("observedCondition") or "")
    # A usable rationale must restate the observed condition and say something specific about it.
    ok = len(narrative) > 40 and not FILLER.search(narrative) and bool(observed)
    if ok:
        passed += 1
    else:
        note("EXPLANATION_QUALITY", c["id"], "explanation is filler or missing", narrative[:140])
rate("EXPLANATION_QUALITY", passed, len(exp_cases))

# ---------------------------------------------------------------- OVERALL_CONTEXTUAL_COHERENCE
# A case is coherent when hazard, control state, standard regime, risk and action agree.
coh_cases = RES["B3"] + RES["B5"]
passed = 0
for c in coh_cases:
    f, expect = c["features"], c["expect"]
    problems = [x for x in failures if x["case"] == c["id"]]
    if not problems:
        passed += 1
rate("OVERALL_CONTEXTUAL_COHERENCE", passed, len(coh_cases),
     "case has zero failures across all other dimensions")

out = {"scores": scores, "failures": failures, "oversplit_observations": oversplit}
path = os.path.join(hz.SP, "capability-out", "capability-scores.json")
json.dump(out, open(path, "w"), indent=1)

print(f"{'DIMENSION':<34} {'PASS':>6} {'TOTAL':>6}  RATE")
for k, v in scores.items():
    print(f"{k:<34} {v['passed']:>6} {v['total']:>6}  {v['rate']}  {v['note']}")
print(f"\n{len(failures)} individual failures; {len(oversplit)} observations with duplicated hazard domains")
print("wrote", path)
