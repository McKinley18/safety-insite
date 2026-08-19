#!/usr/bin/env python3
"""Scenario corpus for the HazLenz capability audit (sections B3, B4, B5, B7, B10).

Expectations are written from the regulatory/contextual reading of each observation, NOT from
what HazLenz happens to output. Where the correct answer genuinely depends on facts not stated
in the observation, the expectation is "should ask" or "should stay conditional", not a citation.
"""

# ---------------------------------------------------------------------------------------------
# B3 — situational reasoning: does HazLenz relate evidence across a whole observation?
# ---------------------------------------------------------------------------------------------
B3 = [
    dict(id="B3-01-multi-simultaneous", context="osha-construction",
         text="On the third floor deck the guardrail is missing along the open edge, the extension cord "
              "running to the saw has exposed conductors, and a container of solvent by the wall has no label.",
         expect=dict(min_hazards=3, families_any=["fall", "electrical", "hazard_communication", "hazcom"],
                     unsafe=True)),
    dict(id="B3-02-effective-control", context="osha-general-industry",
         text="The press brake point of operation is fully enclosed by a fixed guard that was verified in place "
              "and the interlock was function-tested this morning.",
         expect=dict(controlled=True, no_supported_violation=True)),
    dict(id="B3-03-failed-control", context="osha-general-industry",
         text="The interlock guard on the press brake is installed but has been bypassed with a jumper wire so "
              "the machine runs with the guard open.",
         expect=dict(unsafe=True, families_any=["machine_guarding", "guard"])),
    dict(id="B3-04-conflicting", context="osha-general-industry",
         text="The operator says the machine was locked out, but the disconnect was found in the ON position and "
              "no lock or tag was present on it.",
         expect=dict(contradiction=True, unsafe=True)),
    dict(id="B3-05-uncertain-jurisdiction", context="unknown",
         text="A worker was on a ladder near the crusher discharge with no fall protection.",
         expect=dict(jurisdiction_unknown_ok=True, no_definite_citation_without_regime=True)),
    dict(id="B3-06-explicit-jurisdiction", context="unknown",
         text="At this surface sand and gravel mine, regulated by MSHA, the tail pulley guard on the conveyor is missing.",
         expect=dict(regime_inferred="msha", unsafe=True)),
    dict(id="B3-07-safe-condition", context="osha-general-industry",
         text="Walked the finished goods aisle; floors were dry and clear, all pallets were stacked squarely, "
              "and nothing was blocking the exit route.",
         expect=dict(controlled=True, no_supported_violation=True)),
    dict(id="B3-08-negated-hazard", context="osha-general-industry",
         text="No exposed energized conductors were found in Panel B; the cover was in place and secured.",
         expect=dict(controlled=True, no_supported_violation=True)),
    dict(id="B3-09-temporal-change", context="osha-construction",
         text="The trench had no protective system yesterday; today a properly rated trench box is installed and "
              "the competent person inspected it before entry this morning.",
         expect=dict(controlled=True, no_supported_violation=True)),
    dict(id="B3-10-worker-equipment-environment", context="osha-construction",
         text="A laborer is guiding a suspended precast panel by hand while the crane swings it over the access "
              "road in gusting wind and no taglines are in use.",
         expect=dict(unsafe=True, min_hazards=1)),
    dict(id="B3-11-context-dependent-severity", context="osha-general-industry",
         text="A four inch deep floor opening cover is missing in the mezzanine walkway twenty two feet above the "
              "shipping floor and workers cross it every shift.",
         expect=dict(unsafe=True, risk_at_least="High")),
    dict(id="B3-12-irrelevant-noise", context="osha-general-industry",
         text="Coffee machine in the breakroom is broken again and the parking lot was repaved last week. In the "
              "shop the abrasive wheel grinder has no tongue guard and the work rest is set about a half inch off the wheel.",
         expect=dict(unsafe=True, families_any=["machine_guarding", "guard"], no_phantom_families=["parking", "coffee"])),
    dict(id="B3-13-incomplete-needs-clarification", context="unknown",
         text="Someone mentioned there might be a problem with one of the machines in the back.",
         expect=dict(should_ask=True, no_supported_violation=True)),
    dict(id="B3-14-incomplete-no-clarification-needed", context="osha-general-industry",
         text="The tail pulley on the packaging conveyor is completely unguarded and operators reach across it to "
              "clear jams while it is running.",
         expect=dict(unsafe=True, questions_not_blocking=True)),
    dict(id="B3-15a-similar-wording-gi", context="osha-general-industry",
         text="Employee working on an unprotected side of a mezzanine platform six feet above the floor with no guardrail.",
         expect=dict(unsafe=True, regime_family="1910")),
    dict(id="B3-15b-similar-wording-construction", context="osha-construction",
         text="Employee working on an unprotected side of a leading edge six feet above the lower level with no guardrail.",
         expect=dict(unsafe=True, regime_family="1926")),
]

