const fs = require('fs');
let content = fs.readFileSync('backend/src/standards/seeds/standards.seed.ts', 'utf8');

// Regex to find OSHA blocks and add missing fields if they don't exist
const oshaRegex = /\{\s*source: ['"]OSHA['"],\s*citation: ['"](?<citation>.*?)['"],\s*heading: ['"](?<heading>.*?)['"],\s*keywords: \[(?<keywords>.*?)\]\s*\}/g;

const fixedContent = content.replace(oshaRegex, (match, citation, heading, keywords) => {
    const part = citation.includes('1910') ? '1910' : (citation.includes('1926') ? '1926' : '1904');
    return `{ 
        source: 'OSHA', 
        titleNumber: '29', 
        part: '${part}', 
        section: '${citation.split('.')[1]}', 
        citation: '${citation}', 
        heading: '${heading}', 
        standardText: 'Standard text.', 
        keywords: [${keywords}] 
    }`;
});

fs.writeFileSync('backend/src/standards/seeds/standards.seed.ts', fixedContent);
