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
  if (event.status === "Completed") {
    return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500 dark:bg-[#20364D] dark:text-slate-100";
  }
  if (event.status === "Overdue" || event.priority === "Critical") {
    return "border-red-200 bg-red-50 text-red-800 dark:border-red-400/60 dark:bg-[#4A2932] dark:text-red-100";
  }
  if (event.priority === "High") {
    return "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-400/60 dark:bg-[#4A3426] dark:text-orange-100";
  }
  if (event.type === "inspection") {
    return "border-blue-200 bg-blue-50 text-blue-800 dark:border-[#5DB7FF]/60 dark:bg-[#1B4F78] dark:text-blue-50";
  }
  return "border-slate-200 bg-white text-slate-800 dark:border-slate-500 dark:bg-[#20364D] dark:text-slate-100";
}
