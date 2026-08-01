/* ============================================================
   Part 1 — C Basics
   ============================================================ */

/* ---------------- hello world ---------------- */
CT.lesson({
  id: 'hello-world',
  title: 'Hello, World: your first C program',
  minutes: 12, xp: 100,
  tags: 'hello world main printf include return compile gcc first program',
  why: `<p>The operating system on your laptop, the games you play, and the language Python itself were all written in C — and every one of their authors once sat exactly where you are, typing a five-line first program. In the next ten minutes you'll write it, turn it into real machine code, and run it. Part 0 gave you the map; this is where you start the engine.</p>`,
  html: `
<p>This is it — the moment every programmer remembers. You're about to write a real program in <strong>C</strong>, the language that built Unix, Linux, Windows, Python, Git, and probably the firmware in your toaster. And like millions before you, you'll start by making the computer say hello:</p>

<div data-w="code1"></div>

<p>Five lines. Every single one earns its place. Let's dissect them like the tiny masterpiece they are.</p>

<h2>Line 1: <code>#include &lt;stdio.h&gt;</code></h2>
<p>C itself is famously minimal — it doesn't even know how to print! Printing lives in the <strong>standard library</strong>, and <code>stdio.h</code> (<em>st</em>andar<em>d</em> <em>i</em>nput/<em>o</em>utput <em>h</em>eader) is the file that <em>declares</em> functions like <code>printf</code>. The <code>#include</code> directive tells the preprocessor: "paste that entire file right here before compiling." Remember the compiler pipeline from Part 0? This is stage 1 doing its find-and-replace magic.</p>

<h2>Line 3: <code>int main(void)</code></h2>
<p>Every C program needs exactly one <code>main</code> — it's the agreed-upon <strong>entry point</strong>. When you run your program, the operating system (well, some startup code) calls <code>main</code> for you. The pieces:</p>
<ul>
<li><code>int</code> — main promises to hand back an integer when it finishes.</li>
<li><code>main</code> — the sacred name. Spell it differently and the linker will complain it can't find it.</li>
<li><code>(void)</code> — "I take no arguments." (Later you'll meet <code>main(int argc, char *argv[])</code> for command-line arguments.)</li>
<li><code>{ … }</code> — the braces wrap the function's <em>body</em>: the statements to execute, top to bottom.</li>
</ul>

<div data-w="q1"></div>

<h2>Line 4: <code>printf("Hello, World!\\n");</code></h2>
<p>A <strong>function call</strong>: run the code named <code>printf</code> (<em>print formatted</em>), handing it the text between quotes — a <em>string literal</em>. The <code>\\n</code> at the end is an <strong>escape sequence</strong> meaning "newline": without it, your shell prompt would glue itself to the end of your message. And the semicolon? Every statement in C ends with one. Forgetting it is the classic first-week rite of passage.</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Other escape sequences you'll use constantly: <code>\\t</code> (tab), <code>\\"</code> (a quote inside a string), <code>\\\\</code> (a literal backslash). They let you type the untypeable.</p></div></div>

<h2>Line 5: <code>return 0;</code></h2>
<p>Remember <code>main</code> promised an <code>int</code>? This delivers it. That number is the program's <strong>exit status</strong>, reported to the operating system: by convention <code>0</code> means "all good" and anything nonzero means "something went wrong". Shell scripts, Makefiles, and CI systems all read this value — it's how programs gossip about success and failure.</p>

<div data-w="q2"></div>

<h2>Making it real: compile and run</h2>
<p>C is a <em>compiled</em> language — the source text must be translated into machine code before it can run. That's one command:</p>
<div data-w="term1"></div>
<p>Your development loop, forever after, looks like this:</p>
<div data-w="flow1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>When the compiler yells at you</b> — and it will — read the <em>first</em> error, fix it, recompile. One missing semicolon can trigger an avalanche of bogus follow-up errors. First error first, always.</p></div></div>

<h2>Your turn — break it, then make it yours</h2>
<p>Reading about programs teaches you a little. <em>Changing</em> them teaches you everything. Edit the program below and run it:</p>
<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>You've officially executed your own machine code — welcome to the club. Next, let's give programs a memory: <b>variables and types</b>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'hello.c',
      code: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`
    },
    q1: { type: 'quiz', q: 'Why does every C program need a function called <code>main</code>?', opts: ['It runs faster than other names', 'The compiler deletes all other functions', 'It is the agreed-upon entry point the OS startup code calls', 'It is only needed on Linux'], a: 2, expl: 'Execution always begins at <code>main</code> — that name is baked into the C standard and the startup code linked into your program. No main, no program.' },
    q2: { type: 'quiz', q: 'What does <code>return 0;</code> in main actually do?', opts: ['Reports "success" to the operating system as the exit status', 'Prints 0 to the screen', 'Restarts the program', 'Frees all memory'], a: 0, expl: 'The return value of main becomes the process exit status. 0 = success, nonzero = failure. Try <code>echo $?</code> in your shell right after running a program to see it!' },
    term1: {
      type: 'term', text: `$ gcc hello.c -o hello    # compile: hello.c -> executable named 'hello'
$ ./hello                 # run it (./ means "in this directory")
Hello, World!
$ echo $?                 # ask the shell for the exit status
0`
    },
    flow1: {
      type: 'flow', label: 'The eternal edit–compile–run loop', colw: 210, rowh: 88,
      nodes: [
        { id: 'src', col: 0, row: 0, kind: 'start', label: 'edit hello.c' },
        { id: 'gcc', col: 0, row: 1, kind: 'proc', label: 'gcc hello.c -o hello' },
        { id: 'ok', col: 0, row: 2, kind: 'dec', label: 'compiler\nhappy?' },
        { id: 'run', col: 0, row: 3, kind: 'io', label: './hello' },
        { id: 'joy', col: 0, row: 4, kind: 'end', label: 'Hello, World! ✨' },
      ],
      edges: [
        { from: 'src', to: 'gcc' },
        { from: 'gcc', to: 'ok' },
        { from: 'ok', to: 'run', label: 'yes' },
        { from: 'ok', to: 'src', side: 'right', label: 'no — fix & retry' },
        { from: 'run', to: 'joy' },
      ],
      note: 'You will run this loop thousands of times. Make it fast: keep a terminal open next to your editor.',
    },
    ed1: {
      type: 'editor', label: 'Exercise: make it yours',
      code: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`,
      hint: 'Change the message to greet YOU by name. Then add a second printf line that prints your favorite number. Bonus: remove the \\n and see what happens to the output.',
      height: 260,
    },
    q3: { type: 'quiz', q: 'What does <code>\\n</code> inside a string literal mean?', opts: ['A literal backslash and n', 'A newline character', 'The end of the string', 'A space'], a: 1, expl: 'It is an escape sequence: the two characters \\ and n in your source become ONE character (ASCII 10, newline) in the compiled string. The string terminator is a different character, <code>\\0</code>.' },
  },
});

/* ---------------- variables & types ---------------- */
CT.lesson({
  id: 'variables-types',
  title: 'Variables & types: naming your bytes',
  minutes: 15, xp: 120,
  tags: 'int char float double short long signed unsigned bool declaration sizeof format specifier',
  why: `<p>That 2,147,483,647 view ceiling from Part 0 — the one Gangnam Style smashed into — exists because every number a program remembers lives in a box of a fixed size. This lesson is about choosing the right box: you'll give your programs a memory, print what's stored there, and know exactly how big a value can get before it breaks the way YouTube's did.</p>`,
  html: `
<p>A program that only prints fixed text is a very expensive poster. Real programs <em>remember</em> things — and in C, memory you can name is a <strong>variable</strong>. Because C works directly with the machine's memory, every variable has a <strong>type</strong> that decides two things: <em>how many bytes</em> it occupies (remember from Part 0 — a byte is 8 bits), and <em>how those bytes are interpreted</em> (integer? real number? character?).</p>

<h2>Declaring variables</h2>
<p>The pattern is <code>type name = value;</code> — the type comes first, then your chosen name, then (optionally, but wisely) an initial value:</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Uninitialized = garbage.</b> Declaring <code>int x;</code> without a value does NOT give you 0 — a local variable starts with whatever bytes happened to be lying around on the stack. Reading it before assigning is undefined behavior. Initialize your variables.</p></div></div>

<h2>The integer family</h2>
<p>C offers a whole wardrobe of integer types, from small to huge. The keywords <code>short</code>, <code>long</code>, and <code>long long</code> modify <code>int</code>; <code>signed</code> and <code>unsigned</code> choose whether the two's-complement sign bit is used (remember Part 0?):</p>
<table>
<tr><th>type</th><th>typical size (x86-64 Linux)</th><th>standard guarantees</th><th>range (typical)</th></tr>
<tr><td><code>char</code></td><td>1 byte</td><td>exactly 1 byte, ≥8 bits</td><td>−128…127 <em>or</em> 0…255 (!)</td></tr>
<tr><td><code>short</code></td><td>2 bytes</td><td>≥16 bits</td><td>−32,768…32,767</td></tr>
<tr><td><code>int</code></td><td>4 bytes</td><td>≥16 bits</td><td>±2.1 billion</td></tr>
<tr><td><code>long</code></td><td>8 bytes (4 on Windows!)</td><td>≥32 bits</td><td>±9.2 × 10¹⁸</td></tr>
<tr><td><code>long long</code></td><td>8 bytes</td><td>≥64 bits</td><td>±9.2 × 10¹⁸</td></tr>
<tr><td><code>unsigned int</code></td><td>4 bytes</td><td>same size as int</td><td>0…4.29 billion</td></tr>
</table>
<p>Notice the weasel words: the standard only sets <em>minimums</em>. Actual sizes are <strong>implementation-defined</strong> — chosen by your compiler and platform. Even whether a plain <code>char</code> is signed or unsigned is implementation-defined! When exact sizes matter (file formats, networking), you'll later use <code>int32_t</code> friends from <code>&lt;stdint.h&gt;</code>.</p>

<div data-w="q1"></div>

<h2>Real numbers and truth values</h2>
<ul>
<li><code>float</code> — 32-bit IEEE-754, ~7 significant digits.</li>
<li><code>double</code> — 64-bit, ~15–16 digits. The default choice; literals like <code>3.14</code> are doubles.</li>
<li><code>_Bool</code> — C99's built-in boolean, holding only 0 or 1. Include <code>&lt;stdbool.h&gt;</code> to spell it <code>bool</code> with <code>true</code>/<code>false</code> — and in C23, <code>bool</code>, <code>true</code>, <code>false</code> are finally real keywords on their own.</li>
</ul>

<h2>How big is it really? Ask <code>sizeof</code></h2>
<p>The <code>sizeof</code> operator (a real C keyword, evaluated at compile time) tells you the size of any type or expression in bytes:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>One guarantee is carved in stone: <code>sizeof(char)</code> is <strong>always 1</strong> — by definition. Everything else, verify on your platform.</p>

<div data-w="q2"></div>

<h2>Variables live at addresses</h2>
<p>Each variable claims a chunk of stack memory sized to its type. Here's roughly what the variables from our first example look like in RAM:</p>
<div data-w="mem1"></div>

<h2>printf's secret language: format specifiers</h2>
<p><code>printf</code> can't guess types — you must tell it what you're passing with <code>%</code> placeholders:</p>
<table>
<tr><th>specifier</th><th>prints a…</th><th>example output</th></tr>
<tr><td><code>%d</code></td><td><code>int</code> (decimal)</td><td><code>-42</code></td></tr>
<tr><td><code>%u</code></td><td><code>unsigned int</code></td><td><code>3000000000</code></td></tr>
<tr><td><code>%ld</code> / <code>%lld</code></td><td><code>long</code> / <code>long long</code></td><td><code>9000000000</code></td></tr>
<tr><td><code>%c</code></td><td>single character</td><td><code>A</code></td></tr>
<tr><td><code>%f</code></td><td><code>double</code> (floats are promoted)</td><td><code>3.141590</code></td></tr>
<tr><td><code>%.2f</code></td><td>double, 2 decimals</td><td><code>3.14</code></td></tr>
<tr><td><code>%zu</code></td><td><code>size_t</code> (what sizeof yields)</td><td><code>8</code></td></tr>
<tr><td><code>%x</code></td><td>int as hex</td><td><code>ff</code></td></tr>
<tr><td><code>%%</code></td><td>a literal % sign</td><td><code>%</code></td></tr>
</table>

<div class="callout danger"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Mismatched specifiers are undefined behavior</b>, not just ugly output. <code>printf("%d", 3.14)</code> tells printf to read an int where a double's bytes sit — garbage or crash may follow. Compile with <code>-Wall</code> and GCC will catch these for you.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Variables are lovely, but inert. Time to <b>do things</b> to them: arithmetic operators await.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'variables.c',
      code: `#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int age = 42;                /* whole number             */
    char grade = 'A';            /* one character (really a  */
                                 /*   small integer: 65)     */
    double pi = 3.14159;         /* real number              */
    bool hungry = true;          /* 1 or 0                   */
    unsigned int stars = 4000000000u;  /* no negatives, more room */

    printf("age    = %d\\n", age);
    printf("grade  = %c (which is %d)\\n", grade, grade);
    printf("pi     = %.5f\\n", pi);
    printf("hungry = %d\\n", hungry);
    printf("stars  = %u\\n", stars);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc variables.c -o variables && ./variables
age    = 42
grade  = A (which is 65)
pi     = 3.14159
hungry = 1
stars  = 4000000000` },
    q1: { type: 'quiz', q: 'You need to count people in a city of 9 million. Which type is the safest minimal choice, guaranteed by the standard?', opts: ['<code>short</code>', '<code>char</code>', '<code>int</code>', '<code>long</code>'], a: 3, expl: 'Careful — the standard only guarantees <code>int</code> ≥ 16 bits (max 32,767)! On your PC an int is 32-bit and would work, but <code>long</code> is guaranteed ≥ 32 bits (±2.1 billion) everywhere. Portable code respects the guarantees, not the typical sizes.' },
    code2: {
      type: 'code', title: 'sizes.c',
      code: `#include <stdio.h>
#include <stdbool.h>

int main(void) {
    printf("char      : %zu byte\\n",  sizeof(char));
    printf("short     : %zu bytes\\n", sizeof(short));
    printf("int       : %zu bytes\\n", sizeof(int));
    printf("long      : %zu bytes\\n", sizeof(long));
    printf("long long : %zu bytes\\n", sizeof(long long));
    printf("float     : %zu bytes\\n", sizeof(float));
    printf("double    : %zu bytes\\n", sizeof(double));
    printf("bool      : %zu byte\\n",  sizeof(bool));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc sizes.c -o sizes && ./sizes
char      : 1 byte
short     : 2 bytes
int       : 4 bytes
long      : 8 bytes
long long : 8 bytes
float     : 4 bytes
double    : 8 bytes
bool      : 1 byte
# your numbers may differ — that's the "implementation-defined" part!` },
    q2: { type: 'quiz', q: 'Which of these does the C standard actually guarantee?', opts: ['<code>sizeof(int) == 4</code>', '<code>sizeof(char) == 1</code>', '<code>sizeof(long) == 8</code>', 'plain <code>char</code> is signed'], a: 1, expl: '<code>sizeof(char)</code> is 1 by definition — always. Everything else varies: long is 4 bytes on 64-bit Windows but 8 on Linux, and char signedness is the compiler’s choice (it’s unsigned on ARM Linux!).' },
    mem1: {
      type: 'memgrid', label: 'Stack memory for variables.c (schematic)',
      note: 'Each variable owns as many bytes as its type demands — <code>age</code> spans 4, <code>pi</code> spans 8, <code>grade</code> just 1. The compiler chooses the exact layout (and may add padding).',
      cells: [
        { addr: '0x7ffc00', val: '42', name: 'age (int, 4B)', hl: true },
        { addr: '0x7ffc04', val: "'A' = 65", name: 'grade (char, 1B)' },
        { addr: '0x7ffc08', val: '3.14159', name: 'pi (double, 8B)', hl2: true },
        { addr: '0x7ffc10', val: '1', name: 'hungry (bool, 1B)' },
        { addr: '0x7ffc14', val: '4000000000', name: 'stars (unsigned, 4B)' },
      ],
    },
    ed1: {
      type: 'editor', label: 'Exercise: about-me card',
      code: `#include <stdio.h>

int main(void) {
    /* declare: your age (int), your height in meters (double),
       your first initial (char) */

    /* print them all with one printf per variable,
       using the RIGHT format specifier for each */
    return 0;
}`,
      hint: 'Use %d for the int, %.2f for the double, %c for the char. Then try printing the char with %d instead — what number is your initial?',
      height: 280,
    },
    q3: { type: 'quiz', q: 'What does <code>printf("%d", 3.14);</code> do?', opts: ['Prints 3', 'Prints 3.14', 'Undefined behavior — the specifier lies about the type', 'Compile error, always'], a: 2, expl: 'printf trusts the format string blindly: %d makes it read an int-sized value where a double was passed. The standard calls this undefined behavior. GCC with -Wall warns; the standard does not require an error.' },
  },
});

