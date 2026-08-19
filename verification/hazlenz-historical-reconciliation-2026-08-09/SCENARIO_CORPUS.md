# Reanalysis scenarios

Three observations were authored for this phase:

1. Removal: conveyor guarding + electrical exposure + oily floor → verified guard, electrical exposure, oily floor.
2. Addition: forklift traffic → forklift traffic + newly exposed conveyor nip point.
3. Material change: damaged ladder → powered industrial truck traffic.

The real capture and initial analysis were performed through Chromium. The application exposes no observation-edit route or edit control after analysis; the UI only exposes fact-correction/clarification reanalysis. That absence was verified from the rendered workspace and route/controller inspection. Changed snapshots were therefore submitted through the existing authenticated analysis-snapshot endpoint after a fresh production classify response, without direct database edits. This is recorded as a workflow limitation, not hidden as a UI pass.
