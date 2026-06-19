import type { SafetyCalendarEvent } from "@/types/safetyCalendar";

export function eventTypeLabel(type: SafetyCalendarEvent["type"]) {
  if (type === "corrective_action") return "Action";
  if (type === "follow_up") return "Follow-up";
  if (type === "report_review") return "Report Review";
  if (type === "supervisor_review") return "Review";
  if (type === "inspection") return "Inspection";
  return "Task";
}

export function eventTone(event: SafetyCalendarEvent) {
  if (event.status === "Completed") return "app-surface-muted";
  if (event.status === "Overdue" || event.priority === "Critical") return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200";
  if (event.priority === "High") return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-200";
  if (event.type === "inspection") return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200";
  return "app-surface";
}
