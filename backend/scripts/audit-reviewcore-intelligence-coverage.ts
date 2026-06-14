import * as hazardUniverseModule from '../src/safescope-v2/brain/hazard-universe/hazard-universe.registry';
import { SCENARIO_FAMILY_REGISTRY } from '../src/safescope-v2/brain/scenario-family-knowledge/scenario-family.registry';
import { EVIDENCE_GAP_QUESTION_REGISTRY } from '../src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.registry';
import { CORRECTIVE_ACTION_TEMPLATE_REGISTRY } from '../src/safescope-v2/corrective-actions/corrective-action-template.registry';
import * as fs from 'fs';
import * as path from 'path';

type Row = {
  domain: string;
  hazardUniverse: boolean;
  scenarioFamilies: number;
  evidenceQuestionFamilies: number;
  correctiveTemplates: number;
  mechanismCoverage: boolean;
  standardsIntentCoverage: boolean;
  validationScripts: number;
  draftPackScripts: number;
  score: number;
  status: 'green' | 'partial' | 'weak';
  recommendedNextStep: string;
};

const repoRoot = path.resolve(__dirname, '..', '..');
const scriptsDir = path.join(repoRoot, 'backend', 'scripts');
const mechanismFile = path.join(repoRoot, 'backend', 'src', 'safescope-v2', 'mechanism-intelligence', 'mechanism-intelligence.service.ts');
const standardsIntentFile = path.join(repoRoot, 'backend', 'src', 'safescope-v2', 'standards-intent-intelligence', 'standards-intent-intelligence.service.ts');

const hazardUniverseRegistry: any[] =
  (hazardUniverseModule as any).SAFESCOPE_HAZARD_UNIVERSE_REGISTRY ||
  (hazardUniverseModule as any).HAZARD_UNIVERSE_REGISTRY ||
  (hazardUniverseModule as any).HAZARD_UNIVERSE ||
  (hazardUniverseModule as any).hazardUniverseRegistry ||
  (hazardUniverseModule as any).hazardUniverse ||
  (hazardUniverseModule as any).default ||
  [];

if (!Array.isArray(hazardUniverseRegistry) || hazardUniverseRegistry.length === 0) {
  console.error('Could not locate hazard universe registry export.');
  console.error('Available exports:', Object.keys(hazardUniverseModule as any));
  process.exit(1);
}

const scripts = fs.existsSync(scriptsDir)
  ? fs.readdirSync(scriptsDir).filter((file) => file.endsWith('.ts'))
  : [];

const mechanismText = fs.existsSync(mechanismFile) ? fs.readFileSync(mechanismFile, 'utf8').toLowerCase() : '';
const standardsIntentText = fs.existsSync(standardsIntentFile) ? fs.readFileSync(standardsIntentFile, 'utf8').toLowerCase() : '';

