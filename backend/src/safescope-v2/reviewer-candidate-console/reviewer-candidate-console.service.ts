import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { 
  ReviewerCandidate, 
  CandidateFilter, 
  CandidateStatus,
  CandidateAuditEntry
} from './reviewer-candidate-console.types';

@Injectable()
export class ReviewerCandidateConsoleService {
  private candidates: ReviewerCandidate[] = [];
  private readonly dataPath = path.resolve(__dirname, '../../../../safescope-data/reviewer-candidates/candidates.json');

  constructor() {
    this.loadCandidates();
  }

  private loadCandidates() {
    if (fs.existsSync(this.dataPath)) {
      try {
        const data = fs.readFileSync(this.dataPath, 'utf-8');
        this.candidates = JSON.parse(data);
      } catch (e) {
        console.error('Failed to load reviewer candidates:', e);
        this.candidates = [];
      }
    }
  }

  private saveCandidates() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(this.candidates, null, 2));
    } catch (e) {
      console.error('Failed to save reviewer candidates:', e);
    }
  }

  listCandidates(filter: CandidateFilter = {}): ReviewerCandidate[] {
    return this.candidates.filter(c => {
      if (filter.status && c.status !== filter.status) return false;
      if (filter.candidateType && c.candidateType !== filter.candidateType) return false;
      if (filter.jurisdiction && c.jurisdiction !== filter.jurisdiction) return false;
      if (filter.priority && c.priority !== filter.priority) return false;
      if (filter.domainId && !c.domainIds.includes(filter.domainId)) return false;
      return true;
    });
  }

  getCandidateById(id: string): ReviewerCandidate | undefined {
    return this.candidates.find(c => c.candidateId === id);
  }

  addCandidate(candidate: Omit<ReviewerCandidate, 'candidateId' | 'createdAt' | 'status' | 'auditTrail'>): ReviewerCandidate {
    const newCandidate: ReviewerCandidate = {
      ...candidate,
      candidateId: `cand-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
    this.candidates.push(newCandidate);
    this.saveCandidates();
    return newCandidate;
  }

  approveCandidate(id: string, reviewer: { name: string, role: string, notes?: string }): ReviewerCandidate | undefined {
    const candidate = this.getCandidateById(id);
    if (candidate) {
      candidate.status = 'approved_for_promotion';
      candidate.reviewerDecision = 'approve';
      candidate.reviewerRationale = reviewer.notes;
      this.addAuditEntry(candidate, 'approved', reviewer);
      this.saveCandidates();
    }
    return candidate;
  }

  rejectCandidate(id: string, reviewer: { name: string, role: string, notes: string }): ReviewerCandidate | undefined {
    const candidate = this.getCandidateById(id);
    if (candidate) {
      candidate.status = 'rejected';
      candidate.reviewerDecision = 'reject';
      candidate.reviewerRationale = reviewer.notes;
      this.addAuditEntry(candidate, 'rejected', reviewer);
      this.saveCandidates();
    }
    return candidate;
  }

  requestMoreInfo(id: string, reviewer: { name: string, role: string, notes: string }): ReviewerCandidate | undefined {
    const candidate = this.getCandidateById(id);
    if (candidate) {
      candidate.status = 'needs_more_information';
      this.addAuditEntry(candidate, 'requested_info', reviewer);
      this.saveCandidates();
    }
    return candidate;
  }

  blockCandidate(id: string, reviewer: { name: string, role: string, notes: string }): ReviewerCandidate | undefined {
    const candidate = this.getCandidateById(id);
    if (candidate) {
      candidate.status = 'blocked';
      this.addAuditEntry(candidate, 'blocked', reviewer);
      this.saveCandidates();
    }
    return candidate;
  }

  archiveCandidate(id: string, reviewer: { name: string, role: string, notes?: string }): ReviewerCandidate | undefined {
    const candidate = this.getCandidateById(id);
    if (candidate) {
      candidate.status = 'archived';
      this.addAuditEntry(candidate, 'archived', reviewer);
      this.saveCandidates();
    }
    return candidate;
  }

  private addAuditEntry(candidate: ReviewerCandidate, action: string, actor: { name: string, role: string, notes?: string }) {
    candidate.auditTrail.push({
      action,
      timestamp: new Date().toISOString(),
      actor: actor.name,
      role: actor.role,
      notes: actor.notes
    });
  }
}
