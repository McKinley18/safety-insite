import { AccessDecision } from './workspace-governance.types';

export class WorkspaceGovernanceAccessValidator {
  static validate(result: AccessDecision): string[] {
    const errors: string[] = [];
    if (result.allowed === undefined) errors.push('Missing allowed status');
    if (!result.reason) errors.push('Missing reason');
    if (!result.workspaceId) errors.push('Missing workspaceId');
    return errors;
  }
}
