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
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

export default function QuickCaptureSection({
  inspectionContext,
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
  handlePhotoUpload,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionDue,
  setManualActionDue,
  manualActions,
  addManualAction,
  removeManualAction,
}: Props) {
  return (
    <>
      <p className="mb-4 text-sm font-semibold leading-6 text-slate-500">
        {inspectionContext?.inspectionType === "quick_hazard_capture"
          ? "Capture the hazard quickly. Add only what is needed now; deeper review can happen later."
          : "Fast capture is the priority. Add the category, location, and a short description now. Risk scoring, standards, and SafeScope intelligence can be added after the finding is saved."}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setInspectionMode("quick")}
          className={`rounded-full px-4 py-2 text-xs font-black transition ${
            inspectionMode === "quick" ? "bg-[#1D72B8] text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          Quick Capture
        </button>

        <button
          type="button"
          onClick={() => setInspectionMode("advanced")}
          className={`rounded-full px-4 py-2 text-xs font-black transition ${
            inspectionMode === "advanced" ? "bg-[#102A43] text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          Advanced Review
        </button>

        <span className="text-xs font-bold text-slate-500">
          {inspectionMode === "quick" ? "Fastest workflow for field inspections." : "Expanded intelligence and defensibility workflow."}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Hazard Category
          </label>
          <input
            list="hazard-category-options"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            placeholder="Choose or type"
            value={hazardCategory}
            onChange={(event) => setHazardCategory(event.target.value)}
          />
          <datalist id="hazard-category-options">
            {hazardCategoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Location
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            placeholder="Example: Conveyor 3, north catwalk"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
          Observed Condition
        </label>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
          placeholder="Describe what is wrong, who may be exposed, and whether the condition is active."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {quickCapture && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Photo Evidence
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]">
              Take Photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            </label>

            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
              Upload
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          {!!photos.length && (
            <p className="mt-3 text-xs font-black text-slate-500">
              {photos.length} photo(s) attached.
            </p>
          )}
        </div>
      )}

      {quickCapture && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-[#1D72B8]">
            Quick Action
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_160px_160px]">
            <input
              value={manualActionTitle}
              onChange={(event) => setManualActionTitle(event.target.value)}
              placeholder="Corrective action"
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            />

            <select
              value={manualActionPriority}
              onChange={(event) => setManualActionPriority(event.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
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
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={addManualAction}
            className="mt-3 rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
          >
            Add Action
          </button>

          {!!manualActions.length && (
            <div className="mt-3 border-y border-slate-200">
              {manualActions.map((action, index) => (
                <div key={`${action.title}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 last:border-b-0">
                  <div>
                    <p className="text-sm font-black text-slate-900">{action.title}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      {action.priority} • Due: {action.due || "Not set"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeManualAction(index)}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
        {hazardCategory && (
          <span className="rounded-full bg-[#E8F4FF] px-3 py-1 text-[#1D72B8]">{hazardCategory}</span>
        )}
        {location && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{location}</span>
        )}
        {description && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Description added</span>
        )}
      </div>
    </>
  );
}
