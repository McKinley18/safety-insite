import { SafescopeV2Controller } from '../src/safescope-v2/safescope-v2.controller';
import { SafeScopePersistenceService } from '../src/safescope-v2/persistence/persistence.service';
import { UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function validate() {
  console.log('--- Testing Staging Hardening: Auth Defaults ---');
  
  const mockService: any = { classify: async () => ({}) };
  const controller = new SafescopeV2Controller(mockService);
  
  // Use private method access for validation
  const oldBypass = process.env.DEV_AUTH_BYPASS;
  process.env.DEV_AUTH_BYPASS = 'false';

  let missingUserRejected = false;
  try {
    (controller as any).getGovernanceContext({ user: undefined });
  } catch (error) {
    missingUserRejected = error instanceof UnauthorizedException;
  }

  process.env.DEV_AUTH_BYPASS = oldBypass;

  if (!missingUserRejected) {
    throw new Error('Hardening failed: Missing user should be rejected when dev auth bypass is disabled.');
  }

  const authenticatedContext = (controller as any).getGovernanceContext({
    user: {
      id: 'validator-user-1',
      role: 'WORKER',
      workspaceId: 'validator-workspace',
      planCode: 'pro',
    },
  });

  if (authenticatedContext.userId !== 'validator-user-1') throw new Error('Hardening failed: Authenticated user id was not preserved.');
  if (authenticatedContext.role !== 'field_inspector') throw new Error('Hardening failed: WORKER role should map to field_inspector.');
  if (authenticatedContext.planTier !== 'pro') throw new Error('Hardening failed: Authenticated plan tier was not preserved.');
  if (authenticatedContext.workspaceId !== 'validator-workspace') throw new Error('Hardening failed: Authenticated workspace was not preserved.');

  const oldNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
  process.env.DEV_AUTH_BYPASS = 'true';
  const localBypassContext = (controller as any).getGovernanceContext({ user: undefined });
  process.env.DEV_AUTH_BYPASS = oldBypass;
  process.env.NODE_ENV = oldNodeEnv;

  if (localBypassContext.userId !== 'local-dev-bypass-user') throw new Error('Hardening failed: Explicit local dev bypass user was not used.');
  if (localBypassContext.role !== 'safety_manager') throw new Error('Hardening failed: Local dev bypass should map to operational test role.');
  if (localBypassContext.planTier !== 'company') throw new Error('Hardening failed: Local dev bypass should map to company test plan.');

  console.log('[PASS] Auth defaults hardened.');

  console.log('--- Testing Staging Hardening: Persistence Mode ---');
  
  // Test 1: Default mode (should be file in test/dev)
  const service1 = new SafeScopePersistenceService(undefined);
  if ((service1 as any).persistenceMode !== 'file') throw new Error('Persistence default should be file in dev/test.');

  // Test 2: Database mode without repo
  process.env.SAFE_SCOPE_PERSISTENCE_MODE = 'database';
  const service2 = new SafeScopePersistenceService(undefined);
  if ((service2 as any).persistenceMode !== 'database') throw new Error('Persistence mode should honor env var.');
  // Console should have logged error but service should instantiate
  
  // Test 3: Staging/Production default
  process.env.NODE_ENV = 'staging';
  delete process.env.SAFE_SCOPE_PERSISTENCE_MODE;
  const service3 = new SafeScopePersistenceService(undefined);
  if ((service3 as any).persistenceMode !== 'database') throw new Error('Staging should default to database persistence.');

  // Reset env
  process.env.NODE_ENV = 'test';
  console.log('[PASS] Persistence modes hardened.');

  console.log('--- Testing Staging Hardening: Frontend Demo Gating ---');
  const frontendPath = path.resolve(__dirname, '../../frontend-next/app/safescope-knowledge/review/page.tsx');
  if (fs.existsSync(frontendPath)) {
    const frontendContent = fs.readFileSync(frontendPath, 'utf-8');
    if (!frontendContent.includes('NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK')) {
        throw new Error('Frontend hardening failed: Demo fallback not env-gated.');
    }
    console.log('[PASS] Frontend demo fallback gated.');
  } else {
    console.warn(`[WARNING] Skipping frontend demo gating check: file not found at ${frontendPath}`);
  }

  console.log('--- Testing Staging Hardening: Placeholder Removal ---');
  const panelPath = path.resolve(__dirname, '../../frontend-next/components/safescope/panels/feedback-review/FeedbackReviewPanel.tsx');
  if (fs.existsSync(panelPath)) {
    const panelContent = fs.readFileSync(panelPath, 'utf-8');
    if (panelContent.includes('This is a placeholder')) {
        throw new Error('Placeholder copy still exists in FeedbackReviewPanel.');
    }
    console.log('[PASS] Placeholder UI removed.');
  } else {
    console.warn(`[WARNING] Skipping placeholder check: file not found at ${panelPath}`);
  }

  console.log('✅ SafeScope staging hardening v1 validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
