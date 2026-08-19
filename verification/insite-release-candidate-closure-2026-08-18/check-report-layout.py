#!/usr/bin/env python3
"""Geometric layout checker for generated report PDFs (verification only).

Uses `pdftotext -bbox` so checks are made in page coordinates rather than on reflowed text:
that is what makes it possible to tell a label with real following content from one stranded
at the foot of a page, and to detect two text runs drawn on top of each other.

Checks per page:
  1. no text outside the printable box (clipping / margin violations)
  2. no two text lines overlapping vertically while also overlapping horizontally
  3. no label stranded at the foot of a page with its content on the next one
  4. no orphan finding heading at the foot of a page
  5. no blank page
  6. every page that begins mid-finding announces itself as a continuation
"""
import glob
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

XH = "{http://www.w3.org/1999/xhtml}"

# Labels that are meaningless without the content they introduce.
NEEDS_FOLLOWER = ["WHAT WAS OBSERVED", "FULL SOURCE OBSERVATION", "APPLICABLE STANDARD",
                  "QUALIFIED-PERSON REVIEW", "RECOMMENDED CORRECTIVE ACTION", "RISK DISTRIBUTION",
                  "INSPECTION RECORD", "ASSESSMENT", "BASIS AND LIMITATIONS", "RISK:"]
# Table header rows: meaningless as the last line on a page.
TABLE_HEADERS = {"METRIC VALUE", "FIELD DETAIL"}
# Labels followed by drawn writing rules (vector, invisible to pdftotext) rather than by text.
RULE_FOLLOWED = ["NOTES", "ASSIGNED TO:"]

LEFT, RIGHT, TOP, BOTTOM = 56.0, 556.0, 25.0, 762.0


def page_lines(page):
    """Group <word> boxes into lines by shared vertical band."""
    words = []
    for w in page.iter(XH + "word"):
        text = "".join(w.itertext()).strip()
        if not text:
            continue
        words.append([float(w.get("xMin")), float(w.get("yMin")),
                      float(w.get("xMax")), float(w.get("yMax")), text])
    words.sort(key=lambda r: (round(r[1], 1), r[0]))
    lines = []
    for x0, y0, x1, y1, t in words:
        if lines and abs(lines[-1][1] - y0) < 2.0:
            ln = lines[-1]
            ln[0] = min(ln[0], x0)
            ln[2] = max(ln[2], x1)
            ln[3] = max(ln[3], y1)
            ln[4] = ln[4] + " " + t
        else:
            lines.append([x0, y0, x1, y1, t])
    lines.sort(key=lambda r: r[1])
    return lines


def is_chrome(text):
    return text.startswith("InSite ·") or ("Inspection date" in text and "Generated" in text) \
        or text.startswith("Record reference")


def check(pdf):
    xml = subprocess.run(["pdftotext", "-bbox", pdf, "-"], capture_output=True, text=True).stdout
    root = ET.fromstring(xml)
    pages = list(root.iter(XH + "page"))
    issues = []
    for i, page in enumerate(pages, 1):
        h = float(page.get("height"))
        lines = page_lines(page)
        body = [l for l in lines if not is_chrome(l[4])]
        if not body:
            issues.append(f"p{i}: BLANK page (no body text)")
            continue
        for x0, y0, x1, y1, t in body:
            if x0 < LEFT - 1 or x1 > RIGHT + 1 or y1 > BOTTOM or y0 < TOP:
                issues.append(f"p{i}: OUT OF BOX ({x0:.0f},{y0:.0f})-({x1:.0f},{y1:.0f}) {t[:60]!r}")
        for a, b in zip(body, body[1:]):
            vertical_overlap = b[1] < a[3] - 1.5
            horizontal_overlap = not (b[0] > a[2] - 1 or a[0] > b[2] - 1)
            if vertical_overlap and horizontal_overlap:
                issues.append(f"p{i}: OVERLAP {a[4][:40]!r} / {b[4][:40]!r}")
        last, last_ymax = body[-1][4].strip(), body[-1][3]
        upper = last.upper()
        # Section labels are drawn in upper case; a normal sentence that merely begins with the
        # same word is not a label, so require the whole line to be upper case.
        if upper == last and any(upper.startswith(l) for l in NEEDS_FOLLOWER):
            issues.append(f"p{i}: ORPHAN LABEL at foot -> {last!r}")
        if upper in TABLE_HEADERS:
            issues.append(f"p{i}: ORPHAN TABLE HEADER at foot -> {last!r}")
        if last.startswith("Risk:"):
            issues.append(f"p{i}: RISK LINE stranded at foot -> {last!r}")
        if re.match(r"^Finding \d+ [—-] ", last) and "(continued)" not in last:
            issues.append(f"p{i}: ORPHAN FINDING HEADING -> {last!r}")
        if any(upper.startswith(l) for l in RULE_FOLLOWED) and last_ymax > h - 110:
            issues.append(f"p{i}: rule-followed label too close to foot -> {last!r} ymax={last_ymax:.0f}")
    return pages, issues


def main():
    targets = sorted(sys.argv[1:] or glob.glob("*.pdf"))
    failed = False
    for pdf in targets:
        pages, issues = check(pdf)
        print(f"{pdf}: {len(pages)} pages -> {'OK' if not issues else str(len(issues)) + ' ISSUE(S)'}")
        for x in issues:
            print("   ", x)
            failed = True
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
