// MHS BLOOM — daily batch publisher.
// Moves the next brand-batch of staged product pages into the repo, regenerates
// the products index (EN/AR) + sitemap.xml + llms.txt from what is actually
// published, commits, pushes, verifies live, and advances the state.
// Deterministic + idempotent: safe to run once per day by the scheduled task.
//   node _tools/push-next-batch.js          -> publish next batch
//   node _tools/push-next-batch.js --status -> just print where we are
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
const sh = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "pipe" }).toString();

const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "batch-plan.json"), "utf8"));
const statePath = path.join(ROOT, "_data", "batch-state.json");
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "product-meta.json"), "utf8"));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

if (process.argv.includes("--status")) {
  console.log(`batches done: ${state.next}/${plan.length}; published brands: ${state.published.length}`);
  process.exit(0);
}
if (state.next >= plan.length) { console.log("ALL BATCHES DONE — nothing to publish."); process.exit(0); }

const batchBrands = plan[state.next];
const batchProducts = meta.filter((m) => batchBrands.includes(m.brand));
console.log(`Publishing batch ${state.next + 1}/${plan.length}: ${batchBrands.length} brands, ${batchProducts.length} products`);

// 1) move staged pages into the repo
let moved = 0;
for (const m of batchProducts) {
  for (const rel of [`products/${m.slug}`, `ar/products/${m.slug}`]) {
    const src = path.join(ROOT, "_staged", rel);
    const dst = path.join(ROOT, rel);
    if (!fs.existsSync(src)) { if (fs.existsSync(dst)) continue; throw new Error("staged page missing: " + rel); }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true });
    fs.renameSync(src, dst);
    moved++;
  }
}
console.log(`moved ${moved} page dirs from staging`);

// 2) determine ALL published products (scan dirs, map via meta)
const bySlug = {}; meta.forEach((m) => (bySlug[m.slug] = m));
const publishedSlugs = fs.existsSync(path.join(ROOT, "products"))
  ? fs.readdirSync(path.join(ROOT, "products")).filter((d) => bySlug[d] && fs.existsSync(path.join(ROOT, "products", d, "index.html")))
  : [];
const published = publishedSlugs.map((s) => bySlug[s]);
console.log(`total published products now: ${published.length}`);

