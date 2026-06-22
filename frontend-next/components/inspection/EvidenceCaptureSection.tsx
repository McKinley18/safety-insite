import AnnotationEditor from "@/components/evidence/AnnotationEditor";
import AnnotationPreview from "@/components/evidence/AnnotationPreview";

type Props = {
  photos: any[];
  setPhotos: (photos: any[]) => void;
  description: string;
  setDescription: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  evidenceNotes: string;
  setEvidenceNotes: (value: string) => void;
  annotatingPhotoIndex: number | null;
  setAnnotatingPhotoIndex: (index: number | null) => void;
  annotationExpanded: boolean;
  setAnnotationExpanded: (expanded: boolean) => void;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (id: string) => void;
};

export default function EvidenceCaptureSection({
  photos,
  setPhotos,
  description,
  setDescription,
  location,
  setLocation,
  evidenceNotes,
  setEvidenceNotes,
  annotatingPhotoIndex,
  setAnnotatingPhotoIndex,
  annotationExpanded,
  setAnnotationExpanded,
  handlePhotoUpload,
  removePhoto,
}: Props) {
  return (
    <>
      <div className="mb-2 sentinel-hero-card rounded-xl px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            Capture Evidence
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Upload Evidence</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
            Attach a photo, then annotate or remove it before continuing.
          </p>
        </div>

        <div className="sentinel-phone-actions mt-3 sm:flex sm:flex-wrap sm:justify-center">
          <label className="insite-inspection-action insite-inspection-action-blue cursor-pointer">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          <label className="insite-inspection-action insite-inspection-action-orange cursor-pointer">
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
      </div>

      <section className="sentinel-content-card rounded-xl px-4 py-3 sm:px-5">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
          Uploaded Evidence
        </p>
        {photos.length > 0 ? (
          <div className="grid gap-3 border-t border-slate-200/80 pt-3">
            {photos.map((photo, index) => (
              <div key={photo.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900">
                      {photo.name || `Evidence photo ${index + 1}`}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                      {(photo.annotations || []).length
                        ? `${(photo.annotations || []).length} annotation(s)`
                        : "No annotations"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAnnotatingPhotoIndex(index);
                        setAnnotationExpanded(true);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-[#102A43] transition hover:bg-slate-50"
                    >
                      Annotate
                    </button>

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <AnnotationPreview
                    photoUrl={photo.url}
                    annotations={photo.annotations || []}
                  />
                </div>

                {annotatingPhotoIndex === index && annotationExpanded && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-2 sm:p-3">
                    <div className="w-full max-h-[96vh] max-w-6xl overflow-auto rounded-xl bg-white p-2 sm:p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900">
                          Photo Annotation
                        </h3>
                        <button
                          type="button"
                          onClick={() => setAnnotationExpanded(false)}
                          className="rounded-full bg-slate-300 px-4 py-2 text-xs font-black text-slate-900"
                        >
                          Collapse
                        </button>
                      </div>

                      <AnnotationEditor
                        photoUrl={photo.url}
                        annotations={photo.annotations || []}
                        expanded
                        onSave={(annotations) => {
                          const next = [...photos];
                          next[index] = { ...photo, annotations };
                          setPhotos(next);
                          setAnnotationExpanded(false);
                        }}
                        onCancel={() => {
                          setAnnotationExpanded(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <p className="text-sm font-medium text-slate-700">
              No photos attached yet.
            </p>
          </div>
        )}
      </section>

      <section className="sentinel-content-card rounded-xl px-4 py-3 sm:px-5">
        <div className="mb-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Observed Condition
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-700">
            Keep it short. HazLenz AI will organize the details.
          </p>
        </div>

        <textarea
          className="app-input w-full px-3 py-3 text-sm font-semibold leading-6 transition placeholder:text-slate-700"
          style={{ minHeight: 180 }}
          placeholder="Example: Missing guard on rotating shaft near crusher drive."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onFocus={(event) => {
            setTimeout(() => {
              event.target.scrollIntoView({ block: "center", behavior: "smooth" });
            }, 300);
          }}
        />

        <div className="mt-1">
          <label
            className="inline-block h-auto min-h-0 py-0 text-[11px] font-black uppercase leading-none tracking-wide text-slate-700"
            style={{ height: "auto", minHeight: 0, marginBottom: 2, lineHeight: 1 }}
          >
            Location
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-700 focus:border-[#1D72B8] focus:bg-white dark:focus:bg-slate-900"
            style={{ marginTop: 0 }}
            placeholder="Example: Crusher deck, west platform"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
      </section>
    </>
  );
}
