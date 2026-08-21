#!/usr/bin/env bash
# KG-3E Phase 7 -- reviewer approvals for release federal-core-2026-08-20.5.
#
# DISCIPLINE. There is deliberately no loop over a query result here. Every approval below is an
# explicit command naming its OWN citation, its OWN expected checksum, and its OWN evidence. A
# checksum that does not match the frozen record causes the command to refuse. Records that were
# reviewed and found wanting are listed at the bottom, unapproved, with the reason.
#
# Each record approved here passed the KG-3E clause verification in `clause-verification.json`
# (150/150) or, where marked CARRY-FORWARD, was verified clause-by-clause in KG-3D against the same
# authoritative sources and is checksum-identical to the version KG-3D approved.
#
# Authority for every OSHA/MSHA claim: eCFR, title 29 and title 30, up-to-date-as-of 2026-08-18.
# Retrieved source documents and their sha256 values are in `source-evidence/`.
set -euo pipefail

export DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/test_kg3e_remediation_20260820"
node -e 'const u=new URL(process.env.DATABASE_URL); const db=u.pathname.replace("/","");
  console.log("RESOLVED TARGET host="+u.hostname+" database="+db);
  if(db==="safescope"||!/^test_/.test(db)){console.error("REFUSE");process.exit(1);}'

R="federal-core-2026-08-20.5"
REVIEWER="kg-3e-remediation-reviewer"
ROLE="regulatory-content-reviewer"
approve() { npm run --silent review:release-record -- approve --release "$R" \
  --citation "$1" --expected-checksum "$2" --reviewer "$REVIEWER" --role "$ROLE" --note "$3"; }

# =============================================================================================
# A. Records KG-3D refused as CONTENT_DIFF_REQUIRED, remediated and re-reviewed in KG-3E.
# =============================================================================================

approve "29 CFR 1926.501" \
  "b540a377148106669c24b0bf7c06c8ca26c3d65e0320a604869f14874fd97ab4" \
  "KG-3E Phase 2. Source: eCFR 29 CFR 1926.501 (ecfr-1926-501.xml) and 1926.500 (ecfr-1926-500.xml), title 29 up-to-date-as-of 2026-08-18. KG-3D refused this record because 'fall protection at applicable elevations or conditions' stated no requirement. Replaced with the operative rule and verified clause by clause (16/16): (a)(1) conformance to 1926.502; (a)(2) surface strength determination; (b)(1) unprotected sides and edges at 6 feet with guardrail/safety net/personal fall arrest; (b)(11) steep roofs; (b)(15) surfaces not otherwise addressed. Two distinctions checked against source rather than assumed: (b)(4)(i) is 'MORE THAN 6 feet' and is NOT flattened into the (b)(1) threshold, and (b)(4)(ii)-(iii) carry NO height threshold at all. Scope carve-outs at 1926.500(a)(2) for scaffolds (subpart L), cranes (CC), steel erection (R) and ladders/stairways (X) are NAMED, not absorbed. Selection re-tested: construction scaffold and GI stairway observations do not cross regimes."

approve "29 CFR 1910.147" \
  "003eac71364583a63c8b9ce944f4bbf65aaa787546705c2f9064c1b0ccf71c10" \
  "KG-3E Phase 2. Source: eCFR 29 CFR 1910.147 (ecfr-1910-147.xml), up-to-date-as-of 2026-08-18. KG-3D refused this on two grounds, both confirmed: the title dropped the codified '(lockout/tagout)' parenthetical, and the summary restated (a)(3) PURPOSE language rather than the operative duty. Title restored to the codified heading. Summary now states (c)(1) -- establish an energy control program of procedures, training and periodic inspections, isolate and render inoperative -- verified 13/13, together with (c)(2)(ii) lockout-over-tagout, the (a)(2)(ii) normal-production scope limit and its (A) guard-removal trigger, the Note minor-servicing exception, the (a)(2)(iii)(A) cord-and-plug exception, and the (a)(1)(ii)(A) construction/agriculture exclusion. The exclusion matters for regime safety: LOTO findings in construction are not this citation."

