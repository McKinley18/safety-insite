import { Injectable } from '@nestjs/common';
import { OfflineTraceSnapshot, MergeResult } from './offline-sync-conflict-resolver.types';

@Injectable()
export class OfflineTraceConflictResolverService {
  resolveConflict(serverRecord: OfflineTraceSnapshot, clientRecord: OfflineTraceSnapshot): MergeResult {
    const conflictDetails: string[] = [];
    let hasConflict = false;

    const serverTime = new Date(serverRecord.deviceTimestamp).getTime();
    const clientTime = new Date(clientRecord.deviceTimestamp).getTime();

    // Determine base based on timestamp
    const newer = clientTime >= serverTime ? clientRecord : serverRecord;
    const older = clientTime >= serverTime ? serverRecord : clientRecord;

    const mergedSnapshot: OfflineTraceSnapshot = {
      reportId: serverRecord.reportId,
      workspaceId: serverRecord.workspaceId,
      deviceTimestamp: newer.deviceTimestamp,
      userId: newer.userId,
      classification: newer.classification,
      validationStatus: newer.validationStatus,
      intelligenceMetadata: { ...(newer.intelligenceMetadata || {}) },
    };

    // 1. Classification check
    if (serverRecord.classification !== clientRecord.classification && serverRecord.classification && clientRecord.classification) {
      const timeDiffSeconds = Math.abs(serverTime - clientTime) / 1000;
      if (timeDiffSeconds <= 15) {
        // Concurrent conflict within 15 seconds
        hasConflict = true;
        conflictDetails.push(`Concurrent classification conflict: "${serverRecord.classification}" (User: ${serverRecord.userId}) vs "${clientRecord.classification}" (User: ${clientRecord.userId})`);
        mergedSnapshot.validationStatus = 'conflict_hold';
        mergedSnapshot.classification = 'unclear';
      } else {
        // Not concurrent, newer wins cleanly
        mergedSnapshot.classification = newer.classification;
      }
    }

    // 2. ValidationStatus check
    if (serverRecord.validationStatus !== clientRecord.validationStatus && serverRecord.validationStatus && clientRecord.validationStatus) {
      const timeDiffSeconds = Math.abs(serverTime - clientTime) / 1000;
      if (timeDiffSeconds <= 15 && !hasConflict) {
        hasConflict = true;
        conflictDetails.push(`Concurrent validationStatus conflict: "${serverRecord.validationStatus}" vs "${clientRecord.validationStatus}"`);
        mergedSnapshot.validationStatus = 'conflict_hold';
      } else if (timeDiffSeconds > 15) {
        mergedSnapshot.validationStatus = newer.validationStatus;
      }
    }

    // 3. Metadata field-level merge
    const serverMetadata = serverRecord.intelligenceMetadata || {};
    const clientMetadata = clientRecord.intelligenceMetadata || {};

    const allKeys = Array.from(new Set([...Object.keys(serverMetadata), ...Object.keys(clientMetadata)]));
    allKeys.forEach((key) => {
      const serverVal = serverMetadata[key];
      const clientVal = clientMetadata[key];

      if (serverVal !== clientVal) {
        if (serverVal && clientVal && JSON.stringify(serverVal) !== JSON.stringify(clientVal)) {
          const timeDiffSeconds = Math.abs(serverTime - clientTime) / 1000;
          if (timeDiffSeconds <= 15) {
            // Concurrent key conflict: flag but let the newer value remain while raising conflict
            hasConflict = true;
            conflictDetails.push(`Concurrent field-level conflict on "${key}": "${JSON.stringify(serverVal)}" vs "${JSON.stringify(clientVal)}"`);
            mergedSnapshot.validationStatus = 'conflict_hold';
            mergedSnapshot.intelligenceMetadata[key] = newer.intelligenceMetadata[key];
          } else {
            // Newer wins
            mergedSnapshot.intelligenceMetadata[key] = clientTime >= serverTime ? clientVal : serverVal;
          }
        } else if (serverVal && !clientVal) {
          // Carry over the existing server value if client metadata didn't have it
          mergedSnapshot.intelligenceMetadata[key] = serverVal;
        } else if (!serverVal && clientVal) {
          // Carry over client value
          mergedSnapshot.intelligenceMetadata[key] = clientVal;
        }
      }
    });

    if (hasConflict) {
      mergedSnapshot.intelligenceMetadata.conflictHistory = [
        ...(mergedSnapshot.intelligenceMetadata.conflictHistory || []),
        {
          timestamp: new Date().toISOString(),
          details: conflictDetails,
        },
      ];
    }

    return {
      mergedSnapshot,
      hasConflict,
      conflictDetails,
    };
  }
}
