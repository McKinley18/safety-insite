import {
  saveOfflineBrainBundle,
  type HazLenzOfflineBrainBundle,
} from "./offlineBrainStorage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export async function downloadHazLenzBrainBundle() {
  const response = await fetch(
    `${API_BASE_URL}/offline/safescope-brain-bundle.json`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to download HazLenz AI offline brain bundle.");
  }

  const bundle = (await response.json()) as HazLenzOfflineBrainBundle;

  if (bundle.approvedOnly !== true) {
    throw new Error(
      "Rejected HazLenz AI brain bundle because it is not approved-only.",
    );
  }

  saveOfflineBrainBundle(bundle);

  return bundle;
}
