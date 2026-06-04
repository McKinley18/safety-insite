const fs = require('fs');
const content = fs.readFileSync('frontend/app/tabs/camera.tsx', 'utf8');

const newCats = [
  "Access / Ladders / Platforms",
  "Guarding / Conveyors / Moving Parts",
  "Electrical / Power / Cords",
  "Lockout / Energy Isolation",
  "Mobile Equipment / Traffic",
  "Berms / Roads / Dump Points",
  "Fire / Hot Work / Fuel",
  "Housekeeping / Slips / Trips",
  "Fall Protection / Elevated Work",
  "PPE / Eye / Face / Foot / Hand",
  "Dust / Respiratory / Silica",
  "Noise / Hearing Conservation",
  "Compressed Gas / Cylinders",
  "Material Handling / Storage",
  "Confined Space / Ventilation",
  "Emergency / First Aid / Exits",
  "Training / Workplace Exams",
  "Recordkeeping / Reporting",
  "Other / Not Sure"
];

const newContent = content.replace(/const hazardCategories = \[[\s\S]*?\];/m, 'const hazardCategories = ' + JSON.stringify(newCats, null, 2) + ';');
fs.writeFileSync('frontend/app/tabs/camera.tsx', newContent);
