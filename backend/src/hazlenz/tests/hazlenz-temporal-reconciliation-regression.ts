import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';

const service = new MultiHazardDecompositionService();
const cases = [
  {
    name: 'haul route retains unknown mobile context',
    text: 'A contractor works on a crusher and haul route near a mine but the record does not identify whether the activity is mine operation or construction.',
    assert(result: any) {
      const mobile = result.hazards.find((hazard: any) => hazard.domainId === 'mobile_equipment');
      if (!mobile || mobile.conditionState !== 'UNKNOWN') throw new Error('mobile-equipment context was not retained as UNKNOWN');
    },
  },
  {
    name: 'controlled chemical sibling preserves active hot work',
    text: 'The chemical container is sealed and labeled with no release, while hot work is actively underway nearby without verified fire watch.',
    assert(result: any) {
      const hotWork = result.hazards.find((hazard: any) => hazard.domainId === 'hot_work');
      if (!hotWork || hotWork.conditionState !== 'ACTIVE') throw new Error('active hot-work sibling was not retained');
    },
  },
  {
    name: 'future repair remains active',
    text: 'The conveyor guard will be replaced tomorrow, but the belt is exposed during today\'s operation.',
    assert(result: any) {
      const guarding = result.hazards.find((hazard: any) => hazard.domainId === 'machine_guarding');
      if (!guarding || guarding.conditionState !== 'ACTIVE') throw new Error('future repair incorrectly suppressed guarding');
    },
  },
];

for (const item of cases) {
  const result = service.decompose(item.text);
  item.assert(result);
  console.log(`PASS ${item.name}`);
}
console.log(`HazLenz temporal reconciliation regression: ${cases.length} passed, 0 failed`);
