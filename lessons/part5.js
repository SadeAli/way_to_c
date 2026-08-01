/* ============================================================
   Part 5 — Modern C (C11 → C23)
   ============================================================ */

/* ---------------- static-assert ---------------- */
CT.lesson({
  id: 'static-assert',
  title: 'static_assert: catch bugs before the program even exists',
  minutes: 10, xp: 100,
  tags: '_Static_assert static_assert compile time check assert C11 C23',
  why: `<p>Plenty of crashes in shipped software are just assumptions nobody ever wrote down — "an <code>int</code> is 4 bytes here", "this table has an entry for every enum value". Today you learn the one-line habit that makes the compiler <em>refuse to build</em> your program until an assumption actually holds. A bug caught that way can never reach anyone's machine, because the broken binary is never created at all.</p>`,
  html: `
<p>You already know <code>assert()</code> from debugging: it checks a condition <em>while the program runs</em> and aborts if it's false. But some bugs can be caught much, much earlier — before an executable is even produced. That's what C11's <strong><code>_Static_assert</code></strong> is for: an assertion the <em>compiler</em> checks, at compile time, for free.</p>

<div data-w="flow1"></div>

<h2>Compile time vs run time</h2>
<p>The difference is enormous. A failed <code>assert()</code> crashes in front of your users, on their machine, at 3 a.m. A failed <code>static_assert</code> refuses to compile on <em>your</em> machine — the broken binary never exists. The trade-off: a static assert can only check things the compiler can compute — <strong>integer constant expressions</strong> like <code>sizeof</code>, enum values, and arithmetic on literals. It cannot check user input, file contents, or anything known only at runtime.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Notice where the asserts live: <em>at file scope</em>, outside any function. That's allowed — a static assert is a declaration, so it can appear at file scope, inside functions, and even inside a <code>struct</code> definition. Nothing runs; the compiler simply evaluates the condition while parsing.</p>

<div data-w="q1"></div>

<h2>Watching one fail</h2>
<p>Here's the payoff. Suppose your code genuinely assumes <code>long</code> is 8 bytes (say, you pack pointers into longs). Add the assert, and on any platform where that's false — 32-bit Linux, or Windows where <code>long</code> is 4 bytes even in 64-bit builds — the build stops cold with <em>your</em> message:</p>

<div data-w="term2"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Rule of thumb:</b> every time you catch yourself <em>assuming</em> something about sizes, layout, or ranges ("an int is 4 bytes here", "this struct matches the wire format"), write the assumption down as a <code>static_assert</code>. Assumptions rot; asserts don't.</p></div></div>

<h2>Three spellings, one feature</h2>
<table>
<tr><th>standard</th><th>how you write it</th></tr>
<tr><td>C11 / C17</td><td><code>_Static_assert(expr, "message")</code> — the keyword; <code>&lt;assert.h&gt;</code> adds the nicer macro <code>static_assert</code></td></tr>
<tr><td>C23</td><td><code>static_assert</code> is a real keyword (no header needed), and the message is <em>optional</em>: <code>static_assert(sizeof(int) == 4);</code></td></tr>
</table>
<p>Why the ugly <code>_Static_assert</code> spelling first? Backwards compatibility: names starting with underscore + capital are reserved, so old code that happened to define its own <code>static_assert</code> couldn't break. C23 finally promoted the pretty name once the world had caught up. You'll see the same <code>_Ugly</code> → <code>pretty</code> pattern all through this part.</p>

<div data-w="q2"></div>

<h2>Real-world use: keeping tables in sync</h2>
<p>A classic maintenance bug: an enum grows, but a parallel array of names doesn't. Six months later someone indexes past the end. A static assert turns that silent landmine into an instant compile error:</p>

<div data-w="code2"></div>

<p>Add <code>OP_DIV</code> to the enum and forget the string? The build fails with "op_names[] out of sync" — pointing you at the exact fix. This pattern (a <code>_COUNT</code> sentinel plus a static assert) is everywhere in production C.</p>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Next up: another thing the compiler knows at compile time — how your data must be <b>aligned</b> in memory, and how to query and control it.</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'Where each kind of assert fires', colw: 210, rowh: 88,
      nodes: [
        { id: 'src', col: 0, row: 0, kind: 'start', label: 'your .c file' },
        { id: 'comp', col: 0, row: 1, kind: 'proc', label: 'compiler runs\nstatic_assert checked' },
        { id: 'ok', col: 0, row: 2, kind: 'dec', label: 'condition\ntrue?' },
        { id: 'err', col: 1, row: 2, kind: 'end', label: 'compile ERROR\nno binary made' },
        { id: 'run', col: 0, row: 3, kind: 'proc', label: './a.out runs\nassert() checked' },
        { id: 'rok', col: 0, row: 4, kind: 'dec', label: 'condition\ntrue?' },
        { id: 'abrt', col: 1, row: 4, kind: 'end', label: 'abort() — crash\nat the user\'s desk' },
        { id: 'fine', col: 0, row: 5, kind: 'end', label: 'all good' },
      ],
      edges: [
        { from: 'src', to: 'comp' },
        { from: 'comp', to: 'ok' },
        { from: 'ok', to: 'err', label: 'no' },
        { from: 'ok', to: 'run', label: 'yes' },
        { from: 'run', to: 'rok' },
        { from: 'rok', to: 'abrt', label: 'no' },
        { from: 'rok', to: 'fine', label: 'yes' },
      ],
      note: 'A static_assert failure means the bug never leaves your machine. An assert() failure means it already did.',
    },
    code1: {
      type: 'code', title: 'check.c',
      code: `#include <assert.h>   /* gives you the static_assert macro (C11/C17) */
#include <stdio.h>

/* Write your assumptions down — at file scope, checked while parsing: */
static_assert(sizeof(int) == 4,  "this code assumes 32-bit int");
static_assert(sizeof(void *) == 8, "this code assumes 64-bit pointers");

/* Classic ABI check: a network packet header must be EXACTLY 8 bytes */
struct packet {
    unsigned char  type;
    unsigned char  flags;
    unsigned short len;
    unsigned int   seq;
};
static_assert(sizeof(struct packet) == 8, "packet layout broke!");

int main(void) {
    printf("all compile-time checks passed before main() existed\\n");
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 check.c -o check && ./check
all compile-time checks passed before main() existed
# the asserts cost NOTHING at runtime — they left no trace in the binary` },
    term2: { type: 'term', title: 'the same file on 32-bit / Windows', text: `$ gcc -std=c17 check.c -o check
check.c:6:1: error: static assertion failed: "this code assumes 64-bit pointers"
    6 | static_assert(sizeof(void *) == 8, "this code assumes 64-bit pointers");
      | ^~~~~~~~~~~~~
# build stops. No binary. The bug is caught at the earliest possible moment.` },
    q1: { type: 'quiz', q: 'Which of these can <code>static_assert</code> check?', opts: ['That a file exists on disk', 'That <code>sizeof(long) == 8</code>', 'That user input is positive', 'That malloc succeeded'], a: 1, expl: 'Only integer constant expressions — things the compiler can compute without running the program. Files, input, and malloc results exist only at runtime; those need assert() or real error handling.' },
    q2: { type: 'quiz', q: 'What did C23 change about static asserts?', opts: ['They can now check runtime values', '<code>static_assert</code> became a keyword and the message became optional', 'They were removed in favor of assert()', 'They now abort at runtime instead'], a: 1, expl: 'C23 promoted static_assert from an assert.h macro to a true keyword, and made the second argument optional: static_assert(sizeof(int) == 4); is now legal.' },
    code2: {
      type: 'code', title: 'opsync.c',
      code: `#include <assert.h>
#include <stdio.h>

enum op { OP_ADD, OP_SUB, OP_MUL, OP_COUNT };   /* _COUNT sentinel trick */

static const char *op_names[] = { "add", "sub", "mul" };

/* If the enum and the table ever disagree, the BUILD breaks — not prod: */
static_assert(sizeof(op_names) / sizeof(op_names[0]) == OP_COUNT,
              "op_names[] out of sync with enum op");

int main(void) {
    for (int i = 0; i < OP_COUNT; i++)
        printf("op %d = %s\\n", i, op_names[i]);
    return 0;
}`
    },
    ed1: {
      type: 'editor', label: 'Exercise: make the build fail, then fix it', height: 300,
      code: `#include <assert.h>
#include <stdio.h>

enum color { RED, GREEN, BLUE, COLOR_COUNT };

/* Oops — someone added BLUE to the enum but not here: */
static const char *color_names[] = { "red", "green" };

int main(void) {
    printf("colors: %d\\n", (int)COLOR_COUNT);
    return 0;
}`,
      hint: 'Add a static_assert that color_names has exactly COLOR_COUNT entries. Compile — it should FAIL with your message. Then add "blue" to the table and watch it pass. Bonus: assert that sizeof(double) == 8.'
    },
    q3: { type: 'quiz', q: 'Why must <code>static_assert</code> messages help future readers, e.g. "packet must match wire format"?', opts: ['The message is printed every run', 'The message becomes the compile error someone sees years later', 'The linker requires unique messages', 'Messages are mandatory in C23'], a: 1, expl: 'When the assert finally fires — often on a new platform, years later — your message IS the diagnostic. "Assertion failed: 1 == 2" helps nobody; a sentence explaining the assumption fixes the bug in minutes. (And C23 actually made messages optional, not mandatory.)' },
  },
});

