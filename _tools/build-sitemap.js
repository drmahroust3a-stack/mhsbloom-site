// Canonical sitemap.xml + llms.txt Products section — built by SCANNING what actually exists.
// Run LAST after any generator (some generators rewrite sitemap/llms with partial views).
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SITE = "https://mhsbloom.com";

function dirSlugs(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readdirSync(p).filter((d) => fs.existsSync(path.join(p, d, "index.html"))) : [];
}
const urls = [`${SITE}/`, `${SITE}/ar/`, `${SITE}/ingredients/`, `${SITE}/ar/ingredients/`, `${SITE}/answers/`, `${SITE}/ar/answers/`, `${SITE}/stats/`, `${SITE}/ar/stats/`, `${SITE}/products/`, `${SITE}/ar/products/`, `${SITE}/ingredient-checker/`, `${SITE}/ar/ingredient-checker/`, `${SITE}/data/`, `${SITE}/ar/data/`, `${SITE}/mcp/`];
for (const s of dirSlugs("ingredients")) urls.push(`${SITE}/ingredients/${s}/`);
for (const s of dirSlugs("ar/ingredients")) urls.push(`${SITE}/ar/ingredients/${s}/`);
for (const s of dirSlugs("answers")) urls.push(`${SITE}/answers/${s}/`);
for (const s of dirSlugs("ar/answers")) urls.push(`${SITE}/ar/answers/${s}/`);
for (const s of dirSlugs("products")) urls.push(`${SITE}/products/${s}/`);
for (const s of dirSlugs("ar/products")) urls.push(`${SITE}/ar/products/${s}/`);
const uniq = [...new Set(urls)];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${uniq.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`, "utf8");

// ensure llms.txt has the Products section
const nProducts = dirSlugs("products").length;
let llms = fs.readFileSync(path.join(ROOT, "llms.txt"), "utf8");
const prodBlock = `## Products\n\n- [Products, decoded](${SITE}/products/): ${nProducts} skincare products decoded (brand, key ingredients, who it suits).\n`;
if (/## Products\n[\s\S]*?(?=\n## |$)/.test(llms)) llms = llms.replace(/## Products\n[\s\S]*?(?=\n## |$)/, prodBlock + "\n");
else llms = llms.replace(/## About/, prodBlock + "\n## About");
fs.writeFileSync(path.join(ROOT, "llms.txt"), llms, "utf8");
console.log(`sitemap: ${uniq.length} urls | llms products: ${nProducts}`);
