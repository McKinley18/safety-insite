import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { RegulatoryAgency } from './entities/regulatory-agency.entity';
import { RegulatoryPart } from './entities/regulatory-part.entity';
import { RegulatorySubpart } from './entities/regulatory-subpart.entity';
import { RegulatorySection } from './entities/regulatory-section.entity';
import { RegulatoryParagraph } from './entities/regulatory-paragraph.entity';

@Injectable()
export class RegulatorySyncService {
  constructor(
    @InjectRepository(RegulatorySection) private sectionRepo: Repository<RegulatorySection>,
    @InjectRepository(RegulatoryPart) private partRepo: Repository<RegulatoryPart>,
    @InjectRepository(RegulatoryAgency) private agencyRepo: Repository<RegulatoryAgency>,
    @InjectRepository(RegulatorySubpart) private subpartRepo: Repository<RegulatorySubpart>,
    @InjectRepository(RegulatoryParagraph) private paragraphRepo: Repository<RegulatoryParagraph>,
  ) {}

  async syncRegulatoryPart(opts: { agencyCode: string; agencyName: string; titleNumber: string; part: string; bulkXmlUrl: string }) {
    const response = await axios.get(opts.bulkXmlUrl);
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(response.data);
    
    const findPart = (node: any): any => {
      if (node.TYPE === 'PART' && node.N === opts.part) return node;
      for (const key in node) {
        if (typeof node[key] === 'object') {
          const found = findPart(node[key]);
          if (found) return found;
        }
      }
      return null;
    };

    const partNode = findPart(result);
    if (!partNode) return { sectionsUpserted: 0, paragraphsUpserted: 0 };

    const pack = opts.agencyCode === 'OSHA' ? (opts.part === '1904' ? 'OSHA Recordkeeping' : opts.part === '1910' ? 'OSHA General Industry' : 'OSHA Construction') : 'MSHA Mining';
    
    await this.agencyRepo.upsert({ code: opts.agencyCode, name: opts.agencyName, titleNumber: opts.titleNumber }, ['code']);
    await this.partRepo.upsert({ agencyCode: opts.agencyCode, titleNumber: opts.titleNumber, part: opts.part, heading: partNode.HEAD || 'Part ' + opts.part, customerPack: pack }, ['agencyCode', 'titleNumber', 'part']);

    let sectionsUpserted = 0, paragraphsUpserted = 0;
    const traverse = async (node: any) => {
        if (node.TYPE === 'SECTION') {
            let sectionNo = node.N?.replace('§ ', '') || '0';
            // 🔷 FIX: Prevent double part numbering (e.g. 56.56.1 -> 56.1)
            if (sectionNo.startsWith(opts.part + '.' + opts.part)) {
                sectionNo = sectionNo.substring(opts.part.length + 1);
            }
            const citation = `${opts.titleNumber} CFR ${sectionNo}`;
            
            await this.sectionRepo.upsert({
                agencyCode: opts.agencyCode, titleNumber: opts.titleNumber, part: opts.part, 
                section: sectionNo, citation, heading: node.HEAD, textPlain: Array.isArray(node.P) ? node.P.join(' ') : (node.P || '')
            }, ['citation']);
            sectionsUpserted++;
        } else if (typeof node === 'object') {
            for (const key in node) await traverse(node[key]);
        }
    };
    await traverse(partNode);
    return { sectionsUpserted, paragraphsUpserted };
  }

  async syncPart46() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '46', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart47() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '47', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart48() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '48', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart50() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '50', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart56() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '56', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart57() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '57', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart62() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '62', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncPart77() { return this.syncRegulatoryPart({ agencyCode: 'MSHA', agencyName: 'MSHA', titleNumber: '30', part: '77', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml' }); }
  async syncOsha1904() { return this.syncRegulatoryPart({ agencyCode: 'OSHA', agencyName: 'OSHA', titleNumber: '29', part: '1904', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml' }); }
  async syncOsha1910() { return this.syncRegulatoryPart({ agencyCode: 'OSHA', agencyName: 'OSHA', titleNumber: '29', part: '1910', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml' }); }
  async syncOsha1926() { return this.syncRegulatoryPart({ agencyCode: 'OSHA', agencyName: 'OSHA', titleNumber: '29', part: '1926', bulkXmlUrl: 'https://www.govinfo.gov/bulkdata/ECFR/title-29/ECFR-title29.xml' }); }
}
