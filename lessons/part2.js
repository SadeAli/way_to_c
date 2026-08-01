/* ============================================================
   Part 2 — Pointers & Memory
   ============================================================ */

/* ---------------- pointers intro ---------------- */
CT.lesson({
  id: 'pointers-intro',
  title: 'Pointers: variables that hold addresses',
  minutes: 14, xp: 130,
  tags: 'pointer address deref & * NULL swap %p',
  why: `<p>Back in Part 1 you typed <code>scanf("%d", &amp;x)</code> and were told "just put the <code>&amp;</code> there." You were secretly handing over your variable's address — today the secret comes out. It cracks a genuine puzzle, too: a function that tries to swap two variables and silently changes nothing. By the end you'll know exactly why it fails, and you'll have the tool that fixes it.</p>`,
  html: `
<p>This is it — the lesson C is famous for. A <strong>pointer</strong> is nothing mystical: it is a variable whose value is <em>the address of another variable</em>. You already know every variable lives somewhere in memory; a pointer simply writes that "somewhere" down so you can come back to it later.</p>

<h2>Every variable has an address</h2>
<p>The <code>&amp;</code> operator (read: "address of") asks: <em>where does this variable live?</em> You can print the answer with <code>printf</code>'s <code>%p</code> (p for pointer); the <code>(void *)</code> in front converts the address to the generic "pointer to anything" type that <code>%p</code> expects:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Your address will differ — and change between runs, because modern OSes randomize the layout (ASLR). The exact number never matters; what matters is that <em>there is one</em>, and you can store it.</p>

<div data-w="q1"></div>

<h2>Pointer variables: <code>int *p</code></h2>
<p><code>int *p = &amp;x;</code> declares <code>p</code> as a <em>pointer to int</em> and stores <code>x</code>'s address in it. The type matters: <code>p</code> doesn't just remember an address, it remembers that an <code>int</code> lives there — which controls how many bytes a read grabs, and (next lesson) how far <code>p + 1</code> jumps.</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The <code>*</code> binds to the name, not the type.</b> <code>int* a, b;</code> declares a pointer <code>a</code> and a plain <code>int b</code>! That's why C veterans write the star next to the variable: <code>int *a, *b;</code>. One star per pointer, always.</p></div></div>

<div data-w="mg1"></div>

<p>The <code>*</code> operator (read: "the thing at") <strong>dereferences</strong> a pointer — it follows the address. <code>*p</code> is, for all purposes, another name for <code>x</code>: reading <code>*p</code> reads <code>x</code>, and writing <code>*p = 99;</code> changes <code>x</code>. Yes, the same symbol declares pointers and dereferences them. Context tells them apart; it's confusing for about a week, then permanent.</p>

<div data-w="q2"></div>

<h2>NULL: pointing at nothing</h2>
<p>Sometimes a pointer has nowhere to point <em>yet</em>. For that, C provides <code>NULL</code> — a special value guaranteed to compare unequal to the address of any real object. It's the universal "empty" sentinel: functions return it on failure, lists end with it, and you should initialize pointers to it instead of leaving them as random garbage.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Dereferencing NULL is undefined behavior</b> — on mainstream systems it's the classic <em>segmentation fault</em>. Before following a pointer that might be empty, check it: <code>if (p != NULL) ...</code> (or just <code>if (p)</code> — NULL is falsy).</p></div></div>

<h2>The payoff: <code>swap()</code></h2>
<p>Why do we even need pointers? Here's the classic motivation. Try to write a function that swaps two ints — without pointers:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Nothing happened! C passes arguments <strong>by value</strong>: <code>swap_broken</code> received <em>copies</em> of <code>x</code> and <code>y</code>, dutifully swapped the copies, and threw them away on return. To modify the caller's variables, we must pass their <em>addresses</em> — then the function can reach back through them. Step through the fixed version:</p>

<div data-w="tr1"></div>

<div data-w="q3"></div>

<p>This pattern — pass an address so the callee can modify your variable — is everywhere in C: <code>scanf("%d", &amp;x)</code> is exactly it.</p>

<div data-w="ex1"></div>

<p>You can now hold an address. Next: the surprisingly clever rules for doing <em>arithmetic</em> on one.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'address.c',
      code: `#include <stdio.h>

int main(void) {
    int x = 42;

    printf("value  : %d\\n", x);
    printf("address: %p\\n", (void *)&x);
    printf("size   : %zu bytes\\n", sizeof x);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc address.c -o address && ./address
value  : 42
address: 0x7ffee4c01a9c
size   : 4 bytes
# your address WILL differ — that's normal (ASLR)` },
    q1: { type: 'quiz', q: 'Given <code>int x = 5;</code>, what is <code>&amp;x</code>?', opts: ['The value 5', 'A copy of x', 'The memory address where x is stored', 'Always 0x100'], a: 2, expl: '<code>&amp;</code> is the address-of operator: it yields where x lives (a value of type <code>int *</code>), not what x contains.' },
    mg1: {
      type: 'memgrid', label: 'A pointer is just a cell whose value is another cell’s address',
      cells: [
        { addr: '0x7ffc2a10', val: '42', name: 'x', hl: true },
        { addr: '0x7ffc2a14', val: '7', name: 'y' },
        { addr: '0x7ffc2a18', val: '0x7ffc2a10', name: 'p', hl2: true },
      ],
      note: '<code>p</code> (orange) holds the address of <code>x</code> (blue). We say "p points to x". <code>*p</code> follows the arrow and lands on 42.'
    },
    q2: { type: 'quiz', q: 'After <code>int *p = &amp;x;</code>, what does <code>*p = 10;</code> do?', opts: ['Makes p point to address 10', 'Sets x to 10', 'Undefined behavior', 'Declares a second pointer'], a: 1, expl: 'Dereferencing follows the stored address, so the assignment writes 10 into x’s memory. <code>p</code> itself (the address it holds) is unchanged.' },
    code2: {
      type: 'code', title: 'swap_broken.c',
      code: `#include <stdio.h>

void swap_broken(int a, int b) {   /* receives COPIES  */
    int tmp = a;
    a = b;
    b = tmp;                       /* swaps the copies */
}                                  /* copies die here  */

int main(void) {
    int x = 3, y = 7;
    swap_broken(x, y);
    printf("x=%d y=%d\\n", x, y);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc swap_broken.c -o swap && ./swap
x=3 y=7
# completely unchanged — we only swapped copies` },
    tr1: {
      type: 'trace', label: 'swap() done right — step through it', title: 'swap.c',
      code: `#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x = 3, y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\\n", x, y);
    return 0;
}`,
      steps: [
        { line: 10, vars: { x: 3, y: 7 }, out: '', note: 'main’s two locals, sitting at some stack addresses' },
        { line: 11, vars: { x: 3, y: 7 }, out: '', note: 'we pass the ADDRESSES of x and y, not their values' },
        { line: 3, vars: { x: 3, y: 7, a: '&x', b: '&y' }, out: '', note: 'inside swap: a points to x, b points to y' },
        { line: 4, vars: { x: 3, y: 7, a: '&x', b: '&y', tmp: 3 }, out: '', note: 'tmp = *a — follow a to x, copy out the 3' },
        { line: 5, vars: { x: 7, y: 7, a: '&x', b: '&y', tmp: 3 }, out: '', note: '*a = *b — write y’s value THROUGH a, into the real x' },
        { line: 6, vars: { x: 7, y: 3, a: '&x', b: '&y', tmp: 3 }, out: '', note: '*b = tmp — write the saved 3 through b, into the real y' },
        { line: 12, vars: { x: 7, y: 3 }, out: 'x=7 y=3', note: 'back in main: the actual x and y swapped. Pointers win.' },
      ],
    },
    q3: { type: 'quiz', q: 'Why does <code>swap_broken(x, y)</code> fail to swap?', opts: ['Ints can’t be swapped in C', 'The compiler optimizes the call away', 'C passes arguments by value — the function gets copies', 'swap must return two values, which C forbids'], a: 2, expl: 'Every C argument is copied into the callee’s parameters. To let a function modify YOUR variable, hand it the variable’s address — that’s what pointer parameters are for.' },
    ex1: {
      type: 'editor', label: 'Exercise: your first pointer', height: 300,
      code: `#include <stdio.h>

int main(void) {
    double temp = 21.5;

    /* 1. declare a pointer-to-double p and point it at temp   */
    /* 2. print temp THROUGH the pointer:  printf("%f", *p)    */
    /* 3. write  *p = 25.0;  then print temp directly.         */
    /*    It changed — you never touched temp by name!         */

    return 0;
}`,
      hint: 'Declare with double *p = &temp; then *p reads or writes temp. Bonus: print p itself with printf("%p\\n", (void *)p).'
    },
  },
});

