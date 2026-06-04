import { decryptJson, encryptJson } from "./encryption";

export type StoredEvidencePhoto = {
  id: string;
  name: string;
  encryptedAt: string;
  annotations?: any[];
};

const PREFIX = "sentinel_encrypted_photo_";

function photoKey(id: string) {
  return `${PREFIX}${id}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function saveEncryptedPhoto(file: File): Promise<StoredEvidencePhoto & { url: string; file?: File; mimeType?: string }> {
  const id = `photo-${Date.now()}-${crypto.randomUUID()}`;
  const dataUrl = await fileToDataUrl(file);
  const encrypted = await encryptJson({
    id,
    name: file.name,
    type: file.type,
    dataUrl,
  });

  window.localStorage.setItem(photoKey(id), encrypted);

  return {
    id,
    name: file.name,
    url: dataUrl,
    file,
    mimeType: file.type,
    encryptedAt: new Date().toISOString(),
    annotations: [],
  };
}

export async function loadEncryptedPhoto(photo: StoredEvidencePhoto & { url?: string }) {
  if (photo.url) return photo;

  const encrypted = window.localStorage.getItem(photoKey(photo.id));
  const decrypted = await decryptJson<any>(encrypted, null);

  return {
    ...photo,
    url: decrypted?.dataUrl || "",
  };
}

export function deleteEncryptedPhoto(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(photoKey(id));
}
