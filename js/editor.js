/* ============================================================
   editor.js — code editor with C autocomplete.
   CT.makeEditor(container, { code, height, run, outputEl })
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- completion database ---------------- */
  const KW = ['auto','break','case','char','const','continue','default','do','double','else','enum','extern','float','for','goto','if','inline','int','long','register','restrict','return','short','signed','sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while','_Bool','_Static_assert','_Alignas','_Alignof','_Atomic','_Generic','_Noreturn','_Thread_local','bool','true','false','nullptr','constexpr','typeof','static_assert','alignas','alignof','thread_local'];
  const TY = ['size_t','ptrdiff_t','int8_t','int16_t','int32_t','int64_t','uint8_t','uint16_t','uint32_t','uint64_t','intptr_t','uintptr_t','intmax_t','uintmax_t','FILE','va_list','time_t','clock_t','wchar_t'];
  const MAC = ['NULL','EOF','EXIT_SUCCESS','EXIT_FAILURE','INT_MAX','INT_MIN','UINT_MAX','LONG_MAX','CHAR_BIT','SIZE_MAX','DBL_MAX','FLT_EPSILON','RAND_MAX','stdin','stdout','stderr','__FILE__','__LINE__','__func__','__STDC_VERSION__'];
  const FNS = [
    ['printf', '(const char *fmt, ...)', 'Print formatted output to stdout.'],
    ['fprintf', '(FILE *f, const char *fmt, ...)', 'Print formatted output to a stream.'],
    ['sprintf', '(char *buf, const char *fmt, ...)', 'Print formatted output into a string (prefer snprintf).'],
    ['snprintf', '(char *buf, size_t n, const char *fmt, ...)', 'Bounded formatted print into a string.'],
    ['scanf', '(const char *fmt, ...)', 'Read formatted input from stdin.'],
    ['fscanf', '(FILE *f, const char *fmt, ...)', 'Read formatted input from a stream.'],
    ['sscanf', '(const char *s, const char *fmt, ...)', 'Read formatted input from a string.'],
    ['puts', '(const char *s)', 'Write a string + newline to stdout.'],
    ['putchar', '(int c)', 'Write one character to stdout.'],
    ['getchar', '(void)', 'Read one character from stdin.'],
    ['fgets', '(char *buf, int n, FILE *f)', 'Read a line (bounded) from a stream.'],
    ['fopen', '(const char *path, const char *mode)', 'Open a file; returns FILE* or NULL.'],
    ['fclose', '(FILE *f)', 'Close an open file.'],
    ['fread', '(void *p, size_t sz, size_t n, FILE *f)', 'Read binary data from a stream.'],
    ['fwrite', '(const void *p, size_t sz, size_t n, FILE *f)', 'Write binary data to a stream.'],
    ['fseek', '(FILE *f, long off, int whence)', 'Move the file position.'],
    ['malloc', '(size_t size)', 'Allocate uninitialized heap memory.'],
    ['calloc', '(size_t n, size_t size)', 'Allocate zeroed heap memory for n items.'],
    ['realloc', '(void *p, size_t size)', 'Resize a heap allocation.'],
    ['free', '(void *p)', 'Release heap memory. Never free twice!'],
    ['exit', '(int status)', 'Terminate the program.'],
    ['abort', '(void)', 'Abnormal termination (raises SIGABRT).'],
    ['atoi', '(const char *s)', 'String → int (no error detection; prefer strtol).'],
    ['strtol', '(const char *s, char **end, int base)', 'String → long with error detection.'],
    ['rand', '(void)', 'Pseudo-random number in [0, RAND_MAX].'],
    ['srand', '(unsigned seed)', 'Seed the random generator.'],
    ['qsort', '(void *base, size_t n, size_t sz, int (*cmp)(const void*, const void*))', 'Sort an array with your comparator.'],
    ['bsearch', '(const void *key, const void *base, size_t n, size_t sz, cmp)', 'Binary search a sorted array.'],
    ['strlen', '(const char *s)', 'Length of a string (not counting \\0).'],
    ['strcpy', '(char *dst, const char *src)', 'Copy a string (unbounded — beware).'],
    ['strncpy', '(char *dst, const char *src, size_t n)', 'Bounded string copy (may not NUL-terminate!).'],
    ['strcat', '(char *dst, const char *src)', 'Append src to dst.'],
    ['strcmp', '(const char *a, const char *b)', 'Compare strings: <0, 0, >0.'],
    ['strncmp', '(const char *a, const char *b, size_t n)', 'Compare at most n chars.'],
    ['strchr', '(const char *s, int c)', 'Find first occurrence of a char.'],
    ['strstr', '(const char *hay, const char *needle)', 'Find a substring.'],
    ['strtok', '(char *s, const char *delims)', 'Tokenize a string (stateful, modifies s).'],
    ['memcpy', '(void *dst, const void *src, size_t n)', 'Copy n bytes (no overlap allowed).'],
    ['memmove', '(void *dst, const void *src, size_t n)', 'Copy n bytes, overlap-safe.'],
    ['memset', '(void *p, int byte, size_t n)', 'Fill n bytes with a value.'],
    ['memcmp', '(const void *a, const void *b, size_t n)', 'Compare n bytes.'],
    ['sqrt', '(double x)', 'Square root. <math.h>, link -lm.'],
    ['pow', '(double x, double y)', 'x raised to power y.'],
    ['fabs', '(double x)', 'Absolute value of a double.'],
    ['floor', '(double x)', 'Round down.'], ['ceil', '(double x)', 'Round up.'],
    ['abs', '(int x)', 'Absolute value of an int. <stdlib.h>'],
    ['isdigit', '(int c)', 'Is c a decimal digit? <ctype.h>'],
    ['isalpha', '(int c)', 'Is c a letter? <ctype.h>'],
    ['toupper', '(int c)', 'Uppercase a character.'], ['tolower', '(int c)', 'Lowercase a character.'],
    ['assert', '(expr)', 'Abort if expr is false (unless NDEBUG). <assert.h>'],
    ['time', '(time_t *t)', 'Seconds since the epoch. <time.h>'],
    ['clock', '(void)', 'CPU time used; divide by CLOCKS_PER_SEC.'],
    ['perror', '(const char *msg)', 'Print msg + human-readable errno.'],
  ];
  const SNIPPETS = [
    ['main', 'int main(void) {\n    $0\n    return 0;\n}', 'main function skeleton'],
    ['maina', 'int main(int argc, char *argv[]) {\n    $0\n    return 0;\n}', 'main with arguments'],
    ['for', 'for (int i = 0; i < $0; i++) {\n\n}', 'for loop'],
    ['while', 'while ($0) {\n\n}', 'while loop'],
    ['dowhile', 'do {\n    $0\n} while ();', 'do-while loop'],
    ['if', 'if ($0) {\n\n}', 'if statement'],
    ['ifelse', 'if ($0) {\n\n} else {\n\n}', 'if / else'],
    ['switch', 'switch ($0) {\ncase 1:\n    break;\ndefault:\n    break;\n}', 'switch statement'],
    ['func', 'int name($0) {\n\n    return 0;\n}', 'function definition'],
    ['struct', 'struct name {\n    $0\n};', 'struct definition'],
    ['enum', 'enum name { $0 };', 'enum definition'],
    ['inc', '#include <stdio.h>$0', '#include stdio'],
    ['guard', '#ifndef HEADER_H\n#define HEADER_H\n\n$0\n\n#endif /* HEADER_H */', 'header include guard'],
    ['pf', 'printf("$0\\n");', 'printf with newline'],
    ['mal', 'int *p = malloc(n * sizeof *p);\nif (p == NULL) { $0 }', 'checked malloc'],
  ];

  const ITEMS = [
    ...KW.map(k => ({ label: k, kind: 'kw', insert: k, doc: 'C keyword' })),
    ...TY.map(t => ({ label: t, kind: 'ty', insert: t, doc: 'standard type' })),
    ...MAC.map(m => ({ label: m, kind: 'mac', insert: m, doc: 'standard macro / object' })),
    ...FNS.map(([n, sig, doc]) => ({ label: n, kind: 'fn', sig, insert: n + '(', close: ')', doc })),
    ...SNIPPETS.map(([n, body, doc]) => ({ label: n, kind: 'snip', snippet: body, doc: '▶ ' + doc })),
  ];

  /* ---------------- editor factory ---------------- */
  let chw = null;
  function charWidth(font) {
    const c = document.createElement('canvas').getContext('2d');
    c.font = font;
    return c.measureText('M'.repeat(50)).width / 50;
  }

  CT.makeEditor = function (container, opts) {
    opts = opts || {};
    const ed = document.createElement('div');
    ed.className = 'ced';
    if (opts.height) ed.style.height = opts.height + 'px';
    ed.innerHTML = `
      <div class="ced-head"><span class="cb-dots"><i></i><i></i><i></i></span>
        <span>${CT.esc(opts.title || 'main.c')}</span>
        <span class="cb-actions">
          ${opts.run ? '<button class="cb-btn ced-run">▶ Run</button>' : ''}
          ${opts.run && opts.asm !== false ? '<button class="cb-btn ced-asm" title="See the x86-64 assembly gcc generates for this code (-O1)">⚙ ASM</button>' : ''}
          <button class="cb-btn ced-reset">Reset</button>
        </span></div>
      <div class="ced-body"><div class="ced-scroll">
        <div class="ced-gutter"></div>
        <pre class="ced-hl"><code></code></pre>
        <textarea class="ced-input" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="C code editor"></textarea>
      </div></div>
      <div class="ced-ac"></div>
      <div class="ced-status"><span class="pos">Ln 1, Col 1</span><span>C</span><span class="right">Ctrl+Space: autocomplete · Tab: indent</span></div>`;
    container.appendChild(ed);

    const ta = ed.querySelector('.ced-input');
    const hlEl = ed.querySelector('.ced-hl code');
    const pre = ed.querySelector('.ced-hl');
    const gutter = ed.querySelector('.ced-gutter');
    const body = ed.querySelector('.ced-body');
    const ac = ed.querySelector('.ced-ac');
    const posEl = ed.querySelector('.pos');
    const initialCode = opts.code || '';
    ta.value = initialCode;

    let acItems = [], acSel = 0, acFrom = 0;

    function lines() { return ta.value.split('\n'); }

    function sync() {
      hlEl.innerHTML = CT.hl(ta.value) + '\n';
      const n = lines().length;
      gutter.innerHTML = Array.from({ length: n }, (_, i) => `<div>${i + 1}</div>`).join('');
      // size the textarea to the rendered pre so scrolling stays in lockstep
      ta.style.width = Math.max(pre.scrollWidth, body.clientWidth) + 'px';
      ta.style.height = Math.max(pre.scrollHeight, body.clientHeight) + 'px';
      updatePos();
      if (opts.onChange) opts.onChange(ta.value);
    }
    function updatePos() {
      const upto = ta.value.slice(0, ta.selectionStart);
      const ls = upto.split('\n');
      posEl.textContent = `Ln ${ls.length}, Col ${ls[ls.length - 1].length + 1}`;
    }

    /* ---------- autocomplete ---------- */
    function wordBefore() {
      const i = ta.selectionStart;
      const before = ta.value.slice(0, i);
      const m = before.match(/[A-Za-z_#][A-Za-z0-9_]*$/);
      return m ? { word: m[0], from: i - m[0].length } : null;
    }
    function bufferIdents() {
      const ids = new Set();
      (ta.value.match(/\b[A-Za-z_][A-Za-z0-9_]{2,}\b/g) || []).forEach(w => {
        if (!KW.includes(w)) ids.add(w);
      });
      return [...ids];
    }
    function openAC(force) {
      const wb = wordBefore();
      if (!wb || (!force && wb.word.length < 2)) { closeAC(); return; }
      const q = wb.word.toLowerCase();
      const seen = new Set();
      const pool = [
        ...ITEMS,
        ...bufferIdents().filter(w => w.toLowerCase() !== q).map(w => ({ label: w, kind: 'var', insert: w, doc: 'identifier in this file' })),
      ];
      acItems = pool
        .filter(it => it.label.toLowerCase().startsWith(q) && it.label !== wb.word && !seen.has(it.label) && seen.add(it.label))
        .slice(0, 12);
      if (!acItems.length) { closeAC(); return; }
      acSel = 0; acFrom = wb.from;
      renderAC(wb.word);
      positionAC();
    }
    function renderAC(q) {
      ac.innerHTML = acItems.map((it, i) => `
        <div class="ac-item ${i === acSel ? 'sel' : ''}" data-i="${i}">
          <span class="ac-kind k-${it.kind}">${{ kw: 'K', fn: 'ƒ', ty: 'T', mac: 'M', snip: 'S', var: 'v' }[it.kind]}</span>
          <span class="ac-label"><b>${CT.esc(it.label.slice(0, q.length))}</b>${CT.esc(it.label.slice(q.length))}</span>
          ${it.sig ? `<span class="ac-sig">${CT.esc(it.sig)}</span>` : ''}
        </div>`).join('') +
        `<div class="ac-doc">${CT.esc(acItems[acSel].doc || '')}</div>`;
      ac.classList.add('show');
      ac.querySelectorAll('.ac-item').forEach(item => {
        item.addEventListener('mousedown', e => { e.preventDefault(); acSel = +item.dataset.i; accept(); });
      });
      const sel = ac.querySelector('.ac-item.sel');
      if (sel) sel.scrollIntoView({ block: 'nearest' });
    }
    function positionAC() {
      if (!chw) chw = charWidth(getComputedStyle(ta).font);
      const upto = ta.value.slice(0, acFrom);
      const ls = upto.split('\n');
      const line = ls.length - 1, col = ls[ls.length - 1].length;
      const lh = parseFloat(getComputedStyle(ta).lineHeight);
      const headH = ed.querySelector('.ced-head').offsetHeight;
      const x = 60 + col * chw - body.scrollLeft;
      const y = headH + (line + 1) * lh + 14 - body.scrollTop;
      ac.style.left = Math.min(x, ed.clientWidth - 280) + 'px';
      ac.style.top = Math.min(y, ed.clientHeight - 120) + 'px';
    }
    function closeAC() { ac.classList.remove('show'); acItems = []; }
    function accept() {
      const it = acItems[acSel];
      if (!it) return;
      const end = ta.selectionStart;
      let text, caret;
      if (it.snippet) {
        // indent snippet body to current indentation
        const lineStart = ta.value.lastIndexOf('\n', acFrom - 1) + 1;
        const indent = (ta.value.slice(lineStart).match(/^[ \t]*/) || [''])[0];
        const bodyTxt = it.snippet.replace(/\n/g, '\n' + indent);
        const cur = bodyTxt.indexOf('$0');
        text = bodyTxt.replace('$0', '');
        caret = acFrom + (cur >= 0 ? cur : text.length);
      } else {
        text = it.insert + (it.close || '');
        caret = acFrom + it.insert.length + (it.close ? 0 : 0);
      }
      ta.setRangeText(text, acFrom, end, 'end');
      ta.selectionStart = ta.selectionEnd = caret;
      closeAC(); sync();
      ta.focus();
    }

    /* ---------- key handling ---------- */
    const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    ta.addEventListener('keydown', e => {
      if (ac.classList.contains('show')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); acSel = (acSel + 1) % acItems.length; renderAC(wordBefore().word); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); acSel = (acSel - 1 + acItems.length) % acItems.length; renderAC(wordBefore().word); return; }
        if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); accept(); return; }
        if (e.key === 'Escape') { closeAC(); return; }
      }
      if (e.key === ' ' && e.ctrlKey) { e.preventDefault(); openAC(true); return; }
      if (e.key === 'Tab') {
        e.preventDefault();
        ta.setRangeText('    ', ta.selectionStart, ta.selectionEnd, 'end');
        sync(); return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const i = ta.selectionStart;
        const lineStart = ta.value.lastIndexOf('\n', i - 1) + 1;
        const indent = (ta.value.slice(lineStart).match(/^[ \t]*/) || [''])[0];
        const prevCh = ta.value[i - 1], nextCh = ta.value[i];
        if (prevCh === '{' && nextCh === '}') {
          ta.setRangeText('\n' + indent + '    \n' + indent, i, i, 'start');
          ta.selectionStart = ta.selectionEnd = i + 1 + indent.length + 4;
        } else {
          const extra = prevCh === '{' ? '    ' : '';
          ta.setRangeText('\n' + indent + extra, i, ta.selectionEnd, 'end');
        }
        sync(); return;
      }
      if (PAIRS[e.key] && ta.selectionStart === ta.selectionEnd) {
        const nxt = ta.value[ta.selectionStart];
        if (e.key === '"' || e.key === "'") {
          if (nxt === e.key) { e.preventDefault(); ta.selectionStart = ta.selectionEnd = ta.selectionStart + 1; sync(); return; }
        }
        if (!nxt || /[\s)\]};,]/.test(nxt)) {
          e.preventDefault();
          ta.setRangeText(e.key + PAIRS[e.key], ta.selectionStart, ta.selectionEnd, 'start');
          ta.selectionStart = ta.selectionEnd = ta.selectionStart + 1;
          sync(); return;
        }
      }
      if ((e.key === ')' || e.key === ']' || e.key === '}') && ta.value[ta.selectionStart] === e.key) {
        e.preventDefault();
        ta.selectionStart = ta.selectionEnd = ta.selectionStart + 1;
        sync(); return;
      }
      if (e.key === 'Backspace' && ta.selectionStart === ta.selectionEnd) {
        const a = ta.value[ta.selectionStart - 1], b = ta.value[ta.selectionStart];
        if (a && PAIRS[a] === b) {
          e.preventDefault();
          ta.setRangeText('', ta.selectionStart - 1, ta.selectionStart + 1, 'start');
          sync(); openAC(); return;
        }
      }
    });
    ta.addEventListener('input', () => { sync(); openAC(); });
    ta.addEventListener('click', () => { closeAC(); updatePos(); });
    ta.addEventListener('keyup', e => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) { closeAC(); updatePos(); }
    });
    ta.addEventListener('blur', () => setTimeout(closeAC, 150));
    body.addEventListener('scroll', () => { if (ac.classList.contains('show')) positionAC(); });

    ed.querySelector('.ced-reset').addEventListener('click', () => { ta.value = initialCode; sync(); });

    /* ---------- run ---------- */
    let outPanel = null;
    async function run() {
      const btn = ed.querySelector('.ced-run');
      let out = opts.outputEl;
      if (!out) {
        if (!outPanel) {
          outPanel = document.createElement('div');
          outPanel.className = 'pg-out';
          outPanel.style.marginTop = '10px';
          outPanel.innerHTML = `<div class="cb-head">output</div><pre></pre>`;
          container.appendChild(outPanel);
        }
        out = outPanel.querySelector('pre');
      }
      btn.textContent = '⏳ Running…'; btn.disabled = true;
      out.innerHTML = '<span class="dim">Compiling with gcc in the cloud…</span>';
      try {
        const stdin = typeof opts.stdin === 'function' ? opts.stdin() : (opts.stdin || '');
        const res = await CT.runC(ta.value, stdin);
        let html = '';
        if (res.compileErr) html += `<span class="err">${CT.esc(res.compileErr)}</span>\n`;
        if (res.stdout) html += CT.esc(res.stdout);
        if (res.stderr) html += `<span class="err">${CT.esc(res.stderr)}</span>`;
        if (!html) html = '<span class="dim">(program produced no output)</span>';
        html += `\n<span class="${res.code === 0 ? 'ok' : 'err'}">— exited with code ${res.code}</span>`;
        out.innerHTML = html;
        if (opts.onRun) opts.onRun(res);
      } catch (err) {
        out.innerHTML = compileFailHtml(err);
      }
      btn.textContent = '▶ Run'; btn.disabled = false;
    }
    const runBtn = ed.querySelector('.ced-run');
    if (runBtn) runBtn.addEventListener('click', run);

    /* ---------- assembly panel ---------- */
    let asmPanel = null, asmShownFor = null;
    async function toggleAsm() {
      const btn = ed.querySelector('.ced-asm');
      if (asmPanel && !asmPanel.hidden && asmShownFor === ta.value) { asmPanel.hidden = true; return; }
      if (!asmPanel) {
        asmPanel = document.createElement('div');
        asmPanel.className = 'asm-panel';
        asmPanel.innerHTML = `<div class="cb-head"><span class="cb-dots"><i></i><i></i><i></i></span><span>x86-64 assembly · gcc -O1</span><span class="cb-actions"><button class="cb-btn asm-close">✕</button></span></div><pre></pre>`;
        asmPanel.querySelector('.asm-close').addEventListener('click', () => { asmPanel.hidden = true; });
        container.appendChild(asmPanel);
      }
      asmPanel.hidden = false;
      const pre = asmPanel.querySelector('pre');
      pre.innerHTML = '<span class="dim">Compiling to assembly…</span>';
      btn.disabled = true;
      try {
        const asm = await CT.compileAsm(ta.value);
        asmShownFor = ta.value;
        pre.innerHTML = asm
          ? CT.esc(asm)
              .replace(/^([A-Za-z_.$][\w.$]*:)/gm, '<span class="asm-label">$1</span>')
              .replace(/^(\s+)([a-z][a-z0-9.]*)/gm, '$1<span class="asm-op">$2</span>')
          : '<span class="dim">(no assembly — is there any code?)</span>';
      } catch (err) {
        pre.innerHTML = err.compileErr
          ? `<span class="err">${CT.esc(err.compileErr)}</span>`
          : compileFailHtml(err);
      }
      btn.disabled = false;
    }
    const asmBtn = ed.querySelector('.ced-asm');
    if (asmBtn) asmBtn.addEventListener('click', toggleAsm);
    ta.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && opts.run) { e.preventDefault(); run(); }
    });

    sync();
    return {
      getCode: () => ta.value,
      setCode: v => { ta.value = v; sync(); },
      focus: () => ta.focus(),
      run,
      el: ed,
    };
  };

  /* ---------- friendly failure messages ---------- */
  function compileFailHtml(err) {
    if (err && err.busy)
      return `<span class="err">The compile service is busy (rate limited).</span>\n<span class="dim">godbolt.org kindly compiles our C for free — give it a few seconds and press ▶ Run again.</span>`;
    if ((err && err.offline) || navigator.onLine === false)
      return `<span class="err">You appear to be offline.</span>\n<span class="dim">Everything else on this site works offline, but running C needs the internet — code is compiled with real gcc via the free Compiler Explorer API.</span>`;
    return `<span class="err">Couldn’t reach the compile service.</span>\n<span class="dim">Running C needs an internet connection (code is compiled with real gcc via the free Compiler Explorer API). Check your network and try again.</span>`;
  }

  /* ---------- cloud compile via Compiler Explorer (godbolt.org) ---------- */
  // Ordered fallback list — if a compiler id is retired (404), the next one is tried.
  CT.COMPILERS = ['cg151', 'cg143', 'cg132'];
  const lines = a => (a || []).map(l => String(l.text != null ? l.text : '').replace(/\x1b\[[0-9;]*[mK]/g, '')).join('\n');

  async function godbolt(cid, body) {
    const resp = await fetch(`https://godbolt.org/api/compiler/${cid}/compile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (resp.status === 429) { const e = new Error('rate limited'); e.busy = true; throw e; }
    if (resp.status === 404) { const e = new Error('compiler gone'); e.retired = true; throw e; }
    if (!resp.ok) throw new Error('compile service http ' + resp.status);
    return resp.json();
  }
  async function withFallback(makeBody) {
    if (navigator.onLine === false) { const e = new Error('offline'); e.offline = true; throw e; }
    let lastErr;
    for (const cid of CT.COMPILERS) {
      try { return await godbolt(cid, makeBody(cid)); }
      catch (err) {
        lastErr = err;
        if (err.busy) break;          // 429 — retrying other ids just hammers the same limiter
      }
    }
    throw lastErr;
  }

  CT.runC = async function (code, stdin) {
    const data = await withFallback(() => ({
      source: code,
      lang: 'c',
      allowStoreCodeDebug: false,
      options: {
        userArguments: '-lm',
        compilerOptions: { executorRequest: true },
        filters: { execute: true },
        executeParameters: { args: [], stdin: stdin || '' },
      },
    }));
    const build = data.buildResult || {};
    const buildFailed = build.code !== undefined && build.code !== 0;
    return {
      compileErr: lines(build.stderr) || (buildFailed ? 'Build failed' : ''),
      stdout: lines(data.stdout),
      stderr: buildFailed ? '' : lines(data.stderr),
      code: buildFailed ? build.code : (data.code != null ? data.code : 0),
    };
  };

  /* ---------- assembly view: the same code, compiled to x86-64 ---------- */
  CT.compileAsm = async function (code) {
    const data = await withFallback(() => ({
      source: code,
      lang: 'c',
      allowStoreCodeDebug: false,
      options: {
        userArguments: '-O1 -lm',
        filters: { commentOnly: true, directives: true, labels: true, intel: true, execute: false },
      },
    }));
    const asm = (data.asm || []).map(l => l.text != null ? l.text : '').join('\n');
    const err = lines((data.buildResult || {}).stderr) || lines(data.stderr);
    if (!asm && err) { const e = new Error('build failed'); e.compileErr = err; throw e; }
    return asm;
  };
})();
