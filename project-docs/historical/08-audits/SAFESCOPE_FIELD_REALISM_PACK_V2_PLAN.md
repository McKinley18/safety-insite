SafeScope Field Realism Pack v2

Goal:
Expand SafeScope from strong controlled benchmark performance into broader messy field-condition reasoning.

Current baseline:
- Mind vs. Memory validator: 28 cases passing.
- Finding audit: 50 pass, 0 review, 0 fail.
- Brain coverage matrix: 50 strong rows.
- Production readiness verification: passing.
- Branch synced to origin/main at commit 1983f01.

Next build target:
Create a Field Realism Pack v2 benchmark with 75-100 messy, realistic safety observations across MSHA, OSHA General Industry, and OSHA Construction.

Required case categories:
1. Machine guarding with vague descriptions.
2. Machine guarding with cleanup/maintenance ambiguity.
3. LOTO active exposure.
4. LOTO mentioned only as training/procedure.
5. Conveyor nip point with partial guarding.
6. Conveyor observation with no exposure.
7. Wet floor near electrical equipment.
8. Electrical panel open with exposed parts.
9. Electrical equipment present but no live exposure.
10. Mobile equipment backing with pedestrian exposure.
11. Mobile equipment present without pedestrian exposure.
12. Loader/truck berm edge exposure.
13. Forklift pedestrian interaction.
14. Forklift training/documentation issue.
15. Fall from height with missing height.
16. Fall protection clearly missing.
17. Elevated platform with no employee exposure.
18. Ladder setup defect.
19. Scaffold guardrail defect.
20. Confined space actual entry.
21. Confined space language without actual entry.
22. Atmospheric testing missing.
23. Attendant/retrieval missing.
24. HazCom unlabeled container.
25. HazCom SDS missing.
26. Incompatible chemical storage.
27. Chemical leak/spill.
28. Generic dust that should not become silica.
29. Silica-generating task with missing controls.
30. Noise observation without dosimetry.
31. Heat stress observation with missing WBGT/exposure duration.
32. Cold stress observation with missing exposure duration.
33. Fire extinguisher blocked without hot work.
34. Hot work with combustibles/fire watch issue.
35. Hot work negated but fire housekeeping issue present.
36. Compressed gas cylinders unsecured.
37. Oxygen/fuel gas cylinders stored together.
38. Rigging defect without suspended load exposure.
39. Suspended load with worker in fall zone.
40. Falling object/material storage.
41. Housekeeping trip hazard.
42. Emergency eyewash blocked.
43. PPE missing during grinding.
44. Grinder missing guard.
45. Hand protection missing.
46. Unknown vague observation that should hold for evidence.
47. Multi-hazard observations requiring priority routing.
48. Negated hazards that should not contaminate final reasoning.
49. Missing evidence scenarios that require supervisor questions.
50. Jurisdiction ambiguity where SafeScope must hold and ask.

Validation requirements:
- Preserve advisory-only outputs.
- Do not declare violations.
- Do not invent standards where evidence is incomplete.
- Check final generated decision fields only for forbidden false positives.
- Keep registry/Brain packet reference text from creating false-positive failures.
- Require missing-evidence language for incomplete cases.
- Maintain production readiness verification passing.
- Do not deploy.
- Do not change frontend unless explicitly requested.

Validation commands:
cd backend && npx ts-node scripts/validate-safescope-mind-vs-memory.ts
cd backend && npm run audit:safescope-findings
cd backend && npm run build
./scripts/verify-production-readiness.sh

Commit target:
"Add SafeScope field realism pack v2 benchmark plan"
