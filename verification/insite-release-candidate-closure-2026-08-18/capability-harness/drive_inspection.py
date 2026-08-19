#!/usr/bin/env python3
"""Drive a complete inspection through the REAL product API, mirroring the inspection-workspace
flow exactly: create inspection -> observation -> classify -> save analysis snapshot ->
per-finding human review -> finalize finding -> corrective action + task per finding ->
transition to completed -> generate report.

Used to produce report fixtures (including a deliberately long multi-finding inspection) whose
data came from the production HazLenz path rather than from a hand-written snapshot.
"""
import json, os, sys, time, uuid
import hz


def finding_scoped_action(finding):
    """Mirror of the workspace's findingScopedActionDraft(): the finding's OWN HazLenz
    corrective-action intelligence, computed by the backend from that finding's evidence."""
    intelligence = ((finding.get("riskSnapshot") or {}).get("correctiveActionIntelligence") or {})
    if not isinstance(intelligence, dict):
        return None

    def first(key):
        items = intelligence.get(key)
        item = items[0] if isinstance(items, list) and items else None
        if not isinstance(item, dict):
            return ""
        return str(item.get("rationale") or item.get("description") or item.get("title") or "").strip()

    draft = {
        "immediateAction": first("immediateActions"),
        "permanentCorrection": first("preventionActions") or first("permanentActions"),
        "verificationStep": first("verificationActions"),
    }
    return draft if any(draft.values()) else None


# Mirror of the workspace's safeActionDraftForFinding() family mapping, so the generated report
# carries the SAME corrective-action text the product's own UI writes.
FAMILY_ACTIONS = [
    (("electrical", "electric"), {
        "immediateAction": "Place the affected electrical equipment in a safe state and restrict access pending qualified electrical verification.",
        "permanentCorrection": "Repair or replace the electrical component with appropriately rated equipment and verify the installation.",
        "verificationStep": "Have a qualified person document the electrical inspection before returning the equipment to service."}),
    (("fall",), {
        "immediateAction": "Restrict access to the elevated exposure and stop the task until compliant fall protection is verified.",
        "permanentCorrection": "Provide and maintain a compliant guardrail, personal fall-arrest system, or other approved fall control for the work area.",
        "verificationStep": "Verify the fall-control system and access route before resuming work."}),
    (("loto", "lockout", "tagout", "energy"), {
        "immediateAction": "Stop servicing and control hazardous energy before anyone enters the danger zone.",
        "permanentCorrection": "Implement the applicable energy-control procedure with isolation, lockout, release of stored energy, and verification.",
        "verificationStep": "Document zero-energy verification before returning the equipment to service."}),
    (("guard",), {
        "immediateAction": "Keep the equipment out of service and restrict access to the point of operation.",
        "permanentCorrection": "Install or restore guarding that prevents access to the moving hazard during operation and foreseeable tasks.",
        "verificationStep": "Test the guard and document that access to the moving hazard is prevented."}),
    (("hot_work",), {
        "immediateAction": "Pause hot work until fire-prevention controls, combustible separation, and fire watch are verified.",
        "permanentCorrection": "Implement the applicable hot-work permit, fire prevention, and post-work monitoring controls.",
        "verificationStep": "Verify hot-work controls and fire-watch records before resuming the operation."}),
    (("gas",), {
        "immediateAction": "Secure the work area and verify cylinder condition and handling controls before continuing; do not assume a leak.",
        "permanentCorrection": "Provide compliant cylinder securing, separation, valve protection, and storage/handling controls for the observed equipment.",
        "verificationStep": "Have a competent person verify cylinder condition and controls before use."}),
]


def safe_action_for_finding(finding, fallback):
    family = f"{finding.get('hazardCategory') or ''} {finding.get('hazardKey') or ''}".lower()
    for needles, draft in FAMILY_ACTIONS:
        if any(n in family for n in needles):
            return draft
    return finding_scoped_action(finding) or fallback


def classify(inspection_id, text):
    body = {
        "text": text,
        "scopes": ["all"],
        "inspectionId": inspection_id,
        "structuredObservation": {
            "narrative": text, "jurisdiction": "unknown", "evidenceSource": ["worker-report"],
            "controlsPresent": [], "controlsMissing": [], "unknownFacts": [],
            "unresolvedContradictions": [], "userConfirmedFacts": [],
        },
    }
    result = hz.call("POST", "/safescope-v2/classify", body)
    tries = 0
    while result.get("__error__") == 429 and tries < 5:
        time.sleep(31)
        tries += 1
        result = hz.call("POST", "/safescope-v2/classify", body)
    return result


