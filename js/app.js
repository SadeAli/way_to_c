/* ============================================================
   app.js — views, navigation, boot.
   ============================================================ */
(function () {
  'use strict';
  const C = window.CURRICULUM;
  const main = document.getElementById('main');

  /* ================= sidebar ================= */
  function totalLessons() { return C.parts.reduce((s, p) => s + p.lessons.length, 0); }
  function doneLessons() { return C.order().filter(id => CT.state.completed[id]).length; }

  function renderSidebar() {
    const sb = document.getElementById('sidebar');
    const cur = CT.currentPath();
    const done = doneLessons(), total = totalLessons();
    let html = `<div class="side-progress">
      <div class="bar"><div style="width:${Math.round(100 * done / total)}%"></div></div>
      <div class="lbl"><span>${done} / ${total} lessons</span><span>${Math.round(100 * done / total)}%</span></div></div>
      <div class="side-links">
        <a href="#/playground" class="${cur === '/playground' ? 'on' : ''}">⌨️ Playground</a>
        <a href="#/gotchas" class="${cur.startsWith('/gotchas') ? 'on' : ''}">🪤 Gotchas</a>
        <a href="#/daily" class="${cur === '/daily' ? 'on' : ''}">🗓️ Daily Bit${CT.dailyInfo && CT.dailyInfo().solved ? ' ✓' : ''}</a>
        <a href="#/cheatsheets" class="${cur === '/cheatsheets' ? 'on' : ''}">📋 Cheatsheets</a>
        <a href="#/reference" class="${cur === '/reference' ? 'on' : ''}">📖 Keywords</a>
        <a href="#/badges" class="${cur === '/badges' ? 'on' : ''}">🏅 Badges</a>
        <a href="#/support" class="${cur === '/support' || cur === '/books' ? 'on' : ''}">💛 Support</a>
      </div>`;
    C.parts.forEach((p, pi) => {
      const pdone = p.lessons.filter(id => CT.state.completed[id]).length;
      const isOpen = p.lessons.some(id => cur === '/lesson/' + id) || (openParts.has(p.id));
      html += `<div class="side-part ${isOpen ? 'open' : ''}" data-part="${p.id}">
        <button class="side-part-head">
          <span class="tw">▸</span><span class="part-emoji">${p.emoji}</span>
          <span>${CT.esc(p.title)}</span>
          <span class="part-count">${pdone}/${p.lessons.length}</span>
        </button>
        <div class="side-lessons">` +
        p.lessons.map(id => {
          const l = CT.lessons[id];
          const active = cur === '/lesson/' + id;
          return `<a class="side-lesson ${CT.state.completed[id] ? 'done' : ''} ${active ? 'active' : ''}" href="#/lesson/${id}">
            <span class="dot"></span><span>${CT.esc(l ? l.title : id)}</span></a>`;
        }).join('') +
        `</div></div>`;
    });
    sb.innerHTML = html;
    sb.querySelectorAll('.side-part-head').forEach(h => {
      h.addEventListener('click', () => {
        const part = h.parentElement;
        part.classList.toggle('open');
        if (part.classList.contains('open')) openParts.add(part.dataset.part);
        else openParts.delete(part.dataset.part);
      });
    });
    const act = sb.querySelector('.side-lesson.active');
    if (act) act.scrollIntoView({ block: 'nearest' });
  }
  const openParts = new Set(['p0']);

  /* ================= home ================= */
  const TASTE_C = '#include <stdio.h>\n\nint main(void) {\n    char *me = "YOUR NAME";\n    printf("Hi, %s!\\n", me);\n    printf("6*7=%d\\n", 6*7);\n    return 0;\n}';

  function countWidgets(type) {
    return Object.values(CT.lessons).reduce((s, l) => s + Object.values(l.widgets || {}).filter(w => w.type === type).length, 0);
  }

  function todayPanel(done, total, cont, contL) {
    const allDone = done === total;
    const ss = CT.streakStatus();
    const days = CT.state.streak.days, freezes = CT.state.streak.freezes || 0;
    const streakLine =
      ss === 'done' ? `🔥 <b>${days}-day streak</b> — safe for today ✓` :
      ss === 'at-risk' ? `🔥 <b>${days}-day streak</b> — answer one checkpoint today to keep it` :
      ss === 'freezable' ? `❄️ Yesterday slipped — solve anything today and a freeze saves your <b>${days}-day streak</b>` :
      `🔥 Solve one checkpoint today to start a streak`;
    const pct = Math.round(100 * done / total);
    const part = contL ? C.partOf(cont) : null;
    const pdone = part ? part.lessons.filter(id => CT.state.completed[id]).length : 0;
    const R = 30, CIRC = 2 * Math.PI * R;
    const main = allDone
      ? `<h2>👑 Course complete — Grandmaster of C</h2>
         <p class="today-sub">All ${total} lessons, done. Revisit a favorite, hunt some traps, or show off your badges.</p>
         <div class="today-ctas">
           <a class="btn primary" href="#/gotchas">🪤 C Gotchas gallery</a>
           <a class="btn" href="#/playground">⌨️ Playground</a>
           <a class="btn" href="#/badges">🏅 Badges</a>
         </div>`
      : `<h2>Continue: ${CT.esc(contL ? contL.title : cont)}</h2>
         ${part ? `<p class="today-sub">${part.emoji} ${CT.esc(part.title)} — ${pdone} of ${part.lessons.length} lessons done
           <span class="today-partbar"><span style="width:${Math.round(100 * pdone / part.lessons.length)}%"></span></span></p>` : ''}
         <div class="today-ctas">
           <a class="btn primary" href="#/lesson/${cont}">▶ Pick up where you left off</a>
           <a class="btn" href="#/daily">🗓️ Daily Bit${CT.dailyInfo && CT.dailyInfo().solved ? ' ✓' : ''}</a>
           <a class="btn" href="#/gotchas">🪤 Gotchas</a>
         </div>`;
    return `<div class="today">
      <div class="today-main">
        <div class="today-hi">Welcome back 👋</div>
        ${main}
        <div class="today-streak s-${ss}">${streakLine}${freezes ? ` <span class="t-freeze" title="Streak freezes cover a missed day. Earn more by leveling up.">❄️×${freezes}</span>` : ''}</div>
      </div>
      <div class="today-ring">
        <svg viewBox="0 0 76 76" width="108" height="108">
          <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--border-strong)" stroke-width="7"/>
          <circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round"
            stroke-dasharray="${(CIRC * pct / 100).toFixed(1)} ${CIRC.toFixed(1)}" transform="rotate(-90 38 38)"/>
          <text x="38" y="43" text-anchor="middle">${pct}%</text>
        </svg>
        <div class="tr-k">${done} / ${total} lessons</div>
      </div>
    </div>`;
  }

  function viewHome() {
    document.title = 'The C Path — Learn C, visually';
    const done = doneLessons(), total = totalLessons();
    const li = CT.levelInfo();
    const isNew = done === 0;
    const cont = CT.state.lastLesson && !CT.state.completed[CT.state.lastLesson] ? CT.state.lastLesson
      : C.order().find(id => !CT.state.completed[id]) || C.order()[0];
    const contL = CT.lessons[cont];
    const nQuiz = countWidgets('quiz'), nEx = countWidgets('editor');

    const statRow = isNew
      ? `<div class="stat-row">
          <div class="stat-tile"><div class="v">${total}</div><div class="k">interactive lessons</div></div>
          <div class="stat-tile"><div class="v">${nQuiz}</div><div class="k">checkpoint questions</div></div>
          <div class="stat-tile"><div class="v">${nEx}</div><div class="k">live code exercises</div></div>
          <div class="stat-tile"><div class="v">gcc</div><div class="k">a real compiler, in your browser</div></div>
        </div>`
      : `<div class="stat-row">
          <div class="stat-tile"><div class="v">${done}<span style="color:var(--ink-3);font-size:16px">/${total}</span></div><div class="k">lessons completed</div></div>
          <div class="stat-tile"><div class="v">${CT.state.xp}</div><div class="k">experience points</div></div>
          <div class="stat-tile"><div class="v">Lv ${li.n}</div><div class="k">${CT.esc(li.name)}</div></div>
          <div class="stat-tile"><div class="v">${Object.keys(CT.state.badges).length}<span style="color:var(--ink-3);font-size:16px">/${CT.BADGES.length}</span></div><div class="k"><a href="#/badges" style="color:inherit">badges earned →</a></div></div>
        </div>`;

    const taste = isNew ? `
      <div class="taste" id="tasteZone">
        <div class="taste-head">
          <h2>Don’t take our word for it — play</h2>
          <p>Three little bites of the course. Free, no signup, nothing to install.</p>
        </div>
        <div class="taste-grid">
          <div class="taste-card no-wt" id="tc1">
            <div class="t-head"><span class="t-step">1</span><h3>Flip bits like a CPU</h3></div>
            <p class="t-sub">Every number is secretly switches. Click them until the byte says <b>42</b>.</p>
            <div data-w="tasteBits"></div>
          </div>
          <div class="taste-card" id="tc2">
            <div class="t-head"><span class="t-step">2</span><h3>Learn something in 10 seconds</h3></div>
            <p class="t-sub">A real checkpoint from the course — and your first XP.</p>
            <div data-w="tasteQuiz"></div>
          </div>
          <div class="taste-card no-wt" id="tc3">
            <div class="t-head"><span class="t-step">3</span><h3>Run real C — nothing to install</h3></div>
            <p class="t-sub">This box compiles with actual gcc. Put your name in and press <b>▶ Run</b>.</p>
            <div data-w="tasteCode"></div>
          </div>
        </div>
      </div>` : '';

    const hero = isNew
      ? `<div class="hero">
        <h1>Learn <span class="grad">C</span> the visual way</h1>
        <p class="sub">From flipping your first bit to writing inline assembly — an interactive course with animations, flow diagrams, quizzes and a real compiler.</p>
        <div class="hero-chips">
          <span class="hchip">✓ 100% free</span>
          <span class="hchip">✓ No signup</span>
          <span class="hchip">✓ Real GCC in your browser</span>
          <span class="hchip">✓ Nothing to install</span>
        </div>
        <div class="hero-term"><div class="cb-head"><span class="cb-dots"><i></i><i></i><i></i></span> ~/c-path</div><pre id="heroType"></pre></div>
        <div class="hero-ctas">
          <a class="btn primary" href="#/lesson/${cont}">🚀 Start the course</a>
          <a class="btn" href="#/playground">⌨️ Open playground</a>
        </div>
        <button class="hero-tryline" id="heroTry">▾ or play a 30-second taste, right below</button>
      </div>`
      : todayPanel(done, total, cont, contL);

    main.innerHTML = `<div class="page wide">
      ${hero}
      ${taste}
      ${statRow}
      <h2 style="margin-top:26px">The course</h2>
      <div class="parts-grid">` +
      C.parts.map((p, pi) => {
        const pdone = p.lessons.filter(id => CT.state.completed[id]).length;
        const first = p.lessons.find(id => !CT.state.completed[id]) || p.lessons[0];
        return `<a class="part-card" href="#/lesson/${first}">
          ${isNew && pi === 0 ? '<span class="p-start">start here</span>' : ''}
          <div class="p-emoji">${p.emoji}</div>
          <h3>${CT.esc(p.title)}</h3><p>${CT.esc(p.blurb)}</p>
          <div class="p-bar"><div style="width:${Math.round(100 * pdone / p.lessons.length)}%"></div></div>
          <div class="p-meta"><span>${p.lessons.length} lessons</span><span>${pdone ? pdone + ' done' : ''}</span></div>
        </a>`;
      }).join('') +
      `</div></div>`;

    typeHero();
    if (isNew) mountTaste();
  }

  function tasteWin(cardId, hintHtml, toastHtml, toastKind, quiet) {
    const card = document.getElementById(cardId);
    if (!card || card.classList.contains('won')) return;
    card.classList.add('won');
    const step = card.querySelector('.t-step');
    if (step) step.textContent = '✓';
    const hint = card.querySelector('.whint');
    if (hint && hintHtml) hint.innerHTML = hintHtml;
    if (quiet) return;
    CT.confetti(90);
    if (toastHtml) CT.toast(toastHtml, toastKind || 'xp', 3400);
  }

  function mountTaste() {
    const zone = main.querySelector('#tasteZone');
    if (!zone) return;
    CT.mountWidgets(zone, {
      id: 'home',
      widgets: {
        tasteBits: {
          type: 'bits', n: 6, value: 0,
          hint: 'Each switch is worth double the one to its right.',
          onChange: v => {
            if (v === 42) tasteWin('tc1',
              '✓ 32 + 8 + 2 = <b>42</b>, written <b>101010</b>. You already speak binary.',
              '🎉 <b>101010</b> = 42 — you just counted in binary');
          },
        },
        tasteQuiz: {
          type: 'quiz', id: 'taste1',
          q: 'Your computer stores the letter <code>A</code> as…',
          opts: ['the number 65', 'a tiny picture of a letter', 'it depends on the font'],
          a: 0,
          expl: 'Everything in a computer is numbers — ASCII simply agreed that 65 means “A”. In Foundations you’ll watch your own text explode into raw bytes, live.',
          xp: 20,
          onCorrect: () => tasteWin('tc2', null, null),
        },
        tasteCode: {
          type: 'editor', code: TASTE_C, height: 290,
          hint: 'Ctrl+Enter runs it too. Break it on purpose — compiler errors are how C says hello.',
          onRun: res => {
            if (res.code === 0) tasteWin('tc3', null,
              '⚙️ That was <b>real gcc</b> compiling your C in the cloud', 'badge');
          },
        },
      },
    });
    if (CT.state.quizzes['home:taste1']) tasteWin('tc2', null, null, null, true);
    const tryBtn = document.getElementById('heroTry');
    if (tryBtn) tryBtn.addEventListener('click', () => zone.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function typeHero() {
    const elT = document.getElementById('heroType');
    if (!elT) return;
    const seq = [
      { t: '$ gcc hello.c -o hello', cls: 't-prompt' },
      { t: '$ ./hello', cls: 't-prompt' },
      { t: 'Hello, World! 👋', cls: '' },
      { t: '# your journey starts here…', cls: 't-dim' },
    ];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elT.innerHTML = seq.map(s => `<span class="${s.cls}">${CT.esc(s.t)}</span>`).join('\n');
      return;
    }
    let li = 0, ci = 0, out = '';
    (function tick() {
      if (!document.getElementById('heroType')) return;
      if (li >= seq.length) { elT.innerHTML = out + '<span class="type-caret"></span>'; return; }
      const s = seq[li];
      ci++;
      const cur = `<span class="${s.cls}">${CT.esc(s.t.slice(0, ci))}</span>`;
      elT.innerHTML = out + cur + '<span class="type-caret"></span>';
      if (ci >= s.t.length) { out += cur + '\n'; li++; ci = 0; setTimeout(tick, 380); }
      else setTimeout(tick, 26 + Math.random() * 40);
    })();
  }

  /* ================= lesson ================= */
  function viewLesson(id) {
    const l = CT.lessons[id];
    const part = C.partOf(id);
    const { prev, next } = C.prevNext(id);
    CT.state.lastLesson = id; CT.save();
    document.title = (l ? l.title : id) + ' — The C Path';

    if (!l) {
      main.innerHTML = `<div class="page"><div class="lesson-eyebrow">${part ? part.emoji + ' ' + CT.esc(part.title) : ''}</div>
        <h1>🚧 Coming soon</h1>
        <p>This lesson (<code class="inline">${CT.esc(id)}</code>) is still being written. Check back shortly!</p>
        <div class="lesson-nav">
          ${prev ? navCard(prev, 'prev') : '<span style="flex:1"></span>'}
          ${next ? navCard(next, 'next') : ''}
        </div></div>`;
      renderSidebar();
      return;
    }

    const doneAlready = !!CT.state.completed[id];
    main.innerHTML = `<div class="page">
      <div class="lesson-eyebrow">${part ? part.emoji + ' ' + CT.esc(part.title) : ''}</div>
      <h1>${CT.esc(l.title)}</h1>
      <div class="lesson-meta">
        <span>⏱ ${l.minutes || 10} min</span><span class="sep">·</span>
        <span>✨ ${l.xp || 100} XP</span>
        ${doneAlready ? '<span class="sep">·</span><span style="color:var(--good);font-weight:700">✓ completed</span>' : ''}
      </div>
      ${l.why ? `<div class="lesson-why"><div class="lw-ic">🧭</div><div class="lw-body"><div class="lw-k">Why you’re learning this</div>${l.why}</div></div>` : ''}
      <div class="lesson-body">${l.html}</div>
      <div class="complete-bar">${doneAlready
        ? `<p class="done-msg">✓ Lesson complete — nice work!</p>`
        : `<button class="btn good" id="completeBtn">✓ Mark lesson complete&nbsp;&nbsp;+${l.xp || 100} XP</button>`}
      </div>
      <div class="lesson-nav">
        ${prev ? navCard(prev, 'prev') : '<span style="flex:1"></span>'}
        ${next ? navCard(next, 'next') : ''}
      </div>
    </div>`;

    CT.mountWidgets(main.querySelector('.lesson-body'), l);

    const cb = document.getElementById('completeBtn');
    if (cb) cb.addEventListener('click', () => {
      CT.completeLesson(id);
      CT.confetti(120);
      cb.replaceWith(CT.el('<p class="done-msg">✓ Lesson complete — nice work!</p>'));
      renderSidebar();
    });
    renderSidebar();
    main.scrollTop = 0; window.scrollTo(0, 0);
  }

  function navCard(id, dir) {
    const l = CT.lessons[id];
    return `<a class="nav-card ${dir}" href="#/lesson/${id}">
      <div class="k">${dir === 'prev' ? '← Previous' : 'Next →'}</div>
      <div class="t">${CT.esc(l ? l.title : id)}</div></a>`;
  }

  /* ================= playground ================= */
  const PG_EXAMPLES = {
    'Hello, World!': '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
    'FizzBuzz': '#include <stdio.h>\n\nint main(void) {\n    for (int i = 1; i <= 20; i++) {\n        if (i % 15 == 0)      puts("FizzBuzz");\n        else if (i % 3 == 0)  puts("Fizz");\n        else if (i % 5 == 0)  puts("Buzz");\n        else                  printf("%d\\n", i);\n    }\n    return 0;\n}\n',
    'Pointers in action': '#include <stdio.h>\n\nint main(void) {\n    int x = 42;\n    int *p = &x;\n\n    printf("x lives at %p\\n", (void *)p);\n    printf("*p = %d\\n", *p);\n\n    *p = 99;              /* write through the pointer */\n    printf("x is now %d\\n", x);\n    return 0;\n}\n',
    'Dynamic array': '#include <stdio.h>\n#include <stdlib.h>\n\nint main(void) {\n    int n = 10;\n    int *a = malloc(n * sizeof *a);\n    if (!a) return 1;\n\n    for (int i = 0; i < n; i++) a[i] = i * i;\n    for (int i = 0; i < n; i++) printf("%d ", a[i]);\n    putchar(\'\\n\');\n\n    free(a);\n    return 0;\n}\n',
    'Recursion: factorial': '#include <stdio.h>\n\nunsigned long long fact(unsigned n) {\n    return n <= 1 ? 1 : n * fact(n - 1);\n}\n\nint main(void) {\n    for (unsigned i = 0; i <= 15; i++)\n        printf("%2u! = %llu\\n", i, fact(i));\n    return 0;\n}\n',
    'Struct + qsort': '#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nstruct player { char name[16]; int score; };\n\nint by_score(const void *a, const void *b) {\n    const struct player *pa = a, *pb = b;\n    return pb->score - pa->score;   /* descending */\n}\n\nint main(void) {\n    struct player league[] = {\n        {"ada", 92}, {"grace", 97}, {"linus", 88}, {"dennis", 100},\n    };\n    size_t n = sizeof league / sizeof league[0];\n    qsort(league, n, sizeof league[0], by_score);\n    for (size_t i = 0; i < n; i++)\n        printf("%zu. %-8s %d\\n", i + 1, league[i].name, league[i].score);\n    return 0;\n}\n',
  };

  function viewPlayground() {
    document.title = 'Playground — The C Path';
    main.innerHTML = `<div class="page wide">
      <h1>⌨️ Playground</h1>
      <p>Write real C, hit <b>Run</b> (or <code class="inline">Ctrl+Enter</code>), and it compiles with gcc in the cloud. Autocomplete: just type, or press <code class="inline">Ctrl+Space</code>.</p>
      <div class="pg-toolbar">
        <label for="pgEx" style="font-size:13px;color:var(--ink-3)">Examples:</label>
        <select id="pgEx"><option value="">— choose —</option>${Object.keys(PG_EXAMPLES).map(k => `<option>${k}</option>`).join('')}</select>
        <span style="flex:1"></span>
        <label style="font-size:13px;color:var(--ink-3)">stdin: <input id="pgStdin" placeholder="(optional program input)" style="font:13px var(--mono);background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:7px 10px;color:var(--ink);width:220px"></label>
      </div>
      <div class="pg-layout">
        <div id="pgEditor"></div>
        <div class="pg-out"><div class="cb-head"><span class="cb-dots"><i></i><i></i><i></i></span> output</div><pre id="pgOut"><span class="dim">Press ▶ Run to compile and execute.</span></pre></div>
      </div></div>`;

    const saved = CT.state.playgroundCode || PG_EXAMPLES['Hello, World!'];
    const ped = CT.makeEditor(document.getElementById('pgEditor'), {
      code: saved, run: true, outputEl: document.getElementById('pgOut'),
      stdin: () => document.getElementById('pgStdin').value,
      onChange: v => { CT.state.playgroundCode = v; CT.save(); },
    });
    document.getElementById('pgEx').addEventListener('change', e => {
      if (e.target.value) { ped.setCode(PG_EXAMPLES[e.target.value]); CT.state.playgroundCode = ped.getCode(); CT.save(); }
    });
  }

  /* ================= keyword reference ================= */
  const KWREF = [
    ['Types', [
      ['int', 'variables-types'], ['char', 'variables-types'], ['float', 'variables-types'], ['double', 'variables-types'],
      ['short', 'variables-types'], ['long', 'variables-types'], ['signed', 'variables-types'], ['unsigned', 'variables-types'],
      ['_Bool', 'variables-types'], ['bool', 'c23-features'], ['void', 'functions'], ['enum', 'enum'],
      ['struct', 'structs'], ['union', 'unions-bitfields'], ['_BitInt', 'c23-features'],
      ['_Complex', 'complex-imaginary'], ['_Imaginary', 'complex-imaginary'],
    ]],
    ['Control flow', [
      ['if', 'if-else'], ['else', 'if-else'], ['switch', 'switch-case'], ['case', 'switch-case'], ['default', 'switch-case'],
      ['while', 'loops-while'], ['do', 'loops-while'], ['for', 'loops-for'],
      ['break', 'break-continue-goto'], ['continue', 'break-continue-goto'], ['goto', 'break-continue-goto'],
      ['return', 'functions'],
    ]],
    ['Storage & qualifiers', [
      ['auto', 'scope-lifetime'], ['register', 'scope-lifetime'], ['static', 'storage-classes'], ['extern', 'storage-classes'],
      ['const', 'const'], ['volatile', 'volatile'], ['restrict', 'restrict'], ['inline', 'inline'],
      ['typedef', 'typedef'], ['sizeof', 'sizeof'], ['_Atomic', 'atomics-threads'],
      ['_Thread_local', 'atomics-threads'], ['thread_local', 'atomics-threads'], ['constexpr', 'c23-features'],
    ]],
    ['Modern C (C11 → C23)', [
      ['_Static_assert', 'static-assert'], ['static_assert', 'static-assert'],
      ['_Alignas', 'alignment'], ['alignas', 'alignment'], ['_Alignof', 'alignment'], ['alignof', 'alignment'],
      ['_Generic', 'generic-selection'], ['_Noreturn', 'noreturn'],
      ['true', 'c23-features'], ['false', 'c23-features'], ['nullptr', 'c23-features'],
      ['typeof', 'c23-features'], ['typeof_unqual', 'c23-features'],
    ]],
    ['Preprocessor directives', [
      ['#include', 'include'], ['#define', 'define-macros'], ['#undef', 'define-macros'],
      ['#if', 'conditional-compilation'], ['#ifdef', 'conditional-compilation'], ['#ifndef', 'conditional-compilation'],
      ['#elif', 'conditional-compilation'], ['#else', 'conditional-compilation'], ['#endif', 'conditional-compilation'],
      ['#error', 'pragma-error-line'], ['#warning', 'pragma-error-line'], ['#pragma', 'pragma-error-line'],
      ['#line', 'pragma-error-line'], ['#embed', 'pragma-error-line'], ['# (stringify)', 'function-macros'],
      ['## (paste)', 'function-macros'], ['__VA_ARGS__', 'function-macros'],
    ]],
    ['GNU extensions', [
      ['__attribute__', 'gcc-extensions'], ['asm', 'inline-assembly'], ['__builtin_*', 'gcc-extensions'],
      ['&&label', 'gcc-extensions'],
    ]],
  ];

  function viewReference() {
    document.title = 'C keyword reference — The C Path';
    main.innerHTML = `<div class="page wide">
      <h1>📖 Keyword reference</h1>
      <p>Every C keyword and preprocessor directive, linked to the lesson that teaches it. Completed lessons are marked green.</p>
      <input id="kwFilter" placeholder="filter… (e.g. static)" style="width:100%;max-width:380px;font:14px var(--mono);background:var(--surface-2);border:1.5px solid var(--border-strong);border-radius:10px;padding:10px 14px;color:var(--ink);outline:none;margin-bottom:8px">
      <div id="kwGroups">${renderKwGroups('')}</div>
    </div>`;
    document.getElementById('kwFilter').addEventListener('input', e => {
      document.getElementById('kwGroups').innerHTML = renderKwGroups(e.target.value.trim().toLowerCase());
    });
  }
  function renderKwGroups(q) {
    return KWREF.map(([group, kws]) => {
      const items = kws.filter(([k]) => !q || k.toLowerCase().includes(q));
      if (!items.length) return '';
      return `<h2>${group}</h2><div style="display:flex;flex-wrap:wrap;gap:8px">` +
        items.map(([k, lid]) => {
          const done = CT.state.completed[lid];
          const exists = CT.lessons[lid];
          return `<a href="#/lesson/${lid}" title="${exists ? CT.esc(exists.title) : 'coming soon'}" style="text-decoration:none;font:600 13px var(--mono);padding:7px 13px;border-radius:9px;border:1.5px solid ${done ? 'var(--good)' : 'var(--border-strong)'};color:${done ? 'var(--good)' : 'var(--code-kw)'};background:var(--surface)">${CT.esc(k)}</a>`;
        }).join('') + `</div>`;
    }).join('');
  }

  /* ================= badges ================= */
  function viewBadges() {
    document.title = 'Badges — The C Path';
    main.innerHTML = `<div class="page wide">
      <h1>🏅 Badges</h1>
      <p>Earn badges by completing lessons, acing quizzes, and showing up every day.</p>
      <div class="badge-grid">` +
      CT.BADGES.map(b => {
        const earned = CT.state.badges[b.id];
        return `<div class="badge-card ${earned ? 'earned' : ''}">
          <div class="b-ic">${b.ic}</div><h3>${CT.esc(b.name)}</h3><p>${CT.esc(b.desc)}</p>
          ${earned ? `<div class="b-earned">Earned ${new Date(earned).toLocaleDateString()}</div>` : ''}
        </div>`;
      }).join('') +
      `</div>
      <div class="backup-box">
        <div>
          <h3>💾 Back up your progress</h3>
          <p>Everything — XP, streak, badges, completed lessons — lives in <b>this browser</b>. Export a file to keep it safe or move to another device.</p>
        </div>
        <div class="backup-btns">
          <button class="btn" id="expBtn">⬇ Export progress</button>
          <button class="btn" id="impBtn">⬆ Import backup</button>
          <input type="file" id="impFile" accept="application/json,.json" hidden>
        </div>
      </div></div>`;
    document.getElementById('expBtn').addEventListener('click', () => CT.exportProgress());
    const impFile = document.getElementById('impFile');
    document.getElementById('impBtn').addEventListener('click', () => impFile.click());
    impFile.addEventListener('change', () => {
      const f = impFile.files[0];
      if (!f) return;
      f.text().then(txt => {
        CT.importProgress(txt);
        CT.toast('✅ Progress restored!', 'badge', 3200);
        renderSidebar(); viewBadges();
      }).catch(() => CT.toast('⚠️ That file doesn’t look like a C Path backup.', '', 3600));
    });
  }

  /* ================= C gotchas gallery ================= */
  function viewGotchas(focusId) {
    document.title = 'C Gotchas — famous C traps, runnable — The C Path';
    const G = window.GOTCHAS || [];
    const revealed = () => Object.keys(CT.state.gotchas || {}).length;
    if (!G.length) {
      main.innerHTML = `<div class="page"><h1>🪤 C Gotchas</h1><p>The gotchas data file isn’t loaded.</p></div>`;
      return;
    }
    main.innerHTML = `<div class="page wide">
      <h1>🪤 C Gotchas</h1>
      <p class="g-intro">${G.length} famous C traps — the bugs that bite <i>everyone</i> once. Each one is a real program:
      guess what it does, reveal the trap, then <b>run it on real gcc</b> to see for yourself.
      <span class="g-progress" id="gProgress">${revealed()} / ${G.length} revealed</span></p>
      <div class="gotcha-list">` +
      G.map(g => `
        <div class="gotcha-card" id="g-${g.id}">
          <div class="g-head">
            <span class="g-emoji">${g.emoji || '🪤'}</span>
            <h3>${CT.esc(g.title)}</h3>
            ${g.ub ? '<span class="g-ub" title="Undefined behavior — the standard allows anything to happen">💀 UB</span>' : ''}
          </div>
          <p class="g-hook">${CT.esc(g.hook)}</p>
          <div class="g-code"></div>
          <div class="g-actions">
            <button class="btn primary g-revealbtn">🤔 What happens?</button>
            <button class="btn g-runbtn">▶ Run it live</button>
          </div>
          <div class="g-reveal" hidden>
            <div class="g-vs">
              <div class="g-vs-cell"><div class="g-vs-k">😇 you might expect</div>${CT.esc(g.expected)}</div>
              <div class="g-vs-cell bad"><div class="g-vs-k">😈 what actually happens</div>${CT.esc(g.actual)}</div>
            </div>
            <div class="g-why">${g.why}</div>
            ${g.lesson && CT.lessons[g.lesson] ? `<a class="g-lesson" href="#/lesson/${g.lesson}">📖 Learn it properly: ${CT.esc(CT.lessons[g.lesson].title)} →</a>` : ''}
          </div>
          <div class="g-run"></div>
        </div>`).join('') +
      `</div></div>`;

    G.forEach(g => {
      const card = document.getElementById('g-' + g.id);
      card.querySelector('.g-code').appendChild(CT.codeBlock(g.code, { title: 'gotcha.c', run: false }));
      const revealEl = card.querySelector('.g-reveal');
      card.querySelector('.g-revealbtn').addEventListener('click', function () {
        revealEl.hidden = false;
        this.style.display = 'none';
        CT.gotchaRevealed(g.id);
        const p = document.getElementById('gProgress');
        if (p) p.textContent = `${revealed()} / ${G.length} revealed`;
      });
      let mounted = false;
      card.querySelector('.g-runbtn').addEventListener('click', function () {
        if (!mounted) {
          mounted = true;
          const lines = g.code.split('\n').length;
          const ed = CT.makeEditor(card.querySelector('.g-run'), { code: g.code, height: Math.min(430, lines * 21 + 92), run: true });
          this.textContent = '⌨️ Editing below';
          this.disabled = true;
          ed.run();
        }
      });
      if (CT.state.gotchas[g.id]) {
        revealEl.hidden = false;
        card.querySelector('.g-revealbtn').style.display = 'none';
      }
    });

    if (focusId) {
      const el = document.getElementById('g-' + focusId);
      if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('g-focus'); }
    }
  }

  /* ================= part-complete celebration ================= */
  function viewPartComplete(partId) {
    const part = C.parts.find(p => p.id === partId);
    if (!part || !part.lessons.every(id => CT.state.completed[id])) { CT.navigate('#/'); return; }
    const pi = C.parts.indexOf(part);
    const done = doneLessons(), total = totalLessons();
    const li = CT.levelInfo();
    const partXP = part.lessons.reduce((s, id) => s + ((CT.lessons[id] || {}).xp || 100), 0);
    const allDone = done === total;
    const nextPart = C.parts[pi + 1];
    document.title = `${part.title} — complete! — The C Path`;

    main.innerHTML = `<div class="page">
      <div class="pc-hero">
        <div class="pc-emoji">${part.emoji}</div>
        <h1>Part complete!</h1>
        <p class="pc-sub">You finished <b>${CT.esc(part.title)}</b> — ${part.lessons.length} lessons, ${partXP} XP worth of C knowledge.</p>
      </div>
      <canvas id="pcCard" class="share-canvas"></canvas>
      <div id="pcActions"></div>
      <div class="pc-next">
        ${allDone
          ? `<a class="btn primary" href="#/certificate">👑 Claim your certificate</a>`
          : nextPart
            ? `<a class="btn primary" href="#/lesson/${nextPart.lessons[0]}">▶ Start ${CT.esc(nextPart.title)}</a>`
            : ''}
        <a class="btn" href="#/">🏠 Home</a>
      </div>
    </div>`;

    const canvas = document.getElementById('pcCard');
    CT.drawShareCard(canvas, {
      emoji: part.emoji,
      title: `${part.title} — done!`,
      subtitle: `Part ${pi + 1} of ${C.parts.length} · ${done}/${total} lessons into The C Path`,
      stats: [
        { v: part.lessons.length, k: 'lessons finished' },
        { v: partXP + ' XP', k: 'earned this part' },
        { v: 'Lv ' + li.n, k: li.name },
      ],
    });
    const shareText = `I just finished “${part.title}” on The C Path — ${done}/${total} lessons into learning C, free in the browser (real GCC, no signup).`;
    document.getElementById('pcActions').appendChild(
      CT.canvasActions(canvas, `c-path-${part.id}-complete.png`, shareText));
    CT.confetti(160);
  }

  /* ================= certificate ================= */
  function viewCertificate() {
    document.title = 'Certificate — The C Path';
    const done = doneLessons(), total = totalLessons();
    if (done < total) {
      main.innerHTML = `<div class="page">
        <h1>👑 Course certificate</h1>
        <p>The certificate unlocks when every lesson is complete. You're at <b>${done} / ${total}</b> — keep going!</p>
        <div class="p-bar" style="max-width:420px"><div style="width:${Math.round(100 * done / total)}%"></div></div>
        <p style="margin-top:18px"><a class="btn primary" href="#/">▶ Continue the course</a></p>
      </div>`;
      return;
    }
    main.innerHTML = `<div class="page">
      <h1>👑 Grandmaster of C</h1>
      <p>All ${total} lessons complete. Put your name on it — the certificate renders right here in your browser.</p>
      <label class="cert-name">Name on the certificate:
        <input id="certName" maxlength="40" spellcheck="false" placeholder="Your name" value="${CT.esc(CT.state.certName || '')}">
      </label>
      <canvas id="certCanvas" class="share-canvas cert"></canvas>
      <div id="certActions"></div>
      <p class="note" style="color:var(--ink-3);font-size:13.5px">This certificate is a celebration of real work — every lesson, quiz and exercise behind it ran on a real compiler. It isn’t an accredited credential, and that’s fine: the code you can now write is the credential.</p>
    </div>`;
    const canvas = document.getElementById('certCanvas');
    const actions = document.getElementById('certActions');
    function draw() {
      CT.drawCertificate(canvas, {
        name: CT.state.certName || '',
        xp: CT.state.xp,
        date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      });
      actions.innerHTML = '';
      actions.appendChild(CT.canvasActions(canvas, 'c-path-certificate.png',
        'I completed The C Path — all 73 interactive C lessons, from binary to inline assembly, on a real compiler. 👑'));
    }
    document.getElementById('certName').addEventListener('input', e => {
      CT.state.certName = e.target.value; CT.save(); draw();
    });
    draw();
  }

  /* ================= cheatsheets ================= */
  const SHEETS = [
    ['printf', '🖨️', 'printf & scanf formats', 'Every conversion specifier, flag and length modifier — plus the mismatches that are UB.'],
    ['precedence', '🪜', 'Operator precedence', 'All 15 levels with associativity, and the classic traps at each level.'],
    ['string-lib', '🧵', 'string.h survival guide', 'Every function with its signature, contract, and its gotcha.'],
    ['stdint', '📏', 'Fixed-width integers', 'stdint/limits/inttypes: the right type and the right print macro, every time.'],
    ['gcc-flags', '🚩', 'GCC flags that matter', 'Warnings, sanitizers, optimization, debugging, standards.'],
    ['escapes', '↩️', 'Escapes & ASCII', 'Every escape sequence, literal prefixes, and a compact ASCII table.'],
  ];
  function viewCheatsheets() {
    document.title = 'C cheatsheets — The C Path';
    main.innerHTML = `<div class="page wide">
      <h1>📋 Cheatsheets</h1>
      <p>Dense, printable, one-page references — open one, hit <b>Ctrl+P</b>, pin it above your desk. Each row links back to the lesson that teaches it.</p>
      <div class="sheet-grid">` +
      SHEETS.map(([f, ic, t, d]) => `
        <a class="sheet-card" href="cheatsheets/${f}.html" target="_blank" rel="noopener">
          <div class="s-ic">${ic}</div><h3>${t}</h3><p>${d}</p>
          <span class="s-open">open ↗</span>
        </a>`).join('') +
      `</div></div>`;
  }

  /* ================= support ================= */
  function viewSupport() {
    document.title = 'Support The C Path';
    const S = window.SUPPORT || {};
    const tipBtns = [
      S.githubSponsors ? `<a class="btn primary" href="https://github.com/sponsors/${CT.esc(S.githubSponsors)}" target="_blank" rel="noopener">♥ Sponsor on GitHub</a>` : '',
      S.kofi ? `<a class="btn" href="https://ko-fi.com/${CT.esc(S.kofi)}" target="_blank" rel="noopener">☕ Buy a coffee</a>` : '',
    ].filter(Boolean).join('');
    main.innerHTML = `<div class="page">
      <h1>💛 Support The C Path</h1>
      <p>The C Path is <b>100% free — every lesson, every exercise, forever</b>. No signup, no paywall, no ads on lessons.
      It runs on volunteer time and costs almost nothing to host, which is exactly why small support goes a long way.</p>
      ${tipBtns ? `<div class="support-tips">${tipBtns}</div>` : ''}
      ${S.buttondown ? `
      <div class="nl-box">
        <h3>📬 C Gotcha of the Week</h3>
        <p>One runnable C trap in your inbox, weekly. No spam, unsubscribe anytime.</p>
        <form action="https://buttondown.com/api/emails/embed-subscribe/${CT.esc(S.buttondown)}" method="post" target="_blank">
          <input type="email" name="email" placeholder="you@example.com" required>
          <button class="btn primary" type="submit">Subscribe</button>
        </form>
      </div>` : ''}
      ${(S.supporters && S.supporters.length) ? `
      <h2>Supporters wall</h2>
      <p>These fine people keep the compiler humming:</p>
      <div class="supporters-wall">${S.supporters.map(n => `<span class="supporter">${CT.esc(n)}</span>`).join('')}</div>` : ''}
      <h2>Other ways to help — all free</h2>
      <ul>
        <li><b>Tell one person.</b> Word of mouth is genuinely the whole growth plan.</li>
        <li>Share a <a href="#/gotchas">gotcha</a> that got you, or your <a href="#/daily">Daily Bit</a> result.</li>
        <li>Found a mistake? Report it — accuracy is the product.</li>
        <li>Browse the <a href="#/books">recommended C books</a> we keep next to the keyboard.</li>
      </ul>
    </div>`;
  }

  /* ================= recommended books ================= */
  const BOOKS = [
    ['The C Programming Language (2nd ed.)', 'Kernighan & Ritchie', '0131103628',
     'The book, by the language’s creators. Terse, elegant, still the best single tour of C’s soul. Read it after Part 2 and it will feel like meeting the author of a language you already speak.'],
    ['Modern C (2nd ed.)', 'Jens Gustedt', '1617295817',
     'The best serious follow-up to this course — rigorous, current (C17/C23), opinionated. The author also publishes a free PDF edition online, so try before you buy.'],
    ['Effective C (2nd ed.)', 'Robert C. Seacord', '1718504128',
     'Professional-grade C by the editor of the C standard’s security annex. The chapter on undefined behavior pairs beautifully with our gotchas gallery.'],
    ['C Programming: A Modern Approach (2nd ed.)', 'K. N. King', '0393979504',
     'The classic teaching text — slower and more thorough than K&R, with hundreds of exercises. The book version of what this site tries to be.'],
  ];
  function viewBooks() {
    document.title = 'Recommended C books — The C Path';
    const tag = (window.SUPPORT || {}).amazonTag;
    main.innerHTML = `<div class="page">
      <h1>📚 Books worth keeping next to the keyboard</h1>
      <p>The course is self-contained — but these four have earned permanent desk space. Free excerpts and library copies count too.</p>
      <div class="book-list">` +
      BOOKS.map(([t, a, asin, blurb]) => `
        <div class="book-card">
          <h3>${CT.esc(t)}</h3>
          <div class="b-author">${CT.esc(a)}</div>
          <p>${blurb}</p>
          <a class="btn" href="https://www.amazon.com/dp/${asin}${tag ? '?tag=' + CT.esc(tag) : ''}" target="_blank" rel="noopener sponsored">View on Amazon ↗</a>
        </div>`).join('') +
      `</div>
      ${tag ? `<p class="note" style="color:var(--ink-3);font-size:13px;margin-top:16px">As an Amazon Associate, The C Path earns from qualifying purchases — at no extra cost to you. It helps keep the site free.</p>` : ''}
    </div>`;
  }

  /* ================= command palette ================= */
  const overlay = document.getElementById('paletteOverlay');
  const pInput = document.getElementById('paletteInput');
  const pResults = document.getElementById('paletteResults');
  let pSel = 0, pItems = [];

  function openPalette() {
    overlay.hidden = false;
    pInput.value = ''; searchPalette('');
    setTimeout(() => pInput.focus(), 10);
  }
  function closePalette() { overlay.hidden = true; }
  function searchPalette(q) {
    q = q.trim().toLowerCase();
    const all = C.order().map(id => {
      const l = CT.lessons[id], p = C.partOf(id);
      return { id, title: l ? l.title : id, part: p, tags: l && l.tags ? l.tags : '' };
    });
    pItems = all.filter(x => !q || x.title.toLowerCase().includes(q) || x.id.includes(q) || x.tags.toLowerCase().includes(q)).slice(0, 12);
    pSel = 0;
    renderPalette();
  }
  function renderPalette() {
    if (!pItems.length) { pResults.innerHTML = '<div class="pr-empty">No lessons match. Try “pointer”, “loop”, “malloc”…</div>'; return; }
    pResults.innerHTML = pItems.map((x, i) => `
      <div class="pr-item ${i === pSel ? 'sel' : ''}" data-id="${x.id}">
        <span>${CT.state.completed[x.id] ? '✅' : '📄'}</span><span>${CT.esc(x.title)}</span>
        <span class="pr-part">${x.part ? x.part.emoji + ' ' + CT.esc(x.part.title) : ''}</span>
      </div>`).join('');
    pResults.querySelectorAll('.pr-item').forEach(item => {
      item.addEventListener('click', () => { closePalette(); CT.navigate('#/lesson/' + item.dataset.id); });
    });
  }
  pInput.addEventListener('input', () => searchPalette(pInput.value));
  pInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); pSel = Math.min(pSel + 1, pItems.length - 1); renderPalette(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); pSel = Math.max(pSel - 1, 0); renderPalette(); }
    if (e.key === 'Enter' && pItems[pSel]) { closePalette(); CT.navigate('#/lesson/' + pItems[pSel].id); }
    if (e.key === 'Escape') closePalette();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });

  /* ================= global keys & chrome ================= */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.hidden ? openPalette() : closePalette(); }
    if (e.target.closest('input, textarea, select')) return;
    const m = CT.currentPath().match(/^\/lesson\/(.+)$/);
    if (m) {
      const { prev, next } = C.prevNext(m[1]);
      if (e.key === 'ArrowLeft' && prev) CT.navigate('#/lesson/' + prev);
      if (e.key === 'ArrowRight' && next) CT.navigate('#/lesson/' + next);
    }
  });
  document.getElementById('openPalette').addEventListener('click', openPalette);
  document.getElementById('themeToggle').addEventListener('click', () => {
    CT.toggleTheme();
    window.dispatchEvent(new Event('ct-theme'));
  });
  const app = document.getElementById('app');
  document.getElementById('menuToggle').addEventListener('click', () => app.classList.toggle('nav-open'));
  document.getElementById('scrim').addEventListener('click', () => app.classList.remove('nav-open'));
  window.addEventListener('hashchange', () => app.classList.remove('nav-open'));

  /* ================= routes & boot ================= */
  CT.route(/^\/$/, () => { renderSidebar(); viewHome(); });
  CT.route(/^\/lesson\/([a-z0-9-]+)$/, m => viewLesson(m[1]));
  CT.route(/^\/playground$/, () => { renderSidebar(); viewPlayground(); });
  CT.route(/^\/badges$/, () => { renderSidebar(); viewBadges(); });
  CT.route(/^\/gotchas(?:\/([a-z0-9-]+))?$/, m => { renderSidebar(); viewGotchas(m[1]); });
  CT.route(/^\/daily$/, () => { renderSidebar(); CT.viewDaily(main); });
  CT.route(/^\/cheatsheets$/, () => { renderSidebar(); viewCheatsheets(); });
  CT.route(/^\/part-complete\/(p[0-9]+)$/, m => { renderSidebar(); viewPartComplete(m[1]); });
  CT.route(/^\/certificate$/, () => { renderSidebar(); viewCertificate(); });
  CT.route(/^\/support$/, () => { renderSidebar(); viewSupport(); });
  CT.route(/^\/books$/, () => { renderSidebar(); viewBooks(); });
  CT.route(/^\/reference$/, () => { renderSidebar(); viewReference(); });

  CT.applyTheme();
  CT.updateHud();
  CT.dispatch();
})();
