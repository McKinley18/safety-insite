"use client";

import React, { useState } from 'react';
import PageHeader from '../../../components/ui/PageHeader';
import SentinelCard from '../../../components/ui/SentinelCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import MetricBlock from '../../../components/ui/MetricBlock';
import { AppButton } from '../../../components/ui/AppButton';
import { AppPanel } from '../../../components/ui/AppPanel';
import EmptyState from '../../../components/ui/EmptyState';

// Types (Mirrored from Backend)
type CandidateStatus = 
  | 'pending_review' 
  | 'needs_more_information' 
  | 'approved_for_promotion' 
  | 'rejected' 
  | 'blocked' 
  | 'archived';

type CandidateType = 'human_review_learning' | 'source_ingestion' | 'draft_candidate' | 'reasoning_candidate';

interface CandidateAuditEntry {
  action: string;
  timestamp: string;
  actor: string;
  role: string;
  notes?: string;
}

interface ReviewerCandidate {
  candidateId: string;
  candidateType: CandidateType;
  sourceSystem: string;
  createdAt: string;
  status: CandidateStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  domainIds: string[];
  hazardFamilies: string[];
  mechanisms: string[];
  jurisdiction: string;
  authorityTier: string;
  sourceReferences: string[];
  summary: string;
  proposedKnowledgeText?: string;
  proposedChange?: any;
  evidenceBasis: string;
  governanceFlags: string[];
  requiredReviewSteps: string[];
  reviewerDecision?: string;
  reviewerRationale?: string;
  auditTrail: CandidateAuditEntry[];
}

// Mock Data
const MOCK_CANDIDATES: ReviewerCandidate[] = [
  {
    candidateId: 'cand-001',
    candidateType: 'human_review_learning',
    sourceSystem: 'human_review_feedback_loop',
    createdAt: new Date().toISOString(),
    status: 'pending_review',
    priority: 'high',
    domainIds: ['machine_guarding'],
    hazardFamilies: ['mechanical'],
    mechanisms: ['nip_point'],
    jurisdiction: 'osha_general_industry',
    authorityTier: 'primary_regulation',
    sourceReferences: ['OSHA 1910.212'],
    summary: 'Correction: Machine guarding nip points must be verified during active cleanup.',
    proposedKnowledgeText: 'Proposed update to machine guarding applicability rules.',
    evidenceBasis: 'Safety Manager review of observation #10293',
    governanceFlags: ['RELIABILITY_BOOSTED'],
    requiredReviewSteps: ['Verify against OSHA 1910.212(a)(1)'],
    auditTrail: [
      { action: 'created', timestamp: new Date().toISOString(), actor: 'System', role: 'System', notes: 'Initial capture' }
    ]
  },
  {
    candidateId: 'cand-002',
    candidateType: 'source_ingestion',
    sourceSystem: 'source_ingestion_workflow',
    createdAt: new Date().toISOString(),
    status: 'needs_more_information',
    priority: 'medium',
    domainIds: ['electrical'],
    hazardFamilies: ['electrical'],
    mechanisms: ['shock'],
    jurisdiction: 'osha_construction',
    authorityTier: 'primary_regulation',
    sourceReferences: ['http://osha.gov/electrical'],
    summary: 'Ingested source: 1926.405(a)(2)(ii)(I)',
    proposedKnowledgeText: 'New electrical isolation standards for temporary constructions.',
    evidenceBasis: 'Official source document ingestion',
    governanceFlags: ['MISSING_EFFECTIVE_DATE'],
    requiredReviewSteps: ['Confirm effective date', 'Verify jurisdiction mapping'],
    auditTrail: [
      { action: 'created', timestamp: new Date().toISOString(), actor: 'System', role: 'System', notes: 'Source ingested' }
    ]
  },
  {
    candidateId: 'cand-003',
    candidateType: 'human_review_learning',
    sourceSystem: 'human_review_feedback_loop',
    createdAt: new Date().toISOString(),
    status: 'blocked',
    priority: 'critical',
    domainIds: ['emergency_egress'],
    hazardFamilies: ['egress'],
    mechanisms: ['entrapment'],
    jurisdiction: 'unclear',
    authorityTier: 'unknown',
    sourceReferences: [],
    summary: 'Proposed correction: This is a definitive violation.',
    proposedKnowledgeText: 'Declaring a regulatory violation without approved source.',
    evidenceBasis: 'Worker feedback',
    governanceFlags: ['PROHIBITED_LEGAL_LANGUAGE', 'UNSUPPORTED_ENFORCEMENT_CLAIM'],
    requiredReviewSteps: ['Block unsafe learning'],
    auditTrail: [
      { action: 'created', timestamp: new Date().toISOString(), actor: 'System', role: 'System', notes: 'Captured' },
      { action: 'blocked', timestamp: new Date().toISOString(), actor: 'Governance Engine', role: 'System', notes: 'Prohibited language detected' }
    ]
  }
];

