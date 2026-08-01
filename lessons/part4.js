/* ============================================================
   Part 4 — The Preprocessor
   ============================================================ */

/* ---------------- include ---------------- */
CT.lesson({
  id: 'include',
  title: '#include: copy-paste as a language feature',
  minutes: 12, xp: 110,
  tags: 'include header guard pragma once search path gcc -E textual inclusion',
  why: `<p>You've pasted <code>#include &lt;stdio.h&gt;</code> at the top of every program since Hello World — today you find out what that line actually does. Spoiler: it quietly drops thousands of lines of other people's code into your file, which is why one tiny mistake can unleash pages of errors pointing at files you never wrote. It's also step one toward splitting your own programs across many files, the way every real app is built.</p>`,
  html: `
<p>You've typed <code>#include &lt;stdio.h&gt;</code> a hundred times by now. Time to learn what it <em>actually does</em> — because the answer is gloriously dumb: it <strong>deletes the line and pastes in the entire file</strong>. No imports, no modules, no magic. The preprocessor is a text editor that works very, very fast.</p>

<p>Every line starting with <code>#</code> is a <strong>preprocessor directive</strong> — an instruction to that fast text editor, not to the compiler — handled in a separate pass <em>before</em> the compiler ever reads a single line of your C code. This part of the course covers every last one of them.</p>

<h2>Textual inclusion, live</h2>
<p>Proof beats belief. Here's a two-file micro-project:</p>
<div data-w="code1"></div>
<div data-w="code2"></div>
<p>Now ask GCC to stop after preprocessing with <code>-E</code> and show us the text it hands to the compiler:</p>
<div data-w="term1"></div>
<p>The <code>#include "square.h"</code> line is gone — replaced by the header's contents. The <code># 1 "square.h"</code> lines are <em>linemarkers</em>: notes the preprocessor leaves so error messages can still point at the right file and line. (They'll matter again when we meet <code>#line</code>.)</p>

<div data-w="q1"></div>

<h2><code>&lt;angle brackets&gt;</code> vs <code>"quotes"</code></h2>
<p>Both forms include a file; they differ in <strong>where the preprocessor looks first</strong>:</p>
<table>
<tr><th>form</th><th>search order</th><th>use for</th></tr>
<tr><td><code>#include &lt;stdio.h&gt;</code></td><td>system directories only (<code>/usr/include</code>, compiler dirs, paths added with <code>-I</code>)</td><td>standard library &amp; installed libraries</td></tr>
<tr><td><code>#include "square.h"</code></td><td>the including file's own directory <em>first</em>, then the same places as <code>&lt;&gt;</code></td><td>your project's headers</td></tr>
</table>
<p>The exact search paths are implementation-defined, but every compiler follows this spirit. See yours with <code>gcc -E -v main.c</code>, and add your own directory with <code>gcc -Iinclude/ main.c</code>.</p>

<h2>The double-inclusion problem</h2>
<p>Copy-paste has a failure mode. Say <code>point.h</code> defines a struct, and both <code>main.c</code> and another header include it:</p>
<div data-w="code3"></div>
<div data-w="term2"></div>
<p><code>struct point</code> got pasted into <code>main.c</code> <strong>twice</strong> — once directly, once via <code>shapes.h</code> — and defining the same struct twice is an error. Function <em>declarations</em> can legally repeat, but struct definitions, typedefs (before C11), and initialized variables cannot. In any real project, headers including headers is unavoidable, so every header must defend itself.</p>

<h2>Include guards: the standard armor</h2>
<div data-w="code4"></div>
<p>Walk it through: the first time <code>point.h</code> is pasted, <code>POINT_H</code> isn't defined, so the <code>#ifndef</code> block is kept and <code>POINT_H</code> gets defined. The second paste sees <code>POINT_H</code> already defined and the preprocessor <strong>deletes everything down to <code>#endif</code></strong>:</p>
<div data-w="flow1"></div>

<div data-w="q2"></div>

<p>The alternative you'll see everywhere: <code>#pragma once</code> as the first line does the same job — shorter, immune to name-collision typos, and supported by every compiler you're likely to meet. But it's <em>not</em> in the C standard, while guards are bulletproof portable. Many codebases use both. Pick one style per project and be consistent.</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Guard-name trap:</b> two headers accidentally using the same guard macro (say, both picked <code>UTILS_H</code>) silently make the second one vanish. Use a unique name derived from the path, like <code>MYPROJ_NET_UTILS_H</code>. Names starting with underscores (<code>_POINT_H</code>, <code>__POINT_H</code>) are reserved for the implementation — don't.</p></div></div>

<h2>What belongs in a header?</h2>
<p>Rule of thumb: headers hold <strong>promises</strong> (declarations), <code>.c</code> files hold <strong>fulfillments</strong> (definitions). Function prototypes, struct/enum/typedef definitions, macros, and <code>extern</code> variable declarations go in <code>.h</code>. Function bodies and actual variable definitions go in <code>.c</code> — otherwise every file that includes your header gets its own copy, and the linker screams about duplicates. We'll build a full multi-file project in the last lesson of this part.</p>

<div data-w="q3"></div>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>Next: the directive that turns the preprocessor from a paste machine into a find-and-replace machine — <code>#define</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'square.h', run: false,
      code: `int square(int n);    /* a declaration — a promise */`
    },
    code2: {
      type: 'code', title: 'main.c', run: false,
      code: `#include "square.h"

int main(void) {
    return square(6);
}`
    },
    term1: {
      type: 'term', text: `$ gcc -E main.c
# 1 "main.c"
# 1 "<built-in>"
# 1 "<command-line>"
# 1 "main.c"
# 1 "square.h" 1
int square(int n);
# 2 "main.c" 2

int main(void) {
    return square(6);
}` },
    q1: { type: 'quiz', q: 'What does <code>#include "square.h"</code> literally do?', opts: ['Tells the linker to find square.h', 'Replaces the line with the full text of square.h', 'Loads square.h at runtime', 'Compiles square.h into a separate module'], a: 1, expl: 'Pure textual substitution, performed by the preprocessor before compilation. The compiler never even sees the #include line — only the pasted result.' },
    code3: {
      type: 'code', title: 'the double-inclusion setup — BROKEN', run: false,
      code: `/* point.h */
struct point { int x, y; };

/* shapes.h */
#include "point.h"
struct circle { struct point center; int r; };

/* main.c */
#include "point.h"
#include "shapes.h"     /* pastes point.h AGAIN */

int main(void) { struct point p = {1, 2}; return p.x; }`
    },
    term2: {
      type: 'term', text: `$ gcc main.c
In file included from shapes.h:1,
                 from main.c:2:
point.h:1:8: error: redefinition of 'struct point'
    1 | struct point { int x, y; };
      |        ^~~~~
point.h:1:8: note: originally defined here` },
    code4: {
      type: 'code', title: 'point.h — with include guard', run: false,
      code: `#ifndef POINT_H          /* "if POINT_H is NOT defined..."   */
#define POINT_H          /* ...define it, so next time it IS */

struct point { int x, y; };

#endif /* POINT_H */`
    },
    flow1: {
      type: 'flow', label: 'How an include guard survives a second paste', colw: 220, rowh: 92,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'point.h pasted\ninto main.c' },
        { id: 'd', col: 0, row: 1, kind: 'dec', label: 'POINT_H\ndefined?' },
        { id: 'keep', col: 0, row: 2, kind: 'proc', label: 'keep contents,\n#define POINT_H' },
        { id: 'skip', col: 1, row: 2, kind: 'proc', label: 'delete everything\nuntil #endif' },
        { id: 'e', col: 0, row: 3, kind: 'end', label: 'continue with\nrest of main.c' },
      ],
      edges: [
        { from: 's', to: 'd' },
        { from: 'd', to: 'keep', label: 'no (1st time)' },
        { from: 'd', to: 'skip', label: 'yes (2nd time)' },
        { from: 'keep', to: 'e' },
        { from: 'skip', to: 'e' },
      ],
      note: 'The guard makes the second and every later inclusion expand to <em>nothing</em>.',
    },
    q2: { type: 'quiz', q: 'Two different headers both use <code>#ifndef UTILS_H</code> as their guard. What happens when a file includes both?', opts: ['A compile error names the clash', 'Both work fine — guards are per-file', 'The second header silently expands to nothing', 'The preprocessor renames one guard'], a: 2, expl: 'The first header defines UTILS_H; the second header sees it already defined and its whole body is skipped. No error, just mysteriously missing declarations — which is why guard names must be unique per header.' },
    q3: { type: 'quiz', q: 'Which of these does NOT belong in a header file?', opts: ['A function prototype', 'A struct definition', 'A non-inline function body', 'A typedef'], a: 2, expl: 'A function body pasted into five .c files becomes five definitions of the same function — a linker error. Headers declare; .c files define. (Exceptions like <code>inline</code> and <code>static inline</code> come later.)' },
    ed1: {
      type: 'editor', label: 'Exercise: add include guards',
      height: 320,
      code: `/* The two blocks below simulate the SAME header pasted twice
   (which is exactly what double inclusion is).
   Add an include guard around EACH copy — same guard macro! —
   so the program compiles. */

/* --- paste #1 of point.h --- */
struct point { int x, y; };
/* --- end paste #1 --- */

/* --- paste #2 of point.h --- */
struct point { int x, y; };
/* --- end paste #2 --- */

#include <stdio.h>
int main(void) {
    struct point p = {3, 4};
    printf("(%d, %d)\\n", p.x, p.y);
    return 0;
}`,
      hint: 'Wrap each copy in #ifndef POINT_H / #define POINT_H ... #endif. Once both copies wear the same guard, the second one vanishes and the redefinition error disappears.',
    },
  },
});

