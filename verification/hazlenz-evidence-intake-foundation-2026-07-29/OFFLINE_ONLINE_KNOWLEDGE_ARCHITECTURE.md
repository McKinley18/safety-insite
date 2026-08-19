# Offline and Online Knowledge Architecture

## Offline core

Versioned regulatory text for supported MSHA MNM, OSHA General Industry, and OSHA Construction coverage; citation aliases; hazard taxonomy; approved applicability predicates; corrective-action controls; question templates; hierarchy-of-controls rules; effective dates and bundle hashes.

The core is sufficient to extract facts, evaluate supported predicates, ask clarifications, and produce advisory candidates without connectivity.

## Online enrichment

Official eCFR, OSHA, MSHA, NIOSH, official interpretations/directives, and approved Safety InSite knowledge releases may enrich analysis. Each retrieval records URL, agency, document type, retrieval time, content/version hash, and review state.

Online material never silently replaces the offline core. Regulation, interpretation, directive, and guidance remain distinct authority classes. Unreviewed retrieval may be informational/candidate only.

When unavailable, the API returns offline bundle version and enrichment-unavailable status without degrading into arbitrary general-web retrieval.
