/* ============================================================
   Part 8 — Compiler & Toolchain Mastery
   ============================================================ */

/* ---------------- compilation pipeline ---------------- */
CT.lesson({
  id: 'compilation-pipeline',
  title: 'The pipeline, under the microscope',
  minutes: 15, xp: 130,
  tags: 'preprocessor assembler linker object file elf nm objdump -E -S -c save-temps',
  why: `<p>Some errors from <code>gcc</code> make no sense however long you stare at your code — "undefined reference to ..." points at nothing you can see. That's because <code>gcc</code> is really four programs running a relay — the same four-step journey you met back in Part 0 — and the complaint came from a different runner than the one you were watching. Stop the race at every handoff — exactly what you'll do in this lesson — and you'll always know which program to blame, and you'll get to read the actual instructions your CPU executes.</p>`,
  html: `
<p>Way back in Part 0 you learned that <code>gcc hello.c</code> is secretly four programs in a trench coat. You've now written every kind of C there is — time to pop the hood for real. This lesson you'll <em>stop the pipeline at every stage</em>, read the assembly gcc produces (the human-readable spelling of your CPU's instructions), and dissect an object file — the halfway-there binary gcc normally hides — byte by byte.</p>

<div data-w="flow1"></div>

<h2>Stopping the assembly line wherever you like</h2>
<p>GCC has a flag to halt after each stage — and one to keep every intermediate file:</p>
<table>
<tr><th>flag</th><th>stops after</th><th>output</th></tr>
<tr><td><code>-E</code></td><td>preprocessing</td><td>expanded source on stdout (<code>.i</code>)</td></tr>
<tr><td><code>-S</code></td><td>compilation proper</td><td>assembly text (<code>.s</code>)</td></tr>
<tr><td><code>-c</code></td><td>assembling</td><td>object file (<code>.o</code>)</td></tr>
<tr><td><code>-save-temps</code></td><td>nothing — runs it all</td><td>keeps <code>.i</code>, <code>.s</code>, <code>.o</code> <em>and</em> the executable</td></tr>
</table>

<div data-w="term1"></div>

<p>That <code># 4 "hello.c"</code> line is a <em>linemarker</em> — it's how the compiler still reports errors against <b>your</b> file and line numbers even though it's actually chewing through 700+ lines of expanded headers. The preprocessor's whole output is just text; nothing has parsed your C yet.</p>

<div data-w="q1"></div>

<h2>Reading the compiler's mind: <code>-S</code></h2>
<p>Here's a tiny function, and what <code>gcc -S -O1 -masm=intel</code> turns it into (Intel syntax reads nicer than the default AT&amp;T: destination first, no <code>%</code> sigils):</p>
<div data-w="code1"></div>
<div data-w="code2"></div>
<p>Three instructions, no stack frame, no ceremony. The x86-64 calling convention (System V) passes the first two integer arguments in <code>edi</code> and <code>esi</code>, and the return value travels back in <code>eax</code> — so <code>ret</code> alone is the whole "return statement". Note the compiler's cheeky trick: <code>lea</code> ("load effective address") is an <em>address calculator</em>, abused here to do an addition and write the result to a third register in one instruction.</p>

<div data-w="rev1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Do this constantly:</b> <a href="https://godbolt.org">Compiler Explorer (godbolt.org)</a> shows the assembly for your C live as you type, with source lines color-matched to instructions, across dozens of compilers and versions. It is the single best tool for building intuition about what compilers actually do. Bookmark it.</p></div></div>

<h2>Inside an object file</h2>
<p>After <code>gcc -c</code>, you hold an ELF <em>relocatable</em> object file: real machine code, plus a <b>symbol table</b> saying what it defines and what it still needs. Two classic tools crack it open — <code>objdump -d</code> disassembles, <code>nm</code> lists symbols:</p>
<div data-w="term2"></div>
<div data-w="term3"></div>
<p>Read <code>nm</code>'s middle column: <code>T</code> = defined in the text (code) section, <code>U</code> = <b>undefined</b> — a promise the linker must fulfill. Unlike C++, C does no name mangling: the function <code>square_add</code> becomes the symbol <code>square_add</code>, verbatim (C++ would emit something like <code>_Z10square_addii</code> to encode the parameter types — one reason C is the universal glue language for libraries).</p>

<div data-w="q2"></div>

<h2>ELF sections: the memory map, foreshadowed</h2>
<p>Remember the stack/heap/data/text map from the memory-model lesson? It's not an accident — the linker builds the executable out of named <b>sections</b> that the OS loader maps straight into those segments:</p>
<div data-w="term4"></div>
<ul>
<li><code>.text</code> — your machine code, mapped read+execute.</li>
<li><code>.rodata</code> — string literals and <code>const</code> data, read-only (writing to it segfaults — <em>this</em> is why modifying a string literal crashes).</li>
<li><code>.data</code> — initialized globals; their bytes are stored in the file.</li>
<li><code>.bss</code> — zero-initialized globals; note the type <code>NOBITS</code>: it occupies <b>zero bytes on disk</b> and is conjured as zeroed pages at load time.</li>
</ul>

<div data-w="q3"></div>

<h2>Try it yourself</h2>
<div data-w="ed1"></div>

<p>You can now watch the pipeline work — next, let's learn to <b>steer</b> it with the GCC flags every C programmer should know by heart.</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'gcc hello.c -o hello — the full journey', colw: 210, rowh: 92,
      nodes: [
        { id: 'src', col: 0, row: 0, kind: 'start', label: 'hello.c\nsource text' },
        { id: 'pp', col: 0, row: 1, kind: 'proc', label: 'preprocessor (cpp)\n#include, macros' },
        { id: 'cc', col: 0, row: 2, kind: 'proc', label: 'compiler (cc1)\nparse, optimize' },
        { id: 'as', col: 0, row: 3, kind: 'proc', label: 'assembler (as)\ntext → machine code' },
        { id: 'lib', col: 1, row: 2, kind: 'io', label: 'libc.so / crt*.o\nother .o files' },
        { id: 'ld', col: 1, row: 3, kind: 'proc', label: 'linker (ld)\nresolve symbols' },
        { id: 'exe', col: 1, row: 4, kind: 'end', label: './hello\nELF executable' },
      ],
      edges: [
        { from: 'src', to: 'pp', label: '' },
        { from: 'pp', to: 'cc', label: 'hello.i  (-E)' },
        { from: 'cc', to: 'as', label: 'hello.s  (-S)' },
        { from: 'as', to: 'ld', label: 'hello.o  (-c)' },
        { from: 'lib', to: 'ld', label: '' },
        { from: 'ld', to: 'exe', label: '' },
      ],
      note: 'Each arrow label is a file format — and the flag in parentheses stops the pipeline right there.',
    },
    term1: {
      type: 'term', title: 'poking each stage', text: `$ gcc -E hello.c | wc -l
731
# 731 lines! stdio.h and friends, fully pasted in. Your code is at the bottom:
$ gcc -E hello.c | tail -4
# 4 "hello.c"
int main(void) {
    printf("Hello, World!\\n");
    return 0;
}
$ gcc -save-temps hello.c -o hello
$ ls hello*
hello  hello.c  hello.i  hello.o  hello.s`
    },
    q1: { type: 'quiz', q: 'Which file does <code>gcc -S hello.c</code> produce, and what is in it?', opts: ['hello.i — preprocessed C', 'hello.s — human-readable assembly', 'hello.o — machine code', 'hello — a runnable executable'], a: 1, expl: '<code>-S</code> stops after the compiler proper: you get assembly text. Mnemonic: capital -S = .s file, lowercase -c = compile to object.' },
    code1: {
      type: 'code', title: 'square_add.c',
      code: `int square_add(int a, int b) {
    return a * a + b;
}`
    },
    code2: {
      type: 'code', title: 'square_add.s — gcc -S -O1 -masm=intel', run: false,
      code: `square_add:
        imul    edi, edi          ; edi = a * a   (a arrived in edi)
        lea     eax, [rdi+rsi]    ; eax = a*a + b (b arrived in esi)
        ret                       ; result returns in eax`
    },
    rev1: { type: 'reveal', label: 'Think first', q: 'What single instruction do you think <code>-O2</code> emits for the body of <code>int times5(int x) { return x * 5; }</code>? (Hint: multiplication is slower than address arithmetic…)', answer: '<p><code>lea eax, [rdi+rdi*4]</code> — "address" = x + x*4 = 5x, computed by the address-generation unit in one cycle. No <code>imul</code> at all. Compilers strength-reduce multiplications by small constants into <code>lea</code>/shift combinations; check it on godbolt.org!</p>' },
    term2: {
      type: 'term', title: 'objdump -d: disassembly', text: `$ gcc -c -O1 square_add.c
$ objdump -d -M intel square_add.o

square_add.o:     file format elf64-x86-64

Disassembly of section .text:

0000000000000000 <square_add>:
   0:   0f af ff                imul   edi,edi
   3:   8d 04 37                lea    eax,[rdi+rsi]
   6:   c3                      ret
# left column: the actual bytes. imul edi,edi IS the bytes 0f af ff.`
    },
    term3: {
      type: 'term', title: 'nm: the symbol table', text: `$ gcc -c -O1 demo.c        # demo.c calls printf and square_add
$ nm demo.o
0000000000000000 T main
                 U printf
                 U square_add
# T = defined here (text section), U = undefined: the linker's to-do list.
$ gcc demo.o -o demo
/usr/bin/ld: demo.o: in function \`main':
demo.c:(.text+0x16): undefined reference to \`square_add'
collect2: error: ld returned 1 exit status
# forgot to link square_add.o — every U must be resolved!`
    },
    q2: { type: 'quiz', q: 'In <code>nm</code> output, what does <code>U printf</code> mean?', opts: ['printf is unused and will be removed', 'printf is defined here but unexported', 'printf is referenced here but defined elsewhere — the linker must resolve it', 'printf is an uninitialized variable'], a: 2, expl: 'U = undefined symbol: this object uses it but doesn’t contain it. The linker searches other objects and libraries (libc, for printf) to patch in the real address.' },
    term4: {
      type: 'term', title: 'readelf -S (abridged)', text: `$ readelf -S hello | grep -E '\\.text|\\.rodata|\\.data|\\.bss'
  [16] .text      PROGBITS   0000000000001060  00001060  000000f5
  [18] .rodata    PROGBITS   0000000000002000  00002000  00000012
  [24] .data      PROGBITS   0000000000004010  00003010  00000008
  [25] .bss       NOBITS     0000000000004018  00003018  00000fa8
# .bss is NOBITS: 4000 bytes of zeros that cost 0 bytes of disk.`
    },
    q3: { type: 'quiz', q: 'The string literal in <code>printf("Hello, World!\\n")</code> ends up in which ELF section?', opts: ['.text', '.rodata', '.data', '.bss'], a: 1, expl: 'String literals are read-only data → .rodata, mapped without write permission. That’s the mechanical reason why <code>char *s = "hi"; s[0] = ’H’;</code> segfaults.' },
    ed1: {
      type: 'editor', label: 'Exercise: feed the pipeline', height: 300,
      code: `#include <stdio.h>

int square_add(int a, int b) {
    return a * a + b;
}

int main(void) {
    printf("%d\\n", square_add(6, 7));
    return 0;
}`,
      hint: 'Predict the output, then run it. On your own machine, try: gcc -save-temps square_add.c, then open the .i and .s files — find your printf call in both. Then paste square_add into godbolt.org at -O0 vs -O2 and compare.'
    },
  },
});