/* ---------------- alignment ---------------- */
CT.lesson({
  id: 'alignment',
  title: 'Alignment: why your struct is bigger than its parts',
  minutes: 13, xp: 120,
  tags: '_Alignas alignas _Alignof alignof padding aligned_alloc max_align_t cache',
  why: `<p>Ask C for a struct whose members add up to 6 bytes and <code>sizeof</code> reports 12 — half of it invisible empty space. In this lesson you find out where those hidden bytes go, and you pick up a 60-second member-reordering trick that can cut a program's memory use by a third when it stores millions of objects (game entities, chat messages, log records).</p>`,
  html: `
<p>Add up the members of <code>struct { char a; int b; char c; }</code>: 1 + 4 + 1 = 6 bytes. Ask <code>sizeof</code> and you get <strong>12</strong>. Where did 6 bytes go? The answer is <strong>alignment</strong> — one of those invisible rules that quietly shapes every byte of memory your program touches.</p>

<h2>What alignment is</h2>
<p>Hardware doesn't read memory one byte at a time; it moves fixed-size chunks (4, 8, 16 bytes) that start at addresses divisible by their size. A type's <em>alignment requirement</em> says which addresses it may live at: a 4-byte <code>int</code> wants an address divisible by 4, an 8-byte <code>double</code> one divisible by 8.</p>

<div data-w="grid1"></div>
<div data-w="grid2"></div>

<p>Why care? Three big reasons. <b>Speed:</b> a misaligned value can straddle two hardware chunks — two loads plus stitching instead of one. <b>Correctness:</b> some CPUs (older ARM, SPARC) flat-out fault on misaligned access, and in C, accessing a misaligned object is <em>undefined behavior</em> anyway. <b>Special instructions:</b> atomics and SIMD vector loads often <em>require</em> alignment — a 16-byte SSE load from a non-16-byte address crashes.</p>

<div data-w="q1"></div>

<h2>Querying: <code>alignof</code></h2>
<p>C11 added the keyword <code>_Alignof</code> (with a friendly <code>alignof</code> macro in <code>&lt;stdalign.h&gt;</code>; in C23 <code>alignof</code> is simply a keyword). It tells you any type's requirement:</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p><code>max_align_t</code> (from <code>&lt;stddef.h&gt;</code>) has the strictest alignment of any standard type — and <code>malloc</code> guarantees its results are aligned for it. That's why you can malloc anything without thinking about alignment.</p>

<h2>Struct padding — and the reordering trick</h2>
<p>Now the mystery solves itself. Inside a struct, every member must land on its own aligned offset, so the compiler inserts invisible <strong>padding bytes</strong>. And the struct's total size must be a multiple of its largest member's alignment (so arrays of it stay aligned). Here's our 12-byte struct:</p>

<div data-w="grid3"></div>

<p>But padding depends on <em>order</em>, and order is yours to choose. Sort members largest-first and the holes vanish:</p>

<div data-w="grid4"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Free memory optimization:</b> ordering struct members from largest to smallest alignment never loses, and often shrinks the struct by 30–50%. For a struct allocated a million times, that's real megabytes. Confirm your layout with <code>offsetof</code> from <code>&lt;stddef.h&gt;</code> — and lock it in with a <code>static_assert</code> on <code>sizeof</code>!</p></div></div>

<div data-w="q2"></div>

<h2>Forcing it: <code>alignas</code> and <code>aligned_alloc</code></h2>
<p>Sometimes the natural alignment isn't enough. Two threads hammering variables that share a 64-byte cache line will slow each other down ("false sharing"); SIMD code wants 16- or 32-byte buffers. C11's <code>_Alignas</code> / <code>alignas</code> over-aligns an object, and <code>aligned_alloc</code> does the same for the heap:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Rules:</b> <code>alignas</code> can only <em>increase</em> alignment (you can't ask for less than the type needs), and the value must be a power of two. For <code>aligned_alloc(align, size)</code>, keep <code>size</code> a multiple of <code>align</code> — that's the portable contract — and free with plain <code>free()</code>.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Alignment is about <em>where</em> values live; next we tackle a C11 feature about <em>which code runs</em> for each type — <code>_Generic</code>, C's answer to overloading.</p>
`,
  widgets: {
    grid1: {
      type: 'memgrid', label: 'Aligned: int at address 0x04 (divisible by 4)',
      cells: [
        { addr: '0x00', val: '·', name: '' },
        { addr: '0x01', val: '·', name: '' },
        { addr: '0x02', val: '·', name: '' },
        { addr: '0x03', val: '·', name: '' },
        { addr: '0x04', val: 'i', name: 'byte 0', hl: true },
        { addr: '0x05', val: 'i', name: 'byte 1', hl: true },
        { addr: '0x06', val: 'i', name: 'byte 2', hl: true },
        { addr: '0x07', val: 'i', name: 'byte 3', hl: true },
      ],
      note: 'The whole int sits inside one 4-byte hardware chunk (0x04–0x07): <b>one</b> memory access.',
    },
    grid2: {
      type: 'memgrid', label: 'Misaligned: the same int at address 0x03',
      cells: [
        { addr: '0x00', val: '·', name: '' },
        { addr: '0x01', val: '·', name: '' },
        { addr: '0x02', val: '·', name: '' },
        { addr: '0x03', val: 'i', name: 'byte 0', hl2: true },
        { addr: '0x04', val: 'i', name: 'byte 1', hl2: true },
        { addr: '0x05', val: 'i', name: 'byte 2', hl2: true },
        { addr: '0x06', val: 'i', name: 'byte 3', hl2: true },
        { addr: '0x07', val: '·', name: '' },
      ],
      note: 'Straddles the chunk boundary at 0x04 — two loads plus bit-stitching on x86, a hardware fault on stricter CPUs, and undefined behavior per the C standard either way.',
    },
    q1: { type: 'quiz', q: 'A type with alignment 8 may live at which addresses?', opts: ['Any address', 'Only even addresses', 'Addresses divisible by 8', 'Addresses ending in 8'], a: 2, expl: 'Alignment N means the address must be a multiple of N. 0x1000, 0x1008, 0x7ffe10 are fine for alignment 8; 0x1004 is not.' },
    code1: {
      type: 'code', title: 'alignof.c',
      code: `#include <stdio.h>
#include <stdalign.h>   /* alignof / alignas macros (C11–C17)  */
#include <stddef.h>     /* max_align_t                          */

struct mix { char c; double d; };

int main(void) {
    printf("char        : size %2zu  align %2zu\\n", sizeof(char),        alignof(char));
    printf("short       : size %2zu  align %2zu\\n", sizeof(short),       alignof(short));
    printf("int         : size %2zu  align %2zu\\n", sizeof(int),         alignof(int));
    printf("double      : size %2zu  align %2zu\\n", sizeof(double),      alignof(double));
    printf("struct mix  : size %2zu  align %2zu\\n", sizeof(struct mix),  alignof(struct mix));
    printf("max_align_t : size %2zu  align %2zu\\n", sizeof(max_align_t), alignof(max_align_t));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 alignof.c -o alignof && ./alignof
char        : size  1  align  1
short       : size  2  align  2
int         : size  4  align  4
double      : size  8  align  8
struct mix  : size 16  align  8
max_align_t : size 32  align 16
# a struct inherits the STRICTEST alignment among its members
# (values are typical x86-64 Linux — alignment is implementation-defined)` },
    grid3: {
      type: 'memgrid', label: 'struct { char a; int b; char c; } — sizeof = 12',
      cells: [
        { addr: '+0', val: 'a', name: 'char', hl: true },
        { addr: '+1', val: '', name: 'pad', freed: true },
        { addr: '+2', val: '', name: 'pad', freed: true },
        { addr: '+3', val: '', name: 'pad', freed: true },
        { addr: '+4', val: 'b', name: 'int', hl2: true },
        { addr: '+5', val: 'b', name: 'int', hl2: true },
        { addr: '+6', val: 'b', name: 'int', hl2: true },
        { addr: '+7', val: 'b', name: 'int', hl2: true },
        { addr: '+8', val: 'c', name: 'char', hl: true },
        { addr: '+9', val: '', name: 'pad', freed: true },
        { addr: '+10', val: '', name: 'pad', freed: true },
        { addr: '+11', val: '', name: 'pad', freed: true },
      ],
      note: '3 bytes wasted so <code>b</code> lands on offset 4, then 3 more at the tail so an array element keeps <code>b</code> aligned. Half the struct is air.',
    },
    grid4: {
      type: 'memgrid', label: 'Reordered: struct { int b; char a; char c; } — sizeof = 8',
      cells: [
        { addr: '+0', val: 'b', name: 'int', hl2: true },
        { addr: '+1', val: 'b', name: 'int', hl2: true },
        { addr: '+2', val: 'b', name: 'int', hl2: true },
        { addr: '+3', val: 'b', name: 'int', hl2: true },
        { addr: '+4', val: 'a', name: 'char', hl: true },
        { addr: '+5', val: 'c', name: 'char', hl: true },
        { addr: '+6', val: '', name: 'pad', freed: true },
        { addr: '+7', val: '', name: 'pad', freed: true },
      ],
      note: 'Same members, same information — 33% smaller, just by sorting largest-first.',
    },
    q2: { type: 'quiz', q: 'Why does the compiler pad <code>struct { char a; int b; }</code> to 8 bytes instead of 5?', opts: ['To leave room for future members', 'So <code>b</code> starts at offset 4, and array elements stay aligned', 'Because sizeof must be a power of two', 'It’s a gcc bug you can disable'], a: 1, expl: 'b needs a 4-divisible offset, so 3 pad bytes go after a. Tail padding then rounds the size to a multiple of the struct’s alignment so element [1] of an array is aligned too. (sizeof being a power of two is a coincidence here — a struct of 3 ints is 12.)' },
    code2: {
      type: 'code', title: 'alignas.c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <stdalign.h>

/* keep two hot counters on SEPARATE 64-byte cache lines */
struct counters {
    alignas(64) long a;
    alignas(64) long b;
};

int main(void) {
    alignas(16) unsigned char simd_buf[64];   /* SSE-load ready */

    struct counters c;
    printf("&c.a = %p\\n&c.b = %p\\n", (void *)&c.a, (void *)&c.b);
    printf("sizeof(struct counters) = %zu\\n", sizeof(struct counters));
    printf("simd_buf %% 16 == %lu\\n", (unsigned long)simd_buf % 16);

    /* heap version: 32-byte-aligned block (size = multiple of align!) */
    double *v = aligned_alloc(32, 8 * sizeof(double));
    printf("v        %% 32 == %lu\\n", (unsigned long)(void *)v % 32);
    free(v);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c17 alignas.c -o alignas && ./alignas
&c.a = 0x7ffc5a3c1e80
&c.b = 0x7ffc5a3c1ec0
sizeof(struct counters) = 128
simd_buf % 16 == 0
v        % 32 == 0
# 0x...e80 and 0x...ec0 are 64 apart — each counter owns its cache line` },
    ed1: {
      type: 'editor', label: 'Exercise: shrink this struct from 24 to 16 bytes', height: 320,
      code: `#include <stdio.h>
#include <stddef.h>

struct msg {          /* members add up to 14 bytes... */
    char   tag;       /* 1 */
    double value;     /* 8 */
    char   flag;      /* 1 */
    int    count;     /* 4 */
};

int main(void) {
    printf("sizeof(struct msg) = %zu\\n", sizeof(struct msg));
    printf("tag@%zu value@%zu flag@%zu count@%zu\\n",
           offsetof(struct msg, tag),  offsetof(struct msg, value),
           offsetof(struct msg, flag), offsetof(struct msg, count));
    return 0;
}`,
      hint: 'Run it: 24 bytes. Reorder the members (largest alignment first: double, int, then the chars) and get it down to 16. Watch the offsetof values change. Bonus: add a static_assert(sizeof(struct msg) == 16, "...") to lock it in.'
    },
    q3: { type: 'quiz', q: 'What does <code>malloc</code> guarantee about alignment?', opts: ['Nothing — use aligned_alloc always', 'Results are aligned for max_align_t, enough for any standard type', 'Results are always 4096-byte aligned', 'Alignment equal to the requested size'], a: 1, expl: 'malloc returns memory suitably aligned for ANY object with fundamental alignment — i.e. aligned to alignof(max_align_t) (16 on typical x86-64). You only need aligned_alloc for OVER-alignment, like 32-byte AVX buffers or page-aligned I/O.' },
  },
});

/* ---------------- generic-selection ---------------- */
CT.lesson({
  id: 'generic-selection',
  title: '_Generic: compile-time dispatch on type',
  minutes: 12, xp: 120,
  tags: '_Generic generic selection tgmath overloading type dispatch macro C11',
  why: `<p>Call <code>abs(-2.5)</code> and C quietly answers <code>2</code> — wrong — because C keeps a separate absolute-value function for every kind of number, and <code>abs</code> is the whole-number one. Here you learn the switch-on-type trick that lets a single name pick the right function automatically at compile time. It's the exact machinery the standard library uses so that <code>sqrt</code> just works on whatever number you hand it.</p>`,
  html: `
<p>In C, <code>abs</code>, <code>labs</code>, <code>fabs</code>, and <code>fabsf</code> are four different functions for one idea, because C has no <em>function overloading</em> (the trick other languages use to let one name cover several types) — in C, every function name means exactly one thing. C11 didn't add overloading, but it added something sneakier: <strong><code>_Generic</code></strong>, an expression that <em>selects other expressions based on the type of its argument, at compile time</em>.</p>

<h2>The syntax</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Read it as a <code>switch</code> on types: the <em>controlling expression</em> <code>(x)</code> is examined (but <strong>never evaluated</strong> — only its type matters), the association list maps types to result expressions, and the whole <code>_Generic(...)</code> collapses to the one that matches. <code>default</code> catches everything else; with no match and no <code>default</code>, it's a compile error.</p>

<div data-w="flow1"></div>

<div data-w="q1"></div>

<h2>Building a real type-generic macro</h2>
<p><code>_Generic</code> is almost always wrapped in a macro — that's the whole design. Here's the classic: one <code>my_abs</code> that works for every arithmetic type:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Note the trick on the last line: <code>_Generic</code> selects the <em>function itself</em> (<code>abs</code>, <code>fabs</code>, …), and only then do we call it with <code>(x)</code>. This is exactly how <code>&lt;tgmath.h&gt;</code> works — since C11 it's implementable as ordinary macros: <code>sqrt(2.0f)</code> quietly calls <code>sqrtf</code>, <code>sqrt(2.0)</code> calls the double version, <code>sqrt(z)</code> the complex one. Type-generic math, zero runtime cost.</p>

<div data-w="q2"></div>

<h2>The fine print (a.k.a. the traps)</h2>
<ul>
<li><b>Lvalue conversion first.</b> The controlling expression's type is taken <em>after</em> dropping qualifiers and decaying arrays: a <code>const int</code> matches <code>int</code>, and a <code>char[10]</code> matches <code>char *</code>. (C11 was fuzzy here; C17 nailed it down.)</li>
<li><b>No partial matching.</b> You can't write "any pointer type" or "any integer" — every type is spelled out exactly. Want 6 integer types? Write 6 associations.</li>
<li><b>Character literals are <code>int</code>.</b> <code>_Generic('a', char: 1, int: 2)</code> gives <b>2</b> in C — a perennial interview gotcha.</li>
<li><b>Every branch must be valid code.</b> Unselected branches aren't evaluated, but they are still parsed and type-checked — which is why the "select the function, then call" pattern beats putting full calls in each branch.</li>
</ul>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Two types that look the same can collide:</b> listing both <code>int</code> and <code>signed int</code> is an error (same type twice), yet <code>char</code>, <code>signed char</code>, and <code>unsigned char</code> are <em>three distinct types</em> and may all appear. When a generic association list misbehaves, suspect the type system's fine print.</p></div></div>

<div data-w="q3"></div>

<h2>Where it shines</h2>
<p>Beyond math wrappers: type-safe <code>print</code> helpers (pick the right <code>printf</code> format automatically), debug macros that show a value <em>and</em> its type, and library APIs that accept several types without <code>void *</code>'s type-erasure. Try one yourself:</p>

<div data-w="ed1"></div>

<p>So far, everything in this part happened at compile time — next, the hardest <em>runtime</em> problem in modern C: multiple threads touching the same memory.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'typename.c',
      code: `#include <stdio.h>

#define type_name(x) _Generic((x),        \\
    int:          "int",                  \\
    unsigned int: "unsigned int",         \\
    double:       "double",               \\
    float:        "float",                \\
    char:         "char",                 \\
    char *:       "char *",               \\
    default:      "something else")

int main(void) {
    printf("42    -> %s\\n", type_name(42));
    printf("42u   -> %s\\n", type_name(42u));
    printf("3.14  -> %s\\n", type_name(3.14));
    printf("3.14f -> %s\\n", type_name(3.14f));
    printf("\\"hi\\"  -> %s\\n", type_name("hi"));
    printf("'a'   -> %s\\n", type_name('a'));   /* surprise! */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 typename.c -o typename && ./typename
42    -> int
42u   -> unsigned int
3.14  -> double
3.14f -> float
"hi"  -> char *
'a'   -> int
# 'a' is an int in C (not char!), and "hi" decayed from char[3] to char *` },
    flow1: {
      type: 'flow', label: '_Generic = a switch on types, resolved at compile time', colw: 200, rowh: 90,
      nodes: [
        { id: 's', col: 1, row: 0, kind: 'start', label: 'my_abs(x)' },
        { id: 'd', col: 1, row: 1, kind: 'dec', label: 'type of x ?' },
        { id: 'f', col: 0, row: 1, kind: 'proc', label: 'fabsf(x)' },
        { id: 'db', col: 2, row: 1, kind: 'proc', label: 'fabs(x)' },
        { id: 'i', col: 1, row: 2, kind: 'proc', label: 'abs(x)' },
        { id: 'e', col: 1, row: 3, kind: 'end', label: 'chosen at COMPILE\ntime — zero cost' },
      ],
      edges: [
        { from: 's', to: 'd' },
        { from: 'd', to: 'f', label: 'float' },
        { from: 'd', to: 'db', label: 'double' },
        { from: 'd', to: 'i', label: 'int' },
        { from: 'i', to: 'e' },
      ],
      note: 'The "decision" happens in the compiler; the finished binary contains only the one selected call.',
    },
    q1: { type: 'quiz', q: 'In <code>_Generic(f(), int: a, default: b)</code>, is <code>f()</code> called at runtime?', opts: ['Yes, once', 'Yes, once per matching branch', 'No — only its type is used', 'Only if the int branch is selected'], a: 2, expl: 'The controlling expression is NEVER evaluated — the compiler only inspects its type. This means _Generic(x++, ...) does not increment x, another classic gotcha.' },
    code2: {
      type: 'code', title: 'myabs.c',
      code: `#include <stdio.h>
#include <stdlib.h>   /* abs, labs, llabs   */
#include <math.h>     /* fabs, fabsf, fabsl */

#define my_abs(x) _Generic((x),  \\
    int:         abs,            \\
    long:        labs,           \\
    long long:   llabs,          \\
    float:       fabsf,          \\
    double:      fabs,           \\
    long double: fabsl           \\
)(x)   /* <- select the FUNCTION, then call it */

int main(void) {
    printf("my_abs(-5)      = %d\\n",  my_abs(-5));
    printf("my_abs(-5L)     = %ld\\n", my_abs(-5L));
    printf("my_abs(-2.5f)   = %f\\n",  my_abs(-2.5f));
    printf("my_abs(-2.5)    = %f\\n",  my_abs(-2.5));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c17 myabs.c -o myabs -lm && ./myabs
my_abs(-5)      = 5
my_abs(-5L)     = 5
my_abs(-2.5f)   = 2.500000
my_abs(-2.5)    = 2.500000
# one macro, four different functions actually called — picked per call site` },
    q2: { type: 'quiz', q: 'How does <code>&lt;tgmath.h&gt;</code> make <code>sqrt</code> work on float, double, and complex?', opts: ['Runtime type tags on every number', 'The linker picks a version', 'Type-generic macros — since C11, buildable with <code>_Generic</code>', 'sqrt secretly takes void *'], a: 2, expl: 'tgmath.h existed since C99 using compiler magic; C11’s _Generic made the magic expressible in the language itself. Each call site expands to a direct call of sqrtf/sqrt/sqrtl/csqrt — no runtime dispatch at all.' },
    q3: { type: 'quiz', q: 'What does <code>_Generic((const int){0}, int: "plain", default: "other")</code> select?', opts: ['"other" — const int is distinct', '"plain" — qualifiers are dropped first', 'Compile error — duplicate types', 'Undefined behavior'], a: 1, expl: 'The controlling expression undergoes lvalue conversion, which strips top-level qualifiers (and decays arrays to pointers). const int therefore matches the int association. C17 spelled this out explicitly.' },
    ed1: {
      type: 'editor', label: 'Exercise: extend a type-generic printer', height: 320,
      code: `#include <stdio.h>

/* print_any: picks the right printf format for the type */
#define print_any(x) printf(_Generic((x),  \\
    int:    "int: %d\\n",                   \\
    double: "double: %f\\n",                \\
    char *: "string: %s\\n"),               \\
    (x))

int main(void) {
    print_any(42);
    print_any(3.14);
    print_any("hello");
    /* print_any(3.14f); */   /* uncomment: compile error — no float branch */
    return 0;
}`,
      hint: 'Uncomment the float line and read the error. Then add associations for float ("float: %f") and unsigned int ("unsigned: %u") so all of them print. Bonus: add a default branch that prints "<unprintable>".'
    },
  },
});

/* ---------------- atomics-threads ---------------- */
CT.lesson({
  id: 'atomics-threads',
  title: 'Atomics & threads: sharing memory without lying to yourself',
  minutes: 14, xp: 140,
  tags: '_Atomic atomic_int threads.h thrd_create mtx_t data race mutex pthread C11',
  why: `<p>Your phone plays music, downloads a file, and redraws the screen all at once because real programs run several <em>threads</em> — independent streams of work — at the same time. Let two threads each add 1 to the same counter a million times, though, and the total comes out wrong, and <em>differently</em> wrong, every single run. You'll watch an update vanish in slow motion, then fix the code so shared numbers — scores, balances, download counts — always come out right.</p>`,
  html: `
<p>Until C11, the C standard pretended threads didn't exist — real programs used <code>pthreads</code>, a Unix add-on library, and hoped. C11 finally made threads official: rules for how threads may share memory, the <code>_Atomic</code> marker for shared variables, <code>&lt;stdatomic.h&gt;</code>, and a portable thread library in <code>&lt;threads.h&gt;</code>. To see why any of that is needed, let's watch innocent code fall apart.</p>

<h2>The crime scene: <code>counter++</code></h2>
<p><code>counter++</code> looks like one operation. To the CPU it's <em>three</em>: load the value into a register, add one, store it back. Run two threads and the OS can pause either one between any of those steps. Step through a lost update:</p>

<div data-w="trace1"></div>

<p>Two increments happened; the counter went up by one. Scale that to a million increments per thread and you get garbage — a different garbage every run. This is a <strong>data race</strong>, and in C it isn't just "wrong numbers": two threads accessing the same non-atomic object, at least one writing, with no synchronization, is <strong>undefined behavior</strong>, full stop.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>The fix, part 1: <code>_Atomic</code></h2>
<p>Declare the shared variable <code>_Atomic</code> and every load, store, and read-modify-write on it becomes indivisible — the hardware does the whole load-add-store as one uninterruptible operation (think x86 <code>lock add</code>). <code>&lt;stdatomic.h&gt;</code> provides convenience typedefs (<code>atomic_int</code>, <code>atomic_long</code>, <code>atomic_bool</code>…) and explicit functions (<code>atomic_load</code>, <code>atomic_store</code>, <code>atomic_fetch_add</code>, <code>atomic_compare_exchange_strong</code>).</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Atomics protect operations, not logic.</b> <code>if (atomic_load(&amp;n) &gt; 0) { atomic_fetch_sub(&amp;n, 1); }</code> is still racy — another thread can jump in between the check and the subtract. Each atomic op is indivisible; a <em>sequence</em> of them is not. For multi-step invariants, you want a mutex.</p></div></div>

<div data-w="q2"></div>

<h2>The fix, part 2: mutexes and <code>&lt;threads.h&gt;</code></h2>
<p>C11's thread API is small and readable: <code>thrd_create</code> / <code>thrd_join</code> for threads (a thread function is <code>int f(void *arg)</code>), <code>mtx_t</code> with <code>mtx_lock</code> / <code>mtx_unlock</code> for mutual exclusion, and <code>cnd_t</code> condition variables for "sleep until someone signals". A mutex makes a whole region exclusive:</p>

<div data-w="code3"></div>

<p>Rule of thumb: use an <b>atomic</b> for a single hot counter or flag; use a <b>mutex</b> the moment two or more values must change together (push an item <em>and</em> bump a count). Atomics are faster; mutexes protect invariants.</p>

<div data-w="q3"></div>

<h2>Two honest footnotes</h2>
<p><b>Memory ordering exists.</b> Every atomic op above uses the default, <code>memory_order_seq_cst</code> — the strongest and safest ordering. The standard also offers weaker orderings (<code>relaxed</code>, <code>acquire</code>, <code>release</code>…) that let experts trade guarantees about <em>when other threads see your writes</em> for speed. It is a genuinely deep topic; until you've read up on it properly, staying with the sequentially-consistent defaults is not a cop-out — it's engineering.</p>

<p><b>pthreads vs C11 threads.</b> In the real world you'll mostly see POSIX <code>pthread_create</code> &amp; co. — older, richer (read-write locks, barriers, attributes), and universal on Unix. <code>&lt;threads.h&gt;</code> is a thin portable wrapper over the same machinery (glibc ships it since 2.28; it's even optional — check <code>__STDC_NO_THREADS__</code>). The concepts transfer one-to-one, so learn either and you've learned both.</p>

<div data-w="ed1"></div>

<p>From the hardest feature in modern C to one of the simplest — next, a one-word promise to the compiler: this function <b>never returns</b>.</p>
`,
  widgets: {
    trace1: {
      type: 'trace', label: 'Two threads, one counter — the lost update', title: 'what counter++ really does',
      code: `long counter = 0;      /* shared by thread A and thread B */

reg = counter;         /* 1. LOAD  into a private register  */
reg = reg + 1;         /* 2. ADD   in the register          */
counter = reg;         /* 3. STORE back to shared memory    */`,
      steps: [
        { line: 3, vars: { A_reg: 0, B_reg: '—', counter: 0 }, out: '', note: 'Thread A loads counter into its register: sees 0.' },
        { line: 3, vars: { A_reg: 0, B_reg: 0, counter: 0 }, out: '', note: 'The OS switches threads mid-increment! B also loads counter: also sees 0.' },
        { line: 4, vars: { A_reg: 1, B_reg: 0, counter: 0 }, out: '', note: 'Back to A: it adds 1 in its private register.' },
        { line: 5, vars: { A_reg: 1, B_reg: 0, counter: 1 }, out: '', note: 'A stores 1. So far so good.' },
        { line: 4, vars: { A_reg: 1, B_reg: 1, counter: 1 }, out: '', note: 'B resumes — but its register still holds the STALE 0. It computes 0 + 1.' },
        { line: 5, vars: { A_reg: 1, B_reg: 1, counter: 1 }, out: '', note: 'B stores 1, overwriting A’s work. Two ++ executed, counter is 1. One increment vanished.' },
      ],
    },
    code1: {
      type: 'code', title: 'race.c — broken on purpose',
      code: `#include <stdio.h>
#include <threads.h>

#define N 1000000
long counter = 0;                 /* shared, NOT protected */

int worker(void *arg) {
    (void)arg;
    for (int i = 0; i < N; i++)
        counter++;                /* load + add + store: a data race */
    return 0;
}

int main(void) {
    thrd_t a, b;
    thrd_create(&a, worker, NULL);
    thrd_create(&b, worker, NULL);
    thrd_join(a, NULL);
    thrd_join(b, NULL);
    printf("expected %d, got %ld\\n", 2 * N, counter);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 race.c -o race -lpthread && ./race
expected 2000000, got 1183957
$ ./race
expected 2000000, got 1427312
$ ./race
expected 2000000, got 1996004
# different every run — and since a data race is UB, even "close" runs
# prove nothing. The program is simply wrong.` },
    q1: { type: 'quiz', q: 'Why does <code>counter++</code> lose updates across threads?', opts: ['The compiler removes duplicate increments', 'It’s three steps (load, add, store) and threads can interleave between them', 'ints can’t be shared between threads at all', 'printf is not thread-safe'], a: 1, expl: 'Each thread works on a private register copy. If both load the same old value, both store back old+1 — one increment is overwritten. The C standard classifies this unsynchronized write as a data race: undefined behavior.' },
    code2: {
      type: 'code', title: 'fixed.c — same program, atomic counter',
      code: `#include <stdio.h>
#include <threads.h>
#include <stdatomic.h>

#define N 1000000
atomic_long counter = 0;          /* == _Atomic long */

int worker(void *arg) {
    (void)arg;
    for (int i = 0; i < N; i++)
        counter++;                /* now ONE indivisible hardware op */
    return 0;
}

int main(void) {
    thrd_t a, b;
    thrd_create(&a, worker, NULL);
    thrd_create(&b, worker, NULL);
    thrd_join(a, NULL);
    thrd_join(b, NULL);
    printf("expected %d, got %ld\\n", 2 * N, (long)counter);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c17 fixed.c -o fixed -lpthread && ./fixed
expected 2000000, got 2000000
$ ./fixed
expected 2000000, got 2000000
# correct every single time — at the cost of slower, serialized increments` },
    q2: { type: 'quiz', q: 'Thread A runs <code>if (atomic_load(&amp;n) &gt; 0) atomic_fetch_sub(&amp;n, 1);</code>. Safe?', opts: ['Yes — every operation is atomic', 'No — another thread can act between the load and the sub', 'Only if n is also volatile', 'Only on x86'], a: 1, expl: 'Each call is individually atomic, but the check-then-act SEQUENCE is not: n can hit 0 between the two calls and you subtract into negative territory. Fix with a mutex, or a compare-exchange loop (atomic_compare_exchange_strong).' },
    code3: {
      type: 'code', title: 'mutex.c (core pattern)', run: false,
      code: `#include <threads.h>

mtx_t lock;                        /* mtx_init(&lock, mtx_plain); */
long items = 0, total_weight = 0;  /* must change TOGETHER        */

void add_item(long w) {
    mtx_lock(&lock);       /* one thread at a time from here...   */
    items += 1;
    total_weight += w;     /* invariant: total matches item count */
    mtx_unlock(&lock);     /* ...to here. Others block on lock.   */
}

/* cnd_t (condition variables) complete the toolkit: a consumer can
   cnd_wait(&nonempty, &lock) — sleep, releasing the lock — until a
   producer calls cnd_signal(&nonempty). */`
    },
    q3: { type: 'quiz', q: 'When do you need a mutex rather than atomics?', opts: ['Whenever more than 2 threads exist', 'When several variables must be updated as one consistent unit', 'Never — atomics fully replace mutexes', 'Only when using pthreads instead of threads.h'], a: 1, expl: 'Atomics make single operations on single objects indivisible. The moment your invariant spans multiple values (or multiple steps), you need mutual exclusion around the whole region — that’s exactly what mtx_lock/mtx_unlock provide.' },
    ed1: {
      type: 'editor', label: 'Exercise: explore the stdatomic API (single-threaded is fine)', height: 320,
      code: `#include <stdio.h>
#include <stdatomic.h>

int main(void) {
    atomic_int hits = 0;

    atomic_fetch_add(&hits, 5);
    atomic_fetch_sub(&hits, 2);
    printf("hits = %d\\n", atomic_load(&hits));

    int old = atomic_exchange(&hits, 100);   /* set, return previous */
    printf("old = %d, now = %d\\n", old, atomic_load(&hits));

    printf("lock-free? %d\\n", atomic_is_lock_free(&hits));
    return 0;
}`,
      hint: 'Predict all three lines, then run. Now try atomic_compare_exchange_strong(&hits, &expected, 42) with expected = 100 (succeeds) and expected = 7 (fails and overwrites expected with the real value) — print the results. That CAS operation is the atom every lock is built from.'
    },
  },
});

/* ---------------- noreturn ---------------- */
CT.lesson({
  id: 'noreturn',
  title: '_Noreturn: functions that never come back',
  minutes: 9, xp: 100,
  tags: '_Noreturn noreturn stdnoreturn.h exit abort die fatal C11 C23 attribute',
  why: `<p>If you've ever written a helper that prints an error message and quits, you've probably also met gcc's baffling complaint about it — "control reaches end of non-void function" — on code that was perfectly fine. One word tells the compiler the truth: this function never comes back. The false alarm vanishes, and the compiler still catches <em>real</em> missing-return bugs.</p>`,
  html: `
<p>Some functions don't return. Not "return nothing" like <code>void</code> — they <em>never hand control back at all</em>: <code>exit()</code> ends the process, <code>abort()</code> kills it, <code>longjmp()</code> jumps execution back to an earlier point in the program, <code>thrd_exit()</code> ends the thread. C11 gave us a way to tell the compiler this: the <strong><code>_Noreturn</code></strong> keyword, written in front of a function (with a pretty <code>noreturn</code> macro in <code>&lt;stdnoreturn.h&gt;</code>).</p>

<h2>Why the compiler cares</h2>
<p>Two reasons. <b>Better warnings:</b> if the compiler doesn't know <code>die()</code> never returns, it thinks the code after it is reachable — and warns about "control reaches end of non-void function" in perfectly fine code, or worse, <em>fails to warn</em> about genuinely missing returns. <b>Better code:</b> a call that never returns needs no "afterwards" — the compiler can skip saving registers and delete everything downstream of the call.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>The <code>die()</code> pattern</h2>
<p>Nearly every serious C codebase has a fatal-error helper: print a message, exit with failure. Marking it <code>noreturn</code> is what makes it compose cleanly with the rest of your code:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Look at <code>parse_level</code>: no <code>return</code> after the <code>die()</code> call, and no warning either — the compiler knows that path is a dead end. Delete the <code>noreturn</code> and gcc immediately complains that control can reach the end of a non-void function. The flow makes it obvious:</p>

<div data-w="flow1"></div>

<div data-w="q2"></div>

<h2>The rules (and the C23 facelift)</h2>
<ul>
<li>A noreturn function should have return type <code>void</code> — a value it can never produce would be nonsense.</li>
<li>If a noreturn function <em>does</em> return (falls off the end, or hits a <code>return;</code>), behavior is <strong>undefined</strong>. The promise cuts both ways.</li>
<li>C23 deprecates <code>_Noreturn</code> and <code>&lt;stdnoreturn.h&gt;</code> in favor of the attribute syntax: <code>[[noreturn]] void die(const char *msg);</code> — same meaning, modern spelling (more on attributes in the C23 lesson).</li>
</ul>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Don't confuse <code>void</code> with <code>noreturn</code>.</b> A <code>void</code> function returns — it just carries no value; execution continues at the caller. A <code>noreturn</code> function never resumes the caller at all. And never mark <code>main</code> noreturn: returning from <code>main</code> is its normal job.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Next: a corner of C most people never visit — built-in <b>complex numbers</b>, where C quietly beats your calculator.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'why.c — the warning noreturn fixes', run: false,
      code: `void die_unmarked(const char *msg);   /* compiler assumes it returns */

int parse_level(const char *s) {
    if (s[0] == 'a') return 1;
    if (s[0] == 'b') return 2;
    die_unmarked("bad level");
}   /* warning: control reaches end of non-void function
       — a FALSE alarm, but the compiler can't know that */`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 -Wall why.c -c
why.c: In function 'parse_level':
why.c:7:1: warning: control reaches end of non-void function [-Wreturn-type]
# mark die_unmarked as noreturn and this warning vanishes —
# and REAL missing-return bugs still get caught` },
    q1: { type: 'quiz', q: 'What does <code>_Noreturn</code> promise the compiler?', opts: ['The function returns void', 'The function has no side effects', 'Control never comes back to the caller', 'The function never fails'], a: 2, expl: 'It’s purely about control flow: after the call, execution never resumes at the call site — because of exit(), abort(), longjmp(), an infinite loop, etc. "Returns no value" is void; noreturn is a much stronger claim.' },
    code2: {
      type: 'code', title: 'die.c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <stdnoreturn.h>   /* the 'noreturn' macro (C11/C17) */

noreturn void die(const char *msg) {
    fprintf(stderr, "fatal: %s\\n", msg);
    exit(EXIT_FAILURE);          /* exit is itself noreturn */
}

int parse_level(const char *s) {
    if (s[0] == 'a') return 1;
    if (s[0] == 'b') return 2;
    die("bad level string");     /* no return needed after this  */
}                                /* ...and no warning: dead end. */

int main(void) {
    printf("level a = %d\\n", parse_level("a"));
    printf("level x = %d\\n", parse_level("x"));   /* boom */
    printf("never printed\\n");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c17 -Wall die.c -o die && ./die
level a = 1
fatal: bad level string
$ echo $?
1
# exit status 1 — scripts and Makefiles can see the failure` },
    flow1: {
      type: 'flow', label: 'die() is a one-way door', colw: 210, rowh: 90,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'parse_level(s)' },
        { id: 'd', col: 0, row: 1, kind: 'dec', label: 'known\nlevel?' },
        { id: 'r', col: 0, row: 2, kind: 'end', label: 'return 1 or 2\n(back to caller)' },
        { id: 'die', col: 1, row: 1, kind: 'io', label: 'die(msg)\nfprintf(stderr…)' },
        { id: 'x', col: 1, row: 2, kind: 'end', label: 'exit(1)\nprocess ends' },
      ],
      edges: [
        { from: 's', to: 'd' },
        { from: 'd', to: 'r', label: 'yes' },
        { from: 'd', to: 'die', label: 'no' },
        { from: 'die', to: 'x' },
      ],
      note: 'No arrow ever leads back from the right column — that’s exactly what <code>noreturn</code> declares.',
    },
    q2: { type: 'quiz', q: 'A <code>noreturn</code> function executes a plain <code>return;</code>. What happens?', opts: ['A compile error, always', 'It works like a normal void return', 'Undefined behavior', 'The program exits with status 0'], a: 2, expl: 'The standard says behavior is undefined if a noreturn function actually returns. Compilers try to warn when they can see it, but the promise is yours to keep — the optimizer may have deleted the caller’s "afterwards" entirely.' },
    ed1: {
      type: 'editor', label: 'Exercise: write your own fatal() helper', height: 300,
      code: `#include <stdio.h>
#include <stdlib.h>
#include <stdnoreturn.h>

/* TODO: write   noreturn void fatal(int code, const char *msg)
   that prints "fatal: <msg>" to stderr and exits with <code>. */

int main(void) {
    int n = -3;
    if (n < 0) {
        /* call fatal(2, "n must be non-negative"); here */
    }
    printf("n = %d\\n", n);
    return 0;
}`,
      hint: 'Implement fatal() with fprintf(stderr, ...) + exit(code), mark it noreturn, and call it for negative n. Run: you should see the message and NOT "n = -3". Then change n to 5 and confirm the happy path still prints.'
    },
    q3: { type: 'quiz', q: 'Which spelling does C23 prefer?', opts: ['<code>[[noreturn]] void die(…);</code>', '<code>__noreturn__ void die(…);</code>', '<code>void noreturn die(…);</code>', '<code>_Noreturn</code> — unchanged'], a: 0, expl: 'C23 adopts the [[attribute]] syntax and deprecates both _Noreturn and stdnoreturn.h. Old spellings still compile (deprecated ≠ removed), but new code should write [[noreturn]].' },
  },
});

