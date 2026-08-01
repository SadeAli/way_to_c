/* ============================================================
   core.js — state, gamification, router, registry, utilities
   ============================================================ */
window.CT = (function () {
  'use strict';

  const LS_KEY = 'ctpath-state-v1';

  /* ---------- persistent state ---------- */
  const defaultState = {
    xp: 0,
    completed: {},        // lessonId -> timestamp
    quizzes: {},          // quizId -> true (already awarded)
    exercises: {},        // exerciseId -> timestamp (auto-checked editor exercises)
    gotchas: {},          // gotchaId -> true (revealed on the gotchas page)
    badges: {},           // badgeId -> timestamp
    streak: { days: 0, last: null, freezes: 0 },
    activity: {},         // dayTimestamp -> XP earned that day
    theme: 'dark',
    lastLesson: null,
    playgroundCode: null,
  };

  let state;
  try {
    state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(LS_KEY) || '{}'));
  } catch (e) { state = Object.assign({}, defaultState); }

  function save() { localStorage.setItem(LS_KEY, JSON.stringify(state)); }

  /* ---------- levels ---------- */
  const LEVELS = [
    { xp: 0,     name: 'Bit Novice' },
    { xp: 300,   name: 'Byte Apprentice' },
    { xp: 800,   name: 'Loop Runner' },
    { xp: 1500,  name: 'Stack Climber' },
    { xp: 2400,  name: 'Pointer Wrangler' },
    { xp: 3600,  name: 'Segfault Survivor' },
    { xp: 5000,  name: 'Heap Tamer' },
    { xp: 6800,  name: 'Macro Magician' },
    { xp: 9000,  name: 'Undefined-Behavior Slayer' },
    { xp: 12000, name: 'Compiler Whisperer' },
    { xp: 16000, name: 'Grandmaster of C' },
  ];
  function levelInfo() {
    let li = 0;
    for (let i = 0; i < LEVELS.length; i++) if (state.xp >= LEVELS[i].xp) li = i;
    const cur = LEVELS[li], next = LEVELS[li + 1] || null;
    const pct = next ? Math.min(100, Math.round(100 * (state.xp - cur.xp) / (next.xp - cur.xp))) : 100;
    return { n: li + 1, name: cur.name, next, pct };
  }

  /* ---------- badges ---------- */
  const BADGES = [
    { id: 'first-steps',  ic: '👣', name: 'First Steps',        desc: 'Complete your first lesson' },
    { id: 'hello-world',  ic: '🌍', name: 'Hello, World!',      desc: 'Complete the Hello World lesson' },
    { id: 'binary-brain', ic: '🔢', name: 'Binary Brain',       desc: 'Finish all Foundations lessons' },
    { id: 'flow-master',  ic: '🌀', name: 'Flow Master',        desc: 'Finish all C Basics lessons' },
    { id: 'ptr-wizard',   ic: '🪄', name: 'Pointer Wizard',     desc: 'Finish all Pointers & Memory lessons' },
    { id: 'type-sage',    ic: '🧬', name: 'Type Sage',          desc: 'Finish all Types & Qualifiers lessons' },
    { id: 'macro-mage',   ic: '🎩', name: 'Macro Mage',         desc: 'Finish all Preprocessor lessons' },
    { id: 'modernist',    ic: '🚀', name: 'Modernist',          desc: 'Finish all Modern C lessons' },
    { id: 'librarian',    ic: '📚', name: 'The Librarian',      desc: 'Finish all Standard Library lessons' },
    { id: 'algo-athlete', ic: '🏃', name: 'Algorithm Athlete',  desc: 'Finish all Algorithms lessons' },
    { id: 'toolsmith',    ic: '⚒️', name: 'Toolsmith',          desc: 'Finish all Compiler & Toolchain lessons' },
    { id: 'quiz-10',      ic: '🧠', name: 'Quiz Whiz',          desc: 'Answer 10 quiz questions correctly' },
    { id: 'quiz-50',      ic: '🎓', name: 'Professor',          desc: 'Answer 50 quiz questions correctly' },
    { id: 'first-green',  ic: '✅', name: 'First Green',        desc: 'Pass your first auto-checked exercise' },
    { id: 'ten-green',    ic: '💚', name: 'Ten Green',          desc: 'Pass 10 auto-checked exercises' },
    { id: 'trap-spotter', ic: '🪤', name: 'Trap Spotter',       desc: 'Reveal 10 C gotchas' },
    { id: 'daily-7',      ic: '🗓️', name: 'Daily Devotee',      desc: 'Solve 7 Daily Bits' },
    { id: 'daily-30',     ic: '📅', name: 'Daily Disciple',     desc: 'Solve 30 Daily Bits' },
    { id: 'streak-3',     ic: '🔥', name: 'On Fire',            desc: 'Reach a 3-day streak' },
    { id: 'streak-7',     ic: '☄️', name: 'Unstoppable',        desc: 'Reach a 7-day streak' },
    { id: 'half-way',     ic: '⛰️', name: 'Halfway There',      desc: 'Complete 50% of the course' },
    { id: 'grandmaster',  ic: '👑', name: 'Grandmaster of C',   desc: 'Complete every single lesson' },
  ];

  function awardBadge(id) {
    if (state.badges[id]) return;
    const b = BADGES.find(x => x.id === id);
    if (!b) return;
    state.badges[id] = Date.now();
    save();
    toast(`${b.ic} Badge unlocked: <b>${b.name}</b><span class="t-sub">${b.desc}</span>`, 'badge', 5200);
    confetti(90);
  }

  /* ---------- XP ---------- */
  function todayKey() {
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function addXP(amount, why) {
    const before = levelInfo().n;
    state.xp += amount;
    const day = todayKey();
    state.activity[day] = (state.activity[day] || 0) + amount;   // daily ledger (heatmap-ready)
    save();
    updateHud();
    if (why) toast(`✨ +${amount} XP <span class="t-sub">${why}</span>`, 'xp', 2600);
    const after = levelInfo();
    if (after.n > before) {
      state.streak.freezes = Math.min(2, (state.streak.freezes || 0) + 1);
      save();
      toast(`🏆 Level up! <b>Level ${after.n} — ${after.name}</b><span class="t-sub">+1 streak freeze ❄️ (${state.streak.freezes}/2)</span>`, 'badge', 5200);
      confetti(140);
    }
  }

  /* ---------- streak ----------
     Earned by DOING (correct quiz, passed exercise, completed lesson),
     not by merely opening the page. A missed day can be covered by a
     streak freeze (earned on level-up, max 2 banked). */
  function touchStreak() {
    const t = todayKey();
    const last = state.streak.last;
    if (last === t) return;
    const oneDay = 86400000;
    if (last === t - oneDay) {
      state.streak.days += 1;
    } else if (last === t - 2 * oneDay && (state.streak.freezes || 0) > 0) {
      state.streak.freezes -= 1;
      state.streak.days += 1;
      toast(`❄️ Streak freeze used — your ${state.streak.days}-day streak survived! <span class="t-sub">${state.streak.freezes} freeze${state.streak.freezes === 1 ? '' : 's'} left</span>`, 'badge', 4600);
    } else {
      state.streak.days = 1;
    }
    state.streak.last = t;
    save();
    if (state.streak.days >= 3) awardBadge('streak-3');
    if (state.streak.days >= 7) awardBadge('streak-7');
    updateHud();
  }
  /* Is the streak safe for today? (for the Today panel) */
  function streakStatus() {
    const t = todayKey(), last = state.streak.last, oneDay = 86400000;
    if (last === t) return 'done';                       // already qualified today
    if (last === t - oneDay) return 'at-risk';           // qualify today to keep it
    if (last === t - 2 * oneDay && (state.streak.freezes || 0) > 0) return 'freezable';
    return state.streak.days > 0 && last < t - oneDay ? 'lost' : 'none';
  }

  /* ---------- lesson registry ---------- */
  const lessons = {};        // id -> lesson object
  function lesson(obj) { lessons[obj.id] = obj; }

  function completeLesson(id) {
    if (state.completed[id]) return false;
    state.completed[id] = Date.now();
    state.quizzesCorrectCount = state.quizzesCorrectCount || 0;
    save();
    const l = lessons[id];
    addXP((l && l.xp) || 100, `Lesson complete: ${l ? l.title : id}`);
    touchStreak();
    awardBadge('first-steps');
    if (id === 'hello-world') awardBadge('hello-world');
    checkPartBadges();
    updateHud();
    return true;
  }

  function checkPartBadges() {
    const C = window.CURRICULUM;
    if (!C) return;
    const partBadge = ['binary-brain','flow-master','ptr-wizard','type-sage','macro-mage','modernist','librarian','algo-athlete','toolsmith'];
    let justFinishedPart = null;
    C.parts.forEach((p, i) => {
      if (p.lessons.every(id => state.completed[id]) && partBadge[i]) {
        if (!state.badges[partBadge[i]]) justFinishedPart = p.id;
        awardBadge(partBadge[i]);
      }
    });
    const all = C.parts.flatMap(p => p.lessons);
    const done = all.filter(id => state.completed[id]).length;
    if (done >= all.length / 2) awardBadge('half-way');
    if (done === all.length) { awardBadge('grandmaster'); confetti(300); }
    // celebrate at the peak: part-complete interstitial with a shareable card
    if (justFinishedPart) setTimeout(() => navigate('#/part-complete/' + justFinishedPart), 900);
  }

  /* ---------- Daily Bit ---------- */
  function dailySolved(dayNumber, tries) {
    state.daily = state.daily || {};
    if (state.daily[dayNumber] && state.daily[dayNumber].solved) return false;
    state.daily[dayNumber] = { solved: Date.now(), tries: tries || 1 };
    save();
    addXP(30, 'Daily Bit solved');
    touchStreak();
    const n = Object.values(state.daily).filter(d => d.solved).length;
    if (n >= 7) awardBadge('daily-7');
    if (n >= 30) awardBadge('daily-30');
    return true;
  }

  function quizCorrect(quizId, xp) {
    if (state.quizzes[quizId]) return false;
    state.quizzes[quizId] = true;
    save();
    addXP(xp || 20, null);
    touchStreak();
    const n = Object.keys(state.quizzes).length;
    if (n >= 10) awardBadge('quiz-10');
    if (n >= 50) awardBadge('quiz-50');
    return true;
  }

  /* ---------- auto-checked exercises ---------- */
  function exerciseSolved(id, xp) {
    if (state.exercises[id]) return false;
    state.exercises[id] = Date.now();
    save();
    addXP(xp || 30, null);
    touchStreak();
    awardBadge('first-green');
    if (Object.keys(state.exercises).length >= 10) awardBadge('ten-green');
    return true;
  }

  /* ---------- gotcha reveals ---------- */
  function gotchaRevealed(id) {
    if (state.gotchas[id]) return false;
    state.gotchas[id] = true;
    save();
    if (Object.keys(state.gotchas).length >= 10) awardBadge('trap-spotter');
    return true;
  }

  /* ---------- progress export / import ----------
     All progress lives in localStorage — one cleared cache away from
     loss. Export writes a JSON backup; import restores it in place. */
  function exportProgress() {
    const payload = Object.assign({}, state, { _app: 'c-path', _v: 1, _exported: new Date().toISOString() });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'c-path-progress.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }
  function importProgress(json) {
    const obj = JSON.parse(json);
    if (obj._app !== 'c-path' || typeof obj.xp !== 'number' || typeof obj.completed !== 'object')
      throw new Error('not a C Path progress file');
    delete obj._app; delete obj._v; delete obj._exported;
    Object.keys(state).forEach(k => delete state[k]);
    Object.assign(state, JSON.parse(JSON.stringify(defaultState)), obj);
    save();
    applyTheme();
    updateHud();
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    const li = levelInfo();
    const $ = id => document.getElementById(id);
    if (!$('xpNum')) return;
    $('xpNum').textContent = state.xp + ' XP';
    $('lvlBadge').textContent = li.n;
    $('lvlBadge').title = `Level ${li.n}: ${li.name}` + (li.next ? ` — ${li.next.xp - state.xp} XP to next level` : '');
    $('xpFill').style.width = li.pct + '%';
    $('streakDays').textContent = state.streak.days;
    $('streakChip').classList.toggle('lit', state.streak.days > 0);
    $('xpChip').title = `Level ${li.n}: ${li.name}`;
  }

  /* ---------- toasts ---------- */
  function toast(html, kind, ms) {
    const layer = document.getElementById('toastLayer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.innerHTML = `<div>${html}</div>`;
    layer.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 350); }, ms || 3000);
  }

  /* ---------- confetti ---------- */
  let confettiParticles = [], confettiRunning = false;
  function confetti(n) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = innerWidth; canvas.height = innerHeight;
    const colors = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#9085e9', '#e66767'];
    for (let i = 0; i < (n || 80); i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width, y: -20 - Math.random() * 140,
        vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3.5,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .25,
        c: colors[(Math.random() * colors.length) | 0],
      });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(confettiTick); }
  }
  function confettiTick() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 30);
    for (const p of confettiParticles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.04;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (confettiParticles.length) requestAnimationFrame(confettiTick);
    else { confettiRunning = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
  }
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    save(); applyTheme();
  }

  /* ---------- router ---------- */
  const routes = [];
  function route(pattern, handler) { routes.push({ pattern, handler }); }
  function navigate(hash) { location.hash = hash; }
  function currentPath() {
    return (location.hash || '#/').replace(/^#/, '');
  }
  function dispatch() {
    const path = currentPath();
    for (const r of routes) {
      const m = path.match(r.pattern);
      if (m) { r.handler(m); return; }
    }
    if (routes.length) routes[0].handler([path]);
  }
  window.addEventListener('hashchange', () => { dispatch(); });

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  return {
    state, save, LEVELS, BADGES, levelInfo, addXP, awardBadge, touchStreak, streakStatus,
    lessons, lesson, completeLesson, quizCorrect, exerciseSolved, gotchaRevealed, dailySolved,
    exportProgress, importProgress, checkPartBadges,
    updateHud, toast, confetti, applyTheme, toggleTheme,
    route, navigate, dispatch, currentPath, esc, el,
  };
})();
