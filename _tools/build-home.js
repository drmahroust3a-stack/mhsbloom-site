// Homepages (EN /index.html + AR /ar/index.html) — gallery hero with compact overlapping phones.
const fs = require("fs");
const path = require("path");
const T = require("./theme");
const ROOT = path.join(__dirname, "..");
const SITE = T.SITE, APP = T.APP_STORE, PLAY = T.PLAY_STORE;

const HOME_CSS = `
.hero{max-width:820px;margin:0 auto;padding:158px 22px 30px;text-align:center;}
@media(max-width:860px){.hero{padding-top:126px;}}
.hero .plaque{justify-content:center;}
.hero .plaque::before,.hero .plaque::after{flex:0 0 44px;}
.hero h1{font-size:clamp(42px,7vw,68px);line-height:1.1;margin:16px 0 20px;}
.hero h1 .accent{background:linear-gradient(120deg,#B85C68,#B99256);-webkit-background-clip:text;background-clip:text;color:transparent;}
.hero .sub{font-size:18.5px;margin:0 auto 26px;}
.trust{display:flex;gap:0;justify-content:center;margin:6px 0 30px;}
.trust div{font-size:13px;color:var(--soft);padding:4px 28px;}
.trust div+div{border-inline-start:1px solid var(--champagne);}
.trust b{display:block;font-family:var(--df);font-size:30px;color:var(--deep);line-height:1.25;}
.cta-row{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-bottom:8px;}
.sections{max-width:1100px;margin:44px auto 0;padding:0 22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;}
.sec{display:block;text-decoration:none;color:var(--ink);background:var(--porcelain);border:1px solid var(--hairline);border-radius:22px;padding:26px 26px 22px;box-shadow:var(--sh-s);transition:transform .22s,box-shadow .22s,border-color .22s;position:relative;overflow:hidden;}
.sec::after{content:'';position:absolute;inset-inline-end:-30px;top:-30px;width:110px;height:110px;border-radius:50%;background:var(--rose-mist);opacity:.7;transition:transform .3s;}
.sec:hover{transform:translateY(-4px);box-shadow:var(--sh-m);border-color:var(--champagne);}
.sec:hover::after{transform:scale(1.25);}
.sec .ic{font-size:26px;position:relative;z-index:1;}
.sec h3{font-family:var(--df);font-size:20px;color:var(--deep);margin:10px 0 6px;position:relative;z-index:1;}
.sec p{font-size:13.5px;color:var(--soft);line-height:1.75;margin:0;position:relative;z-index:1;}
.sec .go{display:inline-block;margin-top:12px;font-size:13px;font-weight:700;color:var(--gold);letter-spacing:1px;}
`;

