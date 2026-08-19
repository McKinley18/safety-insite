# Failed Scenario Inventory

| ID | Jurisdiction | Family | Expected | Actual | Primary cause |
|---|---|---|---|---|---|
| C007 | MSHA | mine lockout | 56.12016 | 56.12004 | activity/energy-control classification and candidate recall |
| C010 | MSHA | unsafe ground | 56.3200 | walking surface/no citation | ground-control semantic extraction |
| C022 | MSHA | exposed electrical/wet contact | 56.12025 | 56.12032 | electrical predicate/ranking precision |
| C037 | OSHA GI | reachable live parts | 1910.303 | machine guarding/no citation | electrical equipment semantic extraction |
| C055 | OSHA GI | locked occupied exit | 1910.36 | egress/no citation | correct class but missing standard recall |
| C064 | OSHA Construction | unprotected 8-foot trench | 1926.652 | confined space/no citation | trench-versus-space classification |
| C073 | OSHA Construction | worker under suspended load | 1926.1425 | electrical/no citation | fall-zone/load semantic extraction |
| C085 | OSHA Construction | crane near energized line | 1926.1408 | lifting/rigging/no citation | multi-hazard predicate/candidate recall |
| C112 | Unknown | quoted training text | no citation | definitive 1910.147 | quotation/negation scope |
| C113 | Unknown | historical corrected guard | no citation | definitive 1910.212 | temporal/current-state failure |
| C115 | Unknown | explicitly open exit | no citation | definitive 1910.37 | double-negation and positive-control failure |
| C149 | Construction | stable-rock exception | no 1926.652 | definitive 1926.652 | exception predicate absent |
| C165 | OSHA GI | 78 dBA TWA | no 1910.95 | definitive 1910.95 | numeric threshold predicate absent |

The 26 NEEDS REVIEW cases predominantly have plausible broad hazard recognition but missing required citation families, overly generic questions, weak category precision, or corrective actions that do not match the observed mechanism.
