import * as fs from 'fs';
import * as path from 'path';

type SourceRegisterEntry = {
  sourceTitle?: string;
  sourceUrl?: string;
  agency?: string;
  sourceType?: string;
  dateAccessed?: string;
  topic?: string;
  reliabilityTier?: string;
  usedInStructuredOutput?: boolean;
  notes?: string;
};

type SourceMod = {
  modId: string;
  modName: string;
  purpose?: string;
  sourceAuthority?: string;
  allowedDomains?: string[];
  allowedSourceTypes?: string[];
  authorityTier?: string;
  startingUrls?: string[];
  searchBoundaries?: {
    allowedHostnames?: string[];
    disallowedContent?: string[];
  };
  extractionTargets?: string[];
  forbiddenBehavior?: string[];
  defaults?: {
    reviewStatus?: string;
    approvedForUse?: boolean;
    sourceBoundary?: string;
    jurisdiction?: string;
  };
  batchControls?: {
    maxRecordsPerRun?: number;
    minSourcesPerDomain?: number;
    continueUntilCoverageComplete?: boolean;
    stopOnlyWhen?: string[];
  };
};

const requiredTopics = [
  'Machine Guarding',
  'Lockout/Tagout',
  'Fall Protection',
  'Electrical',
  'Excavation',
  'Confined Spaces',
  'HazCom',
  'Exposure Assessment',
  'Noise',
  'Respirable Silica',
  'Heat Stress',
  'Mobile Equipment',
  'Powered Haulage',
  'Ground Control',
  'Corrective Actions',
  'Evidence Sufficiency',
];

const registerPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/source-register/source-register.seed.json',
);

const sourceModsDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/source-mods',
);

const reportPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/reports/knowledge-coverage-report.json',
);

function normalize(value: string | undefined): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, ' ')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ');
}

function compactKey(value: string | undefined): string {
  return normalize(value).replace(/\s+/g, '');
}