export default function ReviewerCandidateConsole() {
  const [candidates, setCandidates] = useState<ReviewerCandidate[]>(MOCK_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<ReviewerCandidate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingCount = candidates.filter(c => c.status === 'pending_review').length;
  const needsInfoCount = candidates.filter(c => c.status === 'needs_more_information').length;
  const approvedCount = candidates.filter(c => c.status === 'approved_for_promotion').length;
  const rejectedCount = candidates.filter(c => c.status === 'rejected' || c.status === 'blocked').length;

  const filteredCandidates = filterStatus === 'all' 
    ? candidates 
    : candidates.filter(c => c.status === filterStatus);

  const handleAction = (id: string, newStatus: CandidateStatus, notes?: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.candidateId === id) {
        const updated = {
          ...c,
          status: newStatus,
          auditTrail: [
            ...c.auditTrail,
            { action: newStatus, timestamp: new Date().toISOString(), actor: 'Current User', role: 'Safety Reviewer', notes }
          ]
        };
        if (selectedCandidate?.candidateId === id) setSelectedCandidate(updated);
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <AppPanel className="py-4">
          <PageHeader 
            title="Reviewer Candidate Console"
            description="Staged candidates for qualified human review before promotion to approved SafeScope knowledge."
          />
        </AppPanel>
      </div>

      <AppPanel className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricBlock label="Pending" value={pendingCount} />
          <MetricBlock label="Needs Info" value={needsInfoCount} />
          <MetricBlock label="Approved" value={approvedCount} />
          <MetricBlock label="Rejected / Blocked" value={rejectedCount} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Candidates</h2>
              <select 
                className="text-xs border rounded p-1"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending Review</option>
                <option value="needs_more_information">Needs Info</option>
                <option value="approved_for_promotion">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {filteredCandidates.length === 0 ? (
              <EmptyState title="No candidates found" description="No candidates match selected filters." />
            ) : (
              filteredCandidates.map(c => (
                <div key={c.candidateId} onClick={() => setSelectedCandidate(c)}>
                  <SentinelCard 
                    interactive 
                    className={`p-4 border-l-4 ${selectedCandidate?.candidateId === c.candidateId ? 'border-l-blue-600 bg-blue-50/50' : 'border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <StatusBadge tone={c.priority === 'critical' ? 'critical' : c.priority === 'high' ? 'high' : 'medium'}>
                        {c.priority.toUpperCase()}
                      </StatusBadge>
                      <span className="text-[10px] text-slate-400 font-mono">{c.candidateId}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-2">{c.summary}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">{c.candidateType.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </SentinelCard>
                </div>
              ))
            )}
          </div>

          {/* Detail Column */}
          <div className="lg:col-span-2">
            {selectedCandidate ? (
              <SentinelCard className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{selectedCandidate.summary}</h3>
                    <p className="text-sm text-slate-500">Source System: {selectedCandidate.sourceSystem}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge tone={
                      selectedCandidate.status === 'approved_for_promotion' ? 'success' : 
                      selectedCandidate.status === 'pending_review' ? 'blue' : 
                      selectedCandidate.status === 'blocked' ? 'critical' : 'slate'
                    }>
                      {selectedCandidate.status.toUpperCase().replace(/_/g, ' ')}
                    </StatusBadge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Jurisdiction</h4>
                    <p className="text-sm font-medium">{selectedCandidate.jurisdiction.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Authority Tier</h4>
                    <p className="text-sm font-medium">{selectedCandidate.authorityTier.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Mechanisms</h4>
                    <p className="text-sm font-medium">{selectedCandidate.mechanisms.join(', ') || 'None identified'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Source References</h4>
                    <p className="text-sm font-medium">{selectedCandidate.sourceReferences.join(', ') || 'No references'}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Proposed Knowledge / Change</h4>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap">
                      {selectedCandidate.proposedKnowledgeText}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Evidence Basis</h4>
                    <p className="text-sm italic text-slate-600 bg-white border border-slate-200 p-4 rounded-xl">{selectedCandidate.evidenceBasis}</p>
                  </div>
                </div>

                {selectedCandidate.governanceFlags.length > 0 && (
                  <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <h4 className="text-xs font-black text-orange-900 mb-2 flex items-center">
                      ⚠️ Governance Flags
                    </h4>
                    <ul className="text-xs text-orange-800 list-disc list-inside space-y-1">
                      {selectedCandidate.governanceFlags.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-100">
                  <AppButton 
                    variant="primary" 
                    disabled={selectedCandidate.status === 'blocked' || selectedCandidate.status === 'approved_for_promotion'}
                    onClick={() => handleAction(selectedCandidate.candidateId, 'approved_for_promotion')}
                  >
                    Approve
                  </AppButton>
                  <AppButton 
                    variant="secondary"
                    onClick={() => handleAction(selectedCandidate.candidateId, 'needs_more_information', 'Reviewer requested more info.')}
                  >
                    Request Info
                  </AppButton>
                  <AppButton 
                    variant="ghost"
                    onClick={() => handleAction(selectedCandidate.candidateId, 'rejected', 'Reviewer rejected.')}
                  >
                    Reject
                  </AppButton>
                  <AppButton 
                    variant="danger"
                    onClick={() => handleAction(selectedCandidate.candidateId, 'blocked', 'Reviewer blocked for safety/compliance.')}
                  >
                    Block
                  </AppButton>
                </div>

                <div className="mt-12 text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                  <p>⚖️ GOVERNANCE NOTICE: Candidates are staged for human review. Do not promote to approved knowledge without source verification. SafeScope remains an advisory system and does not declare violations.</p>
                </div>
              </SentinelCard>
            ) : (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                <div>
                  <p className="text-lg font-bold">Select a candidate to review details.</p>
                  <p className="text-sm">Human verification is required for all learning and ingestion content.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppPanel>
    </div>
  );
}
