export type Jurisdiction = 'msha' | 'osha_general_industry' | 'osha_construction' | 'unclear';

export type HazardFamily = 'electrical' | 'fall_protection' | 'mobile_equipment' | 'powered_haulage' | 'conveyors' | 'lockout_tagout' | 'chemical_exposure' | 'compressed_gas' | 'traffic_control' | 'housekeeping' | 'fire_extinguisher' | 'other';

export type EquipmentFamily = 'conveyor' | 'mobile_equipment' | 'electrical_panel' | 'gas_cylinder' | 'ladder' | 'platform' | 'machine_guarding' | 'vehicle' | 'unknown';

export type TaskMechanism = 'guarding' | 'struck_by' | 'caught_in_between' | 'electrical_contact' | 'fall_from_height' | 'chemical_exposure' | 'compressed_gas_storage' | 'energy_isolation' | 'visibility_traffic' | 'housekeeping_slip_trip' | 'unknown';

export interface KnowledgeEntry {
  jurisdiction: Jurisdiction;
  hazardFamily: HazardFamily;
  equipmentFamily: EquipmentFamily;
  taskMechanism: TaskMechanism;
  bundleIds: string[];
  sourceKeys: string[];
  approvedOnly: boolean;
  tier: 'basic' | 'pro' | 'enterprise';
}