/* ---------------- complex-imaginary ---------------- */
CT.lesson({
  id: 'complex-imaginary',
  title: '_Complex: C does imaginary numbers natively',
  minutes: 11, xp: 110,
  tags: '_Complex _Imaginary complex.h creal cimag cabs carg I cexp C99',
  why: `<p>Those swirling Mandelbrot fractal posters, every MP3, and every JPEG all run on the same math: complex numbers. C has them built into the language — ordinary <code>+</code> and <code>*</code> included, no add-on library needed. You'll compute the numbers at the heart of audio compression and analyze a real electronic circuit — each in about a dozen lines of C.</p>`,
  html: `
<p>Here's a C feature that surprises even veterans: complex numbers (the two-part numbers from math class, built on i = √−1) are <em>built into the language</em>. Since C99, <code>double complex</code> is a real type with real operator support — you can add, multiply, and divide complex values with plain <code>+ * /</code>, no special function calls, no wrapper library. If you've ever played with electronics, audio effects, or fractals, C speaks your language.</p>

<h2>The basics: <code>&lt;complex.h&gt;</code> and <code>I</code></h2>
<p>Include <code>&lt;complex.h&gt;</code> and you get: the spelling <code>complex</code> for the keyword <code>_Complex</code>, the constant <code>I</code> (the imaginary unit, i = √−1), and a family of functions — <code>creal</code>/<code>cimag</code> (parts), <code>cabs</code> (magnitude), <code>carg</code> (angle), <code>conj</code>, <code>cexp</code>, <code>csqrt</code>, and complex versions of most of the math library (prefix <code>c</code>).</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Note that last line: <code>(1+i)(1−i) = 1 − i² = 2</code>. The compiler did complex multiplication with the ordinary <code>*</code> operator. Under the hood, a <code>double complex</code> is stored exactly as you'd guess — two doubles, real part first (the standard guarantees this layout, so it's binary-compatible with Fortran and C++):</p>

<div data-w="grid1"></div>

<div data-w="q1"></div>

<h2>A real computation: roots of unity</h2>
<p>The n-th roots of unity — the n complex numbers whose n-th power is 1 — are e<sup>2πik/n</sup> for k = 0…n−1. They're the skeleton of the FFT, the algorithm behind basically all audio and image compression. In C, the formula transliterates directly:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Check: those are the corners of an equilateral triangle on the unit circle, and −0.5 ± 0.866i are exactly cos(±120°) + i·sin(±120°). One <code>cexp</code> call per root — this is where C beats a calculator: your calculator does one arithmetic operation at a time; C does a formula over a whole range, reproducibly, in nanoseconds.</p>

<div data-w="q2"></div>

<h2>Engineering flavor: impedance of an RC circuit</h2>
<p>Electrical engineers write AC circuit analysis in complex arithmetic: a resistor contributes R, a capacitor 1/(jωC) — and then series/parallel combinations are just + and /. (EEs write <code>j</code> for the imaginary unit; C's <code>I</code> is the same thing.) A 1 kΩ resistor in series with a 1 µF capacitor at 1 kHz:</p>

<div data-w="ed1"></div>

<p>Magnitude ≈ 1012.6 Ω and a phase of about −9° — the capacitor barely matters at this frequency. Change <code>f</code> to 100.0 and watch the capacitor dominate. That's a frequency-response sweep in a for loop, which is exactly how tools like SPICE begin.</p>

<h2>Fine print</h2>
<ul>
<li><b>Complex support is optional</b> for freestanding/embedded implementations — a conforming compiler may define <code>__STDC_NO_COMPLEX__</code> and skip it. On desktop gcc/clang it's always there. Link with <code>-lm</code> for the functions.</li>
<li><b><code>_Imaginary</code> exists on paper, and almost nowhere else.</b> Annex G defines pure-imaginary types (<code>double imaginary</code>) that store only the imaginary part. GCC and Clang have never implemented them — you will likely never see one in the wild. Trivia keyword: unlocked.</li>
<li><b>Constructing from variables:</b> <code>a + b*I</code> mostly works, but has edge cases with infinities/NaN — the <code>CMPLX(a, b)</code> macro (C11) builds a complex value exactly.</li>
</ul>

<div data-w="q3"></div>

<p>You've now met every C11 headliner — time for the finale: a whirlwind tour of everything <b>C23</b> added to the language.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'cplx.c',
      code: `#include <stdio.h>
#include <complex.h>

int main(void) {
    double complex z = 3.0 + 4.0 * I;

    printf("z      = %.1f%+.1fi\\n", creal(z), cimag(z));
    printf("|z|    = %.1f\\n", cabs(z));          /* magnitude    */
    printf("arg(z) = %.4f rad\\n", carg(z));      /* angle        */
    printf("conj   = %.1f%+.1fi\\n", creal(conj(z)), cimag(conj(z)));

    double complex w = (1.0 + 1.0 * I) * (1.0 - 1.0 * I);
    printf("(1+i)(1-i) = %.1f%+.1fi\\n", creal(w), cimag(w));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c17 cplx.c -o cplx -lm && ./cplx
z      = 3.0+4.0i
|z|    = 5.0
arg(z) = 0.9273 rad
conj   = 3.0-4.0i
(1+i)(1-i) = 2.0+0.0i
# the 3-4-5 triangle, and i^2 = -1 — all with ordinary operators` },
    grid1: {
      type: 'memgrid', label: 'double complex z = 3.0 + 4.0i in memory (each cell = one 8-byte double)',
      cells: [
        { addr: '0x100', val: '3.0', name: 'creal(z)', hl: true },
        { addr: '0x108', val: '4.0', name: 'cimag(z)', hl2: true },
      ],
      note: 'Guaranteed layout: an array of two doubles, real part first. <code>sizeof(double complex)</code> is exactly <code>2 * sizeof(double)</code> = 16.',
    },
    q1: { type: 'quiz', q: 'What is <code>cabs(3.0 + 4.0*I)</code>?', opts: ['3.0', '4.0', '5.0', '7.0'], a: 2, expl: 'cabs is the complex magnitude: sqrt(re² + im²) = sqrt(9 + 16) = 5. The classic 3-4-5 right triangle — cabs is to complex numbers what fabs is to reals.' },
    code2: {
      type: 'code', title: 'roots.c',
      code: `#include <stdio.h>
#include <complex.h>

#define PI 3.14159265358979323846

int main(void) {
    int n = 3;                       /* cube roots of 1 */
    for (int k = 0; k < n; k++) {
        double complex root = cexp(2.0 * PI * k * I / n);
        printf("root %d: %+.3f%+.3fi\\n", k, creal(root), cimag(root));
    }
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c17 roots.c -o roots -lm && ./roots
root 0: +1.000+0.000i
root 1: -0.500+0.866i
root 2: -0.500-0.866i
# three points, evenly spaced around the unit circle —
# cube any of them and you get 1 back` },
    q2: { type: 'quiz', q: 'How do you multiply two <code>double complex</code> values in C?', opts: ['<code>cmul(a, b)</code>', '<code>a * b</code> — the operator just works', 'Multiply parts manually with creal/cimag', 'You can’t; complex is storage-only'], a: 1, expl: 'complex is a first-class arithmetic type: +, -, *, / (and comparisons == and !=) all work directly. The compiler generates the (a.re*b.re - a.im*b.im, ...) arithmetic for you. Functions like cexp/csqrt cover what operators can’t.' },
    ed1: {
      type: 'editor', label: 'Exercise: RC circuit impedance', height: 320,
      code: `#include <stdio.h>
#include <complex.h>

int main(void) {
    double R = 1000.0;       /* ohms          */
    double C = 1e-6;         /* farads (1 uF) */
    double f = 1000.0;       /* hertz         */

    double w = 2.0 * 3.14159265358979 * f;      /* angular freq  */
    double complex Z = R + 1.0 / (I * w * C);   /* series R + C  */

    printf("Z = %.1f%+.1fi ohms\\n", creal(Z), cimag(Z));
    return 0;
}`,
      hint: 'Run it: about 1000.0-159.2i ohms. Now print the magnitude — if the runner links the math library use cabs(Z), otherwise compute it yourself from creal/cimag. Then wrap it in a loop over f = 10, 100, 1000, 10000 Hz and watch |Z| fall as frequency rises: you just plotted a high-pass filter.'
    },
    q3: { type: 'quiz', q: 'What’s the honest status of <code>_Imaginary</code>?', opts: ['Required since C99, used everywhere', 'A C23 addition, too new to use', 'Defined in Annex G but essentially unimplemented (gcc/clang skip it)', 'A deprecated alias for _Complex'], a: 2, expl: 'Pure imaginary types are optional Annex G material, and the mainstream compilers never implemented them — writing double imaginary in gcc is an error. _Complex, by contrast, is real, mature, and everywhere on hosted platforms.' },
  },
});

