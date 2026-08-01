/* ============================================================
   Part 0 — Foundations: Before C
   ============================================================ */

/* ---------------- bits & binary ---------------- */
CT.lesson({
  id: 'bits-binary',
  title: 'Bits & Binary: how machines count',
  minutes: 12, xp: 100,
  tags: 'bit byte binary base 2 powers of two',
  why: `<p>Every photo, song, and game on your phone is, deep down, nothing but billions of tiny on/off switches. Learn to read those switches and you can count to any number using just two symbols — and you'll finally know why computer sizes always come as 64, 128, or 256, never a nice round 100.</p>`,
  html: `
<p>Deep down, a computer is just <strong>billions of tiny switches</strong>. Each switch is either <em>off</em> or <em>on</em> — we write that as <code>0</code> or <code>1</code> and call it a <strong>bit</strong> (a <em>binary digit</em>). That's the entire alphabet of the CPU — the chip that does your computer's actual thinking. Everything you'll ever program — photos, games, this very page — is built out of those two symbols.</p>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p><b>Why only two?</b> Electrically, "is there voltage or not?" is easy and reliable to detect. Ten different voltage levels (for decimal) would be fragile and slow. Two states = cheap, fast, and nearly error-proof.</p></div></div>

<h2>Counting with two fingers</h2>
<p>You count in base 10 because you have ten fingers: each digit position is worth 10× the one to its right (…1000, 100, 10, 1). Binary works <em>exactly</em> the same way, except each position is worth <strong>2×</strong> the one to its right: …8, 4, 2, 1.</p>
<p>So binary <code>1011</code> means: 1×8 + 0×4 + 1×2 + 1×1 = <strong>11</strong>.</p>

<p>Eight bits make a <strong>byte</strong> — the standard "unit" of memory. Play with one below: can you make <b>42</b>? What's the biggest number a byte can hold?</p>
<div data-w="byte"></div>

<div data-w="q1"></div>

<h2>Powers of two are everywhere</h2>
<p>Every bit you add <strong>doubles</strong> how many values you can represent. That's why the same "magic numbers" keep showing up in computing:</p>
<table>
<tr><th>bits</th><th>distinct values</th><th>you know it as…</th></tr>
<tr><td>1</td><td>2</td><td>a boolean: true / false</td></tr>
<tr><td>8</td><td>256</td><td>a byte — <code>char</code> in C, values 0…255</td></tr>
<tr><td>16</td><td>65,536</td><td><code>short</code> — ports, Unicode's first plane</td></tr>
<tr><td>32</td><td>~4.3 billion</td><td><code>int</code> on most machines, IPv4 addresses</td></tr>
<tr><td>64</td><td>~1.8 × 10<sup>19</sup></td><td><code>long long</code>, pointers on your PC</td></tr>
</table>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p>Memorize the small powers of two — 1, 2, 4, 8, 16, 32, 64, 128, 256 — they'll be your times tables for the rest of this course.</p></div></div>

<div data-w="q2"></div>

<h2>Binary in real C code</h2>
<p>C lets you write binary literals directly with the <code>0b</code> prefix (official since C23, supported by GCC and Clang for years):</p>
<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q3"></div>

<p>Next up: writing <code>11111111</code> gets old fast. Programmers have a beautiful shorthand for binary — <b>hexadecimal</b>.</p>
`,
  widgets: {
    byte: { type: 'bits', n: 8, value: 5, label: 'One byte, eight switches', hint: 'Click bits to flip them. Target practice: make 42, then 255, then 128.' },
    q1: { type: 'quiz', q: 'What is binary <code>1101</code> in decimal?', opts: ['11', '13', '15', '9'], a: 1, expl: '1101 = 8 + 4 + 0 + 1 = 13. Read right-to-left: ones place (1), twos place (0), fours place (1), eights place (1).' },
    q2: { type: 'quiz', q: 'A byte holds 8 bits. How many different values can it represent?', opts: ['8', '128', '255', '256'], a: 3, expl: '2⁸ = 256 different values — from 0 up to 255. A classic off-by-one trap: 255 is the biggest <em>value</em>, but there are 256 values including zero.' },
    code1: {
      type: 'code', title: 'binary.c',
      code: `#include <stdio.h>

int main(void) {
    int answer = 0b101010;      /* binary literal: 42 */
    int mask   = 0b11110000;    /* the top 4 bits of a byte */

    printf("answer = %d\\n", answer);
    printf("mask   = %d\\n", mask);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc binary.c -o binary && ./binary
answer = 42
mask   = 240` },
    q3: { type: 'quiz', q: 'Each extra bit __________ the number of representable values.', opts: ['adds one to', 'doubles', 'squares', 'adds two to'], a: 1, expl: 'n bits give 2ⁿ values, so one more bit gives 2ⁿ⁺¹ — exactly double. This doubling is the deep reason computers love powers of two.' },
  },
});

