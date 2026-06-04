import 'reflect-metadata';
import axios from 'axios';
import * as xml2js from 'xml2js';

async function inspect(partNo: string) {
  const url = 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml';
  const response = await axios.get(url);
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const result = await parser.parseStringPromise(response.data);
  
  const findPart = (node: any): any => {
    if (node.TYPE === 'PART' && node.HEAD?.includes(`PART ${partNo}`)) return node;
    for (const key in node) {
      if (typeof node[key] === 'object') {
        const found = findPart(node[key]);
        if (found) return found;
      }
    }
    return null;
  };

  const part = findPart(result);
  console.log(`Part ${partNo} node structure:`, JSON.stringify(part, null, 2).substring(0, 1000));
}

inspect('46');
inspect('62');
