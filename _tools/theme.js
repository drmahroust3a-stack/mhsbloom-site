// MHS BLOOM — "gallery-grade" design system shared by every generated page.
// Aesthetic: museum plaque / couture editorial. Monumental serif display, gold hairline
// double frames, paper-grain texture, layered light, glass nav, scroll-reveal motion.
// EN: Playfair Display (display) + Inter (UI). AR: Amiri (display) + Tajawal (UI).
const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&family=Inter:wght@400;500;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">`;

// paper grain (inline data-uri SVG turbulence, ~2.5% opacity)
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

function css(lang) {
  const en = lang === "en";
  const body = en ? "'Inter','Tajawal',system-ui,sans-serif" : "'Tajawal','Inter',system-ui,sans-serif";
  const disp = en ? "'Playfair Display','Amiri',Georgia,serif" : "'Amiri','Playfair Display',Georgia,serif";
  return `
:root{
  --cream:#FBF8F4;--porcelain:#FFFEFC;--ink:#2A2224;--muted:#93848A;--soft:#6F5F63;
  --rose:#B85C68;--deep:#8E3D4A;--rose-mist:#FAF0F1;--rose-soft:#F5E5E7;
  --gold:#B99256;--champagne:#E5D3B0;--gold-wash:#F6EFE1;--hairline:#EBDFD6;
  --ok:#4E7A5A;--ok-soft:#E9F2EC;
  --sh-s:0 1px 2px rgba(142,61,74,.04),0 4px 14px rgba(142,61,74,.05);
  --sh-m:0 2px 4px rgba(142,61,74,.04),0 14px 44px rgba(142,61,74,.10);
  --sh-l:0 4px 8px rgba(142,61,74,.05),0 28px 80px rgba(142,61,74,.16);
  --grad:linear-gradient(135deg,#C2687520 0,#8E3D4A 0);
}
*{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
::selection{background:var(--rose-soft);color:var(--deep);}
body{font-family:${body};background:var(--cream);color:var(--ink);line-height:1.85;font-size:16px;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
body::before{content:'';position:fixed;inset:0;z-index:-2;background:
 radial-gradient(900px 560px at 92% -8%,rgba(184,92,104,.09),transparent 62%),
 radial-gradient(700px 480px at -10% 24%,rgba(185,146,86,.08),transparent 60%),
 radial-gradient(900px 640px at 50% 118%,rgba(184,92,104,.06),transparent 62%),
 linear-gradient(180deg,#FCF9F6 0%,#FBF8F4 40%,#F9F4EE 100%);}
body::after{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;background-image:${GRAIN};}
.wrap{max-width:820px;margin:0 auto;padding:118px 22px 40px;}

/* ============ NAV — glass + gold hairline ============ */
.nav{position:fixed;top:0;left:0;right:0;z-index:60;backdrop-filter:blur(16px) saturate(1.4);-webkit-backdrop-filter:blur(16px) saturate(1.4);background:rgba(252,249,245,.78);}
.nav::after{content:'';position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,transparent,var(--champagne) 18%,var(--champagne) 82%,transparent);}
.nav-in{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:18px;padding:15px 22px;}
.logo{font-family:${disp};font-weight:700;font-size:21px;letter-spacing:.4px;color:var(--deep);text-decoration:none;white-space:nowrap;display:flex;align-items:center;gap:9px;}
.logo .petal{font-size:17px;filter:saturate(.85);}
.logo em{font-style:normal;color:var(--gold);}
.nav-links{display:flex;gap:2px;margin-inline-start:auto;align-items:center;}
.nav-links a{font-size:13px;font-weight:600;letter-spacing:.3px;color:var(--soft);text-decoration:none;padding:8px 14px;border-radius:999px;transition:all .18s ease;}
.nav-links a:hover{background:var(--rose-mist);color:var(--deep);}
.nav-links a.lang{border:1px solid var(--hairline);margin-inline-start:6px;}
.nav-links a.cta{background:linear-gradient(135deg,#C26875,#8E3D4A);color:#fff;margin-inline-start:8px;padding:9px 20px;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),var(--sh-s);}
.nav-links a.cta:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),var(--sh-m);filter:brightness(1.05);}
@media(max-width:820px){.nav-links a:not(.cta):not(.lang){display:none;}}

/* ============ typography ============ */
h1{font-family:${disp};font-weight:${en ? "700" : "700"};font-size:clamp(34px,6vw,50px);line-height:1.18;color:var(--deep);letter-spacing:${en ? "-.5px" : "0"};margin:6px 0 16px;}
h2{font-family:${disp};font-weight:${en ? "600" : "700"};font-size:clamp(22px,3.4vw,28px);color:var(--deep);margin:44px 0 16px;line-height:1.3;}
.sub{color:var(--soft);font-size:17px;line-height:1.85;margin-bottom:26px;max-width:58ch;}
p{margin-bottom:14px;}
/* museum label: hairline — SMALL CAPS — hairline */
.plaque{display:flex;align-items:center;gap:14px;margin:0 0 10px;}
.plaque::before,.plaque::after{content:'';height:1px;flex:0 0 34px;background:linear-gradient(90deg,var(--champagne),transparent);}
.plaque::after{background:linear-gradient(90deg,transparent,var(--champagne));flex:1;}
.plaque span{font-size:11.5px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--gold);white-space:nowrap;}

/* ============ cards & frames ============ */
.card{background:var(--porcelain);border:1px solid var(--hairline);border-radius:22px;box-shadow:var(--sh-s);transition:transform .25s ease,box-shadow .25s ease;}
.frame-gold{position:relative;background:var(--porcelain);border:1px solid var(--champagne);border-radius:20px;box-shadow:var(--sh-m);}
.frame-gold::before{content:'';position:absolute;inset:7px;border:1px solid rgba(185,146,86,.35);border-radius:14px;pointer-events:none;}
.chip{display:inline-flex;align-items:center;background:transparent;border:1px solid var(--champagne);color:var(--deep);border-radius:999px;padding:6px 16px;font-size:13px;font-weight:600;letter-spacing:.3px;transition:all .18s;}
.chip:hover{background:var(--gold-wash);}
.chip.fill{background:var(--rose-mist);border-color:#F0DCDF;color:var(--deep);}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,#C26875,#8E3D4A);color:#fff;text-decoration:none;border-radius:15px;padding:14px 30px;font-size:15px;font-weight:700;letter-spacing:.2px;box-shadow:inset 0 1px 0 rgba(255,255,255,.28),var(--sh-m);transition:all .22s ease;border:none;cursor:pointer;}
.btn:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),var(--sh-l);filter:brightness(1.05);}
.btn.ghost{background:var(--porcelain);color:var(--deep);border:1px solid var(--champagne);box-shadow:var(--sh-s);}
.btn.ghost:hover{background:var(--gold-wash);}

/* ============ verdict quote (like the app) ============ */
.quote{position:relative;background:linear-gradient(180deg,#FFFDF9,#FDF8F0);border:1px solid var(--champagne);border-radius:20px;padding:26px 30px 22px;box-shadow:var(--sh-m);}
.quote::before{content:'';position:absolute;inset:7px;border:1px solid rgba(185,146,86,.3);border-radius:14px;pointer-events:none;}
.quote .qmark{position:absolute;top:14px;inset-inline-end:22px;font-family:'Playfair Display',Georgia,serif;font-size:64px;line-height:1;color:rgba(185,146,86,.28);}
.quote .qlabel{font-size:11.5px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--gold);margin-bottom:10px;}
.quote .qtext{font-family:${disp};font-size:19px;line-height:1.75;color:#3d3236;font-weight:${en ? "500" : "400"};${en ? "font-style:italic;" : ""}}

/* ============ phone frames for app screenshots ============ */
.phones{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:16px auto 8px;max-width:520px;}
.phone{position:relative;border-radius:30px;padding:6px;
 background:linear-gradient(155deg,#4a3b3f 0%,#241b1e 30%,#181114 100%);
 box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 -1px 1px rgba(0,0,0,.5),0 20px 50px rgba(70,30,38,.28);
 transition:transform .3s ease;}
.phone:hover{transform:translateY(-4px);}
.phone::before{content:'';position:absolute;top:13px;left:50%;transform:translateX(-50%);width:52px;height:13px;border-radius:99px;background:#120c0e;z-index:2;box-shadow:inset 0 0 3px rgba(255,255,255,.12);}
.phone::after{content:'';position:absolute;inset:6px;border-radius:24px;pointer-events:none;z-index:1;
 background:linear-gradient(115deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.04) 22%,transparent 40%);}
.phone img{width:100%;display:block;border-radius:24px;}
.phone-cap{text-align:center;font-size:12.5px;color:var(--muted);margin-top:11px;letter-spacing:.2px;}
@media(max-width:560px){.phones{gap:14px;}.phone{border-radius:24px;padding:5px;}.phone img{border-radius:19px;}.phone::before{top:10px;width:42px;height:10px;}}

/* ============ scroll reveal ============ */
.rv{opacity:0;transform:translateY(18px);transition:opacity .7s cubic-bezier(.2,.65,.3,1),transform .7s cubic-bezier(.2,.65,.3,1);}
.rv.in{opacity:1;transform:none;}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none;}}

/* ============ footer ============ */
.foot{margin-top:80px;position:relative;background:linear-gradient(180deg,rgba(250,240,241,.0),rgba(246,231,233,.55));}
.foot::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--champagne) 20%,var(--champagne) 80%,transparent);}
.foot-in{max-width:1100px;margin:0 auto;padding:52px 22px 28px;display:grid;grid-template-columns:2.2fr 1fr 1fr;gap:34px;}
@media(max-width:700px){.foot-in{grid-template-columns:1fr;gap:26px;}}
.fbrand{font-family:${disp};font-weight:700;font-size:24px;color:var(--deep);}
.ftag{font-size:13.5px;color:var(--soft);margin-top:8px;max-width:38ch;line-height:1.8;}
.foot h4{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:12px;font-weight:700;}
.foot a{display:block;color:var(--soft);text-decoration:none;font-size:14px;margin-bottom:8px;transition:color .15s;}
.foot a:hover{color:var(--deep);}
.legal{max-width:1100px;margin:0 auto;padding:18px 22px 34px;border-top:1px solid rgba(235,223,214,.7);font-size:11.5px;color:var(--muted);line-height:1.8;}
.legal a{color:inherit;}
`;
}

