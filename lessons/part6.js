/* ============================================================
   Part 6 — The Standard Library
   ============================================================ */

/* ---------------- stdio.h ---------------- */
CT.lesson({
  id: 'stdio-lib',
  title: 'stdio.h: printf, scanf & files, done right',
  minutes: 16, xp: 140,
  tags: 'printf scanf format fopen fgets fread fseek buffer fflush stdio',
  why: `<p>Type letters when a program asks for a number and a surprising amount of software freezes or loops forever — that's the <code>scanf</code> trap, and this lesson teaches you the input pattern real programs use so bad typing can never break yours. You'll also read and write your first files, and discover why a message you printed <em>right before</em> a crash sometimes never appears — a quirk that fools people into hunting bugs in the wrong place.</p>`,
  html: `
<p>You've used <code>printf</code> since lesson one — but <code>stdio.h</code> is a deep library, and most C bugs in the wild involve it. In this lesson you'll finally learn the <em>full</em> anatomy of a format specifier (the <code>%d</code>-style placeholders you've typed since day one), why <code>scanf</code> is a loaded gun, the robust input pattern professionals use, how to read and write files, and why the library sometimes holds your output in a <em>buffer</em> instead of showing it immediately.</p>

<h2>Anatomy of a printf format specifier</h2>
<p>Every conversion follows one grammar: <code>%[flags][width][.precision][length]conversion</code>. Each part is optional except the conversion letter:</p>
<table>
<tr><th>part</th><th>examples</th><th>meaning</th></tr>
<tr><td>flags</td><td><code>-</code> <code>+</code> <code>0</code> <code>#</code> <code>' '</code></td><td>left-align · always show sign · zero-pad · alt form (0x, trailing .) · space for plus</td></tr>
<tr><td>width</td><td><code>8</code>, <code>*</code></td><td>minimum field width (<code>*</code> = take it from an int argument)</td></tr>
<tr><td>.precision</td><td><code>.2</code>, <code>.*</code></td><td>digits after the point (floats) · max chars (<code>%s</code>) · min digits (<code>%d</code>)</td></tr>
<tr><td>length</td><td><code>h hh l ll z</code></td><td>argument size: short, char, long, long long, <code>size_t</code></td></tr>
<tr><td>conversion</td><td><code>d u x o f e g c s p %</code></td><td>signed · unsigned · hex · octal · fixed float · scientific · shortest · char · string · pointer · literal %</td></tr>
</table>

<p>Watch the pieces combine — same values, wildly different output:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><code>%.3s</code> prints <em>at most</em> 3 characters of a string — a rare printf feature that lets you print a substring without copying it. And <code>%*d</code> reads the width from an argument, so column widths can be computed at runtime.</p></div></div>

<div data-w="q1"></div>

<h2>scanf: powerful, and dangerous</h2>
<p><code>scanf</code> is printf in reverse: it parses text from stdin into variables you pass <em>by address</em>. Two things bite everyone:</p>
<ol>
<li><b>It returns a value almost nobody checks</b> — the number of conversions that succeeded. If the user types <code>abc</code> when you asked for <code>%d</code>, scanf converts <em>nothing</em>, leaves the garbage in the input buffer, and your variable is uninitialized.</li>
<li><b><code>%s</code> with no width is a buffer overflow waiting to happen</b> — scanf will happily write 500 characters into your 16-byte array.</li>
</ol>
<div data-w="code2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Never write <code>scanf("%s", buf)</code>.</b> There is no limit on how much it writes — a long input overruns the buffer, which is undefined behavior and a classic security hole (the <em>gets()</em> function was removed from C11 for exactly this reason). Always give a width: <code>scanf("%15s", buf)</code> for a <code>char buf[16]</code> — the width counts characters <em>before</em> the terminating <code>\\0</code>.</p></div></div>

<div data-w="q2"></div>

<h2>The robust pattern: fgets + sscanf</h2>
<p>Professional C reads input in two steps: grab a whole <em>line</em> with <code>fgets</code> (which takes a buffer size and never overflows), then parse the line with <code>sscanf</code> (scanf on a string). Bad input? The line is consumed either way — just ask again. No stuck buffers, no overflow:</p>
<div data-w="code3"></div>
<div data-w="flow1"></div>

<h2>Files: fopen and friends</h2>
<p>A <code>FILE *</code> is an opaque handle to an open stream. You get one from <code>fopen(path, mode)</code>, use the <code>f</code>-family functions on it, and <em>always</em> <code>fclose</code> it (which also flushes pending writes):</p>
<table>
<tr><th>mode</th><th>meaning</th><th>if file exists</th><th>if it doesn't</th></tr>
<tr><td><code>"r"</code></td><td>read</td><td>open at start</td><td>fopen returns NULL</td></tr>
<tr><td><code>"w"</code></td><td>write</td><td><b>truncated to empty!</b></td><td>created</td></tr>
<tr><td><code>"a"</code></td><td>append</td><td>writes go to the end</td><td>created</td></tr>
<tr><td><code>"r+"</code></td><td>read + write</td><td>open at start</td><td>NULL</td></tr>
<tr><td><code>"w+"</code></td><td>read + write</td><td>truncated</td><td>created</td></tr>
<tr><td><code>"rb"</code>, <code>"wb"</code>…</td><td>binary variants</td><td colspan="2">no newline translation (matters on Windows)</td></tr>
</table>
<p>Text I/O uses <code>fprintf</code>/<code>fscanf</code>/<code>fgets</code>; raw bytes use <code>fread</code>/<code>fwrite</code>; and <code>fseek</code>/<code>ftell</code>/<code>rewind</code> move the file position. Here's a full round trip:</p>
<div data-w="code4"></div>
<div data-w="term2"></div>

<div class="callout danger"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The <code>while (!feof(f))</code> anti-pattern.</b> <code>feof</code> only turns true <em>after</em> a read has already failed — it does not predict the future. Looping on <code>!feof</code> processes the last record <b>twice</b> (once real, once from the failed read that left stale data). The correct idiom: loop on the read function itself — <code>while (fgets(line, sizeof line, f))</code> — and afterwards use <code>feof</code>/<code>ferror</code> to learn <em>why</em> it stopped: end of file, or an actual error.</p></div></div>

<div data-w="rv1"></div>

<h2>Buffering: why your printf vanished</h2>
<p>stdio doesn't hand every byte to the OS immediately — it collects output in a buffer. Terminals are <em>line-buffered</em> (flushed at each <code>\\n</code>), files and pipes are <em>fully buffered</em> (flushed when the buffer fills), and <code>stderr</code> is unbuffered. So if your program crashes, output still sitting in the buffer is <b>lost</b> — which makes printf-debugging lie to you about where the crash happened:</p>
<div data-w="code5"></div>
<div data-w="term3"></div>
<p>Fixes: end debug prints with <code>\\n</code> <em>and</em> call <code>fflush(stdout)</code>, print to <code>stderr</code> instead, or disable buffering with <code>setvbuf(stdout, NULL, _IONBF, 0)</code> while debugging.</p>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>stdio covers I/O — next door lives <code>stdlib.h</code>, the junk drawer of essentials: conversions, random numbers, sorting, and program control.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'format.c',
      code: `#include <stdio.h>

int main(void) {
    int    n = 42;
    double pi = 3.14159265;
    printf("[%d]\\n",     n);    /* plain            */
    printf("[%8d]\\n",    n);    /* width 8, right   */
    printf("[%-8d]\\n",   n);    /* flag -: left     */
    printf("[%08d]\\n",   n);    /* flag 0: zero-pad */
    printf("[%+d]\\n",    n);    /* flag +: sign     */
    printf("[%#x]\\n",    n);    /* flag #: 0x form  */
    printf("[%.2f]\\n",   pi);   /* precision 2      */
    printf("[%10.2f]\\n", pi);   /* width + prec     */
    printf("[%.3s]\\n",   "hello"); /* 3 chars max   */
    printf("[%*d]\\n", 6, n);    /* width from arg   */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc format.c -o format && ./format
[42]
[      42]
[42      ]
[00000042]
[+42]
[0x2a]
[3.14]
[      3.14]
[hel]
[    42]` },
    q1: { type: 'quiz', q: 'What does <code>printf("%07.2f", 3.5)</code> print?', opts: ['<code>3.50</code>', '<code>0003.50</code>', '<code>3.5000000</code>', '<code>   3.50</code>'], a: 1, expl: 'Precision .2 gives "3.50" (4 chars), width 7 demands seven, and the 0 flag pads with zeros instead of spaces: 0003.50. Note the width counts the point and digits — everything.' },
    code2: {
      type: 'code', title: 'scanf_danger.c — study, don\u2019t imitate the bad lines', run: false,
      code: `char name[16];
int age;

scanf("%s", name);        /* 💀 no width limit: overflow!    */
scanf("%15s", name);      /* ok: at most 15 chars + '\\0'     */

scanf("%d", &age);        /* ⚠ return value ignored!         */

if (scanf("%d", &age) != 1) {   /* ✔ check it                */
    /* "abc" is still stuck in the input buffer here —       */
    /* the next scanf("%d") will fail the same way, forever  */
}`
    },
    q2: { type: 'quiz', q: '<code>scanf("%d", &x)</code> returns what on success?', opts: ['0', 'The value read', 'The number of successful conversions — here 1', 'The number of characters consumed'], a: 2, expl: 'scanf returns how many conversions succeeded (or EOF at end of input). One %d means success is exactly 1. Ignoring this return value means using an uninitialized variable when parsing fails.' },
    code3: {
      type: 'code', title: 'robust_input.c',
      code: `#include <stdio.h>

int main(void) {
    char line[128];
    int age = 0;

    for (;;) {
        printf("Age? ");
        fflush(stdout);                     /* prompt has no \\n */
        if (!fgets(line, sizeof line, stdin))
            return 1;                       /* EOF or error     */
        if (sscanf(line, "%d", &age) == 1)
            break;                          /* got a number     */
        printf("That wasn't a number, try again.\\n");
    }
    printf("You are %d.\\n", age);
    return 0;
}`
    },
    flow1: {
      type: 'flow', label: 'The fgets + sscanf loop', colw: 210, rowh: 90,
      nodes: [
        { id: 's',  col: 0, row: 0, kind: 'start', label: 'start' },
        { id: 'rd', col: 0, row: 1, kind: 'io',    label: 'fgets whole line\n(bounded — safe)' },
        { id: 'eof',col: 0, row: 2, kind: 'dec',   label: 'got a line?' },
        { id: 'ps', col: 0, row: 3, kind: 'dec',   label: 'sscanf parsed\nwhat we need?' },
        { id: 'err',col: 1, row: 2, kind: 'end',   label: 'EOF / error' },
        { id: 'ok', col: 1, row: 3, kind: 'end',   label: 'use the value' },
      ],
      edges: [
        { from: 's', to: 'rd' },
        { from: 'rd', to: 'eof' },
        { from: 'eof', to: 'ps', label: 'yes' },
        { from: 'eof', to: 'err', label: 'no' },
        { from: 'ps', to: 'ok', label: 'yes' },
        { from: 'ps', to: 'rd', side: 'left', label: 'no — retry' },
      ],
      note: 'The line is consumed whether parsing succeeds or not — bad input can never clog the stream, unlike with raw scanf.',
    },
    code4: {
      type: 'code', title: 'files.c',
      code: `#include <stdio.h>

int main(void) {
    FILE *f = fopen("scores.txt", "w");
    if (!f) { perror("fopen"); return 1; }
    fprintf(f, "alice %d\\n", 91);
    fprintf(f, "bob %d\\n",   84);
    fclose(f);                         /* flushes + releases  */

    f = fopen("scores.txt", "r");
    if (!f) { perror("fopen"); return 1; }

    char name[32]; int score;
    while (fscanf(f, "%31s %d", name, &score) == 2)
        printf("%s scored %d\\n", name, score);

    fseek(f, 0, SEEK_END);             /* jump to the end     */
    printf("file is %ld bytes\\n", ftell(f));
    rewind(f);                         /* back to the start   */

    if (ferror(f)) printf("a real I/O error occurred\\n");
    fclose(f);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc files.c -o files && ./files
alice scored 91
bob scored 84
file is 16 bytes` },
    rv1: { type: 'reveal', label: 'Think first', q: 'A file holds two lines. Why does <code>while (!feof(f)) { fgets(line,…,f); puts(line); }</code> print the second line <em>twice</em>?', answer: '<p>After reading line 2, EOF has not been hit yet — the file position sits just past the final newline. <code>feof</code> is still false, so the loop runs a third time. That third <code>fgets</code> <b>fails</b>, returns NULL, and leaves <code>line</code> untouched — still holding line 2 — which <code>puts</code> happily prints again. Loop on the read call itself: <code>while (fgets(line, sizeof line, f))</code>.</p>' },
    code5: {
      type: 'code', title: 'buffered.c — the vanishing printf', run: false,
      code: `#include <stdio.h>

int main(void) {
    printf("checkpoint A");   /* no \\n — sits in the buffer */
    int *p = 0;
    *p = 42;                  /* 💥 crash: SIGSEGV           */
    printf("checkpoint B");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc buffered.c -o buffered && ./buffered
Segmentation fault (core dumped)
# "checkpoint A" never appeared — it died in the buffer.
# You'd wrongly conclude the crash was BEFORE the printf!
$ # fix: fprintf(stderr, ...) or fflush(stdout) after each print` },
    q3: { type: 'quiz', q: 'Your program crashed and a printf placed <em>before</em> the crash never showed. Most likely reason?', opts: ['printf is broken', 'The output was still in stdio\u2019s buffer when the process died', 'The compiler reordered the code', 'stdout was closed'], a: 1, expl: 'Buffered output is only handed to the OS on a flush (newline on terminals, buffer-full on pipes/files, fclose, or normal exit). A crash skips all of that. fflush(stdout) or stderr are your debugging friends.' },
    ex1: { type: 'editor', label: 'Exercise: a formatted price table', height: 300, code: `#include <stdio.h>

int main(void) {
    const char *items[] = { "Coffee", "Sandwich", "Cake" };
    double prices[]     = { 2.5, 6.75, 4.2 };

    /* TODO: print each row as:
       |Coffee      |   2.50 EUR|
       item left-aligned in 12 cols, price right-aligned
       in 7 cols with exactly 2 decimals.               */
    for (int i = 0; i < 3; i++) {
        printf("%s %f\\n", items[i], prices[i]);  /* fix me */
    }
    return 0;
}`, hint: 'You want %-12s for the name and %7.2f for the price. Add the | separators so misalignment is obvious. Bonus: compute the total and print it with the same widths.' },
  },
});

/* ---------------- stdlib.h ---------------- */
CT.lesson({
  id: 'stdlib-lib',
  title: 'stdlib.h: conversions, random, qsort & exits',
  minutes: 14, xp: 130,
  tags: 'stdlib atoi strtol rand srand qsort bsearch exit atexit getenv system abs div',
  why: `<p>Dice rolls, card shuffles, and loot drops all come from a random-number generator — and without one line of setup, a C program produces the exact same "random" results every single run. This lesson fixes that, shows you how to sort any list — scores, names, anything — with a single library call, and gives you a way to turn text like "42" into a number that actually tells you when the text was garbage.</p>`,
  html: `
<p><code>stdlib.h</code> is C's junk drawer of essentials: number parsing, random numbers, sorting, program termination, and reading the settings your operating system hands every program. You already know its most famous residents — <code>malloc</code>, <code>calloc</code>, <code>realloc</code>, <code>free</code> — from Part 2, so today we tour everything else.</p>

<h2>String → number: atoi vs strtol</h2>
<p><code>atoi("42")</code> is tempting and terrible: on bad input it returns 0 — indistinguishable from a real 0 — and on overflow its behavior is <em>undefined</em>. The grown-up tool is <code>strtol</code> (and siblings <code>strtoul</code>, <code>strtoll</code>, <code>strtod</code>): it reports exactly where parsing stopped via an <code>endptr</code>, and flags overflow through <code>errno</code>:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>The rules: if <code>endptr == start</code>, <em>nothing</em> was parsed. If <code>*endptr != '\\0'</code>, there's trailing junk. If <code>errno == ERANGE</code>, the value overflowed (and you got <code>LONG_MAX</code>/<code>LONG_MIN</code> clamped). Three distinct failure modes atoi silently swallows. The third argument is the base — <code>0</code> means auto-detect <code>0x</code>/<code>0</code> prefixes like a C compiler would.</p>

<div data-w="q1"></div>

<h2>Random numbers: rand & srand</h2>
<p><code>rand()</code> returns a pseudo-random int in <code>[0, RAND_MAX]</code> (at least 32767). The sequence is 100% deterministic — it's computed from a seed, which is why every unseeded program gets the <em>same</em> "random" numbers. Seed once at startup with something that varies, traditionally the clock:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Modulo bias:</b> <code>rand() % 6</code> is not perfectly uniform unless <code>RAND_MAX+1</code> divides evenly by 6 — the low remainders come up slightly more often. For dice games, nobody cares. For simulations, reject-and-retry or scale via division; for anything security-related, don't use <code>rand()</code> at all — it's trivially predictable.</p></div></div>

<div data-w="q2"></div>

<h2>qsort & bsearch: generic algorithms via function pointers</h2>
<p>Remember function pointers from Part 2? Here's their killer app. <code>qsort</code> can sort an array of <em>anything</em> — it just needs the element size and a comparator you supply. The comparator receives <code>const void *</code> pointers to two elements and returns negative / zero / positive, exactly like <code>strcmp</code>:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<div data-w="rv1"></div>
<p><code>bsearch</code> uses the same comparator to binary-search a <em>sorted</em> array — O(log n) lookups for free, as shown above.</p>

<h2>Leaving the building: exit, atexit, abort</h2>
<table>
<tr><th>function</th><th>what it does</th></tr>
<tr><td><code>exit(status)</code></td><td>normal termination from anywhere: flushes stdio, runs atexit handlers, returns <code>status</code> to the OS</td></tr>
<tr><td><code>atexit(fn)</code></td><td>registers <code>fn</code> to run at normal exit (up to 32, called in <b>reverse</b> order)</td></tr>
<tr><td><code>abort()</code></td><td>abnormal termination: raises SIGABRT, no flushing, no handlers — this is what a failed <code>assert</code> calls</td></tr>
<tr><td><code>EXIT_SUCCESS / EXIT_FAILURE</code></td><td>portable status codes for exit / return from main</td></tr>
</table>
<div data-w="code4"></div>
<div data-w="term4"></div>

<h2>The rest of the drawer</h2>
<table>
<tr><th>function</th><th>one-liner</th></tr>
<tr><td><code>getenv("HOME")</code></td><td>read an environment variable (NULL if unset — don't modify the returned string)</td></tr>
<tr><td><code>system("ls -l")</code></td><td>run a shell command — <b>avoid it</b>: slow, non-portable, and building the command from user input is a textbook shell-injection hole</td></tr>
<tr><td><code>abs / labs / llabs</code></td><td>integer absolute value (int / long / long long)</td></tr>
<tr><td><code>div / ldiv</code></td><td>quotient <em>and</em> remainder in one struct: <code>div(7,2)</code> → <code>{.quot=3, .rem=1}</code></td></tr>
<tr><td><code>strtod / strtof</code></td><td>string → double/float, same endptr protocol as strtol</td></tr>
</table>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>Next: the header that handles C's most famously fiddly data type — <code>string.h</code> and the art of the null-terminated string.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'strtol.c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int main(void) {
    const char *inputs[] = { "42", "  99kg", "banana", "999999999999999999999" };

    for (int i = 0; i < 4; i++) {
        const char *s = inputs[i];
        char *end;
        errno = 0;                       /* clear BEFORE the call */
        long v = strtol(s, &end, 10);

        if (end == s)
            printf("%-22s -> no digits at all (atoi says: %d)\\n", s, atoi(s));
        else if (errno == ERANGE)
            printf("%-22s -> overflow! clamped to %ld\\n", s, v);
        else if (*end != '\\0')
            printf("%-22s -> got %ld, junk after: \\"%s\\"\\n", s, v, end);
        else
            printf("%-22s -> clean parse: %ld\\n", s, v);
    }
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc strtol.c -o strtol && ./strtol
42                     -> clean parse: 42
  99kg                 -> got 99, junk after: "kg"
banana                 -> no digits at all (atoi says: 0)
999999999999999999999  -> overflow! clamped to 9223372036854775807` },
    q1: { type: 'quiz', q: 'After <code>long v = strtol("12ab", &end, 10);</code> what are <code>v</code> and <code>*end</code>?', opts: ['v = 0, *end = \u00271\u0027', 'v = 12, *end = \u0027a\u0027', 'v = 12, *end = \u0027\\0\u0027', 'undefined behavior'], a: 1, expl: 'strtol parses the longest valid prefix (12) and points end at the first unconsumed character (\u0027a\u0027). That endptr is exactly what lets you detect trailing junk — atoi would just return 12 and shrug.' },
    code2: {
      type: 'code', title: 'dice.c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void) {
    srand((unsigned)time(NULL));   /* seed ONCE, at startup */

    for (int i = 0; i < 5; i++) {
        int die = rand() % 6 + 1;  /* 1..6 (tiny bias, fine here) */
        printf("roll %d: %d\\n", i + 1, die);
    }
    printf("RAND_MAX here = %d\\n", RAND_MAX);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc dice.c -o dice && ./dice
roll 1: 4
roll 2: 1
roll 3: 6
roll 4: 3
roll 5: 6
RAND_MAX here = 2147483647
# run it again — different rolls, because time() changed` },
    q2: { type: 'quiz', q: 'A program calls <code>rand()</code> without ever calling <code>srand</code>. What happens?', opts: ['Compile error', 'Truly random numbers from the OS', 'The exact same sequence on every run, as if srand(1) was called', 'rand returns only 0'], a: 2, expl: 'The standard says an unseeded generator behaves like srand(1) — fully deterministic. Great for reproducible tests, embarrassing for a poker game. Seeding with time(NULL) varies the sequence per second.' },
    code3: {
      type: 'code', title: 'qsort.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int cmp_int(const void *a, const void *b) {
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);    /* -1, 0 or +1 — overflow-proof */
}

int main(void) {
    int v[] = { 42, 7, 99, -3, 15, 7 };
    size_t n = sizeof v / sizeof v[0];

    qsort(v, n, sizeof v[0], cmp_int);

    for (size_t i = 0; i < n; i++) printf("%d ", v[i]);
    printf("\\n");

    int key = 15;
    int *hit = bsearch(&key, v, n, sizeof v[0], cmp_int);
    if (hit) printf("found %d at index %td\\n", *hit, hit - v);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc qsort.c -o qsort && ./qsort
-3 7 7 15 42 99
found 15 at index 3` },
    rv1: { type: 'reveal', label: 'Think first', q: 'Many tutorials write the int comparator as <code>return x - y;</code>. Why is that subtly broken?', answer: '<p>If <code>x = INT_MAX</code> and <code>y = -1</code>, then <code>x - y</code> overflows a signed int — <b>undefined behavior</b> (Part 3 flashbacks!). Even when it "works", the wrapped result has the wrong sign, so qsort mis-sorts. <code>(x &gt; y) - (x &lt; y)</code> costs two comparisons, can never overflow, and yields exactly −1, 0, or +1.</p>' },
    code4: {
      type: 'code', title: 'atexit.c',
      code: `#include <stdio.h>
#include <stdlib.h>

void bye(void)     { printf("2. handlers run in reverse\\n"); }
void cleanup(void) { printf("1. cleanup ran\\n"); }

int main(void) {
    atexit(bye);        /* registered first, runs LAST  */
    atexit(cleanup);
    printf("0. main is done\\n");

    if (getenv("DEBUG"))
        printf("   (DEBUG is set to: %s)\\n", getenv("DEBUG"));

    exit(EXIT_SUCCESS); /* same as return 0 from main */
}`
    },
    term4: { type: 'term', text: `$ gcc atexit.c -o atexit && ./atexit
0. main is done
1. cleanup ran
2. handlers run in reverse
$ DEBUG=yes ./atexit
0. main is done
   (DEBUG is set to: yes)
1. cleanup ran
2. handlers run in reverse` },
    q3: { type: 'quiz', q: 'Which termination path does <b>not</b> run functions registered with <code>atexit</code>?', opts: ['<code>return 0;</code> from main', '<code>exit(1)</code> deep inside a helper', '<code>abort()</code>', 'Falling off the end of main'], a: 2, expl: 'abort() is the emergency exit: it raises SIGABRT immediately — no atexit handlers, no stdio flushing. Everything else (return from main, exit anywhere) takes the orderly path.' },
    ex1: { type: 'editor', label: 'Exercise: sort words with qsort', height: 320, code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* TODO: write a comparator that sorts the strings
   alphabetically. Careful: each element is a
   char* — so the void* parameters point AT a
   char*, i.e. they are char** in disguise.     */
int cmp_str(const void *a, const void *b) {
    return 0;  /* fix me — you'll want strcmp */
}

int main(void) {
    const char *words[] = { "pear", "apple", "cherry", "banana" };
    qsort(words, 4, sizeof words[0], cmp_str);
    for (int i = 0; i < 4; i++) printf("%s\\n", words[i]);
    return 0;
}`, hint: 'Cast to const char *const * and dereference once: strcmp(*(const char *const *)a, *(const char *const *)b). Expected output: apple, banana, cherry, pear. Bonus: sort by string LENGTH instead.' },
  },
});

