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
  const is1910Citation = /29 cfr 1910\./.test(normalizedCitation);
  const is1926Citation = /29 cfr 1926\./.test(normalizedCitation);

  if (oshaGeneralMode && is1910Citation) domainScore += 90;
  if (oshaGeneralMode && is1926Citation) domainScore -= 220;
  if (oshaConstructionMode && is1926Citation) domainScore += 90;
  if (oshaConstructionMode && is1910Citation) domainScore -= 120;

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