function domainToTopic(domain: string): string {
  const lookup: Record<string, string> = {
    machineguarding: 'Machine Guarding',
    lockouttagout: 'Lockout/Tagout',
    fallprotection: 'Fall Protection',
    electrical: 'Electrical',
    confinedspace: 'Confined Spaces',
    hazardcommunication: 'HazCom',
    hazcom: 'HazCom',
    excavation: 'Excavation',
    noise: 'Noise',
    respirablesilica: 'Respirable Silica',
    respirabledust: 'Respirable Silica',
    heatstress: 'Heat Stress',
    mobileequipment: 'Mobile Equipment',
    poweredhaulage: 'Powered Haulage',
    groundcontrol: 'Ground Control',
    correctiveactions: 'Corrective Actions',
    evidencesufficiency: 'Evidence Sufficiency',
    industrialhygienesampling: 'Exposure Assessment',
    chemicalexposure: 'Exposure Assessment',
    respiratoryprotection: 'Exposure Assessment',
    weldingfume: 'Exposure Assessment',
    dust: 'Exposure Assessment',
    asbestos: 'Exposure Assessment',
    lead: 'Exposure Assessment',
    confinedspaceatmosphere: 'Confined Spaces',
    ergonomics: 'Corrective Actions',
    ppe: 'Corrective Actions',
    walkingworkingsurfaces: 'Fall Protection',
    poweredindustrialtrucks: 'Mobile Equipment',
    workingsurfaces: 'Fall Protection',
    berms: 'Powered Haulage',
    highwall: 'Ground Control',
    materialhandling: 'Mobile Equipment',
    fireprotection: 'Corrective Actions',
    training: 'Evidence Sufficiency',
  };

  return lookup[compactKey(domain)] || domain;
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

function getSourceMods(): SourceMod[] {
  if (!fs.existsSync(sourceModsDir)) return [];

  return fs
    .readdirSync(sourceModsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readJson<SourceMod>(path.join(sourceModsDir, file)));
}

function sourceMatchesTopic(entry: SourceRegisterEntry, topic: string): boolean {
  return compactKey(entry.topic) === compactKey(topic);
}

function sourceMatchesMod(entry: SourceRegisterEntry, mod: SourceMod): boolean {
  const agency = normalize(entry.agency);
  const authority = normalize(mod.sourceAuthority);
  const allowedTypes = (mod.allowedSourceTypes || []).map(compactKey);

  const sourceTypeKey = compactKey(entry.sourceType);
  const reliabilityKey = compactKey(entry.reliabilityTier);

  const inferredTypeKeys = new Set<string>([
    sourceTypeKey,
    reliabilityKey,
  ]);

  if (sourceTypeKey === 'regulation') {
    inferredTypeKeys.add('cfr');
    inferredTypeKeys.add('federalregulation');
  }

  if (sourceTypeKey === 'guidance') {
    inferredTypeKeys.add('policymanual');
    inferredTypeKeys.add('expertreference');
    inferredTypeKeys.add('technicalstandard');
    inferredTypeKeys.add('governmentguidance');
  }

  if (reliabilityKey === 'regulatory') {
    inferredTypeKeys.add('cfr');
    inferredTypeKeys.add('federalregulation');
  }

  if (reliabilityKey === 'governmentguidance') {
    inferredTypeKeys.add('policymanual');
    inferredTypeKeys.add('expertreference');
    inferredTypeKeys.add('technicalstandard');
  }

  const authorityMatch =
    !authority ||
    agency.includes(authority) ||
    authority.includes(agency) ||
    (authority.includes('niosh') && (agency.includes('niosh') || agency.includes('cdc'))) ||
    (authority.includes('msha') && agency.includes('msha')) ||
    (authority.includes('osha') && agency.includes('osha'));

  const typeMatch =
    !allowedTypes.length ||
    allowedTypes.some((allowedType) => inferredTypeKeys.has(allowedType));

  return authorityMatch && typeMatch;
}

function getStatus(sourceCount: number, minSources: number): 'strong' | 'partial' | 'missing' {
  if (sourceCount >= minSources) return 'strong';
  if (sourceCount >= 1) return 'partial';
  return 'missing';
}

const entries = readJson<SourceRegisterEntry[]>(registerPath);
const sourceMods = getSourceMods();

const globalCoverage = requiredTopics.map((topic) => {
  const matches = entries.filter((entry) => sourceMatchesTopic(entry, topic));
  const regulatorySources = matches.filter((entry) => normalize(entry.reliabilityTier).includes('regulatory'));
  const guidanceSources = matches.filter((entry) => normalize(entry.reliabilityTier).includes('guidance'));

  return {
    topic,
    sourceCount: matches.length,
    regulatorySourceCount: regulatorySources.length,
    guidanceSourceCount: guidanceSources.length,
    status: getStatus(matches.length, 3),
    sources: matches.map((entry) => ({
      sourceTitle: entry.sourceTitle,
      agency: entry.agency,
      sourceType: entry.sourceType,
      reliabilityTier: entry.reliabilityTier,
      sourceUrl: entry.sourceUrl,
    })),
  };
});

const modCoverage = sourceMods.map((mod) => {
  const minSourcesPerDomain = mod.batchControls?.minSourcesPerDomain || 3;

  const domains = (mod.allowedDomains || []).map((domain) => {
    const mappedTopic = domainToTopic(domain);

    const matches = entries.filter(
      (entry) =>
        sourceMatchesTopic(entry, mappedTopic) &&
        sourceMatchesMod(entry, mod),
    );

    const status = getStatus(matches.length, minSourcesPerDomain);

    return {
      domain,
      mappedTopic,
      sourceCount: matches.length,
      minSourcesRequired: minSourcesPerDomain,
      status,
      sourcesNeeded: Math.max(minSourcesPerDomain - matches.length, 0),
      sources: matches.map((entry) => ({
        sourceTitle: entry.sourceTitle,
        agency: entry.agency,
        sourceType: entry.sourceType,
        reliabilityTier: entry.reliabilityTier,
        sourceUrl: entry.sourceUrl,
      })),
    };
  });

  const missingDomains = domains.filter((domain) => domain.status === 'missing');
  const partialDomains = domains.filter((domain) => domain.status === 'partial');
  const strongDomains = domains.filter((domain) => domain.status === 'strong');

  return {
    modId: mod.modId,
    modName: mod.modName,
    sourceAuthority: mod.sourceAuthority,
    minSourcesPerDomain,
    allowedSourceTypes: mod.allowedSourceTypes || [],
    authorityTier: mod.authorityTier,
    totalDomains: domains.length,
    strongDomains: strongDomains.length,
    partialDomains: partialDomains.length,
    missingDomains: missingDomains.length,
    canStop:
      Boolean(mod.batchControls?.continueUntilCoverageComplete) &&
      missingDomains.length === 0 &&
      partialDomains.length === 0,
    stopConditions: mod.batchControls?.stopOnlyWhen || [],
    domains,
    nextActions: [
      ...missingDomains.map(
        (item) =>
          `${mod.modId}: add ${item.minSourcesRequired} authoritative source(s) for ${item.domain} (${item.mappedTopic}).`,
      ),
      ...partialDomains.map(
        (item) =>
          `${mod.modId}: add ${item.sourcesNeeded} more authoritative source(s) for ${item.domain} (${item.mappedTopic}).`,
      ),
    ],
  };
});

const allNextActions = [
  ...globalCoverage
    .filter((item) => item.status !== 'strong')
    .map((item) => `Global coverage: add more authoritative sources for ${item.topic}.`),
  ...modCoverage.flatMap((mod) => mod.nextActions),
];

const summary = {
  generatedAt: new Date().toISOString(),
  totalRegisteredSources: entries.length,
  sourceModCount: sourceMods.length,
  requiredTopicCount: requiredTopics.length,

  globalSummary: {
    strongTopics: globalCoverage.filter((item) => item.status === 'strong').length,
    partialTopics: globalCoverage.filter((item) => item.status === 'partial').length,
    missingTopics: globalCoverage.filter((item) => item.status === 'missing').length,
  },

  modSummary: {
    modsComplete: modCoverage.filter((mod) => mod.canStop).length,
    modsIncomplete: modCoverage.filter((mod) => !mod.canStop).length,
    totalModDomains: modCoverage.reduce((sum, mod) => sum + mod.totalDomains, 0),
    strongModDomains: modCoverage.reduce((sum, mod) => sum + mod.strongDomains, 0),
    partialModDomains: modCoverage.reduce((sum, mod) => sum + mod.partialDomains, 0),
    missingModDomains: modCoverage.reduce((sum, mod) => sum + mod.missingDomains, 0),
  },

  globalCoverage,
  modCoverage,
  nextActions: allNextActions,
  sourceBoundary:
    'Coverage reporting is advisory and quarantined. It does not approve knowledge records, change SafeScope reasoning logic, declare violations, or authorize production use.',
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);

console.log('✅ SafeScope mod-aware knowledge coverage report generated.');
console.log(`Registered sources: ${summary.totalRegisteredSources}`);
console.log(`Source mods: ${summary.sourceModCount}`);
console.log(`Global strong topics: ${summary.globalSummary.strongTopics}`);
console.log(`Global partial topics: ${summary.globalSummary.partialTopics}`);
console.log(`Global missing topics: ${summary.globalSummary.missingTopics}`);
console.log(`Mod strong domains: ${summary.modSummary.strongModDomains}`);
console.log(`Mod partial domains: ${summary.modSummary.partialModDomains}`);
console.log(`Mod missing domains: ${summary.modSummary.missingModDomains}`);
console.log(`Report: ${reportPath}`);
