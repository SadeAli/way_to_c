/* ============================================================
   Part 3 — Types & Qualifiers, In Depth
   ============================================================ */

/* ---------------- const ---------------- */
CT.lesson({
  id: 'const',
  title: 'const: promises the compiler enforces',
  minutes: 13, xp: 120,
  tags: 'const qualifier read only pointer to const cast away define enum',
  why: `<p>You change a variable you never meant to touch, and three functions later the program prints garbage — now the evening disappears into hunting for the line that did it. <code>const</code> turns that whole category of bug into an instant compile error: one word, and the compiler refuses to let anything overwrite the value. It's also how a function can promise "I will only <em>read</em> your data" — a promise the compiler actually enforces.</p>`,
  html: `
<p>C is famous for letting you do anything to memory. <code>const</code> is the opposite superpower: it lets you <strong>promise not to</strong> — and the compiler holds you to it. Slap <code>const</code> on a declaration and any attempt to assign through that name becomes a compile error. Bugs that would have been 2 a.m. debugging sessions become red squiggles.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Be precise about what's promised: <code>const</code> means "<em>not modified through this name</em>". It doesn't necessarily put the object in read-only memory (though string literals and global <code>const</code> objects often do land in memory the operating system marks read-only). It's a contract checked at compile time, not a force field at runtime.</p>

<h2>const + pointers: the four combinations</h2>
<p>This is where 90% of the confusion lives, so let's kill it with one trick: <strong>read the declaration right-to-left</strong>.</p>
<table>
<tr><th>declaration</th><th>read right-to-left</th><th>can change <code>*p</code>?</th><th>can change <code>p</code>?</th></tr>
<tr><td><code>int *p</code></td><td>p is a pointer to int</td><td>yes</td><td>yes</td></tr>
<tr><td><code>const int *p</code></td><td>p is a pointer to an int that is const</td><td><b>no</b></td><td>yes</td></tr>
<tr><td><code>int *const p</code></td><td>p is a const pointer to int</td><td>yes</td><td><b>no</b></td></tr>
<tr><td><code>const int *const p</code></td><td>p is a const pointer to a const int</td><td><b>no</b></td><td><b>no</b></td></tr>
</table>
<p>The rule behind the trick: <code>const</code> qualifies <em>whatever is immediately to its left</em> (or, if it's the very first word, the thing to its right). So <code>int const *p</code> and <code>const int *p</code> mean exactly the same thing: the <em>pointee</em> is const. Only <code>*const</code> makes the <em>pointer itself</em> const.</p>

<div data-w="mg"></div>
<div data-w="q1"></div>

<h2>const in APIs: documentation that can't lie</h2>
<p>The most valuable place for <code>const</code> is function parameters. <code>size_t strlen(const char *s)</code> tells you — with compiler enforcement — that <code>strlen</code> will only <em>look at</em> your string. A pointer-to-non-const parameter, like in <code>strcpy</code>'s destination, tells you the function intends to write.</p>
<div data-w="code2"></div>
<p>Passing a <code>char *</code> where <code>const char *</code> is expected is fine (adding a promise is always safe). The reverse direction needs an explicit cast, because it <em>drops</em> a promise.</p>

<div data-w="q2"></div>

<h2>Casting const away — and when it explodes</h2>
<p>C lets you strip <code>const</code> with a cast. Whether that's legal depends on the <em>original object</em>, not the pointer:</p>
<div data-w="code3"></div>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The rule:</b> writing to an object that was <em>defined</em> <code>const</code> is <strong>undefined behavior</strong> — it may live in a read-only page and crash, or the compiler may have folded its value into the code already. Casting away const is only OK when the underlying object was never const to begin with (you just received it through a const pointer).</p></div></div>

<div data-w="q3"></div>

<h2>#define vs const vs enum for constants</h2>
<table>
<tr><th></th><th><code>#define MAX 100</code></th><th><code>const int max = 100;</code></th><th><code>enum { MAX = 100 };</code></th></tr>
<tr><td>typed?</td><td>no — raw text paste</td><td>yes, real <code>int</code></td><td>yes (<code>int</code>)</td></tr>
<tr><td>visible in debugger?</td><td>no</td><td>yes</td><td>yes</td></tr>
<tr><td>usable as array size / case label?</td><td>yes</td><td>not for case labels; array use makes a VLA in C17*</td><td>yes — it's a constant expression</td></tr>
<tr><td>scoped?</td><td>no — lives until <code>#undef</code></td><td>yes, normal scope rules</td><td>yes</td></tr>
</table>
<p>*A quirk worth knowing: in C, a <code>const int</code> is <em>not</em> a "constant expression" (unlike C++). That's why <code>enum</code> is the classic idiom for integer constants that must appear in <code>case</code> labels or array sizes — though C23's <code>constexpr</code> finally fixes this properly.</p>

<div data-w="ed"></div>

<p>Next: <code>const</code>'s stranger sibling — a qualifier that tells the compiler <em>less</em> optimization, please: <code>volatile</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'promise.c — one line refuses to compile', run: false, hl: [8],
      code: `#include <stdio.h>

int main(void) {
    const double pi = 3.14159265358979;
    double r = 2.0;

    printf("area = %f\\n", pi * r * r);   /* reading is fine   */
    pi = 3.2;                             /* writing is NOT    */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc promise.c
promise.c: In function 'main':
promise.c:8:8: error: assignment of read-only variable 'pi'` },
    mg: {
      type: 'memgrid', label: 'const int *p — which arrow is frozen?',
      cells: [
        { addr: '0x100', val: '42', name: 'x (int)', hl: true },
        { addr: '0x108', val: '0x100', name: 'p', hl2: true },
      ],
      note: 'With <code>const int *p</code>, the blue cell is untouchable <em>through p</em> but p itself can be repointed. With <code>int *const p</code>, it\'s the orange cell that\'s locked: p must aim at 0x100 forever, but <code>*p = 7;</code> is allowed.',
    },
    q1: { type: 'quiz', q: 'Which declaration lets you do <code>p++</code> but forbids <code>*p = 0</code>?', opts: ['<code>int *const p</code>', '<code>const int *p</code>', '<code>const int *const p</code>', '<code>int *p</code>'], a: 1, expl: 'Read right-to-left: "p is a pointer to an int that is const". The pointee is protected, the pointer itself is an ordinary variable — so p++ is fine.' },
    code2: {
      type: 'code', title: 'api.c',
      code: `#include <stdio.h>

/* "I will only READ your data" — enforced by the compiler */
double average(const double *vals, int n) {
    double sum = 0;
    for (int i = 0; i < n; i++)
        sum += vals[i];       /* vals[i] = 0; would not compile */
    return sum / n;
}

int main(void) {
    double temps[] = { 21.5, 23.0, 19.8, 22.4 };
    printf("avg = %.2f\\n", average(temps, 4));
    return 0;
}`
    },
    q2: { type: 'quiz', q: 'You pass a plain <code>char *name</code> to a function taking <code>const char *</code>. What happens?', opts: ['Compile error — types differ', 'It compiles: adding const is always a safe, implicit conversion', 'It compiles but the string becomes permanently read-only', 'Undefined behavior'], a: 1, expl: 'Gaining a promise is free: T* converts implicitly to const T*. Only the other direction (losing const) needs an explicit cast. And no, the object itself is unchanged afterwards.' },
    code3: {
      type: 'code', title: 'castaway.c — one cast is fine, one is a landmine', run: false, hl: [9, 12],
      code: `void sneaky(const int *p) {
    int *w = (int *)p;    /* cast away const...           */
    *w = 99;              /* ...legal ONLY if the original
                             object was not const         */
}

int main(void) {
    int a = 1;
    sneaky(&a);           /* OK: a was never const        */

    const int b = 2;
    sneaky(&b);           /* UNDEFINED BEHAVIOR: b is const */
    return 0;
}`
    },
    q3: { type: 'quiz', q: 'When is writing through a cast-away-const pointer undefined behavior?', opts: ['Always — the cast itself is UB', 'Never — the cast makes it legal', 'When the pointed-to object was originally defined const', 'Only if the object is a string literal'], a: 2, expl: 'The cast is always legal; the WRITE is UB exactly when the underlying object was defined const (string literals count too — modifying them is UB for the same spirit of reason). If the object was mutable and merely viewed through a const pointer, writing is fine.' },
    ed: {
      type: 'editor', label: 'Exercise: const-correct API',
      height: 300,
      code: `#include <stdio.h>

/* TODO 1: add const so the compiler PROVES max_of only reads  */
int max_of(int *vals, int n) {
    int best = vals[0];
    for (int i = 1; i < n; i++)
        if (vals[i] > best) best = vals[i];
    return best;
}

int main(void) {
    int scores[] = { 71, 94, 88, 67 };
    printf("max = %d\\n", max_of(scores, 4));

    /* TODO 2: declare a const pointer (int *const) to scores[0],
       then try to repoint it and see the compiler complain. */
    return 0;
}`,
      hint: 'Change the parameter to const int *vals. Then add int *const p = &scores[0]; and try p++ — read the error, then delete the bad line.',
    },
  },
});

/* ---------------- volatile ---------------- */
CT.lesson({
  id: 'volatile',
  title: 'volatile: "this memory has a mind of its own"',
  minutes: 13, xp: 120,
  tags: 'volatile qualifier optimizer mmio register signal sig_atomic_t setjmp',
  why: `<p>Picture a program that should stop when you press Ctrl+C — but it spins forever, because the compiler "helpfully" optimized away the check you wrote. <code>volatile</code> is the one-word fix. It's also the keyword that lets C code on a tiny board like an Arduino talk to real buttons and LEDs — which is why you'll find it all over embedded code.</p>`,
  html: `
<p>Optimizing compilers are aggressive. If your code reads the same variable twice without writing it, the compiler thinks: "same value — I'll read it once and keep it in a register" (a tiny, super-fast storage slot inside the CPU). Usually that's brilliant. But some memory <strong>changes behind the compiler's back</strong>: addresses wired directly to hardware devices, or variables written by a signal handler — the function that jumps in when you press Ctrl+C. For those, the "optimization" is a bug — and <code>volatile</code> is the fix.</p>

<p><strong>What <code>volatile</code> actually means:</strong> every read and write of this object in your source code must really happen in the machine code — the instructions the CPU actually runs — in source order. No caching in registers, no deleting "redundant" accesses, no reordering accesses to volatile objects relative to each other.</p>

<h2>Watch the optimizer break your loop</h2>
<div data-w="code1"></div>
<p>Looks fine, right? Now put on the compiler's glasses: inside the loop, nothing writes <code>flag</code>. Nothing in this translation unit <em>can</em> change it mid-loop (as far as the compiler can prove). So at <code>-O2</code> it hoists the read out of the loop:</p>
<div data-w="asm1"></div>
<div data-w="rv1"></div>
<p>Declare it <code>volatile int flag;</code> and the compiler must re-read memory on every iteration — the loop works again.</p>

<div data-w="q1"></div>

<h2>Legit use #1: memory-mapped hardware</h2>
<p>On microcontrollers (and inside every OS kernel), devices are controlled by reading and writing special addresses. That memory isn't RAM — a "read" might pop a byte out of a UART's receive queue, and two reads of the <em>same address</em> can return different values.</p>
<div data-w="mg"></div>
<div data-w="code2"></div>
<p>Without <code>volatile</code>, the compiler would happily read <code>STATUS</code> once and spin forever, or "optimize" two writes to <code>DATA</code> into one — deleting a character you meant to transmit.</p>

<div data-w="q2"></div>

<h2>Legit use #2: signal handlers (and setjmp)</h2>
<p>A signal handler can run <em>between any two instructions</em> of your program — it's exactly the "changes behind your back" scenario. The standard blesses precisely one pattern for sharing a flag with a handler:</p>
<div data-w="code3"></div>
<p>The type <code>volatile sig_atomic_t</code> is the portable contract: <code>volatile</code> so the main loop really re-reads it, <code>sig_atomic_t</code> so reads and writes can't be torn halfway by a signal. Similarly, local variables modified between <code>setjmp</code> and <code>longjmp</code> must be <code>volatile</code>, or their values after the jump are indeterminate — try it in the exercise below.</p>

<h2>What volatile is NOT</h2>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>volatile is not a threading tool.</b> It gives you <em>no atomicity</em> (a 64-bit volatile write can still be torn into two 32-bit stores), <em>no memory barriers</em> (the CPU can still reorder what other cores observe), and <em>no happens-before</em> relationship. Two threads touching a <code>volatile int</code> without synchronization is a <strong>data race — undefined behavior</strong>. For threads, use <code>_Atomic</code>, mutexes, or condition variables (Part 5). Volatile is for hardware and signals, full stop.</p></div></div>

<div data-w="q3"></div>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p>Why the weird name? Think of a "volatile" chemical that evaporates when you're not watching. The variable's value is similarly unstable — the compiler must never assume it "stays put".</p></div></div>

<div data-w="ed"></div>

<p>From a qualifier that changes how code is <em>generated</em>, we move to a keyword that generates no code at all — it just gives types better names: <code>typedef</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'spin.c — correct-looking, broken at -O2', run: false, hl: [3, 6],
      code: `#include <stdio.h>

int flag = 0;               /* set from "outside": signal/ISR */

void wait_for_flag(void) {
    while (flag == 0) {
        /* spin, waiting for the outside world */
    }
    puts("flag is up!");
}`
    },
    asm1: {
      type: 'code', title: 'what gcc -O2 emits (x86-64)', run: false,
      code: `wait_for_flag:
        mov     eax, DWORD PTR flag[rip]   ; read flag ONCE
        test    eax, eax
        jne     .Ldone
.Lspin: jmp     .Lspin                     ; while(1) — forever!
.Ldone:
        ; ... puts("flag is up!")`
    },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'Was the compiler wrong to do this?',
      answer: '<p><b>No — you were.</b> By the rules of the abstract machine, an ordinary <code>int</code> can only change via code the compiler can see. You never told it this one is special. The optimization is 100% legal; the program was incorrect the moment it relied on invisible modification without <code>volatile</code>.</p>',
    },
    q1: { type: 'quiz', q: 'What does <code>volatile</code> guarantee?', opts: ['The variable is stored in the CPU cache', 'Every source-level access becomes a real memory access, in order', 'Other threads always see updates instantly', 'The variable cannot be modified'], a: 1, expl: 'That is the whole contract: no eliding, no caching in registers, no reordering among volatile accesses. It says nothing about threads, atomicity, or caches — those need _Atomic and friends.' },
    mg: {
      type: 'memgrid', label: 'Memory-mapped UART — this is not RAM',
      cells: [
        { addr: '0x40021000', val: '0x01', name: 'UART_STATUS', hl: true },
        { addr: '0x40021004', val: "'A'", name: 'UART_DATA', hl2: true },
      ],
      note: 'Reading <code>UART_DATA</code> pops the next received byte out of the hardware — two reads of the <em>same address</em> yield different characters. <code>UART_STATUS</code> flips its bits on its own when data arrives. The compiler must not "optimize" these accesses.',
    },
    code2: {
      type: 'code', title: 'uart.c — classic embedded pattern', run: false,
      code: `#include <stdint.h>

#define UART_STATUS (*(volatile uint32_t *)0x40021000)
#define UART_DATA   (*(volatile uint32_t *)0x40021004)
#define RX_READY    0x01u

char uart_getc(void) {
    while ((UART_STATUS & RX_READY) == 0) {
        /* volatile: STATUS is genuinely re-read each pass */
    }
    return (char)UART_DATA;   /* volatile read pops the byte */
}`
    },
    q2: { type: 'quiz', q: 'Why must hardware register accesses be <code>volatile</code>?', opts: ['Hardware memory is slower than RAM', 'It makes the access atomic', 'The register can change (or act!) independently of the program, so no access may be cached, merged, or deleted', 'C forbids casting integers to pointers otherwise'], a: 2, expl: 'Reads can return new values each time and writes can have side effects (transmit a byte, clear an interrupt). Deleting or merging them changes behavior — volatile forbids the compiler from doing so.' },
    code3: {
      type: 'code', title: 'sigint.c',
      code: `#include <signal.h>
#include <stdio.h>

volatile sig_atomic_t got_sigint = 0;

void handler(int sig) {
    (void)sig;
    got_sigint = 1;           /* only safe kind of shared write */
}

int main(void) {
    signal(SIGINT, handler);
    puts("Working... press Ctrl+C to stop.");
    while (!got_sigint) {
        /* do work */
    }
    puts("Caught SIGINT — shutting down cleanly.");
    return 0;
}`
    },
    q3: { type: 'quiz', q: 'Two threads communicate through a <code>volatile int done;</code> flag with no other synchronization. This is…', opts: ['Fine — that is what volatile is for', 'A data race, i.e. undefined behavior — use <code>_Atomic</code> or a mutex', 'Fine on x86, UB elsewhere', 'A compile error since C11'], a: 1, expl: 'volatile constrains the COMPILER, not the CPU or the memory model. Concurrent unsynchronized access to a non-atomic object is a data race and UB per C11. (It may "work" on x86 today — that is the worst kind of bug.)' },
    ed: {
      type: 'editor', label: 'Exercise: the setjmp trap',
      height: 320,
      code: `#include <setjmp.h>
#include <stdio.h>

int main(void) {
    jmp_buf env;
    int x = 1;    /* TODO: make this 'volatile int x' and re-run */

    if (setjmp(env) == 0) {
        x = 42;              /* modified after setjmp...        */
        longjmp(env, 1);     /* ...then we jump back in time    */
    } else {
        /* without volatile, x is INDETERMINATE here (C17 7.13.2.1) */
        printf("x = %d\\n", x);
    }
    return 0;
}`,
      hint: 'Run as-is (you will likely see 42 — but it is not guaranteed, especially with -O2). Then add volatile: now the standard guarantees 42. This is the third official job of volatile.',
    },
  },
});