/* ---------------- hexadecimal ---------------- */
CT.lesson({
  id: 'hexadecimal',
  title: 'Hexadecimal & Octal: binary for humans',
  minutes: 10, xp: 100,
  tags: 'hex base 16 octal 0x nibble',
  why: `<p>You've already used hexadecimal without knowing it: every web color like <code>#FF8800</code> is one, and so are the cryptic codes on a crashed blue screen. It's the shorthand that turns an unreadable wall of 0s and 1s into two characters per byte — and after this lesson you'll convert between the two in your head, no arithmetic required.</p>`,
  html: `
<p>Binary is what machines speak, but for humans it's painfully verbose: a number like <code>0b11111111101010001001000000000000</code> is unreadable. <strong>Hexadecimal</strong> (base 16) fixes that: each hex digit packs <em>exactly four bits</em>, so any byte is just two characters.</p>

<h2>Sixteen digits</h2>
<p>Base 16 needs 16 symbols. We use 0–9, then borrow letters: <code>A</code>=10, <code>B</code>=11, <code>C</code>=12, <code>D</code>=13, <code>E</code>=14, <code>F</code>=15.</p>
<table>
<tr><th>binary</th><th>hex</th><th>dec</th><th>binary</th><th>hex</th><th>dec</th></tr>
<tr><td><code>0000</code></td><td>0</td><td>0</td><td><code>1000</code></td><td>8</td><td>8</td></tr>
<tr><td><code>0001</code></td><td>1</td><td>1</td><td><code>1001</code></td><td>9</td><td>9</td></tr>
<tr><td><code>0010</code></td><td>2</td><td>2</td><td><code>1010</code></td><td>A</td><td>10</td></tr>
<tr><td><code>0011</code></td><td>3</td><td>3</td><td><code>1011</code></td><td>B</td><td>11</td></tr>
<tr><td><code>0100</code></td><td>4</td><td>4</td><td><code>1100</code></td><td>C</td><td>12</td></tr>
<tr><td><code>0101</code></td><td>5</td><td>5</td><td><code>1101</code></td><td>D</td><td>13</td></tr>
<tr><td><code>0110</code></td><td>6</td><td>6</td><td><code>1110</code></td><td>E</td><td>14</td></tr>
<tr><td><code>0111</code></td><td>7</td><td>7</td><td><code>1111</code></td><td>F</td><td>15</td></tr>
</table>

<p>The trick: to convert binary ↔ hex you <strong>never do arithmetic</strong> — you just group bits in fours. <code>1011 0110</code> → <code>B6</code>. Done.</p>

<div data-w="conv"></div>
<div data-w="q1"></div>

<h2>Hex in C: the <code>0x</code> prefix</h2>
<div data-w="code1"></div>
<p>Notice <code>%x</code> in printf prints a value as hex, and <code>%o</code> prints octal (base 8, prefix <code>0</code> — a leading zero!).</p>

<div class="callout danger"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Classic trap:</b> in C, <code>int x = 010;</code> is <em>octal</em> — it means <b>8</b>, not ten! A leading zero changes the base. Never zero-pad integer literals.</p></div></div>

<div data-w="q2"></div>

<h2>Where you'll meet hex daily</h2>
<ul>
<li><b>Memory addresses:</b> <code>0x7ffee4c01a2c</code> — every pointer you'll ever print.</li>
<li><b>Colors:</b> <code>#FF8800</code> is just three bytes: red=0xFF, green=0x88, blue=0x00.</li>
<li><b>Bit masks:</b> <code>value &amp; 0x0F</code> keeps the low <em>nibble</em> (4 bits — half a byte).</li>
<li><b>File formats:</b> a PNG file always starts with bytes <code>89 50 4E 47</code>.</li>
</ul>

<div data-w="q3"></div>
`,
  widgets: {
    conv: { type: 'baseconv', value: 182, label: 'Convert anything to anything' },
    q1: { type: 'quiz', q: 'What is hex <code>0x2F</code> in decimal?', opts: ['37', '47', '52', '215'], a: 1, expl: '0x2F = 2×16 + 15 = 47. The F is 15, and the 2 sits in the sixteens place.' },
    code1: {
      type: 'code', title: 'hex.c',
      code: `#include <stdio.h>

int main(void) {
    int color = 0xFF8800;         /* an orange, as one int  */
    int red   = (color >> 16) & 0xFF;
    int green = (color >> 8)  & 0xFF;
    int blue  =  color        & 0xFF;

    printf("red=%d green=%d blue=%d\\n", red, green, blue);
    printf("42 is 0x%x in hex, %o in octal\\n", 42, 42);
    return 0;
}`
    },
    q2: { type: 'quiz', q: 'In C, what is the value of <code>int x = 011;</code>?', opts: ['11', '9', '3', 'compile error'], a: 1, expl: 'The leading zero makes it octal: 011 = 1×8 + 1 = 9. This surprising rule dates back to the 1970s — beware!' },
    q3: { type: 'quiz', q: 'How many bits does one hex digit represent?', opts: ['2', '4', '8', '16'], a: 1, expl: 'One hex digit covers exactly 16 values = 2⁴ = 4 bits (a "nibble"). That is why two hex digits describe a byte perfectly.' },
  },
});