approve "30 CFR 56.14107(a)" \
  "b26287a0b2514f6e1bd7d381acfef71883b074250f8ab79c65613b2220b61b10" \
  "KG-3E Phase 2. Source: eCFR 30 CFR 56.14107 (ecfr-56-14107.xml), title 30 up-to-date-as-of 2026-08-18. KG-3D refused this because the text omitted (b), the seven-foot exemption. Confirmed and remediated: the citation is paragraph (a), and (a) genuinely does not contain the exemption -- (b) does -- so the prior text was not wrong about (a) but was wrong about the law, because a reader shown (a) alone concludes guarding is always required. (b) is now NAMED as the limiting sibling paragraph rather than absorbed or omitted. Separately, the prior text was broader than the rule: it used HazLenz taxonomy vocabulary ('pinch-point', 'caught-in exposure') where the regulation enumerates the covered parts and limits the catch-all to 'similar moving parts that can cause injury'. Enumeration and qualifier restored. 8/8 verified."

# =============================================================================================
# B. Phase 3 -- citations HazLenz emits that previously had no governed record at all.
# =============================================================================================

approve "29 CFR 1926.451(g)(1)" \
  "5ffd58c7429b14ba66363abe21e131c2a3645ba7ffc09398ec833bf9ce9bb6b4" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1926.451 (ecfr-1926-451.xml), up-to-date-as-of 2026-08-18. Codified heading is 'General requirements'; title is 'General requirements - Fall protection', naming the section heading and the (g) paragraph heading. Predicate (gold-set CON-FALL-01): mason on a scaffold platform 18 feet up with an open side, no guardrail or PFAS -- which establishes every element (g)(1) requires, including the 'more than 10 feet' threshold. Deliberately NOT promoted to (g)(1)(i)-(vii): those prescribe the system by SCAFFOLD TYPE, and the observation does not establish scaffold type, so a roman-numeral citation would assert a fact the evidence does not carry. 5/5 verified. Negative selection confirmed: this construction observation returns no 1910 citation."

approve "29 CFR 1926.652(a)(1)" \
  "6a827346fa01fef26ede6b5e591ddbe82306196ea8abca47da07036a90ee2e32" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1926.652 (ecfr-1926-652.xml), up-to-date-as-of 2026-08-18. Predicate (gold-set CON-EXC-01): laborers in a 6-foot trench, no protective system, soil not stable rock. The strongest evidence-to-rule fit in this slice: the predicate negates BOTH statutory exceptions explicitly -- 6 feet clears the (a)(1)(ii) 5-foot exception and 'not stable rock' clears (a)(1)(i). Both exceptions and the (a)(2) load-capacity requirement are stated rather than dropped, and the competent-person examination that qualifies (a)(1)(ii) is named. 7/7 verified. Negative selection confirmed: returns no MSHA citation."

approve "29 CFR 1910.28" \
  "328727df1602f48e203ddfa510b8b392411f52ea4d07e251fc9bd2e5976b8fb6" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1910.28 (ecfr-1910-28.xml) with 1910.25 (ecfr-1910-25.xml) consulted for the stairway-construction boundary, up-to-date-as-of 2026-08-18. Predicate (gold-set GI-WWS-01): missing handrail on an interior stairway. The requirement is (b)(11)(ii), but that paragraph is conditioned on 'at least 3 treads and at least 4 risers', which a bare missing-handrail observation does NOT establish. Approved at SECTION level for exactly that reason -- citing the paragraph would assert a tread/riser count nobody observed, which is the 1910.303 error applied prospectively. The summary names the tread/riser condition as something the finding must establish, attributes each rule to its own subparagraph, and points construction/dimensional requirements to 1910.25 and scaffold fall protection to 1926 subpart L. 8/8 verified. Negative selection confirmed: does not select 1926.501."

approve "29 CFR 1910.95" \
  "e5632e7e16402cc65c97acc939b08d72edf48b72140bb92ea21c4e9a4f07590a" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1910.95 (ecfr-1910-95.xml), up-to-date-as-of 2026-08-18. Predicate (gold-set GI-NOISE-01): 92 dBA full-shift TWA. That exceeds Table G-16, which permits 90 dBA for 8 hours and 92 dBA for only 6, AND clears the separate 85 dBA hearing-conservation trigger, so both (b)(1) and (c)(1) are supported. The (b)(1) control hierarchy is preserved deliberately -- feasible administrative or engineering controls first, PPE only if those controls fail -- because a summary offering hearing protection as an equal option would misstate the rule. 6/6 verified. Negative selection confirmed: does not select the construction noise citation 1926.52."

