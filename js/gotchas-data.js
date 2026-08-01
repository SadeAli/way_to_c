/* ============================================================
   gotchas-data.js — data for the "C Gotchas" gallery.
   Every `code` sample was compiled AND executed via the
   godbolt API (gcc 15.1, cg151, x86-64 Linux) on 2026-08-01;
   the `actual` field records the verified observed behavior.
   ============================================================ */
window.GOTCHAS = [
  {
    id: "int-division",
    emoji: "➗",
    title: "Integer division silently throws away the fraction",
    hook: "Quick: what does 7 / 2 print?",
    code: `#include <stdio.h>

int main(void) {
    printf("7 / 2       = %d\\n", 7 / 2);
    int total = 90 + 91;
    printf("average     = %d\\n", total / 2);
    printf("100 C in F  = %d\\n", 100 * (9 / 5) + 32);
    return 0;
}`,
    expected: "3.5 for 7/2, 90.5 for the average, 212 for the temperature",
    actual: "3, 90, and 132 — every fraction was silently discarded",
    why: "<p>When <em>both</em> operands of <code>/</code> are integers, C performs integer division and truncates toward zero (C17 6.5.5) — the fractional part simply vanishes. That is why the average of 90 and 91 is \"90\", and why the Fahrenheit formula collapses: <code>9 / 5</code> is <code>1</code>, so the whole conversion becomes <code>100 + 32</code>. The fix costs one character: make either operand floating point — <code>7 / 2.0</code>, or <code>total / 2.0</code> stored in a <code>double</code>.</p>",
    lesson: "operators-arithmetic",
    ub: false,
  },
  {
    id: "modulo-negative",
    emoji: "🧭",
    title: "Modulo of a negative number is negative",
    hook: "Everyone knows % wraps around... so what is -7 % 3?",
    code: `#include <stdio.h>

int main(void) {
    printf(" 7 %% 3 = %d\\n", 7 % 3);
    printf("-7 %% 3 = %d\\n", -7 % 3);
    int i = -1;
    printf("wrapped index: %d\\n", i % 5);
    return 0;
}`,
    expected: "2 — like Python, so -1 % 5 gives a friendly wrap-around index of 4",
    actual: "-7 % 3 is -1, and -1 % 5 is -1 — a negative \"index\"",
    why: "<p>Since C99, integer division truncates toward zero, and <code>%</code> must satisfy <code>(a/b)*b + a%b == a</code> (C17 6.5.5) — so the result of <code>%</code> takes the <em>sign of the dividend</em>. Python floors instead, which is why the two languages disagree about every negative operand. If you want a wrap-around array index that is always non-negative, use the idiom <code>((i % n) + n) % n</code>.</p>",
    lesson: "operators-arithmetic",
    ub: false,
  },
  {
    id: "assignment-in-condition",
    emoji: "🔓",
    title: "if (x = 1): the assignment that always says yes",
    hook: "One missing = turns a login check into a skeleton key.",
    code: `#include <stdio.h>

int main(void) {
    int logged_in = 0;
    if (logged_in = 1)
        printf("Welcome back, admin!\\n");
    else
        printf("Access denied.\\n");
    printf("logged_in is now %d\\n", logged_in);
    return 0;
}`,
    expected: "logged_in is 0, so the check fails and it prints \"Access denied.\"",
    actual: "prints \"Welcome back, admin!\" — and logged_in has been overwritten to 1",
    why: "<p><code>=</code> assigns, <code>==</code> compares — and both are legal inside a condition. An assignment is an expression whose value is the value assigned, so <code>if (logged_in = 1)</code> stores 1 and then tests 1: nonzero, true, <em>every single time</em>. No error, no warning by default — just silently broken logic. Compile with <code>-Wall</code> and GCC will ask if you really meant it (and suggest extra parentheses when you do).</p>",
    lesson: "operators-comparison",
    ub: false,
  },
  {
    id: "semicolon-after-if",
    emoji: "🫥",
    title: "The semicolon that ate the if",
    hook: "Why does this program insist it is boiling at 10 degrees?",
    code: `#include <stdio.h>

int main(void) {
    int temperature = 10;
    if (temperature > 30);
        printf("It's boiling outside!\\n");
    printf("(temperature is %d)\\n", temperature);
    return 0;
}`,
    expected: "the printf runs only when temperature > 30",
    actual: "\"It's boiling outside!\" prints at every temperature",
    why: "<p>That innocent semicolon in <code>if (temperature &gt; 30);</code> is a complete, <em>empty statement</em> — and it is the entire body of the if. The condition is dutifully evaluated, controls nothing, and the indented printf below is just the next statement, running unconditionally. The same trap works on <code>while</code> and <code>for</code>, where <code>while (cond);</code> becomes an accidental infinite loop. GCC's <code>-Wall</code> flags the suspicious empty body.</p>",
    lesson: "if-else",
    ub: false,
  },
  {
    id: "dangling-else",
    emoji: "🎭",
    title: "The else that pairs with the wrong if",
    hook: "The indentation says one thing. The compiler sees another.",
    code: `#include <stdio.h>

int main(void) {
    int a = 0, b = 1;
    if (a == 1)
        if (b == 1)
            printf("a and b are both 1\\n");
    else
        printf("a is not 1\\n");
    printf("done\\n");
    return 0;
}`,
    expected: "a is 0, so the else fires and prints \"a is not 1\"",
    actual: "only \"done\" prints — the else secretly belongs to the INNER if",
    why: "<p>C attaches an <code>else</code> to the <em>nearest</em> unmatched <code>if</code> (C17 6.8.4.1) — indentation is invisible to the parser. Here the else pairs with <code>if (b == 1)</code>, and since the outer condition <code>a == 1</code> is false, the whole inner if/else never runs at all. Braces around every if body make the pairing explicit and the trap impossible — which is exactly why style guides insist on them.</p>",
    lesson: "if-else",
    ub: false,
  },
  {
    id: "switch-fallthrough",
    emoji: "🕳️",
    title: "switch cases fall through by default",
    hook: "Second place should win one medal. It wins three.",
    code: `#include <stdio.h>

int main(void) {
    int place = 2;
    switch (place) {
        case 1:  printf("gold medal\\n");
        case 2:  printf("silver medal\\n");
        case 3:  printf("bronze medal\\n");
        default: printf("thanks for playing\\n");
    }
    return 0;
}`,
    expected: "place is 2, so it prints just \"silver medal\"",
    actual: "prints silver medal, bronze medal, AND thanks for playing",
    why: "<p>A <code>case</code> label is just an entry point, not a fence: once execution jumps in, it keeps flowing straight through every following case until it hits a <code>break</code> or the end of the switch (C17 6.8.4.2). Forgetting <code>break</code> is one of the oldest bugs in C — famous enough that C23 added the <code>[[fallthrough]]</code> attribute so you can mark the rare times you fall through <em>on purpose</em>. GCC's <code>-Wimplicit-fallthrough</code> (part of <code>-Wextra</code>) catches the accidental kind.</p>",
    lesson: "switch-case",
    ub: false,
  },
  {
    id: "comma-operator",
    emoji: "🪢",
    title: "The comma operator keeps only the last value",
    hook: "a = (1, 2, 3) and b = 1, 2, 3 — surely the same thing?",
    code: `#include <stdio.h>

int main(void) {
    int a = (1, 2, 3);               /* comma: run all, keep the LAST */
    int b;
    b = 1, 2, 3;                     /* = binds tighter than , */
    printf("a = %d\\n", a);
    printf("b = %d\\n", b);
    return 0;
}`,
    expected: "both variables end up holding the same value, whatever it is",
    actual: "a = 3 but b = 1 — the two lines parse completely differently",
    why: "<p>The comma <em>operator</em> evaluates left to right and yields only its <em>last</em> operand (C17 6.5.17), so <code>(1, 2, 3)</code> is 3. But comma has the <em>lowest</em> precedence in C — lower than <code>=</code> — so <code>b = 1, 2, 3</code> parses as <code>(b = 1), 2, 3</code>: b gets 1 and the rest is evaluated and discarded. The comma earns its keep in <code>for</code> headers like <code>i++, j--</code>; anywhere else it is usually a bug wearing a disguise.</p>",
    lesson: "loops-for",
    ub: false,
  },
  {
    id: "bitwise-and-vs-equals",
    emoji: "🎯",
    title: "== binds tighter than &",
    hook: "flags is binary 110. So why does C swear bit 2 is clear?",
    code: `#include <stdio.h>

int main(void) {
    int flags = 6;                       /* binary 110: bit 2 is set */
    if (flags & 4 == 4)
        printf("bit 2 is set\\n");
    else
        printf("bit 2 is NOT set\\n");
    printf("flags & 4 == 4 evaluates to %d\\n", flags & 4 == 4);
    return 0;
}`,
    expected: "it tests (flags & 4) == 4 and reports that bit 2 is set",
    actual: "reports \"bit 2 is NOT set\" — it computed flags & (4 == 4), i.e. 6 & 1 = 0",
    why: "<p>The comparison operators outrank the bitwise operators <code>&amp;</code>, <code>^</code> and <code>|</code> in C's precedence table, so <code>flags &amp; 4 == 4</code> parses as <code>flags &amp; (4 == 4)</code> — that's <code>6 &amp; 1</code>, which is 0. This ranking is a historical accident from before C had <code>&amp;&amp;</code>, and Dennis Ritchie himself listed it among his regrets. The rule to tattoo somewhere visible: <em>always parenthesize bit tests</em> — <code>(flags &amp; 4) == 4</code> or simply <code>flags &amp; 4</code> as the whole condition.</p>",
    lesson: "operators-bitwise",
    ub: false,
  },
  {
    id: "shift-vs-plus",
    emoji: "↔️",
    title: "x << 2 + 1 is not (x << 2) + 1",
    hook: "Shift left by two, then add one. C hears something else.",
    code: `#include <stdio.h>

int main(void) {
    int x = 1;
    printf("x << 2 + 1   = %d\\n", x << 2 + 1);
    printf("(x << 2) + 1 = %d\\n", (x << 2) + 1);
    return 0;
}`,
    expected: "1 shifted left twice is 4, plus 1 makes 5",
    actual: "8 — it parsed as 1 << (2 + 1)",
    why: "<p>Addition binds tighter than the shift operators, so <code>x &lt;&lt; 2 + 1</code> means <code>x &lt;&lt; 3</code>. This bites hardest in bit-packing code like <code>base &lt;&lt; 4 + offset</code>, which quietly shifts by the wrong amount instead of adding after the shift. Same medicine as every precedence trap: parentheses around anything mixing shifts with arithmetic — they cost nothing and remove all doubt.</p>",
    lesson: "operators-bitwise",
    ub: false,
  },
  {
    id: "float-equality",
    emoji: "🎈",
    title: "0.1 + 0.2 is not 0.3",
    hook: "The most famous decimal lie in computing.",
    code: `#include <stdio.h>

int main(void) {
    double sum = 0.1 + 0.2;
    if (sum == 0.3)
        printf("equal\\n");
    else
        printf("NOT equal: sum is %.17f\\n", sum);
    return 0;
}`,
    expected: "equal — 0.1 + 0.2 is 0.3, this is grade-school math",
    actual: "NOT equal: the sum is 0.30000000000000004",
    why: "<p>Doubles are <em>binary</em> fractions, and 0.1, 0.2, 0.3 all fall between the representable ones — each literal is really the nearest binary neighbor, and the rounding errors of <code>0.1 + 0.2</code> don't land exactly on the neighbor chosen for <code>0.3</code>. Nothing overflowed and nothing is broken; the values differ in the 17th decimal place, and <code>==</code> is merciless about it. Compare floating-point with a tolerance — <code>fabs(a - b) &lt; 1e-9</code> — or work in integer units (cents, not dollars).</p>",
    lesson: "floating-point",
    ub: false,
  },
  {
    id: "uninitialized-variable",
    emoji: "🎲",
    title: "Uninitialized locals are stack garbage",
    hook: "sum starts at 0 automatically... doesn't it?",
    code: `#include <stdio.h>

void scribble(void) {
    volatile int junk[6] = {111111, 222222, 333333, 444444, 555555, 666666};
    (void)junk[0];
}

int sum_to(int n) {
    int sum;                         /* forgot  = 0  */
    for (int i = 1; i <= n; i++) sum += i;
    return sum;
}

int main(void) {
    scribble();
    printf("1+2+3+4+5 = %d\\n", sum_to(5));
    return 0;
}`,
    expected: "1+2+3+4+5 = 15",
    actual: "printed 29491 on our verified run — 15 plus whatever garbage the previous call left on the stack (a different number in every environment; -O2 happened to print 15)",
    why: "<p>Automatic (local) variables are <em>not</em> zeroed — <code>sum</code> begins life as whatever bytes the last function call left in that stack slot, which is exactly why <code>scribble()</code> runs first here: to salt the stack and make the garbage visible. Using an indeterminate value like this is undefined behavior (C17 6.3.2.1), and the result genuinely changes between machines, runs, and optimization levels. Initialize at the point of declaration, always — and note that <code>static</code> and global variables <em>are</em> zero-initialized, which is why this bug loves to appear only after a refactor moves a variable.</p>",
    lesson: "variables-types",
    ub: true,
  },
  {
    id: "printf-wrong-specifier",
    emoji: "🃏",
    title: "Lying to printf about a type",
    hook: "Print a double with %d — and watch your 3.14 come out of a different printf.",
    code: `#include <stdio.h>

int main(void) {
    double price = 3.14;
    printf("with %%d: %d\\n", price);
    printf("with %%f: %f\\n", 42);
    return 0;
}`,
    expected: "with %d: 3 (truncated, maybe?), with %f: 42.000000",
    actual: "%d printed garbage (1664582216 on our verified run) — and %f printed 3.140000, the 3.14 left over in a floating-point register!",
    why: "<p>printf cannot see your types — it trusts the format string and reads whatever the specifier implies from the varargs machinery. On x86-64, doubles travel in floating-point registers and ints in integer registers, so <code>%d</code> read an integer register nobody had set (garbage), and the later <code>%f</code> read the float register still holding 3.14 from the first call. A mismatched conversion specifier is undefined behavior per C17 7.21.6.1p9 — the spooky register reuse is just one way it can look. <code>-Wall</code> makes GCC check format strings against arguments; treat those warnings as errors.</p>",
    lesson: "variables-types",
    ub: true,
  },
  {
    id: "scanf-missing-ampersand",
    emoji: "💥",
    title: "scanf without & is a crash, not a typo",
    hook: "One missing character stands between you and a segfault.",
    code: `#include <stdio.h>

int main(void) {
    int age = 0;
    scanf("%d", age);                /* forgot the & */
    printf("You are %d\\n", age);
    return 0;
}`,
    expected: "reads 21 from input and prints \"You are 21\"",
    actual: "instant crash (SIGSEGV) — scanf tried to write the number to address 0",
    why: "<p><code>scanf</code> must <em>modify</em> your variable, so it needs the variable's address: <code>scanf(\"%d\", &amp;age)</code>. Passing <code>age</code> instead hands scanf the <em>value</em> 0, which it dutifully uses as the address to store into — undefined behavior, and on our verified run an immediate segmentation fault. It won't always be so merciful: had <code>age</code> held stack garbage that happened to be a writable address, scanf would corrupt memory silently. GCC's format checking (<code>-Wall</code>) catches this one at compile time — let it.</p>",
    lesson: "stdio-lib",
    ub: true,
  },
  {
    id: "char-swallows-eof",
    emoji: "🕵️",
    title: "Why getchar returns int, not char",
    hook: "A perfectly normal byte in your file that looks exactly like EOF.",
    code: `#include <stdio.h>

int main(void) {
    char c = 0xFF;     /* a perfectly normal data byte, say from an image */
    if (c == EOF)
        printf("Looks like the end of the file!\\n");
    printf("c = %d, EOF = %d\\n", c, EOF);
    return 0;
}`,
    expected: "0xFF is just byte 255 — nothing like the end-of-file marker",
    actual: "prints \"Looks like the end of the file!\" — stored in a char, 0xFF is -1, which equals EOF",
    why: "<p><code>getchar()</code> returns <code>int</code> for a reason: it must express 257 distinct results — all 256 byte values <em>plus</em> <code>EOF</code> (-1). Squeeze the result into a <code>char</code> and the distinction dies: on x86-64 Linux, where plain char is signed, the honest data byte 0xFF becomes -1 and compares equal to EOF, so reading a binary file stops early. On platforms where char is unsigned (ARM Linux!), it's the opposite disaster — <code>c == EOF</code> is <em>never</em> true and the read loop never ends. Whether char is signed is implementation-defined (C17 6.2.5); the cure is always <code>int c = getchar();</code>.</p>",
    lesson: "stdio-lib",
    ub: false,
  },
  {
    id: "sizeof-char-literal",
    emoji: "🔤",
    title: "sizeof 'a' is 4, because 'a' is an int",
    hook: "sizeof 'a' — one byte, obviously?",
    code: `#include <stdio.h>

int main(void) {
    char c = 'a';
    printf("sizeof 'a'   = %zu\\n", sizeof 'a');
    printf("sizeof c     = %zu\\n", sizeof c);
    printf("sizeof(char) = %zu\\n", sizeof(char));
    return 0;
}`,
    expected: "1 — 'a' is a character",
    actual: "sizeof 'a' is 4, while sizeof c and sizeof(char) are 1",
    why: "<p>In C, a character constant like <code>'a'</code> has type <code>int</code> (C17 6.4.4.4p10) — it only becomes a one-byte value when you store it into a <code>char</code>. So <code>sizeof 'a'</code> is <code>sizeof(int)</code>, 4 on this platform. C++ chose differently (<code>'a'</code> is a <code>char</code> there, size 1), making this the classic \"is this file really C?\" interview question. Mostly harmless trivia — until you memcpy <code>sizeof 'x'</code> bytes and stomp three neighbors.</p>",
    lesson: "sizeof",
    ub: false,
  },
  {
    id: "integer-promotion-tilde",
    emoji: "🪜",
    title: "unsigned char b = ~a, and yet b != ~a",
    hook: "Flip the bits of 0xFF and compare. C says they're different.",
    code: `#include <stdio.h>

int main(void) {
    unsigned char a = 0xFF;
    unsigned char b = ~a;            /* surely b == ~a now... */
    printf("b       = %u\\n", b);
    printf("~a      = %d\\n", ~a);
    printf("b == ~a : %d\\n", b == ~a);
    return 0;
}`,
    expected: "~0xFF is 0x00, so b == ~a prints 1",
    actual: "b = 0 but ~a = -256, so b == ~a prints 0",
    why: "<p>Before almost any arithmetic happens, C silently widens anything smaller than <code>int</code> up to <code>int</code> — the <em>integer promotions</em> (C17 6.3.1.1). So <code>~a</code> is not 8-bit bit-flipping: <code>a</code> becomes the int 255, and <code>~255</code> is -256. Assigning that to <code>b</code> truncates back to 0, but the comparison <code>b == ~a</code> happens in int-land: 0 versus -256. When you need byte-sized bit math to stay byte-sized, mask it: <code>(unsigned char)~a</code> or <code>~a &amp; 0xFF</code>.</p>",
    lesson: "casting-conversions",
    ub: false,
  },
  {
    id: "unsigned-underflow",
    emoji: "🌀",
    title: "Unsigned numbers can't go below zero — they wrap",
    hook: "3 minus 5 equals 4,294,967,294 items in stock.",
    code: `#include <stdio.h>

int main(void) {
    unsigned int have = 3, need = 5;
    printf("have - need = %u\\n", have - need);
    unsigned int u = 0;
    if (u - 1 < 0)
        printf("u - 1 is negative\\n");
    else
        printf("u - 1 = %u, and it can NEVER be negative\\n", u - 1);
    return 0;
}`,
    expected: "have - need is -2, and u - 1 is less than 0 when u is 0",
    actual: "have - need = 4294967294, and the u - 1 < 0 branch can never run",
    why: "<p>Unsigned arithmetic is defined as modulo 2<sup>N</sup> (C17 6.2.5p9) — dip below zero and you wrap to the top. That's not a bug in the compiler; it's the deal you signed by writing <code>unsigned</code>. Worse, the <em>usual arithmetic conversions</em> drag signed values along: compare an <code>int</code> to an <code>unsigned</code> and the int converts, so <code>-1 &gt; 2000000000u</code> is true. This is why <code>for (size_t i = n - 1; i &gt;= 0; i--)</code> loops forever — a <code>size_t</code> is <em>always</em> ≥ 0 — and why subtracting sizes is a minefield: prefer <code>if (have &gt;= need)</code> over inspecting <code>have - need</code>.</p>",
    lesson: "casting-conversions",
    ub: false,
  },
  {
    id: "signed-overflow",
    emoji: "🧨",
    title: "INT_MAX + 1 is undefined, not just wrong",
    hook: "Add 1 to the biggest int. What could go wrong?",
    code: `#include <stdio.h>
#include <limits.h>

int main(void) {
    int n = INT_MAX;
    printf("n     = %d\\n", n);
    printf("n + 1 = %d\\n", n + 1);
    return 0;
}`,
    expected: "2147483648 — or at worst some error",
    actual: "printed -2147483648 on our verified run: positive + positive = negative. And because it is UB, the optimizer may assume it never happens at all",
    why: "<p>Signed integer overflow is undefined behavior (C17 6.5p5) — the standard doesn't promise wraparound, garbage, or anything else. At <code>-O0</code> you'll typically observe the two's-complement wrap shown here, which lulls people into trusting it; at <code>-O2</code> GCC instead <em>assumes overflow cannot happen</em> and deletes \"impossible\" code — the classic victim being the safety check <code>if (n + 1 &lt; n)</code>, optimized away entirely. Contrast with unsigned types, whose wraparound is fully defined. If you need to detect overflow, check <em>before</em> the operation (<code>n &gt; INT_MAX - 1</code>) or use GCC's <code>__builtin_add_overflow</code>.</p>",
    lesson: "undefined-behavior",
    ub: true,
  },
  {
    id: "shift-by-width",
    emoji: "🎰",
    title: "Shifting a 32-bit int by 32 places",
    hook: "1 << 32 — zero, obviously? This program printed 1.",
    code: `#include <stdio.h>

int main(void) {
    unsigned int x = 1;
    int n = 32;
    printf("1 << 31 = %u\\n", x << 31);
    printf("1 << 32 = %u\\n", x << n);
    return 0;
}`,
    expected: "0 — every bit was shifted out the far end",
    actual: "printed 1 at -O0 (the x86 shift instruction masks the count to 5 bits, so 32 acts like 0) — and 0 at -O2 when the compiler folds it. Same program, two answers",
    why: "<p>Shifting by an amount ≥ the width of the (promoted) type is undefined behavior (C17 6.5.7p3) — and this one shows why \"UB\" doesn't mean \"crash\": the program runs happily and simply gives different answers depending on who computes the shift. The x86 <code>shl</code> instruction masks its count mod 32, so at runtime <code>1 &lt;&lt; 32</code> becomes <code>1 &lt;&lt; 0</code>; when the optimizer constant-folds it instead, it can produce 0 (or anything else). Note the promotion angle too: <code>1 &lt;&lt; 31</code> already overflows a signed int — for bit masks, work unsigned and keep counts strictly below the width.</p>",
    lesson: "undefined-behavior",
    ub: true,
  },
  {
    id: "sizeof-array-parameter",
    emoji: "📦",
    title: "Array parameters are secretly pointers",
    hook: "Ten elements go in. The function counts two.",
    code: `#include <stdio.h>

void report(int arr[]) {
    printf("inside func: %zu elements?\\n", sizeof(arr) / sizeof(arr[0]));
}

int main(void) {
    int a[10] = {0};
    printf("in main    : %zu elements\\n", sizeof(a) / sizeof(a[0]));
    report(a);
    return 0;
}`,
    expected: "both lines print 10 elements",
    actual: "in main: 10 elements — inside the function: 2 (sizeof gave the size of a pointer, 8, not the array, 40)",
    why: "<p>A parameter declared <code>int arr[]</code> — even <code>int arr[10]</code> — is <em>adjusted</em> to <code>int *arr</code> (C17 6.7.6.3p7): arrays are never passed by value in C, only a pointer to their first element travels. So inside the function, <code>sizeof(arr)</code> is <code>sizeof(int *)</code> = 8, and the \"element count\" is 8/4 = 2 regardless of what was passed. The <code>sizeof a / sizeof a[0]</code> trick works only where the actual array is in scope; a function must be handed the length as a separate parameter. GCC even ships a dedicated warning for this one: <code>-Wsizeof-array-argument</code>.</p>",
    lesson: "arrays-vs-pointers",
    ub: false,
  },
  {
    id: "off-by-one-overflow",
    emoji: "🧱",
    title: "i <= 5 walks one step past the end",
    hook: "We zero five scores. So why is total wiped too?",
    code: `#include <stdio.h>

int main(void) {
    struct { int scores[5]; int total; } s = { {10, 20, 30, 40, 50}, 150 };
    for (int i = 0; i <= 5; i++)     /* <=  goes one step too far */
        s.scores[i] = 0;
    printf("total = %d\\n", s.total); /* we never touched total... right? */
    return 0;
}`,
    expected: "total = 150 — the loop only touches scores",
    actual: "total = 0: writing scores[5] landed on the neighboring field (verified at -O0; at -O2 the same UB happened to leave total at 150)",
    why: "<p>An array of 5 has valid indexes 0 through 4 — the condition <code>i &lt;= 5</code> performs six writes, and <code>scores[5]</code> is one past the end: undefined behavior (C17 6.5.6). Here the stray write deterministically lands on <code>total</code>, the next struct member in memory — a tidy demonstration of how buffer overflows corrupt whatever innocent data lives next door (in real programs: other variables, heap bookkeeping, return addresses — the raw material of security exploits). The idiomatic C loop is <code>for (i = 0; i &lt; N; i++)</code>: start at 0, compare with <code>&lt;</code>, and the count of iterations equals N.</p>",
    lesson: "arrays",
    ub: true,
  },
  {
    id: "missing-null-terminator",
    emoji: "🚷",
    title: "A string without its \\0 doesn't know where to stop",
    hook: "Five letters, five bytes. What could printf get wrong?",
    code: `#include <stdio.h>

int main(void) {
    struct {
        char word[5];
        char next[9];
    } s = { {'h', 'e', 'l', 'l', 'o'}, "neighbor" };
    printf("word = %s\\n", s.word);
    return 0;
}`,
    expected: "word = hello",
    actual: "word = helloneighbor — printf kept walking straight into the next field",
    why: "<p>A C string is bytes-until-<code>\\0</code>, so \"hello\" really needs <em>six</em> bytes. The initializer <code>{'h','e','l','l','o'}</code> fills all five slots of <code>word</code> with letters and leaves no room for the terminator — and <code>%s</code>, which just walks memory until it meets a zero byte, strolls past the end into <code>next</code>. That out-of-bounds read is undefined behavior; here the struct layout makes the damage visible and repeatable. Write <code>char word[6] = \"hello\";</code> (or let the compiler count: <code>char word[] = \"hello\";</code>) and the terminator is included automatically.</p>",
    lesson: "strings",
    ub: true,
  },
  {
    id: "strncpy-not-terminated",
    emoji: "✂️",
    title: "strncpy doesn't promise a \\0",
    hook: "The \"safe\" string copy that quietly leaves strings unterminated.",
    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    struct { char dst[4]; char after[10]; } s;
    strcpy(s.after, "OOPS!");
    strncpy(s.dst, "gotcha", sizeof s.dst);   /* copies g,o,t,c - no '\\0' */
    printf("dst = %s\\n", s.dst);
    return 0;
}`,
    expected: "dst = \"gotc\" — truncated, but a proper string",
    actual: "dst = gotcOOPS! — four characters were copied, no terminator was written, and printf ran on into the next field",
    why: "<p><code>strncpy</code> has a nasty contract (C17 7.24.2.4): if the source has ≥ n characters, it copies <em>exactly n</em> and does <strong>not</strong> write a terminator. \"gotcha\" is longer than 4, so <code>dst</code> got <code>g o t c</code> and nothing else — an unterminated buffer that <code>%s</code> happily reads past (undefined behavior, made visible here by the neighboring field). Despite the reassuring <code>n</code> in the name, strncpy was designed for fixed-width fields in 1970s Unix directory entries, not for safety. Either terminate manually — <code>dst[sizeof dst - 1] = '\\0';</code> — or use <code>snprintf(dst, sizeof dst, \"%s\", src)</code>, which always terminates.</p>",
    lesson: "string-lib",
    ub: true,
  },
  {
    id: "strcmp-zero-means-equal",
    emoji: "🔐",
    title: "strcmp returns 0 when strings are EQUAL",
    hook: "The password is correct. The program says it is wrong.",
    code: `#include <stdio.h>
#include <string.h>

int main(void) {
    char stored[] = "hunter2", typed[] = "hunter2";
    if (strcmp(stored, typed))
        printf("Password accepted!\\n");
    else
        printf("Wrong password.\\n");
    return 0;
}`,
    expected: "the strings match, strcmp reports success, \"Password accepted!\"",
    actual: "prints \"Wrong password.\" — strcmp returned 0 (falsy) precisely because the strings are equal",
    why: "<p><code>strcmp</code> is not an \"are these equal?\" predicate — it's a three-way comparison for <em>sorting</em>: negative if the first string orders earlier, positive if later, and <code>0</code> on equality. Used bare in a condition, that 0 is falsy, so <code>if (strcmp(a, b))</code> actually means \"if <em>different</em>\" — the exact opposite of what it appears to say. Always compare the result explicitly: <code>strcmp(a, b) == 0</code> for equality. (Bonus trap in the same family: <code>a == b</code> on two char arrays compares their <em>addresses</em>, never their contents.)</p>",
    lesson: "string-lib",
    ub: false,
  },
  {
    id: "dangling-stack-pointer",
    emoji: "🧟",
    title: "Returning the address of a local variable",
    hook: "The function returned an address. The variable did not survive the trip.",
    code: `#include <stdio.h>

int *birthday(void) {
    int candles = 21;
    return &candles;                 /* address of a variable about to die */
}

void party(void) {
    volatile int balloons[4] = {99, 98, 97, 96};
    (void)balloons[0];
}

int main(void) {
    int *p = birthday();
    party();
    printf("candles: %d\\n", *p);
    return 0;
}`,
    expected: "candles: 21",
    actual: "crash (SIGSEGV) — GCC spotted the escape, warned, and returned NULL instead of the dead address; on compilers that return the real address you read whatever the next call scribbled there",
    why: "<p><code>candles</code> lives in <code>birthday</code>'s stack frame, which is torn down the moment the function returns — the returned pointer refers to memory whose lifetime has ended, and using it is undefined behavior (C17 6.2.4). It's treacherous because it often <em>appears</em> to work: the stale value survives until the next call (here, <code>party()</code>) reuses the frame. GCC's <code>-Wreturn-local-addr</code> warning fires on this pattern and the compiler deliberately returns NULL instead, converting a subtle corruption into the honest crash we verified. To return data from a function, return it <em>by value</em>, or hand back <code>malloc</code>'d memory, or write into a caller-supplied buffer.</p>",
    lesson: "scope-lifetime",
    ub: true,
  },
  {
    id: "use-after-free",
    emoji: "👻",
    title: "Use after free: the haunted ticket",
    hook: "You freed it. malloc recycled it. Your old pointer never got the memo.",
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *ticket = malloc(sizeof *ticket);
    *ticket = 42;
    free(ticket);
    int *other = malloc(sizeof *other);   /* recycles the same spot */
    *other = 777;
    printf("my ticket says: %d\\n", *ticket);
    return 0;
}`,
    expected: "my ticket says: 42",
    actual: "printed 777 — the second malloc reused the same chunk, so the freed pointer showed the new tenant's data (at -O2 it printed allocator garbage instead)",
    why: "<p>After <code>free(ticket)</code>, that pointer's value is indeterminate and dereferencing it is undefined behavior (C17 7.22.3) — but the bytes don't vanish, the allocator just puts the chunk back on its shelf. Ask for the same size again and glibc hands you the very same address, which is why <code>*ticket</code> \"worked\" and showed 777: two owners, one address, and the old pointer reads the new owner's data. This is the use-after-free — a bug class behind countless real-world exploits, and invisible in testing whenever the memory hasn't been reused <em>yet</em>. Discipline: <code>free(p); p = NULL;</code> so any later dereference crashes honestly.</p>",
    lesson: "dynamic-memory",
    ub: true,
  },
  {
    id: "double-free",
    emoji: "☠️",
    title: "free() twice, abort once",
    hook: "If one free is good, surely two is thorough?",
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    char *p = malloc(16);
    free(p);
    free(p);                         /* freeing the same pointer twice */
    printf("done\\n");
    return 0;
}`,
    expected: "freeing twice is harmless — then it prints \"done\"",
    actual: "crashes before \"done\" with: free(): double free detected in tcache 2",
    why: "<p>Calling <code>free</code> on a pointer that was already freed is undefined behavior (C17 7.22.3.3) — the second call hands the allocator a chunk that's already on its free list, corrupting the bookkeeping that every future <code>malloc</code> depends on. Historically that corruption was silently exploitable (an attacker could steer where the next allocation lands), which is why modern glibc actively checks and aborts with the message we verified. Note that \"done\" never printed: the abort fired before stdout was flushed. The same discipline as use-after-free saves you here — <code>free(p); p = NULL;</code> — because <code>free(NULL)</code> is defined to do nothing.</p>",
    lesson: "dynamic-memory",
    ub: true,
  },
  {
    id: "unchecked-malloc",
    emoji: "🚱",
    title: "malloc can say no",
    hook: "Ask for 18 quintillion bytes, then store 42 in the answer.",
    code: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t huge = (size_t)-1;        /* ~18 quintillion bytes */
    int *p = malloc(huge);
    *p = 42;                         /* malloc said no. p is NULL. */
    printf("stored %d\\n", *p);
    return 0;
}`,
    expected: "either the allocation works or the program stops politely",
    actual: "crash (SIGSEGV) — malloc returned NULL, and *p = 42 wrote to address 0",
    why: "<p><code>malloc</code> reports failure by returning <code>NULL</code> (C17 7.22.3.4) — it cannot throw, print, or apologize, and glibc rejects any request larger than <code>PTRDIFF_MAX</code> outright, so this one fails instantly. Dereferencing that NULL is undefined behavior; on Linux it's a segfault, on small embedded systems it can silently corrupt address 0 and keep running. Every allocation deserves the three-line tax: <code>if (!p) { /* report and bail */ }</code>. The subtler sibling to watch for: <code>malloc(n * sizeof(int))</code> where the <em>multiplication</em> overflows first, allocating a tiny block that \"succeeds\" — <code>calloc(n, sizeof(int))</code> checks that product for you.</p>",
    lesson: "dynamic-memory",
    ub: true,
  },
  {
    id: "macro-missing-parens",
    emoji: "🪤",
    title: "SQUARE(a + 1) = 9",
    hook: "A macro that squares 3 perfectly and butchers a + 1.",
    code: `#include <stdio.h>
#define SQUARE(x) x * x

int main(void) {
    int a = 4;
    printf("SQUARE(3)     = %d\\n", SQUARE(3));
    printf("SQUARE(a + 1) = %d\\n", SQUARE(a + 1));
    return 0;
}`,
    expected: "a is 4, so SQUARE(a + 1) is 5 squared: 25",
    actual: "SQUARE(3) = 9 as advertised, but SQUARE(a + 1) = 9 too",
    why: "<p>Macros are <em>text paste</em>, not function calls: <code>SQUARE(a + 1)</code> expands to <code>a + 1 * a + 1</code>, and precedence regroups it as <code>a + (1 * a) + 1</code> = 4 + 4 + 1 = 9. The macro never saw the value 5 — it saw three tokens and dropped them into a precedence minefield. The armor is parentheses on <em>every</em> parameter <em>and</em> the whole body: <code>#define SQUARE(x) ((x) * (x))</code> — the inner pairs guard against the argument's operators, the outer pair against operators at the call site (<code>100 / SQUARE(5)</code>). And even fully armored, never pass side effects: <code>SQUARE(i++)</code> expands to two unsequenced <code>i++</code>s — undefined behavior.</p>",
    lesson: "function-macros",
    ub: false,
  },
  {
    id: "macro-double-evaluation",
    emoji: "🪞",
    title: "Even a perfectly parenthesized macro evaluates twice",
    hook: "MAX(i++, 9) — fully armored in parentheses, and still wrong.",
    code: `#include <stdio.h>
#define MAX(a, b) ((a) > (b) ? (a) : (b))

int main(void) {
    int i = 10;
    int best = MAX(i++, 9);          /* fully parenthesized... safe now? */
    printf("best = %d, i = %d\\n", best, i);
    return 0;
}`,
    expected: "best = 10 (the current value of i), and i becomes 11",
    actual: "best = 11 and i = 12 — the i++ ran twice: once in the comparison, once producing the result",
    why: "<p>Parentheses fix precedence, but they cannot fix <em>double evaluation</em> — the macro pastes its argument text everywhere the parameter appears, so <code>MAX(i++, 9)</code> becomes <code>((i++) &gt; (9) ? (i++) : (9))</code>: the first <code>i++</code> yields 10 (i→11), the comparison succeeds, and the <em>second</em> <code>i++</code> yields 11 (i→12). This particular expansion is well-defined (<code>?:</code> is a sequence point) — just quietly wrong; with <code>SQUARE(i++)</code> the two increments are unsequenced and it's outright UB. A real function evaluates each argument exactly once; a macro makes no such promise. Keep side effects out of macro arguments — or use a function and let the optimizer inline it.</p>",
    lesson: "function-macros",
    ub: false,
  },
];
