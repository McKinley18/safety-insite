"use client";

import SafeScopeAdvancedReasoning from "@/components/inspection/SafeScopeAdvancedReasoning";
import SafeScopeCompactReasoning from "@/components/inspection/SafeScopeCompactReasoning";
import { SafeScopeIntelligencePanel } from "@/components/safescope/panels/IntelligencePanel";
import { createDisplayAdapter } from "@/lib/safescope/adapters/intelligence-display.adapter";
import { Accordion } from "@/components/ui/Accordion";

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
    <div className="mt-4">
      <Accordion
        title="View AI Reasoning Trace"
        defaultOpen={safeScopeCompactDetailsOpen}
        onToggle={(open) => setSafeScopeCompactDetailsOpen(() => open)}
      >
        <SafeScopeCompactReasoning
          safeScopeResult={safeScopeResult}
          safeScopeAdvancedOpen={safeScopeAdvancedOpen}
          setSafeScopeAdvancedOpen={setSafeScopeAdvancedOpen}
        />

        {safeScopeAdvancedOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <SafeScopeAdvancedReasoning safeScopeResult={safeScopeResult} />
            {adapter && <SafeScopeIntelligencePanel adapter={adapter} />}
          </div>
        )}
      </Accordion>
    </div>
  );
}
