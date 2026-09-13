"use client";

import EvidenceCaptureSection from "@/components/inspection/EvidenceCaptureSection";
import FindingReviewEditor from "@/components/inspection/FindingReviewEditor";
import HazLenzInspectionStep from "@/components/inspection/HazLenzInspectionStep";
import InspectionStepOne from "./steps/InspectionStepOne";
import InspectionStepTwo from "./steps/InspectionStepTwo";
import InspectionStepThree from "./steps/InspectionStepThree";
import type {
  HazLenzClarificationAnswerInput,
  StructuredObservationInput,
} from "@/lib/hazlenzClient";

type ToggleSetter = (updater: (open: boolean) => boolean) => void;

function NavyStepHeader({
  step,
  title,
  description,
  stats,
}: {
  step: string;
  title: string;
  description: string;
  stats: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="sentinel-hero-card p-4 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
        {description}
      </p>

      <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 text-center">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10"
          >
            <p className="text-[9px] font-black uppercase tracking-wide text-blue-100">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepHeroCard({
  step,
  title,
  description,
  stats,
}: {
  step: string;
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="sentinel-hero-card p-4 sm:p-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
        {step}
      </p>

      <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>

      <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
        {description}
      </p>

      {!!stats?.length && (
        <div className="mt-2 sm:mt-4 grid grid-cols-3 gap-2 text-center">
          {stats.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[76px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-3 text-center shadow-sm ring-1 ring-white/10"
            >
              <p className="text-center text-[9px] font-black uppercase tracking-wide text-blue-100">
                {item.label}
              </p>
              <p className="mt-1 text-center text-lg font-black text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type InspectionStepRendererProps = {
  currentStep: number;
  isAdvancedMode: boolean;
  inspectionContext: any;
  inspectionMode: "quick" | "advanced";
  setInspectionMode: (value: "quick" | "advanced") => void;
  quickCapture: boolean;

  hazardCategory: string;
  setHazardCategory: (value: string) => void;

  location: string;
  setLocation: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;

  photos: any[];
  setPhotos: any;
  evidenceNotes: string;
  setEvidenceNotes: (value: string) => void;
  annotatingPhotoIndex: number | null;
  setAnnotatingPhotoIndex: (value: number | null) => void;
  annotationExpanded: boolean;
  setAnnotationExpanded: (value: boolean) => void;
  handlePhotoUpload: (event: any) => void;
  removePhoto: (id: string) => void;

  hazLenzHelpOpen: boolean;
  setHazLenzHelpOpen: ToggleSetter;
  agencyMode: string;
  riskProfileId: "simple_4x4" | "standard_5x5" | "advanced_6x6";
  handleRunHazLenz: (
    forceOffline?: boolean,
    structuredObservation?: StructuredObservationInput,
    clarificationAnswers?: HazLenzClarificationAnswerInput[],
  ) => void;
  hazLenzStatus: string;
  safeScopeResult: any;
  hazLenzClarificationAnswers: HazLenzClarificationAnswerInput[];
  setHazLenzClarificationAnswers: (answers: HazLenzClarificationAnswerInput[]) => void;
  onUseHazardFragment: (hazard: any) => void;
  setIsOfflineMode?: (value: boolean) => void;
  submitHazLenzValidation: (
    decision:
      | "accepted"
      | "modified"
      | "rejected"
      | "escalated"
      | "insufficient_evidence",
  ) => Promise<void>;
  hazLenzCompactDetailsOpen: boolean;
  setHazLenzCompactDetailsOpen: ToggleSetter;
  hazLenzAdvancedOpen: boolean;
  setHazLenzAdvancedOpen: ToggleSetter;
  feedbackNotes: string;
  setFeedbackNotes: (value: string) => void;
  selectedStandards: any[];
  getStandardKey: (standard: any) => string;
  toggleSelectedStandard: (standard: any) => void;
  handleFeedback: (
    standard: any,
    action: "accepted" | "rejected" | "flagged",
  ) => Promise<void>;
  hazLenzDetailsOpen: boolean;
  setHazLenzDetailsOpen: ToggleSetter;
  hazLenzStandardsOpen: boolean;
  setHazLenzStandardsOpen: ToggleSetter;

  activeRiskScale: any;
  severity: number | null;
  setSeverity: (value: number | null) => void;
  likelihood: number | null;
  setLikelihood: (value: number | null) => void;

  selectedGeneratedActions: any[];
  toggleGeneratedAction: (action: any) => void;
  manualActionTitle: string;
  setManualActionTitle: (value: string) => void;
  manualActionPriority: string;
  setManualActionPriority: (value: string) => void;
  manualActionOwner: string;
  setManualActionOwner: (value: string) => void;
  manualActionDue: string;
  setManualActionDue: (value: string) => void;
  manualActionClosureEvidence: string;
  setManualActionClosureEvidence: (value: string) => void;
  manualActions: any[];
  addManualAction: () => void;
  removeManualAction: (index: number) => void;
};

export default function InspectionStepRenderer({
  currentStep,
  isAdvancedMode,
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
  setPhotos,
  evidenceNotes,
  setEvidenceNotes,
  annotatingPhotoIndex,
  setAnnotatingPhotoIndex,
  annotationExpanded,
  setAnnotationExpanded,
  handlePhotoUpload,
  removePhoto,
  hazLenzHelpOpen,
  setHazLenzHelpOpen,
  agencyMode,
  riskProfileId,
  handleRunHazLenz,
  hazLenzStatus,
  safeScopeResult,
  hazLenzClarificationAnswers,
  setHazLenzClarificationAnswers,
  onUseHazardFragment,
  setIsOfflineMode,
  submitHazLenzValidation,
  hazLenzCompactDetailsOpen,
  setHazLenzCompactDetailsOpen,
  hazLenzAdvancedOpen,
  setHazLenzAdvancedOpen,
  feedbackNotes,
  setFeedbackNotes,
  selectedStandards,
  getStandardKey,
  toggleSelectedStandard,
  handleFeedback,
  hazLenzDetailsOpen,
  setHazLenzDetailsOpen,
  hazLenzStandardsOpen,
  setHazLenzStandardsOpen,
  activeRiskScale,
  severity,
  setSeverity,
  likelihood,
  setLikelihood,
  selectedGeneratedActions,
  toggleGeneratedAction,
  manualActionTitle,
  setManualActionTitle,
  manualActionPriority,
  setManualActionPriority,
  manualActionOwner,
  setManualActionOwner,
  manualActionDue,
  setManualActionDue,
  manualActionClosureEvidence,
  setManualActionClosureEvidence,
  manualActions,
  addManualAction,
  removeManualAction,
}: InspectionStepRendererProps) {
  return (
    <div className="px-1 py-1 sm:px-2">
      {currentStep === 1 && (
        <InspectionStepOne
          photos={photos}
          setPhotos={setPhotos}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          evidenceNotes={evidenceNotes}
          setEvidenceNotes={setEvidenceNotes}
          annotatingPhotoIndex={annotatingPhotoIndex}
          setAnnotatingPhotoIndex={setAnnotatingPhotoIndex}
          annotationExpanded={annotationExpanded}
          setAnnotationExpanded={setAnnotationExpanded}
          handlePhotoUpload={handlePhotoUpload}
          removePhoto={removePhoto}
        />
      )}

      {currentStep === 2 && (
        <InspectionStepTwo
          hazardCategory={hazardCategory}
          setHazardCategory={setHazardCategory}
          hazLenzHelpOpen={hazLenzHelpOpen}
          setHazLenzHelpOpen={setHazLenzHelpOpen}
          agencyMode={agencyMode}
          riskProfileId={riskProfileId}
          handleRunHazLenz={handleRunHazLenz}
          hazLenzStatus={hazLenzStatus}
          safeScopeResult={safeScopeResult}
          hazLenzClarificationAnswers={hazLenzClarificationAnswers}
          setHazLenzClarificationAnswers={setHazLenzClarificationAnswers}
          onUseHazardFragment={onUseHazardFragment}
          setIsOfflineMode={setIsOfflineMode}
          submitHazLenzValidation={submitHazLenzValidation}
          hazLenzCompactDetailsOpen={hazLenzCompactDetailsOpen}
          setHazLenzCompactDetailsOpen={setHazLenzCompactDetailsOpen}
          hazLenzAdvancedOpen={hazLenzAdvancedOpen}
          setHazLenzAdvancedOpen={setHazLenzAdvancedOpen}
          feedbackNotes={feedbackNotes}
          setFeedbackNotes={setFeedbackNotes}
          selectedStandards={selectedStandards}
          getStandardKey={getStandardKey}
          toggleSelectedStandard={toggleSelectedStandard}
          handleFeedback={handleFeedback}
          hazLenzDetailsOpen={hazLenzDetailsOpen}
          setHazLenzDetailsOpen={setHazLenzDetailsOpen}
          hazLenzStandardsOpen={hazLenzStandardsOpen}
          setHazLenzStandardsOpen={setHazLenzStandardsOpen}
        />
      )}
      {currentStep === 3 && (
        <InspectionStepThree
          selectedStandards={selectedStandards}
          selectedGeneratedActions={selectedGeneratedActions}
          manualActions={manualActions}
          severity={severity}
          likelihood={likelihood}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          evidenceNotes={evidenceNotes}
          setEvidenceNotes={setEvidenceNotes}
          hazardCategory={hazardCategory}
          setHazardCategory={setHazardCategory}
          photos={photos}
          safeScopeResult={safeScopeResult}
          getStandardKey={getStandardKey}
          toggleSelectedStandard={toggleSelectedStandard}
          activeRiskScale={activeRiskScale}
          setSeverity={setSeverity}
          setLikelihood={setLikelihood}
          toggleGeneratedAction={toggleGeneratedAction}
          manualActionTitle={manualActionTitle}
          setManualActionTitle={setManualActionTitle}
          manualActionPriority={manualActionPriority}
          setManualActionPriority={setManualActionPriority}
          manualActionOwner={manualActionOwner}
          setManualActionOwner={setManualActionOwner}
          manualActionDue={manualActionDue}
          setManualActionDue={setManualActionDue}
          manualActionClosureEvidence={manualActionClosureEvidence}
          setManualActionClosureEvidence={setManualActionClosureEvidence}
          addManualAction={addManualAction}
          removeManualAction={removeManualAction}
        />
      )}

    </div>
  );
}
