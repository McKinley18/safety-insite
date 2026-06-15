import AnnotationEditor from "@/components/evidence/AnnotationEditor";

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
      <div className="mb-3 sentinel-hero-card rounded-xl px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">
            Capture Evidence
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Photo and field notes</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-blue-100">
            Add evidence, describe the condition, and note where it was found.
          </p>
        </div>

        <div className="sentinel-phone-actions mt-4 sm:flex sm:flex-wrap sm:justify-center">
          <label className="sentinel-compact-secondary w-full cursor-pointer sm:w-[148px]">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          <label className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-[13px] font-black text-white shadow-sm ring-1 ring-white/10 transition hover:bg-white/20 sm:min-h-[44px] sm:w-[148px] sm:px-5 sm:py-2.5 sm:text-sm">
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

      {photos.length > 0 ? (
        <div className="mb-3 divide-y divide-slate-200/80 border-y border-slate-200/80">
          {photos.map((photo, index) => (
            <div key={photo.id} className="py-3">
              <div className="mb-2 flex -wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {photo.name || `Evidence photo ${index + 1}`}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {(photo.annotations || []).length} annotation(s)
                  </p>
                </div>

                <div className="flex -wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnotatingPhotoIndex(index);
                      setAnnotationExpanded(true);
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black text-slate-700 transition hover:bg-slate-50"
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

              <div className="sentinel-phone-stack mb-3 sm:grid sm:grid-cols-2 sm:gap-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">Caption / Label</label>
                    <input 
                      type="text" 
                      className="rounded-lg border border-slate-200 p-2 text-xs font-bold"
                      placeholder="e.g. Missing guard on shaft"
                      value={photo.caption || ''}
                      onChange={(e) => {
                          const next = [...photos];
                          next[index] = { ...photo, caption: e.target.value };
                          setPhotos(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">View Type</label>
                    <select 
                      className="rounded-lg border border-slate-200 p-2 text-xs font-bold"
                      value={photo.viewType || 'unknown'}
                      onChange={(e) => {
                          const next = [...photos];
                          next[index] = { ...photo, viewType: e.target.value };
                          setPhotos(next);
                      }}
                    >
                      <option value="unknown">Select view type...</option>
                      <option value="close_up">Close-up of condition</option>
                      <option value="wide_area">Wide area / Context</option>
                      <option value="control_status">Control/Lockout status</option>
                      <option value="employee_exposure">Exposure path</option>
                      <option value="tag_label">Tag / Label detail</option>
                      <option value="equipment_id">Equipment ID</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[10px] font-black uppercase text-slate-400">Field Notes</label>
                    <textarea 
                      className="rounded-lg border border-slate-200 p-2 text-xs font-semibold"
                      placeholder="Additional details about what this photo represents..."
                      rows={2}
                      value={photo.fieldNotes || ''}
                      onChange={(e) => {
                          const next = [...photos];
                          next[index] = { ...photo, fieldNotes: e.target.value };
                          setPhotos(next);
                      }}
                    />
                  </div>
              </div>

              <AnnotationEditor
                photoUrl={photo.url}
                annotations={photo.annotations || []}
                onSave={(annotations) => {
                  const next = [...photos];
                  next[index] = { ...photo, annotations };
                  setPhotos(next);
                }}
                onCancel={() => {
                  setAnnotatingPhotoIndex(null);
                  setAnnotationExpanded(false);
                }}
              />

              {annotatingPhotoIndex === index && annotationExpanded && (
                <div className="fixed inset-0 z-50  items-center justify-center bg-slate-950/90 p-3">
                  <div className="max-h-[96vh]  max-w-6xl overflow-auto rounded-xl bg-white p-3">
                    <div className="mb-2  items-center justify-between">
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
        <p className="mb-4 text-sm font-medium leading-6 text-slate-400">
          No photos attached yet.
        </p>
      )}

      <section className="sentinel-content-card rounded-xl px-4 py-4 sm:px-5">
        <div className="mb-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Observed Condition
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
            Keep it short. HazLenz AI will organize the details.
          </p>
        </div>

        <textarea
          className="app-input min-h-28 px-3 py-3 text-sm font-semibold leading-6 transition placeholder:text-slate-400"
          placeholder="Example: Missing guard on rotating shaft near crusher drive."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Location
          </label>
          <input
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D72B8] focus:bg-white dark:focus:bg-slate-900"
            placeholder="Example: Crusher deck, west platform"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>
      </section>
    </>
  );
}