/* ---------------- negative numbers ---------------- */
CT.lesson({
  id: 'negative-numbers',
  title: 'Negative numbers: two’s complement',
  minutes: 12, xp: 110,
  tags: 'signed unsigned twos complement overflow int min',
  why: `<p>In 2014, Gangnam Style racked up so many views it maxed out YouTube's counter at exactly 2,147,483,647 — and in old arcade games, a score that grew too big could suddenly flip to a huge <em>negative</em> number. This lesson shows where that oddly specific limit comes from, how a machine with no minus switch stores numbers below zero, and why values that get too big wrap around instead of just stopping.</p>`,
  html: `
<p>Bits can only be 0 or 1 — so how do we store <code>-5</code>? There's no minus switch. The answer, used by essentially every CPU on Earth, is a clever trick called <strong>two's complement</strong> — the scheme behind every <em>signed</em> type (programmer-speak for "allowed to be negative").</p>

<h2>The big idea: make the top bit negative</h2>
<p>In an 8-bit signed number, the leftmost bit doesn't mean +128 — it means <strong>−128</strong>. Every other bit stays positive. So the value is: <code>−128·b₇ + 64·b₆ + 32·b₅ + … + 1·b₀</code>.</p>

<div data-w="sbyte"></div>

<p>Why this design is genius: <b>addition just works</b>. The CPU uses the <em>same circuit</em> for signed and unsigned math — the bits don't care. <code>(-1) + 1</code> = <code>11111111 + 00000001</code> = <code>1_00000000</code> → the ninth bit falls off the edge → <code>00000000</code> = 0. ✓</p>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Quick negation recipe:</b> to compute −x, flip every bit and add 1. So 5 = <code>00000101</code> → flip → <code>11111010</code> → +1 → <code>11111011</code> = −5. In C: <code>-x == ~x + 1</code>.</p></div></div>

<div data-w="q1"></div>

<h2>Ranges are lopsided</h2>
<p>8 bits give 256 values. Two's complement splits them as −128 … +127. Notice: <em>one more negative than positive</em>, because zero eats one of the positive slots.</p>
<table>
<tr><th>type (typical)</th><th>bits</th><th>min</th><th>max</th></tr>
<tr><td><code>signed char</code></td><td>8</td><td>−128</td><td>127</td></tr>
<tr><td><code>short</code></td><td>16</td><td>−32,768</td><td>32,767</td></tr>
<tr><td><code>int</code></td><td>32</td><td>−2,147,483,648</td><td>2,147,483,647</td></tr>
<tr><td><code>unsigned int</code></td><td>32</td><td>0</td><td>4,294,967,295</td></tr>
</table>

<h2>Overflow: driving off the cliff</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>What happened? <code>INT_MAX + 1</code> wrapped around to <code>INT_MIN</code> — the odometer rolled over. For <em>unsigned</em> types, wraparound is well-defined (modulo 2ⁿ). For <em>signed</em> types it is <strong>undefined behavior</strong> — the compiler is allowed to assume it never happens, and weird things follow. We have a whole lesson on UB later.</p>

<div data-w="q2"></div>
<div data-w="q3"></div>
`,
  widgets: {
    sbyte: { type: 'bits', n: 8, signed: true, value: 251, label: 'Signed byte (two’s complement)', hint: 'This is −5. Click the sign bit (leftmost) and watch the value jump by 256. Try making −1, then −128.' },
    q1: { type: 'quiz', q: 'In 8-bit two’s complement, what value is <code>11111111</code>?', opts: ['255', '−1', '−127', '−255'], a: 1, expl: '−128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = −1. All-ones is always −1 in two’s complement, at any width. (As unsigned it would be 255.)' },
    code1: {
      type: 'code', title: 'overflow.c',
      code: `#include <stdio.h>
#include <limits.h>

int main(void) {
    int big = INT_MAX;               /* 2147483647 */
    printf("big     = %d\\n", big);
    printf("big + 1 = %d\\n", big + 1);   /* undefined behavior! */

    unsigned int u = 0;
    printf("0u - 1  = %u\\n", u - 1);     /* well-defined wrap */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc overflow.c -o overflow && ./overflow
big     = 2147483647
big + 1 = -2147483648
0u - 1  = 4294967295` },
    q2: { type: 'quiz', q: 'Why do CPUs love two’s complement?', opts: ['It stores bigger numbers', 'The same adder circuit works for signed and unsigned', 'It never overflows', 'It uses fewer bits'], a: 1, expl: 'One adder to rule them all. Sign-magnitude or offset encodings would need special-case hardware; two’s complement makes +, −, × identical at the bit level.' },
    q3: { type: 'quiz', q: 'Signed integer overflow in C is…', opts: ['wraparound, like unsigned', 'a compile error', 'undefined behavior', 'always a crash'], a: 2, expl: 'It usually <em>looks</em> like wraparound, but the standard says undefined behavior — the optimizer may assume it can’t happen and transform your code in surprising ways.' },
  },
});