/* ---------------- pointer arithmetic ---------------- */
CT.lesson({
  id: 'pointer-arithmetic',
  title: 'Pointer arithmetic: +1 is not one byte',
  minutes: 12, xp: 120,
  tags: 'pointer arithmetic sizeof ptrdiff one past end compare',
  why: `<p>Any program that walks through a thousand scores or a million pixels needs "go to the next one", which in C is spelled <code>p + 1</code> — and it secretly moves 4 or 8 bytes, not 1. Grasp that one rule and every walk-through-the-data loop you'll ever write makes sense. Miss it, and your code quietly reads memory that belongs to someone else.</p>`,
  html: `
<p>Here's a question that separates people who <em>know</em> C from people who've merely seen it: if <code>int *p</code> holds the address <code>0x1000</code>, what is <code>p + 1</code>? If you said <code>0x1001</code> — this lesson is for you.</p>

<h2>The golden rule: <code>p + 1</code> moves by <code>sizeof(*p)</code></h2>
<p>Pointer arithmetic counts in <strong>elements, not bytes</strong>. Adding 1 to an <code>int *</code> advances the address by <code>sizeof(int)</code> (4 bytes); adding 1 to a <code>double *</code> jumps 8; a <code>char *</code> moves 1. This is exactly why pointers carry a type: the type sets the <em>stride</em> — how far each step of arithmetic moves.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="mg1"></div>

<div data-w="q1"></div>

<h2>Subtracting pointers</h2>
<p>The reverse also works: subtracting two pointers into the <em>same array</em> gives the number of <strong>elements</strong> between them (not bytes!). The result has the signed type <code>ptrdiff_t</code> from <code>&lt;stddef.h&gt;</code>, printed with <code>%td</code>:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<h2>Comparing pointers &amp; the one-past-the-end rule</h2>
<p>Pointers into the same array can be compared with <code>&lt;</code>, <code>&gt;</code>, <code>==</code> — which enables the most idiomatic loop in C:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<p>Look at that loop condition: <code>p &lt; a + 5</code>. The pointer <code>a + 5</code> points <em>one past the last element</em>. The standard explicitly blesses this one special address: you may <strong>form</strong> it and <strong>compare</strong> against it — you just may not <strong>dereference</strong> it. It exists precisely so loops like this have a clean stopping line.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>One past the end is the cliff edge.</b> Computing <code>a + 6</code> (two past) or <code>a - 1</code> is undefined behavior <em>even if you never dereference it</em> — the mere arithmetic is illegal. Real compilers really do exploit this to optimize, so "it worked on my machine" proves nothing.</p></div></div>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>Pointer arithmetic on element after element probably smells like something familiar — time to meet arrays properly.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'stride.c',
      code: `#include <stdio.h>

int main(void) {
    int  arr[4] = {10, 20, 30, 40};
    int  *p = arr;
    char *c = (char *)arr;         /* same address, char view */

    printf("p      = %p\\n", (void *)p);
    printf("p + 1  = %p   (+%zu bytes)\\n", (void *)(p + 1), sizeof *p);
    printf("c      = %p\\n", (void *)c);
    printf("c + 1  = %p   (+1 byte)\\n", (void *)(c + 1));
    printf("*(p+2) = %d\\n", *(p + 2));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc stride.c -o stride && ./stride
p      = 0x7ffdc0d1e2a0
p + 1  = 0x7ffdc0d1e2a4   (+4 bytes)
c      = 0x7ffdc0d1e2a0
c + 1  = 0x7ffdc0d1e2a1   (+1 byte)
*(p+2) = 30
# same +1, different jump — the pointer TYPE sets the stride` },
    mg1: {
      type: 'memgrid', label: 'int cells are 4 bytes apart — p+1 lands on the next ELEMENT',
      cells: [
        { addr: '0x100', val: '10', name: 'a[0] ← p', hl: true },
        { addr: '0x104', val: '20', name: 'a[1] ← p+1', hl2: true },
        { addr: '0x108', val: '30', name: 'a[2] ← p+2' },
        { addr: '0x10C', val: '40', name: 'a[3] ← p+3' },
      ],
      note: 'Addresses go 0x100, 0x104, 0x108… — <code>p + k</code> means "address in p, plus <code>k * sizeof(int)</code> bytes".'
    },
    q1: { type: 'quiz', q: 'An <code>int *p</code> holds 0x1000 (4-byte ints). What is <code>p + 3</code>?', opts: ['0x1003', '0x100C', '0x1004', '0x1030'], a: 1, expl: 'Three elements of 4 bytes = 12 bytes = 0xC. Pointer arithmetic always scales by the pointed-to type’s size.' },
    code2: {
      type: 'code', title: 'ptrdiff.c',
      code: `#include <stdio.h>
#include <stddef.h>

int main(void) {
    int a[8] = {1, 2, 3, 4, 5, 6, 7, 8};
    int *first = &a[1];
    int *last  = &a[6];

    ptrdiff_t n = last - first;    /* ELEMENTS, not bytes */
    printf("last - first = %td\\n", n);
    printf("first < last : %s\\n", first < last ? "yes" : "no");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc ptrdiff.c -o ptrdiff && ./ptrdiff
last - first = 5
first < last : yes
# 20 bytes apart, but the answer is 5 — arithmetic is element-wise` },
    q2: { type: 'quiz', q: 'With <code>int a[10]</code>, what is <code>&amp;a[7] - &amp;a[2]</code>?', opts: ['20', '5', '0x14', 'Undefined behavior'], a: 1, expl: 'Pointer subtraction within one array yields the element count between them: 7 − 2 = 5. The byte distance (20) is divided by sizeof(int) for you.' },
    code3: {
      type: 'code', title: 'ptrloop.c',
      code: `#include <stdio.h>

int main(void) {
    int a[5] = {2, 4, 6, 8, 10};
    int sum = 0;

    for (int *p = a; p < a + 5; p++)  /* a+5: one PAST the end */
        sum += *p;

    printf("sum = %d\\n", sum);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc ptrloop.c -o ptrloop && ./ptrloop
sum = 30` },
    q3: { type: 'quiz', q: 'For <code>int a[5]</code>, which of these is fully legal?', opts: ['Dereferencing <code>a + 5</code>', 'Forming and comparing the pointer <code>a + 5</code>', 'Computing <code>a + 6</code> as long as you never dereference it', 'Computing <code>a - 1</code>'], a: 1, expl: 'The one-past-the-end pointer is the single blessed exception: form it, compare it, never read through it. Anything beyond that — even just computing the address — is undefined behavior.' },
    ex1: {
      type: 'editor', label: 'Exercise: two-pointer reverse', height: 320,
      code: `#include <stdio.h>

int main(void) {
    int a[6] = {1, 2, 3, 4, 5, 6};

    /* Reverse the array IN PLACE using two pointers:      */
    /*   int *lo = a;            (first element)           */
    /*   int *hi = a + 5;        (last element)            */
    /* while lo < hi: swap *lo and *hi, then lo++, hi--    */

    for (int i = 0; i < 6; i++)
        printf("%d ", a[i]);
    printf("\\n");                 /* want: 6 5 4 3 2 1 */
    return 0;
}`,
      hint: 'Inside the while loop: int tmp = *lo; *lo = *hi; *hi = tmp; then move both pointers toward the middle.'
    },
  },
});

