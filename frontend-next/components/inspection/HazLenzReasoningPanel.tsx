"use client";

import HazLenzAdvancedReasoning from "@/components/inspection/HazLenzAdvancedReasoning";
import HazLenzCompactReasoning from "@/components/inspection/HazLenzCompactReasoning";
import HazLenzRationaleVisualizer from "@/components/inspection/HazLenzRationaleVisualizer";
import { HazLenzIntelligencePanel } from "@/components/hazlenz/panels/IntelligencePanel";
import { createDisplayAdapter } from "@/lib/hazlenzTypes/adapters/intelligence-display.adapter";
import { Accordion } from "@/components/ui/Accordion";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

type HazLenzReasoningPanelProps = {
  safeScopeResult: any;
  hazLenzCompactDetailsOpen: boolean;
  setHazLenzCompactDetailsOpen: ToggleSetter;
  hazLenzAdvancedOpen: boolean;
  setHazLenzAdvancedOpen: ToggleSetter;
};

export default function HazLenzReasoningPanel({
  safeScopeResult,
  hazLenzCompactDetailsOpen,
  setHazLenzCompactDetailsOpen,
  hazLenzAdvancedOpen,
  setHazLenzAdvancedOpen,
}: HazLenzReasoningPanelProps) {
  const adapter = safeScopeResult ? createDisplayAdapter(safeScopeResult, 'professional') : null;

  return (
    <div className="mt-4">
      <Accordion
        title="View AI Reasoning Trace"
        defaultOpen={hazLenzCompactDetailsOpen}
        onToggle={(open) => setHazLenzCompactDetailsOpen(() => open)}
      >
        <HazLenzCompactReasoning
          safeScopeResult={safeScopeResult}
          hazLenzAdvancedOpen={hazLenzAdvancedOpen}
          setHazLenzAdvancedOpen={setHazLenzAdvancedOpen}
        />

        {hazLenzAdvancedOpen && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <HazLenzRationaleVisualizer safeScopeResult={safeScopeResult} />
            <HazLenzAdvancedReasoning safeScopeResult={safeScopeResult} />
            {adapter && <HazLenzIntelligencePanel adapter={adapter} />}
          </div>
        )}
      </Accordion>
    </div>
  );
}