/* ---------------- typedef ---------------- */
CT.lesson({
  id: 'typedef',
  title: 'typedef: giving types better names',
  minutes: 12, xp: 110,
  tags: 'typedef alias struct function pointer opaque size_t naming',
  why: `<p>Some of C's most familiar type names — <code>size_t</code>, or the <code>FILE</code> behind every file you'll ever open — aren't built into the language at all: they're nicknames minted with <code>typedef</code>, and this lesson shows you the trick. You'll also use it to turn a declaration full of stars and parentheses into a name a human can read at a glance.</p>`,
  html: `
<p><code>typedef</code> creates an <strong>alias</strong> for an existing type — a nickname, not a new type. <code>typedef int Celsius;</code> makes <code>Celsius</code> and <code>int</code> fully interchangeable (the compiler won't stop you mixing them — it's documentation, not a wall between types). Where typedef shines is taming C's gnarlier type syntax.</p>

<h2>The one insight that makes typedef easy</h2>
<p>A typedef is written <em>exactly like a variable declaration</em>, with <code>typedef</code> stapled on front. Wherever the <strong>variable name</strong> would be, that becomes the <strong>type name</strong>:</p>
<div data-w="code1"></div>
<p>This mirror rule works for arbitrarily hairy types. Can you declare it as a variable? Then you can typedef it.</p>

<div data-w="q1"></div>

<h2>Taming structs and function pointers</h2>
<p>The two heavyweight champions of "please give this a name":</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Note the self-referencing struct: the <code>struct Node</code> <em>tag</em> is still needed inside, because the typedef name isn't usable until the declaration ends. The idiom <code>typedef struct Node Node;</code> <em>before</em> the struct body sidesteps this entirely.</p>

<div data-w="q2"></div>

<h2>Opaque types: typedef as API armor</h2>
<p>Here's a professional trick. Declare a typedef of an <em>incomplete</em> struct in the header, and define the struct only in the <code>.c</code> file. Users can hold pointers to a <code>Timer</code>, but can't see or touch its fields — the layout can change without breaking anyone:</p>
<div data-w="code3"></div>
<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>This is exactly how <code>FILE</code> works in <code>&lt;stdio.h&gt;</code>: you juggle <code>FILE *</code> pointers everywhere but have (portably) no idea what's inside a <code>FILE</code>. That's an opaque type in the wild — and why the pattern is also called the "FILE idiom".</p></div></div>

<h2>When NOT to typedef: hiding pointers</h2>
<div data-w="rv1"></div>
<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Rule of thumb:</b> don't typedef away a <code>*</code> unless the type is truly opaque (a handle). <code>typedef char *string;</code> looks cute, but readers can no longer see that assignment copies a <em>pointer</em> (not the text!), and const stops meaning what they think. The Linux kernel style guide bans pointer typedefs for exactly this reason.</p></div></div>

<div data-w="q3"></div>

<h2>You use typedefs constantly already</h2>
<p><code>size_t</code>, <code>ptrdiff_t</code>, <code>uint32_t</code>, <code>sig_atomic_t</code>, <code>FILE</code>, <code>time_t</code> — all typedefs. That's the portability trick of the standard library: <code>uint32_t</code> might alias <code>unsigned int</code> on your machine and <code>unsigned long</code> on another, but <em>your</em> code just says <code>uint32_t</code> and works everywhere.</p>

<div data-w="ed"></div>

<p>typedef names existing types — next up is the keyword that mints whole families of named integer constants: <code>enum</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'mirror.c — declaration, then typedef', run: false,
      code: `/* variable declarations...          ...become type aliases */
unsigned char      byte_v;    typedef unsigned char      byte;
int                pair_v[2]; typedef int                pair[2];
int              (*cmp_v)(const void *, const void *);
typedef int      (*cmp_fn)(const void *, const void *);

/* now these are easy to read: */
byte   b   = 0xFF;     /* one unsigned char        */
pair   xy  = { 3, 4 }; /* an array of two ints!    */
cmp_fn f;              /* pointer to qsort-style fn */`
    },
    q1: { type: 'quiz', q: 'After <code>typedef int Meters;</code>, what does <code>Meters m = 5; int x = m;</code> do?', opts: ['Compile error: incompatible types', 'Compiles: Meters IS int, just under another name', 'Runtime conversion from Meters to int', 'Undefined behavior'], a: 1, expl: 'typedef creates an alias, not a distinct type. Great for readability and portability, useless as a type-safety wall — the compiler sees int everywhere.' },
    code2: {
      type: 'code', title: 'tamed.c',
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node Node;     /* name first: usable below */
struct Node {
    int   value;
    Node *next;               /* thanks to the line above  */
};

typedef int (*cmp_fn)(const void *, const void *);

int by_int(const void *a, const void *b) {
    return *(const int *)a - *(const int *)b;
}

int main(void) {
    cmp_fn cmp = by_int;      /* vs: int (*cmp)(const void*, const void*) */
    int v[] = { 31, 4, 15 };
    qsort(v, 3, sizeof v[0], cmp);
    printf("%d %d %d\\n", v[0], v[1], v[2]);

    Node n2 = { 20, NULL }, n1 = { 10, &n2 };
    printf("%d -> %d\\n", n1.value, n1.next->value);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc tamed.c -o tamed && ./tamed
4 15 31
10 -> 20` },
    q2: { type: 'quiz', q: 'Inside <code>struct Node { ... };</code>, why can\'t the member be declared with a typedef name defined <em>after</em> the struct?', opts: ['Members can never be pointers to the own struct', 'A typedef name only exists once its declaration is complete — inside the body you must use the struct tag (or pre-declare the typedef)', 'typedef and struct cannot mix', 'It can — order never matters in C'], a: 1, expl: 'C is processed top-to-bottom. Either use the tag (struct Node *next;) or write typedef struct Node Node; BEFORE the body — then Node *next; works inside it.' },
    code3: {
      type: 'code', title: 'timer.h + timer.c — the opaque pattern', run: false,
      code: `/* ---- timer.h (what users see) ---- */
typedef struct Timer Timer;        /* incomplete: fields hidden */

Timer *timer_start(const char *name);
double timer_elapsed(const Timer *t);
void   timer_free(Timer *t);

/* ---- timer.c (private) ---- */
struct Timer {                      /* real definition lives here */
    const char *name;
    long        start_ns;
};
/* users CANNOT write t->start_ns — incomplete type! */`
    },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'Given <code>typedef char *string;</code> — what exactly does <code>const string s</code> declare?',
      answer: '<p>It declares <code>char *const s</code> — a <b>const pointer to modifiable chars</b>. Not <code>const char *s</code>! The qualifier applies to the typedef\'d type <em>as a sealed unit</em>; const cannot reach "inside" the alias to qualify the pointee. This trap alone is a good reason not to hide pointers behind typedefs.</p>',
    },
    q3: { type: 'quiz', q: 'When is typedef-ing a pointer type considered good style?', opts: ['Always — it saves keystrokes', 'For opaque handles where callers should never dereference it anyway', 'Whenever the pointer is const', 'Never, it is a syntax error'], a: 1, expl: 'If users are meant to treat the value as a black-box handle, hiding the * is honest. If they will dereference, index, or free it, hiding its pointer-ness just obscures the code and breaks const intuition.' },
    ed: {
      type: 'editor', label: 'Exercise: typedef a function pointer',
      height: 300,
      code: `#include <stdio.h>

/* TODO 1: typedef 'op_fn' as a pointer to a function
   taking (int, int) and returning int. */

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int apply(int a, int b /* TODO 2: , op_fn op */) {
    return 0; /* TODO 3: call op(a, b) */
}

int main(void) {
    /* TODO 4: printf apply(6, 7, add) and apply(6, 7, mul) */
    return 0;
}`,
      hint: 'typedef int (*op_fn)(int, int); — then apply(int a, int b, op_fn op) { return op(a, b); }. Expected output: 13 and 42.',
    },
  },
});

