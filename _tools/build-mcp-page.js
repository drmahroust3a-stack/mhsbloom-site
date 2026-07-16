// build-mcp-page.js — the public discovery + connect page for the MCP server
// ("the socket"), plus a machine-readable server.json manifest for registries.
// This is where humans and crawlers learn the endpoint and how to connect.
const fs = require("fs");
const path = require("path");
const T = require("./theme");

const ROOT = path.join(__dirname, "..");
const SITE = "https://mhsbloom.com";
const MCP_URL = "https://europe-west3-mhs-bloom.cloudfunctions.net/bloomMcp";
const REPO = "https://github.com/drmahroust3a-stack/mhsbloom-mcp";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- server.json (registry manifest, remote streamable-http) ----
const serverManifest = {
  $schema: "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.json",
  name: "com.mhsbloom/neutral-skincare-reference",
  description:
    "Query MHS BLOOM's independent, payment-blind reference of 1,682 dermacosmetic products — by product, ingredient, concern, category or brand. Neutral descriptive facts, every result links back to its reference page.",
  version: "1.0.0",
  repository: { url: REPO, source: "github" },
  remotes: [{ type: "streamable-http", url: MCP_URL }],
};
fs.mkdirSync(path.join(ROOT, ".well-known", "mcp"), { recursive: true });
fs.writeFileSync(path.join(ROOT, ".well-known", "mcp", "server.json"), JSON.stringify(serverManifest, null, 2), "utf8");
// Also on a non-dot path (GitHub Pages/Jekyll skips dot-dirs unless .nojekyll).
fs.mkdirSync(path.join(ROOT, "mcp"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "mcp", "server.json"), JSON.stringify(serverManifest, null, 2), "utf8");
// Disable Jekyll so .well-known and all files are served verbatim.
fs.writeFileSync(path.join(ROOT, ".nojekyll"), "", "utf8");

// ---- connect snippets ----
const claudeCfg = JSON.stringify({ mcpServers: { "mhs-bloom": { command: "npx", args: ["-y", "mcp-remote", MCP_URL] } } }, null, 2);
const cursorCfg = JSON.stringify({ mcpServers: { "mhs-bloom": { url: MCP_URL } } }, null, 2);

const TOOLS = [
  ["lookup_product", "Identify a product and return its neutral facts + reference link."],
  ["search_products", "Search by ingredient, concern, category, brand, or fragrance-free."],
  ["find_alternatives", "Other products in the same category — listed neutrally, never ranked."],
  ["list_brands", "The dermacosmetic brands covered, with product counts."],
];

const PAGE_CSS = `
.wrap{max-width:820px;margin:0 auto;padding:26px 18px 70px}
.lede{font-size:18px;line-height:1.7;margin:6px 0 22px;color:var(--ink)}
.endpoint{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--paper2,#fffdf8);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:10px 0 24px}
.endpoint code{font-family:ui-monospace,monospace;font-size:14px;color:var(--gold);word-break:break-all}
h2{font-size:17px;margin:26px 0 6px}
.sub{font-size:14px;color:var(--ink-soft,#55514a);margin:0 0 8px}
.codewrap{position:relative;margin:8px 0 4px}
pre{background:#1b1a17;color:#f3ede1;border-radius:12px;padding:16px 16px;overflow-x:auto;font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.6;margin:0}
.cp{position:absolute;top:8px;right:8px;background:var(--gold);color:#1b1a17;border:0;border-radius:8px;padding:5px 12px;font-weight:700;font-size:12px;cursor:pointer;font-family:inherit}
.cp.ok{background:#3d8a55;color:#fff}
.path{font-size:12.5px;color:var(--ink-soft,#55514a);margin:6px 0 0}
table.t{width:100%;border-collapse:collapse;margin-top:6px;font-size:14px}
table.t td{border-top:1px solid var(--line);padding:9px 6px;vertical-align:top}
table.t td:first-child{font-family:ui-monospace,monospace;color:var(--gold);white-space:nowrap;padding-inline-end:16px}
.card{background:var(--paper2,#fffdf8);border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin:20px 0}
.card p{margin:0;font-size:14px;line-height:1.7;color:var(--ink-soft,#55514a)}
.approw{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
.approw a{text-decoration:none;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:8px 14px;font-size:14px}
`;

