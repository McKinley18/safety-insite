import {
  deleteEncryptedPhoto,
  loadEncryptedPhoto,
  saveEncryptedPhoto,
} from "@/lib/evidenceStorage";

export async function saveUploadedEvidencePhotos(files: File[]) {
  return Promise.all(files.map((file) => saveEncryptedPhoto(file)));
}

export async function loadFindingEvidencePhotos(photos: any[]) {
  return Promise.all(
    (photos || []).map((photo: any) => loadEncryptedPhoto(photo)),
  );
}

export function deleteEvidencePhoto(id: string) {
  deleteEncryptedPhoto(id);
}
