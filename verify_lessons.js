/* Node-side verifier: node verify_lessons.js [part1 part2 …]  (no args = all parts) */
'use strict';
const fs = require('fs');
const path = require('path');

global.window = global;
global.CT = { lessons: {}, lesson(o) { CT.lessons[o.id] = o; } };
require(path.join(__dirname, 'js', 'curriculum.js'));
const C = global.CURRICULUM;

const args = process.argv.slice(2);
const partFiles = args.length ? args : C.parts.map((_, i) => 'part' + i);
let failed = false;

for (const pf of partFiles) {
  const file = path.join(__dirname, 'lessons', pf + '.js');
  if (!fs.existsSync(file)) { console.error(`✗ ${pf}: file missing`); failed = true; continue; }
  try { require(file); } catch (e) { console.error(`✗ ${pf}: threw — ${e.message}`); failed = true; continue; }
}

const partIndex = f => parseInt(f.replace('part', ''), 10);
const checkedParts = new Set(partFiles.map(partIndex).filter(n => !isNaN(n)));

const KNOWN_WIDGETS = ['code', 'term', 'quiz', 'reveal', 'bits', 'baseconv', 'enc', 'float32', 'memgrid', 'memmap', 'flow', 'bigo', 'trace', 'arrayviz', 'editor'];

C.parts.forEach((p, pi) => {
  if (!checkedParts.has(pi)) return;
  for (const id of p.lessons) {
    const l = CT.lessons[id];
    if (!l) { console.error(`✗ part${pi}: lesson '${id}' not registered`); failed = true; continue; }
    const problems = [];
    if (!l.title) problems.push('no title');
    if (!l.html || l.html.length < 800) problems.push('html too short (' + (l.html || '').length + ' chars)');
    const whyText = String(l.why || '').replace(/<[^>]*>/g, '').trim();
    if (whyText.length < 60) problems.push('missing/short why (' + whyText.length + ' chars — need ≥60 of plain-language motivation)');
    const phs = [...(l.html || '').matchAll(/data-w="([^"]+)"/g)].map(m => m[1]);
    const wids = Object.keys(l.widgets || {});
    for (const ph of phs) if (!wids.includes(ph)) problems.push(`placeholder '${ph}' has no widget config`);
    for (const wd of wids) if (!phs.includes(wd)) problems.push(`widget '${wd}' has no placeholder in html`);
    for (const [wid, cfg] of Object.entries(l.widgets || {})) {
      if (!KNOWN_WIDGETS.includes(cfg.type)) problems.push(`widget '${wid}' has unknown type '${cfg.type}'`);
      if (cfg.type === 'quiz' && (!Array.isArray(cfg.opts) || cfg.a == null || cfg.a < 0 || cfg.a >= cfg.opts.length))
        problems.push(`quiz '${wid}' has bad opts/a`);
      if (cfg.type === 'trace') {
        const nlines = (cfg.code || '').split('\n').length;
        for (const st of cfg.steps || []) if (st.line != null && (st.line < 1 || st.line > nlines)) problems.push(`trace '${wid}' step line ${st.line} out of range (1..${nlines})`);
      }
      if (cfg.type === 'flow') {
        const ids = new Set((cfg.nodes || []).map(n => n.id));
        for (const e of cfg.edges || []) if (!ids.has(e.from) || !ids.has(e.to)) problems.push(`flow '${wid}' edge ${e.from}->${e.to} references missing node`);
      }
    }
    const quizzes = Object.values(l.widgets || {}).filter(w => w.type === 'quiz').length;
    if (quizzes < 2) problems.push(`only ${quizzes} quizzes (need ≥2)`);
    if (problems.length) { console.error(`✗ ${id}: ${problems.join('; ')}`); failed = true; }
    else console.log(`✓ ${id}`);
  }
});

process.exit(failed ? 1 : 0);
