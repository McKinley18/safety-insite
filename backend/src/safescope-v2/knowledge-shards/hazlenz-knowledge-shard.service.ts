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

    return this.shards.filter((shard) => {
      if (lookup.shardKey && shard.shardKey === lookup.shardKey) return true;
      if (bundleIds.has(shard.bundleId)) return true;
      if (shard.sourceKeys.some((sourceKey) => sourceKeys.has(sourceKey))) return true;
      return false;
    });
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