/* ---------------- define-macros ---------------- */
CT.lesson({
  id: 'define-macros',
  title: '#define: object-like macros & text substitution',
  minutes: 12, xp: 110,
  tags: 'define macro undef predefined __FILE__ __LINE__ const enum text substitution',
  why: `<p>In a game where the number 64 means "max players" in ten different places, updating nine of them means you've shipped a bug. <code>#define</code> lets you name that number once and change it everywhere with a single edit, which is why real C code is full of ALL_CAPS names like <code>MAX_USERS</code>. You'll also see how this find-and-replace can quietly betray you, and how one pair of parentheses saves the day.</p>`,
  html: `
<p><code>#define</code> teaches the preprocessor a new word. From that line on, every time the word appears on its own as a name in your code, it's replaced by the text you gave — before compilation, with <strong>zero understanding of C</strong>. That last clause is where all the power and all the danger live.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>A macro like this — just a name and its replacement text, no parentheses after the name — is called an <em>object-like</em> macro, and it's the classic way to name a constant. Convention: macro names are <code>SCREAMING_SNAKE_CASE</code> — the all-caps shout warns readers "this is not a variable, it's a substitution."</p>

<h2>It really is just text</h2>
<p>The preprocessor doesn't compute <code>10+10</code> into 20. It stores the five characters <code>1</code>&nbsp;<code>0</code>&nbsp;<code>+</code>&nbsp;<code>1</code>&nbsp;<code>0</code> and pastes them wherever <code>SIZE</code> appears. Predict this one before peeking:</p>
<div data-w="code2"></div>
<div data-w="rev1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Rule zero of macros:</b> if the replacement text is an expression, <b>wrap it in parentheses</b>: <code>#define SIZE (10+10)</code>. You cannot control what precedence-sensitive context your macro gets pasted into.</p></div></div>

<div data-w="q1"></div>

<h2>Fine print on substitution</h2>
<ul>
<li>Macros are <b>not</b> replaced inside string literals: <code>printf("SIZE")</code> prints the word SIZE.</li>
<li>Nor inside other identifiers: <code>SIZES</code> or <code>my_SIZE</code> are untouched — replacement works on whole tokens, not substrings.</li>
<li>Macro definitions last until the end of the file — <em>scope means nothing</em> to the preprocessor. A <code>#define</code> inside a function still applies to every later function.</li>
<li>To retire a macro early, use <code>#undef SIZE</code>. It's rare, but handy when a library macro shadows something you need (e.g. the standard library is allowed to define function-like macros for its functions — <code>#undef getc</code> gets you the real function).</li>
</ul>

<h2>Macros the compiler defines for you</h2>
<p>The implementation predefines a set of magic macros, refreshed at each use site:</p>
<table>
<tr><th>macro</th><th>expands to</th><th>example</th></tr>
<tr><td><code>__FILE__</code></td><td>current file name (string)</td><td><code>"main.c"</code></td></tr>
<tr><td><code>__LINE__</code></td><td>current line number (int)</td><td><code>42</code></td></tr>
<tr><td><code>__DATE__</code> / <code>__TIME__</code></td><td>compilation date / time (strings)</td><td><code>"Aug  1 2026"</code></td></tr>
<tr><td><code>__STDC__</code></td><td><code>1</code> on a conforming compiler</td><td><code>1</code></td></tr>
<tr><td><code>__STDC_VERSION__</code></td><td>the C standard in use (long)</td><td>see below</td></tr>
<tr><td><code>__func__</code></td><td>enclosing function's name</td><td><code>"main"</code></td></tr>
</table>
<p>Pedantic gem: <code>__func__</code> is technically not a macro but a <em>predefined identifier</em> — it behaves like a local <code>static const char[]</code>, because the preprocessor has no idea what function it's in. Everyone lumps it in with these anyway.</p>
<p><code>__STDC_VERSION__</code> is how code detects the standard version:</p>
<table>
<tr><th>standard</th><th>__STDC_VERSION__</th></tr>
<tr><td>C89/C90</td><td>not defined (only <code>__STDC__</code>)</td></tr>
<tr><td>C95</td><td><code>199409L</code></td></tr>
<tr><td>C99</td><td><code>199901L</code></td></tr>
<tr><td>C11</td><td><code>201112L</code></td></tr>
<tr><td>C17</td><td><code>201710L</code></td></tr>
<tr><td>C23</td><td><code>202311L</code></td></tr>
</table>

<div data-w="code3"></div>
<div data-w="term3"></div>

<div data-w="q2"></div>

<h2>#define vs const vs enum</h2>
<p>C gives you three ways to name a constant, and they are genuinely different:</p>
<table>
<tr><th></th><th><code>#define MAX 100</code></th><th><code>const int max = 100;</code></th><th><code>enum { MAX = 100 };</code></th></tr>
<tr><td>has a type?</td><td>no — raw text</td><td>yes</td><td>yes (<code>int</code>)</td></tr>
<tr><td>obeys scope?</td><td>no</td><td>yes</td><td>yes</td></tr>
<tr><td>visible in debugger?</td><td>usually not</td><td>yes</td><td>yes</td></tr>
<tr><td>usable as case label / array size?</td><td>yes</td><td><b>no</b> (in C it's not a constant expression!)</td><td>yes (integers only)</td></tr>
</table>
<p>That third row surprises people coming from C++: in C, a <code>const int</code> is merely a read-only variable, so <code>int arr[max];</code> is a VLA and <code>case max:</code> is an error. For integer constants, <code>enum</code> gives you type + scope + constant-expression status — often the best of all worlds. (C23 finally adds a true <code>constexpr</code>; that story continues in Part 5.)</p>

<div data-w="q3"></div>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>Object-like macros substitute text; give them parameters and they substitute <em>parameterized</em> text — welcome to function-like macros, where the real footguns are stored.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'defines.c',
      code: `#include <stdio.h>

#define MAX_USERS 64
#define GREETING  "hello, "
#define PI        3.14159265358979

int main(void) {
    int slots[MAX_USERS];              /* becomes: int slots[64];  */
    printf(GREETING "world\\n");        /* string literals concat!  */
    printf("circumference: %f\\n", 2 * PI * 10);
    printf("slots: %zu\\n", sizeof slots / sizeof slots[0]);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc defines.c -o defines && ./defines
hello, world
circumference: 62.831853
slots: 64` },
    code2: {
      type: 'code', title: 'trap.c — predict the output', run: false,
      code: `#include <stdio.h>

#define SIZE 10+10        /* looks like 20... */

int main(void) {
    printf("%d\\n", SIZE);       /* line A */
    printf("%d\\n", SIZE * 2);   /* line B */
    return 0;
}`
    },
    rev1: {
      type: 'reveal', label: 'Think first', q: 'What do lines A and B print?',
      answer: '<p>Line A prints <b>20</b> — but line B prints <b>30</b>, not 40!</p><p>The substitution is textual: <code>SIZE * 2</code> becomes <code>10+10 * 2</code>, and multiplication binds tighter than addition, so it computes <code>10 + (10*2) = 30</code>. The preprocessor never saw "20"; it only ever saw five characters of text. The fix: <code>#define SIZE (10+10)</code>.</p>',
    },
    q1: { type: 'quiz', q: 'With <code>#define N 2+3</code>, what does <code>N * N</code> evaluate to?', opts: ['25', '11', '10', '13'], a: 1, expl: 'Textually: 2+3 * 2+3 → 2 + (3×2) + 3 = 11. Parenthesize the definition — (2+3) — and you would get 25 as intended.' },
    code3: {
      type: 'code', title: 'whoami.c',
      code: `#include <stdio.h>

int main(void) {
    printf("file: %s, line: %d\\n", __FILE__, __LINE__);
    printf("func: %s\\n", __func__);
    printf("built: %s %s\\n", __DATE__, __TIME__);
    printf("standard: %ld\\n", __STDC_VERSION__);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc whoami.c -o whoami && ./whoami
file: whoami.c, line: 4
func: main
built: Aug  1 2026 14:03:22
standard: 201710
# gcc's current default is C17 (201710L); try -std=c23` },
    q2: { type: 'quiz', q: 'Your code compiled with <code>-std=c11</code> checks <code>__STDC_VERSION__</code>. What value does it see?', opts: ['199901L', '201112L', '201710L', '11L'], a: 1, expl: 'The value encodes year and month of the standard: 2011-12 for C11. C99 is 199901L, C17 is 201710L, C23 is 202311L.' },
    q3: { type: 'quiz', q: 'Why does <code>const int max = 100; ... case max:</code> fail to compile in C?', opts: ['case labels must be literals only', 'In C a const variable is not a constant expression', 'const variables cannot be read in a switch', 'It compiles fine'], a: 1, expl: 'Unlike C++, C treats a const-qualified variable as a read-only object, not a compile-time constant. Case labels need integer constant expressions — use a macro, an enum constant, or (C23) constexpr.' },
    ed1: {
      type: 'editor', label: 'Exercise: fix the macro',
      height: 300,
      code: `#include <stdio.h>

/* This program SHOULD print an area of 400 and a perimeter
   of 80 for a 20x20 square... but the macro is buggy.
   Fix ONE line so both answers come out right. */

#define SIDE 15+5

int main(void) {
    printf("area:      %d\\n", SIDE * SIDE);
    printf("perimeter: %d\\n", 4 * SIDE);
    return 0;
}`,
      hint: 'Run it first: area comes out 95 and perimeter 65. Trace the textual expansion of SIDE * SIDE by hand, then add parentheses to the #define so the pasted text is safe in any expression.',
    },
  },
});

/* ---------------- function-macros ---------------- */
CT.lesson({
  id: 'function-macros',
  title: 'Function-like macros: power tools with no guard',
  minutes: 14, xp: 130,
  tags: 'macro function-like stringify paste ## __VA_ARGS__ variadic do while 0',
  why: `<p>A macro that squares a number can quietly turn <code>SQUARE(a + 1)</code> into 9 instead of 25 — a fifty-year-old trap that still bites professional codebases today. This lesson shows you exactly why, then hands you the defenses: the parenthesizing rules, the <code>do { } while (0)</code> trick the Linux kernel swears by, and the secret behind every "print the expression AND its value" debugging helper C programmers reach for.</p>`,
  html: `
<p>Add parentheses right after the macro name — <em>no space!</em> — and <code>#define</code> takes arguments, making a <em>function-like</em> macro: <code>#define SQUARE(x) x * x</code>. Now <code>SQUARE(7)</code> becomes <code>7 * 7</code>. It looks like a function, but remember the mantra: <strong>it's still just text</strong>. Arguments aren't worked out to a value and handed over the way a function's are — they're pasted, character for character.</p>

<h2>The classic disaster, in three acts</h2>
<div data-w="code1"></div>
<div data-w="rev1"></div>
<p>The repaired version parenthesizes each parameter: <code>#define SQUARE(x) (x) * (x)</code>. But that's still only half the armor:</p>
<div data-w="rev2"></div>
<p>Hence the <strong>full parenthesization rule</strong>: parentheses around <em>every parameter use</em> AND around the <em>whole replacement</em>:</p>
<div data-w="code2"></div>

<div data-w="q1"></div>

<p>And even the perfect version has one unfixable flaw — arguments that get pasted twice are <em>evaluated</em> twice:</p>
<div data-w="rev3"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Never pass expressions with side effects to a macro</b> (<code>i++</code>, function calls, assignments). <code>SQUARE(i++)</code> expands to <code>((i++) * (i++))</code> — two unsequenced modifications of <code>i</code>, which is <b>undefined behavior</b>, not merely "incremented twice". A real function evaluates its argument exactly once; a macro makes no such promise.</p></div></div>

<h2>Multi-statement macros: the <code>do { } while (0)</code> idiom</h2>
<p>Suppose a macro needs two statements. Wrapping them in bare braces seems reasonable — until the macro meets an <code>if</code>:</p>
<div data-w="code3"></div>
<p>Expansion of the bad version: the <code>if</code> owns the <code>{ ... }</code> block, then the user's semicolon becomes an <em>empty statement</em>, and the <code>else</code> is left dangling with nothing to attach to — a syntax error (or worse, silently wrong pairing in nested ifs). The cure is a loop that runs exactly once:</p>
<div data-w="code4"></div>
<p>Why it works: <code>do { ... } while (0)</code> is a <em>single statement that demands a semicolon</em> — so <code>SWAP(a, b);</code> behaves exactly like a function call in every grammatical position, including between <code>if</code> and <code>else</code>. Every serious C codebase (Linux kernel included) uses this idiom.</p>

<div data-w="q2"></div>

<h2>The <code>#</code> and <code>##</code> operators</h2>
<p>Two operators exist only inside macro replacement text:</p>
<ul>
<li><code>#param</code> — <b>stringify</b>: turns the argument's text into a string literal. <code>#x</code> with <code>x = score+1</code> gives <code>"score+1"</code>.</li>
<li><code>a ## b</code> — <b>token pasting</b>: glues two tokens into one new token. <code>val ## 2</code> makes the identifier <code>val2</code>.</li>
</ul>
<p>Stringify powers every debugging macro ever written — print the expression <em>and</em> its value without typing it twice:</p>
<div data-w="code5"></div>
<div data-w="term5"></div>
<p>Note the trick: <code>#expr " = %d\\n"</code> works because adjacent string literals are concatenated. Token pasting shines in code generators — one macro stamping out families of declarations: <code>DECLARE_LIST(int)</code> can mint <code>list_int_push</code>, <code>list_int_pop</code>, and friends via <code>list_ ## T ## _push</code>.</p>

<h2>Variadic macros: <code>__VA_ARGS__</code></h2>
<p>Since C99, a macro's parameter list may end in <code>...</code>, and <code>__VA_ARGS__</code> expands to whatever extra arguments were passed — tailor-made for wrapping <code>printf</code>-style functions:</p>
<div data-w="code6"></div>
<div data-w="term6"></div>
<p>One wrinkle: with the C99 rules, <code>LOG("boot")</code> — no extra args — leaves a dangling comma after <code>__LINE__,</code>. C23 fixes this cleanly with <code>__VA_OPT__(x)</code>, which expands to <code>x</code> only if variadic arguments are present: <code>__LINE__ __VA_OPT__(,) __VA_ARGS__</code>. (Before C23, GCC and Clang offered <code>, ## __VA_ARGS__</code> as an extension that swallows the comma.)</p>

<div data-w="q3"></div>

<h2>Macro or function? A field guide</h2>
<table>
<tr><th></th><th>macro</th><th>function</th></tr>
<tr><td>type checking</td><td>none — text</td><td>full</td></tr>
<tr><td>argument evaluated</td><td>0, 1, or many times</td><td>exactly once</td></tr>
<tr><td>works on any type</td><td>yes ("generic" for free)</td><td>one signature</td></tr>
<tr><td>can use <code>sizeof</code>/types/<code>#</code></td><td>yes</td><td>no</td></tr>
<tr><td>debugger &amp; error messages</td><td>see the expansion, ouch</td><td>clean</td></tr>
<tr><td>address can be taken</td><td>no</td><td>yes</td></tr>
</table>
<p>Modern advice: prefer real functions (the compiler inlines them beautifully — see the <code>inline</code> lesson), and reserve macros for what functions <em>cannot</em> do: stringifying, token pasting, using <code>__FILE__</code>/<code>__LINE__</code> at the call site, and type-generic tricks.</p>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>You now command substitution; next comes the preprocessor's other superpower — making whole regions of code appear or vanish with <code>#if</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'square1.c — naive version', run: false,
      code: `#include <stdio.h>

#define SQUARE(x) x * x

int main(void) {
    int a = 4;
    printf("%d\\n", SQUARE(3));      /* fine: 3 * 3 = 9   */
    printf("%d\\n", SQUARE(a + 1));  /* ...uh oh          */
    return 0;
}`
    },
    rev1: {
      type: 'reveal', label: 'Think first', q: 'SQUARE(a + 1) with a = 4 — what prints?',
      answer: '<p><b>9</b>, not 25! The paste is literal: <code>SQUARE(a + 1)</code> → <code>a + 1 * a + 1</code> → <code>4 + (1×4) + 1 = 9</code>. The macro never saw the value 5 — it saw the three tokens <code>a</code>, <code>+</code>, <code>1</code> and dropped them into a precedence minefield.</p>',
    },
    rev2: {
      type: 'reveal', label: 'Think first', q: 'With <code>#define SQUARE(x) (x) * (x)</code>, what does <code>100 / SQUARE(5)</code> give?',
      answer: '<p><b>100</b>, not 4. Expansion: <code>100 / (5) * (5)</code>. Division and multiplication associate left-to-right: <code>(100/5) × 5 = 100</code>. The parameters were protected but the <em>whole expression</em> was not — it needs an outer set: <code>((x) * (x))</code>.</p>',
    },
    code2: {
      type: 'code', title: 'square-final.c — the armored version', run: false,
      code: `/* every parameter use wrapped + the whole body wrapped */
#define SQUARE(x) ((x) * (x))

/* the same discipline, always: */
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define ABS(x)    ((x) < 0 ? -(x) : (x))`
    },
    q1: { type: 'quiz', q: 'Why must a macro body like <code>(x) * (x)</code> get one MORE pair of parentheses around the whole thing?', opts: ['Style guides require it', 'Operators outside the macro can still tear the expression apart, e.g. <code>100 / SQUARE(5)</code>', 'The preprocessor rejects unparenthesized bodies', 'To make the macro evaluate arguments once'], a: 1, expl: 'Inner parens protect against precedence inside the arguments; the outer pair protects against precedence at the call site. Neither can fix double evaluation — that is inherent to pasting.' },
    rev3: {
      type: 'reveal', label: 'Danger — think first', q: 'int i = 4; int r = SQUARE(i++); — what are r and i afterwards?',
      answer: '<p>Trick question: <b>anything at all</b>. The expansion <code>((i++) * (i++))</code> modifies <code>i</code> twice with no sequence point between — that is <b>undefined behavior</b> per the standard. You might see r=16, i=6 today, and something else after a compiler upgrade. UB means all bets are off, not "probably 20".</p>',
    },
    code3: {
      type: 'code', title: 'swap-bad.c — braces are not enough', run: false,
      code: `#define SWAP(a, b) { int t = (a); (a) = (b); (b) = t; }

void order(int x, int y) {
    if (x > y)
        SWAP(x, y);      /* expands to { ... } ;   */
    else                 /* error: 'else' without a previous 'if' */
        x = y;
}`
    },
    code4: {
      type: 'code', title: 'swap-good.c — the do/while(0) idiom', run: false,
      code: `#define SWAP(a, b) do { int t = (a); (a) = (b); (b) = t; } while (0)

void order(int x, int y) {
    if (x > y)
        SWAP(x, y);      /* one statement + required ';' — perfect */
    else
        x = y;           /* compiles, and pairs correctly */
}`
    },
    q2: { type: 'quiz', q: 'What problem does <code>do { ... } while (0)</code> solve in a macro?', opts: ['It makes the body run faster', 'It lets the macro return a value', 'It turns multiple statements into ONE statement that needs a trailing semicolon, so if/else around the macro parses correctly', 'It prevents double evaluation of arguments'], a: 2, expl: 'A brace block plus the user’s semicolon breaks if/else pairing; do/while(0) is a single statement that eats the semicolon naturally. It does nothing about double evaluation.' },
    code5: {
      type: 'code', title: 'dump.c — # stringify in action',
      code: `#include <stdio.h>

#define DUMP(expr) printf(#expr " = %d\\n", (expr))

int main(void) {
    int score = 40, bonus = 2;
    DUMP(score);
    DUMP(score + bonus);
    DUMP(score * bonus + 1);
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc dump.c -o dump && ./dump
score = 40
score + bonus = 42
score * bonus + 1 = 81
# the expression text AND its value — typed only once` },
    code6: {
      type: 'code', title: 'log.c — variadic macro',
      code: `#include <stdio.h>

#define LOG(fmt, ...) \\
    fprintf(stderr, "[%s:%d] " fmt "\\n", \\
            __FILE__, __LINE__, __VA_ARGS__)

int main(void) {
    int users = 3;
    LOG("startup ok, %d users", users);
    LOG("temp=%d limit=%d", 71, 80);
    return 0;
}`
    },
    term6: { type: 'term', text: `$ gcc log.c -o log && ./log
[log.c:9] startup ok, 3 users
[log.c:10] temp=71 limit=80` },
    q3: { type: 'quiz', q: 'What does C23’s <code>__VA_OPT__(,)</code> do in a variadic macro?', opts: ['Expands to a comma only when variadic arguments were actually passed', 'Counts the variadic arguments', 'Stringifies the variadic arguments', 'Makes the comma operator sequence the arguments'], a: 0, expl: 'It solves the dangling-comma problem: LOG("boot") with zero extra args would otherwise leave "..., __LINE__," hanging. __VA_OPT__ emits its content only if __VA_ARGS__ is non-empty.' },
    ed1: {
      type: 'editor', label: 'Exercise: write a bulletproof MAX macro',
      height: 320,
      code: `#include <stdio.h>

/* Write MAX(a, b) as a function-like macro that yields the
   larger argument. Full armor: parenthesize every parameter
   use AND the whole body. Hint: the ?: operator. */

#define MAX(a, b)   /* your macro here */

int main(void) {
    printf("%d\\n", MAX(3, 7));            /* want: 7  */
    printf("%d\\n", MAX(2 + 3, 4));        /* want: 5  */
    printf("%d\\n", 10 + MAX(1, 2));       /* want: 12 */
    printf("%d\\n", MAX(-5, -9));          /* want: -5 */
    return 0;
}`,
      hint: 'Shape: ((a) > (b) ? (a) : (b)) — then check each test case. The 2 + 3 case fails without parens on the parameters; the 10 + MAX case fails without the outer pair.',
    },
  },
});

/* ---------------- conditional-compilation ---------------- */
CT.lesson({
  id: 'conditional-compilation',
  title: 'Conditional compilation: code that decides to exist',
  minutes: 11, xp: 110,
  tags: 'if ifdef ifndef elif else endif defined platform DEBUG -D feature test',
  why: `<p>One game's source code can build on both Windows and Linux, even though each system needs code the other can't even compile — and the chatty "debug mode" messages developers rely on vanish completely from the version players download, at zero cost in speed. Both feats are the same trick: code that gets erased before the compiler ever looks at it. Soon you'll be flipping whole features on and off with a single compiler flag.</p>`,
  html: `
<p>An <code>if</code> statement chooses at <em>runtime</em>. The preprocessor's <code>#if</code> chooses at <em>build time</em> — while your program is being compiled — and the losing side isn't skipped, it's <strong>deleted before the compiler ever sees it</strong>. That deleted code can call functions that only exist on another operating system, sit half-written, or make no sense at all: deleted text can't cause errors.</p>

<h2>The directive family</h2>
<table>
<tr><th>directive</th><th>meaning</th></tr>
<tr><td><code>#if expr</code></td><td>keep block if the constant expression is non-zero</td></tr>
<tr><td><code>#ifdef NAME</code></td><td>shorthand for <code>#if defined(NAME)</code></td></tr>
<tr><td><code>#ifndef NAME</code></td><td>shorthand for <code>#if !defined(NAME)</code> (hello, include guards)</td></tr>
<tr><td><code>#elif expr</code></td><td>else-if chain</td></tr>
<tr><td><code>#else</code> / <code>#endif</code></td><td>fallback / mandatory closer</td></tr>
<tr><td><code>#elifdef</code> / <code>#elifndef</code></td><td>C23 shorthands for <code>#elif defined</code> / <code>#elif !defined</code></td></tr>
</table>
<p>The expression after <code>#if</code> is an integer constant expression evaluated by the preprocessor: arithmetic, comparisons, <code>&amp;&amp;</code>/<code>||</code>, and the special operator <code>defined(NAME)</code>, which is 1 if the macro exists (regardless of its value). No <code>sizeof</code>, no casts, no floats, no enum constants — the preprocessor knows only macros and integers.</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Sneaky rule:</b> in a <code>#if</code> expression, any identifier that is <em>not</em> a defined macro silently becomes <code>0</code>. So <code>#if VERSOIN &gt;= 2</code> (typo!) is always false — no error, no warning by default. GCC's <code>-Wundef</code> catches this; turn it on.</p></div></div>

<div data-w="q1"></div>

<h2>Platform detection</h2>
<p>Compilers predefine macros that identify the target OS — the standard way to write portable code with unportable pieces:</p>
<div data-w="code1"></div>
<div data-w="flow1"></div>
<p>Only ONE of those branches survives preprocessing — on Linux, the compiler literally never sees the string <code>"Windows"</code>. That's why the Windows branch could call <code>&lt;windows.h&gt;</code> functions that don't exist on Linux, and still build fine there.</p>

<div data-w="q2"></div>

<h2>Debug builds: <code>-D</code> defines macros from the command line</h2>
<p>The most-used pattern in all of C: log verbosely in development, compile the logging away entirely in release. The switch is <code>gcc -DDEBUG</code>, which acts exactly like a <code>#define DEBUG 1</code> at the top of every file:</p>
<div data-w="code2"></div>
<div data-w="term1"></div>
<p>In the release build the <code>DBG</code> calls expand to <code>((void)0)</code> — a statement that does nothing and costs nothing. Zero runtime overhead, not even a branch. You can also pass values (<code>-DLEVEL=3</code>) and un-define with <code>-U</code>.</p>

<div data-w="q3"></div>

<h2><code>#if 0</code>: the nuclear comment</h2>
<div data-w="code3"></div>
<p>C's <code>/* */</code> comments <b>don't nest</b> — commenting out code that contains comments breaks at the first <code>*/</code>. <code>#if 0 ... #endif</code> blocks nest with other conditionals and swallow (almost) anything, making them the standard way to disable a chunk of code temporarily. Just don't ship code full of them.</p>

<h2>Feature-test macros: the reverse direction</h2>
<p>Conditionals also flow the other way: <em>you</em> define macros to ask system headers for more. POSIX functions like <code>getline</code> or <code>clock_gettime</code> are hidden behind guards inside glibc's headers; defining <code>_POSIX_C_SOURCE 200809L</code> (or <code>_GNU_SOURCE</code> for everything) <em>before any #include</em> unlocks them. If a man page mentions a feature-test macro requirement, this is what it means.</p>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>Conditionals decide what compiles — the next lesson covers the directives that talk back: errors, warnings, and pragmas.</p>
`,
  widgets: {
    q1: { type: 'quiz', q: 'In <code>#if MY_FLAG == 1</code>, what happens if <code>MY_FLAG</code> was never defined?', opts: ['Preprocessor error: unknown identifier', 'The identifier is treated as 0, so the block is skipped', 'The block is kept as a safe default', 'The compiler asks the linker'], a: 1, expl: 'Undefined identifiers in #if expressions quietly evaluate to 0 — a rich source of typo bugs. Compile with -Wundef to get warned.' },
    code1: {
      type: 'code', title: 'platform.c',
      code: `#include <stdio.h>

#if defined(_WIN32)
    #define PLATFORM "Windows"
#elif defined(__APPLE__)
    #define PLATFORM "macOS"
#elif defined(__linux__)
    #define PLATFORM "Linux"
#else
    #define PLATFORM "something exotic"
#endif

int main(void) {
    printf("compiled for: %s\\n", PLATFORM);
    return 0;
}`
    },
    flow1: {
      type: 'flow', label: 'Preprocessing platform.c on a Linux box', colw: 200, rowh: 88,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'preprocessor\nreads #if chain' },
        { id: 'w', col: 0, row: 1, kind: 'dec', label: '_WIN32\ndefined?' },
        { id: 'a', col: 0, row: 2, kind: 'dec', label: '__APPLE__\ndefined?' },
        { id: 'l', col: 0, row: 3, kind: 'dec', label: '__linux__\ndefined?' },
        { id: 'keep', col: 1, row: 3, kind: 'proc', label: 'keep Linux branch,\ndelete all others' },
        { id: 'e', col: 1, row: 4, kind: 'end', label: 'compiler sees\nonly one #define' },
      ],
      edges: [
        { from: 's', to: 'w' },
        { from: 'w', to: 'a', label: 'no' },
        { from: 'a', to: 'l', label: 'no' },
        { from: 'l', to: 'keep', label: 'yes' },
        { from: 'keep', to: 'e' },
      ],
      note: 'Dead branches are removed as text — they are never parsed, type-checked, or compiled.',
    },
    q2: { type: 'quiz', q: 'On Linux, what does the compiler (not the preprocessor) see of the <code>_WIN32</code> branch?', opts: ['It sees it but skips code generation', 'It sees it as a comment', 'Nothing — the text was deleted before parsing', 'It compiles it into a disabled section'], a: 2, expl: 'That is the superpower of conditional compilation: the dead branch can reference Windows-only headers and functions, because on Linux that text simply no longer exists after preprocessing.' },
    code2: {
      type: 'code', title: 'app.c — the DEBUG pattern',
      code: `#include <stdio.h>

#ifdef DEBUG
    #define DBG(...) fprintf(stderr, "[debug] " __VA_ARGS__)
#else
    #define DBG(...) ((void)0)   /* expands to nothing useful */
#endif

int main(void) {
    int items = 3;
    DBG("starting up, items=%d\\n", items);
    printf("processed %d items\\n", items);
    DBG("done\\n");
    return 0;
}`
    },
    term1: {
      type: 'term', text: `$ gcc app.c -o app && ./app
processed 3 items
# release build: DBG lines cost literally zero instructions
$ gcc -DDEBUG app.c -o app && ./app
[debug] starting up, items=3
processed 3 items
[debug] done` },
    q3: { type: 'quiz', q: 'What does the <code>-DDEBUG</code> compiler flag do?', opts: ['Enables the debugger', 'Acts like <code>#define DEBUG 1</code> before the first line of each file', 'Disables optimizations', 'Defines DEBUG only inside main()'], a: 1, expl: '-DNAME defines NAME as 1 (or -DNAME=value for a specific value) for the whole translation unit — the command-line twin of #define. -UNAME un-defines. The debugger flag is -g; optimizations are -O.' },
    code3: {
      type: 'code', title: 'if0.c — disabling a block that contains comments', run: false,
      code: `#if 0
    /* old algorithm — kept for reference */
    total = slow_sum(data, n);   /* O(n^2), ouch */
#endif
    total = fast_sum(data, n);

/* trying the same with a comment would die here ^ at
   the FIRST */ ... because block comments do not nest */`
    },
    ed1: {
      type: 'editor', label: 'Exercise: build a verbosity switch',
      height: 340,
      code: `#include <stdio.h>

/* 1. Run as-is: only the "result" line prints.
   2. Uncomment the #define and run again: the trace appears.
   3. Bonus: change VERBOSE to a LEVEL with a value, and use
      "#if LEVEL >= 2" for the extra-chatty line. */

/* #define VERBOSE */

#ifdef VERBOSE
    #define TRACE(...) printf("[trace] " __VA_ARGS__)
#else
    #define TRACE(...) ((void)0)
#endif

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 4; i++) {
        sum += i;
        TRACE("i=%d sum=%d\\n", i, sum);
    }
    printf("result: %d\\n", sum);
    return 0;
}`,
      hint: 'For the bonus: #define LEVEL 2, then guard the per-iteration TRACE with "#if LEVEL >= 2" / #endif, and add a LEVEL >= 1 summary trace before the result. Remember: #if needs a numeric macro, and an undefined name counts as 0.',
    },
  },
});

