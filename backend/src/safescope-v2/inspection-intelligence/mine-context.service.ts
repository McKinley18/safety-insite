import { MineContextAssessment, MineType } from './mine-context.types';

type SignalGroup = { label: string; patterns: RegExp[] };

const GROUPS: Record<string, SignalGroup> = {
  nonMine: { label: 'explicit non-mine workplace', patterns: [/\bnon[- ]mine\b/, /\boff mine property\b/, /\bnot (at|on) (a )?mine\b/] },
  lexicalTrap: { label: 'non-mining lexical use', patterns: [/\bquarry tile\b/, /\bmine the data\b/, /\bdata mining\b/, /\btext mining\b/, /\baggregate data\b/, /\bpit stop\b/, /\binspection pit\b/, /\bcoal tar\b/, /\bcoal[- ]colored\b/] },
  mine: { label: 'mine context', patterns: [/\bmine(r|rs| site| property| operation)?\b/, /\bmining operation\b/, /\bmine contractor\b/, /\bmsha\b/] },
  aggregate: { label: 'aggregate/quarry context', patterns: [/\baggregate (mine|plant|operation|crusher|screen)\b/, /\bquarry\b/, /\bgravel pit\b/, /\bsand and gravel\b/, /\bsurface stone\b/, /\bcrusher plant\b/, /\bscreen(ing)? plant\b/] },
  underground: { label: 'underground context', patterns: [/\bunderground\b/, /\bheading\b/, /\bdrift\b/, /\bstope\b/, /\bshaft station\b/, /\bportal to heading\b/, /\b(msha_mnm_underground|msha_coal_underground)\b/] },
  surface: { label: 'surface context', patterns: [/\bsurface mine\b/, /\bsurface coal\b/, /\bsurface operation\b/, /\bopen[- ]pit\b/, /\bquarry\b/, /\baggregate (plant|crusher|screen)\b/, /\bcrusher plant\b/, /\bscreen(ing)? plant\b/, /\bdump point\b/, /\bhighwall\b/, /\b(msha_mnm_surface|msha_coal_surface)\b/] },
  coal: { label: 'coal context', patterns: [/\bcoal mine\b/, /\bcoal seam\b/, /\bcoal rib\b/, /\bcontinuous miner\b/, /\blongwall\b/, /\bshuttle car\b/, /\bbituminous\b/, /\banthracite\b/, /\b(msha_coal_surface|msha_coal_underground)\b/] },
  metalNonmetal: { label: 'metal/nonmetal context', patterns: [/\bmetal[ /-]?nonmetal\b/, /\bm\/nm\b/, /\bmetal mine\b/, /\bnonmetal mine\b/, /\bhard rock mine\b/, /\bore mine\b/, /\b(msha_mnm_surface|msha_mnm_underground)\b/] },
  contractor: { label: 'mine contractor context', patterns: [/\bcontractor\b/, /\bindependent contractor\b/, /\bservice (worker|crew|technician)\b/, /\bvendor\b/] },
};

function matches(text: string, group: SignalGroup): boolean {
  return group.patterns.some((pattern) => pattern.test(text));
}

export class MineContextService {
  assess(value: string): MineContextAssessment {
    const text = String(value || '').toLowerCase();
    const matched = Object.entries(GROUPS)
      .filter(([, group]) => matches(text, group))
      .map(([key, group]) => ({ key, label: group.label }));
    const has = (key: string) => matched.some((item) => item.key === key);

    if (has('nonMine')) return this.notMine(matched.map((item) => item.label));
    if (
      has('lexicalTrap')
      && !/\b(mine site|mine property|mine operation|at (a |the )?mine|surface (coal|metal|nonmetal)? ?mine|underground (coal|metal|nonmetal)? ?mine|quarry operation|aggregate mine)\b/.test(text)
    ) return this.notMine(matched.map((item) => item.label));

    const detected = has('mine') || has('aggregate') || (has('underground') && (has('coal') || has('metalNonmetal')));
    if (!detected) return this.notMine([]);

    let mineType: MineType = 'unclear_mine';
    if (has('coal') && has('underground')) mineType = 'underground_coal';
    else if (has('coal') && has('surface')) mineType = 'surface_coal';
    else if (has('coal')) mineType = 'unclear_mine';
    else if (has('underground')) mineType = 'underground_metal_nonmetal';
    else if (has('aggregate') || has('surface') || has('metalNonmetal')) mineType = 'surface_metal_nonmetal';

    const preferredCfrParts: Record<MineType, string[]> = {
      surface_metal_nonmetal: ['56'],
      underground_metal_nonmetal: ['57'],
      surface_coal: ['77'],
      underground_coal: ['75'],
      unclear_mine: [],
      not_mine: [],
    };
    const typeLabels: Record<MineType, string> = {
      surface_metal_nonmetal: 'surface metal/nonmetal or aggregate operation',
      underground_metal_nonmetal: 'underground metal/nonmetal operation',
      surface_coal: 'surface coal operation',
      underground_coal: 'underground coal operation',
      unclear_mine: 'mine with unclear commodity or surface/underground status',
      not_mine: 'non-mine workplace',
    };
    const evidenceQuestions = mineType === 'unclear_mine'
      ? ['Is this surface metal/nonmetal, underground metal/nonmetal, surface coal, or underground coal, and what work area is involved?']
      : [`Confirm the operation is a ${typeLabels[mineType]} and identify the active work area and task.`];
    const citationLimitations = mineType === 'unclear_mine'
      ? ['Mine type is unclear; Part 56, 57, 75, or 77 applicability cannot be selected defensibly.']
      : [];

    return {
      detected: true,
      mineType,
      confidence: mineType === 'unclear_mine' ? 'moderate' : 'high',
      matchedSignals: matched.map((item) => item.label),
      reasons: [`Detected ${typeLabels[mineType]} context from mining-specific site and commodity signals.`],
      preferredCfrParts: preferredCfrParts[mineType],
      evidenceQuestions,
      citationLimitations,
      contractorContext: has('contractor'),
    };
  }

  private notMine(matchedSignals: string[]): MineContextAssessment {
    return {
      detected: false,
      mineType: 'not_mine',
      confidence: matchedSignals.length > 0 ? 'high' : 'low',
      matchedSignals,
      reasons: matchedSignals.length > 0 ? ['Explicit non-mine context was detected.'] : ['No reusable mine-context signal was detected.'],
      preferredCfrParts: [],
      evidenceQuestions: [],
      citationLimitations: [],
      contractorContext: false,
    };
  }
}
