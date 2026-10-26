import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import makesData from '../src/data/uk_makes_models.json' with { type: 'json' };
import citiesData from '../src/data/uk_cities.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_FILE = path.resolve(__dirname, '../.indexnow-submitted.json');

const HOST = 'checkmotpro.co.uk';
const KEY = 'c491fade6de847b39a3bfce7e3e018d9';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// Max age before re-pinging an existing URL (7 days)
const RECHECK_DAYS = 7;
const RECHECK_MS = RECHECK_DAYS * 24 * 60 * 60 * 1000;

const args = process.argv.slice(2);
const isForce = args.includes('--force');
const vrmArg = args.find(a => a.startsWith('--vrm='));

// Load cache
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch (e) {
    cache = {};
  }
}

// Core evergreen URLs always included in routine updates
const CORE_URLS = new Set([
  `https://${HOST}/`,
  `https://${HOST}/number-plate-check/`,
  `https://${HOST}/car-tax-check/`,
  `https://${HOST}/sorn-check/`,
  `https://${HOST}/mileage-rollback-check/`
]);

let targetUrls = [];

if (vrmArg) {
  // Single VRM on-demand submission
  const vrm = vrmArg.split('=')[1].trim().toLowerCase();
  targetUrls = [`https://${HOST}/check/${vrm}/`];
  console.log(`🎯 On-demand IndexNow request for VRM: ${vrm.toUpperCase()}`);
} else {
  // Build full candidate list
  const allCandidates = [
    ...CORE_URLS,
    `https://${HOST}/mot-pass-rates/`,
    `https://${HOST}/mot-centres/`,
    `https://${HOST}/privacy-policy/`,
    `https://${HOST}/terms/`,
    `https://${HOST}/cookie-policy/`
  ];

  for (const make of makesData) {
    allCandidates.push(`https://${HOST}/mot-pass-rates/${make.slug}/`);
    for (const model of make.models) {
      allCandidates.push(`https://${HOST}/mot-pass-rates/${make.slug}/${model.slug}/`);
      if (model.samplePlates) {
        for (const plate of model.samplePlates) {
          allCandidates.push(`https://${HOST}/check/${plate.toLowerCase()}/`);
        }
      }
    }
  }

  for (const city of citiesData) {
    allCandidates.push(`https://${HOST}/mot-centres/${city.slug}/`);
  }

  const now = Date.now();
  targetUrls = allCandidates.filter(url => {
    if (isForce) return true;
    if (CORE_URLS.has(url)) return true; // Always ping core pages
    const lastSent = cache[url] ? new Date(cache[url]).getTime() : 0;
    return now - lastSent > RECHECK_MS; // Only new or expired URLs
  });

  console.log(
    `📡 IndexNow Analysis: ${allCandidates.length} total URLs in catalogue. ` +
    `${Object.keys(cache).length} in history cache. ` +
    `Selected ${targetUrls.length} URLs for submission ` +
    `(${CORE_URLS.size} core + ${targetUrls.length - CORE_URLS.size} new/due).`
  );
}

if (targetUrls.length === 0) {
  console.log('✅ All non-core URLs are fresh in cache. No submission needed.');
  process.exit(0);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: targetUrls
};

const endpoints = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow'
];

async function submit() {
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      console.log(`[IndexNow] ${endpoint} -> Status: ${res.status} (${res.statusText})`);
    } catch (err) {
      console.error(`[IndexNow Error] ${endpoint}:`, err.message);
    }
  }

  // Update submission timestamps in cache
  const timestamp = new Date().toISOString();
  targetUrls.forEach(url => {
    cache[url] = timestamp;
  });

  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    console.log(`💾 Updated submission cache: ${Object.keys(cache).length} URLs tracked.`);
  } catch (err) {
    console.error('Failed to write IndexNow cache:', err.message);
  }
}

submit();