// 3) regenerate products index (EN/AR), grouped by brand
const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--gold:#B99256;--line:#EADFD8;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.75;font-size:15.5px;}
.wrap{max-width:820px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:20px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}
h1{font-size:26px;color:var(--rose-deep);margin-bottom:6px;}
.sub{color:var(--muted);font-size:14.5px;margin-bottom:22px;}
h2{font-size:17px;color:var(--rose-deep);margin:24px 0 8px;}
h2 sup{font-size:.6em;color:var(--muted);}
.pl a{display:block;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:9px 14px;margin-bottom:7px;text-decoration:none;color:var(--ink);font-size:14px;}
.pl a:hover{border-color:var(--rose);color:var(--rose-deep);}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:30px;}footer a{color:var(--muted);}
`;
function productsIndex(lang) {
  const en = lang === "en";
  const canonical = en ? `${SITE}/products/` : `${SITE}/ar/products/`;
  const altHref = en ? `${SITE}/ar/products/` : `${SITE}/products/`;
  const L = en
    ? { t: "Products, decoded", s: `${published.length} skincare products decoded so far — key ingredients, who they suit, and what BLOOM's verdict covers. More added regularly.`, lang: "العربية" }
    : { t: "المنتجات، مفكوكة", s: `${published.length} منتج عناية بالبشرة مفكوك حتى الآن — المكونات الرئيسية ولمين مناسب. وبنضيف باستمرار.`, lang: "English" };
  const groups = {};
  for (const p of published) (groups[p.brand] = groups[p.brand] || []).push(p);
  const brandsSorted = Object.keys(groups).sort();
  let body = "";
  for (const b of brandsSorted) {
    const items = groups[b].sort((a, c) => a.name.localeCompare(c.name))
      .map((p) => `<a href="${en ? SITE + "/products/" + p.slug + "/" : SITE + "/ar/products/" + p.slug + "/"}">${esc(p.name)}</a>`).join("\n");
    body += `<h2>${esc(en ? b : (groups[b][0].brandAr || b))}<sup>®</sup></h2><div class="pl">${items}</div>`;
  }
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", inLanguage: lang, name: L.t, url: canonical, isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE } };
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${en ? "ltr" : "rtl"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.t)} | MHS BLOOM</title><meta name="description" content="${esc(L.s)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script></head>
<body><div class="wrap">
<div class="top"><a class="brand" href="${en ? SITE : SITE + "/ar/"}">MHS <span>BLOOM</span></a><a class="langlink" href="${altHref}">${L.lang}</a></div>
<h1>${esc(L.t)}</h1><div class="sub">${esc(L.s)}</div>
${body}
<footer>© 2026 MH-SYNAPTIX · <a href="${SITE}/">mhsbloom.com</a> · <a href="mailto:contact@mhsbloom.com">contact@mhsbloom.com</a></footer>
</div></body></html>`;
}
fs.mkdirSync(path.join(ROOT, "products"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "ar", "products"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "products", "index.html"), productsIndex("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "products", "index.html"), productsIndex("ar"), "utf8");

// 4) regenerate sitemap.xml by scanning what actually exists
function dirSlugs(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((d) => fs.existsSync(path.join(p, d, "index.html"))) : [];
}
const urls = [`${SITE}/`, `${SITE}/ar/`, `${SITE}/ingredients/`, `${SITE}/ar/ingredients/`, `${SITE}/answers/`, `${SITE}/ar/answers/`, `${SITE}/stats/`, `${SITE}/ar/stats/`, `${SITE}/products/`, `${SITE}/ar/products/`];
for (const s of dirSlugs("ingredients")) if (s !== "index.html") urls.push(`${SITE}/ingredients/${s}/`);
for (const s of dirSlugs("ar/ingredients")) urls.push(`${SITE}/ar/ingredients/${s}/`);
for (const s of dirSlugs("answers")) urls.push(`${SITE}/answers/${s}/`);
for (const s of dirSlugs("ar/answers")) urls.push(`${SITE}/ar/answers/${s}/`);
for (const s of publishedSlugs) { urls.push(`${SITE}/products/${s}/`); urls.push(`${SITE}/ar/products/${s}/`); }
const uniq = [...new Set(urls)];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniq.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`, "utf8");

// 5) refresh llms.txt Products section (keep existing content, replace/add the Products block)
let llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
const prodBlock = `## Products\n\n- [Products, decoded](${SITE}/products/): ${published.length} skincare products decoded (brand, key ingredients, who it suits) — growing daily.\n`;
if (/## Products\n[\s\S]*?(?=\n## |$)/.test(llms)) llms = llms.replace(/## Products\n[\s\S]*?(?=\n## |$)/, prodBlock);
else llms = llms.replace(/## About/, prodBlock + "\n## About");
fs.writeFileSync(path.join(ROOT, "llms.txt"), llms, "utf8");

// 6) commit + push (specific paths only)
sh(`git add products ar/products sitemap.xml llms.txt`);
sh(`git commit -m "publish product batch ${state.next + 1}/${plan.length}: ${batchBrands.join(", ")} (${batchProducts.length} products, EN+AR)"`);
sh(`git push`);
console.log("pushed.");

// 7) verify live (poll one sample URL up to ~2.5 min)
const sample = `${SITE}/products/${batchProducts[0].slug}/`;
let live = false;
for (let i = 0; i < 8; i++) {
  try {
    const code = sh(`curl -s --max-time 15 -o nul -w "%{http_code}" "${sample}"`).trim();
    console.log(`verify ${i + 1}: ${sample} -> ${code}`);
    if (code === "200") { live = true; break; }
  } catch (e) { console.log(`verify ${i + 1}: curl error`); }
  execSync(process.platform === "win32" ? "ping -n 21 127.0.0.1 > nul" : "sleep 20");
}

// 8) advance state
state.next += 1;
state.published.push(...batchBrands);
state.lastRun = new Date().toISOString();
state.lastVerified = live;
fs.writeFileSync(statePath, JSON.stringify(state, null, 1), "utf8");
console.log(`DONE: batch ${state.next}/${plan.length} published${live ? " and VERIFIED LIVE" : " (verify pending — check later)"}. Remaining: ${plan.length - state.next}`);