function normalize(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function tokens(value: string): string[] {
  return normalize(value)
    .split('_')
    .filter((token) => token.length >= 4 && !['hazard', 'safety', 'protection', 'control', 'controls'].includes(token));
}

function includesDomain(text: string, domain: string): boolean {
  const norm = normalize(domain);
  if (text.includes(norm)) return true;
  return tokens(domain).some((token) => text.includes(token));
}

function scriptMatchesDomain(file: string, domain: string): boolean {
  const normFile = normalize(file);
  const normDomain = normalize(domain);
  if (normFile.includes(normDomain)) return true;
  return tokens(domain).some((token) => normFile.includes(token));
}

function scenarioMatchesDomain(scenario: any, domain: string): boolean {
  const haystack = [
    scenario.domain,
    scenario.id,
    scenario.label,
    scenario.name,
    scenario.scenarioFamilyId,
    scenario.candidateStandardFamilies?.join?.(' '),
    scenario.triggers?.join?.(' '),
    scenario.hazardSignals?.join?.(' '),
  ].filter(Boolean).join(' ');

  return includesDomain(haystack, domain);
}

function correctiveMatchesDomain(template: any, domain: string): boolean {
  const haystack = [
    template.domain,
    template.title,
    template.permanentCorrectionElements?.join?.(' '),
    template.verificationEvidence?.join?.(' '),
  ].filter(Boolean).join(' ');

  return includesDomain(haystack, domain);
}

function evidenceMatchesScenarioFamilies(scenarios: any[]): number {
  const scenarioIds = new Set(
    scenarios
      .map((scenario) => scenario.id || scenario.scenarioFamilyId)
      .filter(Boolean)
      .map(String),
  );

  return new Set(
    EVIDENCE_GAP_QUESTION_REGISTRY
      .filter((question: any) => scenarioIds.has(String(question.scenarioFamilyId)))
      .map((question: any) => String(question.scenarioFamilyId)),
  ).size;
}

const rows: Row[] = hazardUniverseRegistry.map((hazard: any) => {
  const domain = String(hazard.domain || hazard.label || 'unknown');
  const domainScenarios = SCENARIO_FAMILY_REGISTRY.filter((scenario: any) => scenarioMatchesDomain(scenario, domain));
  const evidenceQuestionFamilies = evidenceMatchesScenarioFamilies(domainScenarios);
  const correctiveTemplates = CORRECTIVE_ACTION_TEMPLATE_REGISTRY.filter((template: any) => correctiveMatchesDomain(template, domain)).length;
  const mechanismCoverage = includesDomain(mechanismText, domain);
  const standardsIntentCoverage = includesDomain(standardsIntentText, domain);
  const validationScripts = scripts.filter((file) => scriptMatchesDomain(file, domain) && file.includes('validate-safescope')).length;
  const draftPackScripts = scripts.filter((file) => scriptMatchesDomain(file, domain) && file.includes('draft-pack')).length;

  const score =
    1 +
    Math.min(domainScenarios.length, 3) +
    Math.min(evidenceQuestionFamilies, 2) +
    Math.min(correctiveTemplates, 2) +
    (mechanismCoverage ? 2 : 0) +
    (standardsIntentCoverage ? 2 : 0) +
    Math.min(validationScripts, 2) +
    Math.min(draftPackScripts, 1);

  const status: Row['status'] = score >= 10 ? 'green' : score >= 6 ? 'partial' : 'weak';

  let recommendedNextStep = 'Maintain regression coverage and add more field scenarios.';
  if (domainScenarios.length < 3) recommendedNextStep = 'Add scenario families for equipment/task/exposure variations.';
  else if (evidenceQuestionFamilies < Math.min(domainScenarios.length, 2)) recommendedNextStep = 'Add evidence-gap question records for scenario families.';
  else if (correctiveTemplates === 0) recommendedNextStep = 'Add scenario-specific corrective action templates.';
  else if (!standardsIntentCoverage) recommendedNextStep = 'Add standards-intent mapping and citation-level evidence requirements.';
  else if (validationScripts === 0) recommendedNextStep = 'Add validation gauntlet for this hazard domain.';

  return {
    domain,
    hazardUniverse: true,
    scenarioFamilies: domainScenarios.length,
    evidenceQuestionFamilies,
    correctiveTemplates,
    mechanismCoverage,
    standardsIntentCoverage,
    validationScripts,
    draftPackScripts,
    score,
    status,
    recommendedNextStep,
  };
}).sort((a: Row, b: Row) => {
  const order: Record<Row['status'], number> = { weak: 0, partial: 1, green: 2 };
  return order[a.status] - order[b.status] || a.score - b.score || a.domain.localeCompare(b.domain);
});

const summary = {
  generatedAt: new Date().toISOString(),
  totalDomains: rows.length,
  green: rows.filter((row) => row.status === 'green').length,
  partial: rows.filter((row) => row.status === 'partial').length,
  weak: rows.filter((row) => row.status === 'weak').length,
  rows,
};

console.log(JSON.stringify(summary, null, 2));