/* ---------------- floating point ---------------- */
CT.lesson({
  id: 'floating-point',
  title: 'Floating point: scientific notation in bits',
  minutes: 14, xp: 120,
  tags: 'float double ieee 754 mantissa exponent nan infinity 0.1',
  why: `<p>Type <code>0.1 + 0.2</code> into almost any programming language and you can get back <code>0.30000000000000004</code>. That famous glitch is not a bug — it's how every computer on Earth stores decimal numbers, and it's the reason banks never store money this way. By the end of this lesson the weirdness will make perfect sense, and you'll know the one comparison mistake with decimals that trips up nearly every beginner.</p>`,
  html: `
<p>Integers can't hold 3.14 or 0.001. For real numbers, C gives you <code>float</code> (32-bit) and <code>double</code> (64-bit), both using the <strong>IEEE 754</strong> standard — a rulebook nearly every computer agrees on, and essentially <em>binary scientific notation</em>.</p>

<h2>Three fields in one number</h2>
<p>Just like 6.022 × 10²³ has a sign, digits, and an exponent, a float splits its 32 bits into:</p>
<ul>
<li><b style="color:var(--red)">1 sign bit</b> — positive or negative</li>
<li><b style="color:var(--yellow)">8 exponent bits</b> — <em>where the point floats to</em> (stored with a +127 offset)</li>
<li><b style="color:var(--accent)">23 mantissa bits</b> — the significant digits (with a hidden leading 1)</li>
</ul>
<p>Value = (−1)<sup>sign</sup> × 1.mantissa × 2<sup>exponent−127</sup></p>

<div data-w="fx"></div>

<div data-w="q1"></div>

<h2>The famous 0.1 problem</h2>
<div data-w="code1"></div>
<div data-w="term1"></div>
<p>Why?! Because <b>0.1 cannot be written exactly in binary</b> — it's an infinite repeating fraction (<code>0.000110011001100…</code>), just like 1/3 = 0.333… in decimal. The computer stores the nearest representable value, and tiny errors accumulate.</p>

<div class="callout danger"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Golden rule:</b> never compare floats with <code>==</code>. Compare against a tolerance: <code>fabs(a - b) &lt; 1e-9</code>. And never use floats for money — count cents in integers instead.</p></div></div>

<div data-w="q2"></div>

<h2>Special values</h2>
<p>IEEE 754 reserves exponent patterns for weird-but-useful values:</p>
<table>
<tr><th>value</th><th>how you get it</th><th>fun fact</th></tr>
<tr><td><code>+∞ / −∞</code></td><td><code>1.0 / 0.0</code></td><td>float division by zero doesn't crash!</td></tr>
<tr><td><code>NaN</code> (not-a-number)</td><td><code>0.0 / 0.0</code>, <code>sqrt(-1)</code></td><td>NaN ≠ NaN — the only value not equal to itself</td></tr>
<tr><td><code>−0.0</code></td><td><code>-1.0 * 0.0</code></td><td>equal to +0.0, but prints with a minus</td></tr>
<tr><td>denormals</td><td>values &lt; ~1.2×10⁻³⁸</td><td>graceful fade to zero (with reduced precision)</td></tr>
</table>

<div data-w="q3"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>float vs double:</b> <code>float</code> gives ~7 significant decimal digits, <code>double</code> ~15–16. In C, unsuffixed literals like <code>3.14</code> are <code>double</code>; write <code>3.14f</code> for a float. Default to <code>double</code> unless memory is tight.</p></div></div>
`,
  widgets: {
    fx: { type: 'float32', value: 3.14, label: 'IEEE-754 float, bit by bit — click bits!' },
    q1: { type: 'quiz', q: 'A 32-bit float splits its bits as…', opts: ['8 sign, 8 exp, 16 mantissa', '1 sign, 8 exp, 23 mantissa', '1 sign, 15 exp, 16 mantissa', '2 sign, 10 exp, 20 mantissa'], a: 1, expl: '1 + 8 + 23 = 32. A double is 1 + 11 + 52 = 64 bits.' },
    code1: {
      type: 'code', title: 'pointone.c',
      code: `#include <stdio.h>

int main(void) {
    double sum = 0.0;
    for (int i = 0; i < 10; i++)
        sum += 0.1;

    printf("sum        = %.17f\\n", sum);
    printf("sum == 1.0 ? %s\\n", sum == 1.0 ? "yes" : "NO!");
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc pointone.c -o pointone && ./pointone
sum        = 0.99999999999999989
sum == 1.0 ? NO!` },
    q2: { type: 'quiz', q: 'Why does <code>0.1 + 0.2 != 0.3</code> in floating point?', opts: ['A compiler bug', '0.1, 0.2 and 0.3 have no exact binary representation', 'Floats can only store integers scaled by 2', 'printf rounds incorrectly'], a: 1, expl: 'Like 1/3 in decimal, 1/10 is an infinite repeating fraction in binary. Each constant is rounded to the nearest representable double, and the sums of the roundings differ.' },
    q3: { type: 'quiz', q: 'Which comparison is true in IEEE 754?', opts: ['<code>NaN == NaN</code>', '<code>-0.0 == 0.0</code>', '<code>INFINITY == NAN</code>', '<code>1.0/0.0 == 0.0</code>'], a: 1, expl: 'Negative zero compares equal to positive zero. NaN is never equal to anything — even itself; that is actually how <code>isnan()</code> can be implemented.' },
  },
});

