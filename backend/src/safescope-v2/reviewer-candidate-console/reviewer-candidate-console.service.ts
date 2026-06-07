import { Injectable, ForbiddenException } from '@nestjs/common';
import { 
  ReviewerCandidate, 
  CandidateFilter, 
  CandidateStatus,
  CandidateAuditEntry
} from './reviewer-candidate-console.types';
import { SafeScopePersistenceService } from '../persistence/persistence.service';
import { RoleBasedApprovalGatesService } from '../role-based-approval-gates/role-based-approval-gates.service';
import { ReviewerRole } from '../role-based-approval-gates/role-based-approval-gates.types';

@Injectable()
export class ReviewerCandidateConsoleService {
  constructor(
    private readonly persistence: SafeScopePersistenceService,
    private readonly gates: RoleBasedApprovalGatesService,
  ) {}

  async listCandidates(filter: CandidateFilter = {}): Promise<ReviewerCandidate[]> {
    const records = await this.persistence.find({
        type: 'reviewer_candidate',
        status: filter.status,
    });

    return records.map(r => r.payload as ReviewerCandidate).filter(c => {
      if (!c) return false;
      if (filter.candidateType && c.candidateType !== filter.candidateType) return false;
      if (filter.jurisdiction && c.jurisdiction !== filter.jurisdiction) return false;
      if (filter.priority && c.priority !== filter.priority) return false;
      if (filter.domainId && (!c.domainIds || !c.domainIds.includes(filter.domainId))) return false;
      return true;
    });
  }

  async getCandidateById(id: string): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    return record?.payload as ReviewerCandidate;
  }

  async addCandidate(candidate: Omit<ReviewerCandidate, 'candidateId' | 'createdAt' | 'status' | 'auditTrail'>): Promise<ReviewerCandidate> {
    const tempId = 'temp-' + Date.now();
    const newCandidate: ReviewerCandidate = {
      ...candidate,
      candidateId: tempId,
      createdAt: new Date().toISOString(),
      status: 'pending_review',
      auditTrail: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          actor: 'system',
          role: 'system',
          notes: 'Candidate registered for review'
      }]
    };

    const record = await this.persistence.save({
        type: 'reviewer_candidate',
        status: 'pending_review',
        payload: newCandidate,
        metadata: {
            candidateType: candidate.candidateType,
            priority: candidate.priority,
            jurisdiction: candidate.jurisdiction
        }
    });

    newCandidate.candidateId = record.id;
    await this.persistence.updateStatus(record.id, 'pending_review', { payload: newCandidate });

    return newCandidate;
  }

  async approveCandidate(id: string, reviewer: { name: string, role: string, notes?: string }): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    if (!record) return undefined;

    const candidate = record.payload as ReviewerCandidate;
    
    const gateResult = this.gates.evaluate({
      role: reviewer.role as ReviewerRole,
      action: 'approve',
      candidateType: candidate.candidateType,
      jurisdiction: candidate.jurisdiction,
      isRegulatory: candidate.authorityTier === 'primary_regulation' || candidate.authorityTier === 'secondary_regulation',
      containsProhibitedLanguage: this.checkForProhibitedLanguage(candidate.proposedKnowledgeText || ''),
      priority: candidate.priority
    });

    if (!gateResult.allowed) {
      throw new ForbiddenException(gateResult.reason);
    }

    candidate.status = 'approved_for_promotion';
    candidate.reviewerDecision = 'approve';
    candidate.reviewerRationale = reviewer.notes;
    this.addAuditEntry(candidate, 'approved', reviewer, gateResult);
    
    await this.persistence.updateStatus(id, 'approved_for_promotion', { payload: candidate });
    return candidate;
  }

  async rejectCandidate(id: string, reviewer: { name: string, role: string, notes: string }): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    if (!record) return undefined;

    const candidate = record.payload as ReviewerCandidate;
    
    const gateResult = this.gates.evaluate({
      role: reviewer.role as ReviewerRole,
      action: 'reject',
      candidateType: candidate.candidateType,
      jurisdiction: candidate.jurisdiction,
      priority: candidate.priority
    });

    if (!gateResult.allowed) {
      throw new ForbiddenException(gateResult.reason);
    }

    candidate.status = 'rejected';
    candidate.reviewerDecision = 'reject';
    candidate.reviewerRationale = reviewer.notes;
    this.addAuditEntry(candidate, 'rejected', reviewer, gateResult);
    
    await this.persistence.updateStatus(id, 'rejected', { payload: candidate });
    return candidate;
  }

  async requestMoreInfo(id: string, reviewer: { name: string, role: string, notes: string }): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    if (!record) return undefined;

    const candidate = record.payload as ReviewerCandidate;
    
    const gateResult = this.gates.evaluate({
      role: reviewer.role as ReviewerRole,
      action: 'request_info',
      candidateType: candidate.candidateType,
      jurisdiction: candidate.jurisdiction
    });

    if (!gateResult.allowed) {
      throw new ForbiddenException(gateResult.reason);
    }

    candidate.status = 'needs_more_information';
    this.addAuditEntry(candidate, 'requested_info', reviewer, gateResult);
    
    await this.persistence.updateStatus(id, 'needs_more_information', { payload: candidate });
    return candidate;
  }

  async blockCandidate(id: string, reviewer: { name: string, role: string, notes: string }): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    if (!record) return undefined;

    const candidate = record.payload as ReviewerCandidate;
    
    const gateResult = this.gates.evaluate({
      role: reviewer.role as ReviewerRole,
      action: 'block',
      candidateType: candidate.candidateType,
      jurisdiction: candidate.jurisdiction
    });

    if (!gateResult.allowed) {
      throw new ForbiddenException(gateResult.reason);
    }

    candidate.status = 'blocked';
    this.addAuditEntry(candidate, 'blocked', reviewer, gateResult);
    
    await this.persistence.updateStatus(id, 'blocked', { payload: candidate });
    return candidate;
  }

  async archiveCandidate(id: string, reviewer: { name: string, role: string, notes?: string }): Promise<ReviewerCandidate | undefined> {
    const record = await this.persistence.getById(id);
    if (!record) return undefined;

    const candidate = record.payload as ReviewerCandidate;
    
    const gateResult = this.gates.evaluate({
      role: reviewer.role as ReviewerRole,
      action: 'archive',
      candidateType: candidate.candidateType,
      jurisdiction: candidate.jurisdiction
    });

    if (!gateResult.allowed) {
      throw new ForbiddenException(gateResult.reason);
    }

    candidate.status = 'archived';
    this.addAuditEntry(candidate, 'archived', reviewer, gateResult);
    
    await this.persistence.updateStatus(id, 'archived', { payload: candidate });
    return candidate;
  }

  private addAuditEntry(candidate: ReviewerCandidate, action: string, actor: { name: string, role: string, notes?: string }, gateResult?: any) {
    candidate.auditTrail.push({
      action,
      timestamp: new Date().toISOString(),
      actor: actor.name,
      role: actor.role,
      notes: actor.notes,
      gateResult: gateResult ? { allowed: gateResult.allowed, reason: gateResult.reason } : undefined
    } as any);
  }

  private checkForProhibitedLanguage(text: string): boolean {
    const prohibited = ["is a violation", "creates a citation", "must comply", "regulatory violation"];
    return prohibited.some(p => text.toLowerCase().includes(p));
  }
}