/* ---------------- arrays ---------------- */
CT.lesson({
  id: 'arrays',
  title: 'Arrays: many values, one name',
  minutes: 12, xp: 110,
  tags: 'array index bounds initializer designated sizeof VLA',
  why: `<p>A game tracks a hundred enemies; a weather app stores a temperature for every hour — you can't invent a separate variable name for each one. Arrays give a single name to the whole batch and a number to each slot. The catch: C's arrays come with no safety net whatsoever, and stepping one slot past the end has caused more famous crashes and security holes than any other mistake in programming history.</p>`,
  html: `
<p>An <strong>array</strong> is a fixed-size sequence of elements of one type, packed <em>back-to-back</em> in memory. Declare with <code>int temps[5];</code> — five ints, indexed <code>temps[0]</code> through <code>temps[4]</code>. Yes, from <b>zero</b>: the index is really an <em>offset</em> from the start, and the first element is zero elements in.</p>

<h2>Declaring and indexing</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="mg1"></div>

<div data-w="q1"></div>

<h2>No bounds checking. None.</h2>
<p>Here's the deal C offers you: array indexing compiles to bare address arithmetic — maximally fast, zero safety net. Ask for <code>a[3]</code> in a 3-element array and C computes the address <em>three elements past the start</em> and reads whatever bytes happen to live there. No exception, no warning at runtime, no mercy:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Out-of-bounds access is undefined behavior</b> — the biggest single source of C bugs and security holes in history. It may return garbage, crash, corrupt a neighboring variable, or appear to work for years. The bounds live in <em>your</em> head; the compiler trusts you completely. Tools like <code>-fsanitize=address</code> catch these at runtime — use them.</p></div></div>

<div data-w="q2"></div>

<h2>Initializers</h2>
<p>Brace lists initialize arrays, with two lovely rules: <b>missing trailing elements become zero</b>, and (since C99) you can target specific indices with <strong>designated initializers</strong>:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>The element-count idiom:</b> <code>sizeof a / sizeof a[0]</code> — total bytes divided by bytes-per-element. Memorize it; every real C codebase has a macro for it. But beware: it only works where <code>a</code> is a true array (next-next lesson explains when it silently isn't).</p></div></div>

<div data-w="q3"></div>

<h2>Variable-length arrays (VLAs)</h2>
<p>C99 lets an array size be a runtime value: <code>int buf[n];</code>. Handy, but controversial: VLAs live on the stack, there's <em>no way to detect allocation failure</em>, and a large <code>n</code> simply crashes the program. C11 made them optional, and many codebases (the Linux kernel among them) ban VLAs outright. Prefer fixed sizes or <code>malloc</code> (coming soon).</p>

<div data-w="ex1"></div>

<p>You may have noticed arrays and pointers keep brushing against each other — after one quick detour, we'll confront that relationship head-on.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'temps.c',
      code: `#include <stdio.h>

int main(void) {
    int temps[5] = {12, 15, 19, 14, 9};

    temps[2] = 21;                 /* write element 2 */
    printf("first %d, last %d\\n", temps[0], temps[4]);

    for (int i = 0; i < 5; i++)    /* the canonical loop */
        printf("temps[%d] = %d\\n", i, temps[i]);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc temps.c -o temps && ./temps
first 12, last 9
temps[0] = 12
temps[1] = 15
temps[2] = 21
temps[3] = 14
temps[4] = 9` },
    mg1: {
      type: 'memgrid', label: 'int temps[5] — one contiguous block, elements 4 bytes apart',
      cells: [
        { addr: '0x100', val: '12', name: 'temps[0]', hl: true },
        { addr: '0x104', val: '15', name: 'temps[1]', hl: true },
        { addr: '0x108', val: '21', name: 'temps[2]', hl: true },
        { addr: '0x10C', val: '14', name: 'temps[3]', hl: true },
        { addr: '0x110', val: '9', name: 'temps[4]', hl: true },
      ],
      note: '<code>temps[i]</code> just means "start address + i × 4 bytes". That’s why indexing is O(1) — it’s one multiply and one add.'
    },
    q1: { type: 'quiz', q: 'For <code>int a[10]</code>, the valid indices are…', opts: ['1 to 10', '0 to 10', '0 to 9', 'any int — C doesn’t care'], a: 2, expl: 'Ten elements, offsets 0 through 9. Writing a[10] is the classic off-by-one: it’s one past the end, and touching it is undefined behavior.' },
    code2: {
      type: 'code', title: 'oops.c — compiles clean, still broken', run: false,
      code: `#include <stdio.h>

int main(void) {
    int a[3] = {1, 2, 3};

    printf("a[3]  = %d\\n", a[3]);    /* UB: reads past the end   */
    printf("a[42] = %d\\n", a[42]);   /* UB: reads a stranger’s   */
    return 0;                         /*     memory — or crashes  */
}`
    },
    term2: { type: 'term', text: `$ gcc oops.c -o oops && ./oops
a[3]  = 32764
a[42] = -1449275392
# garbage from neighboring stack memory — different every run
$ gcc -fsanitize=address oops.c -o oops && ./oops
==5150==ERROR: AddressSanitizer: stack-buffer-overflow ...` },
    q2: { type: 'quiz', q: 'What does C do when you read <code>a[99]</code> on an <code>int a[3]</code>?', opts: ['Throws an exception', 'Returns 0', 'Refuses to compile', 'Whatever happens, happens — it’s undefined behavior'], a: 3, expl: 'The generated code just reads the address 99 elements in. Garbage, crash, or silent corruption — all are "correct" outcomes of UB. C sold the safety net to buy speed.' },
    code3: {
      type: 'code', title: 'init.c',
      code: `#include <stdio.h>

int main(void) {
    int a[5]  = {1, 2};               /* rest zeroed: 1 2 0 0 0  */
    int b[]   = {1, 2, 3};            /* size inferred: 3        */
    int c[10] = {[0] = 1, [9] = 99};  /* designated (C99)        */

    printf("a: %d %d %d %d %d\\n", a[0], a[1], a[2], a[3], a[4]);
    printf("b has %zu elements\\n", sizeof b / sizeof b[0]);
    printf("c[9] = %d, c[5] = %d\\n", c[9], c[5]);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc init.c -o init && ./init
a: 1 2 0 0 0
b has 3 elements
c[9] = 99, c[5] = 0
# partial initialization zero-fills everything you didn't mention` },
    q3: { type: 'quiz', q: '<code>int a[5] = {7};</code> — what is <code>a[4]</code>?', opts: ['7', '0', 'Garbage (uninitialized)', 'Compile error'], a: 1, expl: 'Any initializer list, even a partial one, zero-fills the remaining elements. (With NO initializer at all, a local array’s contents really are garbage.)' },
    ex1: {
      type: 'editor', label: 'Exercise: find the maximum', height: 300,
      code: `#include <stdio.h>

int main(void) {
    int scores[8] = {61, 89, 42, 95, 73, 88, 90, 67};

    /* Find and print the largest score.                    */
    /* Start with int max = scores[0]; then loop over the   */
    /* rest, updating max whenever you see a bigger value.  */
    /* Use sizeof scores / sizeof scores[0] for the count!  */

    return 0;
}`,
      hint: 'size_t n = sizeof scores / sizeof scores[0]; for (size_t i = 1; i < n; i++) if (scores[i] > max) max = scores[i]; Expected answer: 95.'
    },
  },
});

/* ---------------- arrays vs pointers ---------------- */
CT.lesson({
  id: 'arrays-vs-pointers',
  title: 'Arrays vs pointers: the great confusion',
  minutes: 12, xp: 130,
  tags: 'decay array pointer sizeof a[i] *(a+i) parameter',
  why: `<p>By now arrays and pointers keep acting suspiciously alike — <code>*p</code> here, <code>a[i]</code> there, loops that work with either. One hidden rule explains the whole illusion, and it also answers two questions that bite every C learner: why <code>sizeof</code> seems to lie about an array inside a function, and why every function that takes an array forces you to pass its length separately.</p>`,
  html: `
<p>"Arrays are just pointers" is the most repeated <em>wrong</em> sentence in C education. Arrays and pointers are different things — an array <em>is</em> its elements; a pointer <em>refers</em> to something else. The confusion exists because of one sneaky rule, and once you know it, everything snaps into focus.</p>

<h2>The rule: arrays decay</h2>
<p>In almost every expression, an array name is automatically converted — <strong>"decays"</strong> — to a <em>pointer to its first element</em>. Write <code>a</code>, get <code>&amp;a[0]</code>. That's it. That's the whole trick behind a decade of confusion:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Notice the last line: <code>sizeof a</code> said 16, not 8. That's our first clue that <code>a</code> is <em>not</em> actually a pointer — more on that below.</p>

<div data-w="q1"></div>

<h2><code>a[i]</code> is <em>defined</em> as <code>*(a + i)</code></h2>
<p>Indexing isn't an array feature — it's a <strong>pointer</strong> feature! The standard literally defines <code>a[i]</code> to mean <code>*(a + i)</code>: decay the array, do pointer arithmetic, dereference. And since addition commutes, <code>*(a + i) == *(i + a)</code>… which means this monstrosity compiles:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>Yes, <code>2[a]</code> is legal C.</b> It desugars to <code>*(2 + a)</code>, same as <code>a[2]</code>. Wonderful for winning bar bets, terrible for code review. Use this power only for good.</p></div></div>

<div data-w="q2"></div>

<h2>When decay does NOT happen</h2>
<p>There are exactly three main escapes from decay, and they're where the array's true nature shows:</p>
<table>
<tr><th>expression</th><th>what you get</th></tr>
<tr><td><code>sizeof a</code></td><td>size of the <em>whole array</em> in bytes (e.g. 16 for <code>int a[4]</code>)</td></tr>
<tr><td><code>&amp;a</code></td><td>pointer to the whole array — type <code>int (*)[4]</code>, same address, different type: <code>&amp;a + 1</code> jumps 16 bytes!</td></tr>
<tr><td><code>char s[] = "hi"</code></td><td>a string literal initializing an array copies the characters — no decay</td></tr>
</table>

<div data-w="rv1"></div>

<h2>Array parameters are a polite fiction</h2>
<p>Now the kicker. When you declare a function parameter as an array, C silently rewrites it as a pointer — <code>void f(int a[10])</code>, <code>void f(int a[])</code>, and <code>void f(int *a)</code> declare <em>the exact same function</em>. The 10 is decorative. Consequences:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>An array never travels through a function call.</b> Only the address of its first element does — which is also why arrays "pass by reference" (the callee can modify your elements) and why every array-taking function needs a separate length parameter: <code>void f(int *a, size_t n)</code>. The length doesn't ride along; you must carry it yourself.</p></div></div>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>Armed with decay, you're ready for C's most famous "array of char with a twist" — strings.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'decay.c',
      code: `#include <stdio.h>

int main(void) {
    int a[4] = {10, 20, 30, 40};

    printf("a        = %p\\n", (void *)a);       /* decays!      */
    printf("&a[0]    = %p\\n", (void *)&a[0]);   /* same address */
    printf("*a       = %d\\n", *a);              /* a[0]         */
    printf("*(a + 2) = %d\\n", *(a + 2));        /* a[2]         */
    printf("sizeof a = %zu\\n", sizeof a);       /* NO decay: 16 */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc decay.c -o decay && ./decay
a        = 0x7ffe0b8c1540
&a[0]    = 0x7ffe0b8c1540
*a       = 10
*(a + 2) = 30
sizeof a = 16
# a acts like &a[0] everywhere — EXCEPT inside sizeof` },
    q1: { type: 'quiz', q: 'In most expressions, an array name evaluates to…', opts: ['The whole array, copied', 'A pointer to its first element', 'The number of elements', 'Its first element’s value'], a: 1, expl: 'That’s decay: <code>a</code> becomes <code>&amp;a[0]</code>. The array itself never moves; only its starting address is handed around.' },
    code2: {
      type: 'code', title: 'commute.c',
      code: `#include <stdio.h>

int main(void) {
    int a[4] = {10, 20, 30, 40};

    printf("a[2]     = %d\\n", a[2]);
    printf("*(a + 2) = %d\\n", *(a + 2));   /* the definition   */
    printf("*(2 + a) = %d\\n", *(2 + a));   /* + commutes...    */
    printf("2[a]     = %d\\n", 2[a]);       /* ...so this works */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc commute.c -o commute && ./commute
a[2]     = 30
*(a + 2) = 30
*(2 + a) = 30
2[a]     = 30` },
    q2: { type: 'quiz', q: 'Why does <code>3[a]</code> compile and equal <code>a[3]</code>?', opts: ['It’s a GCC extension', 'Because a[i] is defined as *(a+i), and addition commutes', 'It doesn’t compile', 'It only works for char arrays'], a: 1, expl: '<code>3[a]</code> → <code>*(3 + a)</code> → <code>*(a + 3)</code> → <code>a[3]</code>. Indexing is pointer arithmetic wearing square brackets.' },
    rv1: {
      type: 'reveal', label: 'Think first', q: 'Given <code>int a[8];</code> on a 64-bit machine — what are <code>sizeof a</code>, <code>sizeof &amp;a[0]</code>, and <code>sizeof (a + 0)</code>?',
      answer: '<p><code>sizeof a</code> = <b>32</b> (8 ints × 4 bytes — no decay inside sizeof). <code>sizeof &amp;a[0]</code> = <b>8</b> (it’s an <code>int *</code>, and pointers are 8 bytes here). <code>sizeof (a + 0)</code> = <b>8</b> too — the arithmetic forced <code>a</code> to decay into a pointer first! The moment an array participates in an expression, it’s a pointer.</p>'
    },
    code3: {
      type: 'code', title: 'param.c',
      code: `#include <stdio.h>

void inspect(int a[100]) {          /* the 100 is a lie:     */
    printf("inside : %zu\\n", sizeof a);  /* a is an int*    */
    a[0] = 999;                     /* modifies CALLER's array */
}

int main(void) {
    int a[100] = {1};
    printf("outside: %zu\\n", sizeof a);
    inspect(a);
    printf("a[0] is now %d\\n", a[0]);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc param.c -o param && ./param
param.c:5:35: warning: 'sizeof' on array parameter 'a' will
    return size of 'int *' [-Wsizeof-array-argument]
outside: 400
inside : 8
a[0] is now 999
# inside the function, "a" is just a pointer — 8 bytes` },
    q3: { type: 'quiz', q: 'Inside <code>void f(int a[10])</code>, what is <code>sizeof a</code>?', opts: ['40', '10', 'sizeof(int *) — the parameter is really a pointer', 'A compile error'], a: 2, expl: 'Array parameters are rewritten to pointers before the function body ever sees them. The declared size is documentation at best — which is why functions take an explicit length argument.' },
    ex1: {
      type: 'editor', label: 'Exercise: a proper array function', height: 320,
      code: `#include <stdio.h>

/* Write:  int sum(const int *a, size_t n)          */
/* that returns the sum of a[0..n-1].               */
/* (const promises you won't modify the elements.)  */

int main(void) {
    int data[5] = {3, 1, 4, 1, 5};

    /* call it like:                                   */
    /* printf("%d\\n", sum(data, sizeof data / sizeof data[0])); */
    /* expected output: 14                             */
    return 0;
}`,
      hint: 'Define sum above main. Inside, loop i from 0 to n-1 accumulating a[i] — or flex your new skills with for (const int *p = a; p < a + n; p++).'
    },
  },
});

/* ---------------- strings ---------------- */
CT.lesson({
  id: 'strings',
  title: 'Strings: char arrays with a secret handshake',
  minutes: 13, xp: 120,
  tags: 'string char array null terminator strlen strcpy strcmp literal overflow',
  why: `<p>Every username, chat message, and filename your programs will ever touch is text — and C stores text as a bare <code>char</code> array with a hidden stop sign at the end. Lose that stop sign and the string functions march through memory unchecked; that exact class of mistake helped the 1988 Morris worm knock out a tenth of the internet. This lesson hands you the convention, the toolbox, and the habits that keep your code off that list.</p>`,
  html: `
<p>C has no string type. What it has is a <em>convention</em>: a string is a <code>char</code> array whose end is marked by a <strong>zero byte</strong>, written <code>'\\0'</code> and called the <em>null terminator</em>. Every string function in existence — <code>printf("%s")</code>, the length-counter <code>strlen</code>, all of them — just walks forward from a starting address until it hits that zero.</p>

<div data-w="mg1"></div>

<h2>Working with strings</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Two different questions, two different answers: <code>strlen</code> counts characters <em>before</em> the terminator (2); <code>sizeof</code> measures the whole array <em>including</em> it (3). Forgetting the terminator's byte when sizing a buffer is a classic off-by-one.</p>

<div data-w="q1"></div>

<h2>String literals are (effectively) read-only</h2>
<p>The same-looking declarations below are deeply different. An <em>array</em> initialized from a literal gets its own writable copy of the bytes. A <em>pointer</em> assigned a literal points straight into the program's read-only data segment (<code>.rodata</code> — remember the memory map?):</p>
<div data-w="code2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Modifying a string literal is undefined behavior.</b> On typical systems the literal lives in a write-protected page, so <code>readonly[0] = 'H'</code> dies with a segfault. Defend yourself by declaring literal pointers as <code>const char *s = "hello";</code> — then the compiler rejects the write at build time instead.</p></div></div>

<div data-w="q2"></div>

<h2>The <code>&lt;string.h&gt;</code> toolbox</h2>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b><code>strcmp</code> does not return a boolean!</b> It returns negative / zero / positive for less / equal / greater (think: "a minus b"). So <code>if (strcmp(a, b))</code> is true when the strings <em>differ</em> — the exact opposite of what it looks like. Always write <code>strcmp(a, b) == 0</code> for equality.</p></div></div>

<h2>Buffer overflows: a 40-year-old wound</h2>
<p><code>strcpy</code> and <code>strcat</code> copy until they find <code>'\\0'</code> — they never check whether the destination is big enough. Copy 20 bytes into a 8-byte buffer and you overwrite whatever lives next door: other variables, or the function's return address. That's not just a bug; overwriting the return address with attacker-chosen bytes is <em>the</em> classic security exploit.</p>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p>The 1988 <b>Morris worm</b> — the first internet worm, which took down ~10% of the internet — spread partly through a buffer overflow in a string routine (<code>gets</code>). <code>gets</code> was finally removed from the C standard in C11, the only function ever expelled. Use bounded functions: <code>snprintf</code>, <code>fgets</code>, <code>strncat</code>.</p></div></div>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>One string is a 1-D char array — so what's an array of strings? Time to stack arrays inside arrays.</p>
`,
  widgets: {
    mg1: {
      type: 'memgrid', label: 'char s[] = "hi" — three bytes, one per cell',
      cells: [
        { addr: '0x100', val: "'h' 104", name: 's[0]', hl: true },
        { addr: '0x101', val: "'i' 105", name: 's[1]', hl: true },
        { addr: '0x102', val: "'\\0' 0", name: 's[2]', hl2: true },
      ],
      note: 'The terminator (orange) is invisible in source but very real in memory: "hi" costs 3 bytes. String functions stop when they hit it — lose it, and they march on through neighboring memory.'
    },
    code1: {
      type: 'code', title: 'hi.c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "hi";    /* really {'h','i','\\0'} */

    printf("strlen: %zu\\n", strlen(s));   /* chars before \\0 */
    printf("sizeof: %zu\\n", sizeof s);    /* whole array     */

    for (int i = 0; s[i] != '\\0'; i++)    /* the string walk  */
        printf("s[%d] = '%c' (%d)\\n", i, s[i], s[i]);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc hi.c -o hi && ./hi
strlen: 2
sizeof: 3
s[0] = 'h' (104)
s[1] = 'i' (105)` },
    q1: { type: 'quiz', q: 'How many bytes does <code>char s[] = "cat";</code> occupy?', opts: ['3', '4', '8', 'Implementation-defined'], a: 1, expl: "Three letters plus the hidden <code>'\\0'</code> terminator = 4 bytes. Buffers must always budget that extra byte." },
    code2: {
      type: 'code', title: 'two_kinds.c — one of these lines is a landmine', run: false,
      code: `char stack_copy[] = "hello"; /* ARRAY: bytes copied onto the
                                stack — yours, writable      */
char *readonly   = "hello";  /* POINTER into .rodata — the
                                literal itself, do NOT write */

stack_copy[0] = 'H';         /* fine: your copy              */
readonly[0]   = 'H';         /* UB — typically SIGSEGV       */`
    },
    q2: { type: 'quiz', q: '<code>char *p = "abc"; p[0] = &#39;x&#39;;</code> — what happens?', opts: ['p becomes "xbc"', 'Compile error', 'Undefined behavior — the literal is (effectively) read-only', 'Nothing at all'], a: 2, expl: 'The pointer aims at the literal in read-only storage; writing through it is UB and usually segfaults. Write <code>const char *p</code> and the compiler will catch the mistake for you.' },
    code3: {
      type: 'code', title: 'toolbox.c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char buf[32] = "Hello";          /* room to grow      */

    strcat(buf, ", world");          /* append (must fit!) */
    printf("%s (len %zu)\\n", buf, strlen(buf));

    char copy[32];
    strcpy(copy, buf);               /* copies incl. \\0   */

    printf("strcmp(\\"apple\\",\\"banana\\") = %d\\n",
           strcmp("apple", "banana"));
    printf("copy equals buf? %s\\n",
           strcmp(copy, buf) == 0 ? "yes" : "no");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc toolbox.c -o toolbox && ./toolbox
Hello, world (len 12)
strcmp("apple","banana") = -1
copy equals buf? yes
# strcmp guarantees only the SIGN: any negative value is legal` },
    q3: { type: 'quiz', q: 'When does <code>if (strcmp(a, b))</code> take the branch?', opts: ['When the strings are equal', 'When the strings differ', 'When a is longer than b', 'Never — it doesn’t compile'], a: 1, expl: 'strcmp returns 0 (falsy!) for equal strings and nonzero otherwise. The naked-strcmp condition reads like "if equal" but means "if different" — a beloved interview trap.' },
    ex1: {
      type: 'editor', label: 'Exercise: write your own strlen', height: 320,
      code: `#include <stdio.h>

/* Implement:  size_t my_strlen(const char *s)       */
/* Count characters until you reach '\\0'.            */
/* No <string.h> allowed — that's the point!         */

int main(void) {
    /* test it: */
    /* printf("%zu\\n", my_strlen(""));        -> 0   */
    /* printf("%zu\\n", my_strlen("pointer")); -> 7   */
    return 0;
}`,
      hint: "size_t n = 0; while (s[n] != '\\0') n++; return n; — or the pointer version: walk const char *p = s until *p is 0, then return p - s."
    },
  },
});

/* ---------------- multidimensional arrays ---------------- */
CT.lesson({
  id: 'multidim-arrays',
  title: 'Multidimensional arrays: grids in a flat world',
  minutes: 12, xp: 120,
  tags: '2d array matrix row major nested arrays of pointers jagged',
  why: `<p>Chess boards, Minesweeper fields, spreadsheets, every photo on your screen — all grids. But memory, as you've seen since Part 0, is one straight line of bytes, so C has to fold each grid into that line. Learn the fold and you'll be able to hand grids to functions without baffling compiler errors — and you'll see why looping over a big grid in the wrong order can make the exact same code several times slower.</p>`,
  html: `
<p>Memory is one long line of bytes — there is no "up" or "down" in RAM. So how does C store a grid like <code>int m[2][3]</code>? By a beautifully simple trick: a 2-D array is an <strong>array of arrays</strong>. <code>m</code> is 2 elements long, and each element is itself an <code>int[3]</code> row.</p>

<h2>Declaring and looping</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p><code>sizeof m[0]</code> is 12 — one whole row. That confirms the "array of arrays" story: <code>m[1]</code> is a real <code>int[3]</code>, and <code>m[1][2]</code> indexes into it.</p>

<div data-w="q1"></div>

<h2>Row-major: the grid, flattened</h2>
<p>The rows are laid end-to-end in one contiguous block — row 0 first, then row 1. This is called <strong>row-major order</strong>:</p>

<div data-w="mg1"></div>

<p>So the address math for <code>m[r][c]</code> is: <code>base + (r * COLS + c) * sizeof(int)</code>. Skip <code>r</code> full rows, then <code>c</code> elements into the row. We can prove the flatness by walking the whole grid with a single pointer:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Performance bonus:</b> because rows are contiguous, looping <em>row by row</em> (the inner loop over columns) touches memory sequentially and keeps the CPU cache happy. Loop column-first over a big matrix and you can easily go several times slower — same math, worse order.</p></div></div>

<div data-w="q2"></div>

<h2>Passing 2-D arrays to functions</h2>
<p>When a 2-D array decays, it becomes a pointer to its first element — and the first element is a <em>row</em>. So <code>int m[2][3]</code> decays to <code>int (*)[3]</code>: "pointer to array of 3 ints". That's why the parameter must spell out the inner size:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<p>Why is the 3 mandatory? Look at the address math above: computing <code>m[r][c]</code> needs <code>COLS</code>. Without the inner dimension the compiler literally cannot find row 1. (The <em>outer</em> size is still decorative, as always.)</p>

<div data-w="q3"></div>

<h2>The impostor: arrays of pointers</h2>
<p><code>char *menu[3]</code> looks 2-D when you write <code>menu[i][j]</code>, but it's a completely different animal: an array of 3 <em>pointers</em>, each aiming at a separately-stored string, possibly of different lengths ("jagged"). Two dereferences instead of one address calculation:</p>

<div data-w="mg2"></div>

<p>Both support <code>x[i][j]</code> syntax — which is exactly why people mix them up. True 2-D: one block, address math. Array of pointers: a table of arrows. You'll build the jagged kind yourself once you can <code>malloc</code> — which is the very next lesson.</p>

<div data-w="ex1"></div>
`,
  widgets: {
    code1: {
      type: 'code', title: 'grid.c',
      code: `#include <stdio.h>

int main(void) {
    int m[2][3] = {
        {1, 2, 3},      /* row 0 */
        {4, 5, 6},      /* row 1 */
    };

    for (int r = 0; r < 2; r++) {
        for (int c = 0; c < 3; c++)
            printf("%d ", m[r][c]);
        printf("\\n");
    }
    printf("sizeof m    = %zu\\n", sizeof m);     /* whole grid */
    printf("sizeof m[0] = %zu\\n", sizeof m[0]);  /* one row    */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc grid.c -o grid && ./grid
1 2 3
4 5 6
sizeof m    = 24
sizeof m[0] = 12` },
    q1: { type: 'quiz', q: 'What exactly is <code>m[1]</code> for <code>int m[2][3]</code>?', opts: ['An int', 'A pointer stored in memory next to m[0]', 'The second row — a real <code>int[3]</code> array', 'A syntax error without a second index'], a: 2, expl: 'A 2-D array is an array of arrays: m[1] is the second row, an int[3] living 12 bytes after the start. (In expressions it happily decays to an int* like any array.)' },
    mg1: {
      type: 'memgrid', label: 'int m[2][3] in memory — row 0 (blue) then row 1 (orange), no gaps',
      cells: [
        { addr: '0x100', val: '1', name: 'm[0][0]', hl: true },
        { addr: '0x104', val: '2', name: 'm[0][1]', hl: true },
        { addr: '0x108', val: '3', name: 'm[0][2]', hl: true },
        { addr: '0x10C', val: '4', name: 'm[1][0]', hl2: true },
        { addr: '0x110', val: '5', name: 'm[1][1]', hl2: true },
        { addr: '0x114', val: '6', name: 'm[1][2]', hl2: true },
      ],
      note: 'Row-major: finish a row, start the next. <code>m[1][0]</code> sits at base + (1×3 + 0)×4 = base + 12.'
    },
    code2: {
      type: 'code', title: 'flat.c',
      code: `#include <stdio.h>

int main(void) {
    int m[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int *flat = &m[0][0];             /* first int of the block */

    /* m[r][c] lives (r*3 + c) elements from the start: */
    printf("m[1][2]     = %d\\n", m[1][2]);
    printf("flat[1*3+2] = %d\\n", flat[1*3 + 2]);

    printf("&m[0][0] = %p\\n", (void *)&m[0][0]);
    printf("&m[1][0] = %p\\n", (void *)&m[1][0]);  /* +12 bytes */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc flat.c -o flat && ./flat
m[1][2]     = 6
flat[1*3+2] = 6
&m[0][0] = 0x7ffcd58e91b0
&m[1][0] = 0x7ffcd58e91bc
# 0x1bc - 0x1b0 = 0xc = 12 bytes = one full row` },
    q2: { type: 'quiz', q: 'For <code>int m[4][5]</code> (4-byte ints), what is the byte offset of <code>m[2][3]</code> from the start?', opts: ['23', '32', '52', '92'], a: 2, expl: 'Offset = (r × COLS + c) × sizeof(int) = (2×5 + 3) × 4 = 13 × 4 = 52 bytes. Skip two full rows (40 bytes), then three ints (12 more).' },
    code3: {
      type: 'code', title: 'pass2d.c',
      code: `#include <stdio.h>

/* the inner size (3) is REQUIRED — it sets the row stride */
int sum(int rows, int m[][3]) {       /* same as int (*m)[3] */
    int s = 0;
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < 3; c++)
            s += m[r][c];
    return s;
}

int main(void) {
    int grid[2][3] = {{1, 2, 3}, {4, 5, 6}};
    printf("sum = %d\\n", sum(2, grid));
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc pass2d.c -o pass2d && ./pass2d
sum = 21` },
    q3: { type: 'quiz', q: 'Why must a 2-D array parameter be written <code>int m[][4]</code> — what is the 4 for?', opts: ['Pure documentation', 'The compiler needs the row width to compute the address of m[i][j]', 'It makes the compiler bounds-check columns', 'It limits callers to exactly 4 rows'], a: 1, expl: 'm[i][j] compiles to base + (i×4 + j)×sizeof(int). Drop the 4 and the stride is unknown — the compiler rejects it. The OUTER dimension can be omitted, as usual.' },
    mg2: {
      type: 'memgrid', label: 'char *menu[2] — a table of arrows, not a grid',
      cells: [
        { addr: '0x100', val: '0x300', name: 'menu[0]', hl2: true },
        { addr: '0x108', val: '0x340', name: 'menu[1]', hl2: true },
        { addr: '0x300', val: '"tea\\0"', name: 'target of menu[0]', hl: true },
        { addr: '0x340', val: '"coffee\\0"', name: 'target of menu[1]', hl: true },
      ],
      note: 'The pointer table (orange) is contiguous; the strings (blue) live elsewhere and have different lengths. <code>menu[i][j]</code> = load pointer i, THEN index into its string — two memory hops.'
    },
    ex1: {
      type: 'editor', label: 'Exercise: trace of a matrix', height: 320,
      code: `#include <stdio.h>

int main(void) {
    int m[3][3] = {
        {5, 1, 2},
        {9, 7, 3},
        {4, 8, 6},
    };

    /* 1. Print the "trace": the sum of the main diagonal    */
    /*    m[0][0] + m[1][1] + m[2][2]  (expected: 18)        */
    /* 2. Bonus: print the whole grid transposed —           */
    /*    print m[c][r] instead of m[r][c].                  */

    return 0;
}`,
      hint: 'One loop suffices for the diagonal: for (int i = 0; i < 3; i++) trace += m[i][i]; For the transpose, swap the roles of the loop indices when printing.'
    },
  },
});

/* ---------------- dynamic memory ---------------- */
CT.lesson({
  id: 'dynamic-memory',
  title: 'malloc & friends: memory on demand',
  minutes: 14, xp: 140,
  tags: 'malloc calloc realloc free heap leak double free use after free valgrind',
  why: `<p>That browser that gets slower and slower until you restart it? Odds are it's leaking memory — the signature failure of the by-hand memory management you're about to learn. <code>malloc</code> is how programs handle data whose size nobody knows until a user shows up with it: their file, their message, their playlist. Every array you've built so far had its size baked in at compile time; after this lesson, that restriction is gone.</p>`,
  html: `
<p>Every array so far had a size fixed at compile time (or lived dangerously on the stack as a VLA). But real programs read files, take input, grow lists — they need memory whose size is known only at <em>runtime</em>, and which can <em>outlive</em> the function that created it. That memory lives on the <strong>heap</strong>, and you manage it by hand.</p>

<h2>The core pair: <code>malloc</code> and <code>free</code></h2>
<p><code>malloc(n)</code> (from <code>&lt;stdlib.h&gt;</code>) requests <code>n</code> bytes from the heap and returns a pointer to them — or <code>NULL</code> if the system can't oblige. The bytes are <em>uninitialized garbage</em>. When you're done, and not before, you return them with <code>free(p)</code>:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>The <code>sizeof *a</code> idiom:</b> writing <code>malloc(n * sizeof *a)</code> instead of <code>malloc(n * sizeof(int))</code> means the size expression is tied to the pointer itself — change <code>a</code>'s type later and the allocation stays correct automatically. Also note: no cast on malloc's result needed in C (that's a C++ habit).</p></div></div>

<div data-w="q1"></div>

<h2><code>calloc</code> and <code>realloc</code></h2>
<p><code>calloc(count, size)</code> allocates <em>and zeroes</em> the memory (and checks that <code>count × size</code> doesn't overflow). <code>realloc(p, newsize)</code> resizes an allocation — possibly by <strong>moving it somewhere else entirely</strong>, copying your data over:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Never write <code>p = realloc(p, n)</code>.</b> If realloc fails it returns NULL but leaves the old block allocated — and you just overwrote your only pointer to it. That's a guaranteed leak. Always catch the result in a fresh variable, check it, <em>then</em> assign.</p></div></div>

<div data-w="q2"></div>

<h2>The three deadly sins</h2>
<p>Manual memory management has exactly three classic failure modes. Learn their names — you will meet all of them:</p>
<ul>
<li><b>Memory leak:</b> losing the last pointer to a block without freeing it. The program's memory use grows forever; long-running servers die slowly.</li>
<li><b>Use-after-free:</b> dereferencing a pointer after <code>free</code>. The allocator may have recycled those bytes for something else — you're reading or corrupting a stranger's data.</li>
<li><b>Double free:</b> freeing the same pointer twice corrupts the allocator's own bookkeeping. Modern allocators often abort with <code>free(): double free detected</code>.</li>
</ul>
<div data-w="code3"></div>

<div data-w="mg1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b><code>free(p)</code> does not change <code>p</code>.</b> The pointer still holds the old address — now a <em>dangling pointer</em>. The pro habit: <code>free(p); p = NULL;</code>. Dereferencing NULL crashes loudly and immediately; dereferencing a dangling pointer corrupts quietly and ruins your week. (Bonus: <code>free(NULL)</code> is defined as a harmless no-op.)</p></div></div>

<div data-w="q3"></div>

<h2>Your new best friend: valgrind</h2>
<p>You don't have to hunt these bugs with printf. <strong>valgrind</strong> runs your program in an instrumented sandbox and reports every leak, use-after-free, and out-of-bounds access with a stack trace:</p>
<div data-w="term3"></div>
<p>We'll tour valgrind and AddressSanitizer properly in the toolchain part — for now, just know that <code>valgrind ./myprog</code> is one command and it catches what your eyes can't.</p>

<div data-w="ex1"></div>

<p>So far the heap has held plain arrays — next we'll teach C to allocate <em>records</em> with named fields: structs.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'firstmalloc.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 5;                        /* runtime size — fine!  */
    int *a = malloc(n * sizeof *a);
    if (a == NULL) {                  /* malloc CAN fail       */
        fprintf(stderr, "out of memory\\n");
        return 1;
    }

    for (int i = 0; i < n; i++)       /* contents were garbage */
        a[i] = i * i;
    printf("a[4] = %d\\n", a[4]);

    free(a);                          /* give it back          */
    a = NULL;                         /* defuse the dangler    */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc firstmalloc.c -o firstmalloc && ./firstmalloc
a[4] = 16` },
    q1: { type: 'quiz', q: 'Why prefer <code>malloc(n * sizeof *a)</code> over <code>malloc(n * sizeof(int))</code>?', opts: ['It allocates faster', 'It stays correct automatically if a’s type ever changes', 'sizeof(int) is deprecated', 'The compiler requires it since C11'], a: 1, expl: 'sizeof *a means "the size of whatever a points to" — refactor int* to long* and the allocation follows along. The spelled-out type is a bug waiting for a refactor.' },
    code2: {
      type: 'code', title: 'grow.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *a = calloc(4, sizeof *a);     /* 4 ints, all ZERO    */
    if (!a) return 1;
    printf("a[3] = %d (calloc zeroes)\\n", a[3]);

    int *bigger = realloc(a, 8 * sizeof *a);
    if (bigger == NULL) {              /* old block STILL ok  */
        free(a);
        return 1;
    }
    a = bigger;                        /* may have MOVED!     */

    a[7] = 99;                         /* new bytes: garbage, */
    printf("a[0] = %d, a[7] = %d\\n", a[0], a[7]); /* not 0  */
    free(a);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc grow.c -o grow && ./grow
a[3] = 0 (calloc zeroes)
a[0] = 0, a[7] = 99
# realloc kept bytes 0-15 intact, even if it moved the block` },
    q2: { type: 'quiz', q: 'What does <code>calloc</code> give you that <code>malloc</code> doesn’t?', opts: ['Stack allocation', 'Zero-filled memory, plus an overflow check on count × size', 'Automatic freeing at scope exit', 'Faster allocation'], a: 1, expl: 'calloc zeroes every byte and safely detects if count × size would overflow. malloc hands you uninitialized garbage — reading it before writing is UB.' },
    code3: {
      type: 'code', title: 'sins.c — all three, do NOT run this', run: false,
      code: `int *p = malloc(sizeof *p);
*p = 42;
p = malloc(sizeof *p);   /* SIN 1: leak — first block lost   */

free(p);
printf("%d\\n", *p);      /* SIN 2: use-after-free — UB       */
free(p);                  /* SIN 3: double free — UB, often   */
                          /*        aborts the program        */`
    },
    mg1: {
      type: 'memgrid', label: 'After free(p): the pointer survives, the block doesn’t',
      cells: [
        { addr: '0x7ffc9a40', val: '0x55e1b2a0', name: 'p (stack)', hl2: true },
        { addr: '0x55e1b2a0', val: '??', name: 'freed chunk', freed: true },
        { addr: '0x55e1b2a4', val: '??', name: 'freed chunk', freed: true },
      ],
      note: '<code>p</code> (orange) still confidently stores 0x55e1b2a0 — but the heap cells there (grayed) belong to the allocator again, and the next malloc may hand them to someone else. Following the arrow now is use-after-free.'
    },
    q3: { type: 'quiz', q: 'After <code>free(p);</code>, what is the state of <code>p</code> itself?', opts: ['It becomes NULL automatically', 'It still holds the old address — a dangling pointer', 'It’s deallocated along with the block', 'Reading p (not *p) is a crash'], a: 1, expl: 'free receives a COPY of the address, so it can’t modify your variable. p dangles until you overwrite it — hence the discipline: free(p); p = NULL;' },
    term3: { type: 'term', text: `$ gcc -g leaky.c -o leaky && valgrind ./leaky
==7412== HEAP SUMMARY:
==7412==     in use at exit: 40 bytes in 1 blocks
==7412==   total heap usage: 2 allocs, 1 frees
==7412== 40 bytes in 1 blocks are definitely lost in loss record 1 of 1
==7412==    at 0x4846828: malloc (vg_replace_malloc.c:446)
==7412==    by 0x109172: main (leaky.c:6)
# "definitely lost" = a leak, with the exact line that allocated it` },
    ex1: {
      type: 'editor', label: 'Exercise: a runtime-sized array, done right', height: 340,
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 10;

    /* 1. malloc an array of n ints (use the sizeof *a idiom) */
    /* 2. check for NULL — return 1 if allocation failed      */
    /* 3. fill a[i] = i * i and print the array               */
    /* 4. free it, and NULL the pointer                       */

    return 0;
}`,
      hint: 'int *a = malloc(n * sizeof *a); if (!a) return 1; …loop, print… free(a); a = NULL; Change n to 1000000 — still fine. Try that with a VLA and watch the stack cry.'
    },
  },
});

/* ---------------- structs ---------------- */
CT.lesson({
  id: 'structs',
  title: 'Structs: inventing your own types',
  minutes: 13, xp: 130,
  tags: 'struct member dot arrow padding alignment typedef offsetof',
  why: `<p>Real data travels in bundles: a game character has a name, health, and a position; a contact has a name and a number. An array can't hold that mix, because every element must be the same type. Structs let you weld different pieces into one value you can copy, pass to functions, and return — your first step from <em>using</em> C's types to <em>inventing</em> your own.</p>`,
  html: `
<p>Arrays hold many values of <em>one</em> type. But the world is made of records: a point has an x <em>and</em> a y; a player has a name, a score, and health. A <strong>struct</strong> bundles differently-typed members into one new type — your first taste of designing types instead of just using them.</p>

<h2>Defining and using</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Note what assignment did: <code>struct Point q = p;</code> copied <em>every member</em>. Structs are values — they copy, pass, and return whole, unlike arrays (which decay into pointers the moment you look at them).</p>

<div data-w="q1"></div>

<h2>Pointers to structs: the <code>-&gt;</code> arrow</h2>
<p>Copying a big struct into every function call is wasteful, and copies can't modify the original — so in practice you pass a <em>pointer</em> to the struct. Accessing a member through a pointer is so common it earned its own operator: <code>p-&gt;x</code> is sugar for <code>(*p).x</code>:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Why the parentheses in <code>(*p).x</code>?</b> Because <code>.</code> binds tighter than <code>*</code>: the unparenthesized <code>*p.x</code> parses as <code>*(p.x)</code> — "dereference the member x of p" — which is a type error. The arrow exists precisely so you never have to remember this.</p></div></div>

<div data-w="q2"></div>

<h2>Memory layout: mind the gaps</h2>
<p>You might expect <code>struct { char c; int n; }</code> to take 1 + 4 = 5 bytes. It takes <strong>8</strong>. Why? CPUs load an <code>int</code> fastest when its address is a multiple of 4, so the compiler inserts invisible <strong>padding</strong> after <code>c</code> to push <code>n</code> to an aligned offset:</p>

<div data-w="mg1"></div>

<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Order members from largest to smallest</b> and padding mostly disappears — that's how <code>Good</code> saved 4 bytes over <code>Bad</code> with identical members. In an array of a million structs, that's 4 MB for free. (The exact padding is implementation-defined; <code>offsetof</code> from <code>&lt;stddef.h&gt;</code> tells you the truth on your platform. And never compare structs with <code>memcmp</code> — the padding bytes are indeterminate.)</p></div></div>

<div data-w="q3"></div>

<h2>The <code>typedef struct</code> pattern</h2>
<p>Tired of typing <code>struct Point</code> everywhere? <code>typedef</code> gives the type a one-word name — this is the idiom you'll see in virtually every C library, along with designated initializers and compound literals:</p>
<div data-w="code4"></div>
<div data-w="term4"></div>
<p>Passing and returning structs <em>by value</em> like this is perfectly fine for small types (a couple of words). For big structs, pass <code>const struct Big *</code> instead: pointer-sized cost, and <code>const</code> documents that you won't modify it.</p>

<div data-w="ex1"></div>

<p>A struct gives every member its own bytes. Next: a stranger beast where all the members <em>share</em> the same bytes.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'point.c',
      code: `#include <stdio.h>

struct Point {          /* a new type: struct Point */
    int x;
    int y;
};

int main(void) {
    struct Point p = { .x = 3, .y = 7 };  /* designated init */

    p.x += 1;                     /* dot: access a member    */
    printf("p = (%d, %d)\\n", p.x, p.y);

    struct Point q = p;           /* copies BOTH members     */
    q.y = 0;
    printf("p.y=%d q.y=%d\\n", p.y, q.y);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc point.c -o point && ./point
p = (4, 7)
p.y=7 q.y=0
# q was a full copy — changing it left p alone` },
    q1: { type: 'quiz', q: 'After <code>struct Point q = p; q.x = 99;</code> — what is <code>p.x</code>?', opts: ['99', 'Unchanged — struct assignment copies the whole value', 'Undefined behavior', 'Compile error: structs can’t be assigned'], a: 1, expl: 'Structs are first-class values: =, argument passing, and return all copy member-by-member. If you WANT sharing, pass a pointer — that’s the next section.' },
    code2: {
      type: 'code', title: 'arrow.c',
      code: `#include <stdio.h>

struct Point { int x, y; };

void move(struct Point *p, int dx, int dy) {
    p->x += dx;                /* same as (*p).x += dx */
    p->y += dy;
}

int main(void) {
    struct Point pt = {10, 20};
    move(&pt, 1, -2);          /* pass the ADDRESS     */
    printf("(%d, %d)\\n", pt.x, pt.y);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc arrow.c -o arrow && ./arrow
(11, 18)
# move() reached back through the pointer — swap() all over again` },
    q2: { type: 'quiz', q: 'You have <code>struct Point *p</code>. Which expression reads member x?', opts: ['<code>p.x</code>', '<code>*p.x</code>', '<code>p-&gt;x</code> (equivalently <code>(*p).x</code>)', '<code>&amp;p.x</code>'], a: 2, expl: 'Dot needs an actual struct, not a pointer. *p.x parses as *(p.x) — wrong. The arrow is exactly "dereference, then dot", precedence handled for you.' },
    mg1: {
      type: 'memgrid', label: 'struct { char c; int n; } — byte by byte (8 bytes, not 5!)',
      cells: [
        { addr: '+0', val: "'A'", name: 'c', hl: true },
        { addr: '+1', val: '·', name: 'pad', freed: true },
        { addr: '+2', val: '·', name: 'pad', freed: true },
        { addr: '+3', val: '·', name: 'pad', freed: true },
        { addr: '+4', val: 'n₀', name: 'n', hl2: true },
        { addr: '+5', val: 'n₁', name: 'n', hl2: true },
        { addr: '+6', val: 'n₂', name: 'n', hl2: true },
        { addr: '+7', val: 'n₃', name: 'n', hl2: true },
      ],
      note: 'Three padding bytes (grayed) push <code>n</code> to offset 4, a multiple of its alignment. The padding holds garbage and has no name — it just costs space.'
    },
    code3: {
      type: 'code', title: 'padding.c',
      code: `#include <stdio.h>
#include <stddef.h>

struct Bad  { char a; int n; char b; };   /* 1+3pad+4+1+3pad */
struct Good { int n; char a; char b; };   /* 4+1+1+2pad      */

int main(void) {
    printf("Bad : %zu bytes\\n", sizeof(struct Bad));
    printf("  a@%zu n@%zu b@%zu\\n",
           offsetof(struct Bad, a),
           offsetof(struct Bad, n),
           offsetof(struct Bad, b));
    printf("Good: %zu bytes\\n", sizeof(struct Good));
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc padding.c -o padding && ./padding
Bad : 12 bytes
  a@0 n@4 b@8
Good: 8 bytes
# same three members, 33% smaller — order matters` },
    q3: { type: 'quiz', q: 'Why is <code>sizeof(struct { char c; int n; })</code> typically 8, not 5?', opts: ['Compilers round every struct to a power of two', 'Three padding bytes align n to a 4-byte boundary', 'The struct tag itself occupies bytes', 'char secretly takes 4 bytes inside structs'], a: 1, expl: 'Alignment: int wants an address divisible by 4, so the compiler pads after c. The struct’s total size is also padded to a multiple of the strictest alignment so arrays of it stay aligned.' },
    code4: {
      type: 'code', title: 'vec2.c',
      code: `#include <stdio.h>

typedef struct {
    double x, y;
} Vec2;                      /* now just "Vec2"          */

Vec2 add(Vec2 a, Vec2 b) {   /* in by value, out by value */
    return (Vec2){ a.x + b.x, a.y + b.y };
}

int main(void) {
    Vec2 v = add((Vec2){1, 2}, (Vec2){3, 4});
    printf("(%g, %g)\\n", v.x, v.y);
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc vec2.c -o vec2 && ./vec2
(4, 6)` },
    ex1: {
      type: 'editor', label: 'Exercise: rectangles', height: 340,
      code: `#include <stdio.h>

/* 1. Define:  typedef struct { int w, h; } Rect;         */
/* 2. Write:   int area(const Rect *r)   using r->w, r->h */
/* 3. Write:   void scale(Rect *r, int k)  that multiplies */
/*    both sides by k (it must modify the caller's Rect!) */

int main(void) {
    /* Rect r = { .w = 3, .h = 4 };       */
    /* printf("%d\\n", area(&r));    -> 12 */
    /* scale(&r, 2);                      */
    /* printf("%d\\n", area(&r));    -> 48 */
    return 0;
}`,
      hint: 'area: return r->w * r->h; scale: r->w *= k; r->h *= k; — note how both take pointers: one for cheapness (const), one because it must mutate.'
    },
  },
});

