/* ============================================================
   daily.js — The Daily Bit: one C puzzle per day, the same for
   everyone on Earth (UTC-day-seeded, no server). Solving awards
   30 XP once, qualifies the streak, and yields a spoiler-free
   share line. Pool lives in js/daily-pool.js (window.DAILY_POOL).
   ============================================================ */
(function () {
  'use strict';
  const DAY_MS = 86400000;
  const START_DAY = Math.floor(Date.UTC(2026, 7, 1) / DAY_MS);   // Daily #1 = 2026-08-01
  const todayNumber = () => Math.floor(Date.now() / DAY_MS);
  const norm = s => String(s || '').replace(/[ \t]+$/gm, '').replace(/\s+$/, '');

  CT.dailyInfo = function () {
    const day = todayNumber();
    const rec = (CT.state.daily || {})[day];
    return { day, num: day - START_DAY + 1, solved: !!(rec && rec.solved), tries: rec ? rec.tries : 0 };
  };

  function shareLine(num, tries) {
    const sq = tries <= 1 ? '🟩' : tries <= 3 ? '🟨' : '🟧';
    const streak = CT.state.streak.days;
    return `The C Path Daily #${num} ${sq} solved in ${tries} ${tries === 1 ? 'try' : 'tries'}` +
      (streak > 1 ? ` · 🔥 ${streak}-day streak` : '');
  }

  function countdown(el) {
    function tick() {
      if (!el.isConnected) return;
      const ms = (todayNumber() + 1) * DAY_MS - Date.now();
      const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
      el.textContent = `next puzzle in ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      setTimeout(tick, 1000);
    }
    tick();
  }

  CT.viewDaily = function (main) {
    document.title = 'Daily Bit — a new C puzzle every day — The C Path';
    const pool = window.DAILY_POOL || [];
    if (!pool.length) {
      main.innerHTML = `<div class="page"><h1>🗓️ Daily Bit</h1><p>The puzzle pool isn’t loaded.</p></div>`;
      return;
    }
    const { day, num, solved, tries: doneTries } = CT.dailyInfo();
    const pz = pool[((day % pool.length) + pool.length) % pool.length];
    let tries = 0;

    main.innerHTML = `<div class="page">
      <div class="daily-head">
        <h1>🗓️ Daily Bit <span class="daily-num">#${num}</span></h1>
        <span class="daily-count" id="dailyCount"></span>
      </div>
      <p class="daily-sub">One small C puzzle a day — the same puzzle for everyone, everywhere. Solving keeps your streak alive. <b>+30 XP</b></p>
      <div class="daily-card">
        <h2>${CT.esc(pz.title)}</h2>
        ${pz.brief ? `<p class="daily-brief">${CT.esc(pz.brief)}</p>` : ''}
        <div id="dailyBody"></div>
        <div class="ex-verdict" id="dailyVerdict" hidden></div>
      </div>
      <div id="dailyDone"></div>
    </div>`;
    countdown(document.getElementById('dailyCount'));
    const body = document.getElementById('dailyBody');
    const verdict = document.getElementById('dailyVerdict');

    function renderSolved(justNow) {
      const t = justNow ? tries : doneTries;
      const zone = document.getElementById('dailyDone');
      zone.innerHTML = `<div class="daily-solved">
        <div class="ds-head">✅ Daily #${num} solved${t ? ` in ${t} ${t === 1 ? 'try' : 'tries'}` : ''} — see you tomorrow!</div>
        ${pz.expl ? `<div class="ds-expl">${pz.expl}</div>` : ''}
        <div class="ds-share">
          <button class="btn primary" id="dailyShare">📋 Copy result</button>
          <span class="ds-line" id="dailyLine">${CT.esc(shareLine(num, t || 1))}</span>
        </div>
      </div>`;
      document.getElementById('dailyShare').addEventListener('click', () => {
        navigator.clipboard.writeText(shareLine(num, t || 1) + '\n' + CT.siteUrl()).then(
          () => CT.toast('📋 Copied — paste it to a friend', 'xp', 2600),
          () => CT.toast('⚠️ Couldn’t copy', '', 2600));
      });
      if (justNow) CT.confetti(140);
    }

    function solve() {
      CT.dailySolved(day, Math.max(tries, 1));
      renderSolved(true);
    }

    if (solved) {
      // still show the puzzle (read-only feel) plus the solved banner
      if (pz.type === 'quiz' || pz.type === 'fix') body.appendChild(CT.codeBlock(pz.code, { title: 'daily.c', run: false }));
      renderSolved(false);
      return;
    }

    if (pz.type === 'quiz') {
      body.appendChild(CT.codeBlock(pz.code, { title: 'daily.c', run: false }));
      const q = document.createElement('div');
      q.className = 'quiz-q'; q.innerHTML = pz.q || 'What does this print?';
      body.appendChild(q);
      const opts = document.createElement('div');
      opts.className = 'quiz-opts';
      const keys = 'ABCD';
      opts.innerHTML = pz.opts.map((o, i) =>
        `<button class="quiz-opt" data-i="${i}"><span class="q-key">${keys[i]}</span><span>${CT.esc(o)}</span></button>`).join('');
      body.appendChild(opts);
      opts.querySelectorAll('.quiz-opt').forEach(btn => btn.addEventListener('click', () => {
        tries++;
        if (+btn.dataset.i === pz.a) {
          btn.classList.add('correct');
          opts.querySelectorAll('.quiz-opt').forEach(b => b.setAttribute('disabled', ''));
          solve();
        } else {
          btn.classList.add('wrong'); btn.setAttribute('disabled', '');
          setTimeout(() => btn.classList.remove('wrong'), 500);
        }
      }));
    } else if (pz.type === 'fix') {
      CT.makeEditor(body, {
        code: pz.code, height: Math.min(400, pz.code.split('\n').length * 21 + 92), run: true,
        onRun: res => {
          tries++;
          if (!res.compileErr && res.code === 0 && norm(res.stdout) === norm(pz.expect)) {
            verdict.hidden = true;
            solve();
          } else {
            verdict.className = 'ex-verdict fail';
            verdict.innerHTML = `<b>Not yet.</b> Expected output: <code>${CT.esc(norm(pz.expect))}</code>` +
              (pz.hint && tries >= 2 ? `<div class="whint" style="margin-top:8px">💡 ${CT.esc(pz.hint)}</div>` : '');
            verdict.hidden = false;
          }
        },
      });
    } else if (pz.type === 'bits') {
      const ph = document.createElement('div');
      body.appendChild(ph);
      CT.widgets.bits(ph, {
        n: pz.n || 8, value: 0,
        label: `Make this byte equal 0x${pz.target.toString(16).toUpperCase()}`,
        hint: pz.hint || 'Click bits to flip them.',
        onChange: v => {
          const uv = v < 0 ? v + (1 << (pz.n || 8)) : v;
          if (uv === pz.target) { tries = Math.max(tries, 1); solve(); }
        },
      });
    }
  };
})();
