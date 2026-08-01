/* Node-side static page generator — SEO for the hash-routed SPA.
   Usage:  node gen_static.js [https://your-domain.com]
   Emits:  lesson/<id>/index.html  (crawlable text version of every lesson,
           linking to the interactive SPA version), gotchas.html,
           robots.txt, and — when a domain is given — sitemap.xml.
   Zero-build stays true: run this manually (like verify_lessons.js) and
   commit the output. Re-run whenever lessons change. */
'use strict';
const fs = require('fs');
const path = require('path');

global.window = global;
global.CT = { lessons: {}, lesson(o) { CT.lessons[o.id] = o; } };
require(path.join(__dirname, 'js', 'curriculum.js'));
const C = global.CURRICULUM;
for (let i = 0; i <= 8; i++) require(path.join(__dirname, 'lessons', 'part' + i + '.js'));

const SITE = (process.argv[2] || '').replace(/\/+$/, '');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stripTags = s => String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';

/* ---------- static rendering of widget configs ---------- */
function widgetHtml(cfg, lessonId) {
  if (!cfg) return '';
  switch (cfg.type) {
    case 'code':
      return `<figure class="code"><figcaption>${esc(cfg.title || 'main.c')}</figcaption><pre><code>${esc(String(cfg.code).replace(/^\n+|\s+$/g, ''))}</code></pre></figure>`;
    case 'term':
      return `<figure class="code term"><figcaption>${esc(cfg.title || 'terminal')}</figcaption><pre>${esc(String(cfg.text).replace(/^\n+|\s+$/g, ''))}</pre></figure>`;
    case 'quiz':
      return `<div class="sq"><p class="sq-q">🧠 <b>Checkpoint:</b> ${cfg.q}</p><ul>${(cfg.opts || []).map(o => `<li>${o}</li>`).join('')}</ul><details><summary>Show answer</summary><p><b>${(cfg.opts || [])[cfg.a] || ''}</b>${cfg.expl ? ' — ' + cfg.expl : ''}</p></details></div>`;
    case 'reveal':
      return `<div class="sq"><p class="sq-q">🤔 ${cfg.q}</p><details><summary>${esc(cfg.label || 'Reveal answer')}</summary>${cfg.answer || ''}</details></div>`;
    default:
      return `<p class="iw">▶ <a href="../../index.html#/lesson/${lessonId}">This spot has an interactive ${esc(cfg.type)} widget — open the interactive lesson to play with it.</a></p>`;
  }
}

function lessonBody(l) {
  let html = l.html || '';
  html = html.replace(/<div\s+data-w="([^"]+)"\s*><\/div>/g, (m, key) => widgetHtml((l.widgets || {})[key], l.id));
  // interlink statically between generated pages; other app routes go to the SPA
  html = html.replace(/href="#\/lesson\/([a-z0-9-]+)"/g, 'href="../$1/"');
  html = html.replace(/href="#\/([a-z0-9-]*)"/g, 'href="../../index.html#/$1"');
  return html;
}