/* ---------------- enum ---------------- */
CT.lesson({
  id: 'enum',
  title: 'enum: constants with names and superpowers',
  minutes: 12, xp: 110,
  tags: 'enum enumeration constants flags bit switch c23 underlying type',
  why: `<p>The web's famous "404 Not Found" is a named number — exactly the kind <code>enum</code> creates. Instead of scattering a bare <code>2</code> through your code and hoping everyone remembers it means "green light", you write <code>GREEN</code> — and the compiler will even warn you when a <code>switch</code> forgets to handle one of the possibilities.</p>`,
  html: `
<p>Code full of magic numbers — <code>if (state == 2)</code> — is code nobody can read. <code>enum</code> mints a family of <strong>named integer constants</strong> in one line, and unlocks a compiler superpower along the way.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>The rules: constants count up from <code>0</code> by default; give any of them an explicit <code>= value</code> and counting resumes from there. Duplicated values are legal (handy for aliases like <code>COLOR_DEFAULT = COLOR_BLUE</code>).</p>

<div data-w="q1"></div>

<h2>Bit-flag enums: one int, many booleans</h2>
<p>Give each constant its own bit with shifts, and a single integer becomes a set you can combine with <code>|</code> and test with <code>&amp;</code>:</p>
<div data-w="code2"></div>
<div data-w="bitsw"></div>

<div data-w="q2"></div>

<h2>Enums are just ints (mostly)</h2>
<p>In classic C, enumeration constants have type <code>int</code>, and the enum variable itself is some implementation-chosen integer type big enough for the values. There's no range checking: <code>enum Day d = 99;</code> compiles fine. Treat enums as documentation plus warnings, not as a safety fence.</p>
<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>C23 upgrade:</b> you can now pin the underlying type — <code>enum Status : unsigned char { OK, FAIL };</code> — guaranteeing <code>sizeof(enum Status) == 1</code>. Great for packing structs and for talking to hardware or file formats. C23 also lets enumerators exceed <code>int</code> range, taking a larger type automatically.</p></div></div>

<h2>The superpower: switch coverage warnings</h2>
<p>Switch over an enum, list its cases, and <em>leave out the</em> <code>default</code> — now if anyone ever adds a new enumerator, the compiler points at every switch that forgot to handle it:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>This is why seasoned C programmers often <em>omit</em> <code>default:</code> in enum switches — a default silences <code>-Wswitch</code> forever. No default means the compiler audits your coverage for free, at every compile, for the lifetime of the codebase.</p></div></div>

<div data-w="q3"></div>

<h2>enum vs #define</h2>
<ul>
<li><b>Debugger:</b> an enum shows up as <code>AMBER</code>; a #define is gone after preprocessing — you see naked <code>1</code>.</li>
<li><b>Scope:</b> enums obey block scope; #defines bleed across the entire file from their definition point.</li>
<li><b>Grouping:</b> one enum declares a related set; #defines are loose confetti.</li>
<li><b>Constant expressions:</b> both work in <code>case</code> labels and array sizes — this is where enum beats <code>const int</code>, too.</li>
</ul>

<div data-w="ed"></div>

<p>We keep saying "an enum is int-sized" — time to meet the operator that lets you actually <em>measure</em> types: <code>sizeof</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'traffic.c',
      code: `#include <stdio.h>

enum Light { RED, AMBER, GREEN };          /* 0, 1, 2      */
enum Http  { OK = 200, MOVED = 301,
             NOT_FOUND = 404, TEAPOT = 418 };
enum Mix   { A = 5, B, C, D = 40, E };     /* 5,6,7,40,41  */

int main(void) {
    enum Light l = AMBER;
    printf("light=%d  teapot=%d  E=%d\\n", l, TEAPOT, E);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc traffic.c -o traffic && ./traffic
light=1  teapot=418  E=41` },
    q1: { type: 'quiz', q: 'In <code>enum { P = 3, Q, R = 2, S };</code> what are Q and S?', opts: ['Q=4, S=3', 'Q=4, S=4', 'Q=0, S=1', 'Compile error: duplicate values'], a: 0, expl: 'Counting resumes after each explicit value: Q = P+1 = 4, S = R+1 = 3. Note Q and... wait, S=3 equals P? Perfectly legal — duplicate enum values are allowed.' },
    code2: {
      type: 'code', title: 'perms.c — a set in a single int',
      code: `#include <stdio.h>

enum Perm {
    PERM_READ  = 1u << 0,   /* 0b001 */
    PERM_WRITE = 1u << 1,   /* 0b010 */
    PERM_EXEC  = 1u << 2,   /* 0b100 */
};

int main(void) {
    unsigned p = PERM_READ | PERM_EXEC;      /* combine: 0b101 */

    if (p & PERM_EXEC)  puts("can execute");
    if (!(p & PERM_WRITE)) puts("read-only!");

    p |=  PERM_WRITE;    /* grant a flag  */
    p &= ~PERM_EXEC;     /* revoke a flag */
    printf("now p = 0b%03b\\n", p);          /* %b is C23     */
    return 0;
}`
    },
    bitsw: { type: 'bits', n: 8, value: 5, label: 'A flag set, bit by bit', hint: 'Bit 0 = READ, bit 1 = WRITE, bit 2 = EXEC. This shows READ|EXEC = 5. Toggle bit 1 to "grant write" — the value becomes 7.' },
    q2: { type: 'quiz', q: 'Why must bit-flag enumerators be powers of two (1, 2, 4, 8…)?', opts: ['C requires enum values to be powers of two', 'So each flag owns exactly one bit — combinations never collide', 'Because shifts are faster than addition', 'To keep sizeof(enum) small'], a: 1, expl: 'With one bit per flag, OR-ing any subset produces a unique pattern and & can test each flag independently. If EXEC were 3 (0b011), it would overlap READ|WRITE and testing would lie.' },
    code3: {
      type: 'code', title: 'next.c — one case missing, on purpose', run: false, hl: [5],
      code: `enum Light { RED, AMBER, GREEN };

enum Light next(enum Light l) {
    switch (l) {                 /* no default — deliberately! */
    case RED:    return GREEN;
    case GREEN:  return AMBER;
    }                            /* forgot AMBER...            */
    return RED;
}`
    },
    term3: { type: 'term', text: `$ gcc -Wall -c next.c
next.c: In function 'next':
next.c:4:5: warning: enumeration value 'AMBER' not handled in switch [-Wswitch]` },
    q3: { type: 'quiz', q: 'You add a fourth value to an enum used in switches all over a big codebase. What is the cheapest way to find every spot that must be updated?', opts: ['grep for the enum name', 'Recompile with -Wall: every switch without a default that misses the new case gets flagged', 'Run the test suite and hope', 'Add a default: abort(); everywhere'], a: 1, expl: '-Wswitch (part of -Wall) reports each enum switch that does not handle every enumerator — but only when there is no default clause to swallow the omission. The compiler becomes your refactoring checklist.' },
    ed: {
      type: 'editor', label: 'Exercise: build a flag set',
      height: 320,
      code: `#include <stdio.h>

/* TODO 1: define enum Style with bit flags
   BOLD, ITALIC, UNDERLINE (use 1u << n). */

void describe(unsigned s) {
    /* TODO 2: print each style that is set, using & */
    (void)s;
}

int main(void) {
    unsigned title = 0;
    /* TODO 3: make title BOLD | UNDERLINE, then describe it,
       then revoke UNDERLINE with &= ~ and describe again. */
    describe(title);
    return 0;
}`,
      hint: 'BOLD = 1u<<0, ITALIC = 1u<<1, UNDERLINE = 1u<<2. Expected: first "bold underline", after revoking just "bold".',
    },
  },
});

/* ---------------- sizeof ---------------- */
CT.lesson({
  id: 'sizeof',
  title: 'sizeof: the measuring-tape operator',
  minutes: 12, xp: 110,
  tags: 'sizeof operator size_t zu array decay malloc vla unevaluated',
  why: `<p>Ask <code>malloc</code> for the wrong number of bytes and your program tramples the memory next door — one of the most common ways C programs crash. <code>sizeof</code> is how code asks "exactly how big is this?", so every allocation fits and every loop knows where its array ends. You'll also meet the classic trap where it suddenly answers 8 when you were expecting 40.</p>`,
  html: `
<p><code>sizeof</code> looks like a function, but it's an <strong>operator</strong> — as much a part of the language as <code>+</code>. It yields the size in bytes of a type or expression, computed <em>at compile time</em> — worked out while your code compiles, before the program ever runs (with one exotic exception we'll meet at the end).</p>

<h2>Parens: when you need them, when you don't</h2>
<p>Two forms, one rule: parentheses are <strong>required around type names</strong>, optional around expressions.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The result has type <code>size_t</code></b> — an unsigned type from <code>&lt;stddef.h&gt;</code>. Print it with <code>%zu</code>, never <code>%d</code>. And beware: because it's unsigned, <code>sizeof x - 10</code> can silently become a gigantic positive number if <code>sizeof x &lt; 10</code>.</p></div></div>

<div data-w="q1"></div>

<h2>Arrays: the one place sizeof is magic…</h2>
<p>Applied to an array <em>name</em>, sizeof reports the <strong>whole array</strong> — one of the few contexts where an array does <em>not</em> decay to a pointer. That gives us the classic element-count idiom:</p>
<div data-w="mg"></div>
<div data-w="code2"></div>

<h2>…and the classic trap</h2>
<div data-w="rv1"></div>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p>A function parameter declared <code>int arr[10]</code> is <em>rewritten by the compiler</em> to <code>int *arr</code> — the 10 is decoration. Inside the function, <code>sizeof arr</code> is the size of a <em>pointer</em> (8 on x86-64). The count idiom only works where the real array is in scope; functions must receive the length as a separate parameter.</p></div></div>

<div data-w="q2"></div>

<h2>sizeof in malloc: the idiom that survives refactoring</h2>
<div data-w="code3"></div>
<p>Why <code>sizeof *p</code> beats <code>sizeof(int)</code>: if <code>p</code> later becomes <code>long long *p</code>, the allocation stays correct <em>automatically</em>. Naming the type again is a bug waiting for the day someone changes one and not the other.</p>

<h2>The operand is never evaluated (almost)</h2>
<div data-w="code4"></div>
<div data-w="term4"></div>
<p>sizeof only inspects the <em>type</em> of its operand, so side effects inside it simply don't run. The exception: <strong>variable-length arrays</strong>. <code>sizeof</code> of a VLA must measure at runtime, so a VLA operand <em>is</em> evaluated — the one crack in "sizeof is compile-time".</p>

<div data-w="q3"></div>

<div data-w="ed"></div>

<p>You now know how big things are — next, the keywords that decide <em>where and how long</em> things live: the storage classes.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'forms.c',
      code: `#include <stdio.h>

int main(void) {
    int    x = 0;
    double d = 0;

    printf("%zu\\n", sizeof x);          /* expression: parens optional */
    printf("%zu\\n", sizeof(double));    /* type name: parens REQUIRED  */
    printf("%zu\\n", sizeof d);
    printf("%zu\\n", sizeof(x + 1.5));   /* type of x+1.5 is double     */
    printf("%zu\\n", sizeof(char));      /* by definition, exactly 1    */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc forms.c -o forms && ./forms
4
8
8
8
1
# sizes on a typical x86-64 Linux box — int and double may differ elsewhere` },
    q1: { type: 'quiz', q: 'Which of these is a syntax error?', opts: ['<code>sizeof x</code>', '<code>sizeof(x)</code>', '<code>sizeof int</code>', '<code>sizeof(int)</code>'], a: 2, expl: 'A bare type name needs parentheses: sizeof(int). Expressions work with or without. That asymmetry is the giveaway that sizeof is an operator, not a function call.' },
    mg: {
      type: 'memgrid', label: 'int arr[5] — sizeof sees all 20 bytes',
      cells: [
        { addr: '0x100', val: '10', name: 'arr[0]', hl: true },
        { addr: '0x104', val: '20', name: 'arr[1]', hl: true },
        { addr: '0x108', val: '30', name: 'arr[2]', hl: true },
        { addr: '0x10c', val: '40', name: 'arr[3]', hl: true },
        { addr: '0x110', val: '50', name: 'arr[4]', hl: true },
      ],
      note: '<code>sizeof arr</code> = 20 = 5 × <code>sizeof arr[0]</code> — so <code>sizeof arr / sizeof arr[0]</code> = 5, the element count.',
    },
    code2: {
      type: 'code', title: 'count.c',
      code: `#include <stdio.h>

#define LEN(a) (sizeof (a) / sizeof (a)[0])

int main(void) {
    int primes[] = { 2, 3, 5, 7, 11, 13 };

    printf("bytes: %zu\\n", sizeof primes);
    printf("count: %zu\\n", LEN(primes));

    for (size_t i = 0; i < LEN(primes); i++)
        printf("%d ", primes[i]);
    printf("\\n");
    return 0;
}`
    },
    rv1: {
      type: 'reveal', label: 'Classic trap — think first',
      q: 'What does this print on x86-64?<br><code>void f(int arr[10]) { printf("%zu\\n", sizeof arr); }</code><br><code>int main(void){ int a[10]; printf("%zu\\n", sizeof a); f(a); }</code>',
      answer: '<p><b>40, then 8.</b> In <code>main</code>, <code>a</code> is a real array: 10 × 4 = 40 bytes. In <code>f</code>, the parameter is really <code>int *arr</code> — the array decayed to a pointer at the call, so you get pointer size: 8. Modern compilers even warn: "sizeof on array function parameter will return size of pointer".</p>',
    },
    q2: { type: 'quiz', q: 'Why can\'t a function compute the length of an array it received as a parameter?', opts: ['sizeof is illegal inside functions', 'Arrays are copied, and the copy forgets its size', 'The parameter is really a pointer — the array decayed at the call site, its length never passed', 'It can, with sizeof arr / sizeof arr[0]'], a: 2, expl: 'C passes a pointer to the first element; no length travels with it. That is why every array-taking function in the standard library (memcpy, qsort, fwrite…) also takes a count parameter.' },
    code3: {
      type: 'code', title: 'alloc.c — the professional malloc shape',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t n = 1000;

    int *p = malloc(n * sizeof *p);     /* not sizeof(int)! */
    if (!p) return 1;

    double *grid = calloc(n, sizeof *grid);  /* zeroed       */
    if (!grid) { free(p); return 1; }

    printf("allocated %zu + %zu bytes\\n",
           n * sizeof *p, n * sizeof *grid);
    free(grid);
    free(p);
    return 0;
}`
    },
    code4: {
      type: 'code', title: 'noeval.c',
      code: `#include <stdio.h>

int main(void) {
    int i = 5;
    printf("%zu\\n", sizeof(i++));   /* type is int: 4        */
    printf("i = %d\\n", i);          /* i is STILL 5!         */

    int n = 3;
    int vla[n];                      /* variable-length array */
    printf("%zu\\n", sizeof vla);    /* runtime: 12 (the one
                                        case sizeof evaluates) */
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc noeval.c -o noeval && ./noeval
4
i = 5
12` },
    q3: { type: 'quiz', q: 'After <code>int i = 5; size_t s = sizeof(i++);</code> what is <code>i</code>?', opts: ['6', '5', 'Unspecified', '4'], a: 1, expl: 'The operand of sizeof is not evaluated (unless it is a VLA) — only its type matters. i++ never runs; i stays 5. A linter will rightly grumble about side effects inside sizeof.' },
    ed: {
      type: 'editor', label: 'Exercise: measure everything',
      height: 300,
      code: `#include <stdio.h>

struct Player {
    char  name[12];
    int   hp;
    double gold;
};

int main(void) {
    struct Player squad[4];

    /* TODO 1: print sizeof(struct Player) with %zu.
       Is it 12+4+8 = 24? Padding may say otherwise! */

    /* TODO 2: print the total bytes of squad, and compute
       its element count with the sizeof/sizeof idiom. */

    /* TODO 3: print sizeof(squad[0].name) — arrays inside
       structs do NOT decay. */
    return 0;
}`,
      hint: 'On x86-64 expect 24: name (12) + hp (4) land exactly on 16, so gold needs no padding. Now shrink name to char name[10] and re-run — sizeof stays 24, because 2 padding bytes appear before hp. squad count must come out as 4.',
    },
  },
});

/* ---------------- storage classes ---------------- */
CT.lesson({
  id: 'storage-classes',
  title: 'auto, register, static, extern: who lives where, seen by whom',
  minutes: 15, xp: 130,
  tags: 'storage class static extern auto register linkage translation unit tentative',
  why: `<p>You've already met a variable that quietly survives between function calls — that was <code>static</code> at work, one of four small keywords with outsized power. And the moment your project grows past a single file, the same keywords decide which names other files can use and which stay hidden: <code>static</code> doubles as C's version of "private".</p>`,
  html: `
<p>Every variable in a C program has two hidden properties: a <strong>storage duration</strong> (how long it exists) and a <strong>linkage</strong> (which parts of the program can refer to it by name). Four keywords — <code>auto</code>, <code>register</code>, <code>static</code>, <code>extern</code> — are how you control both; C calls them the <em>storage classes</em>.</p>

<h2>The two easy ones: auto and register</h2>
<p><code>auto</code> means "ordinary local variable, dies with its block" — which is the <em>default</em> for locals, so nobody ever writes it. (C23 recycled the keyword for type inference, <code>auto x = 3.14;</code>, giving it its first real job in 50 years.)</p>
<p><code>register</code> asks the compiler to keep a variable in a CPU register. Modern optimizers ignore the hint — they allocate registers far better than you — but one enforceable effect remains: <strong>you cannot take the address</strong> of a <code>register</code> variable. <code>&amp;r</code> is a compile error.</p>

<div data-w="q1"></div>

<h2>static, meaning #1: the local that never dies</h2>
<p>Inside a function, <code>static</code> moves a variable from the stack to static storage. It's initialized <em>once, before main runs</em>, and keeps its value between calls — while remaining visible only inside its function:</p>
<div data-w="tr1"></div>

<div data-w="q2"></div>

<h2>Translation units and linkage: the mental model</h2>
<p>Each <code>.c</code> file (after preprocessing) is a <strong>translation unit</strong>, compiled in complete isolation. The linker later stitches them together by matching names. Linkage is a name's "networking setting":</p>
<table>
<tr><th>linkage</th><th>who can reference it</th><th>how you get it</th></tr>
<tr><td><b>external</b></td><td>any translation unit</td><td>file-scope things, by default</td></tr>
<tr><td><b>internal</b></td><td>this translation unit only</td><td>file-scope + <code>static</code></td></tr>
<tr><td><b>none</b></td><td>just its own scope</td><td>locals, parameters</td></tr>
</table>

<h2>static, meanings #2 and #3: privacy at file scope</h2>
<p>At file scope, <code>static</code> means something completely different: <strong>internal linkage</strong>. A <code>static</code> global or a <code>static</code> function is invisible to every other <code>.c</code> file — it's <code>private</code>, C style. Marking every helper function <code>static</code> is a hallmark of well-organized C: it prevents name collisions across files and tells readers "the whole story of this function is right here."</p>

<h2>extern: "it exists, but elsewhere"</h2>
<p><code>extern</code> turns a definition into a mere <em>declaration</em> — a promise to the compiler that some other translation unit defines the object. Here's the whole dance in two files:</p>
<div data-w="code1"></div>
<div data-w="code2"></div>
<div data-w="term1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Definition vs declaration:</b> <code>int counter = 0;</code> allocates storage — exactly one TU may do this. <code>extern int counter;</code> allocates nothing and may appear in a thousand files (put it in a header!). A file-scope <code>int counter;</code> with no initializer is a <em>tentative definition</em> — it becomes a real zero-initialized definition if nothing else in the TU defines it. Historically linkers merged duplicate tentative definitions across files ("common symbols"), but since GCC 10 (<code>-fno-common</code> default) duplicates are a link error — as the standard always intended. Define once; <code>extern</code> everywhere else.</p></div></div>

<div data-w="q3"></div>

<h2>Cheat sheet</h2>
<table>
<tr><th>where written</th><th>keyword</th><th>duration</th><th>linkage</th></tr>
<tr><td>in a function</td><td>(none / <code>auto</code>)</td><td>the block</td><td>none</td></tr>
<tr><td>in a function</td><td><code>static</code></td><td>whole program</td><td>none</td></tr>
<tr><td>file scope</td><td>(none)</td><td>whole program</td><td>external</td></tr>
<tr><td>file scope</td><td><code>static</code></td><td>whole program</td><td><b>internal</b></td></tr>
<tr><td>anywhere</td><td><code>extern</code></td><td>—</td><td>refers to external</td></tr>
</table>

<div data-w="ed"></div>

<p>One function-shaped keyword remains in the storage-class family tree, and it's the strangest of the bunch: <code>inline</code>.</p>
`,
  widgets: {
    q1: { type: 'quiz', q: 'What is the only <em>enforced</em> effect of <code>register int r;</code> in modern C?', opts: ['r is guaranteed to live in a CPU register', 'Programs run measurably faster', 'Taking &amp;r is a compile error', 'r cannot be modified'], a: 2, expl: 'The register hint is freely ignorable (and ignored), but the address-of ban is real: something with no memory address cannot yield one, so the standard forbids &r outright.' },
    tr1: {
      type: 'trace', label: 'static local: one variable, many calls', title: 'ids.c',
      code: `#include <stdio.h>

int next_id(void) {
    static int id = 0;
    id++;
    return id;
}

int main(void) {
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    return 0;
}`,
      steps: [
        { line: 4, vars: { id: 0 }, out: '', note: 'Before main even starts: id sits in static storage, initialized to 0 exactly once. This line never "runs" again.' },
        { line: 10, vars: { id: 0 }, out: '', note: 'First call to next_id() begins.' },
        { line: 5, vars: { id: 1 }, out: '', note: 'id++ — the static variable becomes 1.' },
        { line: 6, vars: { id: 1 }, out: '', note: 'Return 1. The function ends, but id does NOT die — it lives in .data, not on the stack.' },
        { line: 10, vars: { id: 1 }, out: '1\n', note: 'printf outputs 1.' },
        { line: 11, vars: { id: 1 }, out: '1\n', note: 'Second call — id remembers! Still 1 from last time.' },
        { line: 5, vars: { id: 2 }, out: '1\n', note: 'Increment to 2. No re-initialization happened.' },
        { line: 11, vars: { id: 2 }, out: '1\n2\n', note: 'printf outputs 2.' },
        { line: 12, vars: { id: 2 }, out: '1\n2\n', note: 'Third call…' },
        { line: 5, vars: { id: 3 }, out: '1\n2\n', note: '…increments the same persistent variable to 3.' },
        { line: 12, vars: { id: 3 }, out: '1\n2\n3\n', note: 'Output 3. A stack local would have printed 1, 1, 1.' },
      ],
    },
    q2: { type: 'quiz', q: 'How many times does <code>static int id = 0;</code> initialize <code>id</code> across 1000 calls?', opts: ['1000 times', 'Once per program run, before main begins', 'Once per call, but only if id changed', 'Zero — statics are never initialized'], a: 1, expl: 'Static-duration objects are initialized exactly once, at program startup (conceptually — the value is baked into the .data segment of the executable). The = 0 line is not executable code.' },
    code1: {
      type: 'code', title: 'counter.c — the defining file', run: false,
      code: `/* counter.c */
static int secret = 0;      /* internal linkage: THIS file only */
int counter = 0;            /* external linkage: the definition */

static void audit(void) {   /* private helper — file-local      */
    /* ... */
}

void bump(void) {           /* external: callable from anywhere */
    secret++;
    counter++;
    audit();
}`
    },
    code2: {
      type: 'code', title: 'main.c — the using file', run: false,
      code: `/* main.c */
#include <stdio.h>

extern int counter;   /* declaration: "defined in another TU" */
void bump(void);      /* function declarations are extern-by-default */

int main(void) {
    bump(); bump(); bump();
    printf("counter = %d\\n", counter);

    /* audit();            link error: internal to counter.c  */
    /* printf("%d", secret);  compile error: not declared here */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc main.c counter.c -o app && ./app
counter = 3
# each .c compiled separately; the linker matched 'counter' and 'bump'` },
    q3: { type: 'quiz', q: 'A helper function in <code>parse.c</code> should not be callable from other files. The idiomatic fix?', opts: ['Name it with a leading underscore', 'Declare it <code>static</code> — internal linkage hides it from the linker', 'Declare it <code>extern</code>', 'Move it inside main()'], a: 1, expl: 'static at file scope is C\'s "private". Bonus effects: no risk of colliding with a same-named function elsewhere, and the compiler can optimize harder (even discard it entirely after inlining) since it can see every caller.' },
    ed: {
      type: 'editor', label: 'Exercise: a call counter with static',
      height: 320,
      code: `#include <stdio.h>

/* TODO 1: write 'int countdown(void)' that returns
   10, 9, 8, ... using a static local, one step per call. */

/* TODO 2: mark it static (the OTHER static — file scope).
   Both statics in one line: static int countdown(void). */

int main(void) {
    for (int i = 0; i < 5; i++)
        printf("%d ", countdown());
    printf("\\n");
    return 0;
}`,
      hint: 'static int n = 10; return n--; Expected output: 10 9 8 7 6. Notice the two unrelated meanings of static living happily in one declaration.',
    },
  },
});

/* ---------------- inline ---------------- */
CT.lesson({
  id: 'inline',
  title: 'inline: a hint, a header trick, and a weird rule',
  minutes: 12, xp: 110,
  tags: 'inline static inline extern inline c99 header optimization bloat',
  why: `<p>A game redraws the screen 60 times a second, calling tiny helpers like <code>max()</code> millions of times — and merely <em>calling</em> them can cost more than the work they do. <code>inline</code> is C's tool for making tiny functions effectively free. Along the way it explains a baffling "undefined reference" error that you are otherwise destined to meet someday.</p>`,
  html: `
<p>Calling a function costs a little: arguments get arranged, a jump happens, a stack frame — the function's private patch of stack memory — is set up. For a three-instruction function called a billion times, the overhead can dwarf the work. <strong>Inlining</strong> — pasting the body directly where the call was written — removes the overhead and, more importantly, lets the optimizer melt caller and callee together.</p>

<h2>What the keyword actually does (little!)</h2>
<p>Here's the modern reality: <code>inline</code> is only a <em>suggestion</em>, and at <code>-O2</code> compilers inline aggressively <strong>with or without it</strong> — and refuse when it's a bad idea, with or without it. The keyword's real, practical value is different: it changes the rules so a function <strong>definition can legally live in a header</strong> included by many <code>.c</code> files, without "multiple definition" linker errors.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Why <code>static inline</code>? Each translation unit gets its own private copy of the function; the copies never meet at link time, so there's no conflict. The optimizer inlines the calls and usually no copy even exists in the final binary.</p>

<div data-w="q1"></div>

<h2>The weird C99 rule (told honestly)</h2>
<p>Plain <code>inline</code> — without <code>static</code> — has famously confusing semantics. Watch what happens:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>What?! Here's the rule, as simply as it can be put: a function defined with <em>only</em> <code>inline</code> provides an <strong>inline definition</strong> — a body the compiler <em>may</em> use for inlining, but which does <strong>not</strong> emit an actual, linkable function. If the compiler chooses to make a real call (it always does at <code>-O0</code>), the linker needs a real function… which nobody emitted. To emit one, exactly one translation unit must add an <code>extern</code> declaration:</p>
<div data-w="code3"></div>
<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Extra confusion, historical edition:</b> pre-C99 GNU C ("gnu89 inline") used the <em>same keywords with the meanings flipped</em>. If you read old code or blog posts, check which dialect they mean. This mess is why the ecosystem settled on the pattern below.</p></div></div>

<h2>The practical decision</h2>
<div data-w="fl"></div>
<p><strong>Rule of thumb that ends all confusion:</strong> for small functions in headers, write <code>static inline</code> and move on with your life. Reserve C99's <code>extern inline</code> dance for libraries that need one canonical out-of-line copy (glibc does this; you almost never need to).</p>

<div data-w="q2"></div>

<h2>When inlining hurts</h2>
<p>Inlining duplicates code. Inline a 200-line function into 50 call sites and your binary balloons — and a bigger binary means more <strong>instruction-cache misses</strong>, which can make the program <em>slower</em> than honest calls. Compilers weigh this with size heuristics; trust them. Profile first, and if a hot call really must vanish, check the compiler agreed (look at the assembly, or use <code>-Winline</code>) rather than sprinkling <code>inline</code> as a magic performance spice.</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Since inlining requires the body to be <em>visible</em> in the calling translation unit, functions hidden in other .c files can't be inlined — unless you enable link-time optimization (<code>-flto</code>), which lets the "linker" re-optimize across files. More in Part 8.</p></div></div>

<div data-w="q3"></div>

<div data-w="ed"></div>

<p>inline asks the compiler to optimize harder; the next keyword, <code>restrict</code>, gives it <em>permission</em> to — by promising your pointers don't overlap.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'imath.h — the pattern to memorize', run: false,
      code: `#ifndef IMATH_H
#define IMATH_H

/* safe to #include from any number of .c files */
static inline int imax(int a, int b) {
    return a > b ? a : b;
}

static inline int iclamp(int x, int lo, int hi) {
    return imax(lo, x < hi ? x : hi);
}

#endif`
    },
    term1: { type: 'term', text: `$ gcc -O2 -c a.c b.c c.c   # all three include imath.h
$ gcc a.o b.o c.o -o app   # no "multiple definition" errors
# and at -O2, calls to imax compiled to a single cmov — no call at all` },
    q1: { type: 'quiz', q: 'Why does <code>static inline</code> in a header not cause "multiple definition" linker errors?', opts: ['inline deletes the function entirely', 'static gives each translation unit its own internal copy — the linker never sees a clash', 'The preprocessor removes duplicate definitions', 'Headers are only compiled once'], a: 1, expl: 'static = internal linkage: each .c that includes the header owns a private version. Private symbols are not matched across TUs, so no conflict — and unused copies are simply discarded.' },
    code2: {
      type: 'code', title: 'lonely.c — plain inline, no extern anywhere', run: false, hl: [3],
      code: `#include <stdio.h>

inline int twice(int x) { return 2 * x; }

int main(void) {
    printf("%d\\n", twice(21));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -O0 lonely.c
/usr/bin/ld: /tmp/ccXig1zw.o: in function 'main':
lonely.c:(.text+0xe): undefined reference to 'twice'
collect2: error: ld returned 1 exit status
# at -O2 it "works" — the call was inlined so no symbol was needed. Fragile!` },
    code3: {
      type: 'code', title: 'the C99-correct fix (one TU only)', run: false,
      code: `/* twice.h — inline definition, included everywhere */
inline int twice(int x) { return 2 * x; }

/* twice.c — exactly ONE file forces a real, linkable copy */
#include "twice.h"
extern int twice(int x);   /* "emit the external definition here" */`
    },
    fl: {
      type: 'flow', label: 'Where should a small function live?', colw: 200, rowh: 96,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'small, hot\nfunction' },
        { id: 'd1', col: 0, row: 1, kind: 'dec', label: 'needed by\nseveral .c files?' },
        { id: 'p1', col: 1, row: 1, kind: 'proc', label: 'plain function in\none .c (LTO can\nstill inline it)' },
        { id: 'p2', col: 0, row: 2, kind: 'proc', label: 'static inline\nin a header' },
        { id: 'e', col: 0, row: 3, kind: 'end', label: 'let -O2 make\nthe final call' },
      ],
      edges: [
        { from: 's', to: 'd1' },
        { from: 'd1', to: 'p1', label: 'no' },
        { from: 'd1', to: 'p2', label: 'yes' },
        { from: 'p2', to: 'e' },
        { from: 'p1', to: 'e' },
      ],
      note: 'The exotic third option — C99 <code>extern inline</code> — is for libraries wanting one shared out-of-line copy. You will rarely need it.',
    },
    q2: { type: 'quiz', q: 'A function defined with plain <code>inline</code> (no static, no extern declaration anywhere) links fine at -O2 but fails at -O0. Why?', opts: ['-O0 disables the inline keyword', 'An inline definition emits no linkable symbol; -O2 inlined every call (no symbol needed), -O0 emitted real calls to a function that does not exist', 'The linker requires optimization for inline', 'It is a compiler bug'], a: 1, expl: 'That is the C99 rule in action: inline-only = "body available for inlining, but I am not the external definition". Whether you need the symbol depends on whether calls were actually inlined — hence the optimization-level-dependent link error.' },
    q3: { type: 'quiz', q: 'Inlining a large function into many call sites can make a program slower because…', opts: ['inline functions cannot use registers', 'the duplicated code enlarges the binary and thrashes the instruction cache', 'inlined code cannot be optimized', 'each copy re-checks its arguments'], a: 1, expl: 'Code bloat is the classic inlining downside: more bytes of machine code competing for the same small i-cache. This is why compilers apply size heuristics and why "inline everything" is an anti-pattern.' },
    ed: {
      type: 'editor', label: 'Exercise: your own static inline helpers',
      height: 300,
      code: `#include <stdio.h>

/* Imagine this section is a header file: */

/* TODO 1: write 'static inline int imin(int a, int b)'. */

/* TODO 2: write 'static inline int iabs(int x)' using imin
   or a conditional. */

int main(void) {
    printf("%d %d\\n", 0, 0); /* TODO 3: imin(3,7) and iabs(-42) */
    return 0;
}`,
      hint: 'Expected output: 3 42. Then try declaring imin WITHOUT static (just inline) — depending on flags you may reproduce the famous linker error.',
    },
  },
});

