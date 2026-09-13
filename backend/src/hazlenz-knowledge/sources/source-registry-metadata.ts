import {
  getHazLenzSourceByKey,
  HAZLENZ_SOURCE_REGISTRY,
} from "./hazlenz-source-registry";

export function buildSourceRegistryMetadata(sourceKey: string) {
  const source = getHazLenzSourceByKey(sourceKey);

  if (!source) {
    throw new Error(
      `HazLenz source registry entry not found for sourceKey: ${sourceKey}`,
    );
  }

  return {
    sourceKey: source.sourceKey,
    sourceName: source.displayName,
    agency: source.agency,
    sourceType: source.sourceType,
    authorityTier: source.authorityTier,
    allowedUse: source.allowedUse,
    requiresApproval: source.requiresApproval,
    approvedForAutoIngestion: source.approvedForAutoIngestion,
    jurisdictionTags: source.jurisdictionTags,
    defaultHazardTags: source.hazardTags,
    defaultEquipmentTags: source.equipmentTags,
    defaultTaskTags: source.taskTags,
    defaultStandardTags: source.standardTags,
    defaultLessonTags: source.defaultLessonTags,
    baseUrl: source.baseUrl,
    refreshCadence: source.refreshCadence,
  };
}

export function listHazLenzSourceKeys() {
  return HAZLENZ_SOURCE_REGISTRY.map((source) => source.sourceKey);
}

export function mergeUniqueTags(
  ...tagSets: Array<string[] | undefined | null>
) {
  return Array.from(
    new Set(
      tagSets
        .flatMap((tags) => tags || [])
        .map((tag) => String(tag || "").trim())
        .filter(Boolean),
    ),
  );
}
