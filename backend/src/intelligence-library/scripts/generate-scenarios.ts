import * as fs from 'fs';

type Scenario = {
  family: string;
  input: string;
};

const families: string[] = [
  'Guarding',
  'Electrical',
  'Access',
  'PPE',
  'Fall Protection',
  'Mobile Equipment',
  'Housekeeping',
  'Dust/Silica',
];

const templates: string[] = [
  '{kw} missing',
  '{kw} broken',
  'need to report {kw}',
  'check {kw} standard',
  'found {kw} issue',
];

const descriptors: string[] = [
  '',
  'immediately',
  'near plant',
  'crusher area',
  'urgent',
  'needs review',
];

const scenarios: Scenario[] = [];

families.forEach((family: string) => {
  templates.forEach((template: string) => {
    descriptors.forEach((descriptor: string) => {
      scenarios.push({
        family,
        input: `${template.replace('{kw}', family.split('/')[0])} ${descriptor}`.trim(),
      });
    });
  });
});

fs.writeFileSync(
  'backend/src/intelligence-library/data/50k-scenarios.json',
  JSON.stringify(scenarios, null, 2),
);

console.log(`Generated ${scenarios.length} scenarios.`);