/* ---------------- gcc flags ---------------- */
CT.lesson({
  id: 'gcc-flags',
  title: 'GCC flags worth knowing by heart',
  minutes: 14, xp: 130,
  tags: 'wall wextra werror std c17 c23 optimization O2 O3 Os Og debug -g sanitize march include lib define',
  why: `<p>The example file in this lesson contains two genuine bugs, and plain <code>gcc</code> compiles it without a single complaint. Add four flags and the compiler points at both broken lines before you ever run the program. A handful of well-chosen flags is the closest thing you'll get to a free expert reviewing every line you write — this lesson makes them muscle memory.</p>`,
  html: `
<p>GCC accepts <em>hundreds</em> of options. You need maybe twenty — but those twenty are the difference between a professional build and a bug factory. Let's tour them by job: warnings, standards, optimization, debugging, and the everyday plumbing (naming output files, finding headers and libraries).</p>

<h2>Warnings: free code review, on by request</h2>
<p>By default GCC is scandalously quiet. Fix that — always:</p>
<ul>
<li><code>-Wall</code> — the "sensible warnings" set (badly named: it's nowhere near <em>all</em>).</li>
<li><code>-Wextra</code> — more good ones: unused parameters, signed/unsigned comparisons…</li>
<li><code>-Wpedantic</code> — complain about anything that isn't strictly ISO C.</li>
<li><code>-Werror</code> — promote warnings to errors. Great for your own code; be careful forcing it on code you distribute (new compiler versions add new warnings and break the build).</li>
</ul>
<p>Two underrated gems: <code>-Wshadow</code> (an inner variable hides an outer one — a silent logic-bug generator) and <code>-Wconversion</code> (implicit conversions that can lose data). Watch them catch two real bugs:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>Which C? <code>-std=</code></h2>
<p>GCC defaults to a GNU dialect (currently <code>gnu17</code> on most installs). Pin it explicitly: <code>-std=c17</code> for portable ISO C, <code>-std=c23</code> for the shiny new stuff from Part 5, or <code>-std=gnu17</code> to opt into GNU extensions (next lesson!). The museum piece <code>-ansi</code> means <code>-std=c90</code> — you'll meet it in old build scripts.</p>

<h2>Optimization levels: the speed dial</h2>
<table>
<tr><th>flag</th><th>meaning</th><th>trade-off</th></tr>
<tr><td><code>-O0</code></td><td>default — no optimization</td><td>fast compiles, faithful line-by-line debugging, slow code</td></tr>
<tr><td><code>-Og</code></td><td>optimize, but keep debuggable</td><td>the sweet spot for development builds</td></tr>
<tr><td><code>-O1</code></td><td>basic optimizations</td><td>rarely used directly</td></tr>
<tr><td><code>-O2</code></td><td>full optimization, no size explosion</td><td><b>the production standard</b></td></tr>
<tr><td><code>-O3</code></td><td>-O2 + aggressive inlining/vectorization</td><td>sometimes faster, sometimes bigger &amp; slower — measure!</td></tr>
<tr><td><code>-Os</code></td><td>optimize for size</td><td>embedded targets, cache-bound code</td></tr>
</table>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Same source, 3× faster — the optimizer kept <code>sum</code> in a register, unrolled the loop, and used vector divides. Add <code>-march=native</code> and GCC may also use every instruction <em>your</em> CPU supports (AVX2, FMA…) — great for code that runs where it's built, wrong for binaries you ship to older machines.</p>

<div data-w="q2"></div>
<div data-w="rev1"></div>

<h2>Debug info and sanitizers</h2>
<p><code>-g</code> embeds DWARF debug info — the tables mapping machine code back to your source lines and variable names. Without it, gdb shows you raw addresses. It does <b>not</b> slow the program down; it just makes the file bigger. There is never a reason to omit <code>-g</code> during development.</p>
<p><code>-fsanitize=address,undefined</code> compiles in runtime detectives that catch buffer overflows, use-after-free, signed overflow and friends the moment they happen. They're the star of the debugging-tools lesson — for now, know that the flag exists and belongs in your dev builds.</p>

<h2>The plumbing flags</h2>
<table>
<tr><th>flag</th><th>does</th><th>example</th></tr>
<tr><td><code>-o file</code></td><td>name the output</td><td><code>gcc app.c -o app</code> (default is the immortal <code>a.out</code>)</td></tr>
<tr><td><code>-DNAME[=val]</code></td><td>define a macro from the command line</td><td><code>-DDEBUG -DVERSION=3</code></td></tr>
<tr><td><code>-Idir</code></td><td>add a directory to the <code>#include</code> search path</td><td><code>-Iinclude/</code></td></tr>
<tr><td><code>-Ldir</code></td><td>add a directory to the library search path</td><td><code>-Lbuild/lib</code></td></tr>
<tr><td><code>-lname</code></td><td>link against lib<i>name</i></td><td><code>-lm</code> → libm, the math library</td></tr>
</table>
<div data-w="term3"></div>

<div data-w="q3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Your everyday invocation</b> — make it muscle memory (or a shell alias):<br><code>gcc -std=c17 -Wall -Wextra -Wshadow -g -Og program.c -o program</code><br>Ship with <code>-O2</code> and keep <code>-g</code> anyway — you can strip symbols later, but you can't conjure them back when a core dump lands on your desk.</p></div></div>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>Clang compatibility:</b> nearly every flag on this page works identically in Clang — <code>clang -std=c17 -Wall -Wextra -O2</code> just works. The two compilers deliberately share a command-line dialect, so learning one is learning both. Clang's error messages are famously friendly; try both on the same buggy file some day.</p></div></div>

<h2>Practice</h2>
<div data-w="ed1"></div>

<p>Flags configure the <em>standard</em> compiler — but GCC also speaks a whole private dialect of C, and that's where we go next.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'warn.c — compiles silently with plain gcc!', hl: [6, 14],
      code: `#include <stdio.h>

int total(const int *a, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        int sum = a[i];        /* oops: shadows outer sum */
        sum += sum;
    }
    return sum;                /* always returns 0        */
}

int main(void) {
    double celsius = 36.6;
    int rounded = celsius;     /* silently truncates to 36 */
    int arr[] = {1, 2, 3};
    printf("%d %d\\n", total(arr, 3), rounded);
    return 0;
}`
    },
    term1: {
      type: 'term', text: `$ gcc warn.c -o warn          # not a peep!
$ gcc -Wall -Wextra -Wshadow -Wconversion warn.c -o warn
warn.c: In function 'total':
warn.c:6:13: warning: declaration of 'sum' shadows a previous declaration [-Wshadow]
    6 |         int sum = a[i];
      |             ^~~
warn.c:4:9: note: shadowed declaration is here
    4 |     int sum = 0;
      |         ^~~
warn.c: In function 'main':
warn.c:14:19: warning: conversion from 'double' to 'int' may change value [-Wfloat-conversion]
   14 |     int rounded = celsius;
      |                   ^~~~~~~
# two genuine bugs, found for free.`
    },
    q1: { type: 'quiz', q: 'What does <code>-Werror</code> do?', opts: ['Enables every warning GCC knows', 'Turns all warnings into hard compile errors', 'Prints warnings in red', 'Warns about error-handling bugs'], a: 1, expl: 'It promotes warnings to errors so nobody can ignore them. Combine it with -Wall -Wextra in your own projects — but think twice before forcing it on downstream users, since future GCC versions add new warnings.' },
    code2: {
      type: 'code', title: 'bench.c — 200 million divisions',
      code: `#include <stdio.h>

int main(void) {
    double sum = 0.0;
    for (long i = 1; i <= 200000000L; i++)
        sum += 1.0 / (double)i;
    printf("%f\\n", sum);
    return 0;
}`
    },
    term2: {
      type: 'term', title: 'the speed dial, measured', text: `$ gcc -O0 bench.c -o bench0 && time ./bench0
19.691044
real    0m1.98s
$ gcc -O2 bench.c -o bench2 && time ./bench2
19.691044
real    0m0.61s
$ gcc -O2 -march=native bench.c -o benchN && time ./benchN
19.691044
real    0m0.42s
# same answer every time — only the speed changes.`
    },
    q2: { type: 'quiz', q: 'You are stepping through code in gdb and variables keep showing <code>&lt;optimized out&gt;</code>. Best flag combo for your dev builds?', opts: ['-O3 -g', '-O0 alone', '-Og -g', '-Os -Werror'], a: 2, expl: '-Og optimizes only in ways that don’t wreck the debugging experience, and -g provides the source mapping. -O3 aggressively deletes/merges variables; -O0 alone works too but lacks debug info without -g.' },
    rev1: { type: 'reveal', label: 'Think first', q: 'With <code>-O2</code>, what does GCC compile <code>return x * 8;</code> into — an <code>imul</code>?', answer: '<p>No — a single left shift: <code>lea eax, [0+rdi*8]</code> (or <code>sal eax, 3</code>). Multiplying by a power of two is just shifting bits left, and the compiler knows it. This is why micro-optimizing <code>x &lt;&lt; 3</code> by hand in source buys you nothing but unreadable code: write <code>x * 8</code> and let -O2 do its job.</p>' },
    term3: {
      type: 'term', title: '-D, -I, -l in the wild', text: `$ cat version.c
#include <stdio.h>
#include <math.h>
int main(void) {
#ifdef DEBUG
    fprintf(stderr, "debug build v%d\\n", VERSION);
#endif
    printf("sqrt(2) = %f\\n", sqrt(2));
    return 0;
}
$ gcc -DDEBUG -DVERSION=3 version.c -o version -lm
$ ./version
debug build v3
sqrt(2) = 1.414214
# no -DDEBUG?  The #ifdef block simply vanishes at preprocess time.`
    },
    q3: { type: 'quiz', q: 'What does <code>-Iinclude/</code> do?', opts: ['Links the library "include"', 'Adds include/ to the directories searched for <code>#include</code> headers', 'Installs headers into include/', 'Ignores all headers in include/'], a: 1, expl: 'Capital -I extends the header search path (used by the preprocessor). Its sibling -L extends the library search path, and lowercase -l names an actual library to link. Three different letters, three different stages.' },
    ed1: {
      type: 'editor', label: 'Exercise: earn a clean build', height: 320,
      code: `#include <stdio.h>

/* This compiles — but it is full of warnings waiting to be enabled.
   Fix it so that -Wall -Wextra -Wshadow would be perfectly silent. */
int sum_upto(int n) {
    int total = 0;
    for (int i = 0; i <= n; i++) {
        int total = i;         /* shadow bug: loop adds nothing */
        total += total;
    }
    return total;
}

int main(void) {
    printf("1..10 sums to %d\\n", sum_upto(10));   /* should be 55 */
    return 0;
}`,
      hint: 'Delete the inner declaration so the loop updates the OUTER total (total += i;). Expected output: 55. Then recompile mentally with -Wshadow: any survivors?'
    },
  },
});

