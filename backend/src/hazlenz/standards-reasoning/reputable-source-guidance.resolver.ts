export interface ReputableSupplement {
  standard: string;
  agency: string;
  guidanceText: string;
}

export class ReputableSourceGuidanceResolver {
  private static readonly database: {
    citations: Record<string, ReputableSupplement>;
    domains: Record<string, ReputableSupplement>;
  } = {
    citations: {
      '1910.212': {
        standard: 'ANSI B11.19',
        agency: 'ANSI (American National Standards Institute)',
        guidanceText: 'ANSI B11.19 provides performance requirements for risk reduction measures, recommending interlocked barrier guards for any guard opened more than once per shift.'
      },
      '56.14107': {
        standard: 'ISO 13857 / ANSI B11.19',
        agency: 'ISO / ANSI Consensus Standards',
        guidanceText: 'Consensus standards mandate safety distances to prevent hazard zone contact by upper and lower limbs. Conveyor pulley guards must prevent any finger reach around or through barrier mesh.'
      },
      '1910.147': {
        standard: 'ANSI/ASSP Z244.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'ANSI/ASSP Z244.1 governs hazardous energy control. It requires formal risk assessments and documented alternative safety controls if full LOTO cannot be executed during active diagnostics.'
      },
      '56.12017': {
        standard: 'ANSI/ASSP Z244.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'Consensus energy control requires physical locking of isolation switches. Warning tags are administrative and must only supplement physical locks.'
      },
      '1910.28': {
        standard: 'ANSI/ASSP Z359.1 Fall Protection Code',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'ANSI/ASSP Z359 Fall Protection Code mandates anchorage points to withstand a minimum static load of 5,000 lbs per employee for active fall arrest.'
      },
      '56.15005': {
        standard: 'ANSI/ASSP Z359.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'Advisory guidelines mandate safety lifelines to maintain continuous fall-clearance calculations, ensuring deceleration distances do not exceed structural limits.'
      },
      '1910.146': {
        standard: 'ANSI/ASSP Z117.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'ANSI/ASSP Z117.1 sets safety requirements for confined spaces. It requires continuous atmospheric monitoring, active positive-pressure ventilation, and dedicated standby rescue assets.'
      },
      '1910.303': {
        standard: 'NFPA 70E Standard for Electrical Safety',
        agency: 'NFPA (National Fire Protection Association)',
        guidanceText: 'NFPA 70E mandates arc flash boundary calculations and sets strict safe-approach boundaries for energized parts. Frayed cords must be de-energized immediately.'
      },
      '1910.1200': {
        standard: 'NIOSH Pocket Guide to Chemical Hazards',
        agency: 'NIOSH (National Institute for Occupational Safety and Health)',
        guidanceText: 'NIOSH guidelines establish rigorous threshold limit values (TLVs) and recommend immediate localized exhaust, chemical-resistant gloves, and eyewashes for secondary solvent decanting.'
      }
    },
    domains: {
      'machine_guarding': {
        standard: 'ANSI B11.19',
        agency: 'ANSI (American National Standards Institute)',
        guidanceText: 'General machine safety consensus standards require physical barriers to prevent entry to point-of-operation hazards.'
      },
      'lockout_tagout': {
        standard: 'ANSI/ASSP Z244.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'Consensus standards mandate zero-energy verification before any worker places body parts inside a machine envelope.'
      },
      'fall_protection': {
        standard: 'ANSI/ASSP Z359.1',
        agency: 'ANSI/ASSP (American Society of Safety Professionals)',
        guidanceText: 'Advisory guidelines require complete body harness systems with integrated deceleration lanyards when working above 4 feet.'
      },
      'electrical': {
        standard: 'NFPA 70E',
        agency: 'NFPA (National Fire Protection Association)',
        guidanceText: 'Electrical safe-work practices require visual inspections of insulation, ground pins, and connections prior to energization.'
      }
    }
  };

  /**
   * Resolves reputable advisory guidance for a given regulatory citation or domain
   */
  public resolve(citation: string, domain?: string): ReputableSupplement | null {
    const cleanCitation = String(citation || '').toLowerCase();
    
    // 1. Direct Citation Match
    for (const key of Object.keys(ReputableSourceGuidanceResolver.database.citations)) {
      if (cleanCitation.includes(key)) {
        return ReputableSourceGuidanceResolver.database.citations[key];
      }
    }

    // 2. Domain Match Fallback
    if (domain && ReputableSourceGuidanceResolver.database.domains[domain]) {
      return ReputableSourceGuidanceResolver.database.domains[domain];
    }

    return null;
  }
}
