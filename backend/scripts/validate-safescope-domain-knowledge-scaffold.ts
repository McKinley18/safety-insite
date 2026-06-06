import { DomainKnowledgeRegistryValidator } from '../src/safescope-v2/domain-knowledge/domain-knowledge-registry.validator';
import { DomainKnowledge } from '../src/safescope-v2/domain-knowledge/domain-knowledge.types';

async function validate() {
  const validator = DomainKnowledgeRegistryValidator;
  
  // Test Case: Valid machine_guarding scaffold
  const machineGuarding: DomainKnowledge = {
    domainId: 'machine_guarding',
    typicalEquipmentGroups: ['conveyor'],
    taskContexts: ['maintenance'],
    harmMechanisms: ['nip_point'],
    failedControlFamilies: ['guarding'],
    evidenceQuestions: ['is guard present?'],
    standardFamilyLinks: ['loto'],
    correctiveActionControlFamilies: ['guarding'],
    negativeRoutingHints: ['hazcom'],
    advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true
    }
  };

  const errors = validator.validate(machineGuarding);
  if (errors.length > 0) {
      console.error('Machine guarding scaffold validation failed:', errors);
      process.exit(1);
  }
  console.log('✅ Machine guarding scaffold validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
