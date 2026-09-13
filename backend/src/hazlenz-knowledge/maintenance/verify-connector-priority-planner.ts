import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";
import { getGovernanceConfig } from "../ingestion/ingestion-control-plane";
import { getConnectorPriority } from "../ingestion/connector-priority-planner";

function verify() {
  console.log("SafeScope Knowledge Connector Priority Audit:");

  const sources = SAFESCOPE_SOURCE_REGISTRY;
  const configMap = sources.map((s) => {
    const gov = getGovernanceConfig(
      s.sourceKey,
      s.requiresApproval,
      s.sourceType,
      s.agency,
    );
    return {
      ...s,
      gov,
      priority: getConnectorPriority(
        s.sourceKey,
        s.agency,
        s.sourceType,
        s.authorityTier,
        gov.connectorStatus,
      ),
    };
  });

  console.log(`Total sources evaluated: ${configMap.length}`);
  const connectorStatusStats = configMap.reduce(
    (acc, c) => {
      const val = c.gov.connectorStatus;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("Connector Statuses:", connectorStatusStats);

  const phaseStats = configMap.reduce(
    (acc, c) => {
      const val = c.priority.recommendedPhase;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log("Recommended Phases:", phaseStats);

  console.log("\nTop 10 Connector Priorities:");
  [...configMap]
    .sort(
      (a, b) => b.priority.totalPriorityScore - a.priority.totalPriorityScore,
    )
    .slice(0, 10)
    .forEach((c) => {
      console.log(
        `- ${c.sourceKey}: ${c.priority.connectorPriority} / ${c.priority.recommendedPhase} / Score: ${c.priority.totalPriorityScore} [${c.priority.implementationNotes}]`,
      );
    });

  const errors: string[] = [];
  configMap.forEach((c) => {
    if (
      c.sourceKey.startsWith("ansi-") &&
      c.priority.connectorPriority !== "not_applicable" &&
      c.priority.totalPriorityScore > 2
    )
      errors.push(
        `${c.sourceKey} consensus metadata should be low/not_applicable`,
      );
    if (
      c.agency === "INTERNAL" &&
      ["immediate", "high"].includes(c.priority.connectorPriority)
    )
      errors.push(
        `${c.sourceKey} internal source should not be immediate/high priority`,
      );
  });

  if (errors.length > 0) {
    console.error("\nVerification Failed:");
    errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log("\nPriority verification passed.");
  }
}

verify();