function page() {
  const canonical = `${SITE}/mcp/`;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    name: "MHS BLOOM MCP Server",
    description: serverManifest.description,
    url: canonical,
    documentation: canonical,
    provider: { "@type": "Organization", name: "MHS BLOOM", url: SITE },
    termsOfService: "https://creativecommons.org/licenses/by/4.0/",
  };
  const toolRows = TOOLS.map(([n, d]) => `<tr><td>${n}</td><td>${esc(d)}</td></tr>`).join("");
  const block = (id, label, sub, code, pathNote) => `
<h2>${esc(label)}</h2>${sub ? `<p class="sub">${sub}</p>` : ""}
<div class="codewrap"><button class="cp" data-t="${id}">Copy</button><pre id="${id}">${esc(code)}</pre></div>
${pathNote ? `<p class="path">${pathNote}</p>` : ""}`;

  const body = `<div class="wrap">
<h1>MHS BLOOM — MCP Server</h1>
<p class="lede">Connect any MCP-capable AI assistant to MHS BLOOM's independent, payment-blind reference of <b>1,682</b> dermacosmetic products. Ask about a product, an ingredient, a concern, or a brand — and get neutral, descriptive facts, each linking back to its reference page.</p>

<div class="endpoint"><b>Endpoint</b> <code>${MCP_URL}</code>
<button class="cp" data-t="ep" style="position:static">Copy</button></div>
<pre id="ep" style="display:none">${MCP_URL}</pre>

${block("claude", "Claude Desktop", `Add to your <code>claude_desktop_config.json</code>, then restart Claude.`, claudeCfg, "Settings → Developer → Edit Config")}
${block("cursor", "Cursor", `Add to <code>~/.cursor/mcp.json</code> (remote Streamable-HTTP).`, cursorCfg, "")}

<h2>Tools</h2>
<table class="t">${toolRows}</table>

<div class="card"><p><b>Neutral by design.</b> Descriptive facts only — no ratings, no prices, no paid placement, and no personal skin verdict (that lives in the app). Data is licensed <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">CC BY 4.0</a>: reuse freely, credit "MHS BLOOM", link the product page. See the full <a href="/data/">dataset &amp; citations</a>.</p></div>

<div class="card"><p>The personal, scan-based decision layer is in the app:</p>
<div class="approw"><a href="${APP_STORE}">App Store</a><a href="${PLAY_STORE}">Google Play</a></div></div>
</div>`;

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MCP Server | MHS BLOOM</title>
<meta name="description" content="Connect any AI assistant to MHS BLOOM's neutral skincare product reference over MCP (Model Context Protocol).">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="MHS BLOOM — MCP Server">
<meta property="og:description" content="Connect any AI assistant to a neutral reference of 1,682 dermacosmetic products.">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${T.css("en")}${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>${T.nav("en", `${SITE}/mcp/`)}${body}${T.footer("en")}
<script>
document.querySelectorAll('.cp').forEach(function(b){b.addEventListener('click',function(){
  var el=document.getElementById(b.getAttribute('data-t'));var t=el.innerText;
  navigator.clipboard.writeText(t).then(function(){var o=b.textContent;b.textContent='Copied';b.classList.add('ok');setTimeout(function(){b.textContent=o;b.classList.remove('ok');},1400);});
});});
</script>
${T.REVEAL_JS}</body></html>`;
}

fs.mkdirSync(path.join(ROOT, "mcp"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "mcp", "index.html"), page(), "utf8");
console.log("built /mcp/ + /.well-known/mcp/server.json");
