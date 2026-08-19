#!/usr/bin/env python3
"""Generate reports through the REAL product path (POST /inspections/:id/reports) and download
the resulting PDF bytes from the real storage/download endpoint."""
import json, os, sys, urllib.request
import hz

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(hz.SP, "reports")
os.makedirs(OUT, exist_ok=True)

TARGETS = json.load(open(os.path.join(hz.SP, "report-targets.json")))

for name, inspection_id in TARGETS.items():
    meta = hz.call("POST", f"/inspections/{inspection_id}/reports")
    if "__error__" in meta:
        print(f"{name}: GENERATE FAILED {meta}")
        continue
    req = urllib.request.Request(
        f"{hz.BASE}/inspection-reports/{meta['reportId']}/versions/{meta['version']}/download",
        headers={"Authorization": f"Bearer {open(os.path.join(hz.SP, 'token.txt')).read().strip()}"})
    with urllib.request.urlopen(req) as r:
        body = r.read()
    path = os.path.join(OUT, f"{name}.pdf")
    open(path, "wb").write(body)
    print(f"{name}: v{meta['version']} status={meta['status']} sha={(meta.get('checksum') or '')[:12]} "
          f"bytes={len(body)} -> {path}")
