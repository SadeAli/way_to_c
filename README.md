# The C Path — learn C, visually

An interactive, gamified website that teaches the C language from absolute zero
(bits, binary, hexadecimal, text encodings) through every keyword, the full
preprocessor, the standard library, algorithms & Big-O — all the way to GCC
extensions, inline assembly and the toolchain.

## Run it

No build step, no dependencies. Either:

- open `index.html` directly in a browser, or
- serve it (nicer URLs, required for some browsers' stricter file:// policies):

```sh
python3 -m http.server 8080
# then visit http://localhost:8080
```

The **playground and "Run" buttons compile real C** with gcc via the free
[Compiler Explorer](https://github.com/compiler-explorer/compiler-explorer/blob/main/docs/API.md)
(godbolt.org) cloud API — that one feature needs an internet connection;
everything else works fully offline.
(The site previously used the Piston API, whose public instance became
whitelist-only in February 2026.)

## What's inside

- **9 parts, 73 lessons** — curriculum defined in `js/curriculum.js`, content in `lessons/part*.js`
- Interactive widgets (`js/widgets.js`): clickable binary bits, base converters,
  UTF-8 explorers, IEEE-754 float dissector, memory-cell diagrams, animated SVG
  flowcharts, an interactive Big-O grapher, step-through code tracers, sorting
  visualizers, quizzes
- **Auto-checked exercises** — 43 lesson exercises verify your program's actual
  gcc output and award XP on a green PASS (`js/expects.js`, all expected outputs
  produced from verified compiler runs)
- **🪤 C Gotchas gallery** (`#/gotchas`, data in `js/gotchas-data.js`) — famous
  C traps as complete runnable programs: guess, reveal, then run them on real gcc
- A custom **code editor with C autocomplete** (`js/editor.js`): keywords, stdlib
  signatures, snippets, buffer identifiers, auto-indent, bracket pairing, Ctrl+Enter to run
- **⚙ ASM view** on every editor — see the x86-64 assembly gcc generates for your
  code (plus compiler-fallback & rate-limit handling for the compile API)
- **Gamification** (`js/core.js`): XP, 11 levels, 20 badges, honest daily streaks
  (earned by solving, not by visiting; level-ups grant streak freezes), confetti
- **Progress export/import** (Badges page) — back up your localStorage progress
  to a JSON file or move it between devices
- Command palette (**Ctrl+K**), ←/→ lesson navigation, dark/light themes,
  progress tracking in `localStorage`
- Keyword reference page mapping every C keyword & directive to its lesson

## Development

- `node verify_lessons.js` — validates every lesson against the curriculum
  (ids registered, widgets wired, quizzes sane, trace line numbers in range…)
- `node gen_static.js [https://your-domain.com]` — generates crawlable static
  pages (`lesson/<id>/index.html`, `gotchas.html`, `robots.txt`, and — with a
  domain — `sitemap.xml`) so search engines see 73 indexable lesson pages
  instead of one hash-routed SPA. Run it after editing lessons and commit the
  output; deploys stay zero-build.
- `CONTENT_GUIDE.md` — the authoring spec for lesson files
