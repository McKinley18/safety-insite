import { ApprovedSourceRecord } from './source-governance.types';

export const APPROVED_SOURCE_REGISTRY: ApprovedSourceRecord[] = [
  {
    id: 'osha-1926-501',
    title: 'Fall Protection in Construction',
    sourceType: 'regulation',
    agency: 'OSHA',
    jurisdiction: 'osha_construction',
    industryScope: ['construction'],
    authorityTier: 'primary_regulation',
    citation: '29 CFR 1926.501',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['fall height', 'activity type'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['Core construction safety regulation.']
  },
  {
    id: 'msha-57-8520',
    title: 'Ventilation Underground MNM',
    sourceType: 'regulation',
    agency: 'MSHA',
    jurisdiction: 'msha',
    industryScope: ['mining'],
    authorityTier: 'primary_regulation',
    citation: '30 CFR 57.8520',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['airflow measurement'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['Core MNM ventilation regulation.']
  },
  {
    id: 'osha-1910-147-loto',
    title: 'Control of Hazardous Energy (Lockout/Tagout)',
    sourceType: 'regulation',
    agency: 'OSHA',
    jurisdiction: 'osha_general_industry',
    industryScope: ['manufacturing'],
    authorityTier: 'primary_regulation',
    citation: '29 CFR 1910.147',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['LOTO status', 'energy isolation verification'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['Core LOTO regulation.']
  },
  {
    id: 'msha-56-14107',
    title: 'Moving Machine Parts Guarding (Surface MNM)',
    sourceType: 'regulation',
    agency: 'MSHA',
    jurisdiction: 'msha',
    industryScope: ['mining'],
    authorityTier: 'primary_regulation',
    citation: '30 CFR 56.14107',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['guard status', 'moving parts exposure'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['Surface MNM machine guarding regulation.']
  },
  {
    id: 'msha-56-9300',
    title: 'Mobile Equipment Berms/Guards',
    sourceType: 'regulation',
    agency: 'MSHA',
    jurisdiction: 'msha',
    industryScope: ['mining'],
    authorityTier: 'primary_regulation',
    citation: '30 CFR 56.9300',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['berm condition', 'equipment usage'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['Berms/guards for mobile equipment.']
  },
  {
    id: 'osha-1910-178',
    title: 'Powered Industrial Trucks',
    sourceType: 'regulation',
    agency: 'OSHA',
    jurisdiction: 'osha_general_industry',
    industryScope: ['general_industry'],
    authorityTier: 'primary_regulation',
    citation: '29 CFR 1910.178',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['operator training', 'equipment condition'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['General industry forklift/truck regulation.']
  },
  {
    id: 'osha-1910-1200',
    title: 'Hazard Communication',
    sourceType: 'regulation',
    agency: 'OSHA',
    jurisdiction: 'osha_general_industry',
    industryScope: ['general_industry'],
    authorityTier: 'primary_regulation',
    citation: '29 CFR 1910.1200',
    approvalStatus: 'approved',
    version: '1.0.0',
    deprecated: false,
    duplicateRiskSignals: [],
    evidenceRequiredBeforeUse: ['SDS presence', 'label condition'],
    prohibitedUses: [],
    advisoryGuardrails: {
      advisoryOnly: false,
      doesNotDeclareViolation: false,
      requiresQualifiedReview: false
    },
    traceNotes: ['HazCom standard.']
  }
];
