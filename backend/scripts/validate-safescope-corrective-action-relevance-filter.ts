import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const service = Object.create(SafescopeV2Service.prototype) as any;

const trafficPatterns = [
  'Separate pedestrians from equipment travel paths',
  'Use spotters, barricades, signage, or positive communication as appropriate',
  'Review traffic control plan and visibility limitations',
  'Confirm operator and pedestrian awareness controls',
];

const chemicalContainerObservation =
  'Open chemical container with no label and liquid still inside near a work bench.';

const nonTrafficResult = service.buildEnhancedGeneratedActions(
  [
    {
      title: 'Correct chemical labeling and hazard communication controls',
      description:
        'Correct chemical labeling and hazard communication controls. Separate pedestrians from equipment travel paths, use spotters, barricades, signage, or positive communication as appropriate.',
      suggestedFixes: [
        'Label the container',
        'Close or cover the container',
        'Separate pedestrians from equipment travel paths',
        'Use spotters, barricades, signage, or positive communication as appropriate',
      ],
    },
  ],
  {},
  'regression-open-container',
  {
    correctiveActionPatterns: trafficPatterns,
  },
  chemicalContainerObservation,
);

const nonTrafficSerialized = JSON.stringify(nonTrafficResult).toLowerCase();

assert(
  nonTrafficSerialized.includes('label the container') ||
    nonTrafficSerialized.includes('chemical labeling'),
  'Expected chemical/container action to remain present.',
);

assert(
  !nonTrafficSerialized.includes('separate pedestrians from equipment travel paths'),
  'Traffic/pedestrian corrective action leaked into non-traffic open-container finding.',
);

assert(
  !nonTrafficSerialized.includes('spotters, barricades'),
  'Spotter/barricade traffic-control language leaked into non-traffic open-container finding.',
);

const trafficObservation =
  'Forklift traffic is backing through a blind spot where pedestrians walk near the equipment travel path.';

const trafficResult = service.buildEnhancedGeneratedActions(
  [
    {
      title: 'Separate pedestrians from mobile equipment exposure',
      description: 'Separate pedestrians from equipment travel paths.',
      suggestedFixes: ['Separate pedestrians from equipment travel paths'],
    },
  ],
  {},
  'regression-traffic',
  {
    correctiveActionPatterns: trafficPatterns,
  },
  trafficObservation,
);

const trafficSerialized = JSON.stringify(trafficResult).toLowerCase();

assert(
  trafficSerialized.includes('separate pedestrians from equipment travel paths'),
  'Traffic-control action should remain for a true mobile-equipment/pedestrian observation.',
);

console.log('✅ SafeScope corrective action relevance filter validation passed.');