/* ---------------- arithmetic operators ---------------- */
CT.lesson({
  id: 'operators-arithmetic',
  title: 'Arithmetic: +, −, ×, ÷ and the truncation trap',
  minutes: 13, xp: 110,
  tags: 'plus minus multiply divide modulo increment decrement compound assignment precedence',
  why: `<p>Ask C to average the test scores 90 and 91 and it confidently answers 90 — the .5 silently vanishes. That quiet trap has skewed grades, prices, and game scores in real software. Here you'll learn all of C's math, exactly where that trap hides, and the one-character fix that defuses it.</p>`,
  html: `
<p>Time to compute. C's arithmetic operators look like grade-school math — <code>+</code> <code>-</code> <code>*</code> <code>/</code> — plus one newcomer, <code>%</code> (modulo, the <em>remainder</em> of a division). The values an operator works on are called its <em>operands</em> — and when both operands are whole numbers, C hides a sharp edge in the most innocent-looking operator: division.</p>

<h2>The big five</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The integer division trap:</b> <code>7 / 2</code> is <code>3</code>, not 3.5! When <em>both</em> operands are integers, C performs integer division and <strong>truncates toward zero</strong> — the fraction is thrown away. This bites everyone: <code>(a + b) / 2</code> for an average, <code>celsius * 9 / 5</code>… If you want 3.5, make one side floating point: <code>7 / 2.0</code> or <code>7.0 / 2</code>.</p></div></div>

<p><code>%</code> gives what division threw away: <code>7 % 2</code> is <code>1</code>. It's the workhorse of "is this even?", "wrap this index around", and clock arithmetic. Since C99, the sign of the result follows the <em>dividend</em>: <code>-7 % 2</code> is <code>-1</code>. And <code>x % 0</code>, like <code>x / 0</code>, is undefined behavior — no friendly exception, just chaos.</p>

<div data-w="q1"></div>

<h2>++ and −−: the increment twins</h2>
<p>Adding or subtracting 1 is so common that C gives it dedicated operators — the very ones that named C++. Each comes in two flavors, and the difference is <em>when you see the new value</em>:</p>
<ul>
<li><code>i++</code> (<b>postfix</b>): hand back the <em>old</em> value, <em>then</em> increment.</li>
<li><code>++i</code> (<b>prefix</b>): increment <em>first</em>, hand back the <em>new</em> value.</li>
</ul>
<p>Step through it — watch the variable panel closely:</p>
<div data-w="tr1"></div>

<div class="callout danger"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Never modify a variable twice in one expression.</b> <code>i = i++;</code> and <code>x = i++ + ++i;</code> are <strong>undefined behavior</strong> — the standard doesn't say which happens first, and compilers genuinely produce different answers. If code looks like a puzzle, it's a bug.</p></div></div>

<div data-w="q2"></div>

<h2>Compound assignment: the <code>+=</code> family</h2>
<p><code>x = x + 5</code> is so common it has a shorthand: <code>x += 5</code>. Every arithmetic (and bitwise) operator has one — <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>%=</code>. They say "update this variable using its own value", and they say it without repeating the name:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<h2>Who goes first? Precedence</h2>
<p>Just like in math, <code>2 + 3 * 4</code> is 14, not 20 — multiplication binds tighter. The arithmetic pecking order:</p>
<table>
<tr><th>priority</th><th>operators</th><th>note</th></tr>
<tr><td>1 (tightest)</td><td><code>()</code>, <code>x++</code>, <code>x--</code></td><td>parentheses always win</td></tr>
<tr><td>2</td><td>unary <code>-</code>, <code>++x</code>, <code>--x</code></td><td>as in <code>-x</code></td></tr>
<tr><td>3</td><td><code>*</code> <code>/</code> <code>%</code></td><td>left to right</td></tr>
<tr><td>4</td><td><code>+</code> <code>-</code></td><td>left to right</td></tr>
<tr><td>5 (loosest)</td><td><code>=</code> <code>+=</code> <code>-=</code> …</td><td>right to left</td></tr>
</table>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Memorizing the full 15-level C precedence table is a party trick, not a skill. When in doubt, <b>add parentheses</b> — they cost nothing and your readers (including future-you) will thank you.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>You can now compute — next you'll <b>compare</b>: the operators that let programs make decisions.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'arith.c',
      code: `#include <stdio.h>

int main(void) {
    int a = 7, b = 2;

    printf("a + b = %d\\n", a + b);
    printf("a - b = %d\\n", a - b);
    printf("a * b = %d\\n", a * b);
    printf("a / b = %d   <- surprise!\\n", a / b);
    printf("a %% b = %d   (the remainder)\\n", a % b);
    printf("a / 2.0 = %f\\n", a / 2.0);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc arith.c -o arith && ./arith
a + b = 9
a - b = 5
a * b = 14
a / b = 3   <- surprise!
a % b = 1   (the remainder)
a / 2.0 = 3.500000` },
    q1: { type: 'quiz', q: 'What does <code>int avg = (90 + 91) / 2;</code> store?', opts: ['90.5', '90', '91', 'undefined behavior'], a: 1, expl: '90 + 91 = 181; both operands of / are ints, so 181 / 2 truncates toward zero: 90. The .5 is silently discarded. To keep it, divide by 2.0 and store in a double.' },
    tr1: {
      type: 'trace', label: 'Prefix vs postfix, step by step', title: 'incr.c',
      code: `#include <stdio.h>

int main(void) {
    int i = 5;
    int a = i++;
    int b = ++i;
    printf("i=%d a=%d b=%d\\n", i, a, b);
    return 0;
}`,
      steps: [
        { line: 4, vars: { i: 5 }, out: '', note: 'i starts at 5.' },
        { line: 5, vars: { i: 5, a: 5 }, out: '', note: 'POSTFIX: a receives the OLD value of i (5) first…' },
        { line: 5, vars: { i: 6, a: 5 }, out: '', note: '…and only then is i incremented to 6.' },
        { line: 6, vars: { i: 7, a: 5 }, out: '', note: 'PREFIX: i is incremented FIRST (6 → 7)…' },
        { line: 6, vars: { i: 7, a: 5, b: 7 }, out: '', note: '…then b receives the NEW value, 7.' },
        { line: 7, vars: { i: 7, a: 5, b: 7 }, out: 'i=7 a=5 b=7\n', note: 'Same +1 either way — the difference is only the value the expression yields.' },
      ],
    },
    q2: { type: 'quiz', q: 'After <code>int n = 10; int m = n--;</code>, what are n and m?', opts: ['n=9, m=9', 'n=10, m=9', 'n=9, m=10', 'n=10, m=10'], a: 2, expl: 'Postfix decrement: m gets the old value (10), then n drops to 9. With prefix (<code>m = --n;</code>) both would be 9.' },
    code2: {
      type: 'code', title: 'compound.c',
      code: `#include <stdio.h>

int main(void) {
    int score = 100;

    score += 50;    /* score = score + 50  -> 150 */
    score -= 30;    /* -> 120 */
    score *= 2;     /* -> 240 */
    score /= 10;    /* -> 24  */
    score %= 5;     /* -> 4   */

    printf("final score: %d\\n", score);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc compound.c -o compound && ./compound
final score: 4` },
    ed1: {
      type: 'editor', label: 'Exercise: seconds decomposer',
      code: `#include <stdio.h>

int main(void) {
    int total = 7384;   /* seconds */

    /* Using / and %, compute how many hours, minutes and
       seconds that is, then print "2h 3m 4s" style output. */

    return 0;
}`,
      hint: 'hours = total / 3600. The leftover is total % 3600 — divide THAT by 60 for minutes. Expected answer for 7384: 2h 3m 4s.',
      height: 280,
    },
    q3: { type: 'quiz', q: 'What is <code>2 + 3 * 4 % 5</code>?', opts: ['0', '4', '2', '14'], a: 1, expl: '<code>*</code> and <code>%</code> share a precedence level and go left to right: 3*4 = 12, then 12 % 5 = 2, then 2 + 2 = 4. If you had to think hard — that’s the argument for parentheses.' },
  },
});

/* ---------------- comparison & logical operators ---------------- */
CT.lesson({
  id: 'operators-comparison',
  title: 'Comparisons & logic: how C decides',
  minutes: 13, xp: 110,
  tags: 'equal not equal less greater and or not short circuit ternary truthy boolean',
  why: `<p>One missing character — typing <code>=</code> where you meant <code>==</code> — can turn a password check into one that always says yes. Comparisons are how programs decide anything at all, and by the end of this lesson you'll recognize that one-character bug on sight and know how to make the compiler catch it for you.</p>`,
  html: `
<p>Every decision a program makes — checking a password, deciding whether to keep going — boils down to a comparison. C's comparison operators are <code>==</code> <code>!=</code> <code>&lt;</code> <code>&gt;</code> <code>&lt;=</code> <code>&gt;=</code>, and here's the twist: they don't produce some special true/false type of value. They return a plain <code>int</code> — <strong>1 for true, 0 for false</strong>.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<h2>Truthiness: zero is false, everything else is true</h2>
<p>Going the other way, wherever C expects a condition, it applies one rule: <strong>0 means false; any nonzero value means true</strong>. <code>-3</code> is true. <code>0.5</code> is true. <code>'A'</code> (which is 65) is true. This simple rule powers idioms you'll see everywhere, like <code>if (count)</code> meaning "if count isn't zero".</p>

<div data-w="q1"></div>

<h2>The bug that launched a thousand debugging sessions: <code>=</code> vs <code>==</code></h2>
<div data-w="code2"></div>
<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b><code>=</code> assigns, <code>==</code> compares — and both are valid in a condition.</b> <code>if (x = 0)</code> <em>assigns</em> 0 to x, and the assignment's value (0) makes the condition false — always. <code>if (x = 5)</code> is always true. No error, just silently wrong logic. Compile with <code>-Wall</code> (GCC suggests extra parens when you really mean assignment) and this bug can't hide.</p></div></div>

<h2>Combining conditions: <code>&&</code>, <code>||</code>, <code>!</code></h2>
<ul>
<li><code>a && b</code> — true if <b>both</b> are true (logical AND)</li>
<li><code>a || b</code> — true if <b>at least one</b> is true (logical OR)</li>
<li><code>!a</code> — flips truth: <code>!0</code> is 1, <code>!anything_else</code> is 0</li>
</ul>
<p>And they hide a superpower: <strong>short-circuit evaluation</strong>. C evaluates left to right and <em>stops as soon as the answer is known</em>. If the left side of <code>&&</code> is false, the right side is <b>never evaluated at all</b>. Watch <code>calls</code> in this trace — it counts how many times <code>noisy()</code> actually runs:</p>

<div data-w="tr1"></div>

<p>This isn't just an optimization — it's a guarantee you can lean on. The classic idiom <code>if (n != 0 && total / n &gt; 10)</code> is <em>safe</em>: the division simply cannot happen when <code>n</code> is zero.</p>

<div data-w="q2"></div>

<h2>The ternary operator: <code>?:</code></h2>
<p>C's only three-operand operator is an <code>if/else</code> that fits inside an expression: <code>condition ? value_if_true : value_if_false</code>.</p>
<div data-w="code3"></div>
<div data-w="term3"></div>
<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Ternaries shine for small choices — a max, a label, a sign. Nest them twice and readability dies. If it doesn't fit comfortably on one line, use a real <code>if</code>.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Comparisons treat variables as whole values — but you can also reach <em>inside</em> them and flip individual bits. Next: the bitwise operators.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'compare.c',
      code: `#include <stdio.h>

int main(void) {
    int x = 7, y = 10;

    printf("x == y : %d\\n", x == y);
    printf("x != y : %d\\n", x != y);
    printf("x <  y : %d\\n", x <  y);
    printf("x >= y : %d\\n", x >= y);

    int adult = 1, has_ticket = 0;
    printf("adult && has_ticket : %d\\n", adult && has_ticket);
    printf("adult || has_ticket : %d\\n", adult || has_ticket);
    printf("!has_ticket         : %d\\n", !has_ticket);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc compare.c -o compare && ./compare
x == y : 0
x != y : 1
x <  y : 1
x >= y : 0
adult && has_ticket : 0
adult || has_ticket : 1
!has_ticket         : 1` },
    q1: { type: 'quiz', q: 'In a C condition, which of these values counts as TRUE?', opts: ['<code>0</code>', '<code>0.0</code>', '<code>-1</code>', "<code>'\\0'</code>"], a: 2, expl: 'The rule is brutally simple: zero (in any type) is false, everything else is true. −1 is nonzero, so it’s true. <code>\'\\0\'</code> is the character with value 0 — false.' },
    code2: {
      type: 'code', title: 'the-bug.c — spot it before running', run: false, hl: [4],
      code: `int logged_in = 0;

/* meant to check, actually assigns! */
if (logged_in = 1) {
    printf("Welcome back, admin!\\n");   /* runs EVERY time */
}`
    },
    tr1: {
      type: 'trace', label: 'Short-circuit: who actually gets called?', title: 'shortcircuit.c',
      code: `#include <stdio.h>

int calls = 0;

int noisy(void) {
    calls++;
    return 1;
}

int main(void) {
    int a = 0 && noisy();
    int b = 1 || noisy();
    int c = 1 && noisy();
    printf("a=%d b=%d c=%d calls=%d\\n", a, b, c, calls);
    return 0;
}`,
      steps: [
        { line: 11, vars: { calls: 0 }, out: '', note: 'Left side of && is 0 — the result is already decided (false). noisy() is NOT called.' },
        { line: 11, vars: { calls: 0, a: 0 }, out: '', note: 'a = 0. Short circuit #1: right side skipped entirely.' },
        { line: 12, vars: { calls: 0, a: 0 }, out: '', note: 'Left side of || is 1 — result already true. noisy() skipped again.' },
        { line: 12, vars: { calls: 0, a: 0, b: 1 }, out: '', note: 'b = 1, and calls is still 0.' },
        { line: 13, vars: { calls: 0, a: 0, b: 1 }, out: '', note: 'Left side of && is 1 — no verdict yet. The right side MUST run.' },
        { line: 6, vars: { calls: 1, a: 0, b: 1 }, out: '', note: 'noisy() finally executes: calls becomes 1, returns 1.' },
        { line: 13, vars: { calls: 1, a: 0, b: 1, c: 1 }, out: '', note: 'c = 1 && 1 = 1.' },
        { line: 14, vars: { calls: 1, a: 0, b: 1, c: 1 }, out: 'a=0 b=1 c=1 calls=1\n', note: 'Three logical expressions, but noisy() ran only once.' },
      ],
    },
    q2: { type: 'quiz', q: 'In <code>if (p != NULL && *p > 0)</code>, what happens when <code>p</code> is NULL?', opts: ['Crash — *p is still evaluated', 'The whole condition is false; *p is never touched', 'Compile error', 'Undefined behavior'], a: 1, expl: 'Short-circuit && guarantees left-to-right evaluation with an early exit: once <code>p != NULL</code> is false, the dereference on the right is skipped. This guard pattern is everywhere in real C.' },
    code3: {
      type: 'code', title: 'ternary.c',
      code: `#include <stdio.h>

int main(void) {
    int a = 12, b = 30;

    int max = (a > b) ? a : b;
    printf("max is %d\\n", max);
    printf("b is %s\\n", (b % 2 == 0) ? "even" : "odd");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc ternary.c -o ternary && ./ternary
max is 30
b is even` },
    ed1: {
      type: 'editor', label: 'Exercise: leap-year detector',
      code: `#include <stdio.h>

int main(void) {
    int year = 2024;

    /* A year is a leap year if it is divisible by 4,
       EXCEPT centuries (divisible by 100) — UNLESS they
       are also divisible by 400.
       Build ONE expression with %, &&, || and store it: */
    int leap = 0;   /* <- your expression here */

    printf("%d is %s\\n", year, leap ? "a leap year" : "not a leap year");
    return 0;
}`,
      hint: 'The classic answer: (year % 4 == 0 && year % 100 != 0) || year % 400 == 0. Test with 2024 (leap), 1900 (not!), 2000 (leap).',
      height: 300,
    },
    q3: { type: 'quiz', q: 'What does <code>x = (5 > 3) ? 10 : 20;</code> assign?', opts: ['10', '20', '1', '5'], a: 0, expl: '5 > 3 evaluates to 1 (true), so the ternary yields its first branch: 10. The second branch, 20, is not even evaluated.' },
  },
});

/* ---------------- bitwise operators ---------------- */
CT.lesson({
  id: 'operators-bitwise',
  title: 'Bitwise operators: surgery on individual bits',
  minutes: 14, xp: 130,
  tags: 'bitwise and or xor not shift mask set clear toggle flags',
  why: `<p>The hex color <code>#FF8800</code> you decoded in Part 0 is really three small numbers squeezed into one, and a file permission like <code>chmod 644</code> is three on/off switches per digit. Bitwise operators are the tools for packing, unpacking, and flipping those hidden pieces — you'll finish by rebuilding the exact permissions trick Unix has used for fifty years.</p>`,
  html: `
<p>Part 0 taught you that everything is bits. Now C hands you the scalpel: six <strong>bitwise operators</strong> that let you read and flip each individual bit of a number without disturbing its neighbors. They power the code that talks directly to hardware, file formats, compression, cryptography — and every byte of packed on/off switches (<em>flags</em>) you'll meet in real code.</p>

<table>
<tr><th>op</th><th>name</th><th>rule per bit</th><th>example (8-bit)</th></tr>
<tr><td><code>&amp;</code></td><td>AND</td><td>1 only if <em>both</em> are 1</td><td><code>1100 &amp; 1010</code> → <code>1000</code></td></tr>
<tr><td><code>|</code></td><td>OR</td><td>1 if <em>either</em> is 1</td><td><code>1100 | 1010</code> → <code>1110</code></td></tr>
<tr><td><code>^</code></td><td>XOR</td><td>1 if the bits <em>differ</em></td><td><code>1100 ^ 1010</code> → <code>0110</code></td></tr>
<tr><td><code>~</code></td><td>NOT</td><td>flip every bit</td><td><code>~00001111</code> → <code>11110000</code></td></tr>
<tr><td><code>&lt;&lt;</code></td><td>left shift</td><td>slide bits left, fill with 0</td><td><code>00000101 &lt;&lt; 2</code> → <code>00010100</code></td></tr>
<tr><td><code>&gt;&gt;</code></td><td>right shift</td><td>slide bits right</td><td><code>00010100 &gt;&gt; 2</code> → <code>00000101</code></td></tr>
</table>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p>Don't confuse <code>&amp;</code>/<code>|</code> (bitwise, works on every bit) with <code>&amp;&amp;</code>/<code>||</code> (logical, works on whole truth values). <code>1 &amp; 2</code> is 0 (no common bits!) but <code>1 &amp;&amp; 2</code> is 1 (both nonzero). Mixing them up compiles fine and fails weirdly.</p></div></div>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>Shifts are multiplication and division</h2>
<p>Shifting left by n multiplies by 2ⁿ (each bit's place value doubles per step); shifting right divides by 2ⁿ, discarding the remainder. <code>1 &lt;&lt; n</code> is THE idiom for "a number with only bit n set" — you'll write it constantly.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Shift with care:</b> left-shifting a negative number is <strong>undefined behavior</strong>, right-shifting a negative number is <em>implementation-defined</em> (arithmetic vs logical shift), and shifting by ≥ the type's width (e.g. <code>x &lt;&lt; 32</code> on a 32-bit int) is UB too. Habit to build: do bit twiddling on <code>unsigned</code> types.</p></div></div>

<h2>The four moves of bit surgery</h2>
<p>Say a byte holds eight on/off <em>flags</em> and you want to manipulate flag n without disturbing its neighbors. Four idioms cover everything:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Try it with your own hands — here's a byte; the mask <code>1 &lt;&lt; 3</code> is <code>00001000</code>:</p>
<div data-w="bits1"></div>

<div data-w="q2"></div>

<h2>Idioms you'll meet in the wild</h2>
<ul>
<li><code>n &amp; 1</code> — is n odd? (checks the ones bit; no division needed)</li>
<li><code>x &amp; 0xFF</code> — keep only the low byte</li>
<li><code>(x &gt;&gt; 8) &amp; 0xFF</code> — extract the second byte (remember the color example from the hex lesson?)</li>
<li><code>x &amp; (x - 1)</code> — clear the lowest set bit; zero iff x was a power of two</li>
</ul>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>Party trick:</b> XOR can swap two variables without a temporary: <code>a ^= b; b ^= a; a ^= b;</code>. It works because XOR is its own inverse (<code>x ^ y ^ y == x</code>). Fun to know, terrible to use — it's slower than a temp on modern CPUs and breaks if a and b are the same variable. Interviews love it anyway.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>That's the full operator toolbox. Now let's put conditions to work steering your program: <b>if and else</b>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'bitwise.c',
      code: `#include <stdio.h>

int main(void) {
    unsigned int a = 0xC, b = 0xA;   /* 1100 and 1010 */

    printf("a & b  = 0x%X\\n", a & b);    /* AND: 1000 */
    printf("a | b  = 0x%X\\n", a | b);    /* OR : 1110 */
    printf("a ^ b  = 0x%X\\n", a ^ b);    /* XOR: 0110 */
    printf("~a     = 0x%X\\n", ~a);       /* flip all 32 bits */
    printf("1 << 4 = %u\\n", 1u << 4);    /* 16: bit 4 set  */
    printf("80 >> 3 = %u\\n", 80u >> 3);  /* 80 / 8 = 10    */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc bitwise.c -o bitwise && ./bitwise
a & b  = 0x8
a | b  = 0xE
a ^ b  = 0x6
~a     = 0xFFFFFFF3
1 << 4 = 16
80 >> 3 = 10` },
    q1: { type: 'quiz', q: 'What is <code>5 &amp; 3</code>?', opts: ['7', '2', '1', '0'], a: 2, expl: '5 = 101, 3 = 011. AND keeps positions where BOTH have a 1 — only the ones bit: 001 = 1. (5 | 3 would be 111 = 7, and 5 ^ 3 = 110 = 6.)' },
    code2: {
      type: 'code', title: 'flags.c',
      code: `#include <stdio.h>

int main(void) {
    unsigned char flags = 0;       /* 00000000 */
    unsigned char BOLD  = 1u << 0; /* 00000001 */
    unsigned char CAPS  = 1u << 3; /* 00001000 */

    flags |= CAPS;                 /* SET:    force bit to 1  */
    flags |= BOLD;
    printf("after set   : 0x%02X\\n", flags);

    flags &= ~BOLD;                /* CLEAR:  force bit to 0  */
    printf("after clear : 0x%02X\\n", flags);

    flags ^= CAPS;                 /* TOGGLE: flip the bit    */
    printf("after toggle: 0x%02X\\n", flags);

    if (flags & CAPS)              /* TEST:   is the bit on?  */
        printf("caps is ON\\n");
    else
        printf("caps is OFF\\n");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc flags.c -o flags && ./flags
after set   : 0x09
after clear : 0x08
after toggle: 0x00
caps is OFF` },
    bits1: { type: 'bits', n: 8, value: 9, label: 'A flags byte — bit 0 (BOLD) and bit 3 (CAPS) are set', hint: 'Click bit 3 to "clear CAPS" and watch the value drop by 8. Set bits 0–2 only: that\u2019s the mask 0x07.' },
    q2: { type: 'quiz', q: 'Which expression CLEARS bit 5 of <code>x</code> and leaves the rest alone?', opts: ['<code>x |= (1 << 5)</code>', '<code>x ^= (1 << 5)</code>', '<code>x &amp;= ~(1 << 5)</code>', '<code>x = ~(1 << 5)</code>'], a: 2, expl: '~(1&lt;&lt;5) is all-ones except bit 5. ANDing keeps every bit where the mask is 1 and zeroes bit 5. (<code>|=</code> sets; <code>^=</code> toggles — it would SET the bit if it was clear!)' },
    ed1: {
      type: 'editor', label: 'Exercise: Unix-style permissions',
      code: `#include <stdio.h>

#define READ  (1u << 2)   /* 100 = 4 */
#define WRITE (1u << 1)   /* 010 = 2 */
#define EXEC  (1u << 0)   /* 001 = 1 */

int main(void) {
    unsigned int perm = 0;

    /* 1. give READ and WRITE using |=          */
    /* 2. print perm with %u (expect 6, like chmod!) */
    /* 3. test with & and print "can read" / "can exec" lines */
    /* 4. revoke WRITE using &= ~               */

    return 0;
}`,
      hint: 'perm |= READ | WRITE; then if (perm & READ) printf(...). This is literally how chmod 644 works — each digit is three permission bits.',
      height: 320,
    },
    q3: { type: 'quiz', q: '<code>n &lt;&lt; 3</code> computes… (for small unsigned n)', opts: ['n × 3', 'n × 8', 'n ÷ 8', 'n + 3'], a: 1, expl: 'Each left shift doubles the value, so shifting by 3 multiplies by 2³ = 8. Compilers know this too — they turn ×8 into a shift automatically, so write whichever is clearer.' },
  },
});

/* ---------------- if / else ---------------- */
CT.lesson({
  id: 'if-else',
  title: 'if & else: teaching programs to choose',
  minutes: 12, xp: 100,
  tags: 'if else condition branch else-if ladder dangling else braces',
  why: `<p>Wrong password? Show an error. Score over 100? Fireworks. Every choice an app makes is an <code>if</code> — and in 2014, one misplaced line of if-code left millions of iPhones open to eavesdropping, a bug famous enough to have a name: "goto fail". Twenty minutes from now, you'll be able to spot it yourself.</p>`,
  html: `
<p>So far your programs run straight down, line by line, same story every time. The <code>if</code> statement changes everything: <strong>code that only runs when a condition holds</strong>. This is the moment programs stop being calculators and start being <em>deciders</em>.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>The shape: <code>if (condition) { … } else { … }</code>. The condition is any expression — remember, nonzero means true. The <code>else</code> branch is optional and runs exactly when the condition was false. One path or the other, never both:</p>

<div data-w="flow1"></div>

<div data-w="q1"></div>

<h2>else-if ladders: many-way choices</h2>
<p>C has no special "elif" keyword — <code>else if</code> is literally an <code>else</code> whose statement is another <code>if</code>. Chain them and you get a ladder that finds the <em>first</em> true condition, runs that branch, and skips the rest:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Order matters! The ladder tests top-down, so put the most specific (or most likely) conditions first. Once a branch fires, the remaining rungs aren't even evaluated.</p>

<div data-w="q2"></div>

<h2>Braces: the cheap insurance</h2>
<p>Technically, <code>if</code> controls just <em>one</em> statement, so braces are optional for a single line. Practically, skipping them is how famous bugs happen — Apple's 2014 "goto fail" SSL vulnerability was exactly a misindented extra line after an unbraced if. Look at this trap:</p>
<div data-w="code3"></div>
<p>The indentation <em>lies</em>. Only the first <code>printf</code> is inside the if — the second runs unconditionally. The compiler doesn't read indentation; it reads braces.</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>House rule for this course: always use braces</b>, even for one-liners. It costs two characters and eliminates a whole species of bug (plus the "dangling else" below).</p></div></div>

<h2>The dangling else</h2>
<p>Quick: which <code>if</code> does this <code>else</code> belong to?</p>
<div data-w="code4"></div>
<p>The rule: an <code>else</code> binds to the <strong>nearest unmatched <code>if</code></strong> — here the <em>inner</em> one, despite the indentation suggesting otherwise. So "not sunny" prints only when <code>temp &gt; 20</code> but it isn't sunny, and cold days print nothing. Braces would have made the intent unambiguous — one more reason they're house rules.</p>

<div data-w="q3"></div>

<div data-w="ed1"></div>

<p>Ladders with many <code>else if</code> rungs comparing one variable against constants have a dedicated, cleaner tool — meet <b>switch</b>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'weather.c',
      code: `#include <stdio.h>

int main(void) {
    int temp = 33;

    if (temp > 30) {
        printf("It's hot — hydrate!\\n");
    } else {
        printf("Pleasant enough.\\n");
    }
    printf("(this line runs either way)\\n");
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc weather.c -o weather && ./weather
It's hot — hydrate!
(this line runs either way)` },
    flow1: {
      type: 'flow', label: 'Anatomy of if / else', colw: 200, rowh: 90,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'temp = 33' },
        { id: 'd', col: 0, row: 1, kind: 'dec', label: 'temp > 30 ?' },
        { id: 'hot', col: 1, row: 1, kind: 'io', label: 'printf "hot"' },
        { id: 'ok', col: 0, row: 2, kind: 'io', label: 'printf "pleasant"' },
        { id: 'e', col: 1, row: 2, kind: 'end', label: 'continue after if' },
      ],
      edges: [
        { from: 's', to: 'd' },
        { from: 'd', to: 'hot', label: 'true' },
        { from: 'd', to: 'ok', label: 'false' },
        { from: 'hot', to: 'e' },
        { from: 'ok', to: 'e' },
      ],
      note: 'Exactly one branch executes; both paths rejoin afterwards.',
    },
    q1: { type: 'quiz', q: 'When does the <code>else</code> branch run?', opts: ['Always, after the if branch', 'Exactly when the condition evaluated to 0', 'Only if the condition is negative', 'When the if branch crashes'], a: 1, expl: 'if/else is a fork: condition nonzero → if-branch, condition zero → else-branch. Never both, never neither.' },
    code2: {
      type: 'code', title: 'grade.c',
      code: `#include <stdio.h>

int main(void) {
    int score = 78;

    if (score >= 90) {
        printf("A — outstanding\\n");
    } else if (score >= 80) {
        printf("B — great\\n");
    } else if (score >= 70) {
        printf("C — solid\\n");
    } else if (score >= 60) {
        printf("D — close call\\n");
    } else {
        printf("F — see you in summer school\\n");
    }
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc grade.c -o grade && ./grade
C — solid` },
    q2: { type: 'quiz', q: 'In the grade ladder, score = 95. Why doesn’t it also print "B — great"? After all, 95 ≥ 80…', opts: ['Because printf can only run once', 'The ladder stops at the FIRST true condition; later rungs are skipped', 'The compiler removes duplicate branches', 'It does print both'], a: 1, expl: 'An else-if ladder is one big fork: the first true condition claims execution and everything after the matching branch is skipped — the 80-check never even runs.' },
    code3: {
      type: 'code', title: 'liar.c — indentation vs reality', run: false, hl: [3, 4],
      code: `int coins = 0;
if (coins > 0)
    printf("You can buy a snack!\\n");
    printf("Purchase complete.\\n");   /* ALWAYS runs — not in the if! */`
    },
    code4: {
      type: 'code', title: 'dangling.c — whose else is it?', run: false, hl: [5],
      code: `if (temp > 20)
    if (sunny)
        printf("beach day!\\n");
else                                /* indented to match the OUTER if… */
    printf("not sunny\\n");         /* …but binds to the INNER one!    */`
    },
    q3: { type: 'quiz', q: 'In the dangling-else example, temp = 10 (cold). What prints?', opts: ['"not sunny"', 'Nothing at all', '"beach day!"', 'Compile error'], a: 1, expl: 'The else belongs to the inner <code>if (sunny)</code>. When temp ≤ 20 the whole inner if/else is skipped, so nothing prints. Braces around the outer if-body would restore the intended meaning.' },
    ed1: {
      type: 'editor', label: 'Exercise: number describer',
      code: `#include <stdio.h>

int main(void) {
    int n = -7;

    /* Print exactly one line describing n:
       "negative and odd", "negative and even",
       "zero", "positive and odd", or "positive and even".
       Use an else-if ladder; test n % 2 for parity.  */

    return 0;
}`,
      hint: 'Handle zero first (it\u2019s neither positive nor negative). Careful: for negative n, n % 2 is -1, not 1 — test n % 2 != 0 for odd. Try n = -7, 0, 12.',
      height: 300,
    },
  },
});

/* ---------------- switch / case ---------------- */
CT.lesson({
  id: 'switch-case',
  title: 'switch, case, default: the multi-way jump',
  minutes: 12, xp: 110,
  tags: 'switch case default break fallthrough jump table integer',
  why: `<p>In 1990, half of AT&amp;T's long-distance phone network went silent for nine hours — engineers traced the collapse to one misplaced <code>break</code> in a C switch statement. This lesson hands you the clean tool for menus and multi-way choices, then walks you straight into, and safely back out of, the exact trap behind that outage.</p>`,
  html: `
<p>When one value needs comparing against many fixed possibilities — a menu choice, a keypress, a day number — an else-if ladder works but reads like bureaucracy. C offers a dedicated construct built from four keywords: <code>switch</code>, <code>case</code>, <code>default</code>, and <code>break</code>.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>How it flows: <code>switch (expr)</code> evaluates the expression once, jumps straight to the matching <code>case</code> label, and runs from there. <code>break</code> exits the switch; <code>default</code> catches anything unmatched (put one in — it's your safety net):</p>

<div data-w="flow1"></div>

<div data-w="q1"></div>

<h2>The famous gotcha: fallthrough</h2>
<p>Here's the part that surprises everyone: <strong>case labels are just labels, not walls</strong>. If you omit <code>break</code>, execution barrels straight into the next case:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>A forgotten <code>break</code> is the #1 switch bug</b> — the code compiles happily and quietly runs too many cases. GCC's <code>-Wimplicit-fallthrough</code> (included in <code>-Wextra</code>) warns you; in C23 you can mark <em>intentional</em> fallthrough with the <code>[[fallthrough]]</code> attribute so the warning stays useful.</p></div></div>

<p>But fallthrough isn't purely a trap — it's also a feature. Stacking case labels with no code between them is the idiomatic way to say "these values share a branch":</p>
<div data-w="code3"></div>

<div data-w="q2"></div>

<h2>The fine print: integers only</h2>
<p>A <code>switch</code> works on <strong>integer types only</strong> — <code>int</code>, <code>char</code> (it's a small integer!), <code>enum</code> values, <code>long</code>… Each <code>case</code> label must be a <em>constant</em> integer expression, known at compile time, with no duplicates. That means:</p>
<ul>
<li>No strings: <code>case "yes":</code> won't compile (you'll use <code>strcmp</code> in an if-ladder instead).</li>
<li>No floats: <code>case 3.14:</code> is rejected.</li>
<li>No runtime values or ranges: <code>case x:</code> and <code>case 1 ... 5:</code> aren't standard C (the latter is a GCC extension).</li>
</ul>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>switch vs if-ladder:</b> use <code>switch</code> when comparing <em>one integer expression against fixed constants</em> — it states that intent clearly, the compiler checks for duplicate cases, and it can compile to a lightning-fast jump table. Use an if-ladder for ranges (<code>score >= 90</code>), floats, strings, or conditions on different variables.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Branching lets programs choose a path; next comes the real superpower — doing something <b>over and over</b> with <code>while</code>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'menu.c',
      code: `#include <stdio.h>

int main(void) {
    char op = '*';
    int a = 6, b = 7;

    switch (op) {
    case '+':
        printf("%d\\n", a + b);
        break;
    case '-':
        printf("%d\\n", a - b);
        break;
    case '*':
        printf("%d\\n", a * b);
        break;
    default:
        printf("unknown operator '%c'\\n", op);
        break;
    }
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc menu.c -o menu && ./menu
42` },
    flow1: {
      type: 'flow', label: 'switch (op) — jump, run, break out', colw: 200, rowh: 88,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: "switch (op)" },
        { id: 'd1', col: 0, row: 1, kind: 'dec', label: "op == '+' ?" },
        { id: 'b1', col: 1, row: 1, kind: 'io', label: 'print a + b' },
        { id: 'd2', col: 0, row: 2, kind: 'dec', label: "op == '*' ?" },
        { id: 'b2', col: 1, row: 2, kind: 'io', label: 'print a * b' },
        { id: 'def', col: 0, row: 3, kind: 'proc', label: 'default:\nunknown op' },
        { id: 'e', col: 1, row: 3, kind: 'end', label: 'after switch' },
      ],
      edges: [
        { from: 's', to: 'd1' },
        { from: 'd1', to: 'b1', label: 'match' },
        { from: 'd1', to: 'd2', label: 'no' },
        { from: 'd2', to: 'b2', label: 'match' },
        { from: 'd2', to: 'def', label: 'no' },
        { from: 'b1', to: 'e', side: 'right', label: 'break' },
        { from: 'b2', to: 'e', label: 'break' },
        { from: 'def', to: 'e' },
      ],
      note: 'Conceptual view — in reality the compiler often builds a jump table and lands on the right case in one hop, no chain of comparisons at all.',
    },
    q1: { type: 'quiz', q: 'What is the job of <code>default:</code> in a switch?', opts: ['It runs before every case', 'It handles any value no case label matched', 'It marks the fastest case', 'It is required by the compiler'], a: 1, expl: 'default is the catch-all branch (and it may appear anywhere among the cases, though last is conventional). It’s optional — but omitting it means unmatched values silently do nothing.' },
    code2: {
      type: 'code', title: 'fallthrough.c — one break missing', hl: [8, 9],
      code: `#include <stdio.h>

int main(void) {
    int level = 1;

    switch (level) {
    case 1:
        printf("Bronze perks\\n");
        /* no break — falls through! */
    case 2:
        printf("Silver perks\\n");
        break;
    case 3:
        printf("Gold perks\\n");
        break;
    }
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc fallthrough.c -o ft && ./ft
Bronze perks
Silver perks
# level is 1, yet the case-2 code ran too!` },
    code3: {
      type: 'code', title: 'grouping.c — fallthrough used well',
      code: `#include <stdio.h>

int main(void) {
    char c = 'E';

    switch (c) {
    case 'a': case 'e': case 'i': case 'o': case 'u':
    case 'A': case 'E': case 'I': case 'O': case 'U':
        printf("'%c' is a vowel\\n", c);
        break;
    default:
        printf("'%c' is not a vowel\\n", c);
        break;
    }
    return 0;
}`
    },
    q2: { type: 'quiz', q: 'In <code>fallthrough.c</code>, what would <code>level = 3</code> print?', opts: ['Gold perks', 'Bronze, Silver and Gold perks', 'Silver perks then Gold perks', 'Nothing'], a: 0, expl: 'switch jumps DIRECTLY to <code>case 3:</code> — earlier cases are never touched. Fallthrough only flows downward from wherever you land, and case 3 ends with a break.' },
    ed1: {
      type: 'editor', label: 'Exercise: days in a month',
      code: `#include <stdio.h>

int main(void) {
    int month = 2;   /* 1 = Jan … 12 = Dec */

    /* Print how many days the month has, using ONE switch:
       - group the 31-day months with stacked case labels
       - group the 30-day months
       - February: print 28 (ignore leap years for now)
       - default: complain about an invalid month        */

    return 0;
}`,
      hint: 'case 1: case 3: case 5: case 7: case 8: case 10: case 12: printf("31\\n"); break; — stacking labels is the clean fallthrough. Try month = 4, 2, and 13.',
      height: 300,
    },
    q3: { type: 'quiz', q: 'Which of these can legally follow <code>case</code> in standard C?', opts: ['<code>case "add":</code>', '<code>case 3.5:</code>', '<code>case x:</code> where x is a variable', "<code>case 'q':</code>"], a: 3, expl: 'Case labels must be compile-time constant INTEGER expressions. A char literal like \'q\' is an integer (113), so it qualifies. Strings, floats, and runtime variables are all out.' },
  },
});

/* ---------------- while loops ---------------- */
CT.lesson({
  id: 'loops-while',
  title: 'while & do-while: repeat until told otherwise',
  minutes: 13, xp: 110,
  tags: 'while do-while loop condition infinite loop sentinel iteration',
  why: `<p>Behind nearly every frozen app — the spinner that never stops spinning — is a loop that lost its way out. Loops are how a program does something a million times without complaining, and this lesson teaches you to build ones that always know when to quit, plus the variant every "enter a valid number" prompt is secretly built on.</p>`,
  html: `
<p>Computers don't get bored — and loops are how you exploit that. The <code>while</code> loop is the simplest: <strong>check a condition; if true, run the body; go back and check again</strong>. Repeat until the condition turns false.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>The shape of every while loop, as a diagram — note the edge that makes it a <em>loop</em>:</p>
<div data-w="flow1"></div>

<p>Three ingredients make a healthy loop: <b>initialize</b> something before it (<code>n = 3</code>), <b>test</b> it in the condition (<code>n &gt; 0</code>), and <b>update</b> it in the body (<code>n--</code>). Forget the update and you've built an <em>infinite loop</em> — the condition never changes, and your program spins forever (Ctrl+C to rescue your terminal).</p>

<p>Step through the countdown and watch the check-run-update rhythm:</p>
<div data-w="tr1"></div>

<div data-w="q1"></div>

<h2>Zero iterations is a feature</h2>
<p><code>while</code> tests <em>before</em> every run of the body — including the first. If the condition starts false, the body runs <strong>zero times</strong>. That's usually exactly right: "process items while any remain" should do nothing when there are none.</p>

<h2>do-while: test at the bottom</h2>
<p>Sometimes the body must run at least once <em>before</em> you can sensibly test — like asking a user for input and validating it. That's <code>do … while</code>, C's only loop that checks at the end (mind the required semicolon after the condition!):</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<h2>Sentinel loops: "read until a special value"</h2>
<p>A classic while pattern: keep consuming input until a <em>sentinel</em> value says stop. Here the sentinel is 0 (real programs use scanf's own return value; return values are next lesson's territory):</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Deliberate infinite loops are respectable C:</b> <code>while (1) { … }</code> is the standard skeleton for servers, embedded firmware, and game loops — anything that should run "forever" and exits via <code>break</code> or never. It's not a bug when it's on purpose.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>Most loops share that init-test-update trio so often that C packs all three into one line — say hello to <b>for</b>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'countdown.c',
      code: `#include <stdio.h>

int main(void) {
    int n = 3;
    while (n > 0) {
        printf("%d\\n", n);
        n--;
    }
    printf("Liftoff!\\n");
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc countdown.c -o countdown && ./countdown
3
2
1
Liftoff!` },
    flow1: {
      type: 'flow', label: 'while (n > 0) — the loop-back edge', colw: 200, rowh: 90,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'n = 3' },
        { id: 'c', col: 0, row: 1, kind: 'dec', label: 'n > 0 ?' },
        { id: 'b', col: 0, row: 2, kind: 'proc', label: 'print n\nn--' },
        { id: 'e', col: 1, row: 1, kind: 'end', label: 'Liftoff!' },
      ],
      edges: [
        { from: 's', to: 'c' },
        { from: 'c', to: 'b', label: 'true' },
        { from: 'c', to: 'e', label: 'false' },
        { from: 'b', to: 'c', side: 'left', label: 'check again' },
      ],
      note: 'The condition is tested BEFORE every iteration — so a while body can run zero times.',
    },
    tr1: {
      type: 'trace', label: 'Countdown, one step at a time', title: 'countdown.c',
      code: `#include <stdio.h>

int main(void) {
    int n = 3;
    while (n > 0) {
        printf("%d\\n", n);
        n--;
    }
    printf("Liftoff!\\n");
    return 0;
}`,
      steps: [
        { line: 4, vars: { n: 3 }, out: '', note: 'Initialize the loop variable.' },
        { line: 5, vars: { n: 3 }, out: '', note: '3 > 0 — true, enter the body.' },
        { line: 6, vars: { n: 3 }, out: '3\n', note: 'Print n.' },
        { line: 7, vars: { n: 2 }, out: '3\n', note: 'Update: n becomes 2. Back to the condition!' },
        { line: 5, vars: { n: 2 }, out: '3\n', note: '2 > 0 — still true.' },
        { line: 6, vars: { n: 2 }, out: '3\n2\n', note: 'Print again.' },
        { line: 7, vars: { n: 1 }, out: '3\n2\n', note: 'n becomes 1.' },
        { line: 5, vars: { n: 1 }, out: '3\n2\n', note: '1 > 0 — one more round.' },
        { line: 6, vars: { n: 1 }, out: '3\n2\n1\n', note: 'Print.' },
        { line: 7, vars: { n: 0 }, out: '3\n2\n1\n', note: 'n hits 0 — the update that will end the loop.' },
        { line: 5, vars: { n: 0 }, out: '3\n2\n1\n', note: '0 > 0 is FALSE — exit the loop, skip to after the brace.' },
        { line: 9, vars: { n: 0 }, out: '3\n2\n1\nLiftoff!\n', note: 'Life continues after the loop.' },
      ],
    },
    q1: { type: 'quiz', q: 'What does <code>int n = 0; while (n > 0) { printf("hi"); n--; }</code> print?', opts: ['"hi" once', 'Nothing — the body never runs', '"hi" forever', 'Compile error'], a: 1, expl: 'while tests first: 0 > 0 is false on the very first check, so the body runs zero times. (A do-while version WOULD print "hi" once — and then run forever as n goes negative… twice the trap!)' },
    code2: {
      type: 'code', title: 'dowhile.c',
      code: `#include <stdio.h>

int main(void) {
    int tries = 0;
    int guess;

    do {
        guess = 30 + tries * 6;      /* stand-in for user input */
        tries++;
        printf("try %d: guessing %d\\n", tries, guess);
    } while (guess != 42);

    printf("got it in %d tries\\n", tries);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc dowhile.c -o dowhile && ./dowhile
try 1: guessing 30
try 2: guessing 36
try 3: guessing 42
got it in 3 tries` },
    q2: { type: 'quiz', q: 'The key difference between <code>while</code> and <code>do-while</code> is…', opts: ['do-while is faster', 'do-while runs the body at least once — it tests at the bottom', 'while can’t contain if statements', 'do-while can’t be infinite'], a: 1, expl: 'Same loop, different first move: while checks before the first iteration (0+ runs); do-while checks after (1+ runs). Use do-while when the body itself produces the thing you test — like reading input.' },
    code3: {
      type: 'code', title: 'sentinel.c',
      code: `#include <stdio.h>

int main(void) {
    int scores[] = { 8, 12, 30, 0, 99 };  /* 0 = sentinel: stop */
    int i = 0, total = 0;

    while (scores[i] != 0) {
        total += scores[i];
        i++;
    }
    printf("total before sentinel: %d\\n", total);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc sentinel.c -o sentinel && ./sentinel
total before sentinel: 50
# the 99 after the sentinel is never touched` },
    ed1: {
      type: 'editor', label: 'Exercise: collatz steps',
      code: `#include <stdio.h>

int main(void) {
    int n = 27;
    int steps = 0;

    /* The Collatz rule: while n != 1,
         if n is even  -> n = n / 2
         else          -> n = 3 * n + 1
       Count the steps, then print them.
       (Mathematicians still can't prove this always ends!) */

    printf("%d steps\\n", steps);
    return 0;
}`,
      hint: 'while (n != 1) { if (n % 2 == 0) ... else ...; steps++; } — n = 27 should take 111 steps. Try 6 (8 steps) first to check your logic.',
      height: 300,
    },
    q3: { type: 'quiz', q: 'Which loop is guaranteed infinite?', opts: ['<code>while (n != 0) n -= 2;</code> starting at n = 7', '<code>while (0) { }</code>', '<code>while (n > 0) n--;</code> starting at n = 1000000', '<code>do { } while (0);</code>'], a: 0, expl: 'From 7, subtracting 2 gives 5, 3, 1, −1, −3… it steps right over 0 and never equals it (until signed overflow, which is UB). Prefer <code>n > 0</code> over <code>n != 0</code> — robust conditions survive imperfect inputs. Option B never runs; D runs exactly once.' },
  },
});

/* ---------------- for loops ---------------- */
CT.lesson({
  id: 'loops-for',
  title: 'for loops: init, test, step — all in one line',
  minutes: 13, xp: 110,
  tags: 'for loop counter nested times table comma operator scope iteration',
  why: `<p>Print 100 scores, check every character of a password, draw each row of a game board — "do this N times" is the single most common instruction in programming. The <code>for</code> loop packs the whole job into one line, and this lesson also arms you against the off-by-one mistake that has haunted every programmer who ever lived.</p>`,
  html: `
<p>Last lesson's healthy-loop checklist — initialize, test, update — is so universal that C gives it a shorthand of its own. The <code>for</code> loop puts all three on one line, where you can't forget any of them:</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p><code>for (init; condition; step)</code> runs like this — note it's exactly a while loop in a tailored suit:</p>
<div data-w="flow1"></div>

<ul>
<li><b>init</b> runs once, before anything else. Declaring the variable right there (<code>int i = 1</code>) is standard since C99.</li>
<li><b>condition</b> is tested before every iteration — first one included.</li>
<li><b>step</b> runs after each body, just before the next test.</li>
</ul>

<p>Watch all three phases fire in order:</p>
<div data-w="tr1"></div>

<div data-w="q1"></div>

<h2>The loop variable's tiny life</h2>
<p>Declare <code>i</code> in the init clause and it exists <em>only inside the loop</em> — after the closing brace, <code>i</code> is gone, and mentioning it is a compile error. This is a feature: each loop gets a fresh, private counter, and no stale counters leak around your function.</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Off-by-one, the eternal enemy:</b> <code>for (int i = 0; i &lt; n; i++)</code> runs exactly n times — the idiomatic C loop (and it will match array indexing perfectly in Part 2). Writing <code>&lt;=</code> runs n+1 times. When a loop misbehaves, check the boundary first: does it start at 0 or 1? Is the test <code>&lt;</code> or <code>&lt;=</code>?</p></div></div>

<div data-w="q2"></div>

<h2>Nested loops: the times table</h2>
<p>A loop body can contain another loop. The inner loop runs to completion for <em>every single iteration</em> of the outer one — 10 × 10 = 100 inner bodies here:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>

<h2>Two counters at once: the comma operator</h2>
<p>The init and step clauses each accept only one expression — but the <strong>comma operator</strong> chains several into one, evaluating left to right. It's the idiomatic way to walk two indices together (you'll meet it again reversing arrays in Part 2):</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p>All three clauses are optional. <code>for (;;)</code> — affectionately "forever" — is a perfectly legal infinite loop, equivalent to <code>while (1)</code>. The semicolons stay, though: <code>for ()</code> won't compile.</p></div></div>

<div data-w="ed1"></div>

<div data-w="q3"></div>

<p>You can now start loops — next you'll learn to <b>escape them early</b>: break, continue, and the infamous goto.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'sum100.c',
      code: `#include <stdio.h>

int main(void) {
    int sum = 0;

    for (int i = 1; i <= 100; i++) {
        sum += i;
    }
    printf("1 + 2 + ... + 100 = %d\\n", sum);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc sum100.c -o sum100 && ./sum100
1 + 2 + ... + 100 = 5050
# young Gauss computed this in his head; your CPU does it in nanoseconds` },
    flow1: {
      type: 'flow', label: 'for (init; cond; step)', colw: 200, rowh: 86,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'start' },
        { id: 'init', col: 0, row: 1, kind: 'proc', label: 'init: int i = 1\n(runs ONCE)' },
        { id: 'c', col: 0, row: 2, kind: 'dec', label: 'i <= 3 ?' },
        { id: 'b', col: 0, row: 3, kind: 'proc', label: 'body:\nsum += i' },
        { id: 'st', col: 0, row: 4, kind: 'proc', label: 'step: i++' },
        { id: 'e', col: 1, row: 2, kind: 'end', label: 'loop done\n(i out of scope)' },
      ],
      edges: [
        { from: 's', to: 'init' },
        { from: 'init', to: 'c' },
        { from: 'c', to: 'b', label: 'true' },
        { from: 'c', to: 'e', label: 'false' },
        { from: 'b', to: 'st' },
        { from: 'st', to: 'c', side: 'left', label: 'test again' },
      ],
      note: 'Same machine as while — init before, step after each body — but declared in one self-documenting line.',
    },
    tr1: {
      type: 'trace', label: 'Summing 1..3 — watch init, test, body, step', title: 'sum.c',
      code: `#include <stdio.h>

int main(void) {
    int sum = 0;
    for (int i = 1; i <= 3; i++) {
        sum += i;
    }
    printf("sum = %d\\n", sum);
    return 0;
}`,
      steps: [
        { line: 4, vars: { sum: 0 }, out: '', note: 'sum starts at 0.' },
        { line: 5, vars: { sum: 0, i: 1 }, out: '', note: 'INIT runs once: i = 1. Then TEST: 1 ≤ 3, true.' },
        { line: 6, vars: { sum: 1, i: 1 }, out: '', note: 'BODY: sum += 1.' },
        { line: 5, vars: { sum: 1, i: 2 }, out: '', note: 'STEP: i++ → 2. TEST: 2 ≤ 3, true.' },
        { line: 6, vars: { sum: 3, i: 2 }, out: '', note: 'BODY: sum += 2 → 3.' },
        { line: 5, vars: { sum: 3, i: 3 }, out: '', note: 'STEP: i → 3. TEST: 3 ≤ 3, still true (that’s what <= means).' },
        { line: 6, vars: { sum: 6, i: 3 }, out: '', note: 'BODY: sum += 3 → 6.' },
        { line: 5, vars: { sum: 6, i: 4 }, out: '', note: 'STEP: i → 4. TEST: 4 ≤ 3 is FALSE — exit. i now ceases to exist.' },
        { line: 8, vars: { sum: 6 }, out: 'sum = 6\n', note: 'Note the variable panel: i is gone — it lived only inside the for.' },
      ],
    },
    q1: { type: 'quiz', q: 'In <code>for (int i = 0; i < 5; i++)</code>, when does <code>i++</code> run?', opts: ['Before the body, each time', 'After the body, before the next condition check', 'Once, at the very end of the loop', 'Whenever i is used'], a: 1, expl: 'Order per iteration: test → body → step → test again. The step always runs after a completed body — that’s why the trace showed i changing right before each new test.' },
    q2: { type: 'quiz', q: 'How many times does <code>for (int i = 0; i <= 10; i += 2)</code> run its body?', opts: ['5', '10', '6', '11'], a: 2, expl: 'i takes 0, 2, 4, 6, 8, 10 — six values (the <= keeps 10 in). With < it would be five. Counting fence posts carefully is half of C programming.' },
    code2: {
      type: 'code', title: 'timestable.c',
      code: `#include <stdio.h>

int main(void) {
    for (int row = 1; row <= 10; row++) {
        for (int col = 1; col <= 10; col++) {
            printf("%4d", row * col);
        }
        printf("\\n");        /* end the row */
    }
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc timestable.c -o tt && ./tt
   1   2   3   4   5   6   7   8   9  10
   2   4   6   8  10  12  14  16  18  20
   3   6   9  12  15  18  21  24  27  30
   4   8  12  16  20  24  28  32  36  40
   5  10  15  20  25  30  35  40  45  50
   6  12  18  24  30  36  42  48  54  60
   7  14  21  28  35  42  49  56  63  70
   8  16  24  32  40  48  56  64  72  80
   9  18  27  36  45  54  63  72  81  90
  10  20  30  40  50  60  70  80  90 100
# %4d right-aligns each number in 4 columns — instant neat table` },
    code3: {
      type: 'code', title: 'comma.c',
      code: `#include <stdio.h>

int main(void) {
    /* two counters marching toward each other */
    for (int lo = 0, hi = 9; lo < hi; lo++, hi--) {
        printf("lo=%d hi=%d\\n", lo, hi);
    }
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc comma.c -o comma && ./comma
lo=0 hi=9
lo=1 hi=8
lo=2 hi=7
lo=3 hi=6
lo=4 hi=5` },
    ed1: {
      type: 'editor', label: 'Exercise: star triangle',
      code: `#include <stdio.h>

int main(void) {
    int height = 5;

    /* Use nested for loops to print:
       *
       **
       ***
       ****
       *****
       Outer loop: rows 1..height.
       Inner loop: print row-many '*' then one '\\n'.  */

    return 0;
}`,
      hint: 'for (int row = 1; row <= height; row++) { for (int s = 0; s < row; s++) printf("*"); printf("\\n"); } — then flip it upside down for a bonus challenge.',
      height: 300,
    },
    q3: { type: 'quiz', q: 'After <code>for (int i = 0; i < 3; i++) { }</code>, what does <code>printf("%d", i);</code> do?', opts: ['Prints 3', 'Prints 2', 'Compile error — i no longer exists', 'Prints garbage'], a: 2, expl: 'A variable declared in the init clause is scoped to the loop. After the closing brace it’s not garbage — it’s GONE, and the compiler rejects the name outright. Declare i before the for if you need its final value.' },
  },
});

/* ---------------- break / continue / goto ---------------- */
CT.lesson({
  id: 'break-continue-goto',
  title: 'break, continue & goto: bending the flow',
  minutes: 13, xp: 120,
  tags: 'break continue goto label loop exit skip cleanup error handling',
  why: `<p>When your music app finds the song you searched for, it stops — it doesn't keep scanning the other 10,000 tracks. <code>break</code> and <code>continue</code> are the stop and skip buttons of loops, and you'll also discover why the "forbidden" <code>goto</code> still appears thousands of times, on purpose, in the code that runs Linux.</p>`,
  html: `
<p>Loops usually end when their condition says so — but real code often needs an emergency exit ("found it, stop searching!") or a skip button ("not interested in this one, next!"). C provides three flow-bending keywords: <code>break</code>, <code>continue</code>, and the notorious <code>goto</code>.</p>

<h2><code>break</code>: eject from the loop</h2>
<p><code>break</code> immediately terminates the innermost enclosing loop (or switch, as you saw last lesson) and resumes after its closing brace:</p>

<div data-w="flow1"></div>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2><code>continue</code>: skip to the next lap</h2>
<p><code>continue</code> abandons the <em>current iteration</em> only: it jumps straight to the next condition check (in a <code>for</code>, the step still runs first — the loop stays healthy). The loop itself keeps going:</p>

<div data-w="flow2"></div>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>break only escapes ONE level.</b> In nested loops, a <code>break</code> in the inner loop returns you to the outer loop, which happily continues. There is no <code>break 2;</code> in C (sorry, PHP folks). To exit several levels you can set a flag and test it in each condition, move the loops into a function and <code>return</code>… or use the one legitimate <code>goto</code> below.</p></div></div>

<div data-w="q2"></div>

<h2><code>goto</code>: the keyword with a reputation</h2>
<p><code>goto</code> jumps to a <strong>label</strong> — a name followed by a colon, marking a spot in the same function. Dijkstra's famous 1968 letter "Go To Statement Considered Harmful" made it programming's boogeyman, and yes: spaghetti of upward, criss-crossing gotos is unmaintainable.</p>
<p>But modern C has two <em>respectable</em> uses, both jumping strictly forward and downward:</p>
<ul>
<li><b>Escaping nested loops</b> — one clean hop instead of flag gymnastics.</li>
<li><b>Centralized error-handling cleanup</b> — the pattern below, used all over the Linux kernel, CPython, and virtually every serious C codebase.</li>
</ul>
<div data-w="code3"></div>
<p>Why this is good design: every failure path releases <em>exactly</em> the resources acquired so far, in reverse order, with a single copy of the cleanup code. Without <code>goto</code> you'd repeat the frees in every error branch — and one day forget one (hello, memory leak). Don't worry about the <code>malloc</code>/<code>NULL</code> details yet; Part 2 covers them properly. The <em>shape</em> is what matters.</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>The house rules for goto:</b> jump forward only, jump downward only, target cleanup/exit labels only. Within those fences it's not spaghetti — it's C's substitute for exceptions.</p></div></div>

<div data-w="q3"></div>

<div data-w="ed1"></div>

<p>Our loops are getting long enough to want names of their own — time to package code into <b>functions</b>.</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'break: found it? leave immediately', colw: 200, rowh: 88,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'for i = 0..9' },
        { id: 'd', col: 0, row: 1, kind: 'dec', label: 'target\nfound ?' },
        { id: 'b', col: 0, row: 2, kind: 'proc', label: 'check item i' },
        { id: 'e', col: 1, row: 1, kind: 'end', label: 'after loop' },
      ],
      edges: [
        { from: 's', to: 'd' },
        { from: 'd', to: 'e', label: 'yes — break' },
        { from: 'd', to: 'b', label: 'no' },
        { from: 'b', to: 'd', side: 'left', label: 'next i' },
      ],
      note: 'break jumps straight past the loop’s closing brace — remaining iterations are abandoned.',
    },
    code1: {
      type: 'code', title: 'firstdiv.c — break when found',
      code: `#include <stdio.h>

int main(void) {
    int n = 91;   /* is it prime? find a divisor */
    int divisor = 0;

    for (int d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            divisor = d;
            break;            /* found one — stop searching */
        }
    }

    if (divisor)
        printf("%d = %d x %d\\n", n, divisor, n / divisor);
    else
        printf("%d is prime\\n", n);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc firstdiv.c -o firstdiv && ./firstdiv
91 = 7 x 13
# without break we'd keep testing 8, 9, ... for nothing` },
    q1: { type: 'quiz', q: 'What does <code>break</code> inside the inner one of two nested loops do?', opts: ['Exits both loops', 'Exits only the inner loop; the outer continues', 'Skips one iteration of the inner loop', 'Ends the program'], a: 1, expl: 'break always escapes exactly one level — the innermost loop or switch it sits in. The outer loop never notices. Multi-level escapes need a flag, a return, or a forward goto.' },
    flow2: {
      type: 'flow', label: 'continue: skip this one, keep looping', colw: 200, rowh: 84,
      nodes: [
        { id: 's', col: 0, row: 0, kind: 'start', label: 'for i = 1..8' },
        { id: 'c', col: 0, row: 1, kind: 'dec', label: 'i <= 8 ?' },
        { id: 't', col: 0, row: 2, kind: 'dec', label: 'i even ?' },
        { id: 'b', col: 0, row: 3, kind: 'io', label: 'printf i' },
        { id: 'st', col: 0, row: 4, kind: 'proc', label: 'step: i++' },
        { id: 'e', col: 1, row: 1, kind: 'end', label: 'done' },
      ],
      edges: [
        { from: 's', to: 'c' },
        { from: 'c', to: 't', label: 'yes' },
        { from: 'c', to: 'e', label: 'no' },
        { from: 't', to: 'b', label: 'no' },
        { from: 't', to: 'st', side: 'right', label: 'yes — continue' },
        { from: 'b', to: 'st' },
        { from: 'st', to: 'c', side: 'left' },
      ],
      note: 'continue skips the REST of the body — but in a for loop the step still runs, so the counter can’t get stuck.',
    },
    code2: {
      type: 'code', title: 'odds.c — continue to filter',
      code: `#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 8; i++) {
        if (i % 2 == 0) {
            continue;         /* even? not interested */
        }
        printf("%d is odd\\n", i);
    }
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc odds.c -o odds && ./odds
1 is odd
3 is odd
5 is odd
7 is odd` },
    q2: { type: 'quiz', q: 'In a <code>for</code> loop, <code>continue</code> jumps to…', opts: ['the first line of the function', 'the condition, skipping the step', 'the step expression, then the condition', 'right after the loop'], a: 2, expl: 'In for loops the step is sacred: continue runs it before re-testing. (In a while loop, continue jumps straight to the condition — which is why converting a for to a while with continue inside can create an infinite loop!)' },
    code3: {
      type: 'code', title: 'cleanup.c — the respectable goto', run: false, hl: [10, 13, 18, 19, 20, 21, 22],
      code: `#include <stdio.h>
#include <stdlib.h>

int process(void) {
    int status = -1;
    FILE *log = NULL;
    char *buf = NULL;

    log = fopen("run.log", "w");
    if (log == NULL) goto out;          /* nothing to undo yet  */

    buf = malloc(4096);
    if (buf == NULL) goto close_log;    /* must undo the fopen  */

    /* ... real work with log and buf ... */
    status = 0;                         /* success!             */

    free(buf);                          /* fall into cleanup    */
close_log:
    fclose(log);
out:
    return status;
}`
    },
    q3: { type: 'quiz', q: 'Why is the goto-cleanup pattern considered good C style?', opts: ['goto is faster than function calls', 'It lets loops run backwards', 'Every error path funnels through one copy of the cleanup code, released in reverse order', 'It replaces the need for return'], a: 2, expl: 'One exit ramp, one copy of each fclose/free, impossible to "forget a free in the third error branch". Forward-only jumps to cleanup labels are idiomatic C — the Linux kernel does it thousands of times.' },
    ed1: {
      type: 'editor', label: 'Exercise: prime hunter',
      code: `#include <stdio.h>

int main(void) {
    /* Print all primes from 2 to 50.
       Outer loop: candidate n = 2..50.
       Inner loop: d = 2 while d*d <= n — if n % d == 0,
       it's composite: break out and move on.
       Use a flag variable (int is_prime) to remember
       whether the inner loop broke early.               */

    return 0;
}`,
      hint: 'int is_prime = 1; for (int d = 2; d * d <= n; d++) if (n % d == 0) { is_prime = 0; break; } — expect 2 3 5 7 11 13 ... 47. Bonus: add continue to skip even candidates above 2.',
      height: 300,
    },
  },
});

/* ---------------- functions ---------------- */
CT.lesson({
  id: 'functions',
  title: 'Functions: name it once, use it forever',
  minutes: 14, xp: 130,
  tags: 'function prototype declaration definition void return parameter argument pass by value stack frame',
  why: `<p>Copy-paste the same five lines into three places and one day you'll fix a bug in two of them and forget the third. Functions let you write logic once, name it, and reuse it forever — they're the reason million-line programs like games and browsers don't collapse under their own weight. You've been calling <code>printf</code> since day one; today you build your own.</p>`,
  html: `
<p>You've been <em>using</em> functions since your first <code>printf</code> — now you get to <em>make</em> them. A function packages a piece of logic behind a name: define it once, call it from anywhere, trust it to do its job. It is the single most important tool for taming complexity in C.</p>

<h2>Anatomy of a function</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<ul>
<li><b>Return type</b> (<code>int</code>) — the type of value handed back. Use the keyword <code>void</code> for "returns nothing".</li>
<li><b>Name</b> (<code>square</code>) — pick verbs for actions, nouns for computations.</li>
<li><b>Parameters</b> (<code>int n</code>) — fresh local variables, filled in with the caller's <em>arguments</em> at each call. A function taking nothing declares <code>(void)</code>.</li>
<li><b><code>return</code></b> — stops the function immediately and delivers the value. A <code>void</code> function may use bare <code>return;</code> or just fall off the end.</li>
</ul>

<div data-w="q1"></div>

<h2>Declaration vs definition: promises vs delivery</h2>
<p>C compilers read top to bottom, and a function must be <em>known</em> before it's called. Two ways to arrange that:</p>
<ol>
<li>Define the function above its callers (fine for small files), or</li>
<li>Put a <strong>prototype</strong> — the header line ending in a semicolon — near the top, and define the body anywhere:</li>
</ol>
<div data-w="code2"></div>
<p>A prototype is a <em>declaration</em>: "a function with this name, these parameter types, this return type exists — trust me." The <em>definition</em> with the body is the delivery on that promise. Headers like <code>stdio.h</code> are, at heart, just bundles of prototypes — that's the missing piece of the <code>#include</code> story from lesson one. Promise a function and never define it, and you'll meet our old friend from Part 0: the linker's <code>undefined reference</code>.</p>

<div data-w="q2"></div>

<h2>The big rule: arguments are passed BY VALUE</h2>
<p>When you call <code>doubler(x)</code>, the parameter does not <em>become</em> x — it receives a <strong>copy</strong> of x's value, in a brand-new variable inside the function's own stack frame (remember Part 0's stack?). Modify the copy all you like; the original never notices:</p>
<div data-w="code3"></div>
<div data-w="term3"></div>

<p>Here's the memory picture at the moment <code>doubler</code> sets <code>n = 20</code> — two separate cells, two separate lives:</p>
<div data-w="mem1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>"But I want the function to change my variable!"</b> — everyone, week two. The C answer is to pass the variable's <em>address</em> so the function can reach back and modify the original. That is exactly what pointers are for, and it's the opening act of Part 2. For now: return the new value and assign it, like <code>x = doubler(x);</code>.</p></div></div>

<div data-w="q3"></div>

<div data-w="ed1"></div>

<p>Functions create little private worlds for their variables — the precise rules of who can see what, and for how long, are our final Part 1 topic: <b>scope and lifetime</b>.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'square.c',
      code: `#include <stdio.h>

int square(int n) {          /* definition: the real thing */
    return n * n;
}

void greet(void) {           /* returns nothing, takes nothing */
    printf("Hello from a function!\\n");
}

int main(void) {
    greet();
    int a = square(6);       /* call: argument 6 -> parameter n */
    printf("square(6)  = %d\\n", a);
    printf("square(a)  = %d\\n", square(a));  /* results compose */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc square.c -o square && ./square
Hello from a function!
square(6)  = 36
square(a)  = 1296` },
    q1: { type: 'quiz', q: 'What does the keyword <code>void</code> mean in <code>void greet(void)</code>?', opts: ['The function is empty', 'Returns nothing, and takes no parameters', 'The function can’t be called twice', 'The function is private'], a: 1, expl: 'First void: no return value (a bare <code>return;</code> or falling off the end is fine). Second void: no parameters. In C, empty parens <code>()</code> historically meant "unspecified parameters" — C23 finally fixed that, but <code>(void)</code> remains the bulletproof spelling.' },
    code2: {
      type: 'code', title: 'prototype.c',
      code: `#include <stdio.h>

double celsius_to_f(double c);   /* PROTOTYPE: a promise */

int main(void) {
    printf("100 C = %.1f F\\n", celsius_to_f(100.0));
    printf("37 C  = %.1f F\\n", celsius_to_f(37.0));
    return 0;
}

/* DEFINITION: the promise, delivered (below its caller!) */
double celsius_to_f(double c) {
    return c * 9.0 / 5.0 + 32.0;
}`
    },
    q2: { type: 'quiz', q: 'A prototype exists but the definition was never written. When does the build fail?', opts: ['At the linker stage — undefined reference', 'At the compile stage — syntax error', 'At runtime — crash on call', 'It works; C invents an empty body'], a: 0, expl: 'The compiler is satisfied by the promise (prototype) and generates a call to a name. The LINKER must then find the actual code — and can’t. Compiler checks grammar and types; linker resolves names. Same split you saw in the pipeline lesson.' },
    code3: {
      type: 'code', title: 'byvalue.c',
      code: `#include <stdio.h>

void doubler(int n) {
    n = n * 2;               /* modifies the COPY  */
    printf("  inside : n = %d\\n", n);
}

int main(void) {
    int x = 10;
    printf("before  : x = %d\\n", x);
    doubler(x);
    printf("after   : x = %d  <- unchanged!\\n", x);
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc byvalue.c -o byvalue && ./byvalue
before  : x = 10
  inside : n = 20
after   : x = 10  <- unchanged!` },
    mem1: {
      type: 'memgrid', label: 'The stack during doubler(x): two frames, two variables',
      note: '<code>n</code> was born as a copy of <code>x</code>’s value (10), then changed to 20 — in its own cell, in <code>doubler</code>’s frame. <code>x</code> in <code>main</code>’s frame never budged. When doubler returns, its frame (and n) vanish.',
      cells: [
        { addr: '0x7ffc58', val: '10', name: "x — main's frame", hl: true },
        { addr: '0x7ffc40', val: '…', name: 'return address' },
        { addr: '0x7ffc2c', val: '10 → 20', name: "n — doubler's frame (a COPY)", hl2: true },
      ],
    },
    q3: { type: 'quiz', q: 'After <code>void f(int a) { a = 99; }</code> is called as <code>f(x)</code> with <code>x = 5</code>, x is…', opts: ['99', 'undefined', '5', '0'], a: 2, expl: 'Pass by value: <code>a</code> is a fresh variable initialized with a copy of 5. Assigning to it touches only the copy, which dies when f returns. Every argument in C works this way — even (spoiler) pointers, which copy the address.' },
    ed1: {
      type: 'editor', label: 'Exercise: build a tiny library',
      code: `#include <stdio.h>

/* 1. Write  int max2(int a, int b)  — the larger of two.
   2. Write  int max3(int a, int b, int c)  — reuse max2!
   3. Write  void banner(void)  — prints a line of ==== .
   Add prototypes above main if you define them below it. */

int main(void) {
    /* banner();
    printf("max3(3, 9, 5) = %d\\n", max3(3, 9, 5));
    banner(); */
    return 0;
}`,
      hint: 'max3 in one line: return max2(max2(a, b), c); — composing small functions is the whole game. Expect max3(3,9,5) = 9.',
      height: 300,
    },
  },
});

/* ---------------- scope & lifetime ---------------- */
CT.lesson({
  id: 'scope-lifetime',
  title: 'Scope & lifetime: who sees what, and for how long',
  minutes: 14, xp: 130,
  tags: 'scope lifetime block shadowing static extern auto register linkage global local',
  why: `<p>Two mysteries ambush every beginner: "why isn't my variable changing?!" (a hidden twin with the same name is soaking up your assignments) and "how can a function remember something between calls?" (a variable that quietly refuses to die). Both answers live in this lesson — the rules of who can see a variable and how long it stays alive.</p>`,
  html: `
<p>Every variable in C answers two independent questions. <strong>Scope</strong>: from <em>where</em> in the code can I refer to it? <strong>Lifetime</strong>: for <em>how long</em> does its memory exist? Most of the time the two travel together — but the interesting corners of C are exactly where they split apart. First up: what a pair of braces — a <em>block</em> — does to a variable's visibility, including the sneaky case where one variable hides another behind the same name.</p>

<h2>Block scope & shadowing</h2>
<p>A variable declared inside <code>{ … }</code> exists from its declaration to the closing brace — that region is its scope. Blocks nest, and an inner declaration with the same name <strong>shadows</strong> the outer one: the outer variable still exists, but its name is temporarily eclipsed.</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p>Shadowing is legal and occasionally handy, but it's a classic source of "why isn't my variable changing?!" confusion. GCC's <code>-Wshadow</code> flags every case — worth turning on.</p></div></div>

<div data-w="q1"></div>

<h2>Two historic keywords: <code>auto</code> and <code>register</code></h2>
<p>Ordinary locals are <em>automatic</em> — created on block entry, destroyed on exit, stack-dwelling. The keyword <code>auto</code> says exactly that… and since locals are automatic <em>by default</em>, nobody has typed it in fifty years. (Plot twist: C23 recycled <code>auto</code> for type inference, like C++.) Its sibling <code>register</code> once begged the compiler to keep a variable in a CPU register; modern optimizers ignore the hint entirely. Its one surviving effect: you may not take a <code>register</code> variable's address. Both keywords are museum pieces you must recognize, not use.</p>

<h2><code>static</code> locals: scope of an ant, lifetime of an elephant</h2>
<p>Mark a local variable <code>static</code> and its <em>scope</em> stays tiny — just that block — but its <em>lifetime</em> becomes the whole program. It lives in the data segment (Part 0!), not the stack, is initialized exactly once before <code>main</code> even starts, and <strong>remembers its value between calls</strong>:</p>
<div data-w="code2"></div>
<div data-w="term2"></div>
<p>Watch the initialization happen only once — the trace makes it obvious:</p>
<div data-w="tr1"></div>

<div data-w="q2"></div>

<h2><code>extern</code>: one variable, many files</h2>
<p>A variable declared <em>outside</em> every function is <strong>global</strong>: file-wide scope, program-long lifetime. To use one global across several .c files, exactly one file <em>defines</em> it, and the others <em>declare</em> it with the keyword <code>extern</code> — "it exists, but elsewhere; linker, please connect us":</p>
<div data-w="code3"></div>
<p>This is the declaration-vs-definition split from the functions lesson, replayed for variables. And that's <strong>linkage</strong> in a nutshell — the linker matching names across files. One more twist: <code>static</code> on a <em>global</em> (or a function) means the opposite of extern — "private to this file, invisible to the linker". Same keyword, second job; Part 3's storage-classes lesson dissects it fully.</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Style compass:</b> prefer the smallest scope that works. Locals over globals, loop-scoped counters over function-wide ones. Globals aren't evil, but every one of them is a variable ANY code might change — the more you have, the harder your program is to reason about.</p></div></div>

<div data-w="q3"></div>

<div data-w="ed1"></div>

<p>🎉 That wraps Part 1 — you can now write real, structured C programs. Ahead lies the part that gives C its reputation and its power: <b>pointers and memory</b>. Deep breath; it's more logical than the legends claim.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'shadow.c',
      code: `#include <stdio.h>

int main(void) {
    int x = 1;
    printf("outer x: %d\\n", x);
    {
        int x = 2;               /* shadows the outer x      */
        printf("inner x: %d\\n", x);
        x = 99;                  /* changes ONLY the inner x */
    }                            /* inner x dies here        */
    printf("outer x: %d  (untouched)\\n", x);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc shadow.c -o shadow && ./shadow
outer x: 1
inner x: 2
outer x: 1  (untouched)` },
    q1: { type: 'quiz', q: 'Inside the inner block of <code>shadow.c</code>, what happened to the outer <code>x</code>?', opts: ['It was destroyed and recreated later', 'It still existed — only its NAME was hidden by the inner x', 'It was renamed by the compiler', 'It became read-only'], a: 1, expl: 'Shadowing hides names, not memory. The outer x sat in its stack slot the whole time, value intact — there was just no way to spell it while the inner x owned the name.' },
    code2: {
      type: 'code', title: 'counter.c',
      code: `#include <stdio.h>

int next_id(void) {
    static int id = 100;   /* initialized ONCE, lives forever */
    id++;
    return id;
}

int main(void) {
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    printf("%d\\n", next_id());
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc counter.c -o counter && ./counter
101
102
103
# a plain 'int id = 100;' would print 101 three times` },
    tr1: {
      type: 'trace', label: 'static survives between calls', title: 'visits.c',
      code: `#include <stdio.h>

void visit(void) {
    static int count = 0;
    count++;
    printf("visit #%d\\n", count);
}

int main(void) {
    visit();
    visit();
    visit();
    return 0;
}`,
      steps: [
        { line: 10, vars: { count: 0 }, out: '', note: 'count = 0 was set before main even ran — static init happens once, at program start.' },
        { line: 4, vars: { count: 0 }, out: '', note: 'First call enters visit. The initializer does NOT run again — this line is now just a landmark.' },
        { line: 5, vars: { count: 1 }, out: '', note: 'count -> 1, in the data segment, not on the stack.' },
        { line: 6, vars: { count: 1 }, out: 'visit #1\n', note: 'Print, return… and count is NOT destroyed.' },
        { line: 11, vars: { count: 1 }, out: 'visit #1\n', note: 'Second call. A normal local would restart at 0 here.' },
        { line: 5, vars: { count: 2 }, out: 'visit #1\n', note: 'It remembered! 1 -> 2.' },
        { line: 6, vars: { count: 2 }, out: 'visit #1\nvisit #2\n', note: 'Scope tiny (only visit can name count), lifetime huge.' },
        { line: 12, vars: { count: 2 }, out: 'visit #1\nvisit #2\n', note: 'Third call…' },
        { line: 5, vars: { count: 3 }, out: 'visit #1\nvisit #2\n', note: '2 -> 3.' },
        { line: 6, vars: { count: 3 }, out: 'visit #1\nvisit #2\nvisit #3\n', note: 'One variable, three calls, full memory of its past.' },
      ],
    },
    q2: { type: 'quiz', q: 'How many times does <code>static int id = 100;</code> execute its initialization across 5 calls to next_id()?', opts: ['5 times', 'Twice', 'Exactly once, before the program starts', 'Never — statics start as garbage'], a: 2, expl: 'Static storage is initialized once, at program startup (and to zero if you give no initializer — never garbage, unlike stack locals!). On later calls the declaration line is just scenery.' },
    code3: {
      type: 'code', title: 'two files, one global', run: false,
      code: `/* ---- config.c ---- */
int max_users = 64;          /* THE definition: memory lives here */

/* ---- server.c ---- */
#include <stdio.h>
extern int max_users;        /* declaration: defined elsewhere    */

void report(void) {
    printf("limit: %d users\\n", max_users);   /* same variable  */
}`
    },
    q3: { type: 'quiz', q: '<code>extern int max_users;</code> means…', opts: ['create a new variable named max_users', 'this variable exists, but its definition (memory) is in another file — linker, connect us', 'max_users cannot be modified', 'max_users is stored on the heap'], a: 1, expl: 'extern makes a declaration without a definition: no storage is allocated. Exactly one translation unit must define the variable, or the linker reports undefined reference — the same promise/delivery dance as function prototypes.' },
    ed1: {
      type: 'editor', label: 'Exercise: a polite door counter',
      code: `#include <stdio.h>

/* Write  void enter(void)  which prints
   "hello, you are visitor N" using a static counter
   that starts at 1 and counts up.
   Then call it four times from main.
   Afterwards: delete 'static' and run again — what changes? */

int main(void) {
    return 0;
}`,
      hint: 'static int n = 1; inside enter(), print then n++. With static: visitors 1,2,3,4. Without: visitor 1 four times — the variable is reborn on every call.',
      height: 280,
    },
  },
});
