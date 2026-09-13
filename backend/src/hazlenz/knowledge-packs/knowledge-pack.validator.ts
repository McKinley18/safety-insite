import { KnowledgePack } from './knowledge-pack.types';

export class KnowledgePackValidator {
  static validate(pack: KnowledgePack): string[] {
    const errors: string[] = [];

    if (pack.jurisdiction === 'unknown') {
        errors.push('Unknown jurisdiction packs are not allowed');
    }

    if (pack.draftCandidateIds.length > 0 && pack.validationStatus === 'valid') {
        errors.push('Pack with draft candidates cannot be marked as valid');
    }

    return errors;
  }
}
