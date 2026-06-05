import * as fs from 'fs';
import * as path from 'path';

type PrecisionCase = {
  id: string;
  observationText: string;
  jurisdiction: 'msha' | 'osha_general_industry' | 'osha_construction';
  equipment: string;
  task: string;
  locationContext: string;
  controlFailure: string;
  exposurePattern: string;
  expectedHazardFamily: string;
  expectedScenarioFamily: string;
  expectedMechanism: string;
  expectedRiskBand: string;
  expectedStandardFamily: string;
  notes: string;
};

const cases: PrecisionCase[] = [
  {
    id: 'PRECISION-001',
    observationText: 'Employee cleaning spilled material at an operating conveyor tail pulley. The tail pulley guard is missing and the worker is within reach of the nip point.',
    jurisdiction: 'msha',
    equipment: 'conveyor',
    task: 'cleanup',
    locationContext: 'conveyor_tail_pulley_area',
    controlFailure: 'missing_guard',
    exposurePattern: 'employee_performing_cleanup',
    expectedHazardFamily: 'machine_guarding',
    expectedScenarioFamily: 'conveyor_cleanup',
    expectedMechanism: 'rotating_equipment_nip_point',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'machine_guarding',
    notes: 'Clear conveyor cleanup exposure with missing guard and nip-point access.'
  },
  {
    id: 'PRECISION-002',
    observationText: 'Conveyor tail pulley is unguarded along a travelway. Employees walk past the exposed pulley during normal production travel.',
    jurisdiction: 'msha',
    equipment: 'conveyor',
    task: 'inspection',
    locationContext: 'travelway',
    controlFailure: 'missing_guard',
    exposurePattern: 'pedestrian_travel_path',
    expectedHazardFamily: 'machine_guarding',
    expectedScenarioFamily: 'unguarded_conveyor_pulley',
    expectedMechanism: 'rotating_equipment_nip_point',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'machine_guarding',
    notes: 'Clear unguarded conveyor pulley exposure.'
  },
  {
    id: 'PRECISION-003',
    observationText: 'Exposed rotating shaft and coupling on a pump motor are accessible beside the maintenance walkway. No fixed guard is installed.',
    jurisdiction: 'osha_general_industry',
    equipment: 'pump motor',
    task: 'maintenance',
    locationContext: 'maintenance_walkway',
    controlFailure: 'missing_guard',
    exposurePattern: 'maintenance_activity_near_hazard',
    expectedHazardFamily: 'machine_guarding',
    expectedScenarioFamily: 'rotating_shaft_guarding',
    expectedMechanism: 'rotating_equipment_entanglement',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'machine_guarding',
    notes: 'Clear rotating shaft/coupling guarding case.'
  },
  {
    id: 'PRECISION-004',
    observationText: 'Table saw point of operation is exposed while an employee cuts material. Blade guard is removed and hands pass near the cutting point.',
    jurisdiction: 'osha_general_industry',
    equipment: 'table saw',
    task: 'operation',
    locationContext: 'shop_floor',
    controlFailure: 'missing_point_of_operation_guard',
    exposurePattern: 'employee_operating_equipment',
    expectedHazardFamily: 'machine_guarding',
    expectedScenarioFamily: 'point_of_operation_guarding',
    expectedMechanism: 'cut_amputation_point_of_operation',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'machine_guarding',
    notes: 'Clear point-of-operation guarding case.'
  },
  {
    id: 'PRECISION-005',
    observationText: 'Electrical panel door is blocked by stored materials. Employees cannot safely access disconnects or maintain required working clearance.',
    jurisdiction: 'osha_general_industry',
    equipment: 'electrical panel',
    task: 'operation',
    locationContext: 'electrical_room',
    controlFailure: 'blocked_access',
    exposurePattern: 'employee_inspecting_area',
    expectedHazardFamily: 'electrical',
    expectedScenarioFamily: 'electrical_panel_access',
    expectedMechanism: 'electrical_shock_arc_flash_access_clearance',
    expectedRiskBand: 'moderate',
    expectedStandardFamily: 'electrical',
    notes: 'Clear electrical panel access/clearance case.'
  },
  {
    id: 'PRECISION-006',
    observationText: 'Extension cord has damaged insulation and is being used in a wet processing area. Employees handle the cord during cleanup.',
    jurisdiction: 'osha_general_industry',
    equipment: 'extension cord',
    task: 'cleanup',
    locationContext: 'wet_processing_area',
    controlFailure: 'damaged_insulation',
    exposurePattern: 'employee_performing_cleanup',
    expectedHazardFamily: 'electrical',
    expectedScenarioFamily: 'damaged_cord_wet_location',
    expectedMechanism: 'electrical_shock',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'electrical',
    notes: 'Clear damaged cord in wet location.'
  },
  {
    id: 'PRECISION-007',
    observationText: 'Oil and loose aggregate are present across a pedestrian walkway. Employees use the walkway to access the plant control room.',
    jurisdiction: 'msha',
    equipment: 'walkway',
    task: 'travel',
    locationContext: 'pedestrian_walkway',
    controlFailure: 'poor_housekeeping',
    exposurePattern: 'pedestrian_travel_path',
    expectedHazardFamily: 'slip_trip_fall',
    expectedScenarioFamily: 'housekeeping_slip_trip',
    expectedMechanism: 'slip_trip_fall_same_level',
    expectedRiskBand: 'moderate',
    expectedStandardFamily: 'walking_working_surfaces',
    notes: 'Clear housekeeping slip/trip exposure.'
  },
  {
    id: 'PRECISION-008',
    observationText: 'Fire extinguisher is blocked by stacked pallets and the inspection tag is expired. Employees would not have ready access during a fire emergency.',
    jurisdiction: 'osha_general_industry',
    equipment: 'fire extinguisher',
    task: 'inspection',
    locationContext: 'warehouse',
    controlFailure: 'blocked_access_missing_inspection',
    exposurePattern: 'emergency_access_needed',
    expectedHazardFamily: 'fire_protection',
    expectedScenarioFamily: 'fire_extinguisher_access_inspection',
    expectedMechanism: 'delayed_emergency_response',
    expectedRiskBand: 'moderate',
    expectedStandardFamily: 'fire_protection',
    notes: 'Clear extinguisher access and inspection issue.'
  },
  {
    id: 'PRECISION-009',
    observationText: 'Forklift operates through a shared pedestrian aisle with no marked walkway, no separation barrier, and employees walking beside moving equipment.',
    jurisdiction: 'osha_general_industry',
    equipment: 'forklift',
    task: 'transport',
    locationContext: 'warehouse_aisle',
    controlFailure: 'inadequate_separation',
    exposurePattern: 'pedestrian_travel_path',
    expectedHazardFamily: 'mobile_equipment',
    expectedScenarioFamily: 'mobile_equipment_pedestrian_interaction',
    expectedMechanism: 'struck_by_mobile_equipment',
    expectedRiskBand: 'high',
    expectedStandardFamily: 'powered_industrial_trucks',
    notes: 'Clear mobile equipment and pedestrian interaction.'
  },
  {
    id: 'PRECISION-010',
    observationText: 'Worker is inside an excavation deeper than five feet with vertical walls and no visible protective system. Spoil pile is near the edge.',
    jurisdiction: 'osha_construction',
    equipment: 'excavation',
    task: 'trenching',
    locationContext: 'construction_trench',
    controlFailure: 'missing_protective_system',
    exposurePattern: 'employee_working_inside_excavation',
    expectedHazardFamily: 'excavation_trenching',
    expectedScenarioFamily: 'excavation_protective_system_ambiguity',
    expectedMechanism: 'caught_in_cave_in',
    expectedRiskBand: 'critical',
    expectedStandardFamily: 'excavation_trenching',
    notes: 'Clear excavation protective system review case.'
  }
];

const outputPath = path.resolve(__dirname, '../../safescope-data/benchmarks/safescope-precision-batch-001.v1.json');

fs.writeFileSync(
  outputPath,
  JSON.stringify(
    {
      version: 'v1',
      batch: '001',
      purpose: 'Small, high-quality SafeScope precision calibration batch with real scenario language.',
      caseCount: cases.length,
      cases
    },
    null,
    2
  )
);

console.log(`Wrote ${cases.length} precision cases to ${outputPath}`);
