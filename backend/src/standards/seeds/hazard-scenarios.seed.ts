export type HazardScenarioSeed = {
  category: string;
  phrases: string[];
  citations: string[];
  recommendedAction: string;
};

export const hazardScenarioSeeds: HazardScenarioSeed[] = [
  {
    category: 'Access / Ladders / Platforms',
    phrases: ['damaged ladder', 'busted ladder', 'busted ladder rung', 'bent ladder side rail', 'broken ladder rung', 'loose ladder', 'unsafe ladder access', 'ladder rung', 'ladder side rail'],
    citations: ['30 CFR 56.11001'],
    recommendedAction: 'Remove the ladder from service and repair or replace it before use.',
  },
  {
    category: 'Access / Ladders / Platforms',
    phrases: ['missing handrail', 'loose handrail', 'broken stair rail', 'platform handrail damaged', 'open stair side'],
    citations: ['30 CFR 56.11001'],
    recommendedAction: 'Repair or install the required handrail/guardrail before allowing access.',
  },
  {
    category: 'Access / Ladders / Platforms',
    phrases: ['damaged grating', 'missing grating', 'hole in platform', 'catwalk floor opening', 'bad footing on deck'],
    citations: ['30 CFR 56.11001'],
    recommendedAction: 'Barricade the area and repair or replace damaged walking-working surface components.',
  },
  {
    category: 'Access / Ladders / Platforms',
    phrases: ['blocked access', 'unsafe access', 'bad access to screen deck', 'no safe access', 'poor access to crusher'],
    citations: ['30 CFR 56.11001'],
    recommendedAction: 'Provide and maintain safe access before work continues.',
  },
  {
    category: 'Guarding / Moving Parts',
    phrases: ['missing conveyor guard', 'tail pulley no guard', 'head pulley unguarded', 'return roller pinch point', 'unguarded belt'],
    citations: ['30 CFR 56.14107', '30 CFR 56.14109'],
    recommendedAction: 'Guard the moving parts or restrict access until guarding is installed.',
  },
  {
    category: 'Guarding / Moving Parts',
    phrases: ['crusher guard missing', 'unguarded coupling', 'rotating shaft exposed', 'gearbox coupling exposed', 'pinch point exposed'],
    citations: ['30 CFR 56.14107'],
    recommendedAction: 'Install guarding to prevent contact with moving machine parts.',
  },
  {
    category: 'Electrical',
    phrases: ['frayed cord', 'damaged extension cord', 'exposed wire', 'cord insulation cut', 'conductor showing'],
    citations: ['30 CFR 56.12004'],
    recommendedAction: 'Remove damaged electrical equipment from service and repair or replace it.',
  },
  {
    category: 'Electrical',
    phrases: ['open electrical panel', 'junction box cover missing', 'energized parts exposed', 'breaker panel open', 'electrical disconnect damaged'],
    citations: ['30 CFR 56.12004'],
    recommendedAction: 'Secure electrical enclosures and protect exposed conductors from contact or damage.',
  },
  {
    category: 'Housekeeping / Slips / Trips',
    phrases: ['oil spill on walkway', 'mud on travelway', 'loose aggregate trip hazard', 'hose across walkway', 'debris in work area'],
    citations: ['30 CFR 56.20003'],
    recommendedAction: 'Clean the area, remove trip hazards, and maintain orderly travelways.',
  },
  {
    category: 'Housekeeping / Slips / Trips',
    phrases: ['scrap metal clutter', 'trash around plant', 'stored material in walkway', 'blocked passageway', 'poor housekeeping'],
    citations: ['30 CFR 56.20003'],
    recommendedAction: 'Remove clutter and restore clean, orderly access through the area.',
  },
  {
    category: 'Mobile Equipment / Traffic',
    phrases: ['backup alarm not working', 'loader alarm silent', 'haul truck horn inoperative', 'warning device failed', 'beeper not working'],
    citations: ['30 CFR 56.14208', '30 CFR 56.14132'],
    recommendedAction: 'Remove equipment from service or repair warning devices before operation.',
  },
  {
    category: 'Mobile Equipment / Traffic',
    phrases: ['no seatbelt loader', 'seat belt broken', 'operator not wearing seatbelt', 'haul truck seatbelt missing', 'seatbelt inoperable'],
    citations: ['30 CFR 56.14131'],
    recommendedAction: 'Repair seat belt and require use before equipment operation.',
  },
  {
    category: 'Mobile Equipment / Traffic',
    phrases: ['berm missing haul road', 'low berm', 'road edge drop off', 'no berm at dump point', 'haul road no guardrail'],
    citations: ['30 CFR 56.9300'],
    recommendedAction: 'Install or repair berms/guardrails before allowing traffic near drop-offs.',
  },
  {
    category: 'Fire / Hot Work / Fuel',
    phrases: ['fire extinguisher missing', 'blocked extinguisher', 'extinguisher inspection tag missing', 'fire equipment not accessible', 'expired extinguisher'],
    citations: ['30 CFR 56.4600', '30 CFR 56.4201'],
    recommendedAction: 'Provide, inspect, and keep firefighting equipment accessible.',
  },
  {
    category: 'Fire / Hot Work / Fuel',
    phrases: ['hot work near fuel', 'welding near combustibles', 'torch sparks near oil', 'flammable liquid stored improperly', 'fuel leak near heat source'],
    citations: ['30 CFR 56.4500', '30 CFR 56.4531', '30 CFR 56.4102'],
    recommendedAction: 'Remove combustibles, control ignition sources, and follow hot-work/fire prevention controls.',
  },
  {
    category: 'PPE',
    phrases: ['no hard hat', 'missing hardhat', 'no head protection', 'falling object hazard no hard hat', 'operator without helmet'],
    citations: ['30 CFR 56.15002'],
    recommendedAction: 'Require suitable head protection in the affected area.',
  },
  {
    category: 'PPE',
    phrases: ['grinding no face shield', 'cutting no safety glasses', 'flying particles no goggles', 'eye protection missing', 'face shield not worn'],
    citations: ['30 CFR 56.15020'],
    recommendedAction: 'Require suitable eye and face protection before the task continues.',
  },
  {
    category: 'PPE',
    phrases: ['no steel toe boots', 'foot protection missing', 'crushing hazard no boots', 'protective footwear not worn', 'boots damaged'],
    citations: ['30 CFR 56.15003'],
    recommendedAction: 'Require suitable protective footwear for the hazard exposure.',
  },
  {
    category: 'Dust / Respiratory / Noise',
    phrases: ['dust cloud crusher', 'silica dust screen plant', 'respirable dust exposure', 'baghouse dust leak', 'no respirator dusty area'],
    citations: ['30 CFR 56.5001', '30 CFR 56.5005'],
    recommendedAction: 'Control airborne contaminants using dust suppression, ventilation, or respiratory protection as appropriate.',
  },
  {
    category: 'Dust / Respiratory / Noise',
    phrases: ['too loud near screen', 'no hearing protection', 'crusher noise high', 'employees exposed to loud noise', 'ear plugs not worn'],
    citations: ['30 CFR 56.5050'],
    recommendedAction: 'Evaluate noise exposure and require hearing protection or other controls where needed.',
  },
  {
    category: 'Fall Protection',
    phrases: ['open edge no fall protection', 'no harness elevated platform', 'working at height no tie off', 'unprotected edge', 'fall hazard on platform'],
    citations: ['30 CFR 56.15004'],
    recommendedAction: 'Provide fall protection and restrict exposure to open edges or elevated work hazards.',
  },
  {
    category: 'Lockout / Energy Isolation',
    phrases: ['no lockout clearing crusher jam', 'maintenance without lockout', 'power not isolated', 'repair while energized', 'unexpected startup hazard'],
    citations: ['30 CFR 56.14105'],
    recommendedAction: 'Stop work and apply lockout/energy isolation before maintenance or jam-clearing continues.',
  },
  {
    category: 'Materials Handling / Storage',
    phrases: ['oxygen cylinder unsecured', 'acetylene bottle not chained', 'gas cylinder laying down', 'torch bottle unsecured', 'compressed gas cylinder falling hazard'],
    citations: ['30 CFR 56.16005', '30 CFR 56.4601'],
    recommendedAction: 'Secure cylinders upright and protect them from damage or falling.',
  },
  {
    category: 'Materials Handling / Storage',
    phrases: ['hopper engulfment hazard', 'surge pile draw hole', 'material bridged in bin', 'unsafe feed hopper', 'stockpile drawpoint exposure'],
    citations: ['30 CFR 56.16002'],
    recommendedAction: 'Control access and use safe procedures around bins, hoppers, surge piles, and material flow hazards.',
  },
  {
    category: 'Emergency / First Aid',
    phrases: ['first aid kit missing', 'stretcher missing', 'emergency supplies unavailable', 'no first aid materials', 'medical supplies not available'],
    citations: ['30 CFR 56.15001', '30 CFR 56.17002'],
    recommendedAction: 'Provide required first-aid materials and emergency response arrangements.',
  },
  {
    category: 'Emergency / First Aid',
    phrases: ['poor lighting work area', 'dark walkway', 'night work no lights', 'insufficient illumination', 'no lighting on platform'],
    citations: ['30 CFR 56.17001'],
    recommendedAction: 'Provide adequate illumination before work or travel continues.',
  },
];
