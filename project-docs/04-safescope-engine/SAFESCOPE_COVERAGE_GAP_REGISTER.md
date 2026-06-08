# SafeScope Coverage Gap Register v1

This document tracks current coverage areas and identified gaps in SafeScope's regulatory, hazard, and control reasoning capabilities, including mitigation techniques and verification evidence.

## Current Confirmed Coverage (v1)
- **Acute Hazards:** Machine Guarding, LOTO, Electrical, Fall Protection, Mobile Equipment.
- **Health Hazards:** Silica Dust, Welding Fumes, Noise, Heat/Cold Stress.
- **Readiness:** Emergency Egress, Fire Protection, PPE.
- **Jurisdictions:** OSHA General Industry, OSHA Construction, MSHA MNM Surface.

## Identified Coverage Gaps

### Regulatory Gaps
| Area | Description | Priority |
| :--- | :--- | :--- |
| **MSHA Part 75/77** | Underground Coal and Surface Coal specific rules. | P1 |
| **OSHA Maritime** | 29 CFR 1915/1917/1918 specific hazards. | P2 |
| **ISO 45001** | International safety management system alignment. | P2 |
| **State Plans** | Cal/OSHA or WA-DOSH specific variances. | P1 |

### Hazard & Control Gaps
| Area | Description | Priority |
| :--- | :--- | :--- |
| **Industrial Hygiene** | Advanced reasoning for multi-contaminant atmospheric exposure. | P1 |
| **Ergonomics Library** | Broad library of task-specific mechanical lift assist controls. | P1 |
| **Structural Integrity** | Reasoning about building/scaffold load ratings and mitigation. | P2 |
| **Biological Agents** | Comprehensive library for bloodborne and airborne pathogens. | P2 |

### Functional Gaps
| Area | Description | Priority |
| :--- | :--- | :--- |
| **Regulatory Source Live Sync** | Implemented v1; live network boundaries and abstraction active. | P1 |
| **Verification Evidence** | Automated validation of multi-photo "repaired" states. | P0 |
| **Offline Sync** | Automatic conflict resolution when syncing multi-user offline traces. | P0 |
| **Policy Isolation** | Sandboxed workspace-specific policy enforcement. | P1 |

## Priority Key
- **P0:** Required before staging field pilot.
- **P1:** Required before paid beta.
- **P2:** Required before broad commercial release.