/* ---------------- string.h ---------------- */
CT.lesson({
  id: 'string-lib',
  title: 'string.h: the null-terminated toolbox',
  minutes: 16, xp: 140,
  tags: 'strlen strcpy strncpy strcat strcmp strchr strstr strtok memcpy memmove memset snprintf strdup',
  why: `<p>Part 2 showed you how C stores text; the standard library supplies the tools that work on it, and they all have sharp edges — mishandled text is behind some of the most famous security disasters in computing history, where one too-long input overwrites memory and an attacker walks in. In this lesson you'll copy, compare, search, and split text safely, starting with the trap everyone hits first: comparing two strings with <code>==</code> and silently getting the wrong answer.</p>`,
  html: `
<p>C strings are just <code>char</code> arrays ending in <code>'\\0'</code> (Part 2), and <code>string.h</code> is the toolbox for working with them. It's small, fast, and full of decades-old traps. Let's tour the whole thing, traps included.</p>

<h2>The core five</h2>
<table>
<tr><th>function</th><th>one-liner</th></tr>
<tr><td><code>strlen(s)</code></td><td>characters before the <code>'\\0'</code> — an O(n) walk, not a stored field!</td></tr>
<tr><td><code>strcpy(dst, src)</code></td><td>copy including <code>'\\0'</code> — dst must be big enough, nothing checks</td></tr>
<tr><td><code>strcat(dst, src)</code></td><td>append src at dst's <code>'\\0'</code> — same "trust me" contract</td></tr>
<tr><td><code>strcmp(a, b)</code></td><td>lexicographic compare: &lt;0, 0, &gt;0 — <b>never</b> <code>if (a == b)</code>, that compares pointers!</td></tr>
<tr><td><code>strchr(s, c)</code> / <code>strrchr</code></td><td>pointer to first / last occurrence of char c, or NULL</td></tr>
</table>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>The strncpy trap</h2>
<p>"Just use <code>strncpy</code>, it's the safe one" — beware. <code>strncpy(dst, src, n)</code> has a genuinely weird contract: if src is <em>longer</em> than n, it copies n bytes and <b>does not write a <code>'\\0'</code></b>. Your "string" is now an unterminated byte array, and the next <code>strlen</code> reads off the end into the void:</p>
<div data-w="code2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>strncpy does not guarantee termination.</b> If you must use it, always follow with <code>dst[n-1] = '\\0';</code>. Better: use <code>snprintf(dst, sizeof dst, "%s", src)</code>, which always terminates and tells you (via its return value) if truncation happened. (<code>strncat</code> is saner — it always terminates — but its <code>n</code> counts what to <em>append</em>, not the buffer size.)</p></div></div>

<h2>Search: strstr, strspn & friends</h2>
<table>
<tr><th>function</th><th>one-liner</th></tr>
<tr><td><code>strstr(hay, needle)</code></td><td>pointer to first occurrence of substring, or NULL</td></tr>
<tr><td><code>strpbrk(s, set)</code></td><td>pointer to the first char of s that's in set</td></tr>
<tr><td><code>strspn(s, set)</code></td><td>length of the prefix made only of chars in set</td></tr>
<tr><td><code>strcspn(s, set)</code></td><td>length of the prefix containing none of set — great for stripping fgets' newline: <code>s[strcspn(s, "\\n")] = 0;</code></td></tr>
</table>

<h2>strtok: useful, stateful, destructive</h2>
<p><code>strtok(str, delims)</code> splits a string into tokens — but it does two surprising things. It <b>mutates your string</b>, stamping <code>'\\0'</code> over each delimiter; and it keeps <b>hidden static state</b>, which is why every call after the first passes <code>NULL</code> ("continue where you left off"). Step through it:</p>
<div data-w="tr1"></div>
<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p>Because of the hidden state, you can't interleave two strtok loops, use it on a string literal (mutating one is UB!), or call it from multiple threads. C11's <code>strtok_s</code> / POSIX <code>strtok_r</code> take the state as an explicit parameter and fix all three.</p></div></div>

<div data-w="q2"></div>

<h2>The mem family: raw bytes, no '\\0' involved</h2>
<p>These work on arbitrary memory and take explicit lengths — they never look for a terminator: <code>memset(p, byte, n)</code> fills, <code>memcmp(a, b, n)</code> compares, <code>memchr(p, byte, n)</code> finds a byte, and <code>memcpy(dst, src, n)</code> copies… with one famous restriction. If the regions <b>overlap</b>, memcpy is undefined behavior — a forward-copying implementation clobbers source bytes before reading them:</p>
<div data-w="mg1"></div>
<p><code>memmove</code> handles overlap correctly (it copies backwards when needed, as if via a temporary buffer). Rule of thumb: same array, or any doubt at all → <code>memmove</code>.</p>
<div data-w="code3"></div>
<div data-w="term2"></div>

<div data-w="q3"></div>

<h2>snprintf: the safe string builder</h2>
<p>Building strings from pieces with strcpy+strcat is verbose and risky. <code>snprintf</code> does it in one bounded call, always terminates, and returns the length it <em>wanted</em> to write — so you can detect truncation:</p>
<div data-w="code4"></div>
<div data-w="term3"></div>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>strdup graduates:</b> <code>strdup(s)</code> — malloc a copy of a string — lived in POSIX for decades while portable C had to hand-roll it. C23 finally adopted <code>strdup</code> and <code>strndup</code> into the standard. Remember the copy is malloc'd: you <code>free</code> it.</p></div></div>

<div data-w="ex1"></div>

<p>Strings and bytes handled — time for numbers and clocks: <code>math.h</code> and <code>time.h</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'tour.c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    const char *s = "hello, world";

    printf("strlen: %zu\\n", strlen(s));
    printf("strcmp(\\"abc\\",\\"abd\\"): %s\\n",
           strcmp("abc", "abd") < 0 ? "negative" : "other");

    const char *comma = strchr(s, ',');       /* first ',' */
    printf("strchr: found at index %td\\n", comma - s);

    const char *sub = strstr(s, "world");     /* substring */
    printf("strstr: \\"%s\\"\\n", sub);

    char line[] = "value\\n";                  /* fgets-style */
    line[strcspn(line, "\\n")] = '\\0';         /* strip \\n    */
    printf("stripped: [%s]\\n", line);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc tour.c -o tour && ./tour
strlen: 12
strcmp("abc","abd"): negative
strchr: found at index 5
strstr: "world"
stripped: [value]` },
    q1: { type: 'quiz', q: 'Why is <code>if (name == "alice")</code> wrong for comparing strings?', opts: ['It compares lengths only', 'It compares the two pointers, not the characters', 'String literals can\u2019t be compared', 'It\u2019s fine — this works'], a: 1, expl: '== on pointers asks "same address?", not "same text?". Two identical strings at different addresses compare unequal (and identical literals may or may not be merged — implementation-defined). Use strcmp(name, "alice") == 0.' },
    code2: {
      type: 'code', title: 'strncpy_trap.c — the missing terminator', run: false,
      code: `char dst[8];
strncpy(dst, "a short fit", 8);
/* src has 11 chars: strncpy copies exactly 8 bytes,
   "a short " — and NO '\\0'. dst is not a string!    */

printf("%s\\n", dst);      /* 💀 UB: reads past dst[7] */

/* the ritual fix:                                    */
dst[sizeof dst - 1] = '\\0';

/* the better tool — always terminated:               */
snprintf(dst, sizeof dst, "%s", "a short fit");`
    },
    tr1: {
      type: 'trace', label: 'strtok mutates as it goes — watch the string', title: 'tokens.c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char csv[] = "red,green,blue";
    char *tok = strtok(csv, ",");
    while (tok != NULL) {
        printf("[%s]\\n", tok);
        tok = strtok(NULL, ",");
    }
    return 0;
}`,
      steps: [
        { line: 5, vars: { csv: '"red,green,blue"', tok: '—' }, out: '', note: 'csv is a modifiable array copy of the literal — that matters!' },
        { line: 6, vars: { csv: '"red\\0green,blue"', tok: '→ "red"' }, out: '', note: 'strtok finds the first ",", OVERWRITES it with \\0, returns a pointer to "red", and privately remembers where it stopped.' },
        { line: 8, vars: { csv: '"red\\0green,blue"', tok: '→ "red"' }, out: '[red]\n', note: 'tok points into csv itself — no copy was made.' },
        { line: 9, vars: { csv: '"red\\0green\\0blue"', tok: '→ "green"' }, out: '[red]\n', note: 'Passing NULL means "continue from the hidden saved position". Next "," gets stamped to \\0.' },
        { line: 8, vars: { csv: '"red\\0green\\0blue"', tok: '→ "green"' }, out: '[red]\n[green]\n', note: '' },
        { line: 9, vars: { csv: '"red\\0green\\0blue"', tok: '→ "blue"' }, out: '[red]\n[green]\n', note: 'Last token: no delimiter after it, the existing terminator ends it.' },
        { line: 8, vars: { csv: '"red\\0green\\0blue"', tok: '→ "blue"' }, out: '[red]\n[green]\n[blue]\n', note: '' },
        { line: 9, vars: { csv: '"red\\0green\\0blue"', tok: 'NULL' }, out: '[red]\n[green]\n[blue]\n', note: 'Nothing left — strtok returns NULL and the loop ends. csv is now three separate strings sharing one array.' },
      ],
    },
    q2: { type: 'quiz', q: 'After a full strtok pass over <code>char s[] = "a,b";</code> what does <code>printf("%s", s)</code> print?', opts: ['<code>a,b</code>', '<code>a</code>', '<code>ab</code>', 'nothing — s is freed'], a: 1, expl: 'strtok replaced the "," with \\0, so the array now holds "a\\0b\\0…". %s stops at the first \\0 and prints just "a". The original string is gone — copy it first if you still need it.' },
    mg1: {
      type: 'memgrid', label: 'memcpy(a+2, a, 4) — overlapping regions',
      note: 'Copying forward: step 1 writes <b>A</b> into cell 0x12 — but that cell was part of the <em>source</em> and hadn\u2019t been read yet. The source is corrupted mid-copy; you get A B A B A B instead of A B A B C D. This is why overlapping memcpy is UB — <code>memmove</code> detects the overlap and copies right-to-left instead.',
      cells: [
        { addr: '0x10', val: 'A', name: 'src[0]', hl: true },
        { addr: '0x11', val: 'B', name: 'src[1]', hl: true },
        { addr: '0x12', val: 'C→A', name: 'both!', hl2: true },
        { addr: '0x13', val: 'D→B', name: 'both!', hl2: true },
        { addr: '0x14', val: 'E→?', name: 'dst[2]', hl2: true },
        { addr: '0x15', val: 'F→?', name: 'dst[3]', hl2: true },
      ],
    },
    code3: {
      type: 'code', title: 'shift.c',
      code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char a[] = "ABCDEF";
    memmove(a + 2, a, 4);        /* overlap: memmove is safe */
    printf("after memmove: %s\\n", a);

    char b[8];
    memset(b, '-', 7);           /* fill 7 bytes with '-'    */
    b[7] = '\\0';
    printf("after memset : %s\\n", b);

    printf("memcmp: %d\\n", memcmp("abc", "abd", 3) < 0);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc shift.c -o shift && ./shift
after memmove: ABABCD
after memset : -------
memcmp: 1` },
    q3: { type: 'quiz', q: 'When must you use <code>memmove</code> instead of <code>memcpy</code>?', opts: ['When copying more than 4 KB', 'When source and destination might overlap', 'When copying structs', 'Always — memcpy is deprecated'], a: 1, expl: 'memcpy is allowed to assume no overlap (and is often faster because of it); overlapping regions make it UB. memmove behaves as if it copies through a temporary buffer, so shifting data within one array is its home turf.' },
    code4: {
      type: 'code', title: 'builder.c',
      code: `#include <stdio.h>

int main(void) {
    char url[32];
    int need = snprintf(url, sizeof url,
                        "https://%s:%d/%s", "api.example.com", 443, "v2/users");

    if (need >= (int)sizeof url)
        printf("truncated! needed %d bytes, had %zu\\n", need, sizeof url);

    printf("url = %s\\n", url);   /* always '\\0'-terminated  */
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc builder.c -o builder && ./builder
truncated! needed 36 bytes, had 32
url = https://api.example.com:443/v2/` },
    ex1: { type: 'editor', label: 'Exercise: write your own strlen', height: 300, code: `#include <stdio.h>

/* TODO: implement my_strlen without calling any
   library function. Walk the chars until '\\0'.  */
size_t my_strlen(const char *s) {
    return 0;  /* fix me */
}

int main(void) {
    printf("%zu\\n", my_strlen(""));         /* want 0  */
    printf("%zu\\n", my_strlen("hi"));       /* want 2  */
    printf("%zu\\n", my_strlen("hello!"));   /* want 6  */
    return 0;
}`, hint: 'Loop while s[n] != \u0027\\0\u0027 incrementing n — or go full K&R with a pointer: walk p until *p is 0 and return p - s. Both are classics; try each.' },
  },
});