def run(context, title, observations, out_name):
    site = hz.first_site()
    body = {"siteId": site, "title": title}
    if context != "unknown":
        body["regulatoryContext"] = context
    inspection = hz.call("POST", "/inspections", body)
    assert "id" in inspection, inspection
    inspection_id = inspection["id"]
    print(f"inspection {inspection_id} ctx={inspection.get('regulatoryContext')}")

    risk_policy = None
    action_drafts = {}
    version = 1

    for index, text in enumerate(observations):
        observation = hz.call("POST", f"/inspections/{inspection_id}/observations", {"rawText": text})
        assert "id" in observation, observation
        result = classify(inspection_id, text)
        assert "__error__" not in result, result
        analysis = hz.call("POST", f"/inspections/observations/{observation['id']}/analyses", {
            "engineVersion": "hazlenz-production",
            "resultSnapshot": result,
            "idempotencyKey": str(uuid.uuid4()),
            "requestVersion": index + 1,
        })
        assert "id" in analysis, analysis

        guided = result.get("guidedFinding") or {}
        corrective = guided.get("correctiveAction") or {}
        state = hz.call("GET", f"/inspections/{inspection_id}")
        pending = [f for f in state.get("findings", [])
                   if f["observationId"] == observation["id"] and f["status"] != "superseded"
                   and not f.get("finalReviewId")]
        print(f"  observation {index + 1}: {len(pending)} finding(s)")
        for finding in pending:
            source = dict(finding.get("sourceCandidate") or {})
            source.update({
                "hazardKey": finding["hazardKey"],
                "citation": str((finding.get("sourceCandidate") or {}).get("citation") or ""),
                "family": finding.get("hazardCategory") or finding["hazardKey"],
                "conclusion": finding.get("conclusion"),
                "applicability": "candidate",
                "evidenceFactIds": [],
                "stableKey": finding["hazardKey"],
            })
            review = hz.call("POST", f"/inspections/observations/{observation['id']}/reviews", {
                "findingId": finding["id"],
                "idempotencyKey": f"review:{analysis['id']}:{finding['hazardKey']}",
                "analysisId": analysis["id"],
                "decision": "accepted",
                "rationale": "Reviewed against the observed facts; accepted as an advisory conclusion.",
                "reviewedConclusion": {"guidedFinding": guided},
            })
            assert "id" in review, review
            risk_policy = (review.get("reviewedConclusion") or {}).get("riskPolicy") or risk_policy
            finalized = hz.call("POST", f"/inspections/observations/{observation['id']}/findings", {
                "reviewId": review["id"],
                "hazardCategory": source["family"],
                "conclusion": source.get("conclusion") or text,
                "segmentKey": finding["hazardKey"],
                "sourceCandidate": source,
                "reviewerDisposition": "single",
            })
            assert "id" in finalized, finalized
            action_drafts[finalized["id"]] = corrective

        state = hz.call("GET", f"/inspections/{inspection_id}")
        version = state["version"]
        if state["status"] == "draft":
            state = hz.call("POST", f"/inspections/{inspection_id}/transition", {"status": "in_review", "version": version})
            version = state["version"]

    state = hz.call("GET", f"/inspections/{inspection_id}")
    finding_ids = [f["id"] for f in state.get("findings", []) if f["status"] != "superseded"]
    priority = (risk_policy or {}).get("priority", "medium")
    due_days = (risk_policy or {}).get("dueDays", 30)
    due = time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime(time.time() + due_days * 86400))
    findings_by_id = {f["id"]: f for f in state.get("findings", []) if f["status"] != "superseded"}
    for index, finding_id in enumerate(finding_ids):
        shared = action_drafts.get(finding_id, {})
        draft = safe_action_for_finding(findings_by_id[finding_id], shared) if len(finding_ids) > 1 else shared
        action = hz.call("POST", "/actions", {
            "inspectionId": state["id"], "findingId": finding_id,
            "title": f"Verify and correct reviewed condition {index + 1}" if len(finding_ids) > 1
                     else "Verify and correct reviewed condition",
            "description": "\n".join([
                f"Immediate: {draft.get('immediateAction', 'Control the exposure.')}",
                f"Permanent: {draft.get('permanentCorrection', 'Address the systemic cause.')}",
                f"Verification: {draft.get('verificationStep', 'Confirm the control is effective.')}",
            ]),
            "priorityCode": priority,
        })
        hz.call("POST", "/tasks", {
            "inspectionId": state["id"],
            "correctiveActionId": action.get("id"),
            "title": f"Follow up reviewed finding {index + 1}",
            "description": draft.get("verificationStep", "Confirm corrective action completion."),
            "dueDate": due, "priority": priority,
        })

    state = hz.call("GET", f"/inspections/{inspection_id}")
    completed = hz.call("POST", f"/inspections/{inspection_id}/transition",
                        {"status": "completed", "version": state["version"]})
    assert completed.get("status") == "completed", completed
    meta = hz.call("POST", f"/inspections/{inspection_id}/reports")
    assert "reportId" in meta, meta
    import urllib.request
    req = urllib.request.Request(
        f"{hz.BASE}/inspection-reports/{meta['reportId']}/versions/{meta['version']}/download",
        headers={"Authorization": f"Bearer {open(os.path.join(hz.SP, 'token.txt')).read().strip()}"})
    with urllib.request.urlopen(req) as r:
        pdf = r.read()
    out_dir = os.path.join(hz.SP, "reports")
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, f"{out_name}.pdf")
    open(path, "wb").write(pdf)
    print(f"  -> {path} ({len(pdf)} bytes, {len(finding_ids)} findings, sha={meta.get('checksum', '')[:12]})")
    return inspection_id


if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    run(spec["context"], spec["title"], spec["observations"], spec["out"])
