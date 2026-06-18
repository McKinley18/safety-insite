export const buildManualAction = (title: string, priority: string, due: string) => ({
  title: title.trim(),
  priority,
  due: due || "Not set",
  source: "User",
});

export const removeManualActionFromList = (currentActions: any[], indexToRemove: number) => {
  return currentActions.filter((_, index) => index !== indexToRemove);
};