approve "29 CFR 1910.1200" \
  "a53f33a13d3155eb6d07e8fa06099b86274c746dd2fa4658a86efbebf4e1fd63" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1910.1200 (ecfr-1910-1200.xml), up-to-date-as-of 2026-08-18. Predicate (gold-set GI-HAZCOM-01): workplace chemical container with no label. The operative paragraph is (f)(6), WORKPLACE labeling -- not (f)(1), which covers containers LEAVING the workplace and places the duty on the manufacturer, importer or distributor. That distinction decides who is cited and is stated explicitly. The (f)(7) signs/placards/process-sheets alternative and the (f)(8) portable-container-for-immediate-use exception are preserved, because both are lawful compliance routes and omitting them would overstate the duty as 'every container must bear an individual label'. 6/6 verified. Negative selection confirmed: does not select the construction hazcom citation 1926.59."

approve "29 CFR 1926.1153" \
  "a92e4e554f2ef66c1837c32e18d6e930832d378dc03d81a3caa140263be874ef" \
  "KG-3E Phase 3. Source: eCFR 29 CFR 1926.1153 (ecfr-1926-1153.xml), up-to-date-as-of 2026-08-18. Predicate (gold-set CON-SILICA-01): dry-cutting concrete with a masonry saw, visible dust, no water suppression. The observation does not establish whether the saw is stationary or handheld, and Table 1 treats them as separate entries with different respiratory-protection requirements -- so the record stays at section level and names BOTH entries rather than picking one. Both require the same engineering control (integrated water delivery continuously feeding the blade), so the control duty holds either way. The (d) alternative route with its 50 ug/m3 8-hour TWA PEL is preserved. 6/6 verified. NOTE ON EVIDENCE: this record's operative control text lives in Table 1 markup, not in paragraphs; the KG-3E verifier was extended to read table cells, because verifying against paragraphs alone would have reported the requirement absent from its own source."

approve "30 CFR 56.14132" \
  "d714d7a3a9ff14ef1cddbece591562abc8437657ac7f7f7993c5f1fb4808353c" \
  "KG-3E Phase 3. Source: eCFR 30 CFR 56.14132 (ecfr-56-14132.xml), title 30 up-to-date-as-of 2026-08-18. THIS IS THE SECTION RECORD, added in place of the citation HazLenz actually emits. HazLenz emits '30 CFR 56.14132(a)', but (a) governs manually-operated HORNS being maintained functional, while the predicate (gold-set MSHA-TRAFFIC-01: haul truck backing with no functional backup alarm and no spotter) is governed by (b)(1) -- and (b)(1)(iv) makes an observer one of four permitted alternatives, which is why the absence of BOTH an alarm and a spotter is a (b)(1) violation and not an (a) one. Approving content for (a) would have put verified horn-maintenance text behind a backup-alarm finding. This section record states (a), (b)(1)(i)-(iv), (b)(2), (b)(3) and the (c) rail exclusion, and names the obstructed-view condition that triggers (b)(1). 7/7 verified. It does NOT back the emitted paragraph: 56.14132(a) still resolves to nothing, asserted by the Phase 4 granularity contract."

# =============================================================================================
# C. Phase 6 -- the last three placeholder-source records, now provenanced and corrected.
# =============================================================================================

approve "29 CFR 1910.22(a)" \
  "02516502072c4d6149cd29d518a99b714f8204be2fdbc5369da23516921ce4aa" \
  "KG-3E Phase 6. Source: eCFR 29 CFR 1910.22 (ecfr-1910-22.xml), up-to-date-as-of 2026-08-18. Was 'starter-unverified:osha:1910.22(a)' with no source fields; now routed through the registered osha-ecfr-1910 tier-1 source. Content defect found beyond provenance, as KG-3D warned: the stored text ('keep surfaces clean, orderly, and free of hazards') glossed (a)(1) and (a)(3) but silently dropped (a)(2) entirely -- the wet-process drainage and dry-standing-place duty -- and dropped the 'to the extent feasible' qualifier limiting both (a)(2) obligations. All three subparagraphs now stated with qualifiers intact, and (b)/(c)/(d) named as separate duties not carried by this paragraph. 5/5 verified."

