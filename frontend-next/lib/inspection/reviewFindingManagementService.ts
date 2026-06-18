export const deleteFindingFromReport = (report: any, indexToRemove: number) => {
  const nextFindings = (report.findings || []).filter(
    (_finding: any, findingIndex: number) => findingIndex !== indexToRemove,
  );
  return {
    ...report,
    findings: nextFindings,
    updatedAt: new Date().toISOString(),
  };
};

export const getAddFindingState = (report: any) => ({
  ...report,
  __editMode: "add_finding",
});

export const getEditFindingState = (report: any, index: number) => ({
  ...report,
  __editMode: "edit_finding",
  __editFindingIndex: index,
});
