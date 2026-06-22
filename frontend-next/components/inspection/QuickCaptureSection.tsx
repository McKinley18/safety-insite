import { hazardCategoryOptions } from "@/lib/inspection/inspectionConstants";

type Props = {
  inspectionContext: any;
  inspectionMode: "quick" | "advanced";
  setInspectionMode: (mode: "quick" | "advanced") => void;
  quickCapture: boolean;
  hazardCategory: string;
  setHazardCategory: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  photos: any[];
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

export default function QuickCaptureSection({
  inspectionMode,
  setInspectionMode,
  quickCapture,
  hazardCategory,
  setHazardCategory,
  location,
  setLocation,
  description,
  setDescription,
  photos,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionDue,
  setManualActionDue,
  manualActionClosureEvidence,
  setManualActionClosureEvidence,
  manualActions,
  addManualAction,
  removeManualAction,
}: Props) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            Describe Finding
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            Explain what the evidence shows.
          </p>
        </div>

        <div className="flex shrink-0 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setInspectionMode("quick")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${
              inspectionMode === "quick"
                ? "bg-white text-[#1D72B8] shadow-sm"
                : "text-slate-700"
            }`}
          >
            Quick
          </button>

          <button
            type="button"
            onClick={() => setInspectionMode("advanced")}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${
              inspectionMode === "advanced"
                ? "bg-white text-[#102A43] shadow-sm"
                : "text-slate-700"
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
          Observed Condition
        </label>
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          placeholder="Example: Loose railing on elevated platform near crusher."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-700">
          Location
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
          placeholder="Example: Crusher deck, west platform"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="text-xs font-black uppercase tracking-wide text-slate-700">
            Hazard Category
          </label>
          <span className="text-[11px] font-bold text-slate-700">Optional</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            value={hazardCategory}
            onChange={(event) => setHazardCategory(event.target.value)}
          >
            <option value="">Let HazLenz AI classify</option>
            {hazardCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            placeholder="Or type custom category"
            value={hazardCategory}
            onChange={(event) => setHazardCategory(event.target.value)}
          />
        </div>
      </div>

      {quickCapture && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-wide text-slate-700">
              Immediate Action
            </p>
            <span className="text-[11px] font-bold text-slate-700">
              Optional
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_140px_140px_180px]">
            <input
              value={manualActionTitle}
              onChange={(event) => setManualActionTitle(event.target.value)}
              placeholder="Example: Barricade area until repaired"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            />

            <select
              value={manualActionPriority}
              onChange={(event) => setManualActionPriority(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <input
              type="date"
              value={manualActionDue}
              onChange={(event) => setManualActionDue(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            />

            <select
              value={manualActionClosureEvidence}
              onChange={(event) =>
                setManualActionClosureEvidence(event.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8]"
            >
              <option>Photo</option>
              <option>Work order</option>
              <option>Supervisor verification</option>
              <option>Training record</option>
              <option>Other</option>
            </select>
          </div>

          <button
            type="button"
            onClick={addManualAction}
            className="insite-inspection-action insite-inspection-action-navy insite-inspection-action-sm mt-3"
          >
            Add Action
          </button>

          {!!manualActions.length && (
            <div className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
              {manualActions.map((action, index) => (
                <div
                  key={`${action.title}-${index}`}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {action.title}
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {action.priority} • Due: {action.due || "Not set"} •
                      Closure: {action.closureEvidence || "Photo"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeManualAction(index)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-slate-200 pt-3 text-xs font-black text-slate-700">
        Photos {photos.length} ·{" "}
        {description ? "Condition described" : "No description"} ·{" "}
        {location ? "Location added" : "No location"} ·{" "}
        {hazardCategory ? `Category: ${hazardCategory}` : "Category: HazLenz AI"}
      </div>
    </>
  );
}