const REVEAL_JS = `<script>(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.08});document.querySelectorAll('.rv').forEach(function(el){io.observe(el);});})();</script>`;

function nav(lang, altHref) {
  const en = lang === "en";
  const L = en
    ? { p: "Products", i: "Ingredients", a: "Answers", s: "By the numbers", get: "Get the app", lang: "العربية", home: SITE + "/" }
    : { p: "المنتجات", i: "المكونات", a: "الإجابات", s: "بالأرقام", get: "حمّلي التطبيق", lang: "English", home: SITE + "/ar/" };
  const pre = en ? SITE : SITE + "/ar";
  return `<nav class="nav"><div class="nav-in">
<a class="logo" href="${L.home}"><span class="petal">🌸</span>MHS <em>BLOOM</em></a>
<div class="nav-links">
<a href="${pre}/products/">${L.p}</a>
<a href="${pre}/ingredients/">${L.i}</a>
<a href="${pre}/answers/">${L.a}</a>
<a href="${pre}/stats/">${L.s}</a>
<a class="lang" href="${altHref}">${L.lang}</a>
<a class="cta" href="${APP_STORE}">${L.get}</a>
</div></div></nav>`;
}

function footer(lang) {
  const en = lang === "en";
  const pre = en ? SITE : SITE + "/ar";
  const L = en
    ? { tag: "An independent skincare reference — 1,682 products decoded, every claim sourced. No brand can pay to change a rating.", exp: "Explore", app: "Get the app", con: "Contact", p: "Products", i: "Ingredients", a: "Answers", s: "By the numbers", ios: "iPhone & iPad — App Store", and: "Android — Google Play", legal: `© 2026 MH-SYNAPTIX · MHS BLOOM is an independent editorial reference; we are not affiliated with, endorsed by, or sponsored by any brand. All brand and product names are trademarks or registered trademarks of their respective owners, used for identification only. Cosmetic reference — not medical advice.`, priv: "Privacy", terms: "Terms" }
    : { tag: "مرجع مستقل للعناية بالبشرة — ١٦٨٢ منتج مبسّط، وكل معلومة بمصدرها. ولا براند يقدر يدفع عشان يغيّر تقييم.", exp: "استكشفي", app: "حمّلي التطبيق", con: "تواصل", p: "المنتجات", i: "المكونات", a: "الإجابات", s: "بالأرقام", ios: "آيفون وآيباد — App Store", and: "أندرويد — Google Play", legal: `© 2026 MH-SYNAPTIX · MHS BLOOM مرجع تحريري مستقل؛ لسنا تابعين لأي علامة تجارية ولا ممولين منها. جميع أسماء العلامات والمنتجات علامات تجارية لأصحابها وتُستخدم للتعريف فقط. مرجع تجميلي — ليس نصيحة طبية.`, priv: "الخصوصية", terms: "الشروط" };
  return `<footer class="foot"><div class="foot-in">
<div><div class="fbrand">MHS BLOOM</div><div class="ftag">${L.tag}</div></div>
<div><h4>${L.exp}</h4><a href="${pre}/products/">${L.p}</a><a href="${pre}/ingredients/">${L.i}</a><a href="${pre}/answers/">${L.a}</a><a href="${pre}/stats/">${L.s}</a></div>
<div><h4>${L.app}</h4><a href="${APP_STORE}">${L.ios}</a><a href="${PLAY_STORE}">${L.and}</a>
<h4 style="margin-top:18px">${L.con}</h4><a href="mailto:contact@mhsbloom.com">contact@mhsbloom.com</a><a href="https://www.instagram.com/mhs_bloom">Instagram</a></div>
</div><div class="legal">${L.legal} · <a href="https://drmahroust3a-stack.github.io/MHS-BLOOM-LEGAL/privacy-policy.html">${L.priv}</a> · <a href="https://drmahroust3a-stack.github.io/MHS-BLOOM-LEGAL/terms-of-service.html">${L.terms}</a></div></footer>`;
}

module.exports = { FONTS, css, nav, footer, REVEAL_JS, SITE, APP_STORE, PLAY_STORE };
