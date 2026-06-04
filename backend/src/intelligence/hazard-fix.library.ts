export interface HazardFix {
  category: string;
  hazard: string;
  violation: string;
  standards: string[];
  fixes: string[];
  engineeringControls: string[];
  administrativeControls: string[];
  ppe: string[];
  severity: "low" | "medium" | "high" | "critical";
}

export const HAZARD_FIX_LIBRARY: HazardFix[] = [
  // --- MACHINE GUARDING ---
  {
    category: "machine",
    hazard: "Conveyor tail pulley missing guard",
    violation: "Exposed moving machine parts capable of causing injury",
    standards: ["30 CFR 56.14107", "29 CFR 1910.212(a)(1)"],
    fixes: [
      "Install fixed mesh guard around tail pulley",
      "Ensure guard requires tools for removal",
      "Interlock guard with machine power if possible"
    ],
    engineeringControls: ["Fixed mechanical guarding", "Safety interlocks"],
    administrativeControls: ["Lockout/Tagout training", "Pre-shift inspection protocol"],
    ppe: ["Tight-fitting clothing", "Hair restraints"],
    severity: "high"
  },
  {
    category: "machine",
    hazard: "Bench grinder tool rest gap excessive",
    violation: "Work rest distance exceeds 1/8 inch from wheel",
    standards: ["29 CFR 1910.215(a)(4)"],
    fixes: [
      "Adjust tool rest to 1/8 inch gap",
      "Adjust tongue guard to 1/4 inch gap",
      "Replace worn grinding wheels"
    ],
    engineeringControls: ["Tongue guards", "Spark shields"],
    administrativeControls: ["Wheel speed verification", "Ring test procedures"],
    ppe: ["Face shield", "Safety glasses"],
    severity: "medium"
  },
  {
    category: "machine",
    hazard: "Rotating drive shaft unguarded",
    violation: "Exposed smooth or protruding rotating components",
    standards: ["30 CFR 56.14107", "29 CFR 1910.219"],
    fixes: [
      "Install enclosure guard over full length of shaft",
      "Eliminate protruding set screws",
      "Install warning signage"
    ],
    engineeringControls: ["Enclosure guarding", "Shaft sleeves"],
    administrativeControls: ["Equipment maintenance log", "Operator awareness training"],
    ppe: ["No loose jewelry", "Gloves restricted near rotation"],
    severity: "high"
  },
  {
    category: "machine",
    hazard: "Fan blades missing enclosure",
    violation: "Periphery of fan blades less than 7 feet from floor",
    standards: ["29 CFR 1910.212(a)(5)"],
    fixes: [
      "Install 1/2 inch mesh enclosure over fan blades",
      "Mount fan unit above 7 feet",
      "Replace damaged cages"
    ],
    engineeringControls: ["Wire mesh guarding", "Elevated mounting"],
    administrativeControls: ["Safety check audits"],
    ppe: [],
    severity: "low"
  },
  {
    category: "machine",
    hazard: "Hydraulic press point of operation exposed",
    violation: "Lack of guarding at point of manual material feed",
    standards: ["29 CFR 1910.212(a)(3)(ii)"],
    fixes: [
      "Install light curtains at feed area",
      "Implement two-hand trip controls",
      "Install barrier guards"
    ],
    engineeringControls: ["Light curtains", "Two-hand actuators", "Adjustable barrier guards"],
    administrativeControls: ["JHA for pressing operations", "Operator certification"],
    ppe: ["Impact-resistant eye protection"],
    severity: "critical"
  },

  // --- ELECTRICAL ---
  {
    category: "electrical",
    hazard: "Exposed live conductors in junction box",
    violation: "Electrical conductors not enclosed in approved cabinets",
    standards: ["30 CFR 56.12004", "29 CFR 1910.303(g)(2)"],
    fixes: [
      "De-energize and install junction box cover",
      "Use knockout seals for unused openings",
      "Ensure box is properly secured"
    ],
    engineeringControls: ["Enclosures", "Approved junction boxes"],
    administrativeControls: ["Qualified electrician only repairs", "Panel inspection schedules"],
    ppe: ["Insulated tools", "Voltage-rated gloves (Class 0)"],
    severity: "critical"
  },
  {
    category: "electrical",
    hazard: "Blocked electrical disconnect panel",
    violation: "Insufficient working space in front of equipment",
    standards: ["29 CFR 1910.303(g)(1)", "30 CFR 56.12008"],
    fixes: [
      "Clear 36-inch path in front of panel",
      "Mark floor with 'Keep Clear' yellow tape",
      "Relocate stored materials"
    ],
    engineeringControls: ["Floor marking", "Fixed bollards"],
    administrativeControls: ["Space management policy", "Shift supervisor walk-throughs"],
    ppe: [],
    severity: "high"
  },
  {
    category: "electrical",
    hazard: "Damaged insulation on flexible power cord",
    violation: "Frayed or spliced flexible cords used in lieu of fixed wiring",
    standards: ["29 CFR 1910.305(g)(1)", "30 CFR 56.12004"],
    fixes: [
      "Remove cord from service immediately",
      "Replace with heavy-duty SOOW cord",
      "Ensure proper strain relief at plug"
    ],
    engineeringControls: ["Industrial grade cords", "Cable bridges"],
    administrativeControls: ["Extension cord usage policy", "Visual inspection training"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "electrical",
    hazard: "Missing ground pin on power tool",
    violation: "Equipment grounding path not permanent or continuous",
    standards: ["29 CFR 1910.304(g)(5)", "30 CFR 56.12025"],
    fixes: [
      "Replace plug with grounded 3-prong unit",
      "Verify continuity with multimeter",
      "Remove tool from site if double-insulation is missing"
    ],
    engineeringControls: ["Grounded plugs", "GFCI protection"],
    administrativeControls: ["Assured Equipment Grounding Conductor Program (AEGCP)"],
    ppe: [],
    severity: "high"
  },
  {
    category: "electrical",
    hazard: "Unlabeled circuit breakers in main panel",
    violation: "Failure to indicate purpose of each service or branch circuit",
    standards: ["29 CFR 1910.303(f)(2)"],
    fixes: [
      "Trace circuits and label accurately",
      "Use permanent markers or printed labels",
      "Update facility electrical map"
    ],
    engineeringControls: ["Permanent labeling"],
    administrativeControls: ["Annual panel audit", "Lockout/Tagout identification"],
    ppe: [],
    severity: "low"
  },

  // --- SLIP/TRIP/FALL ---
  {
    category: "slip",
    hazard: "Oil accumulation on workshop floor",
    violation: "Walking-working surfaces not maintained in clean/dry condition",
    standards: ["29 CFR 1910.22(a)(1)", "30 CFR 56.11001"],
    fixes: [
      "Apply absorbent compound and sweep",
      "Repair hydraulic leak at source",
      "Install secondary containment pans"
    ],
    engineeringControls: ["Leak containment", "Non-slip floor coating"],
    administrativeControls: ["Daily housekeeping checklist", "Spill response procedure"],
    ppe: ["Oil-resistant safety boots"],
    severity: "medium"
  },
  {
    category: "slip",
    hazard: "Aisleway blocked by shipping pallets",
    violation: "Obstructions in permanent aisles and passageways",
    standards: ["29 CFR 1910.22(c)"],
    fixes: [
      "Relocate pallets to designated storage racks",
      "Widen aisle to minimum 3 feet",
      "Improve facility flow planning"
    ],
    engineeringControls: ["Designated storage racks", "Impact barriers"],
    administrativeControls: ["Warehouse management training", "Keep-clear zones"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "fall",
    hazard: "Missing handrail on stairs",
    violation: "Standard stair rail missing on open side of stairs",
    standards: ["29 CFR 1910.28(b)(11)", "30 CFR 56.11002"],
    fixes: [
      "Install 42-inch high handrail with mid-rail",
      "Ensure rail can withstand 200lb load",
      "Add toeboards to prevent falling objects"
    ],
    engineeringControls: ["Standard handrails", "Stair treads"],
    administrativeControls: ["Staircase safety audit"],
    ppe: [],
    severity: "high"
  },
  {
    category: "fall",
    hazard: "Unsecured extension ladder",
    violation: "Ladders not used on stable/level surfaces or secured",
    standards: ["29 CFR 1910.23(c)", "30 CFR 56.11003"],
    fixes: [
      "Tie off top of ladder to structural member",
      "Use ladder levelers on uneven ground",
      "Station a spotter at the base"
    ],
    engineeringControls: ["Ladder stabilizers", "Leveling feet"],
    administrativeControls: ["Ladder safety training", "3-point contact rule"],
    ppe: [],
    severity: "high"
  },
  {
    category: "fall",
    hazard: "Unprotected roof edge identification",
    violation: "Employees exposed to fall of 4 feet or more to lower level",
    standards: ["29 CFR 1910.28(b)(1)", "30 CFR 56.15005"],
    fixes: [
      "Install perimeter guardrail system",
      "Implement a 10-foot warning line system",
      "Designate a safety monitor"
    ],
    engineeringControls: ["Guardrails", "Parapet walls"],
    administrativeControls: ["Fall protection plan", "Restricted access zones"],
    ppe: ["Full body harness", "Retractable lanyard"],
    severity: "critical"
  },

  // --- FIRE SAFETY ---
  {
    category: "fire",
    hazard: "Emergency exit door locked during shift",
    violation: "Exit routes must remain unlocked from the inside",
    standards: ["29 CFR 1910.36(d)", "NFPA 101"],
    fixes: [
      "Remove padlock immediately",
      "Install panic-bar hardware",
      "Install alarm-only exit locks"
    ],
    engineeringControls: ["Panic bars", "Alarmed exit hardware"],
    administrativeControls: ["Shift opening inspections", "Fire marshal audits"],
    ppe: [],
    severity: "critical"
  },
  {
    category: "fire",
    hazard: "Fire extinguisher missing monthly inspection tag",
    violation: "Portable extinguishers not maintained in fully charged condition",
    standards: ["30 CFR 56.4201", "29 CFR 1910.157(e)"],
    fixes: [
      "Perform visual inspection and sign tag",
      "Verify pressure gauge is in green zone",
      "Ensure extinguisher is mounted correctly"
    ],
    engineeringControls: ["Approved mounting brackets"],
    administrativeControls: ["Monthly inspection log", "Annual professional service"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "fire",
    hazard: "Flammable liquids stored in plastic bottles",
    violation: "Unapproved containers used for flammable liquid storage",
    standards: ["29 CFR 1910.106(d)(2)", "30 CFR 56.4430"],
    fixes: [
      "Transfer to approved UL-listed safety cans",
      "Label containers with chemical name and GHS pictograms",
      "Store in grounded flammable cabinet"
    ],
    engineeringControls: ["Safety cans", "Flammable storage cabinets", "Grounded racks"],
    administrativeControls: ["Chemical storage policy", "GHS training"],
    ppe: ["Chemical resistant gloves", "Splash goggles"],
    severity: "high"
  },

  // --- PPE ---
  {
    category: "ppe",
    hazard: "Employee working without head protection in pit",
    violation: "Lack of protection from falling or flying objects",
    standards: ["30 CFR 56.15002", "29 CFR 1910.135"],
    fixes: [
      "Mandate ANSI Z89.1 hard hats",
      "Post 'Hard Hat Required' signage at gate",
      "Replace hard hats older than 5 years"
    ],
    engineeringControls: ["Overhead debris netting"],
    administrativeControls: ["Mandatory PPE policy", "Disciplinary enforcement"],
    ppe: ["Type I/II Hard Hats"],
    severity: "high"
  },
  {
    category: "ppe",
    hazard: "Grinding without eye and face protection",
    violation: "Exposure to flying particles without primary/secondary protection",
    standards: ["29 CFR 1910.133(a)(1)", "30 CFR 56.15004"],
    fixes: [
      "Issue ANSI Z87.1 safety glasses with side shields",
      "Provide face shields for heavy grinding",
      "Install point-of-use PPE dispensers"
    ],
    engineeringControls: ["Machine shields"],
    administrativeControls: ["Eye protection policy", "Vision screening"],
    ppe: ["Safety glasses", "Face shields"],
    severity: "high"
  },

  // --- VEHICLE / MOBILE EQUIPMENT ---
  {
    category: "vehicle",
    hazard: "Forklift backup alarm inaudible",
    violation: "Warning devices must be audible above surrounding noise",
    standards: ["30 CFR 56.9200", "29 CFR 1910.178(q)"],
    fixes: [
      "Replace alarm with higher decibel unit",
      "Install blue proximity floor lights",
      "Remove vehicle from service until repaired"
    ],
    engineeringControls: ["Audible alarms", "Proximity lights", "RFID detection"],
    administrativeControls: ["Pre-use inspection (Daily)", "Pedestrian right-of-way policy"],
    ppe: ["High-visibility vests"],
    severity: "high"
  },
  {
    category: "vehicle",
    hazard: "Vehicle seatbelt missing or inoperable",
    violation: "Seat belts shall be provided and worn in mobile equipment",
    standards: ["30 CFR 56.14130", "29 CFR 1910.178"],
    fixes: [
      "Install new retractable 3-point seatbelt",
      "Implement zero-tolerance wearing policy",
      "Install seatbelt interlocks"
    ],
    engineeringControls: ["Seatbelt interlocks"],
    administrativeControls: ["Operator training", "Seatbelt usage audits"],
    ppe: [],
    severity: "medium"
  },

  // --- CHEMICAL / HAZARDOUS ---
  {
    category: "chemical",
    hazard: "Secondary chemical container unlabeled",
    violation: "Failure to provide GHS-compliant labels on workplace containers",
    standards: ["29 CFR 1910.1200(f)(6)"],
    fixes: [
      "Apply permanent GHS label with pictograms",
      "Ensure name matches Safety Data Sheet (SDS)",
      "Destroy unlabeled mystery containers"
    ],
    engineeringControls: ["Label printing stations"],
    administrativeControls: ["Hazard Communication (HazCom) program", "SDS library management"],
    ppe: ["Nitrile gloves"],
    severity: "medium"
  },
  {
    category: "chemical",
    hazard: "No emergency eyewash within 10 seconds of acid storage",
    violation: "Lack of suitable facilities for quick drenching of eyes/body",
    standards: ["29 CFR 1910.151(c)", "ANSI Z358.1"],
    fixes: [
      "Install plumbed eyewash station",
      "Perform weekly flush/flow tests",
      "Ensure 360-degree access without obstruction"
    ],
    engineeringControls: ["Plumbed eyewash stations", "Flow regulators"],
    administrativeControls: ["Weekly maintenance logs", "First aid training"],
    ppe: ["Chemical splash goggles"],
    severity: "critical"
  },

  // --- ADDITIONAL ENTRIES TO REACH 40+ ---
  {
    category: "machine",
    hazard: "Loose mounting bolts on stationary motor",
    violation: "Failure to maintain machinery in safe working condition",
    standards: ["30 CFR 56.14100"],
    fixes: ["Torque bolts to specification", "Apply thread-locking compound"],
    engineeringControls: ["Vibration dampeners"],
    administrativeControls: ["Predictive maintenance schedule"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "electrical",
    hazard: "Panel knockout missing",
    violation: "Unused openings in cabinets must be closed",
    standards: ["29 CFR 1910.305(b)(1)"],
    fixes: ["Install metallic knockout plug", "Verify tight fit"],
    engineeringControls: ["Metallic plugs"],
    administrativeControls: ["Monthly electrical survey"],
    ppe: [],
    severity: "low"
  },
  {
    category: "slip",
    hazard: "Protruding anchor bolts in walkway",
    violation: "Floor maintained free of sharp/protruding objects",
    standards: ["29 CFR 1910.22(a)(3)"],
    fixes: ["Cut bolts flush to floor", "Apply high-visibility floor paint"],
    engineeringControls: ["Flush-mount anchors"],
    administrativeControls: ["Demolition site clearing protocol"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "fall",
    hazard: "Broken rung on fixed vertical ladder",
    violation: "Ladder rungs must be maintained in safe condition",
    standards: ["29 CFR 1910.23(b)(9)", "30 CFR 56.11003"],
    fixes: ["Replace ladder section", "Weld new non-slip rung"],
    engineeringControls: ["Serrated rungs"],
    administrativeControls: ["Ladder tags"],
    ppe: [],
    severity: "high"
  },
  {
    category: "fire",
    hazard: "No signage for emergency exit",
    violation: "Each exit must be marked by a clearly visible sign",
    standards: ["29 CFR 1910.37(b)(2)"],
    fixes: ["Install illuminated 'EXIT' sign", "Add arrows for directional paths"],
    engineeringControls: ["Emergency lighting"],
    administrativeControls: ["Annual exit sign battery test"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "ppe",
    hazard: "Respirator filter past expiration date",
    violation: "Equipment not maintained according to manufacturer",
    standards: ["29 CFR 1910.134(h)"],
    fixes: ["Issue new P100 filters", "Store respirator in sealed bag"],
    engineeringControls: ["Exhaust ventilation"],
    administrativeControls: ["Fit test program", "Filter change schedule"],
    ppe: ["N95/P100 respirators"],
    severity: "high"
  },
  {
    category: "vehicle",
    hazard: "Cracked windshield on haul truck",
    violation: "Operator vision obscured by damaged glass",
    standards: ["30 CFR 56.14103"],
    fixes: ["Replace windshield with safety glass", "Apply protective film"],
    engineeringControls: ["Laminated safety glass"],
    administrativeControls: ["Glass repair log"],
    ppe: [],
    severity: "low"
  },
  {
    category: "chemical",
    hazard: "Incompatible chemicals stored together (Acid/Base)",
    violation: "Failure to separate reactive materials",
    standards: ["29 CFR 1910.106", "30 CFR 56.4430"],
    fixes: ["Install segregated spill pallets", "Implement color-coded storage"],
    engineeringControls: ["Segregated storage cabinets"],
    administrativeControls: ["Compatibility matrix training"],
    ppe: [],
    severity: "high"
  },
  {
    category: "machine",
    hazard: "E-Stop button broken or inoperable",
    violation: "Controls shall be maintained in functional condition",
    standards: ["30 CFR 56.14100", "29 CFR 1910.212"],
    fixes: ["Replace e-stop switch assembly", "Verify control circuit integrity"],
    engineeringControls: ["Emergency stop buttons"],
    administrativeControls: ["E-stop functional testing (Weekly)"],
    ppe: [],
    severity: "critical"
  },
  {
    category: "electrical",
    hazard: "Overloaded power strip (Daisy-chained)",
    violation: "Flexible cords used as permanent wiring",
    standards: ["29 CFR 1910.303(b)(2)"],
    fixes: ["Install additional wall outlets", "Limit use of temporary strips"],
    engineeringControls: ["Fixed hard-wired outlets"],
    administrativeControls: ["Fire prevention policy"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "slip",
    hazard: "Snow accumulation on loading dock",
    violation: "Failure to provide safe access",
    standards: ["30 CFR 56.11001"],
    fixes: ["Apply ice-melt compound", "Shovel dock perimeter"],
    engineeringControls: ["Heated floor mats"],
    administrativeControls: ["Winter weather response plan"],
    ppe: ["Crampons/Ice cleats"],
    severity: "medium"
  },
  {
    category: "fall",
    hazard: "Worn safety harness webbing",
    violation: "Fall protection equipment with frayed/broken strands",
    standards: ["29 CFR 1910.140", "30 CFR 56.15005"],
    fixes: ["Destroy harness and replace", "Tag out equipment as UNSAFE"],
    engineeringControls: [],
    administrativeControls: ["Competent person harness inspection"],
    ppe: ["Full body harness"],
    severity: "critical"
  },
  {
    category: "fire",
    hazard: "Oxygen cylinder stored near fuel gas",
    violation: "Insufficient separation between reactive cylinders",
    standards: ["29 CFR 1910.253(b)(4)", "30 CFR 56.4600"],
    fixes: ["Separate by 20 feet", "Install 5-foot 1/2 hour fire wall"],
    engineeringControls: ["Fire-rated divider walls"],
    administrativeControls: ["Cylinder storage segregation policy"],
    ppe: [],
    severity: "high"
  },
  {
    category: "ppe",
    hazard: "Gloves caught in drill press spindle",
    violation: "Improper PPE choice for rotating hazard",
    standards: ["29 CFR 1910.138", "30 CFR 56.14107"],
    fixes: ["Remove gloves when operating drill", "Install spindle guard"],
    engineeringControls: ["Spindle guards"],
    administrativeControls: ["No-glove policy for drill presses"],
    ppe: ["Hand protection restricted"],
    severity: "high"
  },
  {
    category: "vehicle",
    hazard: "Worn tires on shop truck (Canvas showing)",
    violation: "Tires must be free of defects causing hazards",
    standards: ["30 CFR 56.14108"],
    fixes: ["Install new 10-ply tires", "Check alignment of axle"],
    engineeringControls: [],
    administrativeControls: ["Tire pressure and tread depth logs"],
    ppe: [],
    severity: "medium"
  },
  {
    category: "chemical",
    hazard: "Empty chemical drum not capped",
    violation: "Vapors escaping from empty hazardous containers",
    standards: ["29 CFR 1910.106", "30 CFR 56.4402"],
    fixes: ["Re-install bungs on empty drums", "Move to haz-waste pad"],
    engineeringControls: ["Sealed storage bungs"],
    administrativeControls: ["Drum disposal protocol"],
    ppe: [],
    severity: "low"
  },
  {
    category: "machine",
    hazard: "Power cord on hand drill missing strain relief",
    violation: "Electrical wiring not maintained to prevent hazards",
    standards: ["30 CFR 56.12004"],
    fixes: ["Install cord-grip fitting", "Replace drill with cordless unit"],
    engineeringControls: ["Strain relief fittings"],
    administrativeControls: ["Small tool check program"],
    ppe: [],
    severity: "low"
  }
];
