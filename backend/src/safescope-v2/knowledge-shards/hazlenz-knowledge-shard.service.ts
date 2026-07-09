import { Injectable } from "@nestjs/common";
import { HAZLENZ_KNOWLEDGE_SHARDS } from "./hazlenz-knowledge-shards.seed";
import {
  HazLenzKnowledgeShardLookup,
  HazLenzKnowledgeShardRecord,
} from "./hazlenz-knowledge-shard.types";

@Injectable()
export class HazLenzKnowledgeShardService {
  private readonly shards = HAZLENZ_KNOWLEDGE_SHARDS;

  findFocusedShards(lookup: HazLenzKnowledgeShardLookup): HazLenzKnowledgeShardRecord[] {
    const bundleIds = new Set(lookup.bundleIds || []);
    const sourceKeys = new Set(lookup.sourceKeys || []);
    const shardKey = String(lookup.shardKey || "");

    const exactShardMatches = this.shards.filter((shard) => shardKey && shard.shardKey === shardKey);
    if (exactShardMatches.length) return exactShardMatches;

    const bundleMatches = this.shards.filter((shard) => bundleIds.has(shard.bundleId));
    if (bundleMatches.length) return bundleMatches;

    const allowGenericPedestrianFallback = /\bmobile_equipment\b|\bstruck_by\b|\btraffic\b/i.test(shardKey);
    const allowedSourceKeys = new Set(
      Array.from(sourceKeys).filter((sourceKey) =>
        sourceKey !== "general-pedestrian-safety" || allowGenericPedestrianFallback,
      ),
    );

    if (!allowedSourceKeys.size) return [];

    return this.shards.filter((shard) =>
      shard.sourceKeys.some((sourceKey) => allowedSourceKeys.has(sourceKey)),
    );
  }

  getFocusedCitations(lookup: HazLenzKnowledgeShardLookup): string[] {
    return Array.from(
      new Set(
        this.findFocusedShards(lookup).flatMap((shard) => shard.citations),
      ),
    );
  }

  getShardSummary(lookup: HazLenzKnowledgeShardLookup) {
    const focused = this.findFocusedShards(lookup);

    return {
      matchedShardCount: focused.length,
      shardKeys: focused.map((shard) => shard.shardKey),
      bundleIds: Array.from(new Set(focused.map((shard) => shard.bundleId))),
      sourceKeys: Array.from(new Set(focused.flatMap((shard) => shard.sourceKeys))),
      citations: Array.from(new Set(focused.flatMap((shard) => shard.citations))),
      evidenceNeeded: Array.from(new Set(focused.flatMap((shard) => shard.evidenceNeeded))),
      correctiveActionPatterns: Array.from(
        new Set(focused.flatMap((shard) => shard.correctiveActionPatterns)),
      ),
    };
  }
}
