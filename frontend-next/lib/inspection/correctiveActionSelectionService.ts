export const buildManualAction = (
  title: string,
  priority: string,
  owner: string,
  due: string,
  closureEvidence = "Photo",
) => ({
  title: title.trim(),
  description: title.trim(),
  priority,
  owner: owner.trim(),
  assignedTo: owner.trim(),
  due,
  status: "Open",
  closureEvidence,
  source: "User",
});

export const removeManualActionFromList = (currentActions: any[], indexToRemove: number) => {
  return currentActions.filter((_, index) => index !== indexToRemove);
};
