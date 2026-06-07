import { GateResult } from './role-based-approval-gates.types';

export class RoleBasedApprovalGatesValidator {
  static validate(result: GateResult): string[] {
    const errors: string[] = [];
    if (result.allowed === undefined) errors.push('Missing allowed status');
    if (!result.reason) errors.push('Missing reason');
    if (!result.gateVersion) errors.push('Missing gateVersion');
    if (!result.timestamp) errors.push('Missing timestamp');
    return errors;
  }
}
