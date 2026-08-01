# Content authoring guide — The C Path

This document defines EXACTLY how lesson content files in `lessons/` must be written.
Read `lessons/part0.js` first — it is the canonical exemplar of tone, depth, and widget usage.
The lesson ids you must implement for each part are declared in `js/curriculum.js`. **Every id
listed there for your part MUST be registered**, with exactly that id.

## File format

Each file `lessons/partN.js` is a plain script (no modules, no imports) containing one
`CT.lesson({...})` call per lesson:

```js
CT.lesson({
  id: 'pointers-intro',          // EXACTLY as in js/curriculum.js
  title: 'Pointers: variables that hold addresses',
  minutes: 12,                   // honest reading estimate 8–16
  xp: 100,                       // 100–140
  tags: 'pointer address deref & *',   // search keywords
  why: `<p> ... 2–4 sentences, see "The why field" below ... </p>`,
  html: ` ... lesson body html ... `,
  widgets: { /* id -> config, see below */ },
});
```

## The `why` field (REQUIRED)

Every lesson MUST have a `why:` — 2–4 sentences of HTML (`<p>`, optionally two of them)
rendered in a highlighted "Why you're learning this" panel above the lesson body.
It is the first thing a beginner reads. Rules:

- **Plain language only.** Zero unexplained jargon — if the lesson teaches the term, the
  `why` must not assume it. Write for someone who has only done the previous lessons.
- **Concrete payoff.** Say what the reader will be able to *do*, *build*, or *finally
  understand* — a real bug it prevents, an error message it decodes, a thing every real
  program does. Not "this is important" or "this is fundamental".
