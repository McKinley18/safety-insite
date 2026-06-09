import { Injectable, OnModuleInit } from '@nestjs/common';
import { LocalVectorStore } from './local-vector-store';
import { 
  SemanticVectorSearchInput, 
  VectorSearchResult, 
  VectorDocument 
} from './semantic-vector-search.types';

@Injectable()
export class SemanticVectorSearchService implements OnModuleInit {
  private vectorStore = new LocalVectorStore();

  // Core set of pre-indexed standards to guarantee offline, out-of-the-box intelligence
  private defaultCatalog: VectorDocument[] = [
    {
      id: 'osha-1910-212',
      text: 'One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, flying chips and sparks.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.212(a)(1)', domain: 'machine_guarding' }
    },
    {
      id: 'msha-56-14107',
      text: 'Moving machine parts shall be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels, couplings, shafts, fan blades, and similar moving parts that can cause injury.',
      metadata: { agency: 'MSHA', standard: '30 CFR 56.14107(a)', domain: 'machine_guarding' }
    },
    {
      id: 'osha-1910-147',
      text: 'This standard covers the servicing and maintenance of machines and equipment in which the unexpected energization or start up of the machines or equipment, or release of stored energy, could harm employees.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.147(c)(1)', domain: 'lockout_tagout' }
    },
    {
      id: 'msha-56-12017',
      text: 'Power circuits shall be deenergized before work is done on such circuits unless hot-work procedures are used. Suitable warning signs shall be posted and lockout tagout applied.',
      metadata: { agency: 'MSHA', standard: '30 CFR 56.12017', domain: 'lockout_tagout' }
    },
    {
      id: 'osha-1910-303',
      text: 'Electrical conductors and equipment shall be approved and free from recognized hazards. Conductor wires must not be frayed, damaged, or expose personnel to electric shock risks.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.303(b)(2)', domain: 'electrical' }
    },
    {
      id: 'osha-1910-22',
      text: 'All places of employment, passageways, storerooms, service rooms, and walking-working surfaces shall be kept in a clean, orderly, and sanitary condition to prevent slips, trips, and falls.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.22(a)(1)', domain: 'slips_trips_falls' }
    },
    {
      id: 'osha-1910-28',
      text: 'The employer must ensure that each employee on a walking-working surface with an unprotected side or edge that is 4 feet (1.2 m) or more above a lower level is protected from falling by guardrail systems, safety net systems, or personal fall protection.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.28(b)(1)(i)', domain: 'fall_protection' }
    },
    {
      id: 'msha-56-15005',
      text: 'Safety belts and lines shall be worn when persons work where there is danger of falling; a second person shall tend the lifeline when bins, tanks, or other dangerous areas are entered.',
      metadata: { agency: 'MSHA', standard: '30 CFR 56.15005', domain: 'fall_protection' }
    },
    {
      id: 'osha-1910-178',
      text: 'Powered industrial trucks, forklifts, loaders, and haul trucks shall be operated safely. Pedestrians and workers nearby must be protected from vehicle movement and blind spots.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.178(m)(12)', metadata: { domain: 'mobile_equipment' } }
    },
    {
      id: 'osha-1910-1200',
      text: 'Chemical manufacturers and importers shall classify the hazards of chemicals. Containers must be labeled, SDS must be readily available, and training provided for secondary container hazardous material.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.1200(f)(6)', domain: 'hazcom' }
    },
    {
      id: 'osha-1910-146',
      text: 'Permit-required confined spaces. The employer must identify spaces containing atmospheric hazards, toxic gases, engulfment, or configuration risks before entering vessels or pits.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.146(c)(1)', domain: 'confined_space' }
    },
    {
      id: 'osha-1910-37',
      text: 'Exit routes must be free and unobstructed. No materials or equipment may be stored within the exit access, blocking walkways or obstructing emergency exits during fires.',
      metadata: { agency: 'OSHA', standard: '29 CFR 1910.37(a)(3)', domain: 'emergency_egress' }
    }
  ];

  async onModuleInit() {
    // Populate with default catalogs on startup
    this.vectorStore.addDocuments(this.defaultCatalog);
  }

  /**
   * Registers additional documents (e.g. from custom site policies or draft candidates)
   */
  public indexDocuments(docs: VectorDocument[]): void {
    this.vectorStore.addDocuments(docs);
  }

  /**
   * Clears the index and resets to default catalog
   */
  public resetIndex(): void {
    this.vectorStore.clear();
    this.vectorStore.addDocuments(this.defaultCatalog);
  }

  /**
   * Performs semantic vector query and resolves closest safety standards
   */
  public query(input: SemanticVectorSearchInput): VectorSearchResult[] {
    const limit = input.limit || 5;
    const minScore = input.minScore !== undefined ? input.minScore : 0.05;
    return this.vectorStore.search(input.query, limit, minScore);
  }
}