/* ---------------- text encoding ---------------- */
CT.lesson({
  id: 'text-encoding',
  title: 'Text: ASCII, Unicode & UTF-8',
  minutes: 12, xp: 110,
  tags: 'char ascii unicode utf8 encoding string characters',
  why: `<p>That garbled text you've surely seen — an apostrophe showing up as <code>â€™</code>, an emoji reduced to <code>???</code> — happens when two programs disagree about which numbers stand for which letters. After this lesson you'll know exactly how plain English, accents, and emoji travel as bytes, and you'll be armed against a trap that bites almost every new C programmer: one byte is <em>not</em> one character.</p>`,
  html: `
<p>Computers only store numbers — so what is the letter <code>'A'</code>? It's just the number <strong>65</strong>, by agreement. That agreement is called a <strong>character encoding</strong>, and it's the bridge between bytes and human text.</p>

<h2>ASCII: the original deal (1963)</h2>
<p>ASCII assigns 0–127 to English letters, digits, punctuation, and control codes. The layout is delightfully hackable:</p>
<ul>
<li><code>'0'</code>–<code>'9'</code> are 48–57 → <code>digit - '0'</code> converts a digit character to its value</li>
<li><code>'A'</code>–<code>'Z'</code> are 65–90, <code>'a'</code>–<code>'z'</code> are 97–122 → exactly <b>32 apart</b>, one bit! <code>c | 0x20</code> lowercases a letter</li>
<li>0–31 are control codes: <code>'\\n'</code> = 10 (newline), <code>'\\t'</code> = 9 (tab), <code>'\\0'</code> = 0 (the string terminator — hugely important in C)</li>
</ul>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div data-w="q1"></div>

<h2>Unicode: one number for every character ever</h2>
<p>ASCII has no é, no 中, no 🎉. <strong>Unicode</strong> fixes this by assigning a <em>code point</em> to every character in every language — over 150,000 so far, written like <code>U+1F600</code>. But code points are abstract numbers; we still need to store them as bytes. Enter <strong>UTF-8</strong>, the encoding that won the internet:</p>
<ul>
<li>Code points 0–127 (plain ASCII) → <b>1 byte</b>, identical to ASCII. Every ASCII file is already valid UTF-8!</li>
<li>Latin accents, Greek, Cyrillic → 2 bytes · CJK characters → 3 bytes · emoji → 4 bytes</li>
</ul>

<p>Type below and watch each character become bytes:</p>
<div data-w="enc"></div>

<div data-w="q2"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>For C programmers:</b> a <code>char</code> is one <em>byte</em>, not one <em>character</em>. <code>strlen("héllo")</code> returns 6, not 5, because é takes two bytes in UTF-8. Keep "bytes" and "characters" separate in your head forever.</p></div></div>

<div data-w="q3"></div>
`,
  widgets: {
    code1: {
      type: 'code', title: 'ascii.c',
      code: `#include <stdio.h>

int main(void) {
    char c = 'A';
    printf("'%c' is %d\\n", c, c);        /* chars ARE numbers  */
    printf("'%c' + 1 = '%c'\\n", c, c + 1);
    printf("'7' - '0' = %d\\n", '7' - '0');   /* digit trick     */
    printf("'Q' | 0x20 = '%c'\\n", 'Q' | 0x20); /* lowercase bit */
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc ascii.c -o ascii && ./ascii
'A' is 65
'A' + 1 = 'B'
'7' - '0' = 7
'Q' | 0x20 = 'q'` },
    q1: { type: 'quiz', q: "In C, what does <code>'5' - '0'</code> evaluate to?", opts: ['5', '53', "'5'", 'undefined'], a: 0, expl: "'5' is ASCII 53 and '0' is 48; 53 − 48 = 5. This subtraction trick converts any digit character to its numeric value.", id: 'ascii-digit' },
    enc: { type: 'enc', initial: 'Héllo 🙂' },
    q2: { type: 'quiz', q: 'How many bytes does the emoji 🙂 take in UTF-8?', opts: ['1', '2', '3', '4'], a: 3, expl: 'Emoji live at high code points (U+1F642), which need the 4-byte UTF-8 pattern 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx.' },
    q3: { type: 'quiz', q: 'Why is UTF-8 backwards-compatible with ASCII?', opts: ['It isn’t', 'Bytes 0–127 encode exactly the ASCII characters', 'It stores a translation table first', 'ASCII files get converted on load'], a: 1, expl: 'UTF-8 was designed (on a placemat, by Ken Thompson & Rob Pike — the same folks behind Unix and UTF-8’s sibling Plan 9) so single bytes 0–127 mean the same as ASCII.' },
  },
});