/* ---------------- restrict ---------------- */
CT.lesson({
  id: 'restrict',
  title: 'restrict: the no-aliasing promise',
  minutes: 12, xp: 120,
  tags: 'restrict alias pointer optimization memcpy memmove c99 promise',
  why: `<p>The C library ships two functions — <code>memcpy</code> and <code>memmove</code> — that seem to do exactly the same job. The entire difference is one promise about overlapping data: a promise that lets the compiler copy dramatically faster, and silently breaks your program if you ever make it falsely. This lesson shows you when to make that promise in your own code — and when you absolutely must not.</p>`,
  html: `
<p>Two pointers <strong>alias</strong> when they refer to the same memory. Aliasing is legal, common — and quietly devastating for performance, because the compiler must assume it's happening <em>everywhere</em>. <code>restrict</code>, added in C99 — the 1999 edition of the C standard — is your way of saying: "through this pointer, and this pointer alone, will this data be accessed — optimize accordingly."</p>

<h2>Seeing the problem</h2>
<div data-w="mg"></div>
<div data-w="code1"></div>
<div data-w="rv1"></div>
<p>Because that aliased outcome is <em>possible</em>, the compiler must compile the paranoid version: load <code>*inc</code>, add, <strong>store</strong>, load <code>*inc</code> <em>again</em> (it might have changed!), add, store. Every write through one pointer forces re-reads through others. In a loop over big arrays, this poisons everything — especially vectorization, which needs to process many elements in flight at once.</p>

<div data-w="q1"></div>

<h2>The fix: a promise, and the payoff</h2>
<div data-w="code2"></div>
<p>With <code>restrict</code>, the second <code>*inc</code> load disappears — the compiler keeps it in a register. In real loops the win is far bigger: proving arrays don't overlap is exactly what lets the compiler unleash SIMD instructions and process 4–8 elements per cycle.</p>

<h2>The standard library's own example: memcpy vs memmove</h2>
<p>You've been using restrict all along — look at these real prototypes from <code>&lt;string.h&gt;</code>:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<p><code>memcpy</code> declares both pointers <code>restrict</code>: you promise no overlap, so it may copy with the fastest possible wide, reordered loads and stores. <code>memmove</code> makes no such promise — it must check the direction and copy carefully, slightly slower but overlap-safe. Same job, different contract: that's restrict in a nutshell.</p>

<div data-w="q2"></div>

<h2>It's a promise YOU make — and UB if you break it</h2>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><code>restrict</code> is completely unchecked. The compiler cannot verify your pointers don't overlap — it simply <em>believes you</em> and optimizes on that basis. Call <code>memcpy</code> with overlapping buffers, or pass the same array as both <code>src</code> and <code>dst</code> of a restrict-qualified function, and you get <strong>undefined behavior</strong>: code that "worked for years" breaks on the next compiler upgrade, and the compiler is blameless. If overlap is even <em>possible</em>, don't write restrict.</p></div></div>

<p>Precisely stated, the promise is: during the lifetime of a <code>restrict</code> pointer, if the object it points to is <em>modified</em>, then all access to that object happens through that pointer (or expressions derived from it, like <code>p + i</code>). Read-only sharing is fine — modification is what triggers the exclusivity clause.</p>

<div data-w="q3"></div>

<div data-w="ed"></div>

<p>restrict is one honest conversation between you and the optimizer; next we tackle the whole system of type conversations C holds behind your back — implicit conversions, promotions, and casts.</p>
`,
  widgets: {
    mg: {
      type: 'memgrid', label: 'Aliasing: two names, one cell',
      cells: [
        { addr: '0x100', val: '3', name: 'x', hl: true },
        { addr: '0x200', val: '0x100', name: 'val', hl2: true },
        { addr: '0x208', val: '0x100', name: 'inc', hl2: true },
      ],
      note: 'Both pointers hold <code>0x100</code> — <code>*val</code> and <code>*inc</code> are the <em>same int</em>. Any write through one instantly changes what the other reads. The compiler can almost never prove this is NOT the case.',
    },
    code1: {
      type: 'code', title: 'alias.c — same function, two personalities',
      code: `#include <stdio.h>

void add_twice(int *val, int *inc) {
    *val += *inc;
    *val += *inc;
}

int main(void) {
    int a = 3, b = 10;
    add_twice(&a, &b);      /* distinct objects        */
    printf("distinct: %d\\n", a);

    int x = 3;
    add_twice(&x, &x);      /* aliased! val == inc     */
    printf("aliased : %d\\n", x);
    return 0;
}`
    },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'What are the two printed values?',
      answer: '<p><code>distinct: 23</code> (3+10+10) but <code>aliased : 12</code> — the first <code>*val += *inc</code> doubles x to 6, and the second one reads the <em>updated</em> value: 6+6 = 12. Same source line, different meaning, purely because of aliasing. This is why the compiler cannot rewrite the body into the "obvious" <code>*val += 2 * *inc;</code>.</p>',
    },
    q1: { type: 'quiz', q: 'Why must the compiler re-load <code>*inc</code> after the store to <code>*val</code> (without restrict)?', opts: ['int loads cannot be cached in registers', 'val and inc might point to the same object, so the store may have changed *inc', 'Function parameters are always volatile', 'It does not — compilers always keep it in a register'], a: 1, expl: 'The mere possibility of aliasing forces the reload. The compiler must generate code that is correct for EVERY legal call, including add_twice(&x, &x).' },
    code2: {
      type: 'code', title: 'restrict.c — the promise and the generated code', run: false, hl: [1],
      code: `void add_twice(int *restrict val, int *restrict inc) {
    *val += *inc;      /* compiler may now assume val != inc  */
    *val += *inc;
}

/* gcc -O2, x86-64:
      without restrict          with restrict
      mov  eax, [rsi]           mov  eax, [rsi]
      add  [rdi], eax           add  eax, eax      ; 2 * *inc
      mov  eax, [rsi]  ; reload mov  [rdi]... one store, no reload
      add  [rdi], eax                                            */`
    },
    code3: {
      type: 'code', title: 'string.h (excerpt) — restrict in the wild', run: false,
      code: `void *memcpy(void *restrict dst,
             const void *restrict src, size_t n);
                        /* YOU promise: no overlap    */

void *memmove(void *dst, const void *src, size_t n);
                        /* overlap allowed, handled   */`
    },
    term3: { type: 'term', text: `$ cat overlap.c
# shifting "abcdef" right by two, in place:
#   memmove(s + 2, s, 4)  -> safe, prints "ababcd"
#   memcpy (s + 2, s, 4)  -> UB: breaks memcpy's restrict contract
$ gcc -O2 overlap.c && ./a.out
ababcd
# the memcpy version may "work", corrupt data, or change with any upgrade` },
    q2: { type: 'quiz', q: 'You need to copy a region two bytes to the right <em>within the same buffer</em>. Which call is correct?', opts: ['<code>memcpy(buf+2, buf, n)</code> — it is faster', '<code>memmove(buf+2, buf, n)</code> — its contract permits overlap', 'Either; they are interchangeable', 'Neither; overlapping copies are impossible in C'], a: 1, expl: 'The regions overlap, and memcpy\'s restrict-qualified parameters make overlap UB. memmove exists precisely for this: it detects direction and copies safely. When in doubt, memmove — correctness first.' },
    q3: { type: 'quiz', q: 'What happens if you break a restrict promise?', opts: ['The compiler detects it and warns', 'A runtime exception', 'Nothing — restrict is only documentation', 'Undefined behavior: the optimizer generated code assuming no aliasing'], a: 3, expl: 'restrict is an unchecked contract. The compiler bakes the no-aliasing assumption into the generated instructions; if reality disagrees, those instructions compute garbage. No diagnostic is required, and none typically comes.' },
    ed: {
      type: 'editor', label: 'Exercise: watch aliasing change a result',
      height: 320,
      code: `#include <stdio.h>
#include <string.h>

/* Sums n ints from src into *out. */
void sum_into(int *out, const int *src, int n) {
    *out = 0;
    for (int i = 0; i < n; i++)
        *out += src[i];         /* what if out aliases src?! */
}

int main(void) {
    int v[4] = { 1, 2, 3, 4 };
    int total;
    sum_into(&total, v, 4);
    printf("separate: %d\\n", total);     /* 10 */

    /* TODO 1: call sum_into(&v[0], v, 4) and print v[0].
       Predict first! (*out = 0 zeroes v[0] before the loop...) */

    /* TODO 2: add 'restrict' to out and src. The aliased call
       is now UB — the answer may differ by optimization level. */
    return 0;
}`,
      hint: 'Aliased prediction: v[0] is zeroed, so the sum is 0+2+3+4 = 9. With restrict, 9 is no longer guaranteed — that call breaks the promise.',
    },
  },
});

