export interface DomainKnowledge {
  domainId: string;
  typicalEquipmentGroups: string[];
  taskContexts: string[];
  harmMechanisms: string[];
  failedControlFamilies: string[];
  evidenceQuestions: string[];
  standardFamilyLinks: string[];
  correctiveActionControlFamilies: string[];
  negativeRoutingHints: string[];
  advisoryGuardrails: {
    advisoryOnly: boolean;
    doesNotDeclareViolation: boolean;
    doesNotCreateCitation: boolean;
    requiresQualifiedReview: boolean;
  };
}