/* ---------------- how compilers work ---------------- */
CT.lesson({
  id: 'how-compilers-work',
  title: 'From source to silicon: the compiler pipeline',
  minutes: 13, xp: 120,
  tags: 'compiler preprocessor assembler linker gcc object file toolchain',
  why: `<p>Sooner or later a program of yours will refuse to build, and the error might come from any of four different tools — each speaking its own vocabulary. Once you know the four-step journey from the text you type to something your computer can actually run, every build error instantly tells you where to look. You'll lean on this map for every C program you ever write.</p>`,
  html: `
<p>You write <code>hello.c</code> — a plain text file. The CPU executes raw <strong>machine code</strong> — numeric instructions, no text in sight. What happens in between? When you run <code>gcc hello.c</code> (GCC is the standard C compiler on Linux), your code takes a four-stage journey:</p>

<div data-w="flow1"></div>

<h2>Stage by stage</h2>
<h3>1. Preprocessing (<code>cpp</code>)</h3>
<p>A pure <em>text transformation</em>: <code>#include</code> lines are replaced by the entire contents of header files, macros are expanded, <code>#if</code> blocks are kept or deleted. No C is understood yet — it's find-and-replace on steroids. See it yourself with <code>gcc -E hello.c</code> (brace yourself: stdio.h expands to ~800 lines).</p>

<h3>2. Compiling (<code>cc1</code>)</h3>
<p>The real brain: parses your C into a syntax tree, checks types, optimizes, and emits <strong>assembly</strong> — human-readable CPU instructions. Peek with <code>gcc -S hello.c</code>:</p>
<div data-w="code2"></div>

<h3>3. Assembling (<code>as</code>)</h3>
<p>Assembly is translated 1-to-1 into binary machine code, producing an <strong>object file</strong> (<code>hello.o</code>). It's real machine code, but with holes: the address of <code>printf</code> is still unknown — it lives in the C library.</p>

<h3>4. Linking (<code>ld</code>)</h3>
<p>The linker glues your object files together with libraries, fills in every unresolved address, and emits the final <strong>executable</strong>. When you see <code>undefined reference to 'foo'</code> — that's the linker telling you a promise (a declaration) was never fulfilled (a definition).</p>

<div data-w="term1"></div>

<div data-w="q1"></div>
<div data-w="q2"></div>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>Why should you care?</b> Error messages come from different stages: <code>#include</code> typos → preprocessor · syntax/type errors → compiler · <code>undefined reference</code> → linker. Knowing <em>who</em> is complaining tells you <em>where</em> to look.</p></div></div>

<div data-w="q3"></div>

<p>Much later, in the final part of this course, we'll dissect each stage in loving detail — flags, optimizations, and how to read the assembly output. For now, the mental model is what matters.</p>
`,
  widgets: {
    flow1: {
      type: 'flow', label: 'gcc hello.c — the journey', colw: 210, rowh: 92,
      nodes: [
        { id: 'src', col: 0, row: 0, kind: 'start', label: 'hello.c\n(your source)' },
        { id: 'pp', col: 0, row: 1, kind: 'proc', label: 'Preprocessor\n#include, macros' },
        { id: 'cc', col: 0, row: 2, kind: 'proc', label: 'Compiler\nC → assembly' },
        { id: 'as', col: 1, row: 2, kind: 'proc', label: 'Assembler\nasm → machine code' },
        { id: 'ld', col: 1, row: 3, kind: 'proc', label: 'Linker\n+ libraries' },
        { id: 'exe', col: 0, row: 3, kind: 'end', label: './hello\n(executable)' },
      ],
      edges: [
        { from: 'src', to: 'pp', label: 'hello.c' },
        { from: 'pp', to: 'cc', label: 'hello.i' },
        { from: 'cc', to: 'as', label: 'hello.s' },
        { from: 'as', to: 'ld', label: 'hello.o' },
        { from: 'ld', to: 'exe', label: '' },
      ],
      note: 'Each stage has its own intermediate file format. Try <code>gcc -save-temps hello.c</code> to keep them all and explore!',
    },
    code2: {
      type: 'code', title: 'hello.s (x86-64 excerpt)', run: false,
      code: `main:
        push    rbp
        mov     rbp, rsp
        lea     rdi, [rip+.LC0]    ; address of "Hello, World!"
        call    puts               ; the compiler even swapped
        mov     eax, 0             ;   printf for cheaper puts!
        pop     rbp
        ret`
    },
    term1: {
      type: 'term', text: `$ gcc -c hello.c          # stop after assembling: makes hello.o
$ gcc hello.o -o hello    # link it into an executable
$ ./hello
Hello, World!
# or do everything at once:
$ gcc hello.c -o hello`
    },
    q1: { type: 'quiz', q: 'Which stage replaces <code>#include &lt;stdio.h&gt;</code> with the header’s contents?', opts: ['Preprocessor', 'Compiler', 'Assembler', 'Linker'], a: 0, expl: 'The preprocessor is a text-substitution pass that runs before any real C parsing. That’s why it’s called PRE-processor.' },
    q2: { type: 'quiz', q: 'You get <code>undefined reference to \`sqrt\'</code>. Whose error is it, and what’s the likely fix?', opts: ['Compiler — add a cast', 'Preprocessor — include math.h', 'Linker — add <code>-lm</code> to link the math library', 'Assembler — upgrade gcc'], a: 2, expl: '“Undefined reference” is always the linker. Including math.h satisfies the compiler (declaration), but the definition lives in libm — link it with -lm.' },
    q3: { type: 'quiz', q: 'What does an object file (<code>.o</code>) contain?', opts: ['Preprocessed C source', 'Assembly text', 'Machine code with unresolved addresses', 'A complete runnable program'], a: 2, expl: 'It is genuine machine code, but calls into other files/libraries are placeholders (“relocations”) that the linker resolves later.' },
  },
});