approve "29 CFR 1910.303(b)(1)" \
  "d39c7beeda19d1b7227a97744f37f69d2d155c131a47affc7662d82fb60ce877" \
  "KG-3E Phase 6. Source: eCFR 29 CFR 1910.303 (ecfr-1910-303.xml), up-to-date-as-of 2026-08-18. The record KG-3D's granularity adjudication turned on. Two defects beyond placeholder provenance: the title 'Electrical equipment examination and use' conflated paragraph (b) with paragraph (b)(1), claiming the parent's scope for a paragraph citation; and the text omitted the eight considerations (b)(1)(i)-(viii) by which equipment safety is actually determined. Both corrected. The summary now states EXPLICITLY that this paragraph is Examination and that the duty to guard live parts at 50 volts or more is a different rule at (g)(2)(i) with a 600-volt installation scope -- so KG-3D's finding is written into the record itself rather than living only in a verification note. 5/5 verified, plus the Phase 4 contract asserting this record never asserts the guarding rule as its own."

approve "29 CFR 1910.146" \
  "64e95d964d97871c19380657d3b9418c53125c264052aefcc66c55791514791e" \
  "KG-3E Phase 6. Source: eCFR 29 CFR 1910.146 (ecfr-1910-146.xml), up-to-date-as-of 2026-08-18. Was 'starter-unverified:osha:1910.146'. Content defect beyond provenance: the stored text named four program elements ('permits, testing, attendants, and rescue planning') but stated no duty and no trigger -- the same failure mode that made 1926.501 unapprovable. Replaced with the operative structure (c)(1)-(c)(4): evaluate the workplace; inform employees by danger signs; then EITHER prevent entry (and still comply with (c)(1), (c)(2), (c)(6), (c)(8)) OR develop and implement a written permit space program. The (c)(5) alternate-procedures route is stated with its two demonstration conditions. The (a) scope exclusion is stated explicitly as the cross-regime guard: this section does not apply to construction, which is governed by 1926 subpart AA. 7/7 verified."

# =============================================================================================
# D. Phase 5 -- records whose content defects surfaced only once a source was attached.
# =============================================================================================

approve "29 CFR 1910.178(p)(1)" \
  "c45d1cc6c23d6987698b4cebea21ce7994fc5df0c3bf9aa81a70f08c3c36d7ae" \
  "KG-3E Phase 5. Source: eCFR 29 CFR 1910.178 (ecfr-1910-178.xml), up-to-date-as-of 2026-08-18. KG-3D classified this SOURCE_REFRESH_REQUIRED -- accurate but unreviewable for want of a recorded source. Attaching a source exposed a worse defect: the stored text ('General industry powered industrial truck safety criteria MAY BE RELEVANT when defects are observed, requiring qualified review') stated no requirement, and 'may be relevant' is not regulatory language at all. The title already named the duty; the summary never stated it. Now states (p)(1): a truck found in need of repair, defective, or in any way unsafe must be taken out of service until restored to safe operating condition, with (p)(2)-(p)(5) fuel-system duties. 5/5 verified, plus an explicit assertion that the hedging language is gone."

approve "30 CFR 56.12016" \
  "e14451d4818e95877d9a49d458ec87441832189a318e7ddc3f1be64fb45979a1" \
  "KG-3E Phase 5. Source: eCFR 30 CFR 56.12016 (ecfr-56-12016.xml), title 30 up-to-date-as-of 2026-08-18. Also SOURCE_REFRESH_REQUIRED under KG-3D and also carrying a content defect invisible without a source. The stored text hedged with 'where applicable' -- not in the rule -- and omitted three of the section's four duties: the warning notice posted at the power switch, the requirement that it be SIGNED by the individuals doing the work, and the restriction that locks may be removed only by those who installed them or by authorized personnel. Those three are the duties a real citation usually turns on. All four now stated. 6/6 verified, plus an explicit assertion that the hedge is gone."

