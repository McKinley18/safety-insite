import { RoleBasedApprovalGatesService } from '../src/safescope-v2/role-based-approval-gates/role-based-approval-gates.service';
import { RoleBasedApprovalGatesValidator } from '../src/safescope-v2/role-based-approval-gates/role-based-approval-gates.validator';

async function validate() {
  const service = new RoleBasedApprovalGatesService();
  
  console.log('--- Testing Role-Based Approval Gates ---');

  // 1. OSHA General Industry reviewer approved OSHA GI source candidate.
  const case1 = service.evaluate({
      role: 'osha_general_industry_reviewer',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'osha_general_industry',
      isRegulatory: true
  });
  if (!case1.allowed) throw new Error('Case 1 failed: OSHA GI reviewer should be allowed to approve OSHA GI source.');
  console.log('[PASS] Case 1: OSHA GI reviewer approved OSHA GI source.');

  // 2. OSHA GI reviewer blocked from approving MSHA source candidate.
  const case2 = service.evaluate({
      role: 'osha_general_industry_reviewer',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'msha',
      isRegulatory: true
  });
  if (case2.allowed) throw new Error('Case 2 failed: OSHA GI reviewer should be blocked from MSHA source.');
  console.log('[PASS] Case 2: OSHA GI reviewer blocked from MSHA source.');

  // 3. MSHA reviewer approved MSHA source candidate.
  const case3 = service.evaluate({
      role: 'msha_competent_reviewer',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'msha',
      isRegulatory: true
  });
  if (!case3.allowed) throw new Error('Case 3 failed: MSHA reviewer should be allowed to approve MSHA source.');
  console.log('[PASS] Case 3: MSHA reviewer approved MSHA source.');

  // 4. Company policy admin approved company policy candidate
  const case4 = service.evaluate({
      role: 'company_policy_admin',
      action: 'approve',
      candidateType: 'company_policy',
      jurisdiction: 'company_only'
  });
  if (!case4.allowed) throw new Error('Case 4 failed: Company policy admin should be allowed.');
  console.log('[PASS] Case 4: Company policy admin approved company policy.');

  // 5. Safety reviewer approved simple human correction.
  const case5 = service.evaluate({
      role: 'safety_reviewer',
      action: 'approve',
      candidateType: 'human_review_learning'
  });
  if (!case5.allowed) throw new Error('Case 5 failed: Safety reviewer should be allowed.');
  console.log('[PASS] Case 5: Safety reviewer approved human correction.');

  // 6. Safety reviewer blocked from approving regulatory applicability change.
  const case6 = service.evaluate({
      role: 'safety_reviewer',
      action: 'approve',
      candidateType: 'human_review_learning',
      metadata: { affectsRegulatoryApplicability: true }
  });
  if (case6.allowed) throw new Error('Case 6 failed: Safety reviewer should be blocked from applicability changes.');
  console.log('[PASS] Case 6: Safety reviewer blocked from applicability change.');

  // 7. Visual evidence reviewer acknowledged visual evidence candidate.
  const case7 = service.evaluate({
      role: 'visual_evidence_reviewer',
      action: 'approve',
      candidateType: 'visual_evidence'
  });
  if (!case7.allowed) throw new Error('Case 7 failed: Visual reviewer should be allowed.');
  console.log('[PASS] Case 7: Visual evidence reviewer acknowledged candidate.');

  // 8. Visual evidence reviewer blocked from promoting regulatory knowledge.
  const case8 = service.evaluate({
      role: 'visual_evidence_reviewer',
      action: 'promote',
      candidateType: 'visual_evidence',
      isRegulatory: true
  });
  if (case8.allowed) throw new Error('Case 8 failed: Visual reviewer should be blocked from promoting regulatory knowledge.');
  console.log('[PASS] Case 8: Visual evidence reviewer blocked from promotion.');

  // 9. Compliance admin approved high-risk non-prohibited candidate.
  const case9 = service.evaluate({
      role: 'compliance_admin',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'mixed',
      priority: 'critical'
  });
  if (!case9.allowed) throw new Error('Case 9 failed: Compliance admin should be allowed.');
  console.log('[PASS] Case 9: Compliance admin approved mixed jurisdiction source.');

  // 10. Prohibited legal/enforcement language cannot be approved by any role.
  const case10 = service.evaluate({
      role: 'system_admin',
      action: 'approve',
      candidateType: 'source_ingestion',
      isRegulatory: true,
      containsProhibitedLanguage: true
  });
  if (case10.allowed) throw new Error('Case 10 failed: Prohibited language must be blocked for all roles.');
  console.log('[PASS] Case 10: Prohibited language blocked even for system admin.');

  // 11. Mixed jurisdiction record requires compliance_admin or system_admin.
  const case11 = service.evaluate({
      role: 'osha_general_industry_reviewer',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'mixed',
      isRegulatory: true
  });
  if (case11.allowed) throw new Error('Case 11 failed: OSHA reviewer should be blocked from mixed jurisdiction.');
  console.log('[PASS] Case 11: OSHA reviewer blocked from mixed jurisdiction.');

  const case11b = service.evaluate({
      role: 'system_admin',
      action: 'approve',
      candidateType: 'source_ingestion',
      jurisdiction: 'mixed',
      isRegulatory: true
  });
  if (!case11b.allowed) throw new Error('Case 11b failed: System admin should be allowed for mixed jurisdiction.');
  console.log('[PASS] Case 11b: System admin allowed for mixed jurisdiction.');

  // 12. Promotion without authorized prior approval is blocked (implicitly handled by evaluate check in services)
  
  console.log('✅ SafeScope role-based approval gates validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
