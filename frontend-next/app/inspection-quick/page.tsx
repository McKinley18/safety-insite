"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addActivityEvent } from "@/lib/activityStorage";
import {
  createActionId,
  getStoredActions,
  saveStoredActions,
} from "@/lib/actionStorage";
import { saveEncryptedPhoto } from "@/lib/evidenceStorage";
import { getReports, setLatestReport, setReports } from "@/lib/reportStorage";

const hazardCategoryOptions = [
  "Machine Guarding",
  "Electrical",
  "Fall Protection",
  "Walking/Working Surfaces",
  "Lockout/Tagout",
  "PPE",
  "Housekeeping",
  "Mobile Equipment",
  "Confined Space",
  "Fire Protection",
  "Hazard Communication",
  "Material Handling",
  "Emergency Egress",
  "Other",
];

function inferCategory(text: string) {
  const value = text.toLowerCase();

  if (value.includes("guard") || value.includes("conveyor") || value.includes("belt") || value.includes("pulley")) {
    return "Machine Guarding";
  }

  if (value.includes("wire") || value.includes("electrical") || value.includes("panel") || value.includes("cord")) {
    return "Electrical";
  }

  if (value.includes("fall") || value.includes("edge") || value.includes("rail") || value.includes("ladder")) {
    return "Fall Protection";
  }

  if (value.includes("slip") || value.includes("trip") || value.includes("walkway") || value.includes("floor")) {
    return "Walking/Working Surfaces";
  }

  if (value.includes("lockout") || value.includes("loto") || value.includes("energized")) {
    return "Lockout/Tagout";
  }

  if (value.includes("ppe") || value.includes("glasses") || value.includes("gloves") || value.includes("hard hat")) {
    return "PPE";
  }

  if (value.includes("spill") || value.includes("trash") || value.includes("debris") || value.includes("housekeeping")) {
    return "Housekeeping";
  }

  if (value.includes("forklift") || value.includes("loader") || value.includes("truck") || value.includes("mobile equipment")) {
    return "Mobile Equipment";
  }

  return "Other";
}

function inferRiskSignal(text: string, photosLength: number) {
  const value = text.toLowerCase();

  if (
    value.includes("unguarded") ||
    value.includes("fall") ||
    value.includes("energized") ||
    value.includes("exposed wire") ||
    value.includes("pinch point") ||
    value.includes("crush") ||
    value.includes("fatal")
  ) {
    return "High";
  }

  if (
    value.includes("blocked") ||
    value.includes("spill") ||
    value.includes("trip") ||
    value.includes("missing") ||
    photosLength > 0
  ) {
    return "Medium";
  }

  return "Low";
}

function recommendedAction(category: string, riskSignal: string) {
  if (category === "Machine Guarding") {
    return "Stop use if exposure exists, protect the area, and verify guarding is installed before restart.";
  }

  if (category === "Electrical") {
    return "Restrict access, remove from service if unsafe, and have a qualified person evaluate the condition.";
  }

  if (category === "Fall Protection") {
    return "Control access to the fall exposure and verify guardrail, cover, or fall protection controls.";
  }

  if (category === "Walking/Working Surfaces") {
    return "Remove the walking surface hazard, mark the area, and verify the surface is safe for travel.";
  }

  if (category === "Lockout/Tagout") {
    return "Stop affected work and verify energy control procedures before maintenance or clearing activity continues.";
  }

  if (riskSignal === "High") {
    return "Pause affected work, protect employees from exposure, and verify corrective action before restart.";
  }

  return "Correct the condition, document completion, and verify the hazard has been controlled.";
}

