# Step-state ownership map

| Owner | Reads | Writes/resets | Finding |
|---|---|---|---|
| `InspectionPage.currentStep` | `InspectionWorkflowHeader`, `InspectionStepRenderer`, finalize/report sections | canonical React state | single production source of truth |
| `InspectionWorkflowHeader.handleNext/handleBack` | current step and step count | calls `goToInspectionStep` | correct transition logic |
| `goToInspectionStep` | clamped target and step count | `setCurrentStep(target)` | correct setter path |
| edit-report loader | edit/add/report mode | may set 1 or 4 on a real edit report | legitimate initialization only |
| `resetCurrentFinding` / edit finding | finding lifecycle | resets to Step 1 | legitimate new/edit finding behavior |
| selected inspection effect | local-storage inspection context | inspection context/mode, not step | no step reset |
| autosave effect | current step | local-storage snapshot only | no step reset |

The baseline failure occurred before any of these owners ran because the route had no hydrated client handlers under the `127.0.0.1` Next-dev origin. No competing state owner was responsible for the observed 0/20 result.
