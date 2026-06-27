export type SafetyCalendarEventType =
  | "inspection"
  | "corrective_action"
  | "follow_up"
  | "report_review"
  | "supervisor_review"
  | "custom";

export type SafetyCalendarEventStatus =
  | "Scheduled"
  | "Open"
  | "In Progress"
  | "Blocked"
  | "Completed"
  | "Overdue";

export type SafetyCalendarPriority = "Critical" | "High" | "Medium" | "Low";

export type SafetyCalendarEvent = {
  id: string;
  type: SafetyCalendarEventType;
  title: string;
  date: string;
  owner: string;
  location: string;
  priority: SafetyCalendarPriority;
  status: SafetyCalendarEventStatus;
  source: "company_assignment" | "corrective_action" | "personal_task";
  sourceId: string;
  sourceLabel: string;
  findingTitle?: string;
  createdAt?: string;
  completedAt?: string;
};
