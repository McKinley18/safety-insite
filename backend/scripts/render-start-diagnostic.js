const fs = require("fs");
const path = require("path");

function exists(file) {
  return fs.existsSync(path.join(process.cwd(), file));
}

function mask(value) {
  if (!value) return "MISSING";
  return `SET(length=${String(value).length})`;
}

console.log("\n--- RENDER START DIAGNOSTIC ---");
console.log("cwd:", process.cwd());
console.log("NODE_ENV:", process.env.NODE_ENV || "MISSING");
console.log("PORT:", process.env.PORT || "MISSING");
console.log("package.json exists:", exists("package.json"));
console.log("dist/main.js exists:", exists("dist/main.js"));
console.log("src/main.ts exists:", exists("src/main.ts"));
console.log("DATABASE_URL:", mask(process.env.DATABASE_URL));
console.log("JWT_SECRET:", mask(process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET));
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "MISSING");
console.log("DEV_AUTH_BYPASS:", process.env.DEV_AUTH_BYPASS || "MISSING");
console.log("NEXT_PUBLIC_DISABLE_AUTH:", process.env.NEXT_PUBLIC_DISABLE_AUTH || "MISSING");

if (!exists("package.json")) {
  console.error("FATAL: package.json missing. Render Root Directory is probably wrong. It should be backend.");
  process.exit(1);
}

if (!exists("dist/main.js")) {
  console.error("FATAL: dist/main.js missing. Build did not output backend/dist/main.js.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && process.env.DEV_AUTH_BYPASS === "true") {
  console.error("FATAL: DEV_AUTH_BYPASS cannot be true in production.");
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
if (process.env.NODE_ENV === "production" && (!jwtSecret || jwtSecret.length < 32)) {
  console.error("FATAL: production JWT_SECRET/JWT_ACCESS_SECRET missing or shorter than 32 characters.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
  console.error("FATAL: production DATABASE_URL missing.");
  process.exit(1);
}

console.log("--- RENDER START DIAGNOSTIC PASSED ---\n");
