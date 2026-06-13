export function getPriorityTone(priority?: string) {
  const normalized = String(priority || "").toLowerCase();

  if (normalized === "critical") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (normalized === "high") {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }

  if (normalized === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (normalized === "low") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function getStatusTone(status?: string) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" || normalized === "closed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (normalized === "blocked" || normalized === "overdue") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (normalized === "in progress") {
    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  if (normalized === "open" || normalized === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function getRiskTone(score?: number, band?: string) {
  const normalizedBand = String(band || "").toLowerCase();
  const numericScore = Number(score || 0);

  if (numericScore >= 20 || normalizedBand.includes("critical")) {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (numericScore >= 15 || normalizedBand.includes("high")) {
    return "border-orange-200 bg-orange-50 text-orange-800";
  }

  if (numericScore >= 8 || normalizedBand.includes("medium") || normalizedBand.includes("moderate")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  if (numericScore > 0 || normalizedBand.includes("low")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}
