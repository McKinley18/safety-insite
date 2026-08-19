# Regulatory Applicability Model

## Decision ledger

Every evaluated standard family produces:

- citation family and authoritative source/version;
- required predicates;
- evidence fact IDs supporting each predicate;
- missing predicates;
- contradictions/exceptions;
- status: `SUPPORTED`, `NOT_SUPPORTED`, `CONTRADICTED`, `UNKNOWN`, or `NOT_APPLICABLE`;
- confidence and concise explanation.

A definitive standard requires every material predicate SUPPORTED. UNKNOWN yields candidate status and a targeted question. CONTRADICTED or NOT_APPLICABLE suppresses definitive promotion.

## Initial systemic predicate families

| Family | Material predicates |
|---|---|
| MSHA energy control 56.12016 | MSHA; electrical/mechanical work; power circuit/equipment; energy not isolated/locked or unknown |
| MSHA unsafe ground 56.3200 | MSHA MNM; loose/unsafe ground; travel/work exposure; not supported/scaled/barricaded |
| MSHA electrical 56.12025 | MSHA; damaged/exposed conductor or grounding hazard; energized/capable; person/contact path |
| OSHA live parts 1910.303 | GI; electrical installation; live part; reachable/exposed; not guarded/deenergized |
| OSHA exit 1910.36/37 | GI; occupied workplace; required exit/route; locked/blocked/unusable |
| Construction trench 1926.652 | construction; excavation/trench; cave-in exposure; no protective system; exception not supported |
| Construction fall zone 1926.1425 | construction; crane/derrick load suspended/moving; worker within fall zone; exception/task allowance absent |
| Crane power lines 1926.1408 | construction; crane equipment; energized/assumed energized line; encroachment potential; required controls absent |
| OSHA noise 1910.95 | GI; employee occupational noise exposure; measurement/duration; applicable action/PEL threshold met or unknown |

## User explanation

Example: “Candidate: the description places a worker beneath a suspended crane load. HazLenz needs to confirm whether the worker’s task was one of the limited activities permitted in the fall zone.”

The explanation lists evidence, missing facts, and status—never hidden reasoning or a legal conclusion.
