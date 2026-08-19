# Minimum Evidence Model

## Decision

Use a versioned `EvidenceSnapshot` containing normalized `EvidenceFact` records. Preserve the existing `StructuredObservationInput` as a compatibility projection.

```ts
type EvidenceFact = {
  id: string;
  type: EvidenceFactType;
  value: string | number | boolean | string[] | null;
  unit?: string;
  source: "user_text" | "user_confirmation" | "photo_model" | "site_context" |
    "inspection_context" | "clarification" | "qualified_review" | "system_inference";
  confidence: number; // 0..1; evidentiary confidence, not legal confidence
  status: "observed" | "confirmed" | "inferred" | "unknown" | "contradicted" | "corrected";
  observedAt?: string;
  temporalState: "current" | "previously_observed" | "corrected_before_review" | "unknown";
  contradictedBy?: string[];
  supersedesFactId?: string;
  reviewerStatus: "unreviewed" | "user_confirmed" | "qualified_confirmed" | "rejected";
};
```

`EvidenceSnapshot` includes schema version, narrative, location, jurisdiction context, facts, critical unknowns, contradictions, extraction timestamp, extractor version, and prior snapshot linkage.

## Fact types

Jurisdiction/site type; location/work area; work activity; observed condition; people/exposure; equipment; operating state; energy source; isolation state; material/chemical; environmental condition; height/depth/distance; protective system; existing/missing control; immediate action; event type; evidence source; measurement; temporal state.

## Source hierarchy

Qualified-review correction > explicit user confirmation > direct user observation/measurement > trusted site/inspection context > photo-model suggestion > system inference. Higher authority does not silently delete lower evidence; it supersedes it and leaves an audit link.

## Unknowns and contradictions

Unknown is a first-class fact with a named material predicate. Contradictions remain unresolved until an explicit confirmation/review supersedes one side. A contradictory material predicate cannot support a definitive citation.

## Confidence

Confidence describes whether the submitted evidence supports a fact. It does not express probability that a law was violated. Regulatory applicability has a separate status and confidence.

## Offline and compatibility

Extraction, predicates, and question templates are deterministic and bundled offline. Existing structured observations are converted into facts at request time. Existing analysis snapshots remain readable; new snapshots include both canonical evidence and the compatibility projection.
