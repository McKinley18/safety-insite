export type InspectionWorkflowDepth = "quick_capture" | "standard" | "intelligent";

export type InspectionProgramStatus =
  | "scheduled"
  | "in_progress"
  | "awaiting_review"
  | "action_required"
  | "closed"
  | "archived";

export type InspectionProgramRecord = {
  id: string;
  title: string;
  inspectionType: string;
  workflowDepth: InspectionWorkflowDepth;
  status: InspectionProgramStatus;
  assignedTo?: string;
  location?: string;
  dueDate?: string;
  progress: number;
  linkedReportId?: string;
  riskFlag?: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = "sentinel_inspection_program_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getInspectionProgram(): InspectionProgramRecord[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setInspectionProgram(records: InspectionProgramRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export function createInspectionProgramRecord(
  input: Partial<InspectionProgramRecord> & {
    title: string;
    inspectionType: string;
    workflowDepth: InspectionWorkflowDepth;
  }
): InspectionProgramRecord {
  const now = new Date().toISOString();

  const record: InspectionProgramRecord = {
    id: `inspection-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: input.title,
    inspectionType: input.inspectionType,
    workflowDepth: input.workflowDepth,
    status: input.status || "scheduled",
    assignedTo: input.assignedTo || "Current user",
    location: input.location || "Field Inspection",
    dueDate: input.dueDate || "",
    progress: input.progress ?? 0,
    linkedReportId: input.linkedReportId,
    riskFlag: input.riskFlag || "Not started",
    createdAt: now,
    updatedAt: now,
  };

  const existing = getInspectionProgram();
  setInspectionProgram([record, ...existing]);

  return record;
}

export function updateInspectionProgramRecord(
  id: string,
  updates: Partial<InspectionProgramRecord>
) {
  const now = new Date().toISOString();

  const next = getInspectionProgram().map((record) =>
    record.id === id
      ? {
          ...record,
          ...updates,
          updatedAt: now,
        }
      : record
  );

  setInspectionProgram(next);
  return next.find((record) => record.id === id) || null;
}

export function deleteInspectionProgramRecord(id: string) {
  const next = getInspectionProgram().filter((record) => record.id !== id);
  setInspectionProgram(next);
}

export function seedInspectionProgramIfEmpty() {
  const existing = getInspectionProgram();
  if (existing.length) return existing;

  const now = new Date().toISOString();

  const seed: InspectionProgramRecord[] = [
    {
      id: "seed-workplace-exam",
      title: "Workplace Exam",
      inspectionType: "MSHA / Field",
      workflowDepth: "quick_capture",
      status: "scheduled",
      assignedTo: "Current user",
      location: "Primary Operation",
      dueDate: "",
      progress: 0,
      riskFlag: "Not started",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-general-safety",
      title: "General Safety Inspection",
      inspectionType: "OSHA / Facility",
      workflowDepth: "standard",
      status: "scheduled",
      assignedTo: "Current user",
      location: "Plant / Facility",
      dueDate: "",
      progress: 0,
      riskFlag: "Not started",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-regulatory-review",
      title: "Regulatory Review",
      inspectionType: "MSHA / OSHA",
      workflowDepth: "intelligent",
      status: "scheduled",
      assignedTo: "Current user",
      location: "Custom",
      dueDate: "",
      progress: 0,
      riskFlag: "Not started",
      createdAt: now,
      updatedAt: now,
    },
  ];

  setInspectionProgram(seed);
  return seed;
}
