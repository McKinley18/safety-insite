import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementGuard, ENTITLEMENT_KEY } from '../src/auth/entitlements/entitlement.guard';

function makeContext(requiredEntitlement: string | undefined, user: any) {
  const handler = function handler() {};
  const klass = class Controller {};

  if (requiredEntitlement) {
    Reflect.defineMetadata(ENTITLEMENT_KEY, requiredEntitlement, handler);
  }

  return {
    getHandler: () => handler,
    getClass: () => klass,
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any;
}

function assertAllows(guard: EntitlementGuard, entitlement: string, user: any, label: string) {
  const result = guard.canActivate(makeContext(entitlement, user));
  if (result !== true) {
    throw new Error(`${label} should have been allowed.`);
  }
}

function assertBlocks(guard: EntitlementGuard, entitlement: string, user: any, label: string) {
  try {
    guard.canActivate(makeContext(entitlement, user));
  } catch (error) {
    if (error instanceof ForbiddenException) return;
    throw error;
  }

  throw new Error(`${label} should have been blocked.`);
}

async function main() {
  const reflector = new Reflector();
  const guard = new EntitlementGuard(reflector);

  assertBlocks(
    guard,
    'auditTrail',
    { planCode: 'basic', type: 'basic' },
    'Basic SafeScope Knowledge access',
  );

  assertBlocks(
    guard,
    'analytics',
    { planCode: 'basic', type: 'basic' },
    'Basic analytics access',
  );

  assertAllows(
    guard,
    'analytics',
    { planCode: 'plus', type: 'plus' },
    'Plus analytics access',
  );

  assertAllows(
    guard,
    'auditTrail',
    { planCode: 'company', type: 'company' },
    'Company SafeScope Knowledge access',
  );

  assertAllows(
    guard,
    'supervisorValidation',
    { organizationPlanCode: 'company', planCode: 'basic', type: 'basic' },
    'Organization-level Company entitlement override',
  );

  console.log('PASS: Backend entitlement guard smoke test passed.');
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
});
