import 'reflect-metadata';
import axios from 'axios';
import * as xml2js from 'xml2js';

async function inspect() {
  const url = 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml';
  const response = await axios.get(url);
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const result = await parser.parseStringPromise(response.data);

  const findSection = (node: any): any => {
    if (node.TYPE === 'SECTION' && node.HEAD?.includes('56.14107')) return node;
    for (const key in node) {
      if (typeof node[key] === 'object') {
        const found = findSection(node[key]);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSection(result);
  console.log('Section Node Content:', JSON.stringify(section, null, 2));
}

inspect();
