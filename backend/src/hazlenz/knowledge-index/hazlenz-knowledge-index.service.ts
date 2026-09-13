import { Injectable } from '@nestjs/common';
import { KNOWLEDGE_MANIFEST } from './hazlenz-knowledge-index.seed';
import { KnowledgeEntry, Jurisdiction, HazardFamily, EquipmentFamily, TaskMechanism } from './hazlenz-knowledge-index.types';

@Injectable()
export class HazLenzKnowledgeIndexService {
  private readonly index: KnowledgeEntry[] = KNOWLEDGE_MANIFEST;

  resolveKnowledgeRoute(route: {
    jurisdiction?: Jurisdiction;
    hazardFamily?: HazardFamily;
    equipmentFamily?: EquipmentFamily;
    taskMechanism?: TaskMechanism;
  }): KnowledgeEntry[] {
    return this.index.filter((entry) => {
      // Jurisdiction must match unless route is 'unclear' (generic fallback allowed)
      if (route.jurisdiction) {
        if (route.jurisdiction === 'unclear') {
            if (entry.jurisdiction !== 'unclear') return false;
        } else if (entry.jurisdiction !== route.jurisdiction) {
            return false;
        }
      }
      
      // HazardFamily must match unless route is 'other'
      if (route.hazardFamily) {
        if (route.hazardFamily === 'other') {
            if (entry.hazardFamily !== 'other') return false;
        } else if (entry.hazardFamily !== route.hazardFamily) {
            return false;
        }
      }
      
      // EquipmentFamily must match unless route is 'unknown'
      if (route.equipmentFamily) {
        if (route.equipmentFamily === 'unknown') {
            if (entry.equipmentFamily !== 'unknown') return false;
        } else if (entry.equipmentFamily !== route.equipmentFamily) {
            return false;
        }
      }
      
      // TaskMechanism must match unless route is 'unknown'
      if (route.taskMechanism) {
        if (route.taskMechanism === 'unknown') {
            if (entry.taskMechanism !== 'unknown') return false;
        } else if (entry.taskMechanism !== route.taskMechanism) {
            return false;
        }
      }
      
      return true;
    });
  }

  getCandidateBundleKeys(route: {
    jurisdiction?: Jurisdiction;
    hazardFamily?: HazardFamily;
    equipmentFamily?: EquipmentFamily;
    taskMechanism?: TaskMechanism;
  }): string[] {
    const entries = this.resolveKnowledgeRoute(route);
    return Array.from(new Set(entries.flatMap((e) => e.bundleIds)));
  }

  listKnowledgeIndexEntries(): KnowledgeEntry[] {
    return [...this.index];
  }

  getIndexSummary(): { totalEntries: number; jurisdictions: string[]; hazardFamilies: string[] } {
    return {
      totalEntries: this.index.length,
      jurisdictions: Array.from(new Set(this.index.map((e) => e.jurisdiction))),
      hazardFamilies: Array.from(new Set(this.index.map((e) => e.hazardFamily))),
    };
  }

  validateIndex(): void {
    if (this.index.length === 0) throw new Error("Knowledge index is empty");
    for (const entry of this.index) {
        if (!entry.jurisdiction || !entry.hazardFamily || (entry.bundleIds.length === 0 && entry.sourceKeys.length === 0)) {
            throw new Error(`Invalid entry found: ${JSON.stringify(entry)}`);
        }
    }
    
    // Validate common scenarios
    const commonScenarios: { 
      jurisdiction: Jurisdiction; 
      hazardFamily: HazardFamily; 
      equipmentFamily: EquipmentFamily; 
      taskMechanism: TaskMechanism 
    }[] = [
        { jurisdiction: 'msha', hazardFamily: 'conveyors', equipmentFamily: 'conveyor', taskMechanism: 'guarding' },
        { jurisdiction: 'osha_general_industry', hazardFamily: 'electrical', equipmentFamily: 'electrical_panel', taskMechanism: 'electrical_contact' },
        { jurisdiction: 'unclear', hazardFamily: 'mobile_equipment', equipmentFamily: 'mobile_equipment', taskMechanism: 'struck_by' },
        { jurisdiction: 'osha_construction', hazardFamily: 'fall_protection', equipmentFamily: 'platform', taskMechanism: 'fall_from_height' },
        { jurisdiction: 'osha_general_industry', hazardFamily: 'chemical_exposure', equipmentFamily: 'unknown', taskMechanism: 'chemical_exposure' },
        { jurisdiction: 'msha', hazardFamily: 'lockout_tagout', equipmentFamily: 'unknown', taskMechanism: 'energy_isolation' }
    ];

    for (const scenario of commonScenarios) {
        const matches = this.resolveKnowledgeRoute(scenario);
        if (matches.length === 0) {
            throw new Error(`Failed to resolve common scenario: ${JSON.stringify(scenario)}`);
        }
    }
  }
}
