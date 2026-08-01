/* ============================================================
   highlight.js — tiny regex-based C syntax highlighter.
   CT.hl(code) -> HTML string with .tok-* spans.
   ============================================================ */
(function () {
  'use strict';

  const KEYWORDS = new Set([
    'auto','break','case','char','const','continue','default','do','double','else','enum','extern',
    'float','for','goto','if','inline','int','long','register','restrict','return','short','signed',
    'sizeof','static','struct','switch','typedef','union','unsigned','void','volatile','while',
    '_Alignas','_Alignof','_Atomic','_Bool','_Complex','_Generic','_Imaginary','_Noreturn',
    '_Static_assert','_Thread_local','_BitInt','_Decimal128','_Decimal32','_Decimal64',
    'alignas','alignof','bool','constexpr','nullptr','static_assert','thread_local','typeof','typeof_unqual',
    'true','false','asm','__asm__','__attribute__','__typeof__','__inline__','__volatile__','__restrict__',
    'defined',
  ]);
  const TYPES = new Set([
    'size_t','ssize_t','ptrdiff_t','intptr_t','uintptr_t','wchar_t','char8_t','char16_t','char32_t',
    'int8_t','int16_t','int32_t','int64_t','uint8_t','uint16_t','uint32_t','uint64_t',
    'int_least8_t','uint_least8_t','int_fast8_t','uint_fast8_t','intmax_t','uintmax_t',
    'FILE','va_list','jmp_buf','sig_atomic_t','time_t','clock_t','div_t','ldiv_t','fpos_t',
    'atomic_int','atomic_bool','thrd_t','mtx_t','cnd_t','errno_t',
  ]);

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Tokenize with one master regex, longest-first alternatives.
  const RX = new RegExp([
    /\/\*[\s\S]*?\*\//.source,                       // block comment
    /\/\/[^\n]*/.source,                             // line comment
    /^[ \t]*#[a-zA-Z_]+/.source,                     // preprocessor directive (start of line)
    /"(?:\\.|[^"\\\n])*"/.source,                    // string
    /'(?:\\.|[^'\\\n])+'/.source,                    // char
    /\b0[xX][0-9a-fA-F']+(?:[uUlL]*)\b/.source,      // hex
    /\b0[bB][01']+(?:[uUlL]*)\b/.source,             // binary
    /\b(?:\d[\d']*\.?[\d']*(?:[eE][+-]?\d+)?|\.\d[\d']*)(?:[fFlLuU]*)\b/.source, // number
    /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/.source,      // function-ish
    /\b[A-Za-z_][A-Za-z0-9_]*\b/.source,             // identifier
  ].join('|'), 'gm');

  function classify(tok) {
    if (tok.startsWith('/*') || tok.startsWith('//')) return 'tok-com';
    if (/^[ \t]*#/.test(tok)) return 'tok-pre';
    if (tok[0] === '"' || tok[0] === "'") return 'tok-str';
    if (/^\.?\d|^0[xXbB]/.test(tok)) return 'tok-num';
    const bare = tok;
    if (KEYWORDS.has(bare)) return 'tok-kw';
    if (TYPES.has(bare)) return 'tok-type';
    if (/^[A-Z][A-Z0-9_]{1,}$/.test(bare)) return 'tok-pre';   // ALL_CAPS macros
    return null;
  }

  function hl(code) {
    let out = '', last = 0;
    code.replace(RX, (tok, ...args) => {
      const idx = args[args.length - 2];
      out += esc(code.slice(last, idx));
      let cls = classify(tok);
      // function-call heuristic: identifier followed by ( and not a keyword
      if (cls === null && /^[A-Za-z_]/.test(tok)) {
        const after = code.slice(idx + tok.length).match(/^\s*\(/);
        cls = after ? 'tok-fn' : null;
      }
      if (cls === 'tok-kw' || cls === 'tok-type') {
        // keep as classified even if followed by (  (e.g. sizeof(x))
      }
      out += cls ? `<span class="${cls}">${esc(tok)}</span>` : esc(tok);
      last = idx + tok.length;
      return tok;
    });
    out += esc(code.slice(last));
    return out;
  }

  window.CT.hl = hl;

  /* Build a standard code block element.
     opts: { title, run (bool: open-in-playground button), hl: [lineNumbers…] } */
  window.CT.codeBlock = function (code, opts) {
    opts = opts || {};
    code = code.replace(/^\n+|\s+$/g, '');
    let html = hl(code);
    if (opts.hl && opts.hl.length) {
      const lines = html.split('\n');
      html = lines.map((l, i) => opts.hl.includes(i + 1) ? `<span class="line-hl">${l}</span>` : l).join('\n');
    }
    const wrap = document.createElement('div');
    wrap.className = 'codeblock';
    wrap.innerHTML =
      `<div class="cb-head"><span class="cb-dots"><i></i><i></i><i></i></span>` +
      `<span>${CT.esc(opts.title || 'main.c')}</span>` +
      `<span class="cb-actions">` +
      (opts.run !== false ? `<button class="cb-btn act-try">▶ Try it</button>` : '') +
      `<button class="cb-btn act-copy">Copy</button></span></div>` +
      `<pre><code>${html}</code></pre>`;
    wrap.querySelector('.act-copy').addEventListener('click', (e) => {
      navigator.clipboard.writeText(code).then(() => {
        e.target.textContent = 'Copied!';
        setTimeout(() => e.target.textContent = 'Copy', 1400);
      });
    });
    const tryBtn = wrap.querySelector('.act-try');
    if (tryBtn) tryBtn.addEventListener('click', () => {
      CT.state.playgroundCode = code;
      CT.save();
      CT.navigate('#/playground');
    });
    return wrap;
  };
})();
