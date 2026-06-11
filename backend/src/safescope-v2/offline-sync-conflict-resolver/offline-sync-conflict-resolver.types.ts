export type OfflineTraceSnapshot = {
  id?: string;
  reportId: string;
  workspaceId: string;
  classification?: string;
  validationStatus: string;
  intelligenceMetadata?: any;
  deviceTimestamp: string; // ISO 8601 string recorded on the client device
  userId: string;
};

export type MergeResult = {
  mergedSnapshot: OfflineTraceSnapshot;
  hasConflict: boolean;
  conflictDetails: string[];
};