/* ---------------- pragma-error-line ---------------- */
CT.lesson({
  id: 'pragma-error-line',
  title: '#error, #warning, #pragma, #line — and a taste of #embed',
  minutes: 12, xp: 120,
  tags: 'error warning pragma pack once diagnostic _Pragma line embed C23',
  why: `<p>Sometimes an install fails with one clear line — "requires a 64-bit system" — instead of pages of gibberish. That's a program refusing to build on purpose, with a message a human wrote, and <code>#error</code> is how you'll do the same. Along the way you'll learn how to make a struct match a file format or network message byte-for-byte, and how C23 finally lets you drop an image straight into a program with one line.</p>`,
  html: `
<p>You've now met the two big preprocessor jobs: pasting (<code>#include</code>, <code>#define</code>) and choosing (<code>#if</code>). This lesson collects the remaining directives — the ones that <em>talk to the compiler</em> and to whoever is reading its output.</p>

<h2><code>#error</code>: refuse to compile</h2>
<p>Sometimes the right move is to stop the build with a human-readable message. Paired with <code>#if</code>, it turns silent assumptions into loud requirements:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Details worth knowing: with <code>-std=c90</code>, <code>__STDC_VERSION__</code> isn't defined at all, so it evaluates to 0 and the check fires. And notice we tested <code>LONG_MAX</code> from <code>&lt;limits.h&gt;</code> rather than <code>sizeof(long)</code> — because <strong>the preprocessor cannot evaluate <code>sizeof</code></strong>. It runs before the compiler, so it has no idea how big anything is; limit macros are the workaround. (Part 5's <code>static_assert</code> handles compile-time checks that <em>do</em> need real type knowledge.)</p>

<p><code>#warning "message"</code> is the gentler sibling: it prints the message and compilation continues. It was a common extension for decades and became standard in C23. Classic use: <code>#warning "TODO: replace this stub before release"</code>.</p>

<div data-w="q1"></div>

<h2><code>#pragma</code>: vendor-specific dials</h2>
<p><code>#pragma</code> is the standard's official escape hatch: implementation-defined instructions to the compiler, ignored if unrecognized. Three you'll actually meet:</p>
<h3>1. <code>#pragma once</code></h3>
<p>The include-guard alternative from the <code>#include</code> lesson — first line of a header, done.</p>
<h3>2. <code>#pragma pack</code>: squeezing struct padding</h3>
<p>Compilers insert invisible padding bytes into structs so each member sits at its natural alignment (full story in Part 5). <code>#pragma pack(1)</code> tells the compiler: no padding, pack tight — essential when a struct must mirror a file format or network packet byte-for-byte:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<div data-w="mg1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p>Packed structs are not free: on some CPUs, misaligned loads are slow; on a few (and with vector instructions) they can crash outright. Worse, taking a pointer to a misaligned member and passing it around is undefined behavior territory. Pack only at the I/O boundary, then copy into normal structs.</p></div></div>

<div data-w="q2"></div>

<h3>3. <code>#pragma GCC diagnostic</code>: surgical warning control</h3>
<div data-w="code3"></div>
<p><code>push</code> saves the current warning state, <code>ignored</code> silences one warning, <code>pop</code> restores everything — so the exception stays scoped to the few lines that earn it, instead of nuking the warning project-wide with a compiler flag.</p>

<h2><code>_Pragma</code>: the operator form</h2>
<p><code>#pragma</code> has one fatal flaw: a macro can't expand into a directive — <code>#</code> lines aren't produced by expansion. C99 added the operator <code>_Pragma("string")</code>, which <em>is</em> usable in macros:</p>
<div data-w="code4"></div>

<h2><code>#line</code>: lying about where you are</h2>
<p><code>#line 42 "original.src"</code> sets what <code>__LINE__</code> and <code>__FILE__</code> report from that point on. Why would anyone want that? <strong>Code generators.</strong> Tools like bison/yacc, or anything that compiles another language into C, emit <code>#line</code> markers pointing back at the <em>user's</em> source — so when the generated C fails to compile, the error message points at <code>parser.y:17</code> (the file the human wrote), not <code>parser.tab.c:3841</code> (the machine-made noise). The linemarkers you saw in <code>gcc -E</code> output are the same mechanism.</p>
<div data-w="code5"></div>
<div data-w="term5"></div>

<div data-w="q3"></div>

<h2>C23 teaser: <code>#embed</code></h2>
<p>For fifty years, shipping a binary asset (icon, font, firmware blob) inside a C program meant writing a script to convert it into a giant <code>{0x89, 0x50, ...}</code> initializer. C23 finally builds that in:</p>
<div data-w="code6"></div>
<p>The preprocessor expands the file into a comma-separated list of byte values. Freshly landed in GCC 15 and Clang 19 — more C23 goodies await in Part 5.</p>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>That's every directive in the language — the finale of this part puts them all to work designing clean multi-file projects.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'requirements.c', run: false,
      code: `#include <limits.h>

#if !defined(__STDC_VERSION__) || __STDC_VERSION__ < 201112L
    #error "This project requires C11 or newer (try -std=c17)"
#endif

#if LONG_MAX < 9223372036854775807
    #error "This code assumes 64-bit long — 32-bit targets unsupported"
#endif

int main(void) { return 0; }`
    },
    term1: {
      type: 'term', text: `$ gcc -std=c17 requirements.c && echo OK
OK
$ gcc -std=c90 requirements.c
requirements.c:4:6: error: #error "This project requires C11 or newer (try -std=c17)"
# the build stops immediately, with YOUR message` },
    q1: { type: 'quiz', q: 'Why check <code>LONG_MAX</code> instead of <code>sizeof(long)</code> in a <code>#if</code>?', opts: ['LONG_MAX is faster to evaluate', 'sizeof is spelled differently in the preprocessor', 'The preprocessor runs before the compiler and cannot evaluate sizeof at all', 'sizeof(long) is undefined behavior'], a: 2, expl: 'Preprocessing is pure text-and-integer work with no type knowledge; sizeof in a #if is just an undefined identifier (= 0) followed by a syntax error. Limit macros from limits.h are the preprocessor-friendly mirror of type sizes.' },
    code2: {
      type: 'code', title: 'pack.c',
      code: `#include <stdio.h>

struct loose {            /* natural alignment (default) */
    char  tag;            /* 1 byte  + 3 padding         */
    int   value;          /* 4 bytes                     */
    short id;             /* 2 bytes + 2 tail padding    */
};

#pragma pack(push, 1)     /* save state, then pack tight */
struct tight {
    char  tag;
    int   value;
    short id;
};
#pragma pack(pop)         /* restore normal alignment    */

int main(void) {
    printf("loose: %zu bytes\\n", sizeof(struct loose));
    printf("tight: %zu bytes\\n", sizeof(struct tight));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc pack.c -o pack && ./pack
loose: 12 bytes
tight: 7 bytes
# 5 of the 12 bytes were invisible padding` },
    mg1: {
      type: 'memgrid', label: 'struct loose — 12 bytes on a typical 64-bit target',
      cells: [
        { addr: '+0', val: 'tag', name: 'char', hl: true },
        { addr: '+1', val: '·', name: 'pad', freed: true },
        { addr: '+2', val: '·', name: 'pad', freed: true },
        { addr: '+3', val: '·', name: 'pad', freed: true },
        { addr: '+4', val: 'val', name: 'int', hl2: true },
        { addr: '+5', val: 'val', hl2: true },
        { addr: '+6', val: 'val', hl2: true },
        { addr: '+7', val: 'val', hl2: true },
        { addr: '+8', val: 'id', name: 'short', hl: true },
        { addr: '+9', val: 'id', hl: true },
        { addr: '+10', val: '·', name: 'pad', freed: true },
        { addr: '+11', val: '·', name: 'pad', freed: true },
      ],
      note: 'Grayed cells are padding: 3 bytes so <code>value</code> starts at a multiple of 4, and 2 tail bytes so an array of these keeps every element aligned. <code>#pragma pack(1)</code> deletes all five (exact layout is implementation-defined).',
    },
    q2: { type: 'quiz', q: 'When is <code>#pragma pack(1)</code> genuinely the right tool?', opts: ['Always — padding wastes memory', 'When a struct must match an on-disk or on-wire byte layout exactly', 'To speed up member access', 'To make sizeof portable across compilers'], a: 1, expl: 'Packing exists for I/O boundaries: file headers, network packets, memory-mapped hardware. Everywhere else, padding is your friend — aligned members are faster and pointer-safe.' },
    code3: {
      type: 'code', title: 'diagnostic.c — scoped warning silence', run: false,
      code: `#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
    legacy_init(cfg);      /* we know, we know — scheduled for v3 */
#pragma GCC diagnostic pop
/* from here on, the warning is active again */`
    },
    code4: {
      type: 'code', title: 'pragma-op.c — pragmas from macros', run: false,
      code: `/* impossible with #pragma: macros cannot expand into '#' lines */
#define SILENCE_DEPRECATED \\
    _Pragma("GCC diagnostic push") \\
    _Pragma("GCC diagnostic ignored \\"-Wdeprecated-declarations\\"")
#define RESTORE_DIAGNOSTICS \\
    _Pragma("GCC diagnostic pop")

SILENCE_DEPRECATED
/* ... legacy calls ... */
RESTORE_DIAGNOSTICS`
    },
    code5: {
      type: 'code', title: 'lineliar.c',
      code: `#include <stdio.h>

int main(void) {
    printf("really at %s:%d\\n", __FILE__, __LINE__);
#line 500 "grammar.y"
    printf("now 'at' %s:%d\\n", __FILE__, __LINE__);
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc lineliar.c -o lineliar && ./lineliar
really at lineliar.c:4
now 'at' grammar.y:500
# compile errors after the #line would ALSO blame grammar.y` },
    q3: { type: 'quiz', q: 'Why do code-generating tools (bison, etc.) emit <code>#line</code> directives into the C they produce?', opts: ['To make the generated file shorter', 'So compiler errors point at the file the human wrote, not the generated C', 'To speed up preprocessing', 'To renumber lines after macros expand'], a: 1, expl: 'A syntax error in generated C is almost always caused by the source the tool consumed. #line redirects __FILE__/__LINE__ — and therefore every diagnostic — back to that original file and line.' },
    code6: {
      type: 'code', title: 'logo.c — C23', run: false,
      code: `/* C23: the file's bytes become the initializer, at preprocess time */
static const unsigned char logo_png[] = {
#embed "logo.png"
};

/* before C23 you needed xxd -i logo.png > logo.h, or objcopy */`
    },
    ed1: {
      type: 'editor', label: 'Exercise: enforce and inspect',
      height: 340,
      code: `#include <stdio.h>
#include <limits.h>

/* 1. Add a preprocessor check that #errors unless the code is
      compiled as C11 or newer (mind the "not defined" case!).
   2. Then add a 'struct tight' clone of 'struct rec' wrapped in
      #pragma pack(push, 1) / #pragma pack(pop), and print its
      sizeof too. Predict both numbers before running. */

struct rec {
    char  kind;
    long  serial;
    short flags;
};

int main(void) {
    printf("rec:   %zu bytes\\n", sizeof(struct rec));
    /* printf("tight: %zu bytes\\n", sizeof(struct tight)); */
    return 0;
}`,
      hint: 'The version check: #if !defined(__STDC_VERSION__) || __STDC_VERSION__ < 201112L then #error, #endif. Expect rec to be 24 bytes (7 bytes of padding around the 8-byte long) and tight to be 11.',
    },
  },
});

