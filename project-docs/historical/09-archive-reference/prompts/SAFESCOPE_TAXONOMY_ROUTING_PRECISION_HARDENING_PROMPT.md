You are working in the Sentinel_Safety repo.

Goal:
Implement SafeScope Taxonomy Routing Precision Hardening v1.

Current state:
- SafeScope full validation passes 39/39.
- Frontend build passes.
- There are 40 hazard taxonomy domains in:
  safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json
- Hazard taxonomy routing exists in:
  backend/src/safescope-v2/hazard-taxonomy-coverage/
- Absorption uses taxonomy routing in:
  backend/src/safescope-v2/hazard-information-absorption/hazard-information-absorption.service.ts
- Master runner:
  backend/scripts/run-safescope-full-validation.ts

Known routing problems from validation debug output:
1. "worker near unprotected floor hole" matched hot_work only because of generic signal "work".
2. "worker entered unprotected trench with spoil pile near edge and ladder missing" matched fall_protection instead of excavation_trenching.
3. "open edge on elevated platform with employees working nearby and no guardrail visible" matched machine_guarding because of generic signal "guard".
4. "employee grinding metal without safety glasses or face shield" did not match PPE.
5. "palletized material is stacked unevenly and leaning into an employee aisle" did not match material_handling/storage.
6. "compressed air hose coupling is damaged and leaking near employees. the hose is pressurized and whipping movement is possible if the coupling fails" did not match compressed_air/pressure/hose energy.

Requirements:
- Do NOT weaken governance.
- Do NOT create any output that declares violations or citations.
- Do NOT remove human-review boundaries.
- Do NOT push.
- Local commits only.
- Preserve all existing passing validations.
- Improve deterministic taxonomy routing.

Implementation requirements:
1. Inspect current taxonomy map and routing service.
2. Add support for stronger weighted routing or priority scoring if not already present.
3. Reduce or eliminate generic single-word false positives:
   - "work" must not route to hot_work unless paired with "hot", "welding", "cutting", "grinding", "spark", "fire watch", "torch", or similar.
   - "guard" must not automatically route to machine_guarding when context indicates guardrail, floor hole, open edge, platform, elevated work, roof edge, or fall exposure.
   - "edge" must not automatically override excavation when trench/excavation terms exist.
   - "platform" must not automatically route to fall protection if rotating equipment/machine guarding context is stronger.
4. Add/strengthen taxonomy domain signals for:
   - walking_working_surfaces / floor_hole / open_hole / walking surface opening.
   - fall_protection / open edge / roof edge / elevated platform / guardrail.
   - excavation_trenching / trench / excavation / cave-in / spoil pile / trench box / shoring / sloping.
   - ppe / safety glasses / face shield / eye protection / grinding.
   - material_handling / storage / stacked material / leaning pallets / unstable stack.
   - compressed_air_pressure / pneumatic hose / hose coupling / whip / pressurized line.
5. Add explicit regression cases to validate-safescope-hazard-taxonomy-coverage.ts for the six known problems.
6. If needed, create a dedicated validator:
   backend/scripts/validate-safescope-taxonomy-routing-precision.ts
   and wire it into the master runner.
7. Update docs:
   project-docs/04-safescope-engine/SAFESCOPE_HAZARD_TAXONOMY_GAP_REPORT.md
   project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
   project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

   Add:
   - taxonomy coverage map status
   - coverage count
   - remaining top-priority gaps
   - explanation that absorption is reviewer-controlled and routes to draft/review, not automatic approval

8. Archive this prompt into:
   project-docs/09-archive-reference/prompts/SAFESCOPE_TAXONOMY_ROUTING_PRECISION_HARDENING_PROMPT.md

Validation commands:
cd backend
npm run build
npx ts-node scripts/validate-safescope-hazard-taxonomy-coverage.ts
if [ -f scripts/validate-safescope-taxonomy-routing-precision.ts ]; then npx ts-node scripts/validate-safescope-taxonomy-routing-precision.ts; fi
npm run validate:safescope:full
cd ../frontend-next
npm run build

Expected output:
- Full SafeScope validation passes.
- Frontend build passes.
- Known misroutes corrected.
- No push.
- Commit locally with:
  git commit -m "Harden SafeScope taxonomy routing precision"
EOF
