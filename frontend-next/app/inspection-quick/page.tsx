"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { addActivityEvent } from "@/lib/activityStorage";
import { createActionId, getStoredActions, saveStoredActions } from "@/lib/actionStorage";
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

  const canSave = useMemo(
    () => Boolean(hazardCategory || location || description || photos.length || actionTitle),
    [hazardCategory, location, description, photos.length, actionTitle]
  );

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const saved = await Promise.all(files.map((file) => saveEncryptedPhoto(file)));
    setPhotos((current) => [...current, ...saved]);
    event.target.value = "";
  }

  async function saveQuickCapture() {
    if (!canSave) {
      setStatus("Add a category, location, description, photo, or action before saving.");
      return;
    }

    const now = new Date().toISOString();
    const action = actionTitle.trim()
      ? {
          id: createActionId(),
          title: actionTitle.trim(),
          priority,
          status: "Open",
          due,
          source: "Quick Capture",
          createdAt: now,
        }
      : null;

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
          hazardCategory,
          description,
          location,
          photos,
          correctiveActions: action ? [action] : [],
          manualActions: action ? [action] : [],
          quickCapture: true,
          createdAt: now,
        },
      ],
    };

    const existingReports = await getReports<any>();
    await setReports([report, ...(Array.isArray(existingReports) ? existingReports : [])]);
    setLatestReport(report);

    if (action) {
      const existingActions = await getStoredActions();
      await saveStoredActions([
        {
          ...action,
          location: location || "Field Inspection",
          findingTitle: hazardCategory || description || "Quick hazard capture",
        },
        ...existingActions,
      ]);
    }

    await addActivityEvent({
      type: "Quick Capture",
      title: hazardCategory || "Hazard captured",
      detail: location || description || "Quick hazard finding saved",
    });

    setStatus("Quick hazard capture saved.");
    router.push("/reports");
  }

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Quick Capture"
        title="Quick Hazard Capture"
        description="Capture a hazard, optional photo, and corrective action without completing a full inspection."
      />

      <section className="border-y border-slate-200 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Hazard Category</span>
            <input
              list="quick-hazard-category-options"
              value={hazardCategory}
              onChange={(event) => setHazardCategory(event.target.value)}
              placeholder="Choose or type"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
            />
            <datalist id="quick-hazard-category-options">
              {hazardCategoryOptions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </label>

          <label>
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Location</span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Example: Conveyor 3, north catwalk"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">Short Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What is wrong and who may be exposed?"
            className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#1D72B8] focus:bg-white"
          />
        </label>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Photo</p>
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
            <p className="mt-2 text-xs font-black text-slate-500">{photos.length} photo(s) attached.</p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Corrective Action</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">Optional. Add one now or assign it later from Actions.</p>

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
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <PrimaryButton onClick={saveQuickCapture}>Save Capture</PrimaryButton>
        <SecondaryButton href="/inspections">Cancel</SecondaryButton>
        {status && <p className="text-sm font-black text-slate-600">{status}</p>}
      </section>
    </section>
  );
}