# ---------------------------------------------------------------------------------------------
# B4 — adversarial pairs: the hazard wording and the controlled wording share vocabulary.
# ---------------------------------------------------------------------------------------------
B4 = [
    dict(id="B4-01", context="osha-general-industry",
         hazard="The guard on the drill press is missing.",
         control="The guard on the drill press was inspected and is securely installed."),
    dict(id="B4-02", context="osha-general-industry",
         hazard="Worker is exposed to energized conductors inside the open motor control cabinet.",
         control="The motor control cabinet was de-energized, locked out, and absence of voltage was verified before work began."),
    dict(id="B4-03", context="osha-construction",
         hazard="Open trench about seven feet deep with vertical sides and no protective system, worker at the bottom.",
         control="The excavation is four feet deep, entirely in stable rock, and the competent person examined it and "
                 "found no indication of a potential cave-in, so no protective system is required."),
    dict(id="B4-04", context="osha-general-industry",
         hazard="A damaged extension cord with the outer jacket split is in use at the assembly bench.",
         control="A damaged extension cord was found at the assembly bench, tagged, and removed from service."),
    dict(id="B4-05", context="osha-general-industry",
         hazard="Dosimetry recorded 92 dBA sustained across the full eight hour shift for the saw operator with no hearing protection.",
         control="A brief instantaneous reading of 92 dBA was recorded at the saw, but the operator's documented "
                 "eight hour dose is well below the action level and hearing protection is worn."),
]

# ---------------------------------------------------------------------------------------------
# B5 — multi-hazard system understanding, 4-6 interacting conditions, one per regime.
# ---------------------------------------------------------------------------------------------
B5 = [
    dict(id="B5-gi", context="osha-general-industry",
         text="In the packaging area the case sealer belt drive is being serviced with power connected and no lock or "
              "tag applied, the extension cord feeding the shrink wrap station has exposed copper conductors, the "
              "aisle to the emergency exit is blocked by stacked pallets, and a drum of cleaning chemical by the "
              "sink has no label.",
         expect=dict(min_hazards=3, families_any=["lockout", "energy", "electrical", "egress", "hazard_communication", "hazcom"])),
    dict(id="B5-construction", context="osha-construction",
         text="On the second floor slab the leading edge is open with no guardrail and workers are within a foot of it, "
              "the scaffold beside the column is missing its guardrail on the open side above ten feet, a portable "
              "generator is feeding tools through a cord with no GFCI, and the ladder used to reach the slab does not "
              "extend three feet above the landing.",
         expect=dict(min_hazards=3, families_any=["fall", "scaffold", "electrical", "ladder"])),
    dict(id="B5-msha", context="msha",
         text="At the primary crusher the tail pulley guard is off, a miner was greasing the head pulley while the "
              "conveyor was running, the travelway handrail beside the belt is missing a section, and the berm along "
              "the haul road above the crusher is below axle height.",
         expect=dict(min_hazards=3, families_any=["guard", "machine_guarding", "energy", "lockout", "fall", "berm", "haul"])),
]

# ---------------------------------------------------------------------------------------------
# B7 — uncertainty intelligence.
# ---------------------------------------------------------------------------------------------
B7 = [
    dict(id="B7-01-enough-evidence", context="osha-general-industry",
         text="The tail pulley on the packaging conveyor is completely unguarded and operators reach across it while running.",
         expect=dict(kind="ENOUGH_EVIDENCE")),
    dict(id="B7-02-decision-critical-question", context="osha-general-industry",
         text="There is an opening in the mezzanine floor.",
         expect=dict(kind="DECISION_CRITICAL_QUESTION")),
    dict(id="B7-03-unknown", context="unknown",
         text="Something did not look right in the yard.",
         expect=dict(kind="UNKNOWN")),
    dict(id="B7-04-safe-or-controlled", context="osha-general-industry",
         text="All machine guards in the fabrication cell were verified in place and function tested this morning.",
         expect=dict(kind="SAFE_OR_CONTROLLED")),
    dict(id="B7-05-jurisdiction-unknown-not-zero", context="unknown",
         text="The tail pulley on the conveyor is completely unguarded and workers reach across it while it runs.",
         expect=dict(kind="ENOUGH_EVIDENCE", must_not_be_empty=True)),
]