- Where it helps, connect backward ("you've been typing this since Hello World — now you'll
  know what it means") or to the world (phones, games, error messages they've seen).
- `verify_lessons.js` fails any lesson whose `why` has fewer than 60 visible characters.

The `html` uses template literals. IMPORTANT: inside the template literal, escape any backtick
as \` and any `${` as \${. In `code:` strings, newlines in C string literals must be written
`\\n` (double backslash — it's inside a JS template literal).

## Lesson body HTML

Available elements (styled by the app — use them, no inline styles unless tiny tweaks):

- `<p>`, `<h2>`, `<h3>`, `<ul>/<ol>/<li>`, `<table>` with `<tr><th>…` rows — all pre-styled.
- Inline code: `<code>int</code>` — renders as a pill.
- Callouts:
  `<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>…</p></div></div>`
  Variants: `tip` (💡 advice), `warn` (⚠️ gotcha), `danger` (💀/⚠️ serious traps/UB), `fun` (🤔/🎉 trivia).
- Widget placeholder: `<div data-w="someId"></div>` — the config lives in `widgets.someId`.

## Structure & tone requirements

- Conversational, enthusiastic, precise. Second person ("you"). Humor welcome, fluff not.
- Explain WHY, not just what. Anticipate misconceptions and call them out.
- 3–6 `<h2>` sections per lesson. Short paragraphs (2–4 sentences).
- EVERY lesson must include, minimum: 2 code widgets, 2–3 quiz widgets spread through the
  lesson (not clumped at the end), and at least ONE visual/interactive widget
  (flow / trace / memgrid / bits / arrayviz / bigo / memmap / reveal) where it genuinely helps.
- Show terminal output with a `term` widget after significant code examples.
- End each lesson with a 1-sentence bridge to the next topic.
- All C code must be correct, compilable (unless demonstrating an error — then say so),
  and follow modern style: `int main(void)`, 4-space indent, C11/C17 baseline.
- Facts must be accurate per the C17/C23 standards. When behavior is
  implementation-defined or undefined, SAY SO explicitly.

## Widget reference (type -> config)

### code — highlighted code block
`{ type:'code', title:'file.c', code:`...`, run:false?, hl:[3,4]? }`
- `run:false` hides the "Try it" button (use for fragments/asm/broken code). Default shows it.
- `hl`: line numbers to highlight.

### term — terminal output
`{ type:'term', title:'terminal'?, text:`$ gcc a.c && ./a\noutput...` }`
Lines starting `$ ` render as prompt (green), `# ` as dim comment.

### quiz — multiple choice (2–4 options)
`{ type:'quiz', q:'Question, may contain <code>…</code>?', opts:['A','B','C','D'], a: 1, expl:'Why — shown after correct answer.', xp:20? }`
`a` is the 0-based index of the correct option. Vary the position of correct answers!

### reveal — think-then-reveal
`{ type:'reveal', label:'Think first', q:'What does this print?', answer:'<p>…explanation html…</p>' }`

### bits — interactive toggleable bits
`{ type:'bits', n:8, value:5, signed:false, label:'…', hint:'…' }`

### baseconv — dec/hex/bin/oct converter
`{ type:'baseconv', value:182, label:'…' }`

### enc — UTF-8 byte explorer for typed text
`{ type:'enc', initial:'Héllo' }`

### float32 — IEEE-754 explorer
`{ type:'float32', value:3.14, label:'…' }`

### memgrid — row of labeled memory cells
`{ type:'memgrid', label:'…', note:'html…', cells:[ {addr:'0x100', val:'42', name:'x', hl:true}, {addr:'0x104', val:'0x100', name:'p', hl2:true}, {freed:true,…} ] }`
`hl` = blue highlight, `hl2` = orange, `freed` = grayed out. Great for pointer diagrams:
put the address of one cell as the value of another and highlight both.

### memmap — vertical segment map (stack/heap/data/text)
`{ type:'memmap', label:'…' }` (default segments) or custom:
`{ type:'memmap', segs:[{name:'stack', desc:'…', c:'var(--magenta)'}, …], note:'' }`
(segs listed low-address-first; rendered top = high addresses.)

### flow — SVG flowchart on a grid (USE FOR CONTROL FLOW — if/while/for/switch etc.)
```
{ type:'flow', label:'…', colw:190?, rowh:92?,
  nodes:[ {id:'a', col:0, row:0, kind:'start', label:'start'},
          {id:'c', col:0, row:1, kind:'dec',   label:'i < 10 ?'},   // diamond
          {id:'b', col:0, row:2, kind:'proc',  label:'body\nsum += i'},// box (\n = 2 lines)
          {id:'p', col:1, row:1, kind:'io',    label:'printf'},     // parallelogram
          {id:'e', col:1, row:3, kind:'end',   label:'done'} ],
  edges:[ {from:'a', to:'c'}, {from:'c', to:'b', label:'yes'},
          {from:'c', to:'e', label:'no'},
          {from:'b', to:'c', side:'left', label:'loop'} ],          // side = loop-back arrow
  note:'caption html' }
```
Nodes on the same col connect vertically; same row connect horizontally; `side:'left'|'right'`
routes an elbow loop-back around the outside. Keep diagrams ≤ 4 cols × 6 rows.

### bigo — interactive complexity graph (curves toggle + n slider + hover)
`{ type:'bigo', curves:['1','logn','n','nlogn','n2','n3','2n'], off:['2n']?, maxN:50, sliderMax:120, label:'…', note:'…' }`

### trace — step-through code execution (POWERFUL — use for loops, recursion, pointers)
```
{ type:'trace', label:'…', title:'file.c', code:`...C code...`,
  steps:[ {line:3, vars:{i:0, sum:0}, out:'', note:'i starts at 0'},
          {line:4, vars:{i:0, sum:0}, out:'', note:'condition true — enter loop'},
          … ] }
```
`line` = 1-based line in `code` to highlight. `out` = accumulated stdout so far.
`vars` = full variable table at that step (changed values auto-flash). 6–20 steps.

### arrayviz — animated array algorithm (Part 7 mostly)
`{ type:'arrayviz', algo:'bubble'|'insertion'|'selection'|'quick'|'binary-search'|'linear-search', n:18, speed:260, label:'…' }`

### editor — embedded live editor exercise (compiles via cloud gcc)
`{ type:'editor', label:'Exercise: …', code:`starter code`, hint:'what to try', height:280, expect:'exact stdout'?, xp:30? }`
Use ~1 per lesson for hands-on practice with a concrete small task in the hint.

**Auto-checking:** when `expect` is set (or the exercise has an entry in
`js/expects.js`, keyed `lessonId:widgetKey`), the Run button diffs the program's
stdout against it — matching output shows a green PASS and awards `xp` (default
30) once; a mismatch shows an expected-vs-got panel. Comparison trims trailing
whitespace per line and trailing newlines. Rules:
- Only add `expect` when the hint defines ONE deterministic task. Output with
  addresses (`%p`), time, or unseeded `rand()` can never be checked.
- The expect value MUST come from actually compiling a reference solution
  (godbolt gcc, `-lm`) — never write it from memory.
- If the hint offers a bonus that changes the output, the expect targets the
  core task only.

## Verification

After writing your file, run `node --check lessons/partN.js` and fix any errors.
Then run `node verify_lessons.js partN` from the repo root — it loads curriculum + your file
and checks every required id is registered and every data-w placeholder has a widget config
(and vice versa). It must pass.