const PAGE_CSS = `
:root{color-scheme:dark;--bg:#0d0d0d;--surface:#1a1a19;--border:rgba(255,255,255,.14);--ink:#fff;--ink2:#c3c2b7;--ink3:#898781;--accent:#3987e5;--code:#141413;--mono:ui-monospace,Menlo,Consolas,monospace}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,sans-serif}
.wrap{max-width:820px;margin:0 auto;padding:28px 20px 80px}
header{display:flex;align-items:center;gap:10px;margin-bottom:26px}
.logo{font:800 15px var(--mono);color:var(--accent);border:1.5px solid var(--accent);border-radius:8px;padding:3px 8px;text-decoration:none}
header a{color:var(--ink2);text-decoration:none;font-weight:600}
.eyebrow{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin:0 0 6px}
h1{font-size:32px;line-height:1.2;margin:0 0 10px}h2{margin-top:34px}h3{margin-top:24px}
.meta{color:var(--ink3);font-size:14px;margin-bottom:18px}
.cta{display:inline-block;background:var(--accent);color:#fff;font-weight:700;padding:11px 20px;border-radius:10px;text-decoration:none;margin:6px 0 22px}
.why{background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:12px;padding:14px 18px;margin-bottom:22px;color:var(--ink2)}
.why .k{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
figure.code{margin:18px 0;background:var(--code);border:1px solid var(--border);border-radius:12px;overflow:hidden}
figure.code figcaption{padding:8px 14px;font:12px var(--mono);color:var(--ink3);border-bottom:1px solid var(--border)}
figure.code pre{margin:0;padding:14px 16px;overflow-x:auto;font:13.5px/1.55 var(--mono)}
code{font-family:var(--mono);font-size:.92em;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:1px 6px}
pre code{background:none;border:none;padding:0}
.sq{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 18px;margin:18px 0}
.sq ul{margin:8px 0}.sq-q{margin:0}
details{margin-top:8px}summary{cursor:pointer;color:var(--accent);font-weight:600}
.iw{background:var(--surface);border:1px dashed var(--border);border-radius:12px;padding:12px 16px}
.iw a{color:var(--accent);text-decoration:none;font-weight:600}
table{border-collapse:collapse;width:100%;margin:16px 0;font-size:14.5px}
th,td{border:1px solid var(--border);padding:8px 12px;text-align:left}
.callout{display:flex;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin:16px 0}
.callout .co-ic{font-size:20px}
.nav{display:flex;justify-content:space-between;gap:12px;margin-top:36px;font-weight:600}
.nav a{color:var(--accent);text-decoration:none}
a{color:var(--accent)}
img,svg,pre{max-width:100%}
`;

