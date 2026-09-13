import { Injectable } from '@nestjs/common';
import { SitePolicyRecord, SitePolicyGovernanceResult } from './site-policy-isolation.types';

@Injectable()
export class SitePolicyGovernanceService {
    validatePolicy(policy: SitePolicyRecord): SitePolicyGovernanceResult {
        if (policy.policyText.toLowerCase().includes('violation') || 
            policy.policyText.toLowerCase().includes('citation') ||
            policy.policyText.toLowerCase().includes('must comply') ||
            policy.policyText.toLowerCase().includes('legal')) {
            return { isAllowed: false, reason: 'Policy text contains prohibited regulatory language.' };
        }
        
        if (!policy.advisoryOnly) {
            return { isAllowed: false, reason: 'Site policies must be advisoryOnly.' };
        }

        return { isAllowed: true };
    }
}
