const fs = require('fs');
const content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

const newCats = [
  "Access / Walking Surfaces",
  "Machine Guarding",
  "Electrical",
  "Lockout / Energy",
  "Mobile Equipment / Traffic",
  "Fire / Hot Work",
  "Housekeeping",
  "Fall Protection",
  "PPE",
  "Health: Dust / Noise / Respiratory",
  "Materials / Storage / Cylinders",
  "Emergency / First Aid",
  "Training / Reporting",
  "Other / Not Sure"
];

const newContent = content.replace(/const hazardCategories = \[[\s\S]*?\];/m, 'const hazardCategories = ' + JSON.stringify(newCats, null, 2) + ';');
fs.writeFileSync('frontend/app/tabs/camera.tsx', newContent);
