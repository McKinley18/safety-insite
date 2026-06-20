"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addActivityEvent } from "@/lib/activityStorage";
import {
  createActionId,
  getStoredActions,
  saveStoredActions,
} from "@/lib/actionStorage";
import { saveEncryptedPhoto } from "@/lib/evidenceStorage";
import { getReports, setLatestReport, setReports } from "@/lib/reportStorage";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput, AppSelect, AppTextarea } from "@/components/ui/AppInput";
import { AppLinkButton } from "@/components/ui/AppLinkButton";
import { AppPanel } from "@/components/ui/AppPanel";
import { HeroPanel } from "@/components/ui/HeroPanel";
import SectionHeader from "@/components/ui/SectionHeader";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import AnnotationEditor from "@/components/evidence/AnnotationEditor";
import { getQuickReviewResult } from "@/lib/inspection/quickReviewService";

const hazardCategoryOptions = [
// ... (rest of imports/constants)

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
  const [annotatingPhotoIndex, setAnnotatingPhotoIndex] = useState<number | null>(null);
  const [annotationExpanded, setAnnotationExpanded] = useState(false);
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

  function removePhoto(indexToRemove: number) {
    setPhotos((current) => current.filter((_, index) => index !== indexToRemove));
    if (annotatingPhotoIndex === indexToRemove) {
      setAnnotatingPhotoIndex(null);
      setAnnotationExpanded(false);
    }
  }

  function savePhotoAnnotations(indexToUpdate: number, annotations: any[]) {
    setPhotos((current) =>
      current.map((photo, index) =>
        index === indexToUpdate ? { ...photo, annotations } : photo,
      ),
    );
    setAnnotatingPhotoIndex(null);
    setAnnotationExpanded(false);
  }

  function runSafeScopeQuickReview() {
    if (!canRunSafeScope) {
      setStatus("Add a photo, category, or observed condition before running HazLenz AI Quick Review.");
      return;
    }

    const { result, suggestedCategory, suggestedAction, riskSignal } =
      getQuickReviewResult({
        hazardCategory,
        description,
        location,
        photosLength: photos.length,
      });

    setSafeScopeQuickResult(result);

    if (!hazardCategory) setHazardCategory(suggestedCategory);
    if (!actionTitle) setActionTitle(suggestedAction);
    if (riskSignal === "High") setPriority("High");
    if (riskSignal === "Low") setPriority("Low");

    setStatus("HazLenz AI Quick Review generated.");
  }

  async function saveQuickCapture() {
    if (!canSave) {
      setStatus("Add a photo, observed condition, location, category, HazLenz AI review, or action before building the report.");
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
          source: safeScopeQuickResult ? "HazLenz AI Quick Review" : "Quick Inspection",
          createdAt: now,
        }
      : null;

    const finalCategory =
      hazardCategory ||
      safeScopeQuickResult?.classification ||
      "Quick Inspection";

    const report = {
      id: `SSR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      title: "Quick Inspection",
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
          findingTitle: finalCategory || description || "Quick inspection",
        },
        ...existingActions,
      ]);
    }

    await addActivityEvent({
      type: "Quick Inspection",
      title: finalCategory || "Hazard captured",
      detail: location || description || "Quick inspection finding saved",
    });

    setStatus("Quick inspection report built.");
    router.push("/inspection-review");
  }

  return (
    <section className="sentinel-page-shell space-y-4">
      <HeroPanel>
        <div className="flex flex-col items-center gap-4 text-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#5DB7FF]">
              Quick Inspection
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Build a quick finding.
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
              Capture the photo first, describe the condition, set the location,
              confirm the hazard category, and save a clean finding record.
            </p>
          </div>

          <AppLinkButton
            href="/inspections"
            variant="accent"
            size="sm"
            className="mx-auto inline-flex !w-24 items-center justify-center rounded-full !bg-orange-500 px-4 py-2 text-xs font-black !text-white shadow-none transition hover:!bg-orange-600"
          >
            Change
          </AppLinkButton>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-center gap-3 lg:grid-cols-4">
          {[
            [String(photos.length), "Photos"],
            [location ? "Yes" : "No", "Location"],
            [description ? "Yes" : "No", "Condition"],
            [safeScopeQuickResult ? "Ready" : "Preview", "HazLenz AI"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-none backdrop-blur"
            >
              <p className="text-base font-black tracking-[-0.05em] text-white sm:text-xl">
                {value}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-300">
                {label}
              </p>
            </div>
          ))}
        </div>
      </HeroPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 1"
          title="Photo"
          description="Start with visual evidence. Add an annotation when you need to point out the hazard, exposure, or missing control."
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="insite-inspection-action insite-inspection-action-navy insite-inspection-action-sm cursor-pointer">
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
          <div className="mt-4 grid gap-3">
            {photos.map((photo, index) => {
              const photoUrl = photo.url || photo.imageUri || photo.dataUrl || "";
              const annotations = photo.annotations || [];

              return (
                <div
                  key={photo.id || index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  {photoUrl && (
                    <AnnotationPreview
                      photoUrl={photoUrl}
                      annotations={annotations}
                    />
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <AppButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAnnotatingPhotoIndex(index);
                        setAnnotationExpanded(true);
                      }}
                    >
                      Annotate
                    </AppButton>

                    <AppButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => removePhoto(index)}
                    >
                      Remove
                    </AppButton>

                    <span className="text-xs font-black text-slate-500">
                      {annotations.length
                        ? `${annotations.length} annotation(s)`
                        : "No annotations"}
                    </span>
                  </div>

                  {annotatingPhotoIndex === index && annotationExpanded && photoUrl && (
                    <div className="mt-3">
                      <AnnotationEditor
                        photoUrl={photoUrl}
                        annotations={annotations}
                        expanded={annotationExpanded}
                        onSave={(nextAnnotations) =>
                          savePhotoAnnotations(index, nextAnnotations)
                        }
                        onCancel={() => {
                          setAnnotatingPhotoIndex(null);
                          setAnnotationExpanded(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 2"
          title="Observed condition"
          description="Describe what is wrong, who may be exposed, and what work activity is affected."
        />

        <AppTextarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Example: Guard missing at tail pulley while employees access the cleanup area."
          className="mt-3 min-h-28 bg-white font-semibold focus:bg-white"
        />
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 3"
          title="Location"
          description="Record where the finding was observed."
        />

        <AppInput
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Example: Conveyor 3, north catwalk"
          className="mt-3 bg-white focus:bg-white"
        />
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 4"
          title="Hazard category"
          description="Confirm the category or let HazLenz AI suggest one after review."
        />

        <AppInput
          list="quick-hazard-category-options"
          value={hazardCategory}
          onChange={(event) => setHazardCategory(event.target.value)}
          placeholder="Let HazLenz AI suggest or type one"
          className="mt-3 bg-white focus:bg-white"
        />
        <datalist id="quick-hazard-category-options">
          {hazardCategoryOptions.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 5"
          title="HazLenz AI Quick Review"
          description="Run an advisory quick review after the photo, condition, location, and category are captured. Full standards matching stays in Full Inspection."
          action={
            <AppButton
              type="button"
              onClick={runSafeScopeQuickReview}
              size="sm"
              className="insite-inspection-action insite-inspection-action-blue insite-inspection-action-sm"
            >
              Run Quick Review
            </AppButton>
          }
        />

        {safeScopeQuickResult ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Likely Issue
                </p>
                <h3 className="mt-1 text-sm font-black text-[#102A43] sm:text-lg">
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

            <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-none">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
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
                Full HazLenz AI review includes applicable standards, confidence,
                evidence gaps, selected corrective actions, and polished report
                packaging.
              </p>
              <AppLinkButton href="/pricing" size="sm" className="mt-3">
                View Upgrade Options
              </AppLinkButton>
            </div>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">
            Run HazLenz AI Quick Review after adding a photo, category, or observed
            condition.
          </p>
        )}
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Step 6"
          title="Corrective action"
          description="Add the immediate or follow-up action needed to control the finding."
        />

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_150px_150px]">
          <AppInput
            value={actionTitle}
            onChange={(event) => setActionTitle(event.target.value)}
            placeholder="Action to take"
            className="bg-slate-50 focus:bg-white"
          />

          <AppSelect
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="bg-slate-50 focus:bg-white"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </AppSelect>

          <AppInput
            type="date"
            value={due}
            onChange={(event) => setDue(event.target.value)}
            className="bg-slate-50 focus:bg-white"
          />
        </div>
      </AppPanel>

      <AppPanel padding="lg">
        <SectionHeader
          eyebrow="Report"
          title="Build quick report"
          description="Create a report package from this quick inspection finding and open it for review."
        />

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-2 text-xs font-black text-slate-600 sm:grid-cols-2">
            <p>
              <span className="text-slate-900">Photos:</span>{" "}
              {photos.length}
            </p>
            <p>
              <span className="text-slate-900">Condition:</span>{" "}
              {description.trim() ? "Captured" : "Needed"}
            </p>
            <p>
              <span className="text-slate-900">Location:</span>{" "}
              {location.trim() || "Needed"}
            </p>
            <p>
              <span className="text-slate-900">Category:</span>{" "}
              {hazardCategory || safeScopeQuickResult?.classification || "Pending"}
            </p>
            <p>
              <span className="text-slate-900">HazLenz AI:</span>{" "}
              {safeScopeQuickResult ? "Reviewed" : "Optional"}
            </p>
            <p>
              <span className="text-slate-900">Action:</span>{" "}
              {actionTitle.trim() ? "Added" : "Optional"}
            </p>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2 text-center">
            <AppButton
              type="button"
              variant="accent"
              size="lg"
              onClick={saveQuickCapture}
              className="w-full max-w-[260px] text-white sm:w-auto"
            >
              Build Quick Report
            </AppButton>

            {status && (
              <p className="max-w-md text-sm font-black text-slate-600">
                {status}
              </p>
            )}
          </div>
        </div>
      </AppPanel>

</section>
  );
}
