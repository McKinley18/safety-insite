import * as fs from 'fs';
import * as path from 'path';

const styles = ['clean', 'slang', 'typo', 'narrative', 'vague'];
const families = [
  { id: 'guarding', family: 'Guarding', phrases: ['conveyor guard missing', 'missing machine guard', 'exposed belt', 'no guard on pulley'] },
  { id: 'electrical', family: 'Electrical', phrases: ['frayed cord', 'exposed wires', 'damaged extension cable', 'live panel open'] },
  { id: 'fall_protection', family: 'Fall Protection', phrases: ['worker near edge no tie off', 'elevated work no harness', 'no fall protection'] },
  { id: 'housekeeping', family: 'Housekeeping', phrases: ['oil slick on floor', 'debris in walkway', 'trip hazard in shop'] }
];

const scenarios = [];
for (let i = 0; i < 5000; i++) {
  const f = families[i % families.length];
  const phrase = f.phrases[i % f.phrases.length];
  const style = styles[i % styles.length];
  
  let desc = phrase;
  if (style === 'typo') desc = desc.replace('guard', 'gaurd').replace('conveyor', 'conveyer');
  if (style === 'slang') desc = desc + ' needs fixin';
  if (style === 'vague') desc = i % 2 === 0 ? 'stuff broken' : 'unsafe situation';

  scenarios.push({
    id: i,
    industryMode: i % 2 === 0 ? 'OSHA_GENERAL_INDUSTRY' : 'MSHA',
    hazardFamily: f.family,
    rawDescription: desc,
    expectedConditionId: style === 'vague' ? 'other_uncertain' : f.id,
    expectedPrimaryCitations: ['1910.212', '56.14107'],
    wordingStyle: style
  });
}
fs.writeFileSync(path.join(__dirname, '../src/intelligence-library/data/5k-real-scenarios-v3.json'), JSON.stringify(scenarios, null, 2));
