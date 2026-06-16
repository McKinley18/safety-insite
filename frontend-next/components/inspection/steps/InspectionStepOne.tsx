import EvidenceCaptureSection from "../EvidenceCaptureSection";

interface InspectionStepOneProps {
  photos: any[];
  setPhotos: (photos: any[]) => void;
  description: string;
  setDescription: (description: string) => void;
  location: string;
  setLocation: (location: string) => void;
  evidenceNotes: string;
  setEvidenceNotes: (notes: string) => void;
  annotatingPhotoIndex: number | null;
  setAnnotatingPhotoIndex: (index: number | null) => void;
  annotationExpanded: boolean;
  setAnnotationExpanded: (expanded: boolean) => void;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (id: string) => void;
}

export default function InspectionStepOne(props: InspectionStepOneProps) {
  return (
    <div className="space-y-2">
      <EvidenceCaptureSection {...props} />
    </div>
  );
}
