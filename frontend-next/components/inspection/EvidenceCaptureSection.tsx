import AnnotationPreview from "@/components/evidence/AnnotationPreview";
import AnnotationEditor from "@/components/evidence/AnnotationEditor";

type Props = {
  photos: any[];
  setPhotos: (photos: any[]) => void;
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
          Capture clear visual evidence, then annotate key hazard areas for review and verification.
        </p>

        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#1D72B8]">
            Take Photo
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
          </label>

          <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
            Upload
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="overflow-hidden border-b border-slate-200 bg-white pb-3">
              <AnnotationPreview photoUrl={photo.url} annotations={photo.annotations || []} />

              <div className="space-y-2 pt-2">
                <p className="truncate text-xs font-black text-slate-600">{photo.name}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAnnotatingPhotoIndex(index);
                      setAnnotationExpanded(false);
                    }}
                    className="rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                  >
                    Annotate
                  </button>

                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    Remove
                  </button>
                </div>

                {annotatingPhotoIndex === index && !annotationExpanded && (
                  <div className="mt-3">
                    <button
                      onClick={() => setAnnotationExpanded(true)}
                      className="mb-2 float-right rounded-xl bg-[#102A43] px-4 py-2 text-xs font-black text-white transition hover:bg-[#1D72B8]"
                    >
                      Expand
                    </button>

                    <div className="clear-both">
                      <AnnotationEditor
                        photoUrl={photo.url}
                        annotations={photo.annotations || []}
                        onSave={(annotations) => {
                          const next = [...photos];
                          next[index] = { ...photo, annotations };
                          setPhotos(next);
                          setAnnotatingPhotoIndex(null);
                          setAnnotationExpanded(false);
                        }}
                        onCancel={() => {
                          setAnnotatingPhotoIndex(null);
                          setAnnotationExpanded(false);
                        }}
                      />
                    </div>
                  </div>
                )}

                {annotatingPhotoIndex === index && annotationExpanded && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-3">
                    <div className="max-h-[96vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900">Photo Annotation</h3>
                        <button
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
                          setAnnotatingPhotoIndex(null);
                          setAnnotationExpanded(false);
                        }}
                        onCancel={() => {
                          setAnnotatingPhotoIndex(null);
                          setAnnotationExpanded(false);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
        Evidence Notes
      </label>
      <textarea
        className="min-h-24 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#1D72B8] focus:bg-white"
        placeholder="Describe photos, documents, or evidence needed."
        value={evidenceNotes}
        onChange={(event) => setEvidenceNotes(event.target.value)}
      />
    </>
  );
}