/* ---------------- c23-features ---------------- */
CT.lesson({
  id: 'c23-features',
  title: 'C23: the grand tour',
  minutes: 14, xp: 130,
  tags: 'C23 nullptr constexpr typeof _BitInt bool true false attributes embed auto binary literal',
  why: `<p>Remember pulling in a whole header just to get <code>true</code> and <code>false</code>, or discovering that <code>NULL</code> is secretly the number 0? The newest edition of C fixes those everyday annoyances you've been living with all course. This tour shows you the C you'll be reading for the next decade — and tells you exactly which parts your compiler already supports today.</p>`,
  html: `
<p>C23 (the 2024 edition of the official C standard) is the biggest update to C since C99. Its theme: <em>make the clean way the default way</em> — real booleans, a null pointer that finally has a type of its own, honest constants, and a bag of features C programmers had been faking with macros for decades. Fair warning: your playground compiler here is older, so this lesson's examples are read-and-believe; to run them yourself you'll need <strong>gcc 13+ or clang 16+</strong> with <code>-std=c23</code> (older gcc spells it <code>-std=c2x</code>).</p>

<h2>The everyday wins</h2>
<p><code>bool</code>, <code>true</code>, and <code>false</code> are now <strong>keywords</strong> — no more <code>&lt;stdbool.h&gt;</code>. <code>nullptr</code> is a null pointer constant with its own type <code>nullptr_t</code>, fixing the old ambiguity where <code>NULL</code> might be plain <code>0</code> (an int!). <code>constexpr</code> makes genuine compile-time constant <em>objects</em> — something <code>const</code> never was in C. And <code>auto</code> + <code>typeof</code> let you name types you'd rather not spell:</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Why <code>constexpr</code> matters:</b> in C17, <code>const int n = 64; int a[n];</code> gives you a <em>variable-length array</em>, because a const variable is not a constant expression — one of C's oldest gotchas (and why everyone used <code>#define</code> or <code>enum</code> for sizes). A <code>constexpr</code> object is a true constant: usable in array sizes, <code>case</code> labels, and <code>static_assert</code>. Note C23 has constexpr <em>objects</em> only — no constexpr functions; that's still C++-land.</p></div></div>

<div data-w="q1"></div>

<h2>New numbers: <code>_BitInt</code>, binary literals, digit separators</h2>
<p>Need exactly 12 bits — for a hardware register, a file format, an FPGA interface? <code>_BitInt(N)</code> is an integer type of exactly N bits, for any N up to at least 64 (gcc on x86-64 allows 65535!). Unlike <code>char</code>/<code>short</code>, small <code>_BitInt</code>s do <em>not</em> promote to <code>int</code> behind your back. Alongside: binary literals (<code>0b1010</code>) are finally standard, and <code>'</code> separates digit groups:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<h2>Attributes: <code>[[...]]</code></h2>
<p>C23 standardizes the double-bracket attribute syntax (shared with C++) — portable replacements for a zoo of <code>__attribute__((...))</code> extensions:</p>

<div data-w="code3"></div>
<div data-w="term3"></div>

<table>
<tr><th>attribute</th><th>meaning</th></tr>
<tr><td><code>[[nodiscard]]</code></td><td>warn if a caller ignores the return value (great for error codes)</td></tr>
<tr><td><code>[[deprecated("why")]]</code></td><td>warn on any use, with your migration hint</td></tr>
<tr><td><code>[[maybe_unused]]</code></td><td>suppress unused-variable/parameter warnings, on purpose</td></tr>
<tr><td><code>[[fallthrough]]</code></td><td>"yes, this switch case falls through intentionally"</td></tr>
<tr><td><code>[[noreturn]]</code></td><td>the modern spelling from the noreturn lesson</td></tr>
</table>

<div data-w="q3"></div>

<h2>The rest of the goodie bag</h2>
<ul>
<li><b>Empty initializer:</b> <code>int arr[100] = {};</code> — zero everything, no more <code>{0}</code> folklore.</li>
<li><b>Enums grow up:</b> pick the underlying type — <code>enum flags : unsigned char { … };</code> — and enumerators may exceed <code>int</code> range.</li>
<li><b><code>#embed</code>:</b> include a binary file's bytes directly in an array — the end of xxd-generated header files:</li>
</ul>

<div data-w="code4"></div>

<div data-w="reveal1"></div>

<h2>Can I actually use it?</h2>
<table>
<tr><th>feature</th><th>gcc</th><th>clang</th></tr>
<tr><td>bool/true/false, nullptr, typeof, auto, {}, attributes</td><td>13+</td><td>16+</td></tr>
<tr><td><code>_BitInt</code></td><td>14+</td><td>14+ (it pioneered as _ExtInt)</td></tr>
<tr><td><code>constexpr</code> objects</td><td>13+</td><td>19+</td></tr>
<tr><td><code>#embed</code></td><td>15+</td><td>19+</td></tr>
</table>
<p>Compile with <code>gcc -std=c23 -Wall</code> (gcc 13: <code>-std=c2x</code>). Check <code>__STDC_VERSION__</code> — C23 defines it as <code>202311L</code>. Broad rule: on a 2024-or-later toolchain, everything above just works; on distro compilers a year or two older, the everyday wins work but check the table.</p>

<p>🎉 And with that, you've met <b>every keyword in the C language</b> — from <code>auto</code> (both meanings!) to <code>_Static_assert</code>. Next stop, Part 6: the standard library, where we put the whole language to work.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'tour1.c — needs gcc 13+ / clang 16+, -std=c23', run: false,
      code: `#include <stdio.h>

int main(void) {
    bool ok = true;                /* keywords — no <stdbool.h>      */
    int *p = nullptr;              /* typed null (type: nullptr_t)   */

    constexpr int max_users = 64;  /* a REAL compile-time constant   */
    int table[max_users];          /* fixed-size array, not a VLA!   */
    static_assert(max_users % 8 == 0, "must be a multiple of 8");

    auto half = max_users / 2;     /* type inferred: int             */
    typeof(half) other = 7;        /* "same type as half" — int      */

    printf("ok=%d slots=%zu half=%d other=%d p-null=%d\\n",
           ok, sizeof table / sizeof table[0], half, other,
           p == nullptr);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=c23 -Wall tour1.c -o tour1 && ./tour1
ok=1 slots=64 half=32 other=7 p-null=1
# printf has no bool/nullptr conversions — %d for bool and a
# comparison for the pointer do the job` },
    q1: { type: 'quiz', q: 'In C17, why was <code>const int n = 64; int a[n];</code> a VLA, and what fixes it in C23?', opts: ['It wasn’t a VLA; nothing to fix', 'const variables aren’t constant expressions; <code>constexpr</code> objects are', 'VLAs were removed in C23', 'The fix is <code>static const</code>'], a: 1, expl: 'In C, const means "read-only", not "known at compile time" — so n can’t size a fixed array or label a case. constexpr n = 64 is a genuine integer constant expression, closing a 30-year gap with C++.' },
    code2: {
      type: 'code', title: 'tour2.c — needs gcc 14+ / clang 14+, -std=c23', run: false,
      code: `#include <stdio.h>

int main(void) {
    /* exactly 12 bits, with a binary literal + digit separators: */
    unsigned _BitInt(12) reg = 0b1111'1111'1111uwb;   /* 4095 */

    unsigned _BitInt(4) nibble = 15uwb;
    nibble++;                       /* wraps mod 2^4              */

    int budget = 1'000'000;         /* separators work everywhere */

    printf("reg    = %u (max of 12 bits)\\n", (unsigned)reg);
    printf("nibble = %u (15 + 1 wrapped)\\n", (unsigned)nibble);
    printf("budget = %d\\n", budget);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=c23 tour2.c -o tour2 && ./tour2
reg    = 4095 (max of 12 bits)
nibble = 0 (15 + 1 wrapped)
budget = 1000000
# wb/uwb suffixes make _BitInt literals; unsigned _BitInt wraps
# like any unsigned type — just at YOUR chosen width` },
    q2: { type: 'quiz', q: 'What is <code>unsigned _BitInt(12)</code>?', opts: ['A 12-byte integer', 'A bit-field only usable in structs', 'An unsigned integer of exactly 12 bits', 'A gcc extension, not standard C'], a: 2, expl: 'C23’s _BitInt(N) gives an integer of exactly N bits, usable anywhere a normal integer is — parameters, arrays, arithmetic. Value range here: 0 to 4095. Bonus: unlike short/char, small _BitInts don’t silently promote to int.' },
    code3: {
      type: 'code', title: 'attrs.c — needs gcc 13+ / clang 16+, -std=c23', run: false,
      code: `#include <stdio.h>

[[nodiscard]] int reserve(int n) { return n > 0 ? 0 : -1; }

[[deprecated("use reserve() instead")]]
int old_reserve(int n) { return reserve(n); }

int main(void) {
    reserve(8);                     /* warning: value ignored     */
    old_reserve(8);                 /* warning: deprecated        */

    [[maybe_unused]] int dbg = 42;  /* no unused-variable warning */

    int x = 1;
    switch (x) {
    case 1:
        puts("one");
        [[fallthrough]];            /* intentional — no warning   */
    case 2:
        puts("two");
        break;
    }

    int zeros[4] = {};              /* C23 empty initializer      */
    printf("%d %d\\n", zeros[0], zeros[3]);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc -std=c23 -Wall -Wextra attrs.c -o attrs
attrs.c:9:5: warning: ignoring return value of 'reserve', declared with attribute 'nodiscard'
attrs.c:10:5: warning: 'old_reserve' is deprecated: use reserve() instead
$ ./attrs
one
two
0 0
# attributes turn code-review comments into compiler-enforced rules` },
    q3: { type: 'quiz', q: 'What does <code>[[nodiscard]]</code> on a function do?', opts: ['Prevents the function being optimized out', 'Warns when a caller ignores its return value', 'Makes the return value constexpr', 'Stops the value being copied'], a: 1, expl: 'It’s for functions whose return value IS the point — error codes, handles, computed results. Ignoring such a value is almost always a bug (think: ignoring malloc’s result), and nodiscard makes the compiler say so.' },
    code4: {
      type: 'code', title: 'embed.c — needs gcc 15+ / clang 19+', run: false,
      code: `/* The whole file logo.png becomes bytes in the array —
   at PREPROCESSING time. No xxd, no build scripts. */
static const unsigned char logo[] = {
    #embed "logo.png"
};

/* before C23, everyone generated this by hand:
   static const unsigned char logo[] = { 0x89, 0x50, 0x4e, 0x47, ... }; */`
    },
    reveal1: {
      type: 'reveal', label: 'Think first',
      q: 'C23 quickie: <code>constexpr int n = 3; auto x = n + 0.5;</code> — what does <code>printf("%zu", sizeof x);</code> print on x86-64?',
      answer: '<p><b>8.</b> The expression <code>n + 0.5</code> mixes int with double, so usual arithmetic conversions make it a <code>double</code> — and <code>auto</code> deduces exactly that: <code>x</code> is a <code>double</code> (8 bytes), not an int. <code>auto</code> saves typing, but the type it picks follows C’s ordinary expression rules — keep them in your head, not just in the compiler’s.</p>'
    },
  },
});