/* ---------------- math.h & time.h ---------------- */
CT.lesson({
  id: 'math-time',
  title: 'math.h & time.h: numbers and clocks',
  minutes: 14, xp: 130,
  tags: 'math pow sqrt floor ceil round fmod nan infinity isnan lm time clock strftime localtime benchmark',
  why: `<p>Square roots and angles power game physics, and a stopwatch tells you whether your code is actually fast or just feels fast — both live in today's two headers. Along the way you'll hit a rite of passage: your first <code>sqrt</code> program on Linux fails with an error message that has baffled C learners for decades, and you'll be one of the few beginners who knows exactly what it means — and that the fix is three characters long.</p>`,
  html: `
<p>Two headers today: <code>math.h</code>, which gives C real mathematical muscle, and <code>time.h</code>, which answers both "what time is it?" and "how long did that take?". Plus the single most-Googled error message in C history — courtesy of the linker, the build stage from Part 0 that stitches compiled pieces into a program.</p>

<h2>The math.h roster</h2>
<table>
<tr><th>family</th><th>functions</th><th>notes</th></tr>
<tr><td>powers</td><td><code>pow, sqrt, cbrt, hypot</code></td><td><code>hypot(a,b)</code> = √(a²+b²) without overflow</td></tr>
<tr><td>trig</td><td><code>sin, cos, tan, asin, acos, atan, atan2</code></td><td>radians, not degrees! <code>atan2(y,x)</code> knows the quadrant</td></tr>
<tr><td>exp / log</td><td><code>exp, log, log2, log10, exp2</code></td><td><code>log</code> is natural log (ln), not base 10</td></tr>
<tr><td>rounding</td><td><code>floor, ceil, round, trunc</code></td><td>four different opinions about halves and negatives — see below</td></tr>
<tr><td>remainder</td><td><code>fmod</code></td><td><code>%</code> for doubles: <code>fmod(7.5, 2.0)</code> → 1.5</td></tr>
<tr><td>misc</td><td><code>fabs, fmin, fmax</code></td><td>float absolute value / min / max</td></tr>
</table>
<p>Everything takes and returns <code>double</code>; <code>f</code>-suffixed variants (<code>sqrtf</code>, <code>sinf</code>…) work in <code>float</code>.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="rv1"></div>

<h2>The -lm rite of passage</h2>
<p>On Linux, the math functions live in a separate library, <code>libm</code>. Including the header satisfies the <em>compiler</em>, but the <em>linker</em> still needs to be told where the code is — everyone hits this once:</p>
<div data-w="term2"></div>
<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Remember the stage model from Part 0: <em>undefined reference</em> is always the <b>linker</b> talking. The declaration (math.h) was fine; the definition lives in libm — append <code>-lm</code> to the command line. (Library flags go <em>after</em> your source files.)</p></div></div>

<div data-w="q1"></div>

<h2>NaN, infinity & comparing floats</h2>
<p>Floating-point math never crashes — it produces special values instead (Part 0 flashbacks): <code>1.0/0.0</code> gives <code>INFINITY</code>, <code>sqrt(-1)</code> gives <code>NAN</code>. Since NaN isn't equal to anything — including itself — you must test with <code>isnan()</code> and <code>isinf()</code>, never <code>==</code>:</p>
<div data-w="code2"></div>
<div data-w="term3"></div>
<p>And the golden rule stands: compare computed floats with a tolerance, e.g. <code>fabs(a - b) &lt; 1e-9</code>, or relative to magnitude with <code>DBL_EPSILON</code> from <code>float.h</code> (next lesson digs into that header).</p>

<div data-w="q2"></div>

<h2>time.h: wall clocks</h2>
<p><code>time(NULL)</code> returns a <code>time_t</code> — on virtually every platform, seconds since the Unix epoch (Jan 1, 1970 UTC), though the standard only promises "some encoding"; portable code compares moments with <code>difftime(t2, t1)</code>. To get human-readable parts, expand a <code>time_t</code> into a <code>struct tm</code> with <code>localtime</code>, then format it with <code>strftime</code>:</p>
<div data-w="code3"></div>
<div data-w="term4"></div>
<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><code>struct tm</code> quirks that ruin demos: <code>tm_year</code> is years <em>since 1900</em>, and <code>tm_mon</code> is <em>0-based</em> (January = 0). Forget those and your program prints the year 126 or the wrong month. Also <code>localtime</code> returns a pointer to shared static storage — copy the struct if you need two at once.</p></div></div>

<h2>time.h: stopwatches</h2>
<p>For benchmarking, wall time is the wrong tool (other processes pollute it). <code>clock()</code> measures <em>CPU time</em> consumed by your process, in ticks of <code>CLOCKS_PER_SEC</code>:</p>
<div data-w="code4"></div>
<div data-w="term5"></div>
<p>C11 added <code>timespec_get(&ts, TIME_UTC)</code>, which fills a <code>struct timespec</code> with seconds <em>and nanoseconds</em> — the portable way to get sub-second wall-clock timestamps.</p>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>Next up: three small headers with outsized importance — character tests, assertions, and the errno error-reporting convention.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'mathtour.c',
      code: `#include <stdio.h>
#include <math.h>

int main(void) {
    printf("pow(2,10)   = %.0f\\n", pow(2, 10));
    printf("sqrt(2)     = %.6f\\n", sqrt(2));
    printf("cbrt(27)    = %.0f\\n", cbrt(27));
    printf("hypot(3,4)  = %.0f\\n", hypot(3, 4));
    printf("sin(pi/6)   = %.3f\\n", sin(3.14159265358979 / 6));
    printf("log2(1024)  = %.0f\\n", log2(1024));
    printf("fmod(7.5,2) = %.1f\\n", fmod(7.5, 2));
    printf("floor(2.7)=%.0f ceil(2.1)=%.0f round(2.5)=%.0f\\n",
           floor(2.7), ceil(2.1), round(2.5));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc mathtour.c -o mathtour -lm && ./mathtour
pow(2,10)   = 1024
sqrt(2)     = 1.414214
cbrt(27)    = 3
hypot(3,4)  = 5
sin(pi/6)   = 0.500
log2(1024)  = 10
fmod(7.5,2) = 1.5
floor(2.7)=2 ceil(2.1)=3 round(2.5)=3` },
    rv1: { type: 'reveal', label: 'Think first', q: 'What do <code>floor(-2.5)</code>, <code>ceil(-2.5)</code>, <code>trunc(-2.5)</code> and <code>round(-2.5)</code> each return?', answer: '<p><code>floor(-2.5) = -3</code> (toward −∞) · <code>ceil(-2.5) = -2</code> (toward +∞) · <code>trunc(-2.5) = -2</code> (toward zero — this is what casting to int does) · <code>round(-2.5) = -3</code> (halves round <em>away from zero</em>). Four functions, three different answers for one input — pick deliberately, especially for negative numbers.</p>' },
    term2: { type: 'term', title: 'the classic', text: `$ gcc area.c -o area
/usr/bin/ld: /tmp/ccXty2.o: undefined reference to \`sqrt'
collect2: error: ld returned 1 exit status
# math.h declared sqrt, but the CODE lives in libm:
$ gcc area.c -o area -lm
$ ./area
r = 5.64` },
    q1: { type: 'quiz', q: 'You included <code>&lt;math.h&gt;</code> but get <code>undefined reference to \`pow\'</code>. What\u2019s wrong?', opts: ['A typo in the include', 'The compiler is too old for pow', 'The linker wasn\u2019t told to link libm — add <code>-lm</code>', 'pow needs C23'], a: 2, expl: 'Headers only carry declarations. The implementation of the math functions is in a separate library on Linux, so the link step needs -lm after your source files. (Some calls with constant args get computed at compile time, which is why the error can appear "randomly".)' },
    code2: {
      type: 'code', title: 'special.c',
      code: `#include <stdio.h>
#include <math.h>

int main(void) {
    double inf = 1.0 / 0.0;        /* no crash — infinity   */
    double nan = sqrt(-1.0);       /* domain error — NaN    */

    printf("inf = %f, nan = %f\\n", inf, nan);
    printf("nan == nan   -> %d\\n", nan == nan);   /* false! */
    printf("isnan(nan)   -> %d\\n", isnan(nan));
    printf("isinf(inf)   -> %d\\n", isinf(inf));
    printf("isfinite(1.) -> %d\\n", isfinite(1.0));

    double a = 0.1 + 0.2;
    printf("a == 0.3        -> %d\\n", a == 0.3);
    printf("tolerance check -> %d\\n", fabs(a - 0.3) < 1e-9);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc special.c -o special -lm && ./special
inf = inf, nan = -nan
nan == nan   -> 0
isnan(nan)   -> 1
isinf(inf)   -> 1
isfinite(1.) -> 1
a == 0.3        -> 0
tolerance check -> 1` },
    q2: { type: 'quiz', q: 'Which expression reliably detects that <code>x</code> is NaN?', opts: ['<code>x == NAN</code>', '<code>x != x</code>', '<code>x == 0.0/0.0</code>', '<code>x &gt; INFINITY</code>'], a: 1, expl: 'NaN is the only value not equal to itself, so x != x is true exactly for NaNs — that\u2019s essentially how isnan() works. x == NAN is always false for the same reason. Prefer the readable isnan(x).' },
    code3: {
      type: 'code', title: 'today.c',
      code: `#include <stdio.h>
#include <time.h>

int main(void) {
    time_t now = time(NULL);            /* seconds since epoch */
    printf("raw time_t : %lld\\n", (long long)now);

    struct tm *t = localtime(&now);     /* explode into fields */
    printf("year %d, month %d, day %d\\n",
           t->tm_year + 1900,           /* years since 1900!   */
           t->tm_mon + 1,               /* 0-based months!     */
           t->tm_mday);

    char buf[64];
    strftime(buf, sizeof buf, "%A %Y-%m-%d %H:%M:%S", t);
    printf("formatted  : %s\\n", buf);
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc today.c -o today && ./today
raw time_t : 1754006400
year 2025, month 8, day 1
formatted  : Friday 2025-08-01 02:00:00` },
    code4: {
      type: 'code', title: 'bench.c',
      code: `#include <stdio.h>
#include <time.h>

int main(void) {
    clock_t start = clock();

    volatile double sum = 0;          /* volatile: don't optimize away */
    for (long i = 1; i <= 50000000L; i++)
        sum += 1.0 / i;

    clock_t end = clock();
    double secs = (double)(end - start) / CLOCKS_PER_SEC;

    printf("harmonic sum = %.6f\\n", sum);
    printf("CPU time     = %.3f s\\n", secs);
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc -O2 bench.c -o bench && ./bench
harmonic sum = 18.304749
CPU time     = 0.184 s` },
    q3: { type: 'quiz', q: 'To measure how long <em>your code</em> took to compute, regardless of other programs hogging the machine, use…', opts: ['<code>time(NULL)</code> before and after', '<code>clock()</code> before and after, divided by CLOCKS_PER_SEC', '<code>strftime</code>', '<code>difftime</code> on two time_t values'], a: 1, expl: 'clock() counts CPU time your process actually consumed; wall-clock time (time/difftime) includes everything else running. For sub-second wall timestamps, C11\u2019s timespec_get gives nanosecond resolution.' },
    ex1: { type: 'editor', label: 'Exercise: benchmark sqrt vs pow', height: 320, code: `#include <stdio.h>
#include <math.h>
#include <time.h>

/* TODO: time 10 million sqrt(x) calls, then 10 million
   pow(x, 0.5) calls, using clock(). Print both timings.
   Which is faster, and by roughly what factor?          */
int main(void) {
    volatile double sink = 0;

    clock_t t0 = clock();
    /* loop 1: sink += sqrt((double)i); */
    clock_t t1 = clock();
    /* loop 2: sink += pow((double)i, 0.5); */
    clock_t t2 = clock();

    printf("sqrt: %.3f s\\n", (double)(t1 - t0) / CLOCKS_PER_SEC);
    printf("pow : %.3f s\\n", (double)(t2 - t1) / CLOCKS_PER_SEC);
    return 0;
}`, hint: 'Write two for-loops of 10 million iterations accumulating into sink (volatile stops the optimizer deleting them). sqrt is usually a single CPU instruction; generic pow is many times slower — measure it!' },
  },
});

