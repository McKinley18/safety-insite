export type VerificationEvidenceGrade = 'valid' | 'insufficient' | 'contradictory';

export type VerificationEvidenceInput = {
  initialObservation: string;
  repairedObservation: string;
  photosAvailable?: boolean;
};

export type VerificationEvidenceResult = {
  grade: VerificationEvidenceGrade;
  isVerificationValid: boolean;
  reasons: string[];
  warnings: string[];
  remedialActionsRequired: string[];
  advisoryBoundary: string;
};
