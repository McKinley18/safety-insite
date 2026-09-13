# SafeScope Brain Foundation

SafeScope Brain is the modular intelligence architecture for SafeScope.

The goal is not to replace the current reasoning engine immediately. The goal is to organize safety intelligence into governed, source-backed compartments that can later support faster recall, better situational awareness, and safer AI-assisted reasoning.

## Brain Compartments

1. Source Governance Brain
   - Tracks source authority, source boundaries, approval status, and whether a source can influence reasoning.

2. Regulatory Brain
   - Organizes MSHA/OSHA citations by jurisdiction, industry scope, hazard domain, mechanism, applicability triggers, required controls, and evidence needs.

3. Hazard / Taxonomy Brain
   - Maintains SafeScope's canonical hazard-domain vocabulary.

4. Mechanism Brain
   - Maintains injury mechanisms, energy-transfer pathways, exposure pathways, and precedence rules.

5. Equipment / Task Brain
   - Connects equipment, work activity, components, and failure modes.

6. Controls Brain
   - Maps hazards and mechanisms to immediate controls, permanent corrective actions, and verification evidence.

7. Evidence Brain
   - Defines what facts, photos, measurements, and observations are required to make a finding defensible.

8. Learning Brain
   - Stores candidate improvements from audits, field feedback, and benchmark failures. Learning must be quarantined and human-approved before influencing production reasoning.

## Governance Rule

No unapproved knowledge record may modify SafeScope reasoning.

SafeScope Brain records may be created, queried, and tested as read-only context until a separate integration step explicitly connects approved records to the reasoning orchestrator.

## Current Status

Foundation only. No active reasoning behavior is changed by this folder.
