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
      <div className="mb-4 rounded-2xl border border-[#102A43] bg-[#102A43] p-5 text-white shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Capture Evidence
          </p>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
            Add evidence, describe the condition, and note where it was found.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <label className="cursor-pointer rounded-xl bg-white px-4 py-2 text-xs font-black text-[#102A43] shadow-sm transition hover:bg-blue-50">
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>

          <label className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-white/20">
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
        <div className="mb-4 divide-y divide-slate-200 border-y border-slate-200">
          {photos.map((photo, index) => (
            <div key={photo.id} className="py-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {photo.name || `Evidence photo ${index + 1}`}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {(photo.annotations || []).length} annotation(s)
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnotatingPhotoIndex(index);
                      setAnnotationExpanded(true);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Expand
                  </button>

                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    Remove
                  </button>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3">
                  <div className="max-h-[96vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-3">
                    <div className="mb-2 flex items-center justify-between">
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
        <p className="mb-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 leading-6 text-sm font-semibold text-slate-500">
          No photos attached yet.
        </p>
      )}

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#1D72B8]">
            Observed Condition
          </p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
            Keep it short. SafeScope will organize the details.
          </p>
        </div>

        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D72B8] focus:bg-slate-50"
          placeholder="Example: Missing guard on rotating shaft near crusher drive."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Location
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D72B8] focus:bg-white"
            placeholder="Example: Crusher deck, west platform"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        
      </section>
    </>
  );
}
