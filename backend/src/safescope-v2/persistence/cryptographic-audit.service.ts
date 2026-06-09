import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { SafeScopeAuditRecord } from './persistence.types';

@Injectable()
export class CryptographicAuditService {
  private readonly signingKey: string;

  constructor() {
    this.signingKey = process.env.SAFESCOPE_AUDIT_SIGNING_KEY || 'sentinel-safety-safescope-audit-secret-fallback-key-2026';
  }

  /**
   * Generates a canonical string representation of record fields.
   * Strict ordering guarantees that identical inputs always yield identical signatures.
   */
  private generateCanonicalPayload(record: Partial<SafeScopeAuditRecord>): string {
    const payloadStr = typeof record.payload === 'object'
      ? JSON.stringify(record.payload)
      : String(record.payload || '');

    return [
      record.id || '',
      record.type || '',
      record.workspaceId || 'system',
      record.status || '',
      payloadStr,
      record.createdAt || ''
    ].join('|');
  }

  /**
   * Signs a SafeScopeAuditRecord by appending an HMAC-SHA256 signature to its metadata
   */
  public signRecord(record: SafeScopeAuditRecord): SafeScopeAuditRecord {
    const canonical = this.generateCanonicalPayload(record);
    const hmac = crypto.createHmac('sha256', this.signingKey);
    hmac.update(canonical);
    const signature = hmac.digest('hex');

    if (!record.metadata) {
      record.metadata = {};
    }

    record.metadata.cryptographicSignature = signature;
    record.metadata.signedBy = 'system-keys-v1';
    record.metadata.signatureVerified = true;
    record.metadata.isTampered = false;

    return record;
  }

  /**
   * Verifies the cryptographic signature of a SafeScopeAuditRecord.
   * Employs constant-time timingSafeEqual comparison to protect against timing attacks.
   */
  public verifyRecord(record: SafeScopeAuditRecord): boolean {
    if (!record.metadata || !record.metadata.cryptographicSignature) {
      return false;
    }

    const storedSignature = record.metadata.cryptographicSignature;
    const canonical = this.generateCanonicalPayload(record);
    
    const hmac = crypto.createHmac('sha256', this.signingKey);
    hmac.update(canonical);
    const recalculated = hmac.digest('hex');

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(storedSignature, 'hex'),
        Buffer.from(recalculated, 'hex')
      );
      
      record.metadata.signatureVerified = match;
      record.metadata.isTampered = !match;
      
      return match;
    } catch (e) {
      record.metadata.signatureVerified = false;
      record.metadata.isTampered = true;
      return false;
    }
  }
}
