import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SitePolicyRecord, SitePolicyScope, SitePolicyResolution } from './site-policy-isolation.types';
import { SitePolicyGovernanceService } from './site-policy-governance.service';

@Injectable()
export class SitePolicyIsolationService {
    private policies: SitePolicyRecord[] = [];
    private readonly fixturesPath = path.resolve(__dirname, '../../../../safescope-data/site-policies/site-policy-fixtures-v1.json');

    constructor(private readonly governanceService: SitePolicyGovernanceService) {
        this.loadPolicies();
    }

    private loadPolicies() {
        if (fs.existsSync(this.fixturesPath)) {
            const data = JSON.parse(fs.readFileSync(this.fixturesPath, 'utf-8'));
            this.policies = data.filter((p: SitePolicyRecord) => p.status === 'active');
        }
    }

    resolvePolicies(scope: SitePolicyScope, context: { hazardFamilies: string[], taskContexts: string[], equipmentTypes: string[] }): SitePolicyResolution[] {
        return this.policies
            .filter(p => {
                if (p.scope.workspaceId !== scope.workspaceId) return false;
                if (p.scope.siteId && scope.siteId && p.scope.siteId !== scope.siteId) return false;
                return true;
            })
            .map(p => {
                const relevance = this.calculateRelevance(p, context, scope);
                const governance = this.governanceService.validatePolicy(p);
                
                return {
                    policy: p,
                    relevanceScore: relevance,
                    governanceResult: governance
                };
            })
            .filter(res => res.governanceResult.isAllowed && res.relevanceScore > 0)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    private calculateRelevance(policy: SitePolicyRecord, context: any, scope: SitePolicyScope): number {
        let score = 0;
        if (policy.scope.siteId === scope.siteId) score += 10;
        else if (policy.scope.siteId) score -= 5;
        else score += 5; // Workspace-wide

        if (policy.hazardFamilies.some(hf => context.hazardFamilies.includes(hf))) score += 5;
        if (policy.taskContexts.some(tc => context.taskContexts.includes(tc))) score += 3;
        
        return score;
    }
}
