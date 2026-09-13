export interface HazLenzKnowledgeShardRecord {
  shardKey: string;
  bundleId: string;
  sourceKeys: string[];
  citations: string[];
  title: string;
  summary: string;
  applicability: string[];
  evidenceNeeded: string[];
  correctiveActionPatterns: string[];
  authorityTier: "primary_regulation" | "approved_guidance" | "approved_internal";
  approvedOnly: boolean;
}

export interface HazLenzKnowledgeShardLookup {
  shardKey?: string;
  bundleIds?: string[];
  sourceKeys?: string[];
}
