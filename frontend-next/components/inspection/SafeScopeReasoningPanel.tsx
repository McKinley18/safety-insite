"use client";

import SafeScopeAdvancedReasoning from "@/components/inspection/SafeScopeAdvancedReasoning";
import SafeScopeCompactReasoning from "@/components/inspection/SafeScopeCompactReasoning";
import { SafeScopeIntelligencePanel } from "@/components/safescope/panels/IntelligencePanel";
import { createDisplayAdapter } from "@/lib/safescope/adapters/intelligence-display.adapter";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type SafeScopeReasoningPanelProps = {
  safeScopeResult: any;
  safeScopeCompactDetailsOpen: boolean;
  setSafeScopeCompactDetailsOpen: ToggleSetter;
  safeScopeAdvancedOpen: boolean;
  setSafeScopeAdvancedOpen: ToggleSetter;
};

export default function SafeScopeReasoningPanel({
  safeScopeResult,
  safeScopeCompactDetailsOpen,
  setSafeScopeCompactDetailsOpen,
  safeScopeAdvancedOpen,
  setSafeScopeAdvancedOpen,
}: SafeScopeReasoningPanelProps) {
  const adapter = safeScopeResult ? createDisplayAdapter(safeScopeResult, 'professional') : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setSafeScopeCompactDetailsOpen((open) => !open)}
        className="text-xs font-black uppercase tracking-wide text-[#1D72B8] hover:underline"
      >
        {safeScopeCompactDetailsOpen ? "Hide reasoning" : "Show reasoning"}
      </button>

      {safeScopeCompactDetailsOpen && (
        <div className="mt-3">
          <SafeScopeCompactReasoning
            safeScopeResult={safeScopeResult}
            safeScopeAdvancedOpen={safeScopeAdvancedOpen}
            setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
          />

          {safeScopeAdvancedOpen && (
            <>
              <SafeScopeAdvancedReasoning safeScopeResult={safeScopeResult} />
              {adapter && <SafeScopeIntelligencePanel adapter={adapter} />}
            </>
          )}
        </div>
      )}
    </>
  );
}
