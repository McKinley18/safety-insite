import { DomainKnowledge } from './domain-knowledge.types';

export class DomainKnowledgeRegistryValidator {
  static validate(domain: DomainKnowledge): string[] {
    const errors: string[] = [];

    if (domain.harmMechanisms.length === 0 || domain.evidenceQuestions.length === 0 || domain.failedControlFamilies.length === 0 || domain.correctiveActionControlFamilies.length === 0) {
        errors.push(`Domain ${domain.domainId} is missing required knowledge elements`);
    }

    if (!domain.advisoryGuardrails.advisoryOnly || 
        !domain.advisoryGuardrails.doesNotDeclareViolation || 
        !domain.advisoryGuardrails.doesNotCreateCitation || 
        !domain.advisoryGuardrails.requiresQualifiedReview) {
      errors.push(`Weakened advisory guardrails in ${domain.domainId}`);
    }

    return errors;
  }
}
