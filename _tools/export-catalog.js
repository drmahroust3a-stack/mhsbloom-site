// Export the FREE-tier catalog (brands + products) from Firestore to local JSON.
// Auth: signs in with the review demo account via the Firebase Auth REST API.
// The web API key is read locally from the app's google-services.json and never logged.
// Output: _data/catalog-export.json (gitignored — raw data never committed to the public repo).
const fs = require("fs");
const path = require("path");
const https = require("https");

const GS_PATH = "C:/Users/drmah/MHS-BLOOM-old/google-services.json";
const OUT_DIR = path.join(__dirname, "..", "_data");
const OUT = path.join(OUT_DIR, "catalog-export.json");
// Credentials come from the environment — NEVER hardcode them (a hardcoded secret
// in a public repo is a leak). Set before running:
//   BLOOM_EXPORT_EMAIL=... BLOOM_EXPORT_PW=... node _tools/export-catalog.js
const EMAIL = process.env.BLOOM_EXPORT_EMAIL;
const PASSWORD = process.env.BLOOM_EXPORT_PW;
const PROJECT = "mhs-bloom";
if (!EMAIL || !PASSWORD) {
  console.error("Set BLOOM_EXPORT_EMAIL and BLOOM_EXPORT_PW in the environment first.");
  process.exit(1);
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => (res.statusCode < 300 ? resolve(JSON.parse(d)) : reject(new Error(`HTTP ${res.statusCode}: ${d.slice(0, 300)}`))));
    });
    req.on("error", reject);
    req.end(JSON.stringify(body));
  });
}
function get(url, token) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => (res.statusCode < 300 ? resolve(JSON.parse(d)) : reject(new Error(`HTTP ${res.statusCode}: ${d.slice(0, 300)}`))));
    }).on("error", reject);
  });
}

// Firestore REST value decoder -> plain JS
function dec(v) {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.nullValue !== undefined) return null;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.arrayValue !== undefined) return (v.arrayValue.values || []).map(dec);
  if (v.mapValue !== undefined) return decFields(v.mapValue.fields || {});
  return null;
}
function decFields(fields) {
  const o = {};
  for (const [k, v] of Object.entries(fields)) o[k] = dec(v);
  return o;
}

(async () => {
  const gs = JSON.parse(fs.readFileSync(GS_PATH, "utf8"));
  const apiKey = gs.client[0].api_key[0] ? gs.client[0].api_key[0].current_key : gs.client[0].api_key.current_key;

  const auth = await post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    { email: EMAIL, password: PASSWORD, returnSecureToken: true }
  );
  console.log("signed in as", auth.email);

  const brands = [];
  let pageToken = "";
  do {
    const url =
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/catalog?pageSize=100` +
      (pageToken ? `&pageToken=${pageToken}` : "");
    const page = await get(url, auth.idToken);
    for (const doc of page.documents || []) {
      const b = decFields(doc.fields || {});
      b._brandId = doc.name.split("/").pop();
      brands.push(b);
    }
    pageToken = page.nextPageToken || "";
  } while (pageToken);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(brands, null, 1), "utf8");

  const active = brands.filter((b) => b.isActive !== false);
  const products = active.flatMap((b) => (Array.isArray(b.products) ? b.products : []));
  const withIngredients = products.filter((p) => Array.isArray(p.ingredients) && p.ingredients.length > 0);
  console.log(`brands: ${brands.length} (active ${active.length})`);
  console.log(`products: ${products.length} (with ingredient lists: ${withIngredients.length})`);
  if (products[0]) console.log("sample product keys:", Object.keys(products[0]).join(", "));
})().catch((e) => {
  console.error("EXPORT FAILED:", e.message);
  process.exit(1);
});