/* ---------------- gcc extensions ---------------- */
CT.lesson({
  id: 'gcc-extensions',
  title: 'The GNU dialect: __attribute__ and friends',
  minutes: 16, xp: 140,
  tags: 'attribute packed aligned constructor cleanup typeof statement expression computed goto builtin_expect popcount flexible array nested functions case ranges gnu17',
  why: `<p>Linux — the system inside every Android phone and most of the internet's servers — isn't written in quite the C you've been learning. It's written in GCC's souped-up version of the language, and since that's what <code>gcc</code> compiles by default, you've been using it without knowing. Learn its extra powers and you can read real operating-system source, run code before <code>main()</code> even starts, and pack a struct with no wasted bytes between its fields.</p>`,
  html: `
<p>Compile with <code>-std=gnu17</code> (GCC's default!) and you're not writing standard C — you're writing <b>GNU C</b>, a dialect stacked with decades of extensions: extra powers the official standard never adopted. The Linux kernel is written in it. Some extensions were so good they became standard C; others remain gloriously nonportable (use them and your code only builds with GCC or Clang). Let's tour the greatest hits.</p>

<h2><code>__attribute__((...))</code>: annotations with teeth</h2>
<p>Attributes bolt extra semantics onto declarations. The layout-changing ones first:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p><code>packed</code> deletes the padding you learned about in the structs lesson — 5 bytes instead of 8. The price: <code>value</code> is now misaligned, so access is slower on x86 and can outright <b>fault</b> on some ARM cores. Use it for wire formats and file headers, not general data. <code>aligned(16)</code> goes the other way — over-aligning for SIMD or cache-line purposes.</p>

<p>Then the behavioral ones — these run code or move warnings around:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<ul>
<li><code>constructor</code> / <code>destructor</code> — run before <code>main</code> / after <code>exit</code>. Libraries use these for self-registration.</li>
<li><code>deprecated("msg")</code> — every caller gets a compile-time warning with your message.</li>
<li><code>unused</code> — suppresses the unused-variable warning on purpose-built spares.</li>
<li><code>format(printf, 1, 2)</code> — teaches GCC that <em>your</em> function takes printf-style formats, so <code>-Wall</code> type-checks its arguments. Any logging function you write deserves this.</li>
<li><code>cleanup(fn)</code> — calls <code>fn(&var)</code> automatically when the variable leaves scope. Poor man's destructors: systemd builds all its resource management on this.</li>
</ul>

<div data-w="q1"></div>

<h2><code>typeof</code> and statement expressions: macros grow up</h2>
<p>Two extensions that team up to make macros hygienic:</p>
<div data-w="code3"></div>
<p><code>typeof(x)</code> gives you the <em>type</em> of an expression — so the macro works for <code>int</code>, <code>double</code>, pointers, anything. The <code>({ ... })</code> <b>statement expression</b> lets a block produce a value (its last expression), giving the macro local variables so <code>a</code> and <code>b</code> are evaluated exactly once — <code>MAX(x++, y)</code> is finally safe. This duo was so useful that <b>C23 standardized <code>typeof</code></b>; statement expressions remain GNU-only.</p>

<div data-w="q2"></div>

<h2>Computed goto: <code>&&label</code></h2>
<p>GNU C lets you take the <em>address of a label</em> with <code>&amp;&amp;label</code>, store it in a <code>void *</code>, and jump to it with <code>goto *ptr;</code>. That sounds unhinged until you write an interpreter — it's the classic "threaded dispatch" technique used by real VMs (CPython used a giant switch until it adopted computed goto for a measurable speedup):</p>
<div data-w="code4"></div>
<div data-w="term4"></div>
<div data-w="rev1"></div>

<h2>Builtins: talking to the optimizer</h2>
<div data-w="code5"></div>
<div data-w="term5"></div>
<p><code>__builtin_expect</code> tells the compiler which branch is the common case so it lays out the hot path fall-through-first — you've seen the kernel's <code>likely()</code>/<code>unlikely()</code> macros; this is all they are. The bit-counting builtins compile to single instructions (<code>popcnt</code>, <code>lzcnt</code>, <code>tzcnt</code>) where the CPU has them. C23 finally standardized this family as <code>&lt;stdbit.h&gt;</code> (<code>stdc_count_ones</code> and friends).</p>

<h2>Odds and ends worth recognizing</h2>
<div data-w="code6"></div>
<ul>
<li><b>Flexible array members</b> — a struct ending in <code>char data[];</code> sized at <code>malloc</code> time. This one is <em>fully standard</em> since C99 (GCC's older zero-length <code>data[0]</code> spelling is the extension). The single best way to allocate a header plus payload in one block.</li>
<li><b>Case ranges</b> — <code>case '0' ... '9':</code> in a switch. Pure GNU sugar; note the spaces around <code>...</code> are required.</li>
<li><b>Nested functions</b> — a function inside a function, able to see the enclosing locals. GCC-only and controversial: taking a pointer to one forces GCC to generate a <em>trampoline on the stack</em>, historically requiring an executable stack — a security hole. Clang refuses to implement them. Know they exist; don't use them.</li>
</ul>

<div data-w="q3"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Portability discipline:</b> every use of a GNU extension is a promise that your code only builds with GCC/Clang. Guard the optional ones: <code>#ifdef __GNUC__</code> … <code>#else</code> provide a plain-C fallback <code>#endif</code>. And know which dialect you're compiling: <code>-std=c17</code> disables some extensions and defines <code>__STRICT_ANSI__</code>, while <code>-std=gnu17</code> keeps them all on.</p></div></div>

<h2>Practice</h2>
<div data-w="ed1"></div>

<p>One extension we skipped deserves an entire lesson: embedding raw assembly in your C — let's go there now.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'layout.c',
      code: `#include <stdio.h>

struct normal { char tag; int value; };                       /* padded  */
struct __attribute__((packed)) tight { char tag; int value; };/* crammed */
struct vec { float x, y, z, w; } __attribute__((aligned(16)));

int main(void) {
    printf("normal : %zu bytes\\n", sizeof(struct normal));
    printf("packed : %zu bytes\\n", sizeof(struct tight));
    printf("aligned: %zu, _Alignof = %zu\\n",
           sizeof(struct vec), _Alignof(struct vec));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc -std=gnu17 layout.c -o layout && ./layout
normal : 8 bytes
packed : 5 bytes
aligned: 16, _Alignof = 16` },
    code2: {
      type: 'code', title: 'attribs.c', hl: [3, 8, 12],
      code: `#include <stdio.h>

__attribute__((constructor))
static void before_main(void) {
    puts("constructor: I run before main!");
}

__attribute__((deprecated("use greet_v2() instead")))
static void greet(void) { puts("hello (old api)"); }

/* teach -Wall to type-check OUR format function */
__attribute__((format(printf, 1, 2)))
static void logf_(const char *fmt, ...);

int main(void) {
    greet();                 /* warning arrives at compile time */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -std=gnu17 -Wall attribs.c -o attribs
attribs.c: In function 'main':
attribs.c:16:5: warning: 'greet' is deprecated: use greet_v2() instead [-Wdeprecated-declarations]
   16 |     greet();
      |     ^~~~~
$ ./attribs
constructor: I run before main!
hello (old api)` },
    q1: { type: 'quiz', q: 'What is the cost of <code>__attribute__((packed))</code>?', opts: ['The struct becomes read-only', 'Members may be misaligned — slower access, and faults on some CPUs', 'It only works on global structs', 'sizeof stops working'], a: 1, expl: 'Packing removes padding, so multi-byte members land on odd addresses. x86 tolerates that (slower); some ARM/embedded cores trap. Reserve packed for matching external byte layouts like network packets and file headers.' },
    code3: {
      type: 'code', title: 'maxmacro.c',
      code: `#include <stdio.h>

/* typeof + statement expression = a MAX that is type-generic
   AND evaluates each argument exactly once */
#define MAX(a, b) ({        \\
    typeof(a) _a = (a);     \\
    typeof(b) _b = (b);     \\
    _a > _b ? _a : _b;      \\
})

int main(void) {
    int i = 3;
    printf("%d\\n", MAX(i++, 2));        /* i++ happens ONCE  */
    printf("i is now %d\\n", i);
    printf("%.2f\\n", MAX(2.5, 1.0/3));  /* works for doubles */
    return 0;
}`
    },
    q2: { type: 'quiz', q: 'Which GNU extension was adopted into standard C23?', opts: ['statement expressions <code>({ ... })</code>', 'computed goto <code>&&label</code>', '<code>typeof</code>', 'nested functions'], a: 2, expl: 'C23 standardized typeof (and typeof_unqual). Statement expressions, computed goto, and nested functions remain compiler extensions — the first two widely supported by GCC and Clang, the last GCC-only.' },
    code4: {
      type: 'code', title: 'vm.c — a 3-opcode virtual machine', hl: [4, 7],
      code: `#include <stdio.h>

int run(const int *prog) {
    static void *ops[] = { &&op_halt, &&op_inc, &&op_dbl };
    int acc = 0, pc = 0;

    goto *ops[prog[pc]];                 /* dispatch!            */
op_inc:  acc += 1; goto *ops[prog[++pc]];
op_dbl:  acc *= 2; goto *ops[prog[++pc]];
op_halt: return acc;
}

int main(void) {
    int prog[] = {1, 1, 2, 2, 1, 0};     /* inc inc dbl dbl inc halt */
    printf("result: %d\\n", run(prog));
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc -std=gnu17 vm.c -o vm && ./vm
result: 9
# ((0+1+1) * 2 * 2) + 1 = 9 — each opcode jumps STRAIGHT to the next,
# no central switch, no bounds re-check: that's threaded dispatch.` },
    rev1: { type: 'reveal', label: 'Think first', q: 'What is the type of <code>&&op_halt</code>, and why can a plain <code>switch</code> not be compiled this efficiently?', answer: '<p><code>&amp;&amp;label</code> has type <code>void *</code>. A <code>switch</code> funnels every iteration through one central jump, so the CPU’s branch predictor sees a single chaotic indirect branch. With computed goto, each opcode’s handler ends in its <em>own</em> jump, giving the predictor per-opcode history — measurably faster in interpreter loops (this is why CPython adopted it).</p>' },
    code5: {
      type: 'code', title: 'builtins.c',
      code: `#include <stdio.h>

#define likely(x)   __builtin_expect(!!(x), 1)
#define unlikely(x) __builtin_expect(!!(x), 0)

int main(void) {
    unsigned v = 0x00FF00F0u;
    printf("popcount(v) = %d\\n", __builtin_popcount(v));
    printf("clz(v)      = %d\\n", __builtin_clz(v));  /* leading zeros  */
    printf("ctz(v)      = %d\\n", __builtin_ctz(v));  /* trailing zeros */

    int fd = 3;                     /* imagine: result of open() */
    if (unlikely(fd < 0)) {
        fprintf(stderr, "open failed\\n");
        return 1;
    }
    puts("hot path laid out fall-through-first");
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc -std=gnu17 -O2 builtins.c -o builtins && ./builtins
popcount(v) = 12
clz(v)      = 8
ctz(v)      = 4
hot path laid out fall-through-first
# with -O2 -march=native, popcount compiles to ONE popcnt instruction.` },
    code6: {
      type: 'code', title: 'grabbag.c', run: false,
      code: `/* flexible array member — STANDARD since C99 */
struct message {
    size_t len;
    char   data[];            /* sized at malloc time            */
};
/* struct message *m = malloc(sizeof *m + len); */

/* case ranges — GNU only (mind the spaces around ...) */
const char *classify(char c) {
    switch (c) {
    case '0' ... '9':               return "digit";
    case 'a' ... 'z': case 'A' ... 'Z': return "letter";
    default:                        return "other";
    }
}

/* nested function — GCC only; pointer to it needs a stack
   trampoline (historically: executable stack). Avoid. */
int sum3(int a, int b, int c) {
    int add(int x, int y) { return x + y; }   /* sees a,b,c too */
    return add(add(a, b), c);
}`
    },
    q3: { type: 'quiz', q: 'Why do nested functions have a bad reputation even among GNU-extension fans?', opts: ['They cannot access enclosing variables', 'Taking their address needs a stack trampoline, historically forcing an executable stack', 'They only work at -O0', 'They are slower than macros'], a: 1, expl: 'A pointer to a nested function must carry the enclosing frame, so GCC writes a tiny code stub (“trampoline”) onto the stack — which then must be executable, weakening a key exploit mitigation. Clang never implemented them.' },
    ed1: {
      type: 'editor', label: 'Exercise: build a MIN to match MAX', height: 320,
      code: `#include <stdio.h>

#define MAX(a, b) ({        \\
    typeof(a) _a = (a);     \\
    typeof(b) _b = (b);     \\
    _a > _b ? _a : _b;      \\
})

/* YOUR TURN: write MIN(a,b) the same way, then CLAMP(x, lo, hi)
   built from MIN and MAX. */

int main(void) {
    printf("MAX(3, 7)        = %d\\n", MAX(3, 7));
    /* printf("MIN(3, 7)        = %d\\n", MIN(3, 7));        */
    /* printf("CLAMP(12, 0, 9) = %d\\n", CLAMP(12, 0, 9));   */
    return 0;
}`,
      hint: 'MIN is MAX with the comparison flipped. CLAMP(x,lo,hi) = MIN(MAX(x,lo),hi) — expected outputs: 3 and 9. Bonus: why do the underscored names _a/_b protect against MAX(a, _a)-style capture bugs… and when do they not?'
    },
  },
});

