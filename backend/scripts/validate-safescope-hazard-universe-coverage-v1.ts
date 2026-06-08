import { HAZARD_UNIVERSE_REGISTRY } from '../src/safescope-v2/hazard-universe/hazard-universe.registry';
import { HazardFamily } from '../src/safescope-v2/hazard-universe/hazard-universe.types';

async function validate() {
  console.log('--- Testing SafeScope Hazard Universe Coverage v1 ---');

  const requiredFamilies: HazardFamily[] = [
    'machine_guarding',
    'lockout_tagout',
    'electrical',
    'fall_protection',
    'mobile_equipment',
    'silica_respirable_dust',
    'confined_space',
    'welding_fumes',
    'hot_work'
  ];

  const coveredFamilies = HAZARD_UNIVERSE_REGISTRY.map((h: any) => h.hazardFamily);
  const missing = requiredFamilies.filter(f => !coveredFamilies.includes(f));

  if (missing.length > 0) {
    throw new Error('Hazard Universe is missing critical coverage for: ' + missing.join(', '));
  }

  console.log('[PASS] Coverage validated for ' + coveredFamilies.length + ' hazard families.');

  HAZARD_UNIVERSE_REGISTRY.forEach((h: any) => {
    if (!h.mechanismOfHarm || h.mechanismOfHarm.length === 0) throw new Error('Hazard ' + h.hazardFamily + ' missing mechanismOfHarm');
    if (!h.hazardousEnergyOrAgent || h.hazardousEnergyOrAgent.length === 0) throw new Error('Hazard ' + h.hazardFamily + ' missing hazardousEnergyOrAgent');
    if (!h.preferredControlFamilies || h.preferredControlFamilies.length === 0) throw new Error('Hazard ' + h.hazardFamily + ' missing preferredControlFamilies');
  });

  console.log('[PASS] Registry integrity verified.');
  console.log('✅ SafeScope hazard universe coverage validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
