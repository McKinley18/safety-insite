# Sentinel Safety Inspection Flow Blueprint

## Core Problem

A user in the field sees a hazardous condition and needs to capture it quickly, understand the likely risk, identify the appropriate controls and standards, and turn it into a defensible finding, corrective action, and report without slowing down field work.

## Product Principle

The user should capture the problem first. Sentinel Safety and SafeScope should infer the likely hazard, regulatory context, standards, and control strategy.

The user should not be forced to choose MSHA, OSHA, or a regulatory body before beginning a field observation.

## Primary Flow

1. Start field inspection
2. Capture photo and/or describe observed condition
3. Add location and immediate context
4. SafeScope identifies likely hazard/problem
5. SafeScope asks only necessary clarification questions
6. SafeScope suggests controls using the hierarchy of controls
7. SafeScope suggests likely standards and explains why
8. User confirms or edits corrective action
9. Finding is saved
10. Report is assembled automatically
11. User finalizes report options and generates output

## Mobile UX Rule

The inspection flow must be mobile-first. The sticky header should remain compact and should not consume the workspace.

Header should show:
- Current step
- Progress
- Autosave status
- Back
- Primary next action

Step content should show:
- What the user needs to do
- SafeScope feedback
- Missing information
- Corrective action guidance

## Inspection Start

The inspection page should allow immediate launch of a field capture regardless of regulatory body.

Primary actions:
- Take photo
- Describe condition
- Start without photo
- Continue draft

Do not require:
- MSHA/OSHA selection
- Full inspection setup
- Regulatory classification before capture

## Regulatory Context

Regulatory context should be:
- inferred from workspace settings when available
- inferred from observation/context when possible
- confirmed only when needed
- user-overridable

Allowed user choices when clarification is needed:
- Mine / MSHA
- Construction / OSHA Construction
- General Industry / OSHA General Industry
- Not sure

## Cover Page

Cover page defaults should be managed in Workspace Settings.

Workspace settings should store:
- Organization name
- Site/facility name
- Logo
- Default cover page on/off
- Default confidentiality marker on/off
- Default confidentiality marker text
- Default report footer/disclaimer
- Default primary regulatory environment, if known

At inspection start, user only confirms:
- Inspector name(s)
- Include cover page
- Include confidentiality marker

## Confidentiality Marker

The UI should refer to this as a confidentiality marker.

Supported labels:
- Privileged & Confidential
- Confidential Safety Review
- Internal Safety Use Only
- Draft — Subject to Review
- None

The app should not imply legal privilege automatically applies.

## SafeScope Feedback Model

SafeScope should display intelligence in layers:

Layer 1:
Compact nudge
- likely hazard
- confidence
- suggested next action

Layer 2:
Review card
- primary classification
- plain-language reasoning
- missing information
- recommended controls
- likely standards

Layer 3:
Advanced reasoning
- evidence quality
- trend intelligence
- operational reasoning
- domain intelligence
- standards reasoning
- critical alerts

Advanced reasoning should be collapsed by default.

## Corrective Action Model

Corrective actions should be guided by the hierarchy of controls:
1. Elimination
2. Substitution
3. Engineering controls
4. Administrative controls
5. PPE

The app should prefer stronger controls where appropriate and explain when a recommendation is only interim.

Corrective action should capture:
- action title
- immediate/interim control
- owner
- priority
- due date
- closure evidence
- verification status

## Report Assembly

The report should be assembled continuously from saved findings.

Final report options:
- cover page
- confidentiality marker
- photos
- standards
- corrective actions
- SafeScope notes
- executive summary

## Implementation Phases

Phase 1:
Document and agree on flow.

Phase 2:
Add workspace settings defaults for cover page and confidentiality marker.

Phase 3:
Simplify inspection start so users can begin with capture regardless of regulatory body.

Phase 4:
Improve SafeScope review UI around nudge/review/advanced reasoning.

Phase 5:
Improve corrective action recommendations around hierarchy of controls.

Phase 6:
Improve report finalization and executive summary generation.

## Sources / Design Basis

- OSHA Recommended Practices emphasize proactive hazard identification and finding/fixing hazards before injury or illness.
- NIOSH and OSHA hierarchy of controls guidance supports ranking corrective actions by effectiveness.
- Mobile UX should minimize cognitive load, preserve workspace, and use progressive disclosure.