/* ---------------- unions & bit-fields ---------------- */
CT.lesson({
  id: 'unions-bitfields',
  title: 'Unions & bit-fields: one space, many shapes',
  minutes: 12, xp: 120,
  tags: 'union overlap type punning tagged union bitfield endianness',
  why: `<p>One slot, several possible shapes: a spreadsheet cell holds a number <em>or</em> text — never both at once — and a game inventory slot holds a sword <em>or</em> a potion. Unions are C's way of storing "one of several things" without paying for the space of all of them at once. There's a party trick thrown in: using one to expose the raw bits hiding inside a <code>float</code> — the very bits you toggled back in Part 0.</p>`,
  html: `
<p>A struct gives each member its own bytes, side by side. A <strong>union</strong> does the opposite: every member starts at the <em>same address</em>, overlapping in the same bytes. Its size is (roughly) the size of the <em>largest</em> member. Why would you want that? Storage where a value is only ever <em>one</em> of several things at a time.</p>

<h2>Members that overlap</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="mg1"></div>

<div data-w="q1"></div>

<p>Writing <code>w.u</code> then reading <code>w.b</code> — reading a different member than you last wrote — is called <strong>type punning</strong>. In C it's allowed: you get the stored bytes reinterpreted as the other type (C99 onwards spells this out; beware, the same trick is undefined behavior in C++!). It's how programmers peek at the raw bytes of floats, ints, and more.</p>

<h2>Tagged unions: the honest pattern</h2>
<p>A raw union doesn't remember which member is currently valid — <em>you</em> must. The universal solution pairs the union with an enum <strong>tag</strong> recording what's inside. This is C's answer to "a value that can be one of several types":</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<h2>Party trick: discovering endianness</h2>
<p>Which byte of a multi-byte integer comes first in memory? Little-endian machines (x86, most ARM) store the <em>least</em> significant byte at the lowest address; big-endian stores the most significant first. A union lets your program check at runtime — the classic C interview trick:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<h2>Bit-fields: members measured in bits</h2>
<p>Inside a struct, you can give a member a width in <em>bits</em>. The compiler packs adjacent bit-fields into shared storage — ideal for flag sets and matching hardware register layouts:</p>
<div data-w="code4"></div>
<div data-w="term4"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Bit-field layout is implementation-defined:</b> packing order, straddling of storage units, and more vary by compiler and ABI. Fine within one program; <em>not</em> a portable serialization format. Also: you can't take the address of a bit-field — <code>&amp;f.mode</code> is illegal, since it isn't byte-aligned.</p></div></div>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>You've now pointed at data of every shape. One target remains, the coolest of all: pointing at <em>code</em>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'word.c',
      code: `#include <stdio.h>

union Word {
    unsigned int  u;      /* 4 bytes            */
    unsigned char b[4];   /* the SAME 4 bytes   */
};

int main(void) {
    union Word w;
    w.u = 0x11223344;

    printf("sizeof(union Word) = %zu\\n", sizeof w);
    for (int i = 0; i < 4; i++)
        printf("b[%d] = 0x%02x\\n", i, w.b[i]);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc word.c -o word && ./word
sizeof(union Word) = 4
b[0] = 0x44
b[1] = 0x33
b[2] = 0x22
b[3] = 0x11
# one write to u changed all four b[i] — same bytes!
# (and the 0x44 came FIRST… hold that thought)` },
    mg1: {
      type: 'memgrid', label: 'union Word — u and b[] are two names for the same 4 bytes',
      cells: [
        { addr: '0x100', val: '0x44', name: 'u ∕ b[0]', hl: true },
        { addr: '0x101', val: '0x33', name: 'u ∕ b[1]', hl: true },
        { addr: '0x102', val: '0x22', name: 'u ∕ b[2]', hl: true },
        { addr: '0x103', val: '0x11', name: 'u ∕ b[3]', hl: true },
      ],
      note: 'No member has private storage: writing <code>w.u = 0x11223344</code> filled these cells; <code>w.b[i]</code> reads them back one at a time. Contrast with a struct, where u and b would sit in 8 separate bytes.'
    },
    q1: { type: 'quiz', q: 'What is <code>sizeof</code> a union whose members are an <code>int</code> (4) and a <code>double</code> (8)?', opts: ['12', '8 — the largest member (plus any alignment padding)', '4 — the first member', 'Implementation-defined, could be 1'], a: 1, expl: 'All members share one storage area, so it only needs to fit the biggest: 8 bytes. A struct with the same members would need at least 12 (usually 16, with alignment).' },
    code2: {
      type: 'code', title: 'tagged.c',
      code: `#include <stdio.h>

enum Kind { KIND_INT, KIND_FLOAT };

struct Value {
    enum Kind kind;          /* the TAG: what's inside?   */
    union {
        int    i;
        double f;
    } as;                    /* the payload               */
};

void print_value(struct Value v) {
    switch (v.kind) {
    case KIND_INT:   printf("int   %d\\n", v.as.i); break;
    case KIND_FLOAT: printf("float %g\\n", v.as.f); break;
    }
}

int main(void) {
    print_value((struct Value){ KIND_INT,   { .i = 42 } });
    print_value((struct Value){ KIND_FLOAT, { .f = 3.14 } });
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc tagged.c -o tagged && ./tagged
int   42
float 3.14` },
    q2: { type: 'quiz', q: 'In a tagged union, what is the tag for?', opts: ['It speeds up member access', 'It records which union member is currently the valid one', 'The linker requires it', 'It fixes the union’s alignment'], a: 1, expl: 'The union itself has no memory of what was last stored. The tag is your own bookkeeping — set it on every write, switch on it on every read. Interpreters, JSON parsers, and compilers are built on this pattern.' },
    code3: {
      type: 'code', title: 'endian.c',
      code: `#include <stdio.h>

int main(void) {
    union {
        unsigned int  u;
        unsigned char c[4];
    } probe = { .u = 1 };    /* bytes: 01 00 00 00 or 00 00 00 01? */

    if (probe.c[0] == 1)
        printf("little-endian (x86, most ARM)\\n");
    else
        printf("big-endian (network byte order)\\n");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc endian.c -o endian && ./endian
little-endian (x86, most ARM)
# the low byte of 1 sits at the LOWEST address on this machine` },
    code4: {
      type: 'code', title: 'flags.c',
      code: `#include <stdio.h>

struct Flags {
    unsigned int visible : 1;   /* one bit             */
    unsigned int locked  : 1;
    unsigned int mode    : 3;   /* 3 bits: 0..7        */
};

int main(void) {
    struct Flags f = { .visible = 1, .mode = 5 };
    f.locked = 1;

    printf("sizeof = %zu\\n", sizeof f);   /* 5 bits, but…  */
    printf("mode   = %u\\n", f.mode);
    f.mode = 9;                 /* only 3 bits: 9 mod 8 = 1  */
    printf("mode   = %u\\n", f.mode);
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc flags.c -o flags && ./flags
sizeof = 4
mode   = 5
mode   = 1
# 5 bits of data, one 4-byte storage unit; overflow wrapped mod 8` },
    q3: { type: 'quiz', q: 'On a little-endian machine, after <code>w.u = 0x11223344;</code>, what is <code>w.b[0]</code>?', opts: ['0x11', '0x22', '0x33', '0x44'], a: 3, expl: 'Little-endian puts the LEAST significant byte first: 44 33 22 11 in ascending addresses. On big-endian iron the same code prints 0x11 — which is exactly why the union probe works as a detector.' },
    ex1: {
      type: 'editor', label: 'Exercise: pun a float', height: 320,
      code: `#include <stdio.h>

int main(void) {
    union {
        float         f;
        unsigned int  u;    /* same 4 bytes as f */
    } pun;

    pun.f = 1.0f;

    /* 1. Print the raw bits of 1.0f:  printf("0x%08x\\n", pun.u);  */
    /*    You should see 0x3f800000 — sign 0, exponent 127,        */
    /*    mantissa 0 (remember IEEE 754 from Part 0?)              */
    /* 2. Try -1.0f, 2.0f, 0.5f — watch sign & exponent move.      */

    return 0;
}`,
      hint: 'Just the printf is needed for step 1. For extra credit set pun.u = 0x3f800001 and print pun.f with %.9f — the float right after 1.0.'
    },
  },
});

