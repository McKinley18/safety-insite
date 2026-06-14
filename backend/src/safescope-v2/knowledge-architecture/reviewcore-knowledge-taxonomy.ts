export const REVIEWCORE_DOMAINS = [
  'FinancialCompliance', 'DataPrivacy', 'SecurityStandards', 'OperationalRisk',
  'AuditFrameworks', 'RegulatoryReporting', 'MarketConduct', 'IdentityManagement',
  'CloudGovernance', 'EncryptionProtocols', 'NetworkSecurity', 'IncidentResponse',
  'ThirdPartyRisk', 'AssetManagement', 'SoftwareLifecycle', 'ThreatIntelligence',
  'VulnerabilityManagement', 'EndpointSecurity', 'PolicyEnforcement', 'TrainingCompliance',
  'BusinessContinuity', 'DisasterRecovery', 'FraudPrevention', 'EthicsGovernance'
];

export const DOMAIN_TAGS: Record<string, string[]> = {
  FinancialCompliance: ['regulation', 'finance', 'rules'],
  DataPrivacy: ['gdpr', 'pii', 'privacy'],
  SecurityStandards: ['iso', 'nist', 'compliance'],
  OperationalRisk: ['risk', 'operations', 'assessment'],
  AuditFrameworks: ['audits', 'controls', 'testing'],
  RegulatoryReporting: ['reports', 'submission', 'deadlines'],
  MarketConduct: ['ethics', 'trading', 'fairness'],
  IdentityManagement: ['auth', 'access', 'rbac'],
  CloudGovernance: ['aws', 'azure', 'cloud'],
  EncryptionProtocols: ['tls', 'ssl', 'keys'],
  NetworkSecurity: ['firewall', 'perimeter', 'traffic'],
  IncidentResponse: ['alert', 'remediation', 'triage'],
  ThirdPartyRisk: ['vendor', 'supplychain', 'assessment'],
  AssetManagement: ['inventory', 'lifecycle', 'tracking'],
  SoftwareLifecycle: ['sdlc', 'devops', 'deployment'],
  ThreatIntelligence: ['intelligence', 'analysis', 'feeds'],
  VulnerabilityManagement: ['patching', 'scanning', 'mitigation'],
  EndpointSecurity: ['device', 'agent', 'protection'],
  PolicyEnforcement: ['rules', 'automation', 'governance'],
  TrainingCompliance: ['education', 'awareness', 'certification'],
  BusinessContinuity: ['resilience', 'planning', 'uptime'],
  DisasterRecovery: ['backup', 'restoration', 'contingency'],
  FraudPrevention: ['detection', 'monitoring', 'anomalies'],
  EthicsGovernance: ['standards', 'corporate', 'conduct']
};
