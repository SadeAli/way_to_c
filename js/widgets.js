/* ============================================================
   widgets.js — interactive lesson components.
   A lesson's html contains  <div data-w="someId"></div>
   and its widgets map:  { someId: { type: 'quiz', ... } }
   ============================================================ */
(function () {
  'use strict';
  const W = {};
  CT.widgets = W;

  const $make = (cls, html) => { const d = document.createElement('div'); d.className = cls; if (html) d.innerHTML = html; return d; };
  const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* Mount all widgets inside a container for a given lesson */
  CT.mountWidgets = function (root, lesson) {
    root.querySelectorAll('[data-w]').forEach(ph => {
      const key = ph.getAttribute('data-w');
      const cfg = (lesson.widgets || {})[key];
      if (!cfg) return;
      const fn = W[cfg.type];
      if (fn) fn(ph, cfg, lesson, key);
      else ph.innerHTML = `<div class="callout warn"><div class="co-body">Unknown widget: ${CT.esc(cfg.type)}</div></div>`;
    });
  };

  /* ---------- code / terminal ---------- */
  W.code = (ph, cfg) => { ph.replaceWith(CT.codeBlock(cfg.code, cfg)); };

  W.term = (ph, cfg) => {
    const el = $make('termblock');
    const text = cfg.text.replace(/^\n+|\s+$/g, '');
    el.innerHTML = `<div class="cb-head"><span class="cb-dots"><i></i><i></i><i></i></span><span>${CT.esc(cfg.title || 'terminal')}</span></div><pre></pre>`;
    const pre = el.querySelector('pre');
    pre.innerHTML = CT.esc(text)
      .replace(/^(\$ .*)$/gm, '<span class="t-prompt">$1</span>')
      .replace(/^(# .*)$/gm, '<span class="t-dim">$1</span>');
    ph.replaceWith(el);
  };

  /* ---------- editor exercise ----------
     With cfg.expect (expected stdout), the exercise auto-checks on Run:
     matching output = green PASS + one-shot XP; mismatch = an
     expected-vs-got diff panel. Without expect it stays a sandbox. */
  const normOut = s => String(s || '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');
  W.editor = (ph, cfg, lesson, key) => {
    const wrap = $make('widget');
    const exId = lesson && key ? lesson.id + ':' + key : null;
    const expectVal = cfg.expect != null ? cfg.expect : (exId && window.EXPECTS ? window.EXPECTS[exId] : null);
    const checkable = expectVal != null && exId;
    const xp = cfg.xp || 30;
    const solved = () => checkable && !!CT.state.exercises[exId];
    wrap.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Try it yourself')}` +
      (checkable ? `<span class="quiz-xp ex-chip">${solved() ? '✓ solved' : '🎯 auto-checked · +' + xp + ' XP'}</span>` : '') +
      `</div>`;
    const mount = document.createElement('div');
    wrap.appendChild(mount);
    let verdict = null;
    if (checkable) { verdict = $make('ex-verdict'); verdict.hidden = true; wrap.appendChild(verdict); }
    if (cfg.hint) wrap.appendChild($make('whint', '💡 ' + cfg.hint));
    ph.replaceWith(wrap);
    CT.makeEditor(mount, {
      code: cfg.code || '', height: cfg.height || 260, run: true,
      onRun: res => {
        if (checkable && !res.compileErr) {
          if (res.code === 0 && normOut(res.stdout) === normOut(expectVal)) {
            verdict.className = 'ex-verdict pass';
            verdict.innerHTML = `<b>✓ Correct output${solved() ? '' : ' — +' + xp + ' XP'}!</b> Exactly what this exercise asked for.`;
            verdict.hidden = false;
            if (CT.exerciseSolved(exId, xp)) {
              CT.confetti(70);
              const chip = wrap.querySelector('.ex-chip');
              if (chip) chip.textContent = '✓ solved';
            }
          } else {
            verdict.className = 'ex-verdict fail';
            verdict.innerHTML = `<b>Not quite yet.</b> Compare:` +
              `<div class="ex-diff"><div><div class="ex-diff-k">expected</div><pre>${CT.esc(normOut(expectVal)) || '<span class="dim">(no output)</span>'}</pre></div>` +
              `<div><div class="ex-diff-k">your output</div><pre>${CT.esc(normOut(res.stdout)) || '(no output)'}${res.code !== 0 ? '\n— exited with code ' + res.code : ''}</pre></div></div>`;
            verdict.hidden = false;
          }
        }
        if (cfg.onRun) cfg.onRun(res);
      },
    });
  };

  /* ---------- interactive bits ---------- */
  W.bits = (ph, cfg) => {
    const n = cfg.n || 8;
    const signed = !!cfg.signed;
    let bits = new Array(n).fill(0);
    if (cfg.value != null) for (let i = 0; i < n; i++) bits[n - 1 - i] = (cfg.value >> i) & 1;

    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || (signed ? 'Two’s-complement byte' : 'One byte, eight switches'))}</div>
      <div class="bits-row"></div><div class="bits-readout"></div>
      <div class="whint">${cfg.hint || 'Click the bits to flip them.'}</div>`;
    const row = el.querySelector('.bits-row'), out = el.querySelector('.bits-readout');

    function value() {
      let v = 0;
      for (let i = 0; i < n; i++) v = (v << 1) | bits[i];
      if (signed && bits[0] === 1) v = v - (1 << n);
      return v;
    }
    function unsignedValue() {
      let v = 0; for (let i = 0; i < n; i++) v = (v << 1) | bits[i]; return v;
    }
    function render() {
      row.innerHTML = '';
      bits.forEach((b, i) => {
        const pow = n - 1 - i;
        const cell = $make('bit' + (b ? ' on' : ''), `<span class="b-val">${b}</span><span class="b-pow">${signed && i === 0 ? '−2<sup>' + pow + '</sup>' : '2<sup>' + pow + '</sup>'}</span>`);
        cell.addEventListener('click', () => {
          bits[i] ^= 1;
          cell.classList.add('flip');
          setTimeout(() => cell.classList.remove('flip'), 320);
          render();
        });
        row.appendChild(cell);
      });
      const uv = unsignedValue(), v = value();
      out.innerHTML = '';
      out.appendChild($make('readout hi', `<div class="r-lbl">decimal</div><div class="r-val">${v}</div>`));
      if (signed) out.appendChild($make('readout', `<div class="r-lbl">as unsigned</div><div class="r-val">${uv}</div>`));
      out.appendChild($make('readout', `<div class="r-lbl">hex</div><div class="r-val">0x${uv.toString(16).toUpperCase().padStart(Math.ceil(n / 4), '0')}</div>`));
      out.appendChild($make('readout', `<div class="r-lbl">binary</div><div class="r-val">0b${bits.join('')}</div>`));
      if (cfg.onChange) cfg.onChange(v);
    }
    render();
    ph.replaceWith(el);
  };

  /* ---------- base converter ---------- */
  W.baseconv = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Base converter')}</div>
      <div class="bits-readout" style="justify-content:stretch">
        ${['decimal', 'hex', 'binary', 'octal'].map(b => `
          <div class="readout" style="flex:1;min-width:150px">
            <div class="r-lbl">${b}</div>
            <input data-base="${b}" style="width:100%;text-align:center;background:transparent;border:none;outline:none;color:var(--ink);font:700 20px var(--mono)" spellcheck="false">
          </div>`).join('')}
      </div>
      <div class="whint">Type in any box — the others follow. Try typing <code class="inline">255</code> in decimal, or <code class="inline">ff</code> in hex.</div>`;
    const inputs = el.querySelectorAll('input');
    function setAll(v, skip) {
      inputs.forEach(inp => {
        if (inp === skip) return;
        const b = inp.dataset.base;
        inp.value = isNaN(v) ? '' : (b === 'decimal' ? v.toString(10) : b === 'hex' ? v.toString(16).toUpperCase() : b === 'binary' ? v.toString(2) : v.toString(8));
      });
    }
    inputs.forEach(inp => inp.addEventListener('input', () => {
      const b = inp.dataset.base;
      const radix = b === 'decimal' ? 10 : b === 'hex' ? 16 : b === 'binary' ? 2 : 8;
      const v = parseInt(inp.value.trim(), radix);
      setAll(v, inp);
    }));
    setAll(cfg.value != null ? cfg.value : 42, null);
    ph.replaceWith(el);
  };

  /* ---------- text encoding explorer ---------- */
  W.enc = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Encoding explorer')}</div>
      <div class="enc-input"><input maxlength="24" spellcheck="false" placeholder="type here…"></div>
      <div class="enc-cells"></div>
      <div class="whint">Each card is one <b>byte</b> in UTF-8. Orange cards are part of a multi-byte character — try typing é, €, or an emoji 🙂.</div>`;
    const input = el.querySelector('input'), cells = el.querySelector('.enc-cells');
    function render() {
      cells.innerHTML = '';
      const s = input.value || '';
      const encd = new TextEncoder();
      for (const ch of s) {
        const bytes = encd.encode(ch);
        bytes.forEach((byte, bi) => {
          const c = $make('enc-cell' + (bytes.length > 1 ? ' multi' : ''),
            `<div class="e-ch">${bi === 0 ? CT.esc(ch) : '·'}</div>
             <div class="e-dec">${byte}</div>
             <div class="e-hex">0x${byte.toString(16).toUpperCase().padStart(2, '0')}</div>
             <div class="e-bin">${byte.toString(2).padStart(8, '0')}</div>`);
          cells.appendChild(c);
        });
      }
      if (!s) cells.innerHTML = '<div class="whint">…the bytes will appear here.</div>';
    }
    input.addEventListener('input', render);
    input.value = cfg.initial != null ? cfg.initial : 'Hi!';
    render();
    ph.replaceWith(el);
  };

  /* ---------- IEEE-754 float explorer (32-bit) ---------- */
  W.float32 = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'IEEE-754 float, bit by bit')}</div>
      <div class="bits-row" style="gap:4px"></div>
      <div class="bits-readout"></div>
      <div class="whint">1 sign bit · 8 exponent bits · 23 mantissa bits. Click any bit. Value = (−1)<sup>sign</sup> × 1.mantissa × 2<sup>exp−127</sup></div>`;
    const row = el.querySelector('.bits-row'), out = el.querySelector('.bits-readout');
    const buf = new ArrayBuffer(4), f32 = new Float32Array(buf), u32 = new Uint32Array(buf);
    f32[0] = cfg.value != null ? cfg.value : 3.14;

    function render() {
      row.innerHTML = '';
      const v = u32[0];
      for (let i = 31; i >= 0; i--) {
        const bit = (v >>> i) & 1;
        const group = i === 31 ? 'sign' : i >= 23 ? 'exp' : 'man';
        const color = group === 'sign' ? 'var(--red)' : group === 'exp' ? 'var(--yellow)' : 'var(--accent)';
        const cell = $make('bit' + (bit ? ' on' : ''), `<span class="b-val">${bit}</span>`);
        cell.style.width = '26px'; cell.style.height = '40px'; cell.style.borderRadius = '7px';
        if (bit) { cell.style.background = color; cell.style.borderColor = color; cell.style.boxShadow = 'none'; }
        cell.title = group === 'sign' ? 'sign bit' : group === 'exp' ? 'exponent bit' : 'mantissa bit';
        cell.addEventListener('click', () => { u32[0] = u32[0] ^ (1 << i); render(); });
        row.appendChild(cell);
      }
      const sign = (v >>> 31) & 1, exp = (v >>> 23) & 0xff, man = v & 0x7fffff;
      out.innerHTML = '';
      out.appendChild($make('readout hi', `<div class="r-lbl">value</div><div class="r-val">${Number.isFinite(f32[0]) ? (Math.abs(f32[0]) > 1e7 || (f32[0] !== 0 && Math.abs(f32[0]) < 1e-4) ? f32[0].toExponential(4) : parseFloat(f32[0].toPrecision(7))) : f32[0]}</div>`));
      out.appendChild($make('readout', `<div class="r-lbl">sign</div><div class="r-val" style="color:var(--red)">${sign}</div>`));
      out.appendChild($make('readout', `<div class="r-lbl">exponent</div><div class="r-val" style="color:var(--yellow)">${exp}${exp !== 0 && exp !== 255 ? ' (2^' + (exp - 127) + ')' : exp === 255 ? ' (special)' : ' (denormal)'}</div>`));
      out.appendChild($make('readout', `<div class="r-lbl">mantissa</div><div class="r-val" style="color:var(--accent)">0x${man.toString(16).toUpperCase()}</div>`));
    }
    render();
    ph.replaceWith(el);
  };

  /* ---------- memory cells ---------- */
  W.memgrid = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Memory')}</div><div class="memgrid"></div>` + (cfg.note ? `<div class="whint">${cfg.note}</div>` : '');
    const grid = el.querySelector('.memgrid');
    (cfg.cells || []).forEach(c => {
      const cell = $make('memcell' + (c.hl ? ' hl' : '') + (c.hl2 ? ' hl2' : '') + (c.freed ? ' freed' : ''),
        `<div class="m-addr">${CT.esc(c.addr || '')}</div><div class="m-val">${CT.esc(String(c.val != null ? c.val : '?'))}</div><div class="m-name">${CT.esc(c.name || '')}</div>`);
      grid.appendChild(cell);
    });
    ph.replaceWith(el);
  };

  /* ---------- stack/heap memory map ---------- */
  W.memmap = (ph, cfg) => {
    const segs = cfg.segs || [
      { name: '.text', desc: 'your compiled machine code (read-only)', c: 'var(--accent)' },
      { name: '.rodata', desc: 'string literals & constants (read-only)', c: 'var(--violet)' },
      { name: '.data', desc: 'initialized globals & statics', c: 'var(--aqua)' },
      { name: '.bss', desc: 'zero-initialized globals & statics', c: 'var(--aqua)' },
      { name: 'heap  ⬇', desc: 'malloc() lives here — grows downward*', c: 'var(--orange)' },
      { name: '…free…', desc: 'unused address space', c: 'var(--ink-3)' },
      { name: 'stack ⬆', desc: 'locals & function calls — grows upward*', c: 'var(--magenta)' },
    ];
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'A process’s memory layout')}</div>
      <div class="memmap"><div class="addr-lbl">high addresses</div></div>
      ${cfg.note !== undefined ? (cfg.note ? `<div class="whint">${cfg.note}</div>` : '') : '<div class="whint">*On typical systems the stack sits at high addresses growing down, and the heap grows up — arrows show growth direction toward the free gap. Hover each segment.</div>'}`;
    const map = el.querySelector('.memmap');
    [...segs].reverse().forEach(s => {
      const seg = $make('seg', `<div class="s-name">${CT.esc(s.name)}</div><div class="s-desc">${CT.esc(s.desc)}</div>`);
      seg.style.borderColor = s.c || 'var(--border-strong)';
      map.appendChild(seg);
    });
    map.appendChild($make('addr-lbl', 'low addresses'));
    ph.replaceWith(el);
  };

  /* ---------- flow diagram (SVG, grid-based auto layout) ----------
     nodes: [{id, col, row, kind: start|end|proc|dec|io, label}]
     edges: [{from, to, label, side}]  side: optional 'left'|'right' for loop-backs */
  W.flow = (ph, cfg) => {
    const CW = cfg.colw || 190, RH = cfg.rowh || 92, NW = 150, NH = 52, DW = 160, DH = 76;
    const nodes = cfg.nodes || [], edges = cfg.edges || [];
    const byId = {}; nodes.forEach(nd => byId[nd.id] = nd);
    const cols = Math.max(...nodes.map(nd => nd.col)) + 1;
    const rows = Math.max(...nodes.map(nd => nd.row)) + 1;
    const Wd = cols * CW, Hd = rows * RH + 20;
    const cx = nd => nd.col * CW + CW / 2;
    const cy = nd => nd.row * RH + RH / 2;
    const isDec = nd => nd.kind === 'dec';
    const halfW = nd => (isDec(nd) ? DW : NW) / 2;
    const halfH = nd => (isDec(nd) ? DH : NH) / 2;

    let svg = `<svg class="flow-svg ${cfg.animate === false ? '' : 'flow-anim'}" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${CT.esc(cfg.label || 'flow diagram')}">
      <defs><marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="var(--ink-3)"/></marker></defs>`;

    // edges first (under nodes); labels collected and drawn last (over nodes)
    let labelSvg = '';
    for (const e of edges) {
      const a = byId[e.from], b = byId[e.to];
      if (!a || !b) continue;
      let d, lx, ly;
      if (a.col === b.col && b.row > a.row && !e.side) {          // straight down
        d = `M ${cx(a)} ${cy(a) + halfH(a)} L ${cx(b)} ${cy(b) - halfH(b)}`;
        lx = cx(a) + 8; ly = (cy(a) + halfH(a) + cy(b) - halfH(b)) / 2;
      } else if (a.row === b.row) {                               // straight across
        const dir = b.col > a.col ? 1 : -1;
        d = `M ${cx(a) + dir * halfW(a)} ${cy(a)} L ${cx(b) - dir * halfW(b)} ${cy(b)}`;
        lx = (cx(a) + cx(b)) / 2; ly = cy(a) - 8;
      } else if (e.side) {                                        // loop-back around the side
        const dir = e.side === 'left' ? -1 : 1;
        const xEdge = cx(a) + dir * halfW(a);
        const xOut = dir === -1 ? Math.min(cx(a), cx(b)) - CW * 0.48 : Math.max(cx(a), cx(b)) + CW * 0.48;
        d = `M ${xEdge} ${cy(a)} L ${xOut} ${cy(a)} L ${xOut} ${cy(b)} L ${cx(b) + (cx(b) > xOut ? -1 : 1) * halfW(b)} ${cy(b)}`;
        lx = xOut + (dir === -1 ? 6 : -6); ly = (cy(a) + cy(b)) / 2;
      } else {                                                    // elbow: down then across then down
        const midY = cy(a) + halfH(a) + (cy(b) - halfH(b) - cy(a) - halfH(a)) / 2;
        d = `M ${cx(a)} ${cy(a) + halfH(a)} L ${cx(a)} ${midY} L ${cx(b)} ${midY} L ${cx(b)} ${cy(b) - halfH(b)}`;
        lx = (cx(a) + cx(b)) / 2; ly = midY - 6;
      }
      svg += `<path class="f-arrow" d="${d}"/>`;
      if (e.label) labelSvg += `<text class="f-edge-lbl" x="${Math.max(lx, 4)}" y="${ly}" text-anchor="${a.row === b.row ? 'middle' : 'start'}">${CT.esc(e.label)}</text>`;
    }

    // nodes
    for (const nd of nodes) {
      const x = cx(nd), y = cy(nd);
      svg += `<g class="f-node" data-node="${nd.id}">`;
      if (isDec(nd)) {
        svg += `<polygon class="f-diamond" points="${x},${y - DH / 2} ${x + DW / 2},${y} ${x},${y + DH / 2} ${x - DW / 2},${y}"/>`;
      } else if (nd.kind === 'io') {
        const skew = 14;
        svg += `<polygon class="f-io" points="${x - NW / 2 + skew},${y - NH / 2} ${x + NW / 2},${y - NH / 2} ${x + NW / 2 - skew},${y + NH / 2} ${x - NW / 2},${y + NH / 2}"/>`;
      } else {
        const cls = nd.kind === 'start' ? 'f-box f-start' : nd.kind === 'end' ? 'f-box f-end' : 'f-box';
        const r = (nd.kind === 'start' || nd.kind === 'end') ? NH / 2 : 10;
        svg += `<rect class="${cls}" x="${x - NW / 2}" y="${y - NH / 2}" width="${NW}" height="${NH}" rx="${r}"/>`;
      }
      const lines = String(nd.label).split('\n');
      const y0 = y - (lines.length - 1) * 8;
      lines.forEach((ln, i) => {
        svg += `<text x="${x}" y="${y0 + i * 16 + 5}" text-anchor="middle" style="font-family:${/[(){};=<>!+*\/%&|^\[\]]|--|\+\+/.test(ln) ? 'var(--mono);font-size:12px' : 'inherit'}">${CT.esc(ln)}</text>`;
      });
      svg += `</g>`;
    }
    svg += labelSvg + `</svg>`;

    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Flow diagram')}</div>${svg}` + (cfg.note ? `<div class="whint">${cfg.note}</div>` : '');
    ph.replaceWith(el);
  };

  /* ---------- Big-O interactive graph ---------- */
  const CURVES = {
    '1':     { lbl: 'O(1)',        f: n => 1,                    v: '--accent' },
    'logn':  { lbl: 'O(log n)',    f: n => Math.log2(Math.max(n, 1)), v: '--aqua' },
    'n':     { lbl: 'O(n)',        f: n => n,                    v: '--green' },
    'nlogn': { lbl: 'O(n log n)',  f: n => n * Math.log2(Math.max(n, 1)), v: '--yellow' },
    'n2':    { lbl: 'O(n²)',       f: n => n * n,                v: '--orange' },
    'n3':    { lbl: 'O(n³)',       f: n => n * n * n,            v: '--magenta' },
    '2n':    { lbl: 'O(2ⁿ)',       f: n => Math.pow(2, n),       v: '--red' },
  };
  W.bigo = (ph, cfg) => {
    const keys = cfg.curves || ['1', 'logn', 'n', 'nlogn', 'n2', '2n'];
    const on = {}; keys.forEach(k => on[k] = !(cfg.off || []).includes(k));
    let maxN = cfg.maxN || 50;

    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'How fast does the work grow?')}</div>
      <div class="bigo-legend"></div>
      <div class="bigo-wrap"><canvas width="820" height="420"></canvas></div>
      <div class="bigo-ctl"><span>n =</span><input type="range" min="4" max="${cfg.sliderMax || 120}" value="${maxN}"><b class="nval" style="font-variant-numeric:tabular-nums">${maxN}</b></div>
      <div class="whint">${cfg.note || 'Toggle curves in the legend; drag the slider to grow n and watch which algorithms explode. The y-axis is “operations”.'}</div>`;
    const legend = el.querySelector('.bigo-legend'), canvas = el.querySelector('canvas'), ctx = canvas.getContext('2d');
    const slider = el.querySelector('input'), nval = el.querySelector('.nval');

    keys.forEach(k => {
      const c = CURVES[k];
      const b = document.createElement('button');
      b.className = 'bigo-chipbtn ' + (on[k] ? 'on' : 'off');
      b.style.setProperty('--c', `var(${c.v})`);
      b.innerHTML = `<span class="sw"></span>${c.lbl}`;
      b.addEventListener('click', () => { on[k] = !on[k]; b.className = 'bigo-chipbtn ' + (on[k] ? 'on' : 'off'); draw(); });
      legend.appendChild(b);
    });

    let hoverN = null;
    function draw() {
      const Wc = canvas.width, Hc = canvas.height, P = 44;
      ctx.clearRect(0, 0, Wc, Hc);
      const active = keys.filter(k => on[k]);
      const yMax = Math.max(10, ...active.map(k => Math.min(CURVES[k].f(maxN), 1e7)));
      const xTo = n => P + (n / maxN) * (Wc - P - 14);
      const yTo = v => Hc - P + 14 - (Math.min(v, yMax) / yMax) * (Hc - P - 28);

      // grid + axes
      ctx.strokeStyle = cssVar('--grid'); ctx.lineWidth = 1;
      ctx.font = '12px ' + cssVar('--mono'); ctx.fillStyle = cssVar('--ink-3');
      for (let i = 0; i <= 4; i++) {
        const y = yTo(yMax * i / 4);
        ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(Wc - 14, y); ctx.stroke();
        const v = yMax * i / 4;
        ctx.fillText(v >= 10000 ? v.toPrecision(2).replace(/\.0(?=e)/, '') : String(Math.round(v)), 4, y + 4);
      }
      for (let i = 0; i <= 5; i++) {
        const n = Math.round(maxN * i / 5);
        ctx.fillText(String(n), xTo(n) - 6, Hc - P + 32);
      }
      ctx.fillText('n →', Wc - 40, Hc - 6);

      // curves
      const usedLabelY = [];
      for (const k of active) {
        const c = CURVES[k];
        ctx.strokeStyle = cssVar(c.v); ctx.lineWidth = 2.5; ctx.beginPath();
        let started = false;
        for (let n = 0; n <= maxN; n += maxN / 400) {
          const v = c.f(n);
          if (v > yMax * 1.05) { if (started) break; else continue; }
          const x = xTo(n), y = yTo(v);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // direct label at line end
        let lastN = maxN;
        while (c.f(lastN) > yMax && lastN > 1) lastN -= maxN / 100;
        ctx.fillStyle = cssVar(c.v); ctx.font = 'bold 12.5px ' + cssVar('--mono');
        // stagger direct labels so converging curves stay readable
        let ly = Math.max(yTo(c.f(lastN)) - 6, 14);
        while (usedLabelY.some(u => Math.abs(u - ly) < 15)) ly -= 15;
        usedLabelY.push(ly);
        ctx.fillText(c.lbl, Math.min(xTo(lastN) + 4, Wc - 74), ly);
      }

      // hover crosshair
      if (hoverN != null) {
        const x = xTo(hoverN);
        ctx.strokeStyle = cssVar('--ink-3'); ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(x, 14); ctx.lineTo(x, Hc - P + 14); ctx.stroke();
        ctx.setLineDash([]);
        const rows = active.map(k => `${CURVES[k].lbl}: ${Math.round(CURVES[k].f(hoverN)).toLocaleString()}`);
        const bw = 168, bh = rows.length * 18 + 30;
        const bx = Math.min(x + 12, Wc - bw - 8), by = 18;
        ctx.fillStyle = cssVar('--surface'); ctx.strokeStyle = cssVar('--border-strong');
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = cssVar('--ink'); ctx.font = 'bold 12px ' + cssVar('--mono');
        ctx.fillText('n = ' + Math.round(hoverN), bx + 10, by + 18);
        ctx.font = '12px ' + cssVar('--mono'); ctx.fillStyle = cssVar('--ink-2');
        rows.forEach((r, i) => ctx.fillText(r, bx + 10, by + 36 + i * 18));
      }
    }
    slider.addEventListener('input', () => { maxN = +slider.value; nval.textContent = maxN; draw(); });
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * (canvas.width / r.width);
      hoverN = Math.max(0, Math.min(maxN, ((x - 44) / (canvas.width - 44 - 14)) * maxN));
      draw();
    });
    canvas.addEventListener('mouseleave', () => { hoverN = null; draw(); });
    window.addEventListener('ct-theme', draw);
    draw();
    ph.replaceWith(el);
  };

  /* ---------- quiz ---------- */
  W.quiz = (ph, cfg, lesson, key) => {
    /* Stable id from the widget's data-w key (formerly a session-order
       counter, which shuffled ids between visits — checkmarks vanished
       and XP could be re-farmed). */
    const qid = (lesson ? lesson.id : 'x') + ':' + (cfg.id || key || (cfg.q || '').slice(0, 40));
    if (!CT.state.quizzes[qid] && lesson) {
      // one-time migration of legacy counter-based ids: "<lesson>:<n>:<first 40 chars of q>"
      const tail = ':' + (cfg.q || '').slice(0, 40);
      const old = Object.keys(CT.state.quizzes).find(k => k.startsWith(lesson.id + ':') && k.endsWith(tail) && /:\d+:/.test(k));
      if (old) { CT.state.quizzes[qid] = CT.state.quizzes[old]; delete CT.state.quizzes[old]; CT.save(); }
    }
    const el = $make('widget quiz');
    const keys = 'ABCD';
    el.innerHTML = `<div class="widget-title">Checkpoint ${CT.state.quizzes[qid] ? '<span class="quiz-xp">✓ earned</span>' : `<span class="quiz-xp">+${cfg.xp || 20} XP</span>`}</div>
      <div class="quiz-q">${cfg.q}</div>
      <div class="quiz-opts">${cfg.opts.map((o, i) => `<button class="quiz-opt" data-i="${i}"><span class="q-key">${keys[i]}</span><span>${o}</span></button>`).join('')}</div>
      <div class="quiz-expl">${cfg.expl || ''}</div>`;
    const expl = el.querySelector('.quiz-expl');
    el.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        if (i === cfg.a) {
          el.querySelectorAll('.quiz-opt').forEach(b => b.setAttribute('disabled', ''));
          btn.classList.add('correct');
          if (cfg.expl) expl.classList.add('show');
          if (CT.quizCorrect(qid, cfg.xp || 20)) {
            CT.toast(`✅ Correct! +${cfg.xp || 20} XP`, 'xp', 2200);
          }
          if (cfg.onCorrect) cfg.onCorrect();
        } else {
          btn.classList.add('wrong');
          btn.setAttribute('disabled', '');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      });
    });
    ph.replaceWith(el);
  };

  /* ---------- step-through trace ---------- */
  W.trace = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Step through it')}</div>
      <div class="trace">
        <div class="t-code"></div>
        <div class="trace-state">
          <div class="trace-note"></div>
          <div class="trace-vars"><table><thead><tr><th>variable</th><th>value</th></tr></thead><tbody></tbody></table></div>
          <div><div class="widget-title" style="margin:4px 0 6px">output</div><div class="trace-out"></div></div>
        </div>
      </div>
      <div class="trace-ctl">
        <button class="btn t-restart" title="Restart">⟲</button>
        <button class="btn t-prev">← Back</button>
        <button class="btn primary t-next">Step →</button>
        <span class="step-n"></span>
      </div>`;
    const codeHost = el.querySelector('.t-code');
    const noteEl = el.querySelector('.trace-note'), varsBody = el.querySelector('tbody'), outEl = el.querySelector('.trace-out');
    const stepN = el.querySelector('.step-n');
    let si = 0, prevVars = {};

    function renderCode(line) {
      codeHost.innerHTML = '';
      const cb = CT.codeBlock(cfg.code, { title: cfg.title || 'trace.c', run: false, hl: line ? [line] : [] });
      codeHost.appendChild(cb);
    }
    function render() {
      const st = cfg.steps[si];
      renderCode(st.line);
      noteEl.innerHTML = st.note || '';
      varsBody.innerHTML = '';
      const vars = st.vars || {};
      Object.keys(vars).forEach(k => {
        const changed = prevVars[k] !== undefined && prevVars[k] !== vars[k];
        const isNew = prevVars[k] === undefined && si > 0;
        varsBody.innerHTML += `<tr><td>${CT.esc(k)}</td><td class="${changed || isNew ? 'changed' : ''}">${CT.esc(String(vars[k]))}</td></tr>`;
      });
      if (!Object.keys(vars).length) varsBody.innerHTML = '<tr><td colspan="2" style="color:var(--ink-3)">—</td></tr>';
      outEl.textContent = st.out || '';
      stepN.textContent = `step ${si + 1} / ${cfg.steps.length}`;
      el.querySelector('.t-prev').disabled = si === 0;
      el.querySelector('.t-next').disabled = si === cfg.steps.length - 1;
      prevVars = Object.assign({}, vars);
    }
    el.querySelector('.t-next').addEventListener('click', () => { if (si < cfg.steps.length - 1) { si++; render(); } });
    el.querySelector('.t-prev').addEventListener('click', () => { if (si > 0) { prevVars = {}; si--; render(); } });
    el.querySelector('.t-restart').addEventListener('click', () => { si = 0; prevVars = {}; render(); });
    render();
    ph.replaceWith(el);
  };

  /* ---------- array algorithm visualizer ---------- */
  W.arrayviz = (ph, cfg) => {
    const N = cfg.n || 18;
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Watch it run')}</div>
      <div class="av-bars" style="display:flex;align-items:flex-end;gap:3px;height:170px;padding:4px 0"></div>
      <div class="trace-note av-note" style="margin-top:10px"></div>
      <div class="trace-ctl">
        <button class="btn av-shuffle">🔀 Shuffle</button>
        <button class="btn primary av-play">▶ Play</button>
        <button class="btn av-step">Step</button>
        <span class="step-n av-cmp"></span>
      </div>`;
    const barsEl = el.querySelector('.av-bars'), note = el.querySelector('.av-note'), cmpEl = el.querySelector('.av-cmp');
    let arr = [], frames = [], fi = 0, timer = null;

    function genFrames() {
      frames = []; let cmp = 0;
      const a = arr.slice();
      const push = (hl, note2, done) => frames.push({ a: a.slice(), hl: hl || [], note: note2 || '', cmp, done: done || [] });
      const algo = cfg.algo || 'bubble';
      const doneIdx = [];
      if (algo === 'bubble') {
        push(null, 'Bubble sort: repeatedly swap adjacent pairs that are out of order.');
        for (let i = 0; i < a.length - 1; i++) {
          for (let j = 0; j < a.length - 1 - i; j++) {
            cmp++;
            push([j, j + 1], `Compare a[${j}] and a[${j + 1}]`, doneIdx.slice());
            if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; push([j, j + 1], 'Out of order — swap!', doneIdx.slice()); }
          }
          doneIdx.push(a.length - 1 - i);
          push([], `Largest of the rest has bubbled to position ${a.length - 1 - i} ✔`, doneIdx.slice());
        }
        push([], 'Sorted! Notice how many comparisons that took — that’s O(n²).', a.map((_, i) => i));
      } else if (algo === 'insertion') {
        push(null, 'Insertion sort: grow a sorted prefix, inserting each new element into place.');
        for (let i = 1; i < a.length; i++) {
          let j = i;
          push([i], `Take a[${i}] — find where it belongs on the left.`);
          while (j > 0 && (cmp++, a[j - 1] > a[j])) {
            [a[j - 1], a[j]] = [a[j], a[j - 1]];
            push([j - 1, j], 'Shift it left…');
            j--;
          }
        }
        push([], 'Sorted! Nearly-sorted input makes this fast — best case O(n).', a.map((_, i) => i));
      } else if (algo === 'selection') {
        push(null, 'Selection sort: find the minimum of the rest, swap it to the front.');
        for (let i = 0; i < a.length - 1; i++) {
          let m = i;
          for (let j = i + 1; j < a.length; j++) { cmp++; push([m, j], `Is a[${j}] smaller than the current minimum?`, doneIdx.slice()); if (a[j] < a[m]) m = j; }
          [a[i], a[m]] = [a[m], a[i]];
          doneIdx.push(i);
          push([i], `Swap minimum into position ${i} ✔`, doneIdx.slice());
        }
        push([], 'Sorted — always exactly n(n−1)/2 comparisons: Θ(n²) in every case.', a.map((_, i) => i));
      } else if (algo === 'quick') {
        push(null, 'Quicksort: pick a pivot, partition smaller|larger, recurse.');
        (function qs(lo, hi) {
          if (lo >= hi) { if (lo === hi) doneIdx.push(lo); return; }
          const p = a[hi];
          push([hi], `Pivot = ${p} (last element of this slice)`, doneIdx.slice());
          let i = lo - 1;
          for (let j = lo; j < hi; j++) {
            cmp++;
            push([j, hi], `Compare a[${j}] with pivot ${p}`, doneIdx.slice());
            if (a[j] < p) { i++; [a[i], a[j]] = [a[j], a[i]]; if (i !== j) push([i, j], 'Smaller than pivot — move it left of the boundary.', doneIdx.slice()); }
          }
          [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
          doneIdx.push(i + 1);
          push([i + 1], 'Pivot lands in its final spot ✔ — recurse on both sides.', doneIdx.slice());
          qs(lo, i); qs(i + 2, hi);
        })(0, a.length - 1);
        push([], 'Sorted! Average O(n log n) — the pivot splits work roughly in half.', a.map((_, i) => i));
      } else if (algo === 'binary-search') {
        a.sort((x, y) => x - y);
        const target = cfg.target != null ? cfg.target : a[(Math.random() * a.length) | 0];
        push(null, `Array is sorted. Searching for ${target} — watch the range halve each step.`);
        let lo = 0, hi = a.length - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          cmp++;
          push([mid], `lo=${lo} hi=${hi} → check middle a[${mid}] = ${a[mid]}`, rangeOutside(lo, hi, a.length));
          if (a[mid] === target) { push([mid], `Found ${target} at index ${mid} in ${cmp} steps! log₂(${a.length}) ≈ ${Math.ceil(Math.log2(a.length))}.`, rangeOutside(lo, hi, a.length)); return; }
          if (a[mid] < target) { lo = mid + 1; push([], `${a[mid]} < ${target} — discard the left half.`, rangeOutside(lo, hi, a.length)); }
          else { hi = mid - 1; push([], `${a[mid]} > ${target} — discard the right half.`, rangeOutside(lo, hi, a.length)); }
        }
        push([], `${target} is not in the array — decided in only ${cmp} comparisons.`, []);
      } else if (algo === 'linear-search') {
        const target = cfg.target != null ? cfg.target : a[a.length - 3];
        push(null, `Searching for ${target} the honest way: one by one.`);
        for (let i = 0; i < a.length; i++) {
          cmp++;
          push([i], `Is a[${i}] = ${a[i]} the target?`);
          if (a[i] === target) { push([i], `Found it at index ${i} after ${cmp} looks. Worst case: all n.`); return; }
        }
        push([], 'Not found — had to look at every single element: O(n).');
      }
      function rangeOutside(lo, hi, n) { const d = []; for (let k = 0; k < n; k++) if (k < lo || k > hi) d.push(k); return d; }
    }

    function shuffle() {
      arr = Array.from({ length: N }, (_, i) => 8 + Math.round(92 * (i + 1) / N));
      for (let i = arr.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
      stop(); genFrames(); fi = 0; render();
    }
    function render() {
      const f = frames[fi];
      barsEl.innerHTML = '';
      f.a.forEach((v, i) => {
        const b = document.createElement('div');
        b.style.cssText = `flex:1;border-radius:4px 4px 2px 2px;height:${v}%;transition:height .18s;background:${f.hl.includes(i) ? 'var(--orange)' : (f.done || []).includes(i) ? 'var(--good)' : 'var(--accent)'}`;
        barsEl.appendChild(b);
      });
      note.innerHTML = f.note || ' ';
      cmpEl.textContent = `comparisons: ${f.cmp}  ·  frame ${fi + 1}/${frames.length}`;
    }
    function step() { if (fi < frames.length - 1) { fi++; render(); } else stop(); }
    function stop() { if (timer) { clearInterval(timer); timer = null; el.querySelector('.av-play').textContent = '▶ Play'; } }
    el.querySelector('.av-shuffle').addEventListener('click', shuffle);
    el.querySelector('.av-step').addEventListener('click', () => { stop(); step(); });
    el.querySelector('.av-play').addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (fi >= frames.length - 1) fi = 0;
      this.textContent = '⏸ Pause';
      timer = setInterval(step, cfg.speed || 260);
    });
    shuffle();
    ph.replaceWith(el);
  };

  /* ---------- comparison / reveal cards ---------- */
  W.reveal = (ph, cfg) => {
    const el = $make('widget');
    el.innerHTML = `<div class="widget-title">${CT.esc(cfg.label || 'Think first, then reveal')}</div>
      <div class="quiz-q">${cfg.q}</div>
      <button class="btn primary">Reveal answer</button>
      <div class="quiz-expl">${cfg.answer}</div>`;
    el.querySelector('button').addEventListener('click', function () {
      el.querySelector('.quiz-expl').classList.add('show');
      this.style.display = 'none';
    });
    ph.replaceWith(el);
  };
})();
