"use client";

type Props = {
  safeScopeResult: any;
};

function asList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

function formatMode(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

function getTone(mode: any) {
  if (mode === "specific_with_archetype_support") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (mode === "specific_task_mechanism") {
    return "bg-blue-50 text-blue-700 ring-blue-200";
  }

  if (mode === "archetype_fallback") {
    return "bg-amber-50 text-amber-800 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-800";
}

function DetailList({
  title,
  items,
  limit = 4,
}: {
  title: string;
  items: string[];
  limit?: number;
}) {
  if (!items.length) return null;

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-semibold leading-5 text-slate-700 dark:text-slate-300">
        {items.slice(0, limit).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function SafeScopeEquipmentReasoningSection({
  safeScopeResult,
}: Props) {
  const summary = safeScopeResult?.equipmentReasoningSummary;
  const taskContext = safeScopeResult?.equipmentTaskMechanismContext;
  const archetypeContext = safeScopeResult?.equipmentArchetypeContext;

  if (!summary && !taskContext?.matched && !archetypeContext?.matched) {
    return null;
  }

  const mode = summary?.primaryReasoningMode || "insufficient_equipment_context";
  const primarySpecific = taskContext?.primaryMatch;
  const primaryArchetype = archetypeContext?.primaryMatch;

  const harmMechanisms = asList(
    primarySpecific?.harmMechanisms || primaryArchetype?.harmMechanisms,
  ).map((item) => item.replace(/_/g, " "));

  const likelyDomains = asList(
    primarySpecific?.likelyHazardDomains || primaryArchetype?.likelyHazardDomains,
  ).map((item) => item.replace(/_/g, " "));

  const correctiveThemes = asList(
    primarySpecific?.correctiveActionThemes ||
      primaryArchetype?.correctiveActionThemes,
  );

  const verificationEvidence = asList(
    primarySpecific?.verificationEvidence ||
      primaryArchetype?.verificationEvidence,
  );

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1D72B8]">
            Equipment & Task Mechanism Intelligence
          </p>
          <h3 className="mt-1 text-base font-black text-slate-900 dark:text-slate-100">
            {summary?.primaryEquipmentContext || "Equipment context pending"}
          </h3>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300">
            {summary?.primaryMechanismOrArchetype ||
              "ReviewCore needs more equipment, component, or task detail."}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${getTone(
            mode,
          )}`}
        >
          {formatMode(mode)}
        </span>
      </div>

      {!!summary?.supportingContext?.length && (
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 ring-1 ring-blue-100">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-700">
            Supporting context
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-blue-900">
            {summary.supportingContext.slice(0, 3).join(" • ")}
          </p>
        </div>
      )}

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <DetailList
          title="Why ReviewCore ranked it this way"
          items={asList(summary?.rankingReasons)}
          limit={4}
        />
        <DetailList
          title="Evidence questions"
          items={asList(summary?.evidenceGaps)}
          limit={4}
        />
        <DetailList
          title="Harm mechanisms"
          items={harmMechanisms}
          limit={5}
        />
        <DetailList
          title="Likely domains"
          items={likelyDomains}
          limit={5}
        />
        <DetailList
          title="Corrective action themes"
          items={correctiveThemes}
          limit={4}
        />
        <DetailList
          title="Verification evidence"
          items={verificationEvidence}
          limit={4}
        />
      </div>

      {!!summary?.cautions?.length && (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-800">
            Cautions
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs font-bold leading-5 text-amber-950">
            {asList(summary.cautions)
              .slice(0, 3)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </div>
      )}

      <p className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-bold leading-5 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-800">
        ReviewCore equipment reasoning is context-only and advisory. It does not
        declare violations, create citations, override regulations, or replace
        qualified review.
      </p>
    </section>
  );
}