/* ---------------- function pointers ---------------- */
CT.lesson({
  id: 'function-pointers',
  title: 'Function pointers: code is data too',
  minutes: 13, xp: 130,
  tags: 'function pointer callback qsort comparator dispatch table typedef',
  why: `<p>When you click a button and the right code runs, or a game lets you rebind keys to actions, something stored <em>which function to call</em> in a variable. That's a function pointer — the one kind of pointer you haven't met yet, aimed at code instead of data. It's also the trick that lets C's standard sort routine sort values of any type <em>you</em> invent, and you'll teach it to do exactly that before this lesson ends.</p>`,
  html: `
<p>Here's a thought: functions live in memory too (the <code>.text</code> segment of the memory map — the part that holds your compiled code, remember?). So they have addresses. So… a pointer can hold one. A <strong>function pointer</strong> lets you store "which function to call" in a variable, pass it around, and decide at <em>runtime</em> what code runs. This one idea powers plugins, "run this when the user clicks" machinery, and the standard library's ability to sort anything.</p>

<h2>The syntax, decoded</h2>
<p><code>int (*op)(int, int);</code> — read from the name outward: <code>op</code> is a pointer (<code>*op</code>), to a function taking <code>(int, int)</code>, returning <code>int</code>. The parentheses around <code>*op</code> are mandatory: without them, <code>int *op(int, int)</code> declares a <em>function returning int*</em> — a completely different creature.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Two conveniences to notice: a bare function name decays to its address (no <code>&amp;</code> needed, though <code>&amp;add</code> also works), and you call through the pointer with plain <code>op(3, 4)</code> (though <code>(*op)(3, 4)</code> also works). C offers both spellings; modern style uses the short ones.</p>

<div data-w="q1"></div>

<h2>Callbacks: teaching qsort to compare</h2>
<p>The standard library's <code>qsort</code> can sort an array of <em>anything</em> — because you hand it a function pointer that knows how to compare two elements. It sorts; you judge. That's a <strong>callback</strong>:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>The comparator receives <code>const void *</code> pointers — generic addresses, because qsort has no idea what type it's sorting. Your first job inside is always to cast back to the real type.</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Resist <code>return a - b;</code></b> in int comparators. If <code>a</code> is huge and <code>b</code> is hugely negative, the subtraction overflows — undefined behavior, and real-world sorting bugs. The idiom <code>(a &gt; b) - (a &lt; b)</code> yields a clean −1 / 0 / 1 with no overflow, ever.</p></div></div>

<div data-w="q2"></div>

<h2>Dispatch tables: an array of behaviors</h2>
<p>Since function pointers are values, you can put them in arrays — and suddenly a chain of <code>if/else</code> becomes a table lookup. This is the skeleton of interpreters, menu systems, and state machines:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div data-w="q3"></div>

<h2>Taming the syntax with typedef</h2>
<p>Function pointer types get ugly fast — so give them a name. One <code>typedef</code> and declarations become readable English:</p>
<div data-w="code4"></div>

<div data-w="rv1"></div>

<div data-w="ex1"></div>

<p>🎉 That's Pointers &amp; Memory conquered — you can now point at anything C has to offer. Next part, we slow down and master the type system itself: <code>const</code>, <code>volatile</code>, casts, and the dark art of undefined behavior.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'fnptr.c',
      code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int main(void) {
    int (*op)(int, int);      /* op: ptr to int(int,int)  */

    op = add;                 /* function name -> address */
    printf("op(3, 4) = %d\\n", op(3, 4));

    op = mul;                 /* retarget at runtime      */
    printf("op(3, 4) = %d\\n", op(3, 4));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc fnptr.c -o fnptr && ./fnptr
op(3, 4) = 7
op(3, 4) = 12
# same call site, different code executed — decided at runtime` },
    q1: { type: 'quiz', q: 'What does <code>int (*f)(int);</code> declare?', opts: ['A function returning <code>int *</code>', 'A pointer to a function taking an int and returning an int', 'An int pointer named f(int)', 'Nothing — it’s a syntax error'], a: 1, expl: 'The parens force *f to bind first: f is a pointer, to a function (int), returning int. Drop them — int *f(int); — and you’ve declared a function returning int* instead.' },
    code2: {
      type: 'code', title: 'sortme.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int by_value(const void *pa, const void *pb) {
    int a = *(const int *)pa;      /* cast back to real type */
    int b = *(const int *)pb;
    return (a > b) - (a < b);      /* -1 / 0 / 1, no overflow */
}

int main(void) {
    int a[] = { 42, 7, 19, 3, 25 };
    size_t n = sizeof a / sizeof a[0];

    qsort(a, n, sizeof a[0], by_value);  /* <- the callback */

    for (size_t i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc sortme.c -o sortme && ./sortme
3 7 19 25 42` },
    q2: { type: 'quiz', q: 'Why does a qsort comparator take <code>const void *</code> parameters?', opts: ['void* comparisons are faster', 'qsort works with ANY element type, so it hands you generic addresses', 'It’s required for all function pointers', 'To prevent the comparator from being inlined'], a: 1, expl: 'qsort only knows "n elements of size bytes each". It passes raw addresses; your comparator supplies the type knowledge by casting. That’s generic programming, C style.' },
    code3: {
      type: 'code', title: 'dispatch.c',
      code: `#include <stdio.h>

int add(int a, int b) { return a + b; }
int sub(int a, int b) { return a - b; }
int mul(int a, int b) { return a * b; }

int main(void) {
    int (*ops[3])(int, int) = { add, sub, mul };
    const char *names[3]    = { "add", "sub", "mul" };

    for (int i = 0; i < 3; i++)          /* pick behavior by  */
        printf("%s(10, 4) = %d\\n",       /* INDEX, no if/else */
               names[i], ops[i](10, 4));
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc dispatch.c -o dispatch && ./dispatch
add(10, 4) = 14
sub(10, 4) = 6
mul(10, 4) = 6
# opcode -> handler: this is how bytecode interpreters dispatch` },
    q3: { type: 'quiz', q: 'What is wrong with <code>return a - b;</code> in an int comparator?', opts: ['The sign convention is backwards', 'Nothing — it’s the recommended idiom', 'The subtraction can overflow (e.g. INT_MAX − INT_MIN) — undefined behavior', 'Comparators must return exactly −1, 0, or 1'], a: 2, expl: 'qsort only needs the SIGN, and any negative/zero/positive value is fine — but a − b can overflow for extreme inputs, which is UB. (a &gt; b) − (a &lt; b) is safe for every pair of ints.' },
    code4: {
      type: 'code', title: 'typedef.c (fragment)', run: false,
      code: `typedef int (*binop)(int, int);  /* name the TYPE once     */

binop op = add;                  /* suddenly readable       */
binop table[8];                  /* an array of callbacks   */

int apply(binop f, int a, int b) {
    return f(a, b);              /* higher-order C          */
}`
    },
    rv1: {
      type: 'reveal', label: 'Boss fight', q: 'Decipher this declaration: <code>int (*calc[4])(double, double);</code>',
      answer: '<p>Read from the name, spiraling outward: <code>calc</code> … is an <b>array of 4</b> (<code>[4]</code> binds before <code>*</code>) … <b>pointers</b> … to <b>functions taking (double, double)</b> … <b>returning int</b>. A ready-made dispatch table! With a typedef it deflates to: <code>typedef int (*cmp2)(double, double); cmp2 calc[4];</code> — which is why real codebases always typedef their function pointer types.</p>'
    },
    ex1: {
      type: 'editor', label: 'Exercise: sort descending', height: 340,
      code: `#include <stdio.h>
#include <stdlib.h>

/* Write a comparator  int desc(const void *pa, const void *pb) */
/* that makes qsort produce DESCENDING order.                   */
/* Remember: negative return = "first argument sorts earlier".  */

int main(void) {
    int a[] = { 42, 7, 19, 3, 25 };
    size_t n = sizeof a / sizeof a[0];

    /* qsort(a, n, sizeof a[0], desc); */

    for (size_t i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\\n");              /* want: 42 25 19 7 3 */
    return 0;
}`,
      hint: 'Same casts as by_value, but flip the comparison: return (a < b) - (a > b); — swapping the operands works too. One character difference, reversed world.'
    },
  },
});
