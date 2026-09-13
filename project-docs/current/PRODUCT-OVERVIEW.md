# Product overview

**Safety InSite** is field safety software for the people who actually walk the site. A safety
professional captures what they observed — in words, with photos, often with no signal — and the
product turns that into a documented finding with regulatory support, a corrective action, a review
trail, and an inspection-ready report.

**HazLenz** is the governed safety-intelligence engine inside it. It reads an observation, proposes
the hazards present, binds them to the standards that actually apply, and states what it does not
know. It is not an oracle and the product does not present it as one: every HazLenz output is a
proposal until a person confirms it.

## Who it is for

Safety managers, EHS professionals and inspectors in industrial settings — construction, mining,
manufacturing — who are responsible for finding hazards before they hurt somebody and for being able
to show, afterwards, what they found and what they did about it.

## The workflow

1. **Capture.** An observation is recorded on site, with photos and notes. This works offline; work
   queues locally and syncs idempotently when connectivity returns.
2. **Analyse.** HazLenz decomposes the observation into findings, each with hazard classification,
   candidate standards, and an explicit statement of what remains unknown.
3. **Review.** A person confirms, edits or rejects each finding. Nothing is asserted on the
   product's authority alone.
4. **Act.** Confirmed findings carry corrective actions with owners and due dates, tracked to
   outcome.
5. **Report.** An audit-ready report is generated and versioned, retained so an issued report stays
   reproducible.

## What makes it different

**It says what it does not know.** When something material is unresolved, the engine emits it as a
structured owed fact rather than guessing or staying silent. Decision-critical silence is treated as
a failure, not a safe default.

**Regulatory claims are governed.** Standards citations come from an approved, reviewed corpus with
recorded provenance — not from a model's recollection.

**Refusal is a first-class outcome.** When the engine cannot answer safely it refuses, and a refusal
is never dressed up as an available analysis.

**Human judgement is the durable artifact.** Settlements are treated as more valuable than code: the
rollback model forbids destroying them to restore an older build.

## What it is not

It does not replace a qualified safety professional, and the product's own
[limitations statement](../legal/PRODUCT-LIMITATIONS.md) says so. It does not perform automated
image recognition — visual reasoning is based on attachment metadata and notes. It does not give
legal advice; jurisdiction assessment is advisory and requires qualified review. What may and may
not be claimed is fixed in the [capability register](CAPABILITY-REGISTER.md).

## Status

Pre-beta. The engineering mechanisms exist and are verified locally; the product has not been
released to any customer. See [BETA-READINESS.md](BETA-READINESS.md) for what remains.
