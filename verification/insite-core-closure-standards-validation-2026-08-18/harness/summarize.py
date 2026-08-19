#!/usr/bin/env python3
"""Turn harness results into the markdown evidence tables + autonomy metrics for the FINAL_REPORT."""
import json, os, sys, collections
SP = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def load(name):
    return json.load(open(os.path.join(SP, name, "results.json")))

def short(c):
    return c.replace("29 CFR ", "").replace("30 CFR ", "")

# ---- Question classification (Section H): decided per question id pattern + context, applied uniformly.
# DECISION_CRITICAL: answer can change whether a hazard exists, hazard identity, jurisdiction/regime, or WHICH standard.
# CONFIDENCE_IMPROVING: hazard and candidate standard already identified; answer upgrades candidate -> confirmed or refines risk.
# NONESSENTIAL: analysis already usable/supported; answer changes nothing material.
# REDUNDANT: the fact asked for is already stated in the observation.
# REPEATED_CONTEXT: asks for inspection-level context (jurisdiction) that is already established.
def classify_question(q, r):
    qid = q.get("id") or ""
    text = (r.get("text") or "").lower()
    ctx_known = (r.get("regulatoryContext") or {}).get("provenance") in ("USER_CONFIRMED", "HAZLENZ_INFERRED")
    supported = any(d[1] == "SUPPORTED" for d in r.get("decisions", []))
    if qid == "jurisdiction" or "jurisdiction" in qid:
        return "REPEATED_CONTEXT" if ctx_known else "DECISION_CRITICAL"
    if qid == "evidence-sufficiency-insufficient":
        return "DECISION_CRITICAL"  # nothing identifiable yet; the answer decides whether a hazard exists at all
    if supported:
        return "NONESSENTIAL"  # a supported standard already exists for this observation
    if qid.startswith("predicate-"):
        # asks for a specific missing regulatory predicate on an already-identified candidate
        # -> if the fact is plainly in the text it is REDUNDANT, otherwise it upgrades candidate->confirmed
        if "energy" in qid and any(k in text for k in ("power connected", "energized", "still powered", "running", "not been isolated", "no lock")):
            return "REDUNDANT"
        if "guardrail" in qid and "no guardrail" in text:
            return "REDUNDANT"
        if "cave-in-exposure" in qid or "worker-exposure" in qid or "worker-on-platform" in qid or "protective-system" in qid or "hazardous-energy" in qid or "energy-not-isolated" in qid or "conductive" in qid or "permitted-task" in qid or "moving-or-accessible" in qid or "platform-more-than" in qid:
            return "DECISION_CRITICAL" if not r.get("hazards") or all(not h["cands"] or all(c[1] != "direct" for c in h["cands"]) for h in r.get("hazards", [])) and any(k in text for k in ("maintenance is being performed", "trench about", "open near")) else "CONFIDENCE_IMPROVING"
        return "CONFIDENCE_IMPROVING"
    if qid.startswith("existing-") or qid in ("electrical-damage-exposure", "chemical-substance", "chemical-exposure-path", "machine-energy-state", "machine-task", "machine-controls", "fall-surface-control"):
        # generic service-layer follow-ups: useful only when nothing has been established
        has_finding = bool(r.get("hazards"))
        if has_finding and any(k in text for k in ("exposed copper", "energized", "unguarded", "missing", "no label", "chained shut", "no trench box", "no lock")):
            return "NONESSENTIAL"
        return "CONFIDENCE_IMPROVING" if has_finding else "DECISION_CRITICAL"
    return "CONFIDENCE_IMPROVING"

def md_D(rows):
    lines = ["| Case | Context | HazLenz context (provenance) | Decisions | Finding-level candidates | Questions |", "|---|---|---|---|---|---|"]
    for r in rows:
        if "error" in r: lines.append(f"| {r['id']} | | ERROR {r['error'].get('__error__')} | | | |"); continue
        rc = r["regulatoryContext"]
        dec = ", ".join(f"{short(c[0])} {c[1]}" for c in r["decisions"]) or "—"
        haz = "; ".join(f"{h['domain']}: " + (", ".join(f"{short(c[0])} ({c[1]})" for c in h["cands"]) or "none") for h in r["hazards"]) or "no finding"
        qs = ", ".join(q["id"] for q in r["questions"]) or "none"
        lines.append(f"| {r['id']} | {r['context']} | {rc['value']} ({rc['provenance']}) | {dec} | {haz} | {qs} |")
    return "\n".join(lines)

