import 'reflect-metadata';
import axios from 'axios';

async function test() {
  const scenarios = [
    { desc: "missing extinguisher inspection tag", cat: "Fire / Hot Work / Fuel" },
    { desc: "ladder rung broken", cat: "Safe access" },
    { desc: "no lockout clearing crusher jam", cat: "Lockout / Energy Isolation" },
    { desc: "crusher dust cloud", cat: "Respiratory" },
    { desc: "too loud near screen plant", cat: "Noise" }
  ];

  for (const s of scenarios) {
    const res = await axios.post('http://localhost:3000/applicable-standards/suggest', {
        description: s.desc, hazardCategory: s.cat, source: 'MSHA', limit: 5
    });
    console.log('Input:', s.desc, 'Matches:', res.data.matches.length);
    if (res.data.matches.length > 0) console.log('Top:', res.data.matches[0].citation);
  }
}
// Start backend in background to test
const { exec } = require('child_process');
const server = exec('cd backend && npm run start');
setTimeout(async () => { await test(); server.kill(); }, 15000);
