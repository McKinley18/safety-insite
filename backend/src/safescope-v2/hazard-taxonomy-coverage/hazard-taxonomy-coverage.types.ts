export interface TaxonomyDomain {
  domainId: string;
  displayName: string;
  status: 'covered_draft_pack' | 'partial_engine_coverage' | 'routing_only' | 'gap';
  relatedStandardFamilies: string[];
  commonEntities: string[];
  commonMechanisms: string[];
  commonControls: string[];
  evidenceQuestions: string[];
  existingCoverageFiles: string[];
  existingValidators: string[];
  recommendedNextPack: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  notes: string;
}

export interface RoutingResult {
  domainId: string;
  confidence: number;
  matchedSignals: string[];
  routeDisposition: 'categorize_only' | 'create_learning_candidate' | 'hold_for_review' | 'reject';
  requiresHumanReview: boolean;
}