function riskTone(riskSignal: string) {
  if (riskSignal === "High") return "bg-red-100 text-red-700";
  if (riskSignal === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

export default function QuickInspectionPage() {
  const router = useRouter();
  const [hazardCategory, setHazardCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [actionTitle, setActionTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");
  const [status, setStatus] = useState("");
  const [safeScopeQuickResult, setSafeScopeQuickResult] = useState<any>(null);

  const canSave = useMemo(
    () =>
      Boolean(
        hazardCategory ||
          location ||
          description ||
          photos.length ||
          actionTitle ||
          safeScopeQuickResult,
      ),
    [hazardCategory, location, description, photos.length, actionTitle, safeScopeQuickResult],
  );

  const canRunSafeScope = Boolean(description.trim() || hazardCategory || photos.length);

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const saved = await Promise.all(files.map((file) => saveEncryptedPhoto(file)));
    setPhotos((current) => [...current, ...saved]);
    event.target.value = "";
  }

  function runSafeScopeQuickReview() {
    if (!canRunSafeScope) {
      setStatus("Add a photo, category, or observed condition before running SafeScope Quick Review.");
      return;
    }

    const reviewText = `${hazardCategory} ${description} ${location}`.trim();
    const suggestedCategory = hazardCategory || inferCategory(reviewText);
    const riskSignal = inferRiskSignal(reviewText, photos.length);
    const suggestedAction = recommendedAction(suggestedCategory, riskSignal);

    const result = {
      mode: "quick_preview",
      classification: suggestedCategory,
      risk: {
        riskBand: riskSignal,
        quickSignal: riskSignal,
      },
      summary:
        description.trim() ||
        `Potential ${suggestedCategory.toLowerCase()} issue captured for review.`,
      generatedActions: [
        {
          title: suggestedAction,
          priority: riskSignal === "High" ? "High" : riskSignal === "Medium" ? "Medium" : "Low",
          closureEvidence: "Photo",
          source: "SafeScope Quick Review",
        },
      ],
      upgradePrompt:
        "Upgrade to Guided Inspection for standards matching, confidence scoring, evidence gaps, and full corrective action planning.",
    };

    setSafeScopeQuickResult(result);

    if (!hazardCategory) setHazardCategory(suggestedCategory);
    if (!actionTitle) setActionTitle(suggestedAction);
    if (riskSignal === "High") setPriority("High");
    if (riskSignal === "Low") setPriority("Low");

    setStatus("SafeScope Quick Review generated.");
  }

  async function saveQuickCapture() {
    if (!canSave) {
      setStatus("Add a category, location, description, photo, SafeScope review, or action before saving.");
      return;
    }

    const now = new Date().toISOString();
    const quickActionTitle =
      actionTitle.trim() ||
      safeScopeQuickResult?.generatedActions?.[0]?.title ||
      "";

    const action = quickActionTitle
      ? {
          id: createActionId(),
          title: quickActionTitle,
          priority:
            priority ||
            safeScopeQuickResult?.generatedActions?.[0]?.priority ||
            "Medium",
          status: "Open",
          due,
          source: safeScopeQuickResult ? "SafeScope Quick Review" : "Quick Capture",
          createdAt: now,
        }
      : null;

    const finalCategory =
      hazardCategory ||
      safeScopeQuickResult?.classification ||
      "Quick Hazard Capture";

    const report = {
      id: `SSR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      title: "Quick Hazard Capture",
      location: location || "Field Inspection",
      createdAt: now,
      storageSource: "local",
      inspectionType: "quick_hazard_capture",
      workflowDepth: "quick",
      findings: [
        {
          id: Date.now(),
          hazardCategory: finalCategory,
          description,
          location,
          photos,
          correctiveActions: action ? [action] : [],
          manualActions: action ? [action] : [],
          selectedGeneratedActions: safeScopeQuickResult?.generatedActions || [],
          safeScopeResult: safeScopeQuickResult,
          quickCapture: true,
          createdAt: now,
        },
      ],
    };

    const existingReports = await getReports<any>();
    await setReports([report, ...(Array.isArray(existingReports) ? existingReports : [])]);
    await setLatestReport(report);

    if (action) {
      const existingActions = await getStoredActions();
      await saveStoredActions([
        {
          ...action,
          location: location || "Field Inspection",
          findingTitle: finalCategory || description || "Quick hazard capture",
        },
        ...existingActions,
      ]);
    }

    await addActivityEvent({
      type: "Quick Capture",
      title: finalCategory || "Hazard captured",
      detail: location || description || "Quick hazard finding saved",
    });

    setStatus("Quick hazard capture saved.");
    router.push("/reports");
  }

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#0B1320] p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Quick Capture
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              Capture the hazard fast.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Add a photo, location, and observed condition. SafeScope Quick
              Review gives a limited preview while full standards and traceability
              stay available in Guided Inspection.
            </p>
          </div>

          <Link
            href="/inspections"
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-center text-xs font-black text-white transition hover:bg-white/20"
          >
            Change Workflow
          </Link>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-center gap-3 lg:grid-cols-4">
          {[
            [String(photos.length), "Photos"],
            [location ? "Yes" : "No", "Location"],
            [description ? "Yes" : "No", "Condition"],
            [safeScopeQuickResult ? "Ready" : "Preview", "SafeScope"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center"
            >
              <p className="text-2xl font-black tracking-tight text-white">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Field Details
        </p>
        <h2 className="mt-1 text-xl font-black text-slate-900">
          Basic finding information
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Hazard Category
            </span>
            <input
              list="quick-hazard-category-options"
              value={hazardCategory}
              onChange={(event) => setHazardCategory(event.target.value)}
              placeholder="Let SafeScope suggest or type one"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
            />
            <datalist id="quick-hazard-category-options">
              {hazardCategoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>

          <label>
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">
              Location
            </span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Example: Conveyor 3, north catwalk"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">
            Observed Condition
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is wrong and who may be exposed?"
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
          />
        </label>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">
            Photo
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]">
              Take Photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>

            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
              Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          {!!photos.length && (
            <p className="mt-2 text-xs font-black text-slate-500">
              {photos.length} photo(s) attached.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
              SafeScope Quick Review
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Limited safety intelligence preview
            </h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              Quick Review suggests a category, risk signal, and one corrective
              action. Guided Inspection unlocks standards, confidence, and full
              review detail.
            </p>
          </div>

          <button
            type="button"
            onClick={runSafeScopeQuickReview}
            className="rounded-xl bg-[#1D72B8] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-[#155A93]"
          >
            Run Quick Review
          </button>
        </div>

        {safeScopeQuickResult ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Likely Issue
                </p>
                <h3 className="mt-1 text-lg font-black text-[#102A43]">
                  {safeScopeQuickResult.classification}
                </h3>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${riskTone(
                  safeScopeQuickResult.risk?.riskBand,
                )}`}
              >
                {safeScopeQuickResult.risk?.riskBand} Risk Signal
              </span>
            </div>

            <div className="mt-3 rounded-xl bg-white px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                Suggested Immediate Action
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                {safeScopeQuickResult.generatedActions?.[0]?.title}
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
              <p className="text-xs font-black uppercase tracking-wide text-amber-800">
                Pro unlock
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
                Full SafeScope review includes applicable standards, confidence,
                evidence gaps, selected corrective actions, and polished report
                packaging.
              </p>
              <Link
                href="/pricing"
                className="mt-3 inline-flex rounded-xl bg-[#102A43] px-3 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
              >
                View Upgrade Options
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            Run SafeScope Quick Review after adding a photo, category, or observed
            condition.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#1D72B8]">
          Corrective Action
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Optional. SafeScope Quick Review can prefill this, or you can enter one manually.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_150px_150px]">
          <input
            value={actionTitle}
            onChange={(event) => setActionTitle(event.target.value)}
            placeholder="Action to take"
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
          />

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <input
            type="date"
            value={due}
            onChange={(event) => setDue(event.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
          />
        </div>
      </section>

      <section className="sticky bottom-20 z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur lg:bottom-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={saveQuickCapture}
            className="rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#EA580C] sm:w-auto"
          >
            Save Quick Capture
          </button>

          <Link
            href="/inspections"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Cancel
          </Link>

          {status && (
            <p className="text-sm font-black text-slate-600">{status}</p>
          )}
        </div>
      </section>
    </section>
  );
}
