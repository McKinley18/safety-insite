import { SafeScopeOrchestratorService } from '../src/safescope/safescope-orchestrator.service';

async function validate() {
  const service = new SafeScopeOrchestratorService();
  const request = {
    observationText: "Worker standing on pallet raised by forklift with no fall protection.",
    regulatoryContext: "OSHA_GENERAL" as const,
    equipmentContext: "Forklift / pallet",
    sourceIntelligenceEnabled: true,
    standardsMatchingEnabled: true,
    reviewMode: false
  };

  const result = service.analyze(request);
  console.log(JSON.stringify(result, null, 2));

  if (!result.analysisId.startsWith("safescope_stub_")) throw new Error("Invalid analysisId");
  if (result.governanceFlags.databaseWriteAllowed !== false) throw new Error("Governance: Write allowed");
  if (result.governanceFlags.productionEndpointEnabled !== false) throw new Error("Governance: Production enabled");
  if (result.governanceFlags.sourceIntelligenceDoesNotOverrideStandards !== true) throw new Error("Governance: Standards overridden");
  if (!result.auditTrace || !Array.isArray(result.auditTrace.engines)) throw new Error("Audit trace missing");
  if (!result.executiveSummaryText.toLowerCase().includes("stub")) throw new Error("Missing stub text");

  console.log("Validation passed.");
}

validate().catch(e => { console.error(e); process.exit(1); });
