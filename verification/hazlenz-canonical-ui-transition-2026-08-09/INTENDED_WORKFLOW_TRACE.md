# Intended canonical workflow

`/inspections` creates a persisted site/inspection and writes `sentinel_selected_inspection_context`. `/inspection` loads the field workflow. `InspectionWorkflowHeader` calls `goToInspectionStep(currentStep + 1)`, which clamps and sets `currentStep`. `InspectionStepRenderer` renders Step 2 when `currentStep === 2`; `InspectionStepTwo` exposes `Review with HazLenz AI`, which calls `handleRunSafeScope`. That handler invokes the production classify path and persists observation/analysis through the canonical API. The resulting reasoning is passed to the review panels and finding-scoped persistence controls.

Observed break: the real browser remained in Step 1 after the Next interaction, so the Step 2 control and analysis request were never reached. Persistence, authorization, analysis, finding review, and finalization were not bypassed or weakened.
