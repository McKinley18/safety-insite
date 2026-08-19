# MSHA Verification (representative cases, provisioned disposable DB + fixes)

## Machine guarding / hazardous energy — `msha-conveyor-jam-energized`

- Finding: "A miner is clearing a jammed conveyor while the belt is energized and the tail pulley guard has been removed."
- Citations returned: `30 CFR 56.12016`, `30 CFR 56.11009`, `30 CFR 56.14113`, `30 CFR 56.14107(a)`
- Exact authoritative text, **30 CFR 56.14107(a)** (required case): *"(a) Moving machine parts shall be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels, couplings, shafts, fan blades, and similar moving parts that can cause injury."* — verified against live eCFR bulk source and matches the well-known MSHA guarding standard text.
- Exact authoritative text, **30 CFR 56.12016** (LOTO / hazardous energy): *"Electrically powered equipment shall be deenergized before mechanical work is done on such equipment. Power switches shall be locked out or other measures taken which shall prevent the equipment from being energized without the knowledge of the individuals working on it..."*
- Scope: both are exact section-level matches (no subsection requested for either citation in this case).

## Mobile equipment / traffic — `msha-backup-alarm-reversing`

- Finding: "At a quarry, a loader is backing through a blind area with a broken backup alarm while miners are on foot nearby."
- Citations returned: `30 CFR 56.14132(a)`, `30 CFR 56.9100(a)`, `30 CFR 56.9100`
- `56.14132(a)` and `56.9100(a)` both resolve to exact-paragraph text (subsection-level, not whole-section) via the same `regulatory_paragraph` lookup path verified for OSHA cases above.

## Safe-controlled negative — `msha-backup-alarm-parked-out` / `msha-conveyor-locked-out`

- Both correctly return zero active citations (`activeCitations: []`) — the safe/controlled framing (parked, key removed, locked out and zero-energy verified) correctly suppresses active citation promotion rather than forcing a citation that doesn't apply. This is the expected behavior for these two cases and both pass.

## Chain proof

`classify` → `standardDecisions`/`primaryCitation` (both correctly non-empty after the Phase 5 fix) → `GET /regulatory/section?citation=30%20CFR%2056.14107(a)` → real eCFR text (confirmed above) → separately-labeled HazLenz `classification`/`explanation` fields, never conflated with the authoritative text field.
