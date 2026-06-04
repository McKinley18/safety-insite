type DomainScoringInput = {
  normalizedQuery: string;
  haystack: string;
  heading: string;
  title: string;
  citation: string;
  normalizedCitation: string;
  sourceType: string;
  agencyMode?: string;
};

export function scoreKnowledgeDomainAlignment(input: DomainScoringInput) {
  const {
    normalizedQuery,
    haystack,
    heading,
    title,
    citation,
    normalizedCitation,
    sourceType,
    agencyMode,
  } = input;

  let domainScore = 0;

  const headingAndTitle = `${heading} ${title}`;
  const regulatoryChunk = sourceType === "regulation";

  const oshaGeneralMode = agencyMode === "osha_general";
  const oshaConstructionMode = agencyMode === "osha_construction";
  const mshaMode = agencyMode === "msha" || String(agencyMode || "").startsWith("msha_");

  const isOshaCitation = /29 cfr\s+(1910|1926)\./.test(normalizedCitation);
  const is1910Citation = /29 cfr 1910\./.test(normalizedCitation);
  const is1926Citation = /29 cfr 1926\./.test(normalizedCitation);

  const isMshaCitation = /30 cfr\s+(56|57|75|77)\./.test(normalizedCitation);
  const isMsha56Citation = /30 cfr 56\./.test(normalizedCitation);
  const isMsha57Citation = /30 cfr 57\./.test(normalizedCitation);
  const isMsha75Citation = /30 cfr 75\./.test(normalizedCitation);
  const isMsha77Citation = /30 cfr 77\./.test(normalizedCitation);

  if (oshaGeneralMode && is1910Citation) domainScore += 90;
  if (oshaGeneralMode && is1926Citation) domainScore -= 220;
  if (oshaConstructionMode && is1926Citation) domainScore += 90;
  if (oshaConstructionMode && is1910Citation) domainScore -= 120;

  if (mshaMode && isMshaCitation) domainScore += 160;
  if (mshaMode && isOshaCitation) domainScore -= 320;

  if (agencyMode === "msha_mnm_surface") {
    if (isMsha56Citation) domainScore += 220;
    if (isMsha57Citation || isMsha75Citation || isMsha77Citation) domainScore -= 140;
  }

  if (agencyMode === "msha_mnm_underground") {
    if (isMsha57Citation) domainScore += 220;
    if (isMsha56Citation || isMsha75Citation || isMsha77Citation) domainScore -= 140;
  }

  if (agencyMode === "msha_coal_underground") {
    if (isMsha75Citation) domainScore += 220;
    if (isMsha56Citation || isMsha57Citation || isMsha77Citation) domainScore -= 140;
  }

  if (agencyMode === "msha_coal_surface") {
    if (isMsha77Citation) domainScore += 220;
    if (isMsha56Citation || isMsha57Citation || isMsha75Citation) domainScore -= 140;
  }

  const machineGuardingQuery =
    /(machine guarding|unguarded|guard|guarding|moving parts|rotating parts|conveyor|pulley|pinch point|nip point|drive|shaft|sprocket|chain|belt)/.test(
      normalizedQuery,
    );

  const mobileEquipmentQuery =
    /(mobile equipment|haul truck|loader|forklift|traffic|pedestrian|backing|spotter|berm|blind spot|vehicle|truck)/.test(
      normalizedQuery,
    );

  const lotoQuery =
    /(lockout|tagout|loto|deenergized|zero energy|maintenance|servicing|repair|jam clearing|troubleshooting)/.test(
      normalizedQuery,
    );

  const fallQuery =
    /(fall protection|fall hazard|unprotected edge|ladder|scaffold|platform|roof|guardrail|opening|elevated work)/.test(
      normalizedQuery,
    );

  const confinedSpaceQuery =
    /(confined space|permit required confined space|permit-required confined space|tank|vessel|silo|pit|vault|manhole|atmospheric testing|engulfment)/.test(
      normalizedQuery,
    );

  const electricalQuery =
    /(electrical|energized|conductor|conductors|panel|breaker|wiring|cord|grounding|arc flash|overcurrent|junction box|exposed live parts|live parts|clearance)/.test(
      normalizedQuery,
    );

  const strongFallCitation =
    /29 cfr 1910\.(28|29|30|140)|29 cfr 1926\.(500|501|502|503|451|1053)/.test(
      citation,
    );

  const fallHeading =
    /(fall protection|fall protection systems|walking-working surfaces|duty to have fall protection|unprotected sides and edges|scaffolds|ladders|stairways|guardrail)/.test(
      headingAndTitle,
    );

  const unrelatedFallHeading =
    /(respiratory protection|air contaminants|asbestos|permit-required confined spaces|pulp, paper|electric power generation|welding|flammable liquids|sanitation|fire brigades)/.test(
      headingAndTitle,
    );

  const strongMachineGuardingCitation =
    /30 cfr 5[67]\.14|30 cfr 77\.400|29 cfr 1910\.21[12789]|29 cfr 1926\.30[047]/.test(
      citation,
    );

  const machineGuardingHeading =
    /(machine guarding|guarding|mechanical equipment guards|moving machine parts|power-transmission|abrasive wheel|conveyor|pulley|rotating shaft|pinch point|nip point)/.test(
      headingAndTitle,
    );

  const unrelatedMachineGuardingHeading =
    /(fall protection|respiratory protection|confined spaces|sanitation|fire protection|medical services|air contaminants)/.test(
      headingAndTitle,
    );

  const strongLotoCitation =
    /29 cfr 1910\.147|29 cfr 1926\.417|30 cfr 5[67]\.12016|30 cfr 77\.500|30 cfr 75\.511/.test(
      citation,
    );

  const lotoHeading =
    /(control of hazardous energy|lockout|tagout|de-energization|deenergization|deenergized|locked out|stored energy|unexpected startup|maintenance and servicing)/.test(
      headingAndTitle,
    );

  const unrelatedLotoHeading =
    /(fall protection|respiratory protection|confined spaces|walking-working surfaces|stairways|ladders|grain handling|pulp, paper|commercial diving|medical services|sanitation)/.test(
      headingAndTitle,
    );

  const strongConfinedSpaceCitation =
    /29 cfr 1910\.146|29 cfr 1926\.120[1-9]/.test(citation);

  const confinedSpaceHeading =
    /(confined space|permit-required confined space|permit required confined space|entry permit|atmospheric testing|authorized entrant|attendant)/.test(
      headingAndTitle,
    );

  const unrelatedConfinedSpaceHeading =
    /(fall protection|machine guarding|respiratory protection|welding|fire protection|electrical|materials handling)/.test(
      headingAndTitle,
    );

  const strongElectricalCitation =
    /29 cfr 1910\.(30[3-5]|33[2-5])|29 cfr 1926\.(40[0-9]|41[0-9]|43[0-2])/.test(
      citation,
    );

  const electricalHeading =
    /(electrical|wiring|grounding|conductors|live parts|energized|panel|switchboards|overcurrent|general requirements|selection and use of work practices)/.test(
      headingAndTitle,
    );

  const unrelatedElectricalHeading =
    /(fall protection|confined spaces|machine guarding|respiratory protection|walking-working surfaces|stairways|ladders|grain handling|loading and haulage)/.test(
      headingAndTitle,
    );

  if (
    agencyMode === "osha_construction" &&
    /(fall protection|open side|open edge|unprotected|guardrail|safety net|personal fall arrest|lower level|walking working surface)/.test(
      normalizedQuery,
    )
  ) {
    if (/29 cfr 1926\.501$|^1926\.501$/.test(citation)) {
      domainScore += 1400;
    }

    if (/29 cfr 1926\.502$|^1926\.502$/.test(citation)) {
      domainScore += 450;
    }

    if (
      regulatoryChunk &&
      /1926\.307|mechanical power-transmission apparatus|tools - hand and power|1926\.1050|stairways and ladders/.test(
        haystack,
      )
    ) {
      domainScore -= 520;
    }
  }

  if (
    agencyMode === "msha_mnm_underground" &&
    /(lockout|locked out|tagged|deenergized|de-energized|electrically powered equipment|mechanical work|repair)/.test(
      normalizedQuery,
    )
  ) {
    if (/30 cfr 57\.12016$|^57\.12016$/.test(citation)) {
      domainScore += 1400;
    }

    if (/30 cfr 57\.12017$|^57\.12017$/.test(citation)) {
      domainScore += 500;
    }

    if (
      regulatoryChunk &&
      /57\.12027|grounding mobile equipment|56\.12016|75\.511|77\./.test(
        haystack,
      )
    ) {
      domainScore -= 520;
    }
  }

  if (
    agencyMode === "msha_mnm_surface" &&
    /(lockout|locked out|tagged|deenergized|de-energized|electrically powered equipment|mechanical work|repair)/.test(
      normalizedQuery,
    )
  ) {
    if (/30 cfr 56\.12016$|^56\.12016$/.test(citation)) {
      domainScore += 1400;
    }

    if (/30 cfr 56\.12017$|^56\.12017$/.test(citation)) {
      domainScore += 500;
    }

    if (
      regulatoryChunk &&
      /56\.12027|grounding mobile equipment|57\.12016|75\.511|77\./.test(
        haystack,
      )
    ) {
      domainScore -= 520;
    }
  }

  if (
    agencyMode === "msha_coal_underground" &&
    /(machine guarding|unguarded|guard|guarding|moving machine parts|moving parts|conveyor|pulley|drive pulley|tail pulley|head pulley|sprocket|chain|shaft)/.test(
      normalizedQuery,
    )
  ) {
    if (/30 cfr 75\.1722$|^75\.1722$/.test(citation)) {
      domainScore += 1600;
    }

    if (
      regulatoryChunk &&
      /75\.1728|power-driven pulleys|56\.14107|57\.14107|77\.400/.test(
        haystack,
      )
    ) {
      domainScore -= 620;
    }
  }

  if (machineGuardingQuery) {
    if (
      /(machine guarding|unguarded moving parts|moving machine parts|pinch point|entanglement|conveyor|pulley|rotating shaft|guarding)/.test(
        haystack,
      )
    ) {
      domainScore += 80;
    }

    if (machineGuardingHeading) domainScore += 90;
    if (strongMachineGuardingCitation) domainScore += 120;
    if (regulatoryChunk && unrelatedMachineGuardingHeading) domainScore -= 90;

    if (
      /mobile equipment|haul truck|loader|forklift|pedestrian|traffic|backing|spotter|berm|blind spot/.test(
        haystack,
      ) &&
      !mobileEquipmentQuery
    ) {
      domainScore -= 60;
    }

    if (
      /fall hazard|fall protection|guardrail|ladder|scaffold|roof|unprotected edge/.test(
        haystack,
      ) &&
      !fallQuery
    ) {
      domainScore -= 45;
    }

    if (
      /lockout tagout|hazardous energy|zero energy|unexpected startup/.test(
        haystack,
      ) &&
      !lotoQuery
    ) {
      domainScore -= 35;
    }
  }

  if (
    mobileEquipmentQuery &&
    /mobile equipment|haul truck|loader|forklift|pedestrian|traffic|backing|spotter|berm|blind spot/.test(
      haystack,
    )
  ) {
    domainScore += 70;
  }

  if (lotoQuery) {
    if (
      /lockout tagout|lockout|tagout|hazardous energy|zero energy|unexpected startup|stored energy|deenergized|de-energized|servicing|maintenance/.test(
        haystack,
      )
    ) {
      domainScore += 80;
    }

    if (lotoHeading) domainScore += 110;
    if (strongLotoCitation) domainScore += 160;
    if (regulatoryChunk && unrelatedLotoHeading) domainScore -= 120;

    if (
      regulatoryChunk &&
      /electric power generation|transmission|distribution|grain handling|pulp, paper|commercial diving/.test(
        headingAndTitle,
      ) &&
      !/1910\.147|control of hazardous energy|lockout|tagout/.test(haystack)
    ) {
      domainScore -= 90;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /30 cfr 75\.511|75\.511|disconnecting devices|locked out|tagged|electrical work|power circuits/.test(
        haystack,
      )
    ) {
      domainScore += 520;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /30 cfr 75\.511$|^75\.511$/.test(citation)
    ) {
      domainScore += 1800;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /30 cfr 75\.511-1|75\.511-1/.test(citation)
    ) {
      domainScore += 900;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      /locked out|tagged|deenergized|de-energized|disconnecting devices|power circuits/.test(
        normalizedQuery,
      ) &&
      /work on electrically-powered equipment|work on power circuits|30 cfr 56\.12016|56\.12016|30 cfr 57\.12016|57\.12016|30 cfr 56\.12017|56\.12017|30 cfr 57\.12017|57\.12017/.test(
        haystack,
      )
    ) {
      domainScore -= 700;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      regulatoryChunk &&
      /75\.705-2|75\.821|75\.1910|75\.505|75\.506|75\.501-1|75\.1003-2|56\.12006|77\.808|repairs to energized surface high-voltage lines|surface high-voltage lines|testing, examination and maintenance|diesel-powered equipment|nonpermissible diesel-powered equipment|electrical system design and performance|permissible electric face equipment|coal seams above the water table|off-track mining equipment|distribution boxes|disconnecting devices/.test(
        haystack,
      )
    ) {
      domainScore -= 720;
    }

    if (
      agencyMode === "msha_coal_underground" &&
      regulatoryChunk &&
      /parking brakes|brakes|braking/.test(headingAndTitle)
    ) {
      domainScore -= 320;
    }
  }

  if (fallQuery) {
    if (
      /fall hazard|fall protection|guardrail|ladder|scaffold|roof|unprotected edge/.test(
        haystack,
      )
    ) {
      domainScore += 70;
    }

    if (fallHeading) domainScore += 100;
    if (strongFallCitation) domainScore += 140;
    if (regulatoryChunk && unrelatedFallHeading) domainScore -= 130;
  }

  if (confinedSpaceQuery) {
    if (
      /confined space|permit-required confined space|permit required confined space|atmospheric testing|engulfment|authorized entrant|attendant|entry permit/.test(
        haystack,
      )
    ) {
      domainScore += 80;
    }

    if (confinedSpaceHeading) domainScore += 100;
    if (strongConfinedSpaceCitation) domainScore += 140;
    if (regulatoryChunk && unrelatedConfinedSpaceHeading) domainScore -= 120;
  }

  if (electricalQuery) {
    if (
      /electrical|energized|conductor|conductors|panel|breaker|wiring|cord|grounding|arc flash|overcurrent|live parts|junction box|clearance/.test(
        haystack,
      )
    ) {
      domainScore += 85;
    }

    if (electricalHeading) domainScore += 115;
    if (strongElectricalCitation) domainScore += 170;
    if (regulatoryChunk && unrelatedElectricalHeading) domainScore -= 120;
  }

  return domainScore;
}