/* ---------------- casting & conversions ---------------- */
CT.lesson({
  id: 'casting-conversions',
  title: 'Conversions & casts: C changes your types behind your back',
  minutes: 15, xp: 130,
  tags: 'cast conversion promotion integer rank signed unsigned truncation void pointer',
  why: `<p>Under the right (wrong) circumstances, C will cheerfully conclude that <code>-1</code> is greater than <code>1</code> — and a loop meant to run zero times will run four billion times instead. Both surprises come from type conversions the language performs silently behind your back, and both have taken down real production systems. Learn the rules, and these famous bugs happen to other people.</p>`,
  html: `
<p>Here's an unsettling truth: in almost every C expression you write, the values you operate on are <strong>converted to other types first</strong> — silently, by fixed rules. Most of the time the rules do what you'd hope. The rest of the time they produce some of the most famous bugs in the language. Let's learn the rules so the bugs happen to other people.</p>

<h2>Rule 1: integer promotions — small types grow up</h2>
<p>Types narrower than <code>int</code> (<code>char</code>, <code>short</code>, <code>_Bool</code>, bit-fields) never do arithmetic as themselves. Before any math, they're promoted to <code>int</code>. Yes: <strong><code>char + char</code> happens as <code>int + int</code></strong>.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>The promotion is why <code>u &lt;&lt; 1</code> gave 510, not 254 — the <code>unsigned char</code> became an <code>int</code> (value 255) <em>before</em> shifting. Promotions usually protect you from surprise overflow in intermediate results; you only feel them at the edges, like here.</p>

<div data-w="q1"></div>

<h2>Rule 2: usual arithmetic conversions — finding a common type</h2>
<p>For binary operators, both sides are converted to one <em>common type</em>. The dance:</p>
<div data-w="fl"></div>
<p>The float side is simple: if either operand is <code>double</code>, everything becomes <code>double</code> (so <code>1 / 2.0</code> is <code>0.5</code> but <code>1 / 2</code> is <code>0</code>). For integers, the higher <em>rank</em> wins (<code>char</code> &lt; <code>short</code> &lt; <code>int</code> &lt; <code>long</code> &lt; <code>long long</code>). The trap lives in the mixed-signedness case…</p>

<h2>The signed/unsigned trap</h2>
<div data-w="code2"></div>
<div data-w="term2"></div>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p>When <code>int</code> meets <code>unsigned int</code>, the <strong>signed value converts to unsigned</strong>. <code>-1</code> becomes 4,294,967,295 — so <code>-1 &gt; 1u</code> is <em>true</em>. This bites constantly in real code because <code>sizeof</code>, <code>strlen</code>, and container sizes are all unsigned: <code>for (int i = 0; i &lt; size - 1; i++)</code> with <code>size == 0</code> computes <code>0u - 1</code> = 4 billion, and the loop runs off the end of the world. Compile with <code>-Wall -Wextra</code>: the sign-compare warning is there to save you.</p></div></div>

<div data-w="q2"></div>

<h2>Narrowing: when values don't fit</h2>
<div data-w="code3"></div>
<div data-w="term3"></div>
<ul>
<li><b>Integer → smaller unsigned:</b> well-defined, wraps modulo 2ⁿ (<code>300 % 256 = 44</code>).</li>
<li><b>Integer → smaller signed:</b> result is <em>implementation-defined</em> if it doesn't fit (in practice: truncated two's-complement bits).</li>
<li><b>Float → integer:</b> the fraction is discarded — truncation toward zero, so <code>(int)-3.9</code> is <code>-3</code>. If even the truncated value doesn't fit (<code>(int)1e30</code>): <strong>undefined behavior</strong>, not just a wrong number.</li>
</ul>

<h2>Explicit casts — and the void * exception</h2>
<p>A cast is the conversion you write yourself: <code>(type)expr</code>. Its best use is making a conversion the compiler would do grudgingly (or not at all) loud and intentional:</p>
<div data-w="code4"></div>
<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Don't cast malloc.</b> <code>void *</code> converts to and from any object-pointer type <em>implicitly</em> in C — that's its whole job. <code>int *p = malloc(n);</code> is perfect C. The cast you often see (<code>(int *)malloc(n)</code>) is a C++ habit that only adds noise and can hide a missing <code>#include &lt;stdlib.h&gt;</code>.</p></div></div>

<div data-w="q3"></div>

<div data-w="ed"></div>

<p>Conversions gone wrong are one road into C's deepest pit — and that pit deserves its own lesson: undefined behavior.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'promote.c',
      code: `#include <stdio.h>

int main(void) {
    char a = 100, b = 100;
    printf("sizeof(a+b) = %zu\\n", sizeof(a + b));  /* 4, not 1! */
    int sum = a + b;
    printf("sum = %d\\n", sum);      /* 200: math happened as int,
                                        no char overflow occurred */

    unsigned char u = 255;
    printf("u << 1 = %d\\n", u << 1);   /* promoted first... */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc promote.c -o promote && ./promote
sizeof(a+b) = 4
sum = 200
u << 1 = 510` },
    q1: { type: 'quiz', q: 'Two <code>char</code> variables are added. In what type does the addition happen?', opts: ['char', 'short', 'int — integer promotion widens both operands first', 'Whichever char is larger'], a: 2, expl: 'Anything narrower than int is promoted to int before arithmetic. The result type is int too — assigning it back to a char is a separate (narrowing) conversion.' },
    fl: {
      type: 'flow', label: 'Usual arithmetic conversions (integer side)', colw: 210, rowh: 96,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'a ⊕ b\n(binary operator)' },
        { id: 'p0', col: 0, row: 1, kind: 'proc', label: 'promote each side:\nchar / short / _Bool → int' },
        { id: 'd1', col: 0, row: 2, kind: 'dec', label: 'types still\ndiffer?' },
        { id: 'p2', col: 1, row: 2, kind: 'proc', label: 'convert to common type:\nhigher rank wins;\nmixed signs → unsigned\nwins at equal rank' },
        { id: 'e', col: 0, row: 3, kind: 'end', label: 'operate in the\ncommon type' },
      ],
      edges: [
        { from: 's', to: 'p0' },
        { from: 'p0', to: 'd1' },
        { from: 'd1', to: 'p2', label: 'yes' },
        { from: 'd1', to: 'e', label: 'no' },
        { from: 'p2', to: 'e' },
      ],
      note: 'Float shortcut: if either side is <code>double</code> (or <code>float</code>), the other side converts to it and this whole integer dance is skipped. The bold red cell of the chart: <b>signed meets unsigned of same rank → signed converts to unsigned</b>.',
    },
    code2: {
      type: 'code', title: 'wat.c — comparison of the year',
      code: `#include <stdio.h>

int main(void) {
    unsigned int u = 1;
    int i = -1;

    if (i > u)
        printf("-1 > 1u is TRUE?!\\n");

    printf("i as unsigned: %u\\n", (unsigned)i);

    unsigned int size = 0;
    printf("size - 1 = %u\\n", size - 1);   /* the loop-bound killer */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -Wall -Wextra wat.c -o wat
wat.c:7:11: warning: comparison of integer expressions of different
            signedness: 'int' and 'unsigned int' [-Wsign-compare]
$ ./wat
-1 > 1u is TRUE?!
i as unsigned: 4294967295
size - 1 = 4294967295` },
    q2: { type: 'quiz', q: 'Why is <code>-1 &gt; 1u</code> true?', opts: ['A compiler bug', 'The unsigned 1 converts to signed', 'The -1 converts to unsigned int, becoming 4294967295', 'Comparison operators ignore sign'], a: 2, expl: 'Same rank, mixed signedness → the signed operand converts to unsigned. Two\'s-complement -1 reinterprets as UINT_MAX. The comparison then honestly reports 4294967295 > 1.' },
    code3: {
      type: 'code', title: 'narrow.c',
      code: `#include <stdio.h>

int main(void) {
    int big = 300;
    unsigned char c = big;     /* wraps mod 256: well-defined  */
    printf("c = %d\\n", c);

    double d = -3.99;
    int n = d;                 /* truncates toward zero        */
    printf("n = %d\\n", n);

    long huge = 5000000000L;
    int t = huge;              /* doesn't fit: impl-defined    */
    printf("t = %d\\n", t);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc narrow.c -o narrow && ./narrow
c = 44
n = -3
t = 705032704
# 300 mod 256 = 44; -3.99 chops to -3; 5000000000's low 32 bits = 705032704` },
    code4: {
      type: 'code', title: 'casts.c — good casts are loud on purpose',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int done = 7, total = 9;
    printf("%.1f%%\\n", 100.0 * done / total);      /* no cast needed */
    printf("%.1f%%\\n", (double)done / total * 100); /* or be explicit */
    printf("%d%%\\n",   done / total * 100);         /* int division: 0! */

    double *samples = malloc(64 * sizeof *samples);  /* no cast: void*  */
    free(samples);
    return 0;
}`
    },
    q3: { type: 'quiz', q: 'In C, <code>int *p = malloc(10 * sizeof *p);</code> compiles without a cast because…', opts: ['malloc returns int*', 'void* converts implicitly to any object-pointer type', 'The compiler infers the type from p', 'It does not compile — a cast is required'], a: 1, expl: 'void* is C\'s universal object-pointer courier; conversions to and from it are implicit by design. (C++ chose differently — there the cast IS required — which is where the habit of casting malloc leaks from.)' },
    ed: {
      type: 'editor', label: 'Exercise: predict the conversions',
      height: 320,
      code: `#include <stdio.h>

int main(void) {
    /* Predict each line BEFORE running. */

    printf("%d\\n", 7 / 2);            /* A: int / int        */
    printf("%f\\n", 7 / 2.0);          /* B: int meets double */

    unsigned char b = 200;
    printf("%d\\n", b + b);            /* C: promoted or 144? */

    unsigned u = 2;
    int i = -4;
    printf("%d\\n", i / (int)u);       /* D: safe             */
    printf("%u\\n", i / u);            /* E: -4 converts to...? */
    return 0;
}`,
      hint: 'A: 3. B: 3.5. C: 400 (promotion saves it). D: -2. E: enormous — (-4 as unsigned)/2 = 2147483646. Fix E by casting u to int, like D.',
    },
  },
});

/* ---------------- undefined behavior ---------------- */
CT.lesson({
  id: 'undefined-behavior',
  title: 'Undefined behavior: here be nasal demons',
  minutes: 16, xp: 140,
  tags: 'undefined behavior ub sanitizer overflow null dangling optimization wall',
  why: `<p>In 2009, a compiler silently deleted a safety check inside the Linux kernel and turned a small bug into a security exploit — and it broke no rules doing so. That's undefined behavior: the reason C programs can "work for years", then fail the day you upgrade your compiler. This lesson is your survival kit, including the tools that catch these bugs at the exact line they happen.</p>`,
  html: `
<p>The C standard defines what programs mean — but for certain operations it deliberately says: <em>nothing</em>. "Undefined behavior: behavior, upon use of a nonportable or erroneous program construct, for which this document imposes <strong>no requirements</strong>." No requirements. Your program may crash, print 42, silently corrupt a file, or appear to work perfectly for ten years and fail during the demo.</p>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p>Usenet, 1992: a comp.std.c regular quipped that when a program hits UB, it's legal for the compiler "to make demons fly out of your nose". <b>Nasal demons</b> have been the mascot of UB ever since. The joke has a sharp point: <em>anything</em> is a conforming outcome.</p></div></div>

<h2>The right mental model: a contract</h2>
<p>Think of the standard as a contract between you and the compiler. You promise your program never executes UB; in exchange, the compiler generates blazingly fast code <em>that only has to be correct for programs that keep the promise</em>. UB isn't "an error the compiler catches" — it's a case the compiler is allowed to <strong>assume never happens</strong> and optimize accordingly. That assumption is where the shocking stories come from.</p>

<h2>Exhibit A: the vanishing NULL check</h2>
<div data-w="code1"></div>
<p>Read line 2: <code>p</code> is dereferenced. The compiler reasons: "if <code>p</code> were NULL, line 2 would be UB, and UB never happens — therefore <code>p</code> isn't NULL — therefore the <code>if</code> on line 3 is dead code." <strong>The safety check is deleted.</strong> This exact pattern (dereference above a check) caused a famous Linux kernel vulnerability in 2009: the compiler removed a NULL check and turned a bug into an exploit.</p>

<div data-w="q1"></div>

<h2>Exhibit B: one program, two answers</h2>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Since signed overflow is UB, the compiler may assume <code>x + 1</code> never wraps — so <code>x + 1 &lt; x</code> is simply <em>false</em>, at compile time, for all x. At <code>-O0</code> the wrap physically happens and you see 1. Neither answer is "wrong": a program that executes UB has no defined answer at all.</p>

<h2>The classics gallery</h2>
<table>
<tr><th>undefined behavior</th><th>typical crime scene</th></tr>
<tr><td>signed integer overflow</td><td><code>INT_MAX + 1</code>, absolute value of <code>INT_MIN</code></td></tr>
<tr><td>out-of-bounds access</td><td><code>a[n]</code> on an n-element array — the beloved off-by-one</td></tr>
<tr><td>use after free / double free</td><td>any pointer used after its object's lifetime ends</td></tr>
<tr><td>reading uninitialized variables</td><td><code>int sum; sum += x;</code></td></tr>
<tr><td>NULL dereference</td><td>unchecked malloc, unchecked find()</td></tr>
<tr><td>data races</td><td>two threads, one non-atomic object, no sync</td></tr>
<tr><td>shift ≥ width, or negative shift</td><td><code>1 &lt;&lt; 32</code> on 32-bit int</td></tr>
<tr><td>modifying a string literal / const object</td><td><code>char *s = "hi"; s[0] = 'H';</code></td></tr>
</table>

<div data-w="mg"></div>
<div data-w="q2"></div>

<h2>Why does UB exist at all?</h2>
<p>It's not sadism — it's the price of C's two core promises:</p>
<ul>
<li><b>Performance:</b> checking every array index, every pointer, every add for validity would cost cycles on every operation. UB says: no mandatory checks — programs pay only for what they use. It also licenses big optimizations: assuming <code>i++</code> never wraps is what lets loops vectorize.</li>
<li><b>Portability (of the language, across weird machines):</b> C runs on hardware that traps on overflow, on machines where NULL isn't bit-pattern zero. By defining nothing, the standard lets each platform do what's natural and fast <em>there</em>.</li>
</ul>

<div data-w="rv1"></div>

<h2>Your defense kit</h2>
<div data-w="code3"></div>
<div data-w="term3"></div>
<ul>
<li><b>Always:</b> <code>-Wall -Wextra</code> (and treat warnings as errors with <code>-Werror</code> in CI). Free, instant, catches whole bug classes.</li>
<li><b>During development:</b> <code>-fsanitize=address,undefined</code> — ASan catches out-of-bounds and use-after-free at the moment they happen; UBSan pinpoints overflow, bad shifts, misaligned access with file:line precision.</li>
<li><b>Occasionally:</b> Valgrind (no recompile needed), and <code>-O2</code> vs <code>-O0</code> behavior differences as a smoke alarm: if optimization "breaks" your program, suspect UB in <em>your</em> code first, not a compiler bug.</li>
</ul>

<div data-w="q3"></div>

<div data-w="ed"></div>

<p>You now hold the full type system — every qualifier, every keyword, every trapdoor. Next stop, Part 4: the layer that rewrites your code before the compiler even sees it — the preprocessor.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'vanish.c — the optimizer deletes your safety net', run: false, hl: [2, 3],
      code: `int get(int *p) {
    int v = *p;          /* deref first...                     */
    if (p == NULL)       /* ...check later. Compiler: "p was   */
        return -1;       /*  dereferenced, so it can't be NULL
                            here" — branch DELETED at -O2      */
    return v;
}`
    },
    q1: { type: 'quiz', q: 'Why may the compiler delete the NULL check in <code>vanish.c</code>?', opts: ['NULL checks are deprecated', 'Dereferencing NULL is UB, so after <code>*p</code> the compiler may assume p is non-NULL — making the check dead code', 'The function is too small to keep the branch', 'It cannot — this would be a compiler bug'], a: 1, expl: 'UB reasoning runs BACKWARDS from the deref: "well-defined executions never deref NULL, so in every execution I must care about, p != NULL." Deleting the check is then a correct optimization of all non-UB executions. The fix: check BEFORE dereferencing.' },
    code2: {
      type: 'code', title: 'wraps.c', hl: [4],
      code: `#include <stdio.h>

int wraps(int x) {
    return x + 1 < x;    /* "detect overflow"... via overflow  */
}

int main(void) {
    printf("%d\\n", wraps(2147483647));   /* INT_MAX */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -O0 wraps.c && ./a.out
1
$ gcc -O2 wraps.c && ./a.out
0
# same source, both "correct": the program's meaning was undefined` },
    mg: {
      type: 'memgrid', label: 'Use-after-free: pointing at a ghost',
      cells: [
        { addr: '0x2000', val: '0x5a10', name: 'p', hl2: true },
        { addr: '0x5a10', val: '??', name: 'freed', freed: true },
        { addr: '0x5a18', val: '??', name: 'freed', freed: true },
      ],
      note: 'After <code>free(p)</code>, p still holds 0x5a10 — a <em>dangling pointer</em>. The allocator may hand that memory to the next malloc, use it for bookkeeping, or return it to the OS. Reading or writing through p is UB; the classic symptom is corruption that surfaces far away from the bug.',
    },
    q2: { type: 'quiz', q: 'Which of these is <em>well-defined</em> in C?', opts: ['<code>unsigned u = UINT_MAX; u + 1</code>', '<code>int i = INT_MAX; i + 1</code>', '<code>int a[3]; a[3]</code>', '<code>char *s = "hi"; s[0] = \'H\';</code>'], a: 0, expl: 'Unsigned arithmetic wraps modulo 2ⁿ by definition — u + 1 is exactly 0. The others are all UB: signed overflow, out-of-bounds read, and writing a string literal.' },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'A colleague says: "I tested it — signed overflow just wraps on my machine, so I rely on it." What\'s wrong with this reasoning?',
      answer: '<p>They observed one compiler, one flag set, one day. UB has no contract, so the observation predicts nothing: enable <code>-O2</code>, upgrade GCC, or inline the function into a new context, and the optimizer may assume the overflow never happens and restructure the code (see <code>wraps.c</code>). "Works today" is precisely how UB bugs incubate. If wrapping is wanted, use <code>unsigned</code>, or check limits <em>before</em> the operation.</p>',
    },
    code3: {
      type: 'code', title: 'buggy.c — let the sanitizers point at the crime',
      code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int a[3] = { 1, 2, 3 };
    int sum = 0;
    for (int i = 0; i <= 3; i++)    /* off by one! */
        sum += a[i];
    printf("%d\\n", sum);

    int *p = malloc(sizeof *p);
    free(p);
    *p = 5;                          /* use after free! */
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc -g -fsanitize=address,undefined buggy.c && ./a.out
buggy.c:8:16: runtime error: index 3 out of bounds for type 'int [3]'
=================================================================
==4242==ERROR: AddressSanitizer: heap-use-after-free on address
    0x602000000010 ... WRITE of size 4 at buggy.c:13
    freed by thread T0 here: #1 main buggy.c:12
# file and line of the bug AND of the free — debugging on easy mode` },
    q3: { type: 'quiz', q: 'Your program works at <code>-O0</code> but misbehaves at <code>-O2</code>. The most likely culprit is…', opts: ['A bug in the optimizer', 'Undefined behavior in your code that the optimizer\'s assumptions exposed', '-O2 changes the C standard', 'Insufficient RAM for optimized code'], a: 1, expl: 'Compiler bugs exist but are rare; UB is everywhere. Optimization doesn\'t create the bug — it acts on the "UB never happens" assumption your code violated. First move: rebuild with -fsanitize=undefined and listen.' },
    ed: {
      type: 'editor', label: 'Exercise: exterminate the UB',
      height: 340,
      code: `#include <stdio.h>
#include <stdlib.h>

/* This program contains THREE instances of undefined behavior.
   Find and fix all of them. */

int main(void) {
    int scores[5] = { 90, 85, 77, 92, 88 };

    int sum;                          /* bug 1: ??? */
    for (int i = 1; i <= 5; i++)      /* bug 2: ??? */
        sum += scores[i];

    printf("avg = %d\\n", sum / 5);

    int *copy = malloc(5 * sizeof *copy);
    free(copy);
    copy[0] = scores[0];              /* bug 3: ??? */
    free(copy);                       /* ...and a bonus 4th! */
    return 0;
}`,
      hint: 'Bug 1: sum never initialized (int sum = 0;). Bug 2: loop reads scores[5] and skips scores[0] — use i = 0; i < 5. Bug 3: write after free — move the free below the use. Bonus: double free — delete the extra free. Expected: avg = 86.',
    },
  },
});