/* ---------------- inline assembly ---------------- */
CT.lesson({
  id: 'inline-assembly',
  title: 'Inline assembly: when C must step aside',
  minutes: 16, xp: 140,
  tags: 'asm volatile extended constraints clobbers rdtsc syscall intrinsics immintrin',
  why: `<p>How do benchmarking tools time code more precisely than any stopwatch? They ask the CPU itself how many ticks have passed — using an instruction that C has no words for. Today you'll learn to smuggle raw CPU instructions into ordinary C, and as a finale you'll print text by talking straight to the operating system, with zero help from any library.</p>`,
  html: `
<p>Sometimes you need an instruction C simply cannot express: read the CPU's cycle counter (the chip's own tick-counting clock), ask the processor what features it supports, or call the operating system directly with no library in between. GCC's <b>extended asm</b> lets you drop assembly into a C function — with the compiler still deciding which registers your values live in. Honest advice up front: you will need this <em>almost never</em>, and intrinsics — friendlier function-shaped versions of special instructions, covered below — are usually saner. But understanding it beats blindly pasting snippets from forums, and it teaches you how the compiler really thinks.</p>

<h2>Anatomy: four sections, separated by colons</h2>
<div data-w="flow1"></div>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Read it like a contract with the compiler: "here's a template; put these C values in registers for me; I'll leave results in those; and by the way, I also trash these." The <code>%0</code>, <code>%1</code>, <code>%2</code> in the template are the operands, numbered in the order listed — outputs first. GCC picks the actual registers, then pastes the template into its own output. It <b>never parses your assembly</b> — it trusts the contract completely, which is exactly why lying in the contract causes spectacular bugs.</p>

<h2>The constraint mini-language</h2>
<table>
<tr><th>constraint</th><th>meaning</th></tr>
<tr><td><code>r</code></td><td>any general-purpose register</td></tr>
<tr><td><code>m</code></td><td>a memory operand (the variable's address)</td></tr>
<tr><td><code>i</code></td><td>an immediate (compile-time constant)</td></tr>
<tr><td><code>a d S D</code></td><td>specifically rax, rdx, rsi, rdi (x86)</td></tr>
<tr><td><code>=</code> prefix</td><td>write-only output</td></tr>
<tr><td><code>+</code> prefix</td><td>read <em>and</em> written</td></tr>
<tr><td><code>"cc" / "memory"</code> clobbers</td><td>"I modify the flags" / "I read-write memory you don't see"</td></tr>
</table>

<div data-w="q1"></div>

<h2>Real example: reading the timestamp counter</h2>
<p>x86's <code>rdtsc</code> returns a 64-bit cycle count split across <code>edx:eax</code> — those fixed registers are why we need the <code>a</code> and <code>d</code> constraints:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<h2><code>volatile</code>, or: the optimizer versus your asm</h2>
<p>GCC treats an asm statement like any expression: <b>if its outputs are unused, it deletes it; if inputs are unchanged inside a loop, it hoists it out</b>. That's catastrophic for <code>rdtsc</code> (same "time" every iteration!) or an I/O port write with no outputs at all. <code>asm volatile</code> means "this has side effects you can't see — execute it exactly as written, every time". Rule of thumb: reading a value that changes behind the compiler's back, or causing any side effect → <code>volatile</code>. Pure computation like our <code>lea</code> add → leave it off and let the optimizer schedule it.</p>

<div data-w="rev1"></div>
<div data-w="q2"></div>

<h2>Full thrill: a raw Linux syscall</h2>
<p>Let's call <code>write(1, msg, len)</code> with no libc at all. The Linux x86-64 ABI: syscall number in <code>rax</code> (1 = write), args in <code>rdi, rsi, rdx</code>; the <code>syscall</code> instruction itself clobbers <code>rcx</code> and <code>r11</code>:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<p>The <code>"memory"</code> clobber is essential: it tells GCC the kernel <em>reads</em> the buffer, so the stores initializing <code>msg</code> must actually happen before the syscall instead of being reordered or dead-store-eliminated.</p>

<div data-w="q3"></div>

<h2>The saner alternative: intrinsics</h2>
<p>For 95% of "I need this one instruction" cases, GCC and Clang ship <b>intrinsics</b> — plain C functions that compile to the instruction, with the compiler fully aware of their semantics (so optimization stays safe, no constraint contracts to get wrong):</p>
<div data-w="code4"></div>
<p><code>&lt;immintrin.h&gt;</code> is the umbrella header for the whole x86 SIMD universe (SSE/AVX). If you find yourself writing more than a handful of asm lines, you almost certainly want intrinsics — or to just check godbolt and discover the compiler already emits what you wanted.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The classic inline-asm bug:</b> forgetting a clobber. If your asm modifies a register you didn't declare, GCC may keep a live value there — and your function corrupts a random variable, but only at <code>-O2</code>, only sometimes. Undeclared side effects are UB by contract. When in doubt: more clobbers, or use an intrinsic.</p></div></div>

<h2>Practice</h2>
<div data-w="ed1"></div>

<p>You can now out-argue the compiler instruction by instruction — next we zoom back out and automate whole builds with <code>make</code>.</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'asm ( template : outputs : inputs : clobbers )', colw: 250, rowh: 88,
      nodes: [
        { id: 't', col: 0, row: 0, kind: 'start', label: '"lea (%1,%2), %0"\nassembler template' },
        { id: 'o', col: 0, row: 1, kind: 'proc', label: ': "=r"(sum)\noutputs — written to C vars' },
        { id: 'i', col: 0, row: 2, kind: 'proc', label: ': "r"(a), "r"(b)\ninputs — read from C vars' },
        { id: 'c', col: 0, row: 3, kind: 'proc', label: ': "cc", "memory"\nclobbers — what else I trash' },
        { id: 'g', col: 1, row: 1, kind: 'io', label: 'GCC assigns\nreal registers' },
        { id: 'out', col: 1, row: 3, kind: 'end', label: 'template pasted\ninto .s output' },
      ],
      edges: [
        { from: 't', to: 'o' }, { from: 'o', to: 'i' }, { from: 'i', to: 'c' },
        { from: 'o', to: 'g', label: '%0' }, { from: 'g', to: 'out' }, { from: 'c', to: 'out' },
      ],
      note: '%0, %1, %2 refer to the operands in listed order, outputs first. GCC substitutes registers and pastes — it never reads the assembly itself.',
    },
    code1: {
      type: 'code', title: 'asmadd.c', hl: [5, 6, 7],
      code: `#include <stdio.h>

int main(void) {
    int a = 40, b = 2, sum;
    __asm__ ("lea (%1,%2), %0"     /* sum = a + b, the scenic way */
             : "=r"(sum)           /* output: any register, write-only */
             : "r"(a), "r"(b));    /* inputs: any registers            */
    printf("%d\\n", sum);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc asmadd.c -o asmadd && ./asmadd
42
$ gcc -S -O2 asmadd.c && grep -A1 lea asmadd.s
        lea (%eax,%edx), %ecx
# GCC chose eax, edx, ecx for %1, %2, %0 — our template, its registers.` },
    q1: { type: 'quiz', q: 'In an output constraint, what is the difference between <code>"=r"</code> and <code>"+r"</code>?', opts: ['= is x86, + is ARM', '= means write-only; + means the asm both reads and writes the operand', '+ allows two registers', '= makes the operand const'], a: 1, expl: 'With "=r" GCC assumes the old value is irrelevant and may hand you a register full of garbage to overwrite. If your asm reads the value first (like "add %1, %0" does with %0), you must say "+r" — or the bug only shows up at -O2.' },
    code2: {
      type: 'code', title: 'rdtsc.c', hl: [6],
      code: `#include <stdio.h>
#include <stdint.h>

static uint64_t rdtsc(void) {
    uint32_t lo, hi;
    __asm__ __volatile__ ("rdtsc" : "=a"(lo), "=d"(hi));
    return ((uint64_t)hi << 32) | lo;
}

int main(void) {
    uint64_t t0 = rdtsc();
    for (volatile int i = 0; i < 1000; i++)
        ;
    uint64_t t1 = rdtsc();
    printf("~%llu cycles for 1000 empty iterations\\n",
           (unsigned long long)(t1 - t0));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -O2 rdtsc.c -o rdtsc && ./rdtsc
~3708 cycles for 1000 empty iterations
$ ./rdtsc
~3652 cycles for 1000 empty iterations
# varies run to run — you are watching the actual silicon clock.` },
    rev1: { type: 'reveal', label: 'Think first', q: 'Remove <code>__volatile__</code> from the <code>rdtsc()</code> function and compile with <code>-O2</code>. What can go wrong?', answer: '<p>GCC sees two calls to a "pure-looking" asm with identical (empty) inputs — so it may compute it once and reuse the value, or reorder it across the loop. Result: <code>t1 - t0 == 0</code>, or a measurement of nothing. <code>volatile</code> pins each execution in place. (For serious benchmarking you’d also add barriers, since the CPU itself reorders — <code>rdtscp</code> or <code>lfence</code> — but that’s a performance-engineering rabbit hole.)</p>' },
    q2: { type: 'quiz', q: 'An asm statement with no outputs and no <code>volatile</code>, compiled at -O2, will typically be…', opts: ['executed once at program start', 'deleted entirely as dead code', 'a compile error', 'run in a separate thread'], a: 1, expl: 'No outputs used + not volatile = no observable effect, as far as GCC knows — so the optimizer removes it, exactly as it would remove an unused variable. Any asm executed purely for its side effects must be volatile.' },
    code3: {
      type: 'code', title: 'rawwrite.c', hl: [7, 8, 9],
      code: `int main(void) {
    const char msg[] = "hello from a raw syscall\\n";
    long ret;

    /* write(fd=1, buf=msg, count=sizeof msg - 1) */
    __asm__ __volatile__ (
        "syscall"
        : "=a"(ret)                       /* return value in rax  */
        : "a"(1),                         /* rax = 1  -> write    */
          "D"(1),                         /* rdi = fd 1 (stdout)  */
          "S"(msg),                       /* rsi = buffer         */
          "d"(sizeof msg - 1)             /* rdx = length         */
        : "rcx", "r11", "memory");        /* syscall trashes these */

    return ret == (long)(sizeof msg - 1) ? 0 : 1;
}`
    },
    term3: { type: 'term', text: `$ gcc -O2 rawwrite.c -o rawwrite && ./rawwrite
hello from a raw syscall
$ echo $?
0
$ strace ./rawwrite 2>&1 | grep ^write
write(1, "hello from a raw syscall\\n", 25) = 25
# strace confirms: one write syscall, no printf, no libc buffering.` },
    q3: { type: 'quiz', q: 'Why must the raw-syscall example list <code>"memory"</code> in its clobbers?', opts: ['syscalls always allocate memory', 'It tells GCC the asm reads/writes memory it can’t see, so pending stores to <code>msg</code> must be flushed first', 'It reserves stack space for the kernel', 'Without it the program cannot link'], a: 1, expl: 'GCC only knows the asm touches the listed operands. The kernel reads the buffer through a pointer, which GCC can’t see from the template — "memory" forces all memory writes to complete before the asm and stops caching across it.' },
    code4: {
      type: 'code', title: 'intrinsics.c — the civilized route',
      code: `#include <stdio.h>
#include <x86intrin.h>       /* pulls in immintrin.h + friends */

int main(void) {
    unsigned long long t0 = __rdtsc();      /* our whole rdtsc()  */
    int bits = _popcnt32(0x00FF00F0);       /* one popcnt insn    */
    unsigned long long t1 = __rdtsc();

    printf("popcount = %d (measured in %llu cycles)\\n",
           bits, t1 - t0);
    return 0;
}`
    },
    ed1: {
      type: 'editor', label: 'Exercise: rewrite the contract', height: 300,
      code: `#include <stdio.h>

int main(void) {
    int a = 50, b = 8, result;

    /* This computes a + b. Change it to compute a - b using
       "sub %2, %0" — careful: sub READS AND WRITES %0, so the
       output constraint must become "+r" and 'result' must
       hold a's value before the asm runs. */
    __asm__ ("lea (%1,%2), %0"
             : "=r"(result)
             : "r"(a), "r"(b));

    printf("%d\\n", result);   /* goal: print 42 */
    return 0;
}`,
      hint: 'Set result = a; first, then asm("sub %1, %0" : "+r"(result) : "r"(b) : "cc"); — note the clobber: sub modifies the flags. Expected output: 42. If you leave "=r", why might it still *appear* to work at -O0?'
    },
  },
});

