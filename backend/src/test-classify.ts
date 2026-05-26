import { WeightedClassifierService } from "./safescope-v2/classifier/weighted-classifier.service";

const service = new WeightedClassifierService();

const input = "safety shower and eye wash station blocked by plastic chemical drum storage pallet in mixing bay\nAgency: OSHA\nIndustry context: general_industry\nEquipment context: chemical_mixing_bay_station";

const result = service.classify(input);
console.log(`\nInput: "${input.replace(/\n/g, ' | ')}"`);
console.log(`Classification: "${result.classification}" (Score: ${result.score}, Margin: ${result.scoreMargin})`);
console.log(`Top Candidates:`);
console.log(`  - Primary: ${result.classification} (${result.score})`);
const sorted = result.additionalHazards || [];
for (const h of sorted) {
  console.log(`  - Additional: ${h.classification} (${h.confidence} / ${h.confidenceBand})`);
}
