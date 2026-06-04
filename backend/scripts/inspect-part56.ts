import 'reflect-metadata';
import axios from 'axios';
import * as xml2js from 'xml2js';

async function inspect() {
  const url = 'https://www.govinfo.gov/bulkdata/ECFR/title-30/ECFR-title30.xml';
  const response = await axios.get(url);
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const result = await parser.parseStringPromise(response.data);

  const findPart56 = (node: any, path: string = 'ROOT'): any => {
    if (node.TYPE === 'PART' && node.HEAD?.includes('PART 56')) return { node, path };
    for (const key in node) {
      if (typeof node[key] === 'object') {
        const found = findPart56(node[key], path + ' -> ' + key);
        if (found) return found;
      }
    }
    return null;
  };

  const { node: part56, path } = findPart56(result);
  console.log('Part 56 found at path:', path);
  console.log('Node Tag/Type:', part56.TYPE);
  console.log('Node Attributes:', Object.keys(part56));
  
  // Look for 56.14107
  const findSection = (node: any, target: string, path: string = ''): any => {
    if (node.TYPE === 'SECTION' && node.HEAD?.includes(target)) return { node, path };
    for (const key in node) {
      if (typeof node[key] === 'object') {
        const found = findSection(node[key], target, path + ' -> ' + key);
        if (found) return found;
      }
    }
    return null;
  };

  const section = findSection(part56, '56.14107');
  if (section) {
    console.log('Section 56.14107 found at path:', section.path);
    console.log('Section Node Keys:', Object.keys(section.node));
  } else {
    console.log('Section 56.14107 NOT found');
  }
}

inspect();