function pageHtml(l, part, prev, next) {
  const desc = clip(stripTags(l.why || l.html || ''), 158);
  const url = SITE ? `${SITE}/lesson/${l.id}/` : '';
  const interactive = `../../index.html#/lesson/${l.id}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'TechArticle',
    headline: l.title, description: desc,
    isPartOf: { '@type': 'Course', name: 'The C Path — Learn C, visually' },
    ...(url ? { url } : {}),
  };
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(l.title)} — The C Path</title>
<meta name="description" content="${esc(desc)}">
${url ? `<link rel="canonical" href="${url}">` : ''}
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(l.title)} — The C Path">
<meta property="og:description" content="${esc(desc)}">
${url ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'&gt;&lt;text y='.9em' font-size='90'&gt;⚙️&lt;/text&gt;&lt;/svg&gt;">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${PAGE_CSS}</style>
</head>
<body>
<div class="wrap">
<header><a class="logo" href="../../index.html">&lt;C&gt;</a><a href="../../index.html">The C Path — learn C, visually</a></header>
<article>
<p class="eyebrow">${part ? esc(part.emoji + ' ' + part.title) : ''}</p>
<h1>${esc(l.title)}</h1>
<p class="meta">⏱ ${l.minutes || 10} min · free interactive lesson · quizzes, visualizations &amp; a real compiler</p>
<a class="cta" href="${interactive}">▶ Open the interactive lesson — free, no signup</a>
${l.why ? `<div class="why"><div class="k">Why you're learning this</div>${l.why}</div>` : ''}
${lessonBody(l)}
<a class="cta" href="${interactive}">▶ Practice this lesson interactively (with live gcc)</a>
<nav class="nav">
${prev ? `<a href="../${prev}/">← ${esc(CT.lessons[prev] ? CT.lessons[prev].title : prev)}</a>` : '<span></span>'}
${next ? `<a href="../${next}/">${esc(CT.lessons[next] ? CT.lessons[next].title : next)} →</a>` : '<span></span>'}
</nav>
</article>
</div>
</body>
</html>`;
}

/* ---------- gotchas.html ---------- */
function gotchasPage() {
  const gfile = path.join(__dirname, 'js', 'gotchas-data.js');
  if (!fs.existsSync(gfile)) return null;
  require(gfile);
  const G = global.GOTCHAS || [];
  if (!G.length) return null;
  const url = SITE ? `${SITE}/gotchas.html` : '';
  const desc = `${G.length} famous C gotchas — integer division, dangling pointers, macro traps, undefined behavior — each one a runnable program you can compile in your browser.`;
  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${G.length} C Gotchas — famous C traps, each one runnable — The C Path</title>
<meta name="description" content="${esc(desc)}">
${url ? `<link rel="canonical" href="${url}">` : ''}
<meta property="og:type" content="article">
<meta property="og:title" content="${G.length} C Gotchas — famous C traps, each one runnable in your browser">
<meta property="og:description" content="${esc(desc)}">
${url ? `<meta property="og:url" content="${url}">` : ''}
<meta name="twitter:card" content="summary">
<link rel="icon" href="data:image/svg+xml,&lt;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'&gt;&lt;text y='.9em' font-size='90'&gt;⚙️&lt;/text&gt;&lt;/svg&gt;">
<style>${PAGE_CSS.replace(/\.\.\/\.\.\//g, '')}
.g{margin:34px 0}.vs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.vs div{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-size:14.5px;color:var(--ink2)}
.vs b{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--ink3)}
.vs .bad b{color:#e66767}
@media(max-width:620px){.vs{grid-template-columns:1fr}}</style>
</head>
<body>
<div class="wrap">
<header><a class="logo" href="index.html">&lt;C&gt;</a><a href="index.html">The C Path — learn C, visually</a></header>
<h1>🪤 ${G.length} C Gotchas</h1>
<p>The bugs that bite <i>every</i> C programmer once. Each is a complete, runnable program — read it, guess what it does, then run it on real gcc in your browser.</p>
<a class="cta" href="index.html#/gotchas">▶ Open the interactive gallery — run every trap live, free, no signup</a>
${G.map(g => `<div class="g">
<h2>${g.emoji || '🪤'} ${esc(g.title)}${g.ub ? ' <small>(undefined behavior)</small>' : ''}</h2>
<p><i>${esc(g.hook)}</i></p>
<figure class="code"><figcaption>gotcha.c</figcaption><pre><code>${esc(g.code)}</code></pre></figure>
<div class="vs"><div><b>you might expect</b>${esc(g.expected)}</div><div class="bad"><b>what actually happens</b>${esc(g.actual)}</div></div>
${g.why}
${g.lesson && CT.lessons[g.lesson] ? `<p><a href="lesson/${g.lesson}/">📖 Learn it properly: ${esc(CT.lessons[g.lesson].title)} →</a></p>` : ''}
</div>`).join('')}
<a class="cta" href="index.html#/gotchas">▶ Run all ${G.length} traps interactively</a>
</div>
</body>
</html>`;
}

/* ---------- emit ---------- */
let n = 0;
const order = C.order();
for (const id of order) {
  const l = CT.lessons[id];
  if (!l) continue;
  const { prev, next } = C.prevNext(id);
  const dir = path.join(__dirname, 'lesson', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(l, C.partOf(id), prev, next));
  n++;
}
console.log(`✓ ${n} static lesson pages → lesson/<id>/index.html`);

const gh = gotchasPage();
if (gh) { fs.writeFileSync(path.join(__dirname, 'gotchas.html'), gh); console.log('✓ gotchas.html'); }
else console.log('· gotchas.html skipped (js/gotchas-data.js not found)');

fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\n${SITE ? `Sitemap: ${SITE}/sitemap.xml\n` : ''}`);
console.log('✓ robots.txt');

if (SITE) {
  const urls = [`${SITE}/`, `${SITE}/gotchas.html`, ...order.filter(id => CT.lessons[id]).map(id => `${SITE}/lesson/${id}/`)];
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n') + '\n</urlset>\n');
  console.log('✓ sitemap.xml');
} else {
  console.log('· sitemap.xml skipped — run again as:  node gen_static.js https://your-domain.com');
}