function home(lang) {
  const en = lang === "en";
  const alt = en ? SITE + "/ar/" : SITE + "/";
  const canonical = en ? SITE + "/" : SITE + "/ar/";
  const df = en ? "'Playfair Display',Georgia,serif" : "'Amiri',serif";
  const L = en ? {
    over: "THE INDEPENDENT SKINCARE REFERENCE",
    h1: 'Skincare, <span class="accent">decoded.</span>',
    sub: "1,682 products and their ingredients, decoded with sourced evidence — in English and Arabic. No brand can pay to change a rating.",
    t1: "1,682", l1: "products decoded", t2: "82", l2: "brands", t3: "100%", l3: "claims sourced",
    ios: "Download — App Store", and: "Google Play",
    s1: ["🧴", "Products, decoded", "Ingredients, who each product suits, and what the verdict covers — searchable.", "BROWSE"],
    s2: ["📚", "Ingredients library", "Plain-language, sourced explainers for the actives that matter.", "EXPLORE"],
    s3: ["💬", "Skincare answers", "Straight, referenced answers to the questions people actually ask.", "READ"],
    s4: ["📊", "By the numbers", "Descriptive facts from the reference — citable and current.", "SEE"],
    title: "MHS BLOOM — Skincare, decoded.", desc: "An independent bilingual skincare reference: 1,682 products decoded, every claim sourced, and no brand can pay to change a rating."
  } : {
    over: "المرجع المستقل للعناية بالبشرة",
    h1: 'العناية بالبشرة، <span class="accent">مفكوكة.</span>',
    sub: "١٦٨٢ منتج ومكوناتها، مفكوكة بأدلة موثقة — بالعربي والإنجليزي. ولا براند يقدر يدفع عشان يغيّر تقييم.",
    t1: "١٦٨٢", l1: "منتج مفكوك", t2: "٨٢", l2: "براند", t3: "١٠٠٪", l3: "معلومة بمصدر",
    ios: "حمّلي — App Store", and: "Google Play",
    s1: ["🧴", "المنتجات، مفكوكة", "المكونات ولمين مناسب كل منتج وإيه اللي الحكم بيغطيه — كله قابل للبحث.", "تصفّحي"],
    s2: ["📚", "مكتبة المكونات", "شرح مبسّط وموثّق للمكونات الفعّالة اللي بتفرق.", "استكشفي"],
    s3: ["💬", "إجابات العناية", "إجابات مباشرة وموثّقة للأسئلة اللي الناس بتسألها فعلًا.", "اقرئي"],
    s4: ["📊", "بالأرقام", "حقائق وصفية من المرجع — قابلة للاقتباس ومحدّثة.", "شوفي"],
    title: "MHS BLOOM — العناية بالبشرة، مفكوكة.", desc: "مرجع مستقل للعناية بالبشرة بالعربي والإنجليزي: ١٦٨٢ منتج مفكوك، كل معلومة بمصدرها، ولا براند يقدر يدفع عشان يغيّر تقييم."
  };
  const pre = en ? SITE : SITE + "/ar";
  const sec = (s, href) => `<a class='sec' href='${href}'><span class='ic'>${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><span class='go'>${s[3]} ↗</span></a>`;
  return `<!DOCTYPE html>
<html lang='${lang}' dir='${en ? "ltr" : "rtl"}'>
<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>${L.title}</title><meta name='description' content='${L.desc}'>
<link rel='canonical' href='${canonical}'>
<link rel='alternate' hreflang='${lang}' href='${canonical}'>
<link rel='alternate' hreflang='${en ? "ar" : "en"}' href='${alt}'>
<link rel='alternate' hreflang='x-default' href='${SITE}/'>
<meta property='og:title' content='${L.title}'><meta property='og:description' content='${L.desc}'><meta property='og:url' content='${canonical}'><meta property='og:site_name' content='MHS BLOOM'>
${T.FONTS}
<style>${T.css(lang)}:root{--df:${df};}${HOME_CSS}</style>
</head><body>
${T.nav(lang, alt)}
<div class='hero'>
<div class='plaque rv in'><span>${L.over}</span></div>
<h1 class='rv in'>${L.h1}</h1>
<div class='sub rv in'>${L.sub}</div>
<div class='trust rv in'><div><b>${L.t1}</b> ${L.l1}</div><div><b>${L.t2}</b> ${L.l2}</div><div><b>${L.t3}</b> ${L.l3}</div></div>
<div class='cta-row rv in'><a class='btn' href='${APP}'>${L.ios}</a><a class='btn ghost' href='${PLAY}'>${L.and}</a></div>
</div>
<div class='sections'>
${sec(L.s1, pre + "/products/")}
${sec(L.s2, pre + "/ingredients/")}
${sec(L.s3, pre + "/answers/")}
${sec(L.s4, pre + "/stats/")}
</div>
${T.footer(lang)}
${T.REVEAL_JS}
</body></html>`;
}

fs.writeFileSync(path.join(ROOT, "index.html"), home("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "index.html"), home("ar"), "utf8");
console.log("homepages rebuilt with compact refined phones.");