/* ---------------- header-organization ---------------- */
CT.lesson({
  id: 'header-organization',
  title: 'Header organization: designing multi-file programs',
  minutes: 14, xp: 130,
  tags: 'header interface implementation extern prototype opaque pointer forward declaration multi-file',
  why: `<p>A modern app is thousands of files written by people who never read each other's code — this lesson shows how that's even possible. You'll split your own programs into small files that cooperate through clean "contracts", and discover that <code>FILE *</code>, which you've used since your very first <code>printf</code>, is exactly the hide-the-insides trick you're about to pull off yourself.</p>`,
  html: `
<p>Real programs aren't one file. They're dozens of <code>.c</code> files compiled separately and then <em>linked</em> — stitched together into one program — and headers are the <strong>contracts</strong> that let them cooperate without seeing each other's internals. This lesson turns everything from this part into a real plan for organizing whole programs.</p>

<h2>Declaration vs definition, one more time</h2>
<p>The whole system rests on one distinction:</p>
<ul>
<li>A <b>declaration</b> announces that something exists: <code>double mean(const double *xs, size_t n);</code> or <code>extern int mu_calls;</code>. Repeat it in ten files — no problem.</li>
<li>A <b>definition</b> actually creates it: a function body, or <code>int mu_calls = 0;</code>. There must be <b>exactly one</b> across the whole program, or the linker rejects the build.</li>
</ul>
<p>Since a header gets pasted into every file that includes it, the rule writes itself: <strong>headers may contain only things that are safe to duplicate</strong>.</p>
<table>
<tr><th>goes in the .h (interface)</th><th>goes in the .c (implementation)</th></tr>
<tr><td>function prototypes</td><td>function bodies</td></tr>
<tr><td><code>struct</code>/<code>enum</code>/<code>union</code> definitions, <code>typedef</code>s</td><td>variable definitions (<code>int mu_calls = 0;</code>)</td></tr>
<tr><td><code>extern</code> variable declarations</td><td><code>static</code> helpers private to the file</td></tr>
<tr><td>macros, <code>inline</code> function definitions</td><td>the header's own <code>#include "self.h"</code> (see below)</td></tr>
</table>

<div data-w="q1"></div>

<h2>A complete mini-project</h2>
<p>Three files: an interface, its implementation, and a client.</p>
<div data-w="code1"></div>
<div data-w="code2"></div>
<div data-w="code3"></div>
<p>Notes on the details that separate pros from beginners:</p>
<ul>
<li><code>mathutil.c</code> includes <em>its own header</em> first — so the compiler cross-checks the prototypes against the definitions. Mismatch the signature and you get a compile error <em>now</em> instead of linker weirdness or UB later.</li>
<li>The header includes <code>&lt;stddef.h&gt;</code> because its prototypes use <code>size_t</code>. <b>Headers must include what they use</b> — never rely on the includer having pulled in the right things first.</li>
<li><code>mu_calls</code> is <em>declared</em> <code>extern</code> in the header (a promise), <em>defined</em> once in <code>mathutil.c</code>. Drop the <code>extern</code> and every includer would define its own copy — a linker error.</li>
<li><code>clamp2</code>'s helper status: marked <code>static</code>, it's invisible outside <code>mathutil.c</code> — the C way of saying "private".</li>
</ul>
<div data-w="term1"></div>
<p>Each <code>.c</code> file compiles independently — that's what makes big projects buildable in parallel and rebuildable incrementally (only recompile what changed — the job of <code>make</code>, coming in Part 8):</p>
<div data-w="flow1"></div>

<div data-w="q2"></div>

<h2>Forward declarations: cutting the include web</h2>
<p>Headers including headers including headers makes builds slow and dependencies tangled. Often you don't need a type's full definition — a pointer to it is enough:</p>
<div data-w="code4"></div>
<p><code>struct logger;</code> is a <em>forward declaration</em>: it names an <strong>incomplete type</strong>. You can declare pointers to it and pass them around; you just can't dereference it, take its <code>sizeof</code>, or copy it by value. Since <code>engine.h</code> only handles <code>struct logger *</code>, it doesn't need — and shouldn't pay for — <code>logger.h</code>.</p>

<h2>The opaque pointer pattern</h2>
<p>Take that idea to its logical end and you get C's flagship encapsulation technique. The header declares that a type <em>exists</em>, but its layout lives only in the <code>.c</code> file:</p>
<div data-w="code5"></div>
<div data-w="code6"></div>
<p>Client code can hold a <code>Stack *</code> and call the functions, but <code>s-&gt;top</code> won't even compile — the compiler doesn't know the struct has a <code>top</code>. The implementation can be completely rewritten (array today, linked list tomorrow) <strong>without touching or even recompiling client code</strong>, as long as the function signatures hold. This is exactly how <code>FILE *</code> works: you've been using an opaque pointer since your first <code>printf</code>.</p>

<div data-w="q3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Header checklist:</b> ① include guard (or <code>#pragma once</code>) · ② includes only what its own declarations need · ③ no function bodies (except <code>static inline</code>) · ④ no variable definitions, <code>extern</code> declarations only · ⑤ hide struct layouts that clients shouldn't touch.</p></div></div>

<h2>Try it</h2>
<div data-w="ed1"></div>

<p>🎩 The preprocessor is fully yours — next, Part 5 steps into the modern era: <code>static_assert</code>, alignment control, generics, atomics, and the shiniest corners of C23.</p>
`,
  widgets: {
    q1: { type: 'quiz', q: 'Which line, placed in a header included by 5 files, causes a LINKER error?', opts: ['<code>extern int count;</code>', '<code>int count = 0;</code>', '<code>struct cfg { int n; };</code> (with include guard)', '<code>void reset(void);</code>'], a: 1, expl: 'That is a definition — pasted into 5 translation units it creates 5 objects named count, and the linker reports multiple definition. Declarations (extern, prototypes) and guarded type definitions are safe to repeat.' },
    code1: {
      type: 'code', title: 'mathutil.h — the interface', run: false,
      code: `#ifndef MATHUTIL_H
#define MATHUTIL_H

#include <stddef.h>     /* the header uses size_t, so IT includes this */

/* prototypes: promises kept by mathutil.c */
double mean(const double *xs, size_t n);
double clamp(double x, double lo, double hi);

/* declared here, defined exactly once in mathutil.c */
extern int mu_calls;

#endif /* MATHUTIL_H */`
    },
    code2: {
      type: 'code', title: 'mathutil.c — the implementation', run: false,
      code: `#include "mathutil.h"   /* self-include: compiler checks our promises */

int mu_calls = 0;               /* THE definition of mu_calls */

/* static = private to this file; no other .c can call it */
static double clamp2(double x, double lo, double hi) {
    return x < lo ? lo : (x > hi ? hi : x);
}

double mean(const double *xs, size_t n) {
    mu_calls++;
    double sum = 0.0;
    for (size_t i = 0; i < n; i++)
        sum += xs[i];
    return n ? sum / (double)n : 0.0;
}

double clamp(double x, double lo, double hi) {
    mu_calls++;
    return clamp2(x, lo, hi);
}`
    },
    code3: {
      type: 'code', title: 'main.c — the client', run: false,
      code: `#include <stdio.h>
#include "mathutil.h"    /* only the contract, never the internals */

int main(void) {
    double temps[] = {21.5, 40.2, 19.8, 22.1};
    double avg = mean(temps, 4);

    printf("mean:    %.2f\\n", avg);
    printf("clamped: %.2f\\n", clamp(avg, 0.0, 25.0));
    printf("calls:   %d\\n", mu_calls);
    return 0;
}`
    },
    term1: {
      type: 'term', text: `$ gcc -c mathutil.c        # → mathutil.o
$ gcc -c main.c            # → main.o (mathutil.c not needed!)
$ gcc main.o mathutil.o -o app
$ ./app
mean:    25.90
clamped: 25.00
calls:   2` },
    flow1: {
      type: 'flow', label: 'Separate compilation, then one link', colw: 200, rowh: 88,
      nodes: [
        { id: 'h', col: 1, row: 0, kind: 'start', label: 'mathutil.h\n(pasted into both)' },
        { id: 'mc', col: 0, row: 1, kind: 'proc', label: 'main.c\ngcc -c' },
        { id: 'uc', col: 2, row: 1, kind: 'proc', label: 'mathutil.c\ngcc -c' },
        { id: 'mo', col: 0, row: 2, kind: 'proc', label: 'main.o\ncalls mean = ???' },
        { id: 'uo', col: 2, row: 2, kind: 'proc', label: 'mathutil.o\ndefines mean' },
        { id: 'ld', col: 1, row: 3, kind: 'end', label: 'linker\nresolves ??? → app' },
      ],
      edges: [
        { from: 'h', to: 'mc', label: '#include' },
        { from: 'h', to: 'uc', label: '#include' },
        { from: 'mc', to: 'mo' },
        { from: 'uc', to: 'uo' },
        { from: 'mo', to: 'ld' },
        { from: 'uo', to: 'ld' },
      ],
      note: 'main.o compiles knowing only the <em>declarations</em>; the linker later wires calls to the one real definition.',
    },
    q2: { type: 'quiz', q: 'Why does <code>mathutil.c</code> include its own header?', opts: ['Otherwise the linker cannot find it', 'So the compiler verifies the definitions match the published prototypes', 'To make mu_calls global', 'Headers must be included somewhere or gcc warns'], a: 1, expl: 'With the header in view, defining mean with a wrong signature is an immediate compile error. Skip the self-include and the mismatch survives until link time — or worse, until runtime UB with a wrong calling convention.' },
    code4: {
      type: 'code', title: 'engine.h — forward declaration instead of #include', run: false,
      code: `#ifndef ENGINE_H
#define ENGINE_H

struct logger;                 /* forward declaration: incomplete type */

struct engine *engine_start(struct logger *log);
/* pointers to incomplete types are fine — no logger.h needed! */

#endif`
    },
    code5: {
      type: 'code', title: 'stack.h — opaque interface', run: false,
      code: `#ifndef STACK_H
#define STACK_H
#include <stdbool.h>

typedef struct Stack Stack;    /* exists... but layout is secret */

Stack *stack_new(void);
void   stack_push(Stack *s, int value);
int    stack_pop(Stack *s);
bool   stack_empty(const Stack *s);
void   stack_free(Stack *s);

#endif`
    },
    code6: {
      type: 'code', title: 'stack.c — the secret layout', run: false,
      code: `#include "stack.h"
#include <stdlib.h>

struct Stack {                 /* only THIS file knows the fields  */
    int  data[64];
    int  top;
};

Stack *stack_new(void) {
    Stack *s = malloc(sizeof *s);
    if (s) s->top = 0;
    return s;
}
void stack_push(Stack *s, int value) { s->data[s->top++] = value; }
int  stack_pop(Stack *s)             { return s->data[--s->top]; }
bool stack_empty(const Stack *s)     { return s->top == 0; }
void stack_free(Stack *s)            { free(s); }`
    },
    q3: { type: 'quiz', q: 'Client code holds a <code>Stack *s</code> from the opaque header. What happens on <code>s-&gt;top</code>?', opts: ['Works — pointers can always be dereferenced', 'Linker error: top not found', 'Compile error: the struct type is incomplete in this file', 'Runtime crash'], a: 2, expl: 'The client only saw "typedef struct Stack Stack;" — an incomplete type. Member access needs the full definition, which lives solely in stack.c. That is encapsulation, enforced by the compiler. FILE * from stdio.h works the same way.' },
    ed1: {
      type: 'editor', label: 'Exercise: extend the module',
      height: 380,
      code: `#include <stdio.h>
#include <stddef.h>

/* One file here stands in for three: the marked sections are the
   header, the implementation, and the client. Add a function
   'double maxv(const double *xs, size_t n);' to the module:
   prototype in the header section, body in the implementation
   section, call in main. */

/* ---------- "mathutil.h" (interface) ---------- */
double mean(const double *xs, size_t n);
extern int mu_calls;
/* ---------------------------------------------- */

/* ---------- "mathutil.c" (implementation) ----- */
int mu_calls = 0;
double mean(const double *xs, size_t n) {
    mu_calls++;
    double sum = 0.0;
    for (size_t i = 0; i < n; i++) sum += xs[i];
    return n ? sum / (double)n : 0.0;
}
/* ---------------------------------------------- */

/* ---------- "main.c" (client) ----------------- */
int main(void) {
    double xs[] = {3.5, 9.25, 4.0, 7.5};
    printf("mean: %.2f\\n", mean(xs, 4));
    /* printf("max:  %.2f\\n", maxv(xs, 4)); */
    printf("calls: %d\\n", mu_calls);
    return 0;
}`,
      hint: 'Three edits, one per section: the prototype (a promise), the definition (start best at xs[0] and loop from i = 1 — remember to bump mu_calls), and the uncommented call. Expected output: mean 6.06, max 9.25, calls 2.',
    },
  },
});
