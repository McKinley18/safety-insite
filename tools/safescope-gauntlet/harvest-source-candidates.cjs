const https = require("https");
const http = require("http");
const fs = require("fs");

const seedPath = "Sentinel_Safety/SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json";
if (!fs.existsSync(seedPath)) {
    console.log("No seed file found. Please create SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json.");
    process.exit(0);
}

const seeds = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const candidates = [];
const audit = [];

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith("https") ? https : http;
        client.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return resolve(fetchUrl(res.headers.location));
            }
            if (res.statusCode !== 200) return resolve({ status: res.statusCode });
            
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve({ status: res.statusCode, data }));
        }).on("error", reject);
    });
}

async function run() {
    for (const seed of seeds) {
        const result = await fetchUrl(seed.url);
        if (result.status !== 200) {
            audit.push({ url: seed.url, status: result.status, reason: "Non-200" });
            continue;
        }

        const text = result.data.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        if (text.length < 500) {
            audit.push({ url: seed.url, status: 200, reason: "Too little text" });
            continue;
        }

        candidates.push({
            candidateId: "CAND-TEMP-" + Date.now(),
            sourceAgency: seed.agency,
            sourceUrl: seed.url,
            verificationEvidence: text.substring(0, 500),
            httpStatus: 200,
            verificationStatus: "pending"
        });
    }
    fs.writeFileSync("Sentinel_Safety/SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES.json", JSON.stringify(candidates, null, 2));
    fs.writeFileSync("Sentinel_Safety/SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES_AUDIT.md", JSON.stringify(audit, null, 2));
    console.log("Harvest complete.");
}

run();