def md_E(rows):
    lines = ["| Manual finding (as typed) | Context | HazLenz interpretation (finding) | Standard evaluation | Result |", "|---|---|---|---|---|"]
    for r in rows:
        if "error" in r: continue
        haz = "; ".join(f"{h['domain']} ({h['state']})" for h in r["hazards"]) or "no finding created"
        cands = "; ".join(", ".join(f"{short(c[0])} ({c[1]})" for c in h["cands"]) or "none" for h in r["hazards"]) or "—"
        dec = ", ".join(f"{short(c[0])} {c[1]}" for c in r["decisions"]) or "none"
        qs = ", ".join(q["id"] for q in r["questions"]) or "none"
        result = "SUPPORTED, no questions" if any(c[1] == "SUPPORTED" for c in r["decisions"]) and not r["questions"] else ("candidate + question(s): " + qs if r["decisions"] else ("insufficient evidence: " + qs if qs != "none" else "no standard"))
        lines.append(f"| {r['text']} | {r['context']} | {haz} | whole-obs: {dec}; finding-scoped: {cands} | {result} |")
    return "\n".join(lines)

def md_A(rows):
    lines = ["| Case | Context | Finding(s) | Standard | Questions (id → class, engine flag) | Verdict |", "|---|---|---|---|---|---|"]
    stats = collections.Counter(); per_class = collections.Counter(); blocking = 0; optional = 0
    clear_total = clear_ok = 0; amb_total = amb_ok = 0
    for r in rows:
        if "error" in r: continue
        rid = r["id"]; is_clear = rid.startswith("A-")
        haz = "; ".join(f"{h['domain']} ({h['state']})" for h in r["hazards"]) or "none"
        std = ", ".join(f"{short(c[0])} {c[1]}" for c in r["decisions"]) or "none"
        rawq = {q.get("id"): q for q in r.get("rawQuestions", [])}
        qparts = []
        for q in r["questions"]:
            cls = classify_question(q, r); per_class[cls] += 1; stats["questions"] += 1
            flag = rawq.get(q["id"], {}).get("blocksFinalization")
            if flag: blocking += 1
            else: optional += 1
            qparts.append(f"{q['id']} → {cls}{' [engine: blocksFinalization]' if flag else ''}")
        supported = any(c[1] == "SUPPORTED" for c in r["decisions"])
        if is_clear:
            clear_total += 1
            ok = supported and not r["questions"]
            clear_ok += ok
            verdict = "useful analysis, no clarification" if ok else ("supported but asked" if supported else "NOT resolved")
        else:
            amb_total += 1
            ok = bool(r["questions"]) and not supported
            amb_ok += ok
            verdict = "correctly asks / says insufficient" if ok else ("resolved without asking" if supported else "no question, no standard")
        stats["findings"] += len(r["hazards"])
        lines.append(f"| {rid} | {r['context']} | {haz} | {std} | {'<br>'.join(qparts) or 'none'} | {verdict} |")
    summary = {
        "observations": len([r for r in rows if "error" not in r]), "findings": stats["findings"], "questions_total": stats["questions"],
        "engine_flagged_blocking": blocking, "optional": optional, **{k: per_class[k] for k in ("DECISION_CRITICAL", "CONFIDENCE_IMPROVING", "NONESSENTIAL", "REDUNDANT", "REPEATED_CONTEXT")},
        "clear_total": clear_total, "clear_without_clarification": clear_ok, "clear_pct": round(100.0 * clear_ok / clear_total, 1) if clear_total else None,
        "ambiguous_total": amb_total, "ambiguous_correctly_asking": amb_ok,
    }
    return "\n".join(lines), summary

D = load("out-D"); E = load("out-E"); A = load("out-A")
open(os.path.join(OUT, "D_JURISDICTION_MATRIX.md"), "w").write("# D — Jurisdiction narrowing matrix (live endpoint, persisted inspection per context)\n\n" + md_D(D) + "\n")
open(os.path.join(OUT, "E_MANUAL_FINDINGS.md"), "w").write("# E — Manual / direct findings → HazLenz → standards (live endpoint)\n\n" + md_E(E) + "\n")
tbl, summary = md_A(A)
open(os.path.join(OUT, "F_AUTONOMY_AUDIT.md"), "w").write("# F–J — HazLenz autonomy / clarification audit (live endpoint)\n\n" + tbl + "\n\n## Burden metrics\n\n```json\n" + json.dumps(summary, indent=1) + "\n```\n")
json.dump({"D": D, "E": E, "A": A, "summary": summary}, open(os.path.join(OUT, "harness-results.json"), "w"), indent=1)
print(json.dumps(summary, indent=1))
