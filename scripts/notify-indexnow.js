import makesData from '../src/data/uk_makes_models.json' with { type: 'json' };
import citiesData from '../src/data/uk_cities.json' with { type: 'json' };

const HOST = 'checkmotpro.co.uk';
const KEY = 'c491fade6de847b39a3bfce7e3e018d9';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const urlList = [
  `https://${HOST}/`,
  `https://${HOST}/car-tax-check/`,
  `https://${HOST}/mileage-rollback-check/`,
  `https://${HOST}/mot-pass-rates/`,
  `https://${HOST}/mot-centres/`,
  `https://${HOST}/privacy-policy/`,
  `https://${HOST}/terms/`,
  `https://${HOST}/cookie-policy/`
];

// Add all makes & models
for (const make of makesData) {
  urlList.push(`https://${HOST}/mot-pass-rates/${make.slug}/`);
  for (const model of make.models) {
    urlList.push(`https://${HOST}/mot-pass-rates/${make.slug}/${model.slug}/`);
  }
}

// Add top cities
for (const city of citiesData) {
  urlList.push(`https://${HOST}/mot-centres/${city.slug}/`);
}

console.log(`📡 Preparing IndexNow notification for ${urlList.length} URLs...`);

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: urlList
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
}

submit();