/* ---------------- makefiles ---------------- */
CT.lesson({
  id: 'makefiles',
  title: 'Makefiles: builds that rebuild themselves',
  minutes: 15, xp: 130,
  tags: 'make makefile target prerequisite recipe tab CFLAGS pattern rule phony clean MMD dependency graph -j cmake',
  why: `<p>Download almost any big project — a game engine, Python, Linux itself — and building it is one command: <code>make</code>. Behind that magic is a 50-year-old tool you can learn in one sitting. Once you have, your own multi-file projects rebuild only the files you actually changed — the habit that keeps a recompile at two seconds instead of twenty minutes as a codebase grows.</p>`,
  html: `
<p>Your projects are no longer one file. Recompiling <em>everything</em> after each edit is slow, and a shell script that always rebuilds all of it is no better — it doesn't know what changed. <b>make</b> (born 1976, still everywhere) solves exactly this: you declare which files depend on which, and it rebuilds <em>only what's out of date</em>, by comparing file timestamps.</p>

<h2>Our project: three files</h2>
<p>A little calculator split the way you learned in the header-organization lesson:</p>
<div data-w="code0"></div>
<div data-w="flow1"></div>

<h2>Anatomy of a rule</h2>
<p>A Makefile is a list of rules, each saying: this <b>target</b> is built from these <b>prerequisites</b> using this <b>recipe</b>:</p>
<div data-w="code1"></div>
<p>The logic when you run <code>make app</code>: if <code>app</code> is missing, or <em>older</em> than any prerequisite, run the recipe — after recursively ensuring each prerequisite is itself up to date. That's the entire algorithm. Timestamps in, minimal rebuilds out.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>THE TAB TRAP.</b> Recipe lines must start with a real <b>TAB character</b> — not spaces. Ever. This is make's most infamous design decision (its author kept it to avoid breaking his ten existing users… in 1976). If your editor converts tabs to spaces you get the cryptic classic:<br><code>Makefile:5: *** missing separator.  Stop.</code><br>Configure your editor to keep literal tabs in Makefiles.</p></div></div>

<div data-w="q1"></div>

<h2>First run, then the magic</h2>
<div data-w="term1"></div>
<p>Touch one source file and only <em>two</em> commands run — recompile that object, relink. Touch nothing and make proudly does nothing. On a project with 2,000 files this is the difference between 2 seconds and 20 minutes.</p>

<h2>Variables and automatic variables</h2>
<p>Version 1 repeats itself badly. Make has variables (<code>CC</code>, <code>CFLAGS</code> are conventions the whole world uses) and <b>automatic variables</b> that mean "the current rule's parts":</p>
<table>
<tr><th>variable</th><th>means</th></tr>
<tr><td><code>$@</code></td><td>the target</td></tr>
<tr><td><code>$&lt;</code></td><td>the <em>first</em> prerequisite</td></tr>
<tr><td><code>$^</code></td><td><em>all</em> prerequisites (deduplicated)</td></tr>
</table>
<div data-w="code2"></div>
<p>The <code>%.o: %.c</code> <b>pattern rule</b> says: any <code>.o</code> is built from the matching <code>.c</code> like so — one rule replaces a rule per file. And <code>.PHONY</code> marks <code>all</code>/<code>clean</code> as command names, not files: without it, a file literally named <code>clean</code> in your directory would make <code>make clean</code> report "up to date" and do nothing.</p>

<div data-w="q2"></div>

<h2>The header problem — and its modern fix</h2>
<p>Subtle bug in v2: edit <code>calc.h</code> and… nothing rebuilds! Make only knows the dependencies you declare, and we declared none on headers. Hand-listing them rots instantly. The modern fix: ask <b>GCC itself</b> to emit dependency files as a side effect of compiling (<code>-MMD -MP</code> produce a <code>.d</code> makefile-fragment per object), then include them:</p>
<div data-w="code3"></div>
<div data-w="term2"></div>

<div data-w="q3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Free speed:</b> <code>make -j8</code> builds up to 8 targets in parallel — the dependency graph tells make exactly which compiles are independent. <code>make -j$(nproc)</code> uses every core. This is why declaring dependencies honestly matters: the graph <em>is</em> the parallelism.</p></div></div>

<h2>Beyond make</h2>
<p>Big projects today usually generate their build instead of hand-writing it: <b>CMake</b> and <b>Meson</b> describe the project at a higher level and emit Makefiles (or the faster Ninja) for any platform, handling dependency discovery and cross-compilation. They're worth learning eventually — but they generate exactly the concepts you just learned, so none of this knowledge is wasted; it's the assembly language of build systems.</p>

<p>Your build now takes care of itself — time to master the tools for when the <em>program</em> misbehaves: gdb, valgrind, and the sanitizers.</p>
`,
  widgets: {
    code0: {
      type: 'code', title: 'the project', run: false,
      code: `/* calc.h — shared interface */
int add(int a, int b);
int mul(int a, int b);

/* calc.c — implementation: includes calc.h */
/* main.c — CLI:            includes calc.h */`
    },
    flow1: {
      type: 'flow', label: 'the dependency graph make walks', colw: 200, rowh: 88,
      nodes: [
        { id: 'mc', col: 0, row: 0, kind: 'io', label: 'main.c' },
        { id: 'h', col: 1, row: 0, kind: 'io', label: 'calc.h' },
        { id: 'cc', col: 2, row: 0, kind: 'io', label: 'calc.c' },
        { id: 'mo', col: 0, row: 1, kind: 'proc', label: 'main.o' },
        { id: 'co', col: 2, row: 1, kind: 'proc', label: 'calc.o' },
        { id: 'app', col: 1, row: 2, kind: 'end', label: 'app\n(linked binary)' },
      ],
      edges: [
        { from: 'mc', to: 'mo' }, { from: 'h', to: 'mo', label: '#include' },
        { from: 'h', to: 'co', label: '#include' }, { from: 'cc', to: 'co' },
        { from: 'mo', to: 'app' }, { from: 'co', to: 'app' },
      ],
      note: 'Edit calc.c → only calc.o and app rebuild. Edit calc.h → BOTH objects rebuild (if make knows about the arrows — see the -MMD section).',
    },
    code1: {
      type: 'code', title: 'Makefile — version 1 (explicit)', run: false,
      code: `app: main.o calc.o
	gcc main.o calc.o -o app

main.o: main.c calc.h
	gcc -Wall -c main.c -o main.o

calc.o: calc.c calc.h
	gcc -Wall -c calc.c -o calc.o

# target: prerequisites
# <TAB>   recipe  — that indent is a REAL tab character!`
    },
    q1: { type: 'quiz', q: '<code>make</code> prints <code>Makefile:5: *** missing separator.  Stop.</code> — what is almost certainly wrong?', opts: ['A missing semicolon on line 5', 'The recipe line is indented with spaces instead of a tab', 'The target has no prerequisites', 'make is not installed correctly'], a: 1, expl: 'The most famous error in build-system history: recipes MUST begin with a literal TAB. Editors that auto-convert tabs to spaces silently break Makefiles; most have a Makefile mode that preserves tabs.' },
    term1: {
      type: 'term', title: 'incremental rebuilds in action', text: `$ make
gcc -Wall -c main.c -o main.o
gcc -Wall -c calc.c -o calc.o
gcc main.o calc.o -o app
$ make
make: 'app' is up to date.
$ touch calc.c              # pretend we edited it
$ make
gcc -Wall -c calc.c -o calc.o
gcc main.o calc.o -o app
# main.o untouched — make compared timestamps and skipped it.`
    },
    code2: {
      type: 'code', title: 'Makefile — version 2 (variables + patterns)', run: false, hl: [6, 9],
      code: `CC     := gcc
CFLAGS := -std=c17 -Wall -Wextra -g
OBJS   := main.o calc.o

app: $(OBJS)
	$(CC) $^ -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

.PHONY: all clean
all: app
clean:
	rm -f app $(OBJS)`
    },
    q2: { type: 'quiz', q: 'In the rule <code>app: $(OBJS)</code> with recipe <code>$(CC) $^ -o $@</code>, what do <code>$^</code> and <code>$@</code> expand to?', opts: ['$^ = app, $@ = main.o calc.o', '$^ = main.o calc.o, $@ = app', '$^ = the first prerequisite, $@ = all of them', 'both expand to the Makefile name'], a: 1, expl: '$@ is the target (app), $^ is all prerequisites (main.o calc.o), and $< would be just the first one — which is why pattern rules use $< to name the single .c file.' },
    code3: {
      type: 'code', title: 'Makefile — final version (auto-dependencies)', run: false, hl: [2, 11],
      code: `CC     := gcc
CFLAGS := -std=c17 -Wall -Wextra -g -MMD -MP
OBJS   := main.o calc.o

app: $(OBJS)
	$(CC) $^ -o $@

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

-include $(OBJS:.o=.d)

.PHONY: clean
clean:
	rm -f app $(OBJS) $(OBJS:.o=.d)`
    },
    term2: {
      type: 'term', title: 'gcc writes the dependencies for us', text: `$ make
gcc -std=c17 -Wall -Wextra -g -MMD -MP -c main.c -o main.o
gcc -std=c17 -Wall -Wextra -g -MMD -MP -c calc.c -o calc.o
gcc main.o calc.o -o app
$ cat main.d
main.o: main.c calc.h
calc.h:
$ touch calc.h && make      # NOW header edits are seen:
gcc -std=c17 -Wall -Wextra -g -MMD -MP -c main.c -o main.o
gcc -std=c17 -Wall -Wextra -g -MMD -MP -c calc.c -o calc.o
gcc main.o calc.o -o app`
    },
    q3: { type: 'quiz', q: 'Without <code>-MMD</code>-style dependency tracking, what happens when you edit only a header file?', opts: ['make rebuilds everything, wastefully', 'make errors out', 'Nothing rebuilds — you run stale objects compiled from the old header', 'Only the linker reruns'], a: 2, expl: 'Make only follows declared arrows. If no rule lists calc.h as a prerequisite, editing it changes nothing make checks — and you debug a "bug" that is really a stale .o file. The -MMD/-MP + -include idiom fixes this permanently.' },
  },
});