/* ---------------- ctype.h, assert.h, errno.h ---------------- */
CT.lesson({
  id: 'ctype-assert-errno',
  title: 'ctype.h, assert.h & errno.h: small headers, big habits',
  minutes: 13, xp: 120,
  tags: 'ctype isalpha isdigit toupper assert NDEBUG errno perror strerror error handling',
  why: `<p>How does a password checker know you typed a digit? And how does "No such file or directory" actually reach your screen? Three tiny headers answer both — and teach you the professional habit of making bugs crash loudly while you develop, at zero cost in the version you ship.</p>`,
  html: `
<p>Three tiny headers that shape how good C code <em>feels</em>: <code>ctype.h</code> classifies characters, <code>assert.h</code> catches impossible states, and <code>errno.h</code> is the standard library's error-reporting channel. Each has one famous trap.</p>

<h2>ctype.h: what kind of character is this?</h2>
<table>
<tr><th>test</th><th>true for</th><th>test</th><th>true for</th></tr>
<tr><td><code>isalpha</code></td><td>letters a–z A–Z</td><td><code>isupper</code></td><td>A–Z</td></tr>
<tr><td><code>isdigit</code></td><td>0–9</td><td><code>islower</code></td><td>a–z</td></tr>
<tr><td><code>isalnum</code></td><td>letters or digits</td><td><code>isxdigit</code></td><td>hex digits 0–9 a–f A–F</td></tr>
<tr><td><code>isspace</code></td><td>space \\t \\n \\r \\v \\f</td><td><code>ispunct</code></td><td>printable, not alnum/space</td></tr>
<tr><td><code>isprint</code></td><td>anything visible + space</td><td><code>iscntrl</code></td><td>control codes</td></tr>
</table>
<p>Plus two converters: <code>toupper(c)</code> and <code>tolower(c)</code> (non-letters pass through unchanged). Here's a mini text analyzer:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The unsigned char trap:</b> the ctype functions accept an <code>int</code> that must be either <code>EOF</code> or a value representable as <b><code>unsigned char</code></b> (0–255). But plain <code>char</code> is often <em>signed</em> — so a byte like é (0xE9 in Latin-1) stored in a <code>char</code> is <b>−23</b>, and <code>isalpha(-23)</code> is undefined behavior (real implementations index a table at [-23]…). When the char comes from arbitrary text, cast first: <code>isalpha((unsigned char)c)</code>.</p></div></div>

<div data-w="q1"></div>

<h2>assert.h: crash early, crash loudly</h2>
<p><code>assert(expr)</code> checks an invariant: if <code>expr</code> is false, it prints the expression, file and line, then calls <code>abort()</code>. It documents and enforces what <em>must</em> be true if your code is correct:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Compile with <code>-DNDEBUG</code> and every assert vanishes completely — zero runtime cost in release builds. Two consequences: never put <em>side effects</em> inside an assert (<code>assert(read_config())</code> silently disappears!), and never use assert for conditions that can legitimately happen in production.</p>

<div data-w="flow1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>The philosophy: <b>assert guards against bugs, error handling guards against the world.</b> A NULL argument that your own code should never pass → assert. A file that might not exist, input a user typed, memory that might run out → real error handling: check, report, recover. And for conditions checkable at <em>compile time</em>, use <code>static_assert</code> from Part 5 — it costs nothing even in debug builds.</p></div></div>

<div data-w="q2"></div>

<h2>errno.h: how the library reports failure</h2>
<p>Many library functions signal <em>that</em> they failed via their return value (NULL, −1, EOF) and <em>why</em> via the global-ish variable <code>errno</code> (it's thread-local in practice, and since C11 officially a macro). The conventions matter:</p>
<ul>
<li>Functions set errno on failure but <b>never clear it on success</b> — check errno only <em>after</em> seeing a failing return value.</li>
<li>Exception: functions like <code>strtol</code> where the failure value (LONG_MAX) is also a legal result — there you set <code>errno = 0</code> before the call and inspect it after.</li>
<li><code>perror("prefix")</code> prints your prefix plus the errno message to stderr; <code>strerror(errno)</code> hands you the message string to format yourself.</li>
</ul>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div data-w="q3"></div>

<div data-w="ex1"></div>

<p>You now know how the library talks about characters and errors — next we pin down how big C's types actually are, and how to stop guessing: <code>limits.h</code>, <code>float.h</code> and the fixed-width types of <code>stdint.h</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'classify.c',
      code: `#include <stdio.h>
#include <ctype.h>

int main(void) {
    const char *text = "Route 66, exit B-4!";
    int letters = 0, digits = 0, spaces = 0, punct = 0;

    for (const char *p = text; *p; p++) {
        unsigned char c = (unsigned char)*p;   /* the safe cast */
        if      (isalpha(c)) letters++;
        else if (isdigit(c)) digits++;
        else if (isspace(c)) spaces++;
        else if (ispunct(c)) punct++;
    }
    printf("\\"%s\\"\\n", text);
    printf("letters=%d digits=%d spaces=%d punct=%d\\n",
           letters, digits, spaces, punct);

    for (const char *p = text; *p; p++)
        putchar(toupper((unsigned char)*p));
    putchar('\\n');
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc classify.c -o classify && ./classify
"Route 66, exit B-4!"
letters=9 digits=3 spaces=3 punct=4
ROUTE 66, EXIT B-4!` },
    q1: { type: 'quiz', q: 'Why is <code>isupper(c)</code> risky when <code>char c</code> holds a byte read from a file?', opts: ['isupper only works on ASCII files', 'If char is signed, bytes ≥ 128 become negative — passing a negative (non-EOF) value is UB', 'isupper modifies c', 'Files can\u2019t contain uppercase bytes'], a: 1, expl: 'ctype functions are defined only for EOF and 0–255. On signed-char platforms (x86 Linux!), byte 0xE9 arrives as −23, and isupper(−23) is undefined behavior — often an out-of-bounds table read. Cast: isupper((unsigned char)c).' },
    code2: {
      type: 'code', title: 'assert.c',
      code: `#include <stdio.h>
#include <assert.h>

/* average of n values — n == 0 would be a caller BUG */
double average(const double *v, int n) {
    assert(v != NULL);
    assert(n > 0);

    double sum = 0;
    for (int i = 0; i < n; i++) sum += v[i];
    return sum / n;
}

int main(void) {
    double data[] = { 1.0, 2.0, 6.0 };
    printf("avg = %.2f\\n", average(data, 3));
    printf("avg = %.2f\\n", average(data, 0));   /* boom */
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc assert.c -o assert && ./assert
avg = 3.00
assert: assert.c:7: average: Assertion \`n > 0' failed.
Aborted (core dumped)
$ gcc -DNDEBUG assert.c -o assert   # release build:
$ ./assert                          # asserts compiled out —
avg = 3.00                          # now it's a silent
avg = inf                           # divide-by-zero instead!` },
    flow1: {
      type: 'flow', label: 'assert or error handling?', colw: 215, rowh: 92,
      nodes: [
        { id: 's',  col: 0, row: 0, kind: 'start', label: 'something could\nbe wrong here' },
        { id: 'd1', col: 0, row: 1, kind: 'dec',   label: 'can it happen in a\ncorrect program?' },
        { id: 'a',  col: 1, row: 1, kind: 'proc',  label: 'it\u2019s a BUG:\nassert(...)' },
        { id: 'd2', col: 0, row: 2, kind: 'dec',   label: 'detectable at\ncompile time?' },
        { id: 'sa', col: 1, row: 2, kind: 'proc',  label: 'static_assert\n(zero cost)' },
        { id: 'eh', col: 0, row: 3, kind: 'end',   label: 'real error handling:\ncheck, report, recover' },
      ],
      edges: [
        { from: 's', to: 'd1' },
        { from: 'd1', to: 'a', label: 'no' },
        { from: 'd1', to: 'd2', label: 'yes' },
        { from: 'd2', to: 'sa', label: 'yes' },
        { from: 'd2', to: 'eh', label: 'no' },
      ],
      note: 'Bad user input, missing files, failed malloc — those happen in <em>correct</em> programs, so they get real handling. A negative length passed to your own function — that\u2019s a bug, assert it.',
    },
    q2: { type: 'quiz', q: 'Why is <code>assert(fclose(f) == 0);</code> a bug waiting to happen?', opts: ['fclose never returns 0', 'assert can\u2019t contain function calls', 'With -DNDEBUG the whole expression vanishes — the file is never closed in release builds', 'It leaks errno'], a: 2, expl: 'NDEBUG makes assert(...) expand to nothing — including its side effects. The debug build closes the file; the release build doesn\u2019t. Keep the action outside: int rc = fclose(f); assert(rc == 0);' },
    code3: {
      type: 'code', title: 'errno.c',
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <limits.h>

int main(void) {
    /* case 1: fopen — return value says IF, errno says WHY */
    FILE *f = fopen("/no/such/file", "r");
    if (!f) {
        perror("fopen");                       /* to stderr    */
        printf("errno=%d meaning \\"%s\\"\\n",
               errno, strerror(errno));
    }

    /* case 2: strtol — must clear errno FIRST               */
    errno = 0;
    long v = strtol("99999999999999999999", NULL, 10);
    if (errno == ERANGE)
        printf("overflow: clamped to %ld (%s)\\n",
               v, strerror(errno));
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc errno.c -o errno && ./errno
fopen: No such file or directory
errno=2 meaning "No such file or directory"
overflow: clamped to 9223372036854775807 (Numerical result out of range)` },
    q3: { type: 'quiz', q: 'Why set <code>errno = 0</code> before calling <code>strtol</code> but not before <code>fopen</code>?', opts: ['strtol is older than errno', 'fopen\u2019s failure (NULL) is unambiguous, but strtol\u2019s overflow value LONG_MAX is also a legal parse result — only a fresh ERANGE distinguishes them', 'fopen clears errno itself', 'You should clear it before every call'], a: 1, expl: 'Functions set errno on failure but never clear it. fopen returning NULL already proves failure, so errno\u2019s value is meaningful. strtol returning LONG_MAX could be a genuine parse of that number — you need to know ERANGE was set by THIS call, hence the pre-clear.' },
    ex1: { type: 'editor', label: 'Exercise: validate a C identifier', height: 320, code: `#include <stdio.h>
#include <ctype.h>

/* A valid C identifier: first char is a letter or '_',
   the rest are letters, digits or '_'.
   TODO: implement is_identifier using ctype functions.
   Remember the (unsigned char) cast!                   */
int is_identifier(const char *s) {
    return 0;  /* fix me */
}

int main(void) {
    const char *tests[] = { "count", "_tmp", "2fast", "a-b", "x9", "" };
    for (int i = 0; i < 6; i++)
        printf("%-6s -> %s\\n", tests[i],
               is_identifier(tests[i]) ? "valid" : "invalid");
    return 0;
}`, hint: 'Check s[0] with isalpha or ==\u0027_\u0027 (and reject empty strings!), then loop the rest with isalnum or \u0027_\u0027. Expected: count, _tmp, x9 valid; 2fast, a-b, "" invalid.' },
  },
});

/* ---------------- limits.h, float.h, stdint.h ---------------- */
CT.lesson({
  id: 'limits-stdint',
  title: 'limits.h, float.h & stdint.h: know your sizes',
  minutes: 14, xp: 130,
  tags: 'limits INT_MAX CHAR_BIT float.h epsilon stdint int32_t uint64_t intptr_t inttypes PRId64 size_t ptrdiff_t offsetof stbool stddef',
  why: `<p>A file your program saves on Linux can come back garbled when read on Windows — the two systems literally disagree about how many bytes some numbers take. Today you get number types that are <em>exactly</em> the same size on every machine, which is how image files, save games, and internet messages stay readable on every device on Earth.</p>`,
  html: `
<p>"How big is an <code>int</code>?" The honest C answer: <em>it depends</em>. The standard only guarantees minimums — <code>int</code> ≥ 16 bits, <code>long</code> ≥ 32, <code>long long</code> ≥ 64. Real machines disagree: on 64-bit Linux <code>long</code> is 64 bits, on 64-bit Windows it's 32! Today's headers turn that chaos into certainty.</p>

<h2>limits.h: the actual numbers on this machine</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p><code>CHAR_BIT</code> is the number of bits in a byte — 8 everywhere you'll likely ever work, but the standard permits more (some DSPs use 16 or 32). The pattern <code>sizeof(type) * CHAR_BIT</code> gives a type's bit width portably.</p>

<div data-w="q1"></div>

<h2>float.h: precision limits</h2>
<table>
<tr><th>macro</th><th>typical value</th><th>meaning</th></tr>
<tr><td><code>FLT_MAX / DBL_MAX</code></td><td>3.4×10³⁸ / 1.8×10³⁰⁸</td><td>largest finite float / double</td></tr>
<tr><td><code>FLT_EPSILON</code></td><td>1.19×10⁻⁷</td><td>smallest x where 1.0f + x ≠ 1.0f</td></tr>
<tr><td><code>DBL_EPSILON</code></td><td>2.22×10⁻¹⁶</td><td>same for double — the yardstick for relative comparisons</td></tr>
<tr><td><code>FLT_DIG / DBL_DIG</code></td><td>6 / 15</td><td>decimal digits that survive a round trip</td></tr>
</table>
<p>These are the numbers behind Part 0's "float ≈ 7 digits, double ≈ 15–16" — now you know where to look them up.</p>

<h2>The fix: stdint.h fixed-width types</h2>
<p>C99 ended the guessing game. When the exact width matters — file formats, network packets, embedded registers, overflow-sensitive math — say what you mean:</p>
<table>
<tr><th>type</th><th>meaning</th></tr>
<tr><td><code>int8_t … int64_t</code>, <code>uint8_t … uint64_t</code></td><td>exactly N bits, two's complement (mandatory since C23!) — optional only on exotic hardware</td></tr>
<tr><td><code>int_least8_t</code> …</td><td>smallest type with <em>at least</em> N bits — always exists</td></tr>
<tr><td><code>int_fast8_t</code> …</td><td>fastest type with at least N bits (often plain int under the hood)</td></tr>
<tr><td><code>intptr_t / uintptr_t</code></td><td>integer wide enough to round-trip a pointer — the only sanctioned way to store an address as an integer</td></tr>
<tr><td><code>intmax_t / INT32_MAX …</code></td><td>the widest integer type, plus a MAX/MIN macro for every type above</td></tr>
</table>

<h2>Printing them: inttypes.h</h2>
<p>Here's the trap: what printf specifier matches <code>int64_t</code>? On 64-bit Linux it's <code>long</code> (<code>%ld</code>), on Windows it's <code>long long</code> (<code>%lld</code>) — hardcode either and the other platform breaks. <code>inttypes.h</code> provides format macros that expand to the right letters via string-literal concatenation:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<h2>stddef.h & stdbool.h: the little glue types</h2>
<ul>
<li><code>size_t</code> — unsigned type of <code>sizeof</code> and array indexing; print with <code>%zu</code></li>
<li><code>ptrdiff_t</code> — signed result of subtracting pointers; print with <code>%td</code></li>
<li><code>NULL</code> — the null pointer constant (since C23 you can — and should — write <code>nullptr</code>)</li>
<li><code>bool / true / false</code> — via stdbool.h historically; real keywords in C23, no header needed</li>
<li><code>offsetof(type, member)</code> — byte offset of a member inside a struct, computed at compile time</li>
</ul>
<p><code>offsetof</code> makes struct padding (Part 2) visible. Recall why: an <code>int</code> wants a 4-aligned address, so the compiler inserts gap bytes:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<div data-w="mg1"></div>

<div data-w="q3"></div>

<h2>So which type do I use?</h2>
<div data-w="flow1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Default to <code>int</code> for small numbers, <code>size_t</code> for sizes/indexes, <code>int64_t</code> when values can get big, exact-width types at any binary boundary (files, network, hardware). Reach for unsigned types for bit manipulation — not just because a value "can't be negative" (unsigned underflow bugs in loop conditions are legion).</p></div></div>

<div data-w="ex1"></div>

<p>Types measured and pinned down — now for the standard library's wildest corner: signals that interrupt your program, and jumps that teleport across functions.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'mylimits.c',
      code: `#include <stdio.h>
#include <limits.h>
#include <float.h>

int main(void) {
    printf("CHAR_BIT   = %d bits per byte\\n", CHAR_BIT);
    printf("char       : %d .. %d\\n", CHAR_MIN, CHAR_MAX);
    printf("short      : %d .. %d\\n", SHRT_MIN, SHRT_MAX);
    printf("int        : %d .. %d\\n", INT_MIN, INT_MAX);
    printf("long       : %ld .. %ld\\n", LONG_MIN, LONG_MAX);
    printf("uint max   : %u\\n", UINT_MAX);
    printf("int bits   = %zu\\n", sizeof(int) * CHAR_BIT);
    printf("DBL_EPSILON= %g, DBL_DIG=%d\\n", DBL_EPSILON, DBL_DIG);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc mylimits.c -o mylimits && ./mylimits
CHAR_BIT   = 8 bits per byte
char       : -128 .. 127
short      : -32768 .. 32767
int        : -2147483648 .. 2147483647
long       : -9223372036854775808 .. 9223372036854775807
uint max   : 4294967295
int bits   = 32
DBL_EPSILON= 2.22045e-16, DBL_DIG=15
# note: char is signed here — that's implementation-defined!` },
    q1: { type: 'quiz', q: 'What does the C standard guarantee about <code>int</code>?', opts: ['Exactly 32 bits', 'At least 16 bits', 'The same size as long', 'At least 32 bits'], a: 1, expl: 'Only a minimum: int must span at least −32767..32767 (16 bits). It happens to be 32 bits on modern desktops, but 16-bit ints are alive and well on microcontrollers — which is exactly why stdint.h exists.' },
    code2: {
      type: 'code', title: 'fixed.c',
      code: `#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>

int main(void) {
    int32_t  file_offset = 123456;        /* exact 32 bits    */
    uint8_t  flags       = 0xC3;          /* exact byte       */
    int64_t  big         = INT64_MAX;
    int_fast16_t counter = 0;             /* whatever's quick */

    /* PRId64 expands to "ld" or "lld" as needed —
       string concatenation glues it into the format: */
    printf("big    = %" PRId64 "\\n", big);
    printf("offset = %" PRId32 ", flags = 0x%" PRIX8 "\\n",
           file_offset, flags);

    uintptr_t addr = (uintptr_t)&counter; /* pointer <-> int  */
    printf("counter lives at 0x%" PRIxPTR "\\n", addr);

    printf("sizeof int_fast16_t = %zu\\n", sizeof counter);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc fixed.c -o fixed && ./fixed
big    = 9223372036854775807
offset = 123456, flags = 0xC3
counter lives at 0x7ffc9a2b4c2c
sizeof int_fast16_t = 8
# fast16 chose a full 64-bit register on this machine!` },
    q2: { type: 'quiz', q: 'Why is <code>printf("%ld", my_int64)</code> unportable for an <code>int64_t</code>?', opts: ['%ld only prints 32 bits', 'int64_t may be long on one platform and long long on another — the specifier must match the underlying type', 'printf can\u2019t print 64-bit values', 'It\u2019s fine — int64_t is always long'], a: 1, expl: 'int64_t is a typedef for whichever native type is 64-bit: long on Linux/macOS, long long on Windows. A mismatched specifier is UB. PRId64 from inttypes.h expands to the correct letters on each platform.' },
    code3: {
      type: 'code', title: 'offsets.c',
      code: `#include <stdio.h>
#include <stddef.h>

struct packet {
    char     tag;      /* 1 byte              */
    int      value;    /* 4 bytes, wants 4-alignment */
    char     flag;     /* 1 byte              */
};

int main(void) {
    printf("offset of tag   = %zu\\n", offsetof(struct packet, tag));
    printf("offset of value = %zu\\n", offsetof(struct packet, value));
    printf("offset of flag  = %zu\\n", offsetof(struct packet, flag));
    printf("sizeof struct   = %zu\\n", sizeof(struct packet));
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc offsets.c -o offsets && ./offsets
offset of tag   = 0
offset of value = 4
offset of flag  = 8
sizeof struct   = 12
# 6 bytes of data, 12 bytes of struct: 6 bytes of padding!` },
    mg1: {
      type: 'memgrid', label: 'struct packet in memory — offsetof makes padding visible',
      note: '<code>value</code> must start at a multiple of 4, so 3 pad bytes follow <code>tag</code>; then 3 more after <code>flag</code> so the struct\u2019s total size (12) stays a multiple of 4 for arrays. Reordering members largest-first would shrink it to 8.',
      cells: [
        { addr: '+0', val: 'tag', name: 'char', hl: true },
        { addr: '+1', val: 'pad', name: '', freed: true },
        { addr: '+2', val: 'pad', name: '', freed: true },
        { addr: '+3', val: 'pad', name: '', freed: true },
        { addr: '+4', val: 'value', name: 'int (4B)', hl2: true },
        { addr: '+8', val: 'flag', name: 'char', hl: true },
        { addr: '+9', val: 'pad', name: '', freed: true },
        { addr: '+11', val: 'pad', name: '', freed: true },
      ],
    },
    q3: { type: 'quiz', q: '<code>offsetof(struct packet, value)</code> above returned 4, not 1. Why?', opts: ['offsetof counts from 1', 'int members always come first in memory', 'The compiler inserted 3 padding bytes so the int starts at a 4-aligned offset', 'sizeof(char) is 4 here'], a: 2, expl: 'Alignment (Part 5!): a 4-byte int is placed at offsets divisible by 4 for efficient access. tag occupies offset 0, offsets 1–3 are padding, value starts at 4. offsetof is how you verify a layout matches a file format or wire protocol.' },
    flow1: {
      type: 'flow', label: 'Choosing an integer type', colw: 220, rowh: 92,
      nodes: [
        { id: 's',  col: 0, row: 0, kind: 'start', label: 'need an integer' },
        { id: 'd1', col: 0, row: 1, kind: 'dec',   label: 'exact bit layout?\n(file / network / register)' },
        { id: 'ex', col: 1, row: 1, kind: 'proc',  label: 'uint32_t, int64_t …\n(stdint.h)' },
        { id: 'd2', col: 0, row: 2, kind: 'dec',   label: 'a size, length\nor array index?' },
        { id: 'sz', col: 1, row: 2, kind: 'proc',  label: 'size_t' },
        { id: 'd3', col: 0, row: 3, kind: 'dec',   label: 'can it exceed\n~2 billion?' },
        { id: 'bg', col: 1, row: 3, kind: 'proc',  label: 'int64_t\n(or long long)' },
        { id: 'it', col: 0, row: 4, kind: 'end',   label: 'plain int' },
      ],
      edges: [
        { from: 's', to: 'd1' },
        { from: 'd1', to: 'ex', label: 'yes' },
        { from: 'd1', to: 'd2', label: 'no' },
        { from: 'd2', to: 'sz', label: 'yes' },
        { from: 'd2', to: 'd3', label: 'no' },
        { from: 'd3', to: 'bg', label: 'yes' },
        { from: 'd3', to: 'it', label: 'no' },
      ],
      note: 'Rough but battle-tested. Bit-twiddling favors unsigned types; intptr_t is the one for storing pointers as integers.',
    },
    ex1: { type: 'editor', label: 'Exercise: audit your platform', height: 320, code: `#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <limits.h>

/* TODO: print, one per line:
   1. sizeof(short), sizeof(int), sizeof(long),
      sizeof(long long), sizeof(void *)
   2. whether plain 'char' is signed (hint: CHAR_MIN)
   3. sizeof(int_fast8_t) — did "fast 8-bit" stay 1 byte?
   Use %zu for every sizeof.                            */
int main(void) {

    return 0;
}`, hint: 'CHAR_MIN < 0 tells you char is signed. On x86-64 Linux expect short=2 int=4 long=8 llong=8 ptr=8; int_fast8_t is usually 1. On Windows long would be 4 — this exact table is why stdint.h exists.' },
  },
});

/* ---------------- signal.h & setjmp.h ---------------- */
CT.lesson({
  id: 'signal-setjmp',
  title: 'signal.h & setjmp.h: interrupts and teleports',
  minutes: 14, xp: 130,
  tags: 'signal SIGINT SIGSEGV handler sig_atomic_t raise setjmp longjmp nonlocal jump volatile',
  why: `<p>Pressing Ctrl+C doesn't just kill your program — it sends it a message the program can <em>catch</em>, which is how editors and servers manage to save your work before exiting instead of corrupting files. The "Segmentation fault" you've been seeing since Part 2 is literally one of these messages arriving. Today you learn to intercept them — plus C's strangest trick: a jump that teleports straight out of deeply nested function calls.</p>`,
  html: `
<p>Two of the standard library's strangest headers. <code>signal.h</code> lets the outside world interrupt your program mid-statement; <code>setjmp.h</code> lets your program teleport back through the call stack — the tower of function calls currently in progress — ignoring every <code>return</code> in between. Both are powerful, both are minefields — and both are worth understanding even if you use them rarely.</p>

<h2>Signals: asynchronous interruptions</h2>
<p>A <strong>signal</strong> is a tiny notification delivered to your process — by the OS, another process, or itself. When one arrives, normal execution is <em>suspended wherever it happens to be</em>, a handler function runs, and then execution resumes. The classics:</p>
<table>
<tr><th>signal</th><th>when</th><th>default action</th></tr>
<tr><td><code>SIGINT</code></td><td>user presses Ctrl+C</td><td>terminate</td></tr>
<tr><td><code>SIGSEGV</code></td><td>invalid memory access (your old friend segfault)</td><td>terminate + core dump</td></tr>
<tr><td><code>SIGFPE</code></td><td>fatal arithmetic error, e.g. integer division by zero</td><td>terminate + core dump</td></tr>
<tr><td><code>SIGTERM</code></td><td>polite kill request (<code>kill PID</code>)</td><td>terminate</td></tr>
<tr><td><code>SIGABRT</code></td><td><code>abort()</code> — e.g. a failed assert</td><td>terminate + core dump</td></tr>
</table>
<p><code>signal(SIGINT, handler)</code> installs your function; <code>raise(SIGINT)</code> sends a signal to yourself; <code>signal(SIGINT, SIG_IGN)</code> ignores one, <code>SIG_DFL</code> restores the default.</p>

<div data-w="q1"></div>

<h2>The one correct handler pattern</h2>
<p>Here's the hard rule: your handler may run <em>between any two instructions</em> — possibly in the middle of a <code>printf</code> or a <code>malloc</code> that's holding an internal lock. Calling those from the handler can deadlock or corrupt state. The C standard blesses almost nothing inside a handler: essentially, <b>set a flag of type <code>volatile sig_atomic_t</code> and get out</b>. The main loop notices the flag at its leisure:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Why that exact type? <code>volatile</code> (Part 3) forbids the compiler from caching the flag in a register — it must re-read memory each loop, or it would never see the handler's write. <code>sig_atomic_t</code> guarantees reads and writes happen in one indivisible step, so the handler can't observe a half-written value.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Don't printf in a signal handler.</b> It may <em>seem</em> to work — until the signal lands while printf holds its internal buffer lock, and your program deadlocks or scrambles output. Same for malloc, free, exit, and most of the library. POSIX defines a list of "async-signal-safe" functions (<code>write</code> is on it); standard C promises even less. Flag-and-return is the only fully portable pattern.</p></div></div>

<div data-w="q2"></div>

<h2>setjmp / longjmp: the non-local goto</h2>
<p><code>setjmp(buf)</code> bookmarks the current execution point (stack position, registers) and returns 0. Later — possibly many function calls deeper — <code>longjmp(buf, v)</code> <em>teleports back</em> to that bookmark: every intervening stack frame is abandoned, and the program resumes as if setjmp had just returned <code>v</code> (forced to 1 if you pass 0). One setup, two returns:</p>
<div data-w="flow1"></div>
<p>This is C's "mini exception mechanism" — libraries like libpng and Lua use it to escape from deep errors without threading error codes through every call:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The volatile locals caveat:</b> after longjmp lands, any local variable of the setjmp function that was <em>modified after setjmp</em> and isn't declared <code>volatile</code> has an <b>indeterminate value</b> — it may have lived in a register that the jump rewound. Rule: locals you change between setjmp and longjmp and read afterwards must be <code>volatile</code>.</p></div></div>

<div data-w="q3"></div>

<h2>Why it's a last resort</h2>
<p>longjmp skips every cleanup on the way down: <code>free</code> calls never happen (leaks), <code>fclose</code> never runs, locks stay locked. Jumping into a function that already returned is UB. And code with hidden teleports is simply hard to read. Prefer returning error codes; reserve setjmp/longjmp for genuinely exceptional escapes — a parser bailing out of deep recursion, a library protecting its user from internal failure — where it earns its keep.</p>

<div data-w="ex1"></div>

<p>One mystery remains from lesson one of this part: how can <code>printf</code> accept two arguments, or five, or ten? Time to write variadic functions ourselves.</p>
`,
  widgets: {
    q1: { type: 'quiz', q: 'What does pressing Ctrl+C in a terminal actually do to the foreground program?', opts: ['Kills it directly, no questions asked', 'Sends it SIGINT, whose default action is termination — but a handler can intercept it', 'Sends SIGSEGV', 'Closes its stdin'], a: 1, expl: 'Ctrl+C makes the terminal send SIGINT. Untouched, the default action terminates the process — but a program that installs a handler can finish its current job, save state, and exit cleanly instead. That’s the graceful-shutdown pattern below.' },
    code1: {
      type: 'code', title: 'graceful.c',
      code: `#include <stdio.h>
#include <signal.h>

volatile sig_atomic_t stop_requested = 0;

void on_sigint(int sig) {
    (void)sig;              /* unused parameter        */
    stop_requested = 1;     /* the ONLY safe action:   */
}                           /* set a flag and return   */

int main(void) {
    signal(SIGINT, on_sigint);
    printf("working... press Ctrl+C to stop gracefully\\n");

    unsigned long processed = 0;
    while (!stop_requested) {
        processed++;        /* pretend this is real work */
    }

    /* normal code again — printf is fine HERE */
    printf("\\ncleanly stopped after %lu items\\n", processed);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc graceful.c -o graceful && ./graceful
working... press Ctrl+C to stop gracefully
^C
cleanly stopped after 1846503219 items
# no half-written files, no lost buffers — WE chose when to exit` },
    q2: { type: 'quiz', q: 'Why must the shutdown flag be <code>volatile sig_atomic_t</code> rather than plain <code>int</code>?', opts: ['Signals can only write to that type', 'int is too small to store a signal number', 'volatile forces the loop to re-read memory each iteration, and sig_atomic_t makes each access indivisible', 'It’s just convention — int works identically'], a: 2, expl: 'Without volatile, the optimizer may hoist the flag into a register — while(!stop) becomes an infinite loop that never sees the handler’s write. And a type with non-atomic access could be caught half-updated by a signal arriving mid-write. The combination closes both holes.' },
    flow1: {
      type: 'flow', label: 'setjmp: one bookmark, two returns', colw: 220, rowh: 90,
      nodes: [
        { id: 's',   col: 0, row: 0, kind: 'start', label: 'main' },
        { id: 'sj',  col: 0, row: 1, kind: 'proc',  label: 'setjmp(buf)\nbookmarks HERE' },
        { id: 'd',   col: 0, row: 2, kind: 'dec',   label: 'returned 0?' },
        { id: 'work',col: 0, row: 3, kind: 'proc',  label: 'normal path:\ncall deep functions' },
        { id: 'lj',  col: 0, row: 4, kind: 'proc',  label: 'deep inside:\nlongjmp(buf, 1)' },
        { id: 'rec', col: 1, row: 2, kind: 'io',    label: 'error path:\nrecover / report' },
        { id: 'e',   col: 1, row: 4, kind: 'end',   label: 'continue' },
      ],
      edges: [
        { from: 's', to: 'sj' },
        { from: 'sj', to: 'd' },
        { from: 'd', to: 'work', label: 'yes: 1st time' },
        { from: 'work', to: 'lj' },
        { from: 'lj', to: 'd', side: 'left', label: 'teleport!' },
        { from: 'd', to: 'rec', label: 'no: jumped' },
        { from: 'rec', to: 'e' },
      ],
      note: 'The frames between setjmp and longjmp are simply abandoned — no returns, no cleanup. That’s both the superpower and the danger.',
    },
    code2: {
      type: 'code', title: 'miniexcept.c',
      code: `#include <stdio.h>
#include <setjmp.h>

static jmp_buf error_jump;

double safe_div(double a, double b) {
    if (b == 0.0)
        longjmp(error_jump, 1);      /* "throw"           */
    return a / b;
}

double average_rate(double dist, double time) {
    return safe_div(dist, time);     /* deep call chain   */
}

int main(void) {
    if (setjmp(error_jump) != 0) {   /* "catch"           */
        fprintf(stderr, "math error — recovered\\n");
        return 1;
    }
    printf("rate = %.1f\\n", average_rate(100.0, 2.0));
    printf("rate = %.1f\\n", average_rate(100.0, 0.0));
    printf("never reached\\n");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc miniexcept.c -o miniexcept && ./miniexcept
rate = 50.0
math error — recovered
# the second call never returned: longjmp leapt over
# average_rate AND safe_div straight back into main` },
    q3: { type: 'quiz', q: 'After a longjmp back into main, which local of main has a guaranteed value?', opts: ['All of them', 'None of them', 'Those unchanged since setjmp, plus changed ones declared <code>volatile</code>', 'Only global variables'], a: 2, expl: 'The jump may rewind registers to their setjmp-time snapshot. Locals modified after setjmp might live in those registers — unless volatile forces them to memory. Unchanged locals and volatile-qualified ones are safe; the rest are indeterminate.' },
    ex1: { type: 'editor', label: 'Exercise: a retry limit with raise', height: 340, code: `#include <stdio.h>
#include <signal.h>

volatile sig_atomic_t alarms = 0;

void on_term(int sig) {
    (void)sig;
    alarms = alarms + 1;   /* count deliveries */
}

/* TODO:
   1. install on_term as the handler for SIGTERM
   2. raise(SIGTERM) three times in the loop below
   3. after each raise, re-install the handler —
      after delivery, signal() dispositions may reset
      to SIG_DFL (implementation-defined!), and a 2nd
      SIGTERM at default would kill the program.      */
int main(void) {

    for (int i = 0; i < 3; i++) {
        /* raise here */
    }
    printf("handler ran %d times\\n", (int)alarms);
    return 0;
}`, hint: 'signal(SIGTERM, on_term); then in the loop: raise(SIGTERM); signal(SIGTERM, on_term); Expected output: "handler ran 3 times". Remove the re-install and see what happens — on many systems the 2nd raise terminates the program. (POSIX sigaction fixes this properly.)' },
  },
});

/* ---------------- variadic functions ---------------- */
CT.lesson({
  id: 'variadic-functions',
  title: 'Variadic functions: how printf really works',
  minutes: 14, xp: 130,
  tags: 'stdarg va_list va_start va_arg va_end variadic ellipsis printf promotions',
  why: `<p><code>printf</code> takes two arguments one moment and ten the next — you've leaned on that magic since your very first program without knowing how it's possible. Today you build a working mini-printf of your own, and learn why <code>printf(user_input)</code> is a genuine security hole that attackers have exploited for decades.</p>`,
  html: `
<p>Since day one you've called <code>printf("x=%d y=%d", x, y)</code> — a function that somehow accepts <em>any number of arguments of any type</em>. Today the magic trick is revealed: such functions are called <em>variadic</em> (they take a variable number of arguments), and the machinery behind them is the three-dot <code>...</code> ellipsis and <code>stdarg.h</code>. By the end you'll have written your own.</p>

<h2>The machinery: va_list and friends</h2>
<p>A declaration like <code>int my_sum(int count, ...)</code> means: one named parameter, then anything. Inside, four macros from <code>stdarg.h</code> walk the extras:</p>
<table>
<tr><th>macro</th><th>role</th></tr>
<tr><td><code>va_list ap;</code></td><td>declares a cursor over the unnamed arguments</td></tr>
<tr><td><code>va_start(ap, last)</code></td><td>points the cursor just past the last <em>named</em> parameter</td></tr>
<tr><td><code>va_arg(ap, type)</code></td><td>yields the next argument <em>as</em> <code>type</code> and advances — <b>you</b> must know the type; nothing checks</td></tr>
<tr><td><code>va_copy(dst, src)</code></td><td>clones a cursor (C99) — needed to walk the args twice</td></tr>
<tr><td><code>va_end(ap)</code></td><td>cleanup; required before returning</td></tr>
</table>
<p>Notice what's <em>missing</em>: any way to ask "how many arguments are there?" or "what type is next?". The callee is blind — that information must be smuggled in separately, which is exactly what printf's format string does. Step through the simplest possible example:</p>

<div data-w="tr1"></div>
<div data-w="q1"></div>

<h2>Build your own printf</h2>
<p>Now the real thing, miniaturized. The format string is the type map: each <code>%</code> letter tells us which type to pull with <code>va_arg</code>:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>To build a logging wrapper around real printf, don't re-parse formats — pass the whole va_list along to <code>vprintf</code>/<code>vfprintf</code>/<code>vsnprintf</code>: <code>va_start(ap, fmt); vfprintf(stderr, fmt, ap); va_end(ap);</code>. That's the v-family's whole purpose (and where <code>va_copy</code> shines if you must format twice).</p></div></div>

<h2>Default argument promotions: why %f handles float</h2>
<p>Ever wondered why printf has <code>%d</code> for int and <code>%f</code> for double — but no specifier for <code>char</code>, <code>short</code>, or <code>float</code>? Because they <b>can never arrive</b>. For arguments matched by <code>...</code>, the compiler applies the <em>default argument promotions</em>: <code>char</code> and <code>short</code> are promoted to <code>int</code>, and <code>float</code> is promoted to <code>double</code>. So <code>va_arg(ap, char)</code> is simply wrong — the value on the stack is an int:</p>
<div data-w="code2"></div>
<div data-w="q2"></div>

<h2>The price: zero type safety</h2>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p>If <code>va_arg</code> pulls the wrong type — <code>printf("%d", 3.14)</code>, <code>printf("%s", 42)</code> — the behavior is <b>undefined</b>: garbage output if you're lucky, a segfault (or an exploitable hole — look up "format string vulnerability") if you're not. Modern compilers check literal printf formats for you (<code>-Wformat</code>, and you can extend it to your own functions with GCC's <code>format</code> attribute) — but only when the format is a literal. Never write <code>printf(user_input)</code>; write <code>printf("%s", user_input)</code>.</p></div></div>

<p>Since the callee can't count arguments, every variadic API picks a protocol:</p>
<ul>
<li><b>Format string</b> — printf, scanf: the string encodes count and types.</li>
<li><b>Explicit count</b> — <code>my_sum(3, a, b, c)</code>: the first argument says how many follow.</li>
<li><b>Sentinel</b> — POSIX <code>execl("ls", "ls", "-l", (char *)NULL)</code>: a special terminator value marks the end. (Note the cast — NULL alone might not be pointer-sized in a variadic call!)</li>
</ul>

<div data-w="q3"></div>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>C23 tidied this corner:</b> <code>va_start(ap)</code> no longer needs the second argument (it's ignored if given), and a function may now be <em>fully</em> variadic — <code>int f(...)</code> with no named parameters at all, something previously illegal. The old two-argument form still works everywhere.</p></div></div>

<div data-w="ex1"></div>

<p>🎉 That's the standard library toured — every header worth knowing, from printf to setjmp. Next part we put it all to work: algorithms, Big-O, and classic data structures in C.</p>
`,
  widgets: {
    tr1: {
      type: 'trace', label: 'va_arg walks the arguments one by one', title: 'my_sum.c',
      code: `#include <stdio.h>
#include <stdarg.h>

int my_sum(int count, ...) {
    va_list ap;
    va_start(ap, count);
    int total = 0;
    for (int i = 0; i < count; i++)
        total += va_arg(ap, int);
    va_end(ap);
    return total;
}

int main(void) {
    printf("%d\\n", my_sum(3, 10, 20, 12));
    return 0;
}`,
      steps: [
        { line: 15, vars: { count: '—', ap: '—', total: '—' }, out: '', note: 'main calls my_sum with one named arg (3) and three unnamed ones.' },
        { line: 6, vars: { count: 3, ap: '→ after count', total: '—' }, out: '', note: 'va_start aims the cursor just past the last named parameter. The 10, 20, 12 are waiting in registers/stack.' },
        { line: 7, vars: { count: 3, ap: '→ after count', total: 0 }, out: '', note: '' },
        { line: 9, vars: { count: 3, i: 0, ap: '→ 2nd vararg', total: 10 }, out: '', note: 'va_arg(ap, int) reads 10 AND advances the cursor. We told it "int" — nothing verified that.' },
        { line: 9, vars: { count: 3, i: 1, ap: '→ 3rd vararg', total: 30 }, out: '', note: 'Second pull: 20. The count parameter is our only way to know when to stop.' },
        { line: 9, vars: { count: 3, i: 2, ap: '→ past the end', total: 42 }, out: '', note: 'Third pull: 12. One more va_arg would read garbage — UB.' },
        { line: 10, vars: { count: 3, ap: '(ended)', total: 42 }, out: '', note: 'va_end closes the cursor. Required, even though it’s often a no-op.' },
        { line: 11, vars: { count: 3, total: 42 }, out: '', note: 'Return the total like any normal function.' },
        { line: 15, vars: { count: '—', total: '—' }, out: '42\n', note: 'Had main passed my_sum(5, 10, 20, 12) — claiming five args — va_arg would have walked into undefined territory. The caller’s count is a promise, not a fact.' },
      ],
    },
    q1: { type: 'quiz', q: 'How does a variadic function know how many unnamed arguments it received?', opts: ['va_start returns the count', 'sizeof(ap) reveals it', 'It can’t — the caller must communicate it (count parameter, format string, or sentinel)', 'va_arg returns NULL after the last one'], a: 2, expl: 'The mechanism is completely blind: no count, no types, no end marker. Every variadic API layers its own protocol on top — printf’s format string, my_sum’s count, execl’s NULL sentinel. Get the protocol wrong and it’s UB.' },
    code1: {
      type: 'code', title: 'miniprintf.c',
      code: `#include <stdio.h>
#include <stdarg.h>

void mini_printf(const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    for (const char *p = fmt; *p; p++) {
        if (*p != '%') { putchar(*p); continue; }
        switch (*++p) {                /* char after '%' */
        case 'd': printf("%d", va_arg(ap, int));      break;
        case 'f': printf("%g", va_arg(ap, double));   break;
        case 's': fputs(va_arg(ap, const char *), stdout); break;
        case 'c': putchar(va_arg(ap, int));           break;
        case '%': putchar('%');                       break;
        }
    }
    va_end(ap);
}

int main(void) {
    mini_printf("%s scored %d points (%f%%) — grade %c\\n",
                "ada", 97, 97.5, 'A');
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc miniprintf.c -o miniprintf && ./miniprintf
ada scored 97 points (97.5%) — grade A
# the format string told us the type sequence:
# char* , int , double , int(char)` },
    code2: {
      type: 'code', title: 'promotions.c — what the callee actually receives', run: false,
      code: `void f(int count, ...);

char  c = 'A';       /* passed through ... as: int    */
short s = 7;         /* as: int                       */
float x = 2.5f;      /* as: double                    */

f(3, c, s, x);
/* inside f, the ONLY correct pulls are:
     va_arg(ap, int)     for c
     va_arg(ap, int)     for s
     va_arg(ap, double)  for x
   va_arg(ap, char) / (short) / (float) are UB —
   those types can never come through the ellipsis.  */`
    },
    q2: { type: 'quiz', q: 'You pass a <code>float f</code> to printf. Which specifier is correct?', opts: ['<code>%f</code> — the float was promoted to double on the way in', '<code>%hf</code> for half precision', 'Floats can’t be printed without a cast', '<code>%lf</code> is required for the promotion'], a: 0, expl: 'Default argument promotions convert every float argument to double before it enters the .... So %f (which expects double) is exactly right — printf never sees a real float. (%lf is also accepted for printf since C99, but it’s the same thing.)' },
    q3: { type: 'quiz', q: 'What does <code>printf("%s", 42)</code> do?', opts: ['Prints "42"', 'Compile error, guaranteed', 'Undefined behavior — printf dereferences 42 as if it were a char pointer', 'Prints the address 42'], a: 2, expl: 'va_arg pulls the 42 and treats it as a char* to walk and print — reading address 42 is UB, usually a segfault. Compilers catch this for literal formats (-Wformat is on by default in warnings), which is one great reason to keep formats literal.' },
    ex1: { type: 'editor', label: 'Exercise: write my_max', height: 320, code: `#include <stdio.h>
#include <stdarg.h>

/* TODO: return the largest of 'count' int arguments.
   Walk them with va_list / va_start / va_arg / va_end.
   Start best-so-far at the FIRST vararg, not at 0 —
   otherwise all-negative inputs break.               */
int my_max(int count, ...) {
    return 0;  /* fix me */
}

int main(void) {
    printf("%d\\n", my_max(3, 5, 9, 2));        /* want 9   */
    printf("%d\\n", my_max(1, 42));             /* want 42  */
    printf("%d\\n", my_max(4, -8, -3, -99, -5)); /* want -3 */
    return 0;
}`, hint: 'va_start(ap, count); int best = va_arg(ap, int); then loop count-1 more pulls, keeping the max; va_end(ap); return best. Bonus: write my_maxd for doubles — remember floats arrive as doubles anyway.' },
  },
});