/* ---------------- memory model ---------------- */
CT.lesson({
  id: 'memory-model',
  title: 'Where data lives: stack, heap & friends',
  minutes: 13, xp: 120,
  tags: 'memory stack heap bss data text segment address',
  why: `<p>The most famous programming site on the internet is named after a crash — <em>Stack Overflow</em> — and you're about to find out precisely what that crash is. Your program's memory is split into a few neighborhoods with different rules, and the classic C disasters (leaks, overflows, using memory that's already gone) are simply those rules being broken. Learn the map now, and those bugs will make sense before you ever hit one.</p>`,
  html: `
<p>To master C — a language famous for letting you touch memory directly — you first need a map of that memory. When your program runs, the OS hands it one big private stretch of memory — its <em>address space</em> — divided into <strong>segments</strong>, regions that each play by different rules:</p>

<div data-w="map"></div>

<h2>The stack: fast, automatic, small</h2>
<p>Every function call pushes a <em>stack frame</em> holding its local variables and where to return to. When the function returns, the frame is popped — <b>locals die automatically</b>. It's blazingly fast (just moving one pointer) but limited (typically ~8 MB).</p>
<div data-w="code1"></div>
<p>Each call to <code>square</code> gets a fresh <code>n</code>. Recursion works because each level has its own frame — and infinite recursion gives the segment its famous crash: <em>stack overflow</em>.</p>

<div data-w="q1"></div>

<h2>The heap: big, manual, yours to manage</h2>
<p>Need memory that <em>outlives</em> the function that made it, or whose size you only know at runtime? That's the heap: you ask with <code>malloc</code>, you give back with <code>free</code>. Nothing is automatic — forget to free and you <em>leak</em>; free twice and you <em>corrupt</em>. (Full lesson in Part 2.)</p>

<h2>Static storage: there the whole time</h2>
<p>Globals and <code>static</code> variables live in <code>.data</code> (if initialized) or <code>.bss</code> (zero-initialized — costs nothing in the executable file!). They exist from before <code>main</code> starts until the program exits.</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div data-w="q2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The #1 beginner crash:</b> returning a pointer to a local variable. The variable's stack frame is gone the moment the function returns — the pointer now points at a ghost. Compilers warn about this; never ignore that warning.</p></div></div>

<div data-w="code3"></div>

<div data-w="q3"></div>

<p>🎉 That's the foundations done! You now know how machines count, store, and execute. Time to actually <b>write some C</b>.</p>
`,
  widgets: {
    map: { type: 'memmap', label: 'Your program’s address space' },
    code1: {
      type: 'code', title: 'stack.c',
      code: `#include <stdio.h>

int square(int n) {      /* n lives in square's frame   */
    int result = n * n;  /* result too                  */
    return result;       /* frame destroyed on return   */
}

int main(void) {
    int x = 7;           /* x lives in main's frame     */
    printf("%d\\n", square(x));
    return 0;
}`
    },
    q1: { type: 'quiz', q: 'What happens to a function’s local variables when it returns?', opts: ['They are freed by the garbage collector', 'Their stack frame is popped — they cease to exist', 'They move to the heap', 'They keep their values for the next call'], a: 1, expl: 'The stack pointer simply moves back — the memory isn’t even wiped, it’s just up for grabs by the next call. C has no garbage collector.' },
    code2: {
      type: 'code', title: 'segments.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int counter = 42;            /* .data  — initialized global   */
int zeros[1000];             /* .bss   — auto zero-filled     */

int main(void) {
    int local = 1;           /* stack                         */
    int *dyn = malloc(4);    /* dyn on stack, target on heap  */
    static int calls = 0;    /* .data — survives across calls */

    printf("global: %p\\n", (void *)&counter);
    printf("stack : %p\\n", (void *)&local);
    printf("heap  : %p\\n", (void *)dyn);
    free(dyn);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc segments.c -o segments && ./segments
global: 0x55d1c9e0a010
stack : 0x7ffd4a1b2a94
heap  : 0x55d1cb2426b0
# stack addresses are way up high; globals & heap much lower` },
    q2: { type: 'quiz', q: 'Where does <code>static int hits = 0;</code> inside a function live?', opts: ['On the stack, like other locals', 'On the heap', 'In static storage (.data/.bss) — it survives between calls', 'In the CPU cache'], a: 2, expl: '<code>static</code> changes the storage, not the visibility: it’s still only nameable inside the function, but it lives in static storage for the whole program lifetime.' },
    code3: {
      type: 'code', title: 'dangling.c — DON’T do this', run: false,
      code: `int *broken(void) {
    int x = 42;
    return &x;        /* ⚠ warning: address of local returned */
}                     /* x dies here — the pointer dangles!  */`
    },
    q3: { type: 'quiz', q: 'Why is <code>return &x;</code> (x being a local) broken?', opts: ['You can’t take addresses of ints', 'x’s memory is reclaimed when the function returns', 'The compiler deletes unused variables', 'Pointers can’t leave functions'], a: 1, expl: 'The frame is popped; the address now points into dead stack space that the very next function call will overwrite. Reading it is undefined behavior.' },
  },
});
