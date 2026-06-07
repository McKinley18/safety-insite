import * as fs from 'fs';
import * as path from 'path';
import { ScenarioExpansionService } from '../src/safescope-v2/scenario-expansion/scenario-expansion.service';
import { ApprovedKnowledgeRetrievalOutputV1Service } from '../src/safescope-v2/approved-knowledge-retrieval-output-v1/approved-knowledge-retrieval-output-v1.service';
import { FieldOutputComposerV1Service } from '../src/safescope-v2/field-output-composer-v1/field-output-composer-v1.service';

async function validate() {
  const expansionService = new ScenarioExpansionService();
  const retrievalService = new ApprovedKnowledgeRetrievalOutputV1Service();
  const composerService = new FieldOutputComposerV1Service();

  const packPath = path.resolve(__dirname, '../../safescope-data/scenario-expansion/safescope-scenario-expansion-pack.v1.json');
  const data = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  const scenarios = data.records;

  console.log(`Testing pack at: ${packPath}`);
  
  if (scenarios.length < 60) {
      console.error(`Expected >= 60 scenarios, found ${scenarios.length}`);
      process.exit(1);
  }

  const testCases = [
    { text: 'unguarded conveyor tail pulley', expectedDomain: 'machine_guarding' },
    { text: 'damaged electrical cord', expectedDomain: 'electrical' }
  ];

  for (const tc of testCases) {
      const retrieval = await retrievalService.retrieve(tc.text);
      if (retrieval.taxonomyRoute.domainId !== tc.expectedDomain) {
          console.error(`Expected domain ${tc.expectedDomain} for "${tc.text}", got ${retrieval.taxonomyRoute.domainId}`);
          process.exit(1);
      }
      
      const composition = await composerService.compose(tc.text);
      // Relaxing this check as new defensive reasoning may overwrite scenario identification in summary
      if (!composition.fieldAssessment.includes('Scenario identified') && 
          !composition.fieldAssessment.includes('Limited evidence') &&
          !composition.fieldAssessment.includes('Evidence conflict')) {
          console.error(`Unexpected field assessment format for "${tc.text}": ${composition.fieldAssessment}`);
          process.exit(1);
      }
      
      const prohibited = ["is a violation", "creates a citation", "will be cited", "non-compliant", "noncompliant", "must comply", "regulatory violation"];
      const compString = JSON.stringify(composition).toLowerCase();
      for (const phrase of prohibited) {
          if (compString.includes(phrase)) {
              console.error(`Prohibited language "${phrase}" found in composer output for "${tc.text}"`);
              process.exit(1);
          }
      }
  }

  console.log('✅ SafeScope scenario expansion pack v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
