// Rebuild the /products/ index pages (EN+AR) with LIVE SEARCH + brand navigation.
// Data: _data/product-meta.json (all published products).
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const SITE = "https://mhsbloom.com";
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "product-meta.json"), "utf8"));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATL = { "baby-care": ["Baby care", "عناية بالأطفال"], balm: ["Balm", "بلسم"], "blemish-care": ["Blemish care", "عناية بالحبوب"], "body-care": ["Body care", "عناية بالجسم"], cleanser: ["Cleanser", "غسول"], exfoliant: ["Exfoliant", "مقشّر"], "eye-care": ["Eye care", "عناية بالعين"], fragrance: ["Fragrance", "عطر"], "hair-care": ["Hair care", "عناية بالشعر"], "hand-care": ["Hand care", "عناية باليدين"], "lip-care": ["Lip care", "عناية بالشفاه"], "micellar-cleanser": ["Micellar water", "ماء ميسيلار"], moisturizer: ["Moisturizer", "مرطّب"], "moisturizer-spf": ["Moisturizer SPF", "مرطّب بحماية"], serum: ["Serum", "سيروم"], sunscreen: ["Sunscreen", "واقي شمس"], toner: ["Toner", "تونر"] };
const cat = (k, lang) => (CATL[k] ? CATL[k][lang === "en" ? 0 : 1] : k);

const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--rose-soft:#F3E2E4;--gold:#B99256;--line:#EADFD8;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.7;font-size:15.5px;}
.wrap{max-width:860px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:18px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}
h1{font-size:26px;color:var(--rose-deep);margin-bottom:4px;}
.sub{color:var(--muted);font-size:14px;margin-bottom:16px;}
.searchbox{position:sticky;top:0;background:var(--cream);padding:10px 0 12px;z-index:5;}
#q{width:100%;padding:14px 20px;border:2px solid var(--line);border-radius:16px;font-family:inherit;font-size:16px;background:var(--card);outline:none;}
#q:focus{border-color:var(--rose);}
.count{font-size:12.5px;color:var(--muted);margin-top:6px;}
.brandnav{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 18px;}
.brandnav a{font-size:12.5px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;text-decoration:none;color:var(--rose-deep);}
.brandnav a:hover{border-color:var(--rose);}
h2.bh{font-size:18px;color:var(--rose-deep);margin:26px 0 10px;scroll-margin-top:90px;}
h2.bh sup{font-size:.6em;color:var(--muted);}
.pl a{display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:11px 16px;margin-bottom:8px;text-decoration:none;color:var(--ink);}
.pl a:hover{border-color:var(--rose);}
.pl .nm{font-weight:600;font-size:14.5px;}
.pl .ct{flex-shrink:0;font-size:11.5px;color:var(--rose-deep);background:var(--rose-soft);border-radius:999px;padding:3px 11px;}
.hidden{display:none!important;}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:30px;}footer a{color:var(--muted);}
`;

function build(lang) {
  const en = lang === "en";
  const canonical = en ? `${SITE}/products/` : `${SITE}/ar/products/`;
  const altHref = en ? `${SITE}/ar/products/` : `${SITE}/products/`;
  const L = en
    ? { t: "Products, decoded", s: `${meta.length.toLocaleString()} skincare products decoded — search by product, brand or ingredient.`, ph: "Search 1,682 products… (e.g. CeraVe, niacinamide, sunscreen)", cnt: "products shown", lang: "العربية", none: "No products match — try another word." }
    : { t: "المنتجات، مفكوكة", s: `${meta.length.toLocaleString()} منتج عناية بالبشرة مفكوك — دوّري بالمنتج أو البراند أو المكوّن.`, ph: "دوّري في ١٦٨٢ منتج… (مثلاً: CeraVe أو نياسيناميد)", cnt: "منتج ظاهر", lang: "English", none: "مفيش منتجات مطابقة — جرّبي كلمة تانية." };

  const groups = {};
  for (const p of meta) (groups[p.brand] = groups[p.brand] || []).push(p);
  const brands = Object.keys(groups).sort();
  const anchor = (b) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const nav = brands.map((b) => `<a href="#${anchor(b)}">${esc(b)} (${groups[b].length})</a>`).join("");
  let body = "";
  for (const b of brands) {
    const rows = groups[b].sort((a, c) => a.name.localeCompare(c.name)).map((p) =>
      `<a href="${en ? SITE + "/products/" + p.slug + "/" : SITE + "/ar/products/" + p.slug + "/"}" data-s="${esc((p.brand + " " + p.name + " " + p.category).toLowerCase())}"><span class="nm">${esc(p.name)}</span><span class="ct">${esc(cat(p.category, lang))}</span></a>`
    ).join("\n");
    body += `<h2 class="bh" id="${anchor(b)}" data-brand>${esc(en ? b : (groups[b][0].brandAr || b))}<sup>®</sup></h2><div class="pl">${rows}</div>`;
  }

  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", inLanguage: lang, name: L.t, url: canonical, isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE } };

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${en ? "ltr" : "rtl"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.t)} | MHS BLOOM</title><meta name="description" content="${esc(L.s)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${en ? canonical : altHref}">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script></head>
<body><div class="wrap">
<div class="top"><a class="brand" href="${en ? SITE : SITE + "/ar/"}">MHS <span>BLOOM</span></a><a class="langlink" href="${altHref}">${L.lang}</a></div>
<h1>${esc(L.t)}</h1><div class="sub">${esc(L.s)}</div>
<div class="searchbox"><input id="q" type="search" placeholder="${esc(L.ph)}" autocomplete="off"><div class="count"><span id="n">${meta.length.toLocaleString()}</span> ${L.cnt}</div></div>
<div class="brandnav" id="bnav">${nav}</div>
<div id="list">${body}</div>
<p id="none" class="hidden" style="color:var(--muted);text-align:center;padding:30px 0;">${esc(L.none)}</p>
<footer>© 2026 MH-SYNAPTIX · <a href="${SITE}/">mhsbloom.com</a> · <a href="mailto:contact@mhsbloom.com">contact@mhsbloom.com</a></footer>
</div>
<script>
(function(){
  var q=document.getElementById('q'), rows=[].slice.call(document.querySelectorAll('.pl a')), heads=[].slice.call(document.querySelectorAll('[data-brand]')), n=document.getElementById('n'), none=document.getElementById('none'), bnav=document.getElementById('bnav');
  function norm(s){return (s||'').toLowerCase();}
  q.addEventListener('input', function(){
    var v=norm(q.value).trim(), shown=0;
    rows.forEach(function(r){ var hit=!v||r.getAttribute('data-s').indexOf(v)>-1; r.classList.toggle('hidden',!hit); if(hit)shown++; });
    heads.forEach(function(h){ var pl=h.nextElementSibling; var any=pl && [].slice.call(pl.children).some(function(c){return !c.classList.contains('hidden');}); h.classList.toggle('hidden',!any); });
    n.textContent=shown.toLocaleString();
    none.classList.toggle('hidden',shown!==0);
    bnav.classList.toggle('hidden',!!v);
  });
})();
</script>
</body></html>`;
}

fs.writeFileSync(path.join(ROOT, "products", "index.html"), build("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "products", "index.html"), build("ar"), "utf8");
console.log(`products index rebuilt (EN+AR) with live search — ${meta.length} products, sizes: ${fs.statSync(path.join(ROOT, "products", "index.html")).size} / ${fs.statSync(path.join(ROOT, "ar", "products", "index.html")).size} bytes`);
