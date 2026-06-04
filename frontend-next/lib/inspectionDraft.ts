import { removeCoverPage, removeEditReport } from "./reportStorage";

export async function clearActiveInspectionDraft() {
  await removeCoverPage();
  await removeEditReport();

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("sentinel_editing_report_id");
  }
}
