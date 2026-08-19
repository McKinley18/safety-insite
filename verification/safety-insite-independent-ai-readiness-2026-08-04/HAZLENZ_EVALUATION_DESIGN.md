# Independent HazLenz evaluation design

The blind corpus contains 180 opaque IDs, generated outside production source directories. Production receives only text, jurisdiction context, and ordinary evidence metadata. Ground truth is stored separately and is never imported by backend code or included in prompts. The corpus covers hazardous work, safe states, ambiguity, multi-hazard, jurisdiction, contradiction/distractor-like language, and life-critical families. A 60-case subset has 120 paraphrase/distractor variants.

This is a deterministic advisory-engine evaluation, not proof of human-level visual understanding. It measures endpoint behavior, schema stability, hazard-family concepts, safe-state suppression, clarification presentation, and life-critical omissions.