/* ---------------- debugging tools ---------------- */
CT.lesson({
  id: 'debugging-tools',
  title: 'The debugging arsenal: gdb, valgrind & sanitizers',
  minutes: 16, xp: 140,
  tags: 'gdb breakpoint backtrace valgrind memcheck leak asan ubsan sanitizer analyzer clang-tidy strace core dump segfault',
  why: `<p>"Segmentation fault (core dumped)" — no line number, no hint, no mercy. You've almost certainly met that message already, and staring harder at the code was your only move. The tools in this lesson turn the same crash into a report naming the exact line that blew up, the line that freed the memory, and the line that allocated it — most bug hunts end in under a minute once you know which tool to reach for.</p>`,
  html: `
<p>Every C bug you'll ever hunt falls into a few classes — crashes, leaks, scribbled-over memory, wrong answers — and each class has a purpose-built tool that finds it in seconds. This lesson is your armory tour. Rule zero applies to all of them: <b>compile with <code>-g</code></b>, or every tool speaks in raw memory addresses instead of your source lines.</p>

<h2>printf debugging, done properly</h2>
<p>No shame in it — but do it right:</p>
<div data-w="code1"></div>
<p>Why <code>stderr</code>? It's <b>unbuffered</b>: output appears immediately. <code>stdout</code> is buffered, so when your program crashes, its last buffered lines <em>die with it</em> — and you end up debugging the wrong location because the final printf "never printed". If you must use stdout, <code>fflush(stdout)</code> after each probe.</p>

<h2>gdb: the time machine</h2>
<p>This program crashes. Watch a real session find the bug in five commands:</p>
<div data-w="code2"></div>
<div data-w="term1"></div>
<p>The crash is <em>in</em> <code>strlen</code>, but the <b>bug</b> is in frame #2: our loop condition <code>i &lt;= 3</code> walks past the <code>NULL</code> terminator of the array. <code>backtrace</code> + <code>frame</code> + <code>print</code> is the core gdb workflow — you'll use those three more than everything else combined. Honorable mentions: <code>break file:line</code>, <code>next</code> (step over) vs <code>step</code> (step into), <code>watch var</code> (break when a variable changes), and <code>run &lt; input.txt</code>.</p>
<p>Even better: if your system saves <b>core dumps</b> (<code>ulimit -c unlimited</code>, or via systemd-coredump), you can autopsy a crash after the fact with <code>gdb ./crash core</code> — same backtrace, no need to reproduce it live.</p>

<div data-w="q1"></div>

<h2>valgrind: the memory auditor</h2>
<p>Valgrind's memcheck runs your <em>unmodified binary</em> in a CPU emulator, tracking every byte of heap. Leaks, use of uninitialized values, bad frees — nothing escapes (at ~20× slowdown):</p>
<div data-w="code3"></div>
<div data-w="term2"></div>
<p>Read the verdicts like a coroner: <b>definitely lost</b> = leaked, no pointer to it remains — fix these. <b>still reachable</b> = a global still points at it at exit — untidy but usually harmless. The stack trace shows the <em>allocation</em> site: valgrind tells you where the leaked memory was born, and your job is to find where it should have died.</p>

<div data-w="q2"></div>

<h2>Sanitizers: valgrind's speed-demon cousins</h2>
<p>AddressSanitizer (ASan) and UndefinedBehaviorSanitizer (UBSan) are <em>compiled into</em> the binary — only ~2× slowdown, and they catch things valgrind can't (stack overflows! signed overflow!). This is the flag you met in the gcc-flags lesson, now in action on a use-after-free:</p>
<div data-w="code4"></div>
<div data-w="term3"></div>
<p>Three stack traces: where the bad access happened, where the memory was freed, and where it was allocated. That's usually the whole investigation, done. Run your test suite under <code>-fsanitize=address,undefined</code> routinely — many teams gate every merge on it.</p>

<div data-w="q3"></div>

<h2>Before it even runs: static analysis</h2>
<p>GCC's <code>-fanalyzer</code> explores paths through your code at compile time and narrates bugs like a detective novel — double frees, NULL derefs, leaks — complete with a numbered path of events. <code>clang-tidy</code> does the same from the Clang world, plus style checks. They produce false positives; treat them as a very sharp code review, not a verdict. And when the mystery is "what is my program even <em>doing</em> with the OS?", <code>strace ./app</code> prints every syscall — the tool of choice for "why can't it find my config file?" (answer: it's opening a path you didn't expect).</p>

<h2>Which tool for which bug?</h2>
<div data-w="flow1"></div>
<table>
<tr><th>symptom</th><th>reach for</th></tr>
<tr><td>segfault / crash</td><td>ASan first (best report), gdb for interactive digging, core dump for post-mortem</td></tr>
<tr><td>memory leak</td><td>valgrind <code>--leak-check=full</code>, or ASan's leak checker (on by default at exit)</td></tr>
<tr><td>heisenbug / wrong values at -O2 only</td><td>UBSan — it's almost always undefined behavior</td></tr>
<tr><td>wrong answer, no crash</td><td>gdb breakpoints + <code>watch</code>, strategic stderr printf</td></tr>
<tr><td>weird interaction with OS/files</td><td>strace</td></tr>
<tr><td>bug not written yet</td><td><code>-Wall -Wextra</code>, <code>-fanalyzer</code>, clang-tidy</td></tr>
</table>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Don't stack them:</b> ASan and valgrind fight over the same memory tricks — run one or the other, never both on the same binary. And keep a plain <code>-g -Og</code> build around: sanitizer binaries are for hunting, not shipping.</p></div></div>

<h2>Practice</h2>
<div data-w="ed1"></div>

<p>One tool family remains — the linker's — and with it, the final lesson of the course: building and using libraries.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'dbg.h — a printf-debugging macro worth keeping',
      code: `#include <stdio.h>

/* stderr (unbuffered!) + file, line, and the expression itself */
#define DBG(fmt, ...) \\
    fprintf(stderr, "[%s:%d] " fmt "\\n", __FILE__, __LINE__, __VA_ARGS__)

int main(void) {
    int balance = 100, price = 30;
    for (int i = 0; i < 3; i++) {
        balance -= price;
        DBG("i=%d balance=%d", i, balance);
    }
    printf("final: %d\\n", balance);
    return 0;
}`
    },
    code2: {
      type: 'code', title: 'crash.c — spot the bug before gdb does', hl: [11],
      code: `#include <stdio.h>
#include <string.h>

int length_of(const char *s) {
    return (int)strlen(s);
}

int main(void) {
    const char *words[] = {"alpha", "beta", NULL};
    int total = 0;
    for (int i = 0; i <= 3; i++)          /* hmm... */
        total += length_of(words[i]);
    printf("total = %d\\n", total);
    return 0;
}`
    },
    term1: {
      type: 'term', title: 'a real gdb session', text: `$ gcc -g -Og crash.c -o crash
$ gdb -q ./crash
Reading symbols from ./crash...
(gdb) run
Program received signal SIGSEGV, Segmentation fault.
__strlen_avx2 () at ../sysdeps/x86_64/multiarch/strlen-avx2.S:74
(gdb) backtrace
#0  __strlen_avx2 () at ../sysdeps/x86_64/multiarch/strlen-avx2.S:74
#1  0x0000555555555151 in length_of (s=0x0) at crash.c:5
#2  0x0000555555555185 in main () at crash.c:12
(gdb) frame 2                # jump to OUR code
#2  0x0000555555555185 in main () at crash.c:12
12          total += length_of(words[i]);
(gdb) print i
$1 = 2
(gdb) print words[i]
$2 = 0x0
# i=2 is the NULL sentinel — the loop bound <= 3 is the bug.
(gdb) quit`
    },
    q1: { type: 'quiz', q: 'The gdb backtrace bottoms out inside <code>__strlen_avx2</code>. Where should you look for the bug?', opts: ['In glibc’s strlen — file a bug report', 'In the innermost frame only', 'Walk up the backtrace to the first frame that is YOUR code, and inspect its variables', 'Nowhere — backtraces are unreliable after SIGSEGV'], a: 2, expl: 'Library code is almost never the culprit — it faithfully crashed on the garbage we fed it (a NULL pointer). "frame N" up to your own code, then print the local variables: that is the standard segfault autopsy.' },
    code3: {
      type: 'code', title: 'leak.c', hl: [13],
      code: `#include <stdlib.h>
#include <string.h>

char *dup_string(const char *s) {
    char *copy = malloc(strlen(s) + 1);
    strcpy(copy, s);
    return copy;              /* caller owns this... supposedly */
}

int main(void) {
    for (int i = 0; i < 3; i++) {
        char *c = dup_string("hello");
        (void)c;              /* ...but nobody frees it */
    }
    return 0;
}`
    },
    term2: {
      type: 'term', title: 'valgrind memcheck', text: `$ gcc -g leak.c -o leak
$ valgrind --leak-check=full ./leak
==41337== Memcheck, a memory error detector
==41337== Command: ./leak
==41337==
==41337== HEAP SUMMARY:
==41337==     in use at exit: 18 bytes in 3 blocks
==41337==   total heap usage: 3 allocs, 0 frees, 18 bytes allocated
==41337==
==41337== 18 bytes in 3 blocks are definitely lost in loss record 1 of 1
==41337==    at 0x48468F3: malloc (in vgpreload_memcheck-amd64-linux.so)
==41337==    by 0x109162: dup_string (leak.c:5)
==41337==    by 0x1091A6: main (leak.c:12)
==41337==
==41337== LEAK SUMMARY:
==41337==    definitely lost: 18 bytes in 3 blocks
==41337==    indirectly lost: 0 bytes in 0 blocks
==41337==      possibly lost: 0 bytes in 0 blocks
==41337== ERROR SUMMARY: 1 errors from 1 contexts` },
    q2: { type: 'quiz', q: 'Valgrind reports <code>definitely lost: 18 bytes in 3 blocks</code> allocated at <code>dup_string (leak.c:5)</code>. What does the location tell you?', opts: ['Line 5 is where you must add free()', 'Where the leaked memory was allocated — you still must find where it should have been freed', 'The exact line where the pointer was overwritten', 'That malloc itself is buggy'], a: 1, expl: 'Valgrind can only know the birthplace of the block. The fix belongs wherever ownership ends — here, main’s loop should free(c) each iteration. Freeing inside dup_string would return dangling memory!' },
    code4: {
      type: 'code', title: 'uaf.c — use after free', hl: [7],
      code: `#include <stdlib.h>

int main(void) {
    int *p = malloc(4 * sizeof(int));
    p[0] = 42;
    free(p);
    return p[0];              /* reading freed memory: UB */
}`
    },
    term3: {
      type: 'term', title: 'AddressSanitizer report', text: `$ gcc -g -fsanitize=address,undefined uaf.c -o uaf
$ ./uaf
=================================================================
==5124==ERROR: AddressSanitizer: heap-use-after-free on address
0x604000000010 at pc 0x55e2f52412a1 bp 0x7ffc3c3f5b20
READ of size 4 at 0x604000000010 thread T0
    #0 0x55e2f52412a0 in main uaf.c:7
freed by thread T0 here:
    #0 0x7f1c2bcb6642 in free
    #1 0x55e2f5241264 in main uaf.c:6
previously allocated by thread T0 here:
    #0 0x7f1c2bcb78a7 in malloc
    #1 0x55e2f5241234 in main uaf.c:4
SUMMARY: AddressSanitizer: heap-use-after-free uaf.c:7 in main
# accessed at line 7, freed at line 6, born at line 4. Case closed.` },
    q3: { type: 'quiz', q: 'Which bug can AddressSanitizer catch that valgrind memcheck fundamentally cannot?', opts: ['heap buffer overflow', 'stack buffer overflow', 'memory leak', 'use of uninitialized heap memory'], a: 1, expl: 'ASan instruments the code at compile time, so it plants red zones around STACK arrays too. Valgrind works on unmodified binaries and can’t see stack frame layout — stack smashes sail right past it. (Uninitialized reads are the reverse: memcheck’s specialty, not ASan’s.)' },
    flow1: {
      type: 'flow', label: 'triage: pick your weapon', colw: 220, rowh: 90,
      nodes: [
        { id: 'bug', col: 0, row: 0, kind: 'start', label: 'program misbehaves' },
        { id: 'crash', col: 0, row: 1, kind: 'dec', label: 'crashes?' },
        { id: 'asan', col: 1, row: 1, kind: 'proc', label: 'rebuild with ASan/UBSan\nthen gdb if needed' },
        { id: 'leak', col: 0, row: 2, kind: 'dec', label: 'memory grows?' },
        { id: 'vg', col: 1, row: 2, kind: 'proc', label: 'valgrind\n--leak-check=full' },
        { id: 'wrong', col: 0, row: 3, kind: 'proc', label: 'wrong output:\ngdb break/watch + DBG()' },
      ],
      edges: [
        { from: 'bug', to: 'crash' },
        { from: 'crash', to: 'asan', label: 'yes' },
        { from: 'crash', to: 'leak', label: 'no' },
        { from: 'leak', to: 'vg', label: 'yes' },
        { from: 'leak', to: 'wrong', label: 'no' },
      ],
      note: 'And for "it works at -O0 but not -O2": that is UBSan’s cue — the optimizer is exploiting undefined behavior in your code.',
    },
    ed1: {
      type: 'editor', label: 'Exercise: stop the leak', height: 320,
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *dup_string(const char *s) {
    char *copy = malloc(strlen(s) + 1);
    if (!copy) return NULL;
    strcpy(copy, s);
    return copy;
}

int main(void) {
    char *joined = NULL;
    for (int i = 0; i < 3; i++) {
        char *c = dup_string("hello ");
        printf("%s", c);
        /* FIX 1: this copy is never freed */
    }
    printf("\\n");
    /* FIX 2: 'joined' hints at a bigger refactor — ignore it,
       it is a red herring, but do remove the unused variable. */
    return 0;
}`,
      hint: 'Add free(c); after the printf, and delete the unused joined variable. Mental check: run it under valgrind in your head — "3 allocs, 3 frees, 0 bytes lost". On your machine, verify with: gcc -g -fsanitize=address leak.c && ./a.out'
    },
  },
});

/* ---------------- linking & libraries ---------------- */
CT.lesson({
  id: 'linking-libraries',
  title: 'Libraries: static, shared & shipping your code',
  minutes: 16, xp: 140,
  tags: 'static shared library ar rcs fPIC so ldd rpath LD_LIBRARY_PATH ldconfig pkg-config visibility linker order',
  why: `<p>To draw graphics, compress files, or store data the way real apps do, your program needs code other people wrote — a library — and the first time you try, you'll meet two of the most-Googled error messages in all of C: "undefined reference" and "cannot open shared object file". By the end of this final lesson you'll fix both on sight, and you'll know how to package your own code so other programmers can build on it.</p>`,
  html: `
<p>Every C program you've ever run uses libraries — you've been linking against libc, the library that holds <code>printf</code>, since <code>hello.c</code>. In this final lesson you cross to the other side: <b>building</b> libraries, understanding how the two flavors load, and mastering the linker quirks that generate the internet's most-asked C questions.</p>

<h2>Two flavors of library</h2>
<div data-w="flow1"></div>
<table>
<tr><th></th><th>static <code>.a</code></th><th>shared <code>.so</code></th></tr>
<tr><td>what it is</td><td>an <code>ar</code> archive of <code>.o</code> files</td><td>a real ELF binary, position-independent</td></tr>
<tr><td>when resolved</td><td>at link time — code <em>copied into</em> your executable</td><td>at load time — by the dynamic loader <code>ld.so</code></td></tr>
<tr><td>result</td><td>bigger, self-contained binary</td><td>small binary, one lib shared by all processes</td></tr>
<tr><td>library updates</td><td>need relink to pick up fixes</td><td>fix the .so, every program benefits at next launch</td></tr>
</table>

<h2>Building libmymath, both ways</h2>
<p>Our library is two files — <code>mymath.h</code> (the contract) and <code>mymath.c</code> (the goods):</p>
<div data-w="code1"></div>
<p><b>Static</b> is charmingly low-tech — an archive of object files, made with <code>ar</code>:</p>
<div data-w="term1"></div>
<p><b>Shared</b> needs position-independent code (<code>-fPIC</code>) because the .so may land at any address in any process — remember ASLR from the memory lessons:</p>
<div data-w="term2"></div>
<p>That runtime error is the rite of passage: the linker found <code>libmymath.so</code> at <em>build</em> time (thanks to <code>-L.</code>), but the dynamic loader doesn't search your project directory at <em>run</em> time. Three fixes, in increasing order of permanence: <code>LD_LIBRARY_PATH</code> (quick test), an <b>rpath</b> baked into the binary (<code>-Wl,-rpath,'$ORIGIN'</code> = "look next to the executable"), or install to <code>/usr/local/lib</code> and run <code>ldconfig</code> to refresh the loader's cache.</p>

<div data-w="q1"></div>

<h2><code>ldd</code>: who do you depend on?</h2>
<div data-w="term3"></div>

<h2>The linking-order trap</h2>
<p>The single most-Googled linker error is self-inflicted:</p>
<div data-w="term4"></div>
<p>Why? The linker scans left to right, keeping a list of unresolved symbols. When it meets a library, it takes <em>only</em> the members that satisfy the list <em>so far</em> — then moves on and never looks back. <code>-lmymath</code> before <code>main.c</code> means: "any needs? no? moving on" — and by the time <code>main.o</code> asks for <code>square</code>, the library is behind us. <b>Rule: objects first, then <code>-l</code> flags, with libraries after the code that needs them.</b> (This is also why <code>-lm</code> traditionally goes last.)</p>

<div data-w="q2"></div>

<h2>Using any third-party library: the universal recipe</h2>
<p>Every C library on Earth is consumed the same two-part way — <b>header for the compiler, lib for the linker</b>:</p>
<div data-w="code2"></div>
<div data-w="term5"></div>
<p><code>pkg-config</code> is the standard directory service: installed libraries register their flags, and you splice them in with shell substitution. No more guessing include paths.</p>

<h2>Symbol visibility: a library's public face</h2>
<p>By default, <em>every</em> non-<code>static</code> function in your .so is exported — your internal helpers become someone's load-bearing dependency. Professionals flip the default with <code>-fvisibility=hidden</code>, then explicitly mark the API:</p>
<div data-w="code3"></div>
<p>Smaller symbol tables, faster load times, freedom to refactor internals. (This is the extern/static distinction from the scope lesson, scaled up to whole libraries.)</p>

<div data-w="q3"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Naming ritual:</b> the file must be named <code>lib<i>name</i>.a</code> / <code>lib<i>name</i>.so</code> for <code>-l<i>name</i></code> to find it — <code>-lmymath</code> literally means "search the -L paths for libmymath.so, then libmymath.a". Forget the <code>lib</code> prefix on the file and the linker will never find it.</p></div></div>

<h2>Practice</h2>
<div data-w="ed1"></div>

<h2>🎓 You made it</h2>
<p>Look at the road behind you: bits and two's complement, pointers and the heap, every qualifier and storage class, the preprocessor, C23, the standard library, algorithms — and now the entire toolchain, from preprocessor tokens to relocated ELF symbols. <b>You are not a beginner anymore. You are a C programmer.</b></p>
<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>Where to go next:</b></p>
<ul>
<li><b>Build things.</b> Nothing cements C like projects: a shell, an HTTP server, a text editor, an interpreter, a ray tracer. Pick one that scares you slightly.</li>
<li><b>Read the classics:</b> Kernighan &amp; Ritchie's <i>The C Programming Language</i> (see the language through its creators' eyes) and Jens Gustedt's <i>Modern C</i> (free online — the C17/C23 view).</li>
<li><b>Read real code:</b> curl, SQLite, Redis, and the Linux kernel are masterclasses in C style — and every <code>__attribute__</code>, Makefile, and linker trick you now recognize.</li>
<li><b>Contribute to open source:</b> find a C project you use, run its test suite under ASan, fix a warning, submit the patch. Welcome to the community.</li>
</ul></div></div>

<p>The toolchain is yours, the language is yours — now go compile something that didn't exist yesterday. 🚀</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'static vs shared: where the code ends up', colw: 230, rowh: 90,
      nodes: [
        { id: 'obj', col: 0, row: 0, kind: 'start', label: 'main.o\nneeds: square()' },
        { id: 'stat', col: 0, row: 1, kind: 'proc', label: 'link vs libmymath.a\ncode COPIED in' },
        { id: 'sexe', col: 0, row: 2, kind: 'end', label: 'app_static\nself-contained' },
        { id: 'dyn', col: 1, row: 1, kind: 'proc', label: 'link vs libmymath.so\nonly a REFERENCE noted' },
        { id: 'dexe', col: 1, row: 2, kind: 'proc', label: 'app + "needs libmymath.so"' },
        { id: 'ldso', col: 1, row: 3, kind: 'end', label: 'ld.so loads + resolves\nat every launch' },
      ],
      edges: [
        { from: 'obj', to: 'stat' }, { from: 'stat', to: 'sexe' },
        { from: 'obj', to: 'dyn' }, { from: 'dyn', to: 'dexe' }, { from: 'dexe', to: 'ldso' },
      ],
      note: 'Static: pay in file size, gain independence. Shared: one libc.so.6 on disk serves every process on your machine simultaneously.',
    },
    code1: {
      type: 'code', title: 'mymath.h + mymath.c + main.c', run: false,
      code: `/* ---- mymath.h ---- */
#ifndef MYMATH_H
#define MYMATH_H
int square(int x);
int cube(int x);
#endif

/* ---- mymath.c ---- */
#include "mymath.h"
int square(int x) { return x * x; }
int cube(int x)   { return x * x * x; }

/* ---- main.c ---- */
#include <stdio.h>
#include "mymath.h"
int main(void) {
    printf("6 squared is %d, cubed is %d\\n", square(6), cube(6));
    return 0;
}`
    },
    term1: {
      type: 'term', title: 'static: ar rcs', text: `$ gcc -c mymath.c -o mymath.o
$ ar rcs libmymath.a mymath.o        # r=insert, c=create, s=index
$ ar t libmymath.a                   # list members
mymath.o
$ gcc main.c -L. -lmymath -o app_static
$ ./app_static
6 squared is 36, cubed is 216
$ ls -l app_static                   # square()'s code is INSIDE this file
-rwxr-xr-x 1 ali ali 16144 Aug  1 14:02 app_static`
    },
    term2: {
      type: 'term', title: 'shared: -fPIC -shared, and the rite of passage', text: `$ gcc -fPIC -c mymath.c -o mymath.o
$ gcc -shared mymath.o -o libmymath.so
$ gcc main.c -L. -lmymath -o app
$ ./app
./app: error while loading shared libraries: libmymath.so:
cannot open shared object file: No such file or directory
# linker found it at build time; the LOADER can't at run time. Fixes:
$ LD_LIBRARY_PATH=. ./app                      # 1: env var (testing)
6 squared is 36, cubed is 216
$ gcc main.c -L. -lmymath -Wl,-rpath,'$ORIGIN' -o app
$ ./app                                        # 2: rpath baked in
6 squared is 36, cubed is 216
# 3 (system-wide): sudo cp libmymath.so /usr/local/lib && sudo ldconfig`
    },
    q1: { type: 'quiz', q: 'Your program builds fine but at launch says <code>cannot open shared object file</code>. Which stage is failing?', opts: ['The compiler — missing header', 'The static linker ld at build time', 'The dynamic loader ld.so at run time', 'The preprocessor'], a: 2, expl: 'Build-time -L told ld where the .so was, but that path is not recorded for run time. The dynamic loader searches its cache (ldconfig), standard dirs, rpath, and LD_LIBRARY_PATH — your project directory is in none of them until you act.' },
    term3: {
      type: 'term', title: 'ldd: the dependency X-ray', text: `$ ldd ./app
        linux-vdso.so.1 (0x00007ffd8e5f2000)
        libmymath.so => /home/ali/mathdemo/libmymath.so (0x00007f0e2a614000)
        libc.so.6 => /usr/lib/libc.so.6 (0x00007f0e2a400000)
        /lib64/ld-linux-x86-64.so.2 => /usr/lib64/ld-linux-x86-64.so.2
$ ldd ./app_static
        not a dynamic executable    # statically linked: needs nobody
# security note: never run ldd on untrusted binaries — it may execute them.`
    },
    term4: {
      type: 'term', title: 'order matters!', text: `$ gcc -lmymath main.c -L. -o app          # library BEFORE the code
/usr/bin/ld: /tmp/ccJx4Fzq.o: in function \`main':
main.c:(.text+0x1a): undefined reference to \`square'
main.c:(.text+0x2c): undefined reference to \`cube'
collect2: error: ld returned 1 exit status
$ gcc main.c -L. -lmymath -o app          # code first, THEN library
$ echo $?
0`
    },
    q2: { type: 'quiz', q: 'Why does <code>gcc -lmymath main.c</code> fail while <code>gcc main.c -lmymath</code> works?', opts: ['-l flags are only valid at the end of the line', 'The linker scans left to right and pulls from a library only symbols already known to be needed', 'main.c shadows the library’s symbols', 'Libraries must be compiled last for ABI reasons'], a: 1, expl: 'A single left-to-right pass: when libmymath is visited, nothing needs square() yet, so nothing is taken. main.o’s needs arise later, unmet. Objects and sources first, libraries after — with each library after the code that uses it.' },
    code2: {
      type: 'code', title: 'using an installed library: header + lib', run: false,
      code: `/* zdemo.c — compress a string with zlib, the classic C library */
#include <stdio.h>
#include <string.h>
#include <zlib.h>                 /* 1) header: declarations   */

int main(void) {
    const char *text = "hello hello hello hello hello!";
    unsigned char out[128];
    uLongf outlen = sizeof out;

    compress(out, &outlen, (const Bytef *)text, strlen(text) + 1);
    printf("%zu bytes -> %lu bytes\\n", strlen(text) + 1, outlen);
    return 0;
}                                 /* 2) lib: gcc ... -lz       */`
    },
    term5: {
      type: 'term', title: 'pkg-config: ask, don’t guess', text: `$ gcc zdemo.c -o zdemo
/usr/bin/ld: /tmp/ccj2mQ8v.o: undefined reference to \`compress'
# header satisfied the COMPILER; the LINKER still needs the code:
$ pkg-config --cflags --libs zlib
-lz
$ gcc zdemo.c $(pkg-config --cflags --libs zlib) -o zdemo
$ ./zdemo
31 bytes -> 19 bytes
# same recipe for every library: sdl2, gtk4, openssl, sqlite3...
$ pkg-config --cflags --libs sqlite3
-lsqlite3`
    },
    code3: {
      type: 'code', title: 'visibility.c — a deliberate public API', run: false,
      code: `/* build with: gcc -fPIC -shared -fvisibility=hidden ... */
#define API __attribute__((visibility("default")))

API int mylib_open(const char *path);   /* exported            */
API int mylib_close(int h);             /* exported            */

int helper_parse(const char *s);        /* hidden: internal    */
static int table_size;                  /* static: file-local  */`
    },
    q3: { type: 'quiz', q: 'A library is built with <code>-fvisibility=hidden</code>. What happens to functions not marked <code>visibility("default")</code>?', opts: ['They are deleted from the binary', 'They still exist and work inside the .so but are invisible to programs linking against it', 'They become static and can’t cross files', 'They cause a link error'], a: 1, expl: 'Hidden symbols work normally within the library — internal callers are unaffected — but they don’t appear in the dynamic export table, so outside code can’t link to them. Your internals stay yours.' },
    ed1: {
      type: 'editor', label: 'Final exercise: library thinking', height: 340,
      code: `#include <stdio.h>

/* Imagine splitting this into libstats: stats.h + stats.c.
   1) Write the two declarations exactly as stats.h would hold them.
   2) Predict the build commands for a static libstats.a
      (write them as a comment), then run the program. */

double mean(const double *a, int n) {
    double s = 0;
    for (int i = 0; i < n; i++) s += a[i];
    return n ? s / n : 0;
}

double range(const double *a, int n) {
    double lo = a[0], hi = a[0];
    for (int i = 1; i < n; i++) {
        if (a[i] < lo) lo = a[i];
        if (a[i] > hi) hi = a[i];
    }
    return hi - lo;
}

int main(void) {
    double data[] = {2.0, 4.0, 4.0, 4.0, 5.0, 5.0, 7.0, 9.0};
    int n = (int)(sizeof data / sizeof data[0]);
    printf("mean = %.2f, range = %.2f\\n", mean(data, n), range(data, n));
    return 0;
}`,
      hint: 'Expected output: mean = 5.00, range = 7.00. The comment should read something like: gcc -c stats.c && ar rcs libstats.a stats.o && gcc main.c -L. -lstats -o app. Congratulations — you have finished The C Path!'
    },
  },
});
