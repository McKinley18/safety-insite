/**
 * §229 — PROTECTED IDENTITY VERIFICATION. Zero provider calls, zero database operations.
 *
 * Recomputes every module digest, prompt identity and schema identity that §221 pinned and that
 * §227 through §228C relied on. Run before and after cleanup; the two runs must be identical.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const fileSha = (p: string): string | null =>
  existsSync(join(ROOT, p)) ? sha(readFileSync(join(ROOT, p))) : null;

/** The §221 pinned module set, plus everything §227–§228C transmitted through. */
const PROTECTED_MODULES: Readonly<Record<string, string>> = {
  firstPassContractModule: 'scripts/lib/expert-210j-first-pass-contract.ts',
  firstPassProjectionModule: 'scripts/lib/expert-210j-declaration-projection.ts',
  verifierInstructionModule: 'scripts/lib/expert-218-property-instruction.ts',
  verifierSchemaModule: 'scripts/lib/expert-218-property-review-contract.ts',
  verifierConsistencyModule: 'scripts/lib/expert-218-property-consistency.ts',
  verifierPayloadModule: 'scripts/lib/expert-212-verifier-payload.ts',
  scopeContainmentModule: 'scripts/lib/expert-214-scope-containment.ts',
  propertyAuthorityModule: 'src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts',
  settlementReviewModule: 'src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts',
  owedFactLedgerModule: 'src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts',
  owedFactTypesModule: 'src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
  owedFactBindingModule: 'src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts',
  governedEvidenceDerivationModule:
    'src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation.ts',
  declarationPreservationModule: 'scripts/lib/expert-205-declaration-preservation.ts',
  firstPassInstructionVNextModule: 'scripts/lib/expert-first-pass-instruction-vnext.ts',
  verifierInstructionV3Module: 'scripts/lib/expert-verifier-instruction-v3.ts',
  verifierRecoveryModule: 'scripts/lib/expert-208b-verifier-recovery.ts',
  section210bPayloadModule: 'scripts/lib/section-210b-verifier-payload.ts',
  expertContractTypesModule: 'src/safescope-v2/expert-hazlenz/expert-contract.types.ts',
  anthropicAdapterModule: 'src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts',
  contract226Module: 'scripts/lib/expert-226-property-selection-capability.ts',
  contract224Module: 'scripts/lib/expert-224-declaration-capability.ts',
  instrument221Module: 'scripts/lib/expert-221-integrated-instrument.ts',
  assembly221Module: 'scripts/lib/expert-221-assembly.ts',
  instrument228AModule: 'scripts/lib/expert-228a-integrated-instrument.ts',
  assembly228BModule: 'scripts/lib/expert-228b-assembly.ts',
  instrument228CModule: 'scripts/lib/expert-228c-kr1-instrument.ts',
  assembly228CModule: 'scripts/lib/expert-228c-assembly.ts',
  verifierDevelopmentBoundary:
    'src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts',
};

/* eslint-disable @typescript-eslint/no-var-requires */
const c210j = require('./lib/expert-210j-first-pass-contract');
const c218 = require('./lib/expert-218-property-review-contract');
const i218 = require('./lib/expert-218-property-instruction');
const c226 = require('./lib/expert-226-property-selection-capability');
const asm221 = require('./lib/expert-221-assembly');
const asm228b = require('./lib/expert-228b-assembly');
const asm228c = require('./lib/expert-228c-assembly');
const inst228a = require('./lib/expert-228a-integrated-instrument');
const inst228c = require('./lib/expert-228c-kr1-instrument');

const semantic = {
  firstPassContractVersion: c210j.FIRST_PASS_CONTRACT_210J_VERSION,
  contract226Version: c226.FIRST_PASS_CONTRACT_226_VERSION,
  verifierContractVersion: c218.PROPERTY_REVIEW_CONTRACT_218_VERSION,
  systemPrompt210jNoGoverned: sha(c210j.EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT),
  systemPrompt210jGoverned: sha(c210j.EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
  systemPrompt226NoGoverned: sha(c226.build226SystemPrompt(0)),
  systemPrompt226Governed: sha(c226.build226SystemPrompt(2)),
  verifierSystemPrompt218: sha(i218.EXPERT_VERIFIER_218_SYSTEM_PROMPT),
  verifierSchema218: sha(JSON.stringify(c218.VERIFIER_218_RESPONSE_SCHEMA)),
  requiredDeclarationFields210j: sha(JSON.stringify(c210j.REQUIRED_DECLARATION_FIELDS_210J)),
  unresolvedActionField: c210j.UNRESOLVED_ACTION_FIELD,
  unresolvedActionSchemaProperty: sha(JSON.stringify(c210j.UNRESOLVED_ACTION_SCHEMA_PROPERTY)),
  propertySemanticRoles218: sha(JSON.stringify(c218.PROPERTY_SEMANTIC_ROLES_218)),
  propertyValidities218: sha(JSON.stringify(c218.PROPERTY_VALIDITIES_218)),
  roleDefinitions218: sha(JSON.stringify(c218.ROLE_DEFINITIONS_218)),
  evidenceRoleCounterfactual218: sha(c218.EVIDENCE_ROLE_COUNTERFACTUAL),
  instrument228ADigest: inst228a.instrumentDigest228A(),
  instrument228CDigest: inst228c.instrumentDigest228C(),
};

/** The assembled bytes of every call §228B and §228C transmitted. */
const assembled = {
  section228B: asm228b.assembleFirstPass228B().map((x: any) => ({
    caseId: x.caseId, ...x.identities,
  })),
  section228C: (() => { const x = asm228c.assembleFirstPass228C();
    return { caseId: x.caseId, ...x.identities }; })(),
  section221VerifierLeg: asm221.verifierLegIdentities221(),
};

const modules: Record<string, string | null> = {};
for (const [k, p] of Object.entries(PROTECTED_MODULES)) modules[k] = fileSha(p);
const missing = Object.entries(modules).filter(([, v]) => v === null).map(([k]) => k);

const out = {
  artifact: 'SECTION-229-PROTECTED-IDENTITIES',
  capturedAt: new Date().toISOString(),
  providerCalls: 0, databaseOperations: 0,
  moduleCount: Object.keys(PROTECTED_MODULES).length,
  missingModules: missing,
  modulePaths: PROTECTED_MODULES,
  moduleDigests: modules,
  semanticIdentities: semantic,
  assembledCallIdentities: assembled,
};
const composite = sha(JSON.stringify({ modules, semantic, assembled }));
(out as any).compositeIdentity = composite;

const target = process.argv[2] ?? join(__dirname, '..', '..', 'PROTECTED-IDENTITIES.json');
writeFileSync(target, JSON.stringify(out, null, 2) + '\n');
console.log(`modules ${Object.keys(PROTECTED_MODULES).length}, missing ${missing.length}`);
if (missing.length > 0) console.log(`  MISSING: ${missing.join(', ')}`);
console.log(`composite identity: ${composite}`);
console.log(`written: ${target}`);
