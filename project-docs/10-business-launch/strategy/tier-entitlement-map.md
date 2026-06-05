# SafeScope Tier and Entitlement Map

## Overview
This document defines the entitlement mapping for Sentinel Safety / SafeScope v2. It ensures consistent enforcement of access tiers across the application, with granular gating for safety intelligence and administrative features.

## Tier Definitions
- **Basic:** Foundation capture.
- **Pro (Plus):** Enhanced safety intelligence and individual reporting.
- **Company:** Full suite, including management, team collaboration, and auditability.

## Entitlement Mapping

| Feature | Basic | Pro | Company |
| :--- | :---: | :---: | :---: |
| **Quick Capture** | Yes | Yes | Yes |
| **Guided Inspection** | No | Yes | Yes |
| **Advanced Audit Review** | No | No | Yes |
| **SafeScope Intelligence** | No | Yes | Yes |
| **Risk Reasoning** | No | Yes | Yes |
| **Report Narrative Generation**| No | Yes | Yes |
| **Team Management** | No | No | Yes |
| **Inspection Assignments** | No | No | Yes |
| **Corrective Action Assignments** | No | No | Yes |
| **Supervisor Validation** | No | No | Yes |
| **Audit Trail** | No | No | Yes |
| **Workspace Filtering** | No | No | Yes |
| **Company Analytics** | No | No | Yes |

## Guardrails
- All intelligence features are advisory-only (`advisoryOnly: true`).
- No tier bypasses the "Qualified Review Required" guardrail.
- "Vulcan" promo code promotes user to "Pro" tier (Plus).
