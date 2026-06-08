import { SitePolicyIsolationService } from '../src/safescope-v2/site-policy-isolation/site-policy-isolation.service';
import { SitePolicyGovernanceService } from '../src/safescope-v2/site-policy-isolation/site-policy-governance.service';

async function validate() {
    console.log('--- Testing SafeScope Site Policy Isolation v1 ---');
    
    const governance = new SitePolicyGovernanceService();
    const service = new SitePolicyIsolationService(governance);

    // 1. Same workspace policy match succeeds
    const res1 = service.resolvePolicies({ workspaceId: 'ws-001' }, { hazardFamilies: ['struck_by'], taskContexts: ['operation'], equipmentTypes: ['forklift'] });
    if (res1.length === 0) throw new Error('Failed to resolve workspace-wide policy.');
    console.log('[PASS] Workspace-wide policy resolved.');

    // 2. Same workspace + correct site match outranks workspace-wide
    const res2 = service.resolvePolicies({ workspaceId: 'ws-001', siteId: 'site-A' }, { hazardFamilies: ['mechanical'], taskContexts: ['maintenance'], equipmentTypes: ['conveyor'] });
    if (res2.length < 2 || res2[0].policy.policyId !== 'policy-001') {
        throw new Error('Site-specific policy should outrank workspace-wide policy.');
    }
    console.log('[PASS] Site-specific policy outranks workspace-wide.');

    // 3. Other workspace policy is blocked
    const res3 = service.resolvePolicies({ workspaceId: 'ws-002' }, { hazardFamilies: ['mechanical'], taskContexts: ['maintenance'], equipmentTypes: ['conveyor'] });
    if (res3.some(r => r.policy.scope.workspaceId !== 'ws-002')) {
        throw new Error('Cross-workspace policy leakage detected.');
    }
    console.log('[PASS] Cross-workspace isolation enforced.');

    // 4. Governance boundary: Prohibited language in policy
    const invalidPolicy = {
        policyId: 'bad-policy',
        scope: { workspaceId: 'ws-001' },
        policyTitle: 'Invalid',
        policyText: 'This is a violation.',
        hazardFamilies: [],
        taskContexts: [],
        equipmentTypes: [],
        authorityType: 'site_rule' as any,
        status: 'active' as any,
        effectiveDate: '2026-01-01',
        sourceOwner: 'Tester',
        advisoryOnly: true,
        cannotOverrideRegulation: true,
        cannotCreateCitation: true
    };
    if (governance.validatePolicy(invalidPolicy as any).isAllowed) {
        throw new Error('Governance failed to block prohibited language.');
    }
    console.log('[PASS] Governance blocked prohibited language.');

    console.log('✅ SafeScope site policy isolation validation passed.');
}

validate().catch(err => {
    console.error(err);
    process.exit(1);
});