# ---------------------------------------------------------------------------------------------
# B10 — customer-confidence gauntlet: natural field language, abbreviations, imperfect grammar,
# irrelevant detail, mixed observations. 30 scenarios across families and regimes.
# ---------------------------------------------------------------------------------------------
B10 = [
    ("B10-01", "osha-general-industry", "grinder in maint shop missing tongue guard, work rest gap way too big, guys use it daily"),
    ("B10-02", "osha-general-industry", "found the LOTO box empty again. mechanic had the conveyor drive open w/ power still on, no lock no tag"),
    ("B10-03", "osha-general-industry", "ext cord at the pack line is chewed up, copper showing. still plugged in"),
    ("B10-04", "osha-general-industry", "exit door by shipping blocked w/ pallets abt 4 high, been like that all week"),
    ("B10-05", "osha-general-industry", "drum of parts washer solvent no label on it, sitting by the sink"),
    ("B10-06", "osha-general-industry", "guys on the mezz walking next to a open floor hole, no cover no rail, its abt 20 ft down"),
    ("B10-07", "osha-general-industry", "forklift operator driving w/ forks up abt 4 ft, pedestrians in same aisle, no horn at the corner"),
    ("B10-08", "osha-general-industry", "noise in the stamping area is bad, dosimeter came back 94 dba 8hr TWA, no plugs being worn"),
    ("B10-09", "osha-general-industry", "eyewash station in the plating room dont work, no water pressure"),
    ("B10-10", "osha-general-industry", "confined space entry into the mix tank, no attendant outside, no atmo test done that i saw"),
    ("B10-11", "osha-general-industry", "electrical panel in the boiler rm has abt 18in clearance, boxes stacked in front"),
    ("B10-12", "osha-general-industry", "chemical storage - oxidizer stored right next to the flammables cabinet"),
    ("B10-13", "osha-general-industry", "compressed gas cyls in the weld shop not chained, caps off, laying on their side"),
    ("B10-14", "osha-general-industry", "stair rail on the north stairs is loose, wobbles when you pull it. 3 flights"),
    ("B10-15", "osha-general-industry", "checked the fab cell. all guards on, interlocks tested ok, housekeeping good. nothing to write up"),
    ("B10-16", "osha-construction", "no guardrail on the 2nd flr leading edge, 3 laborers within a couple ft of it, abt 25 ft drop"),
    ("B10-17", "osha-construction", "scaffold by the elevator shaft - no rail on the open side, planks not full width, its over 10 ft"),
    ("B10-18", "osha-construction", "trench on the east side abt 8 ft deep, clay, straight walls, no box no slope, spoil right at the lip, 2 guys in it"),
    ("B10-19", "osha-construction", "temp power on the slab, cords running thru water, no gfci on the spider box"),
    ("B10-20", "osha-construction", "ladder to the deck only comes up level w/ the landing, not tied off"),
    ("B10-21", "osha-construction", "excavator swinging bucket over the laydown area, a laborer walked right thru the swing radius"),
    ("B10-22", "osha-construction", "silica - guys dry cutting block all afternoon, no water no vac, big dust cloud, no resps"),
    ("B10-23", "osha-construction", "rebar caps missing on the vertical rebar in the footing area, guys working above it"),
    ("B10-24", "osha-construction", "hot work in the stairwell, no fire watch, no permit posted, cardboard right there"),
    ("B10-25", "osha-construction", "aerial lift operator leaning way out over the rail to reach the fascia, harness on but not tied to the boom"),
    ("B10-26", "msha", "tail pulley guard off at the primary, miner walks that travelway all shift"),
    ("B10-27", "msha", "miner greasing the head pulley w/ the belt running, no energy isolation"),
    ("B10-28", "msha", "berm on the haul rd by the dump point is way below axle ht on the biggest truck we run"),
    ("B10-29", "msha", "no handrail on abt 15 ft of the elevated travelway next to the screen deck"),
    ("B10-30", "msha", "checked the shop - guards in place, LOTO locks on the board, travelways clear, berms look good at the dump"),
]
