"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import SentinelCard from '../../../components/ui/SentinelCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import MetricBlock from '../../../components/ui/MetricBlock';
import { AppButton } from '../../../components/ui/AppButton';
import { AppPanel } from '../../../components/ui/AppPanel';
import { HeroPanel } from '../../../components/ui/HeroPanel';
import EmptyState from '../../../components/ui/EmptyState';
import LockedFeatureCard from '../../../components/ui/LockedFeatureCard';
import { API_BASE_URL } from '../../../lib/safescope';
import { authHeaders } from '../../../lib/auth';
import { canAccessProtectedArea, getStoredPlanCode, requiredPlanForArea, type PlanCode } from '../../../lib/planEntitlements';

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

// Roles for access demonstration
type SafeScopeRole = 'owner' | 'admin' | 'safety_manager' | 'compliance_admin' | 'field_inspector' | 'viewer';

// Mock Data
const MOCK_CANDIDATES: ReviewerCandidate[] = [
  {
    candidateId: 'demo-001',
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
    candidateId: 'demo-002',
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
  }
];

export default function ReviewerCandidateConsole() {
  const [candidates, setCandidates] = useState<ReviewerCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ReviewerCandidate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [reviewerNotes, setReviewerNotes] = useState<string>('');
  
  // Hardened Auth State
  const [currentUserRole, setCurrentUserRole] = useState<SafeScopeRole>('admin');
  const [userPlanTier, setUserPlanTier] = useState<'individual' | 'team' | 'company'>('company');
  const [planCode, setPlanCode] = useState<PlanCode>("basic");

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL + '/safescope/reviewer-candidates', {
        headers: authHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setIsBackendConnected(true);
      } else {
        throw new Error('Backend failed to respond correctly.');
      }
    } catch (e) {
      console.warn('Backend connection failed.');
      setIsBackendConnected(false);
      
      // Staging Hardening: Only allow mock data if explicitly enabled
      if (process.env.NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK === 'true') {
          console.log('SafeScope Review Demo Fallback enabled.');
          setCandidates(MOCK_CANDIDATES);
      } else {
          setError('Unable to connect to the SafeScope governance engine. Staging/Production mode: Demo data disabled.');
          setCandidates([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    setPlanCode(getStoredPlanCode());
  }, []);

  const canManage = ['owner', 'admin', 'safety_manager', 'compliance_admin'].includes(currentUserRole);
  const canPromote = ['owner', 'admin', 'compliance_admin'].includes(currentUserRole) && userPlanTier !== 'individual';

  const pendingCount = candidates.filter(c => c.status === 'pending_review').length;
  const needsInfoCount = candidates.filter(c => c.status === 'needs_more_information').length;
  const approvedCount = candidates.filter(c => c.status === 'approved_for_promotion').length;
  const rejectedCount = candidates.filter(c => c.status === 'rejected' || c.status === 'blocked').length;

  const filteredCandidates = filterStatus === 'all' 
    ? candidates 
    : candidates.filter(c => c.status === filterStatus);

  const handleAction = async (id: string, actionType: 'approve' | 'reject' | 'request-info' | 'block' | 'archive', notes?: string) => {
    if (!canManage) {
        alert('Unauthorized: Your role does not have permission to manage candidates.');
        return;
    }

    if (actionType === 'approve' && !canPromote) {
        alert('Unauthorized: Knowledge promotion requires Admin/Compliance role and a Team/Company plan.');
        return;
    }

    if (isBackendConnected && !id.startsWith('demo-')) {
        try {
            const response = await fetch(API_BASE_URL + '/safescope/reviewer-candidates/' + id + '/' + actionType, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ 
                    name: 'Current User', 
                    role: currentUserRole, 
                    notes: notes || 'Action: ' + actionType
                })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Action ' + actionType + ' failed.');
            }
            
            const updatedCandidate = await response.json();
            setCandidates(prev => prev.map(c => c.candidateId === id ? updatedCandidate : c));
            if (selectedCandidate?.candidateId === id) setSelectedCandidate(updatedCandidate);
            return;
        } catch (e) {
            console.error(e);
            alert('Error: ' + (e instanceof Error ? e.message : 'Action failed'));
        }
    } else if (process.env.NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK === 'true') {
        // Local fallback only in demo mode
        const statusMap: Record<string, CandidateStatus> = {
            'approve': 'approved_for_promotion',
            'reject': 'rejected',
            'request-info': 'needs_more_information',
            'block': 'blocked',
            'archive': 'archived'
        };

        setCandidates(prev => prev.map(c => {
          if (c.candidateId === id) {
            const updated = {
              ...c,
              status: statusMap[actionType],
              auditTrail: [
                ...c.auditTrail,
                { action: actionType, timestamp: new Date().toISOString(), actor: 'Current User', role: currentUserRole, notes }
              ]
            } as ReviewerCandidate;
            if (selectedCandidate?.candidateId === id) setSelectedCandidate(updated);
            return updated;
          }
          return c;
        }));
    } else {
        alert('Action unavailable: System is disconnected and Demo Fallback is disabled.');
    }
  };

  if (!canAccessProtectedArea("knowledge_library", planCode)) {
    return (
      <LockedFeatureCard
        eyebrow="Company Knowledge Governance"
        title="SafeScope knowledge review is Company-only."
        description="The review console controls source-backed knowledge candidates, approval decisions, and governed promotion into the SafeScope knowledge base."
        requiredPlan={requiredPlanForArea("knowledge_library")}
        bullets={[
          "Review proposed source-backed knowledge before it can influence future SafeScope output.",
          "Protect regulatory mappings with qualified approval and audit history.",
          "Keep Company knowledge governance separate from Basic and Pro field workflows.",
        ]}
        ctaLabel="View Company Plan"
      />
    );
  }

  return (
    <section className="space-y-5">
      <HeroPanel align="center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
          SafeScope Governance
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
          Reviewer candidate console.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
          Review staged source-backed knowledge candidates before they are promoted into approved SafeScope intelligence.
        </p>
      </HeroPanel>

      <AppPanel padding="sm" className="border-slate-200 bg-white px-3 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-[10px] font-black uppercase text-slate-500">
              {isBackendConnected ? 'Live Connection' : 'Demo Fallback'}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500">Role:</span>
            <select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as SafeScopeRole)}
              className="bg-transparent p-0 text-[10px] font-black uppercase text-blue-600 outline-none"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="compliance_admin">Compliance Admin</option>
              <option value="safety_manager">Safety Manager</option>
              <option value="field_inspector">Field Inspector</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500">Plan:</span>
            <select
              value={userPlanTier}
              onChange={(e) => setUserPlanTier(e.target.value as any)}
              className="bg-transparent p-0 text-[10px] font-black uppercase text-blue-600 outline-none"
            >
              <option value="company">Company</option>
              <option value="team">Team</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </AppPanel>

      <AppPanel className="py-8">
        {!canManage && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <span className="text-xl">🚫</span>
                <div>
                    <p className="text-xs font-black text-red-900 uppercase">ReadOnly Access</p>
                    <p className="text-[10px] font-bold text-red-700">Your current role ({currentUserRole.toUpperCase()}) does not have permission to manage candidates.</p>
                </div>
            </div>
        )}

        {error && (
             <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                    <p className="text-xs font-black text-amber-900 uppercase">Connection Issue</p>
                    <p className="text-[10px] font-bold text-amber-700">{error}</p>
                    <button onClick={fetchCandidates} className="text-[10px] text-blue-600 font-black uppercase hover:underline mt-1">
                        Retry Connection
                    </button>
                </div>
            </div>
        )}

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricBlock label="Pending" value={pendingCount} />
                <MetricBlock label="Needs Info" value={needsInfoCount} />
                <MetricBlock label="Approved" value={approvedCount} />
                <MetricBlock label="Rejected / Blocked" value={rejectedCount} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Candidates</h2>
                <select 
                    className="text-sm font-bold border border-slate-300 bg-white rounded-xl px-4 min-h-[48px] outline-none focus:border-[#1D72B8] w-full sm:w-auto"
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
                    <div key={c.candidateId} onClick={() => { setSelectedCandidate(c); setReviewerNotes(''); }}>
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
                        </div>
                    </SentinelCard>
                    </div>
                ))
                )}
            </div>

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
                    </div>

                    <div className="space-y-6 mb-8">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Proposed Knowledge</h4>
                        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap">
                        {selectedCandidate.proposedKnowledgeText}
                        </div>
                    </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-tighter">Reviewer Notes / Rationale</h4>
                        <textarea
                          className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
                          placeholder="Provide professional notes or rationale for this action..."
                          rows={3}
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <AppButton 
                        variant="primary" 
                        disabled={!canPromote || selectedCandidate.status === 'approved_for_promotion' || !isBackendConnected && process.env.NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK !== 'true'}
                        onClick={() => { handleAction(selectedCandidate.candidateId, 'approve', reviewerNotes); setReviewerNotes(''); }}
                    >
                        Approve & Promote
                    </AppButton>
                    <AppButton 
                        variant="secondary"
                        disabled={!canManage || !isBackendConnected && process.env.NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK !== 'true'}
                        onClick={() => { handleAction(selectedCandidate.candidateId, 'request-info', reviewerNotes || 'Reviewer requested more info.'); setReviewerNotes(''); }}
                    >
                        Request Info
                    </AppButton>
                    <AppButton 
                        variant="danger"
                        disabled={!canManage || !isBackendConnected && process.env.NEXT_PUBLIC_SAFESCOPE_REVIEW_DEMO_FALLBACK !== 'true'}
                        onClick={() => { handleAction(selectedCandidate.candidateId, 'block', reviewerNotes || 'Reviewer blocked for safety/compliance.'); setReviewerNotes(''); }}
                    >
                        Block
                    </AppButton>
                    </div>

                    {!canPromote && canManage && (
                        <p className="mt-4 text-[10px] font-bold text-amber-600 italic">
                            ⚠️ Promotion requires Compliance Admin role and Team/Company plan.
                        </p>
                    )}

                    <div className="mt-12 text-[10px] text-slate-400 border-t border-slate-100 pt-4">
                    <p>⚖️ GOVERNANCE NOTICE: Candidates are staged for human review. Do not promote to approved knowledge without source verification. SafeScope remains an advisory system.</p>
                    </div>
                </SentinelCard>
                ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                    <p className="text-lg font-bold">Select a candidate to review details.</p>
                </div>
                )}
            </div>
            </div>
        </>
        )}
      </AppPanel>
    </section>
  );
}