approve "29 CFR 1910.212(a)(1)" \
  "96627e0b577e2b9c92353fdfca71ec964156bbf6a245b1714025c19fd6519a94" \
  "KG-3E Phase 5. Source: eCFR 29 CFR 1910.212 (ecfr-1910-212.xml), up-to-date-as-of 2026-08-18. KG-3D classified this SOURCE_REFRESH_REQUIRED: accurate but with no recorded source URL to review against. Provenance attached and the content completed -- it had omitted the guarding-method examples the rule itself gives (barrier guards, two-hand tripping devices, electronic safety devices) and the (a)(2) requirement that a guard must not itself offer an accident hazard. Point-of-operation requirements are named as (a)(3) rather than absorbed. 6/6 verified."

approve "29 CFR 1926.52" \
  "dff7561a7aee2e9def9593a0d690011b1145516ad926211919d08643e34f9e0a" \
  "KG-3E Phase 5. Source: eCFR 29 CFR 1926.52 (ecfr-1926-52.xml), up-to-date-as-of 2026-08-18. Content verified accurate as stored -- Table D-2 with its 90 dBA 8-hour value, the (b) control hierarchy, and the (d)(1) hearing conservation duty -- so no content change was made. Reviewed and approved on the recorded osha.gov standardnumber source. 5/5 verified. Provenance note: the recorded source_url is an osha.gov standardnumber page while the registered source osha-ecfr-1926 declares an ecfr.gov baseUrl. The URL was deliberately NOT changed: osha.gov is current, agency-published primary text, and repointing it would be presentation-only churn. Classified SOURCE_URL_REGISTRY_MISMATCH and carried to KG-3F."

approve "29 CFR 1926.59" \
  "d01386e464ef647e66fc9e6c53e8d3766e62cadd4e450e3e7bcb2db5efd92bf1" \
  "KG-3E Phase 5. Source: eCFR 29 CFR 1926.59 (ecfr-1926-59.xml), up-to-date-as-of 2026-08-18. 1926.59 is an incorporation-by-reference section: its entire codified text is a note that the construction requirements 'are identical to those set forth at 1910.1200'. The stored summary says exactly that and then states what 1910.1200 requires, which is the truthful way to represent an incorporating section -- it does not invent a separate construction rule. Content unchanged. 3/3 verified. Same SOURCE_URL_REGISTRY_MISMATCH note as 1926.52."

approve "30 CFR 62.130" \
  "11a1fcb6f70c8041f9648788fbc9f27f6ca65ee744b92431f6a1fe3075845007" \
  "KG-3E Phase 5. Source: eCFR 30 CFR 62.130 (ecfr-62-130.xml) with 62.101 (ecfr-62-101.xml) for the definition, title 30 up-to-date-as-of 2026-08-18. Content unchanged and verified: (a) feasible engineering and administrative controls plus enrollment in a 62.150 hearing conservation program above the PEL, and (c) the absolute 115 dBA ceiling. The summary glosses 'permissible exposure level' with 'a TWA8 of 90 dBA, or equivalently a dose of 100 percent' -- a gloss is an assertion, so it was sourced separately to 62.101 and verified there, the same discipline KG-3D applied to 62.120's action-level gloss. 5/5 verified. Provenance repaired this slice: source_url moved from the govinfo 2023 annual print edition to the eCFR title-30 URL its own source registration declares."

# =============================================================================================
# E. CARRY-FORWARD. Verified clause-by-clause in KG-3D against the same authoritative sources,
#    and checksum-identical to the version KG-3D approved. Surfaced by
#    `review:release-record -- carry-forward-candidates`, which never auto-applies; each is
#    re-affirmed here as an explicit per-record decision against this release.
# =============================================================================================

approve "29 CFR 1910.36" \
  "0e13180d1ff835069294987e4ec819343cf6bd7c147ab1cb6a20f9ac02dd003d" \
  "KG-3E carry-forward. Checksum 0e13180d1ff8... is IDENTICAL to the version KG-3D reviewed and approved (KG-3D 13/13 clause checks against ecfr-1910-36.xml, with ecfr-1910-37.xml retained to prove the 'free and unobstructed' rule belongs to 1910.37(a)(3) and not to this section). Content is byte-unchanged in this release; re-affirmed for federal-core-2026-08-20.5 as an explicit decision, not an automatic transfer."

approve "29 CFR 1910.303" \
  "e210f940c808a12bec28ca53146235ee5c30a6bd3e973e0d120206411642dee6" \
  "KG-3E carry-forward. Checksum e210f940c808... is IDENTICAL to the version KG-3D approved after its suggest() false-positive fix (the 'guard live parts' control tag changed to 'enclose live parts'). KG-3D verified 8/8 against ecfr-1910-303.xml including that (b)(1) Examination and (g)(2) Guarding are distinct rules. Content byte-unchanged here. KG-3E additionally holds this record to the Phase 4 granularity contract: it must attribute each rule to its own paragraph and preserve the 600V/50V scopes, both asserted and passing."

approve "29 CFR 1926.34(a)" \
  "dbf18c496390d9daa1185cbc5d5199a7aae2b5bd8ba415bc7e1067efddc1926a" \
  "KG-3E carry-forward. Checksum dbf18c496390... identical to the KG-3D-approved version, verified there against ecfr-1926-34.xml. Content byte-unchanged in this release; re-affirmed as an explicit decision."

approve "29 CFR 1926.416(a)(1)" \
  "e449db0edb582c8b653a64334fcb8214d9a1ee8c8adfbeadaa4bcb05638ca63a" \
  "KG-3E carry-forward. Checksum e449db0edb58... identical to the KG-3D-approved version, verified there against ecfr-1926-416.xml. Content byte-unchanged in this release; re-affirmed as an explicit decision."

approve "29 CFR 1926.300(b)(2)" \
  "b94bc1e035549d90a77f53e0a0ecccdf421340c15fdf1e7f3c5e74a816399416" \
  "KG-3E carry-forward. Checksum b94bc1e03554... identical to the KG-3D-approved version, verified there against ecfr-1926-300.xml. Content byte-unchanged in this release; re-affirmed as an explicit decision."

approve "30 CFR 47.41(a)" \
  "0705c5304b046aa62bb1f64b652e209d03788760af2088d3feaa70944fc3e6ae" \
  "KG-3E carry-forward WITH a provenance repair. Checksum 0705c5304b04... is identical to the KG-3D-approved version because source_url is NOT part of the checksummed manifest projection -- see FINDING-approval-binding-excludes-source-url.md. The record's source_url was moved this slice from the govinfo 2023 annual print edition to the eCFR title-30 URL its own source registration declares. KG-3E re-verified the content against that eCFR source (3/3: (a) every container labeled, (a)(1) replace missing or unreadable labels, (a)(2) must not remove or deface), and the eCFR text is byte-identical to what KG-3D retrieved. Re-affirmed on the repaired provenance."

approve "30 CFR 62.120" \
  "ff19c04db0758fc4e2efd9b788f6e64be8e7c3657173ca115c153d8de5888063" \
  "KG-3E carry-forward WITH a provenance repair, as for 47.41(a). Checksum ff19c04db075... unchanged. Content re-verified against eCFR 62.120 with 62.101 for the action-level gloss (2/2), and the eCFR text is byte-identical to KG-3D's retrieval. source_url moved from the govinfo 2023 print edition to the registered eCFR title-30 URL. Re-affirmed on the repaired provenance."

echo
echo "=============================================================================="
echo "DELIBERATELY NOT APPROVED in KG-3E:"
echo
echo "  30 CFR 56.14132(a)   -- the citation HazLenz EMITS. Paragraph (a) is horn"
echo "                          maintenance; the predicate describes obstructed-view"
echo "                          reversing, which is (b)(1). No content was created for"
echo "                          the emitted citation. Selection defect for KG-3F."
echo
echo "  1910.219, 1910.132(a), 1926.602(a)(9)(ii), 1926.95(a), 56.14105, 56.15006,"
echo "  56.9100(a), 57.14107(a)"
echo "                       -- 8 records with no recorded source_url. No gold-set"
echo "                          observation selects any of them (NOT_CURRENTLY_USED)."
echo "                          KG-3D deferred them; KG-3E carries the deferral forward"
echo "                          rather than approving text nobody has compared to a source."
echo "=============================================================================="
