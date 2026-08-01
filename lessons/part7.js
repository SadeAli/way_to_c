/* ============================================================
   Part 7 — Algorithms & Complexity
   ============================================================ */

/* ---------------- big-o ---------------- */
CT.lesson({
  id: 'big-o',
  title: 'Big-O: measuring work, not seconds',
  minutes: 14, xp: 120,
  tags: 'big o complexity theta omega growth n log analysis amortized',
  why: `<p>Your phone finds one contact among thousands the instant you type, yet a program written the "obvious" way can freeze for minutes on the same amount of data. The difference isn't the hardware — it's the algorithm.</p><p>This lesson hands you a thirty-second pencil test that predicts, <em>before you ever run the code</em>, whether it will feel instant or hang forever — plus the notation the whole industry uses to talk about it.</p>`,
  html: `
<p>Here is a question that sounds simple: <em>"how fast is this function?"</em> You could time it with a stopwatch — but on whose machine? Your laptop, a phone, a 1998 server? Same code, wildly different seconds. And next year's CPU changes the answer again. Seconds measure the <em>hardware</em>; we want to measure the <em>algorithm</em>.</p>

<p>So computer scientists count something machine-independent instead: <strong>how many operations the algorithm performs as a function of the input size n</strong> — an "operation" being one small step, like a comparison or an addition. Double the input — does the work double? Quadruple? Explode? How the work grows as the input grows is the algorithm's <em>growth rate</em> — its true speed — and Big-O notation is how we write it down.</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Same n = 1000, three loops: one did a thousand operations, one did a <em>million</em>, one did <b>nine</b>. That gap is what this whole part of the course is about.</p>

<h2>The growth classes</h2>
<p>Almost every algorithm you'll ever meet falls into one of a handful of growth families. Play with the graph — drag n larger, toggle curves, and turn on O(n³) and O(2ⁿ) to watch them obliterate everything else:</p>

<div data-w="bigoAll"></div>

<table>
<tr><th>class</th><th>everyday example</th><th>n = 1,000,000 costs…</th></tr>
<tr><td>O(1)</td><td>array index <code>a[i]</code>, push/pop a stack</td><td>1 op</td></tr>
<tr><td>O(log n)</td><td>binary search a sorted array</td><td>~20 ops</td></tr>
<tr><td>O(n)</td><td>linear scan, <code>strlen</code>, summing an array</td><td>1,000,000 ops</td></tr>
<tr><td>O(n log n)</td><td>good sorts: mergesort, quicksort (average)</td><td>~20,000,000 ops</td></tr>
<tr><td>O(n²)</td><td>nested loops: bubble sort, comparing all pairs</td><td>10¹² ops — minutes</td></tr>
<tr><td>O(2ⁿ)</td><td>trying every subset, naive fibonacci</td><td>heat death of the universe</td></tr>
</table>

<div data-w="q1"></div>

<h2>O, Θ, Ω — what the letters honestly mean</h2>
<p>People say "Big-O" for everything, but the notation family has three members with precise meanings:</p>
<ul>
<li><b>O(g)</b> — <em>upper bound</em>: the algorithm grows <b>no faster</b> than g. Think "≤".</li>
<li><b>Ω(g)</b> — <em>lower bound</em>: it grows <b>at least</b> as fast as g. Think "≥".</li>
<li><b>Θ(g)</b> — <em>tight bound</em>: both at once. Think "=". This is usually what people <em>mean</em>.</li>
</ul>

<div class="callout fun"><div class="co-ic">🤔</div><div class="co-body"><p><b>The pedant's loophole:</b> because O is only an upper bound, saying "bubble sort is O(n³)" is <em>technically true</em> — it certainly doesn't grow faster than n³! Also true: O(2ⁿ). Also useless. The honest, informative statement is that bubble sort's worst case is <b>Θ(n²)</b>: it grows exactly like n², no faster and no slower. In casual use "O(n²)" almost always means Θ(n²) — just know the difference exists, because interviewers love this trap.</p></div></div>

<div data-w="q2"></div>

<h2>Dropping constants and small fry</h2>
<p>Suppose your function does exactly <code>3n² + 5n + 2</code> operations. Big-O says: that's just <b>Θ(n²)</b>. Why are we allowed to throw away the 3, the 5n, and the 2? Because as n grows, the n² term eats everything:</p>

<table>
<tr><th>n</th><th>n²</th><th>3n² + 5n + 2</th><th>ratio</th></tr>
<tr><td>10</td><td>100</td><td>352</td><td>3.52</td></tr>
<tr><td>100</td><td>10,000</td><td>30,502</td><td>3.05</td></tr>
<tr><td>1,000</td><td>1,000,000</td><td>3,005,002</td><td>3.005</td></tr>
<tr><td>1,000,000</td><td>10¹²</td><td>3.000005 × 10¹²</td><td>3.000005</td></tr>
</table>

<p>The ratio converges to a plain constant (3). Constant factors depend on the compiler, the CPU, the phase of the moon — the <em>shape</em> of the curve doesn't. Big-O keeps the shape and discards the noise.</p>

<div data-w="bigoDrop"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>But constants aren't nothing!</b> For <em>small</em> n, a "slow" O(n²) algorithm with a tiny constant can beat a "fast" O(n log n) one with heavy machinery — that's exactly why real qsort implementations switch to insertion sort for small slices (you'll see this in the sorting lesson). Big-O tells you who wins <em>eventually</em>, not who wins at n = 20.</p></div></div>

<h2>Reading complexity off C code</h2>
<p>Analyzing a loop is mostly pattern-matching. The three patterns below cover 90% of real code:</p>

<div data-w="code2"></div>

<div data-w="rv1"></div>

<div data-w="q3"></div>

<h2>Amortized: expensive sometimes, cheap on average</h2>
<p>One more idea you'll meet constantly: a dynamic array (like the one behind every "vector" or "list" type) grows by <strong>doubling</strong> its capacity when full:</p>

<div data-w="code3"></div>

<p>Most pushes cost O(1). Occasionally one push triggers a realloc that copies all n elements — O(n)! But doubling means those copies happen so rarely (at n = 4, 8, 16, 32…) that the total cost of n pushes is still about 2n operations. We say push is <strong>O(1) amortized</strong>: any single call might be slow, but the average over a sequence is constant.</p>

<p>Armed with a vocabulary for "fast", let's use it on the most fundamental task in computing: finding a thing in a pile of things.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'count_ops.c',
      code: `#include <stdio.h>

int main(void) {
    int n = 1000;
    long ops = 0;

    for (int i = 0; i < n; i++)        /* one pass          */
        ops++;
    printf("O(n)     : %ld ops\\n", ops);

    ops = 0;
    for (int i = 0; i < n; i++)        /* a pass per element */
        for (int j = 0; j < n; j++)
            ops++;
    printf("O(n^2)   : %ld ops\\n", ops);

    ops = 0;
    for (int k = n; k > 1; k /= 2)     /* halve until done   */
        ops++;
    printf("O(log n) : %ld ops\\n", ops);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc count_ops.c -o count_ops && ./count_ops
O(n)     : 1000 ops
O(n^2)   : 1000000 ops
O(log n) : 9 ops` },
    bigoAll: {
      type: 'bigo',
      curves: ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n'],
      off: ['n3', '2n'],
      maxN: 50, sliderMax: 200,
      label: 'The complexity zoo — every curve you will ever need',
      note: 'Now switch on O(n³) and O(2ⁿ) and watch the y-axis rescale: every other curve flattens into the floor. Exponential growth is not "a bit worse" — it is a different universe. Hover for exact operation counts.',
    },
    q1: { type: 'quiz', q: 'An algorithm makes exactly 3 passes over its n-element input — 3n operations total. Its complexity is…', opts: ['O(3n)', 'O(n)', 'O(n³)', 'O(log n)'], a: 1, expl: 'O(3n) and O(n) are the same class — constant factors are dropped, so we write the canonical form O(n). (Writing O(3n) isn’t <em>wrong</em>, just redundant, like writing 6/8 instead of 3/4.)' },
    bigoDrop: {
      type: 'bigo', curves: ['n', 'nlogn', 'n2'], maxN: 40, sliderMax: 200,
      label: 'Constants don’t change the shape',
      note: 'There is no separate "3n² + 5n + 2" curve here on purpose: at any real zoom level it would hug the n² curve exactly (just scaled ×3). A 100× constant speedup on the n² algorithm only shifts where n log n overtakes it — grow n and the better curve ALWAYS wins in the end.',
    },
    q2: { type: 'quiz', q: 'Bubble sort’s worst case is Θ(n²). Which of these is ALSO technically true?', opts: ['It is Ω(n³)', 'It is O(n³) — and even O(2ⁿ)', 'It is Θ(n³)', 'None — only O(n²) is true'], a: 1, expl: 'O is only an upper bound, so any bigger function works: n² grows no faster than n³ or 2ⁿ. True — but as informative as saying "a coffee costs at most a million dollars". Θ(n²) is the tight, useful claim.' },
    code2: {
      type: 'code', title: 'patterns.c (fragments)', run: false,
      code: `/* Pattern 1 — O(n): touch each element once */
for (int i = 0; i < n; i++)
    sum += a[i];

/* Pattern 2 — O(n²): a full pass PER element */
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        if (i != j && a[i] == a[j])
            dupes++;

/* Pattern 3 — O(log n): the problem HALVES each step */
while (n > 1)
    n /= 2;

/* Sequential loops ADD (n + n = O(n));
   nested loops MULTIPLY (n * n = O(n²)). */`
    },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'What is the complexity of the "triangle" loop — <code>for (i = 0; i &lt; n; i++) for (j = 0; j &lt; i; j++) …</code> — where the inner loop only runs up to i?',
      answer: '<p>Still <b>Θ(n²)</b>. The inner loop runs 0 + 1 + 2 + … + (n−1) = n(n−1)/2 times total. That is ½n² − ½n, and after dropping the constant ½ and the lower-order n, the shape is n². Half a parabola is still a parabola.</p>',
    },
    q3: { type: 'quiz', q: 'Two loops in sequence: one runs n times, then another runs n times. Overall complexity?', opts: ['O(n²) — loops multiply', 'O(2n) which is its own class', 'O(n) — sequential work adds', 'O(n log n)'], a: 2, expl: 'Nested loops multiply; sequential loops add. n + n = 2n = O(n). Only when one loop runs <em>inside</em> the other do you get n × n.' },
    code3: {
      type: 'code', title: 'vec_push.c (fragment)', run: false,
      code: `typedef struct { int *data; int len, cap; } Vec;

void vec_push(Vec *v, int x) {
    if (v->len == v->cap) {                 /* full — grow!  */
        v->cap = v->cap ? v->cap * 2 : 4;   /* DOUBLE it     */
        v->data = realloc(v->data,
                          v->cap * sizeof *v->data);
        /* (real code must check for NULL here!) */
    }
    v->data[v->len++] = x;                  /* the usual case: O(1) */
}`
    },
  },
});

/* ---------------- searching ---------------- */
CT.lesson({
  id: 'searching',
  title: 'Searching: linear vs binary',
  minutes: 13, xp: 120,
  tags: 'linear search binary search sorted bsearch log midpoint overflow',
  why: `<p>Play "guess my number between 1 and a million" the smart way — always guess the middle — and you win in just twenty questions. That exact trick, written in C, is how your phone finds a contact instantly and how a database finds a row without reading the whole table.</p><p>You'll build it yourself — and meet the sneaky one-line bug in it that hid inside Java's official library for nine years.</p>`,
  html: `
<p>You have an array of n values and you want to know: is 23 in there, and where? This tiny problem is the perfect first arena for last lesson's Big-O ideas, because two correct solutions to it differ so dramatically that one takes <b>a million</b> steps where the other takes <b>twenty</b>.</p>

<h2>Linear search: the honest baseline</h2>
<p>No assumptions, no tricks: walk the array front to back and compare. It works on <em>any</em> array, sorted or not, and it's the best you can possibly do when the data is unordered — the target could hide anywhere, so you must be prepared to look everywhere.</p>

<div data-w="avLinear"></div>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Worst case (target absent or last): n comparisons — <b>Θ(n)</b>. Average for a present target: about n/2, which is still Θ(n) after dropping the ½.</p>

<div data-w="q1"></div>

<h2>Binary search: halve or die</h2>
<p>Now add one precondition — <strong>the array is sorted</strong> — and everything changes. Check the <em>middle</em> element. Too small? The target can only be in the right half. Too big? Left half. Either way, <b>one comparison destroys half the remaining candidates</b>. Watch the gray (eliminated) region grow:</p>

<div data-w="avBinary"></div>

<div data-w="code2"></div>
<div data-w="term2"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The famous overflow bug:</b> the "obvious" midpoint <code>mid = (lo + hi) / 2</code> is broken! If lo and hi are both around a billion, their <em>sum</em> overflows <code>int</code> — undefined behavior. This exact bug sat in Java's official library binary search for nine years, and in <em>Programming Pearls</em> for twenty. The fix is pure algebra: <code>mid = lo + (hi - lo) / 2</code> computes the same midpoint but the intermediate value never exceeds hi. Type it this way forever, even when "n is small" — habits outlive assumptions.</p></div></div>

<div data-w="q2"></div>

<h2>Watching the bounds — where the bugs live</h2>
<p>Binary search is famously easy to get <em>almost</em> right. Studies found most programmers' first attempts had off-by-one bugs: <code>&lt;</code> vs <code>&lt;=</code> in the loop condition, or forgetting the <code>+1</code>/<code>−1</code> when shrinking. Step through a correct one and watch <code>lo</code> and <code>hi</code> pincer the target:</p>

<div data-w="trace1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The invariant that keeps you sane:</b> with inclusive bounds, "if the target exists, it is in <code>a[lo..hi]</code>". That forces all three details: loop while <code>lo &lt;= hi</code> (a one-element range is still live), and move to <code>mid + 1</code> / <code>mid − 1</code> (mid itself was just ruled out). Change any one of them and you get infinite loops or missed elements.</p></div></div>

<h2>n vs log n — the payoff</h2>
<p>Halving means the number of comparisons is log₂ n. A million elements? log₂(1,000,000) ≈ 20. A <em>billion</em>? 30. Doubling the data adds <b>one</b> comparison:</p>

<div data-w="bigo1"></div>

<div data-w="q3"></div>

<h2>Don't write it — call it: <code>bsearch</code></h2>
<p>The C standard library ships a generic binary search in <code>&lt;stdlib.h&gt;</code>. Like <code>qsort</code>, it works on any element type via a comparison callback:</p>

<div data-w="code3"></div>
<div data-w="term3"></div>

<div data-w="ex1"></div>

<p>Binary search demands sorted data — so the obvious next question is: how does data <em>get</em> sorted, and what does that cost?</p>
`,
  widgets: {
    avLinear: { type: 'arrayviz', algo: 'linear-search', n: 16, speed: 300, label: 'Linear search — one bar at a time' },
    code1: {
      type: 'code', title: 'linear.c',
      code: `#include <stdio.h>

int linear_search(const int *a, int n, int target) {
    for (int i = 0; i < n; i++)
        if (a[i] == target)
            return i;         /* index of the first hit      */
    return -1;                /* checked all n — not here    */
}

int main(void) {
    int a[] = {14, 3, 92, 41, 7, 66, 25, 58};
    printf("7   is at index %d\\n", linear_search(a, 8, 7));
    printf("100 is at index %d\\n", linear_search(a, 8, 100));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc linear.c -o linear && ./linear
7   is at index 4
100 is at index -1` },
    q1: { type: 'quiz', q: 'When is linear search the RIGHT choice, not just the lazy one?', opts: ['Never — binary search is always better', 'When the array is unsorted (and searched once)', 'Only for arrays under 10 elements', 'When the target is definitely present'], a: 1, expl: 'Binary search requires sorted data. Sorting first costs O(n log n) — pointless if you only search once. For unsorted, search-once data, Θ(n) linear scan is optimal. (If you search the same data many times, sorting first pays for itself.)' },
    avBinary: { type: 'arrayviz', algo: 'binary-search', n: 16, speed: 500, label: 'Binary search — half the candidates die per comparison' },
    code2: {
      type: 'code', title: 'binary.c', hl: [6],
      code: `#include <stdio.h>

int binary_search(const int *a, int n, int target) {
    int lo = 0, hi = n - 1;         /* inclusive bounds       */
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   /* overflow-safe!     */
        if (a[mid] == target) return mid;
        if (a[mid] < target)  lo = mid + 1;  /* discard left  */
        else                  hi = mid - 1;  /* discard right */
    }
    return -1;
}

int main(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    printf("23 is at index %d\\n", binary_search(a, 10, 23));
    printf("7  is at index %d\\n", binary_search(a, 10, 7));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc binary.c -o binary && ./binary
23 is at index 5
7  is at index -1` },
    q2: { type: 'quiz', q: 'Why write <code>mid = lo + (hi - lo) / 2</code> instead of <code>(lo + hi) / 2</code>?', opts: ['It compiles to faster code', 'It rounds toward the target', 'The sum <code>lo + hi</code> can overflow <code>int</code> — this form can’t', 'Pure style — they are identical'], a: 2, expl: 'With lo and hi near INT_MAX, lo + hi overflows — signed overflow is undefined behavior. hi − lo always fits, so the safe form computes the identical midpoint without the landmine. This bug hid in Java’s standard library for nearly a decade.' },
    trace1: {
      type: 'trace', label: 'Step the bounds: searching for 31', title: 'trace_bsearch.c',
      code: `int a[7] = {3, 9, 14, 20, 27, 31, 42};
int lo = 0, hi = 6, target = 31, found = -1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == target) { found = mid; break; }
    if (a[mid] < target) lo = mid + 1;
    else                 hi = mid - 1;
}`,
      steps: [
        { line: 2, vars: { lo: 0, hi: 6, target: 31, found: -1 }, out: '', note: 'Invariant: if 31 is anywhere, it is in a[lo..hi] = a[0..6].' },
        { line: 3, vars: { lo: 0, hi: 6, target: 31, found: -1 }, out: '', note: '0 ≤ 6 — the range is alive, keep searching.' },
        { line: 4, vars: { lo: 0, hi: 6, mid: 3, target: 31, found: -1 }, out: '', note: 'mid = 0 + (6 − 0)/2 = 3.' },
        { line: 5, vars: { lo: 0, hi: 6, mid: 3, target: 31, found: -1 }, out: '', note: 'a[3] = 20. Not 31 — no early exit.' },
        { line: 6, vars: { lo: 4, hi: 6, mid: 3, target: 31, found: -1 }, out: '', note: '20 < 31, so 31 must be RIGHT of mid. lo = mid + 1 = 4. Indices 0..3 are dead.' },
        { line: 3, vars: { lo: 4, hi: 6, mid: 3, target: 31, found: -1 }, out: '', note: '4 ≤ 6 — still three candidates: a[4..6].' },
        { line: 4, vars: { lo: 4, hi: 6, mid: 5, target: 31, found: -1 }, out: '', note: 'mid = 4 + (6 − 4)/2 = 5.' },
        { line: 5, vars: { lo: 4, hi: 6, mid: 5, target: 31, found: 5 }, out: '', note: 'a[5] = 31 — found! Two comparisons for 7 elements: log₂ 7 ≈ 2.8. ✔' },
      ],
    },
    bigo1: {
      type: 'bigo', curves: ['logn', 'n'], maxN: 60, sliderMax: 500,
      label: 'Comparisons to search n elements',
      note: 'Drag n to 500: linear search needs up to 500 looks, binary search 9. The log curve is so flat it barely leaves the floor — that flatness is why databases index everything.',
    },
    q3: { type: 'quiz', q: 'Binary search over 1,000,000 sorted elements needs at most about how many comparisons?', opts: ['20', '1,000', '500,000', '10,000'], a: 0, expl: 'log₂(1,000,000) ≈ 19.9, so 20 halvings reduce a million candidates to one. Each doubling of n adds just ONE comparison — 2 million needs 21.' },
    code3: {
      type: 'code', title: 'use_bsearch.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int cmp_int(const void *pa, const void *pb) {
    int a = *(const int *)pa, b = *(const int *)pb;
    return (a > b) - (a < b);   /* -1, 0, +1 */
}

int main(void) {
    int a[] = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    int key = 23;

    int *hit = bsearch(&key, a, 10, sizeof a[0], cmp_int);
    if (hit) printf("found %d at index %td\\n", *hit, hit - a);
    else     printf("not found\\n");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc use_bsearch.c -o use_bsearch && ./use_bsearch
found 23 at index 5
# bsearch returns a POINTER to the element (or NULL);
# subtract the array base to recover the index.` },
    ex1: {
      type: 'editor', label: 'Exercise: write binary_search yourself', height: 320,
      code: `#include <stdio.h>

/* Return the index of target in the SORTED array a[0..n-1],
   or -1 if absent. Use the overflow-safe midpoint! */
int binary_search(const int *a, int n, int target) {
    (void)a; (void)n; (void)target;
    return -1;   /* your code here */
}

int main(void) {
    int a[] = {1, 4, 9, 16, 25, 36, 49, 64, 81, 100};
    printf("%d\\n", binary_search(a, 10, 36));   /* want 5  */
    printf("%d\\n", binary_search(a, 10, 2));    /* want -1 */
    printf("%d\\n", binary_search(a, 10, 100));  /* want 9  */
    return 0;
}`,
      hint: 'Inclusive lo/hi, loop while lo <= hi, mid = lo + (hi - lo) / 2, then move lo or hi past mid. Expected output: 5, -1, 9.',
    },
  },
});

/* ---------------- sorting ---------------- */
CT.lesson({
  id: 'sorting',
  title: 'Sorting: from bubble to quicksort',
  minutes: 16, xp: 140,
  tags: 'sort bubble insertion selection quicksort mergesort stable qsort partition',
  why: `<p>Behind every "sort by price" click on a shopping site and every game leaderboard, one of a handful of classic algorithms is doing the work — and picking the naive one is the difference between the page appearing instantly and a spinner of death.</p><p>In this lesson you'll watch five sorts race live on screen, learn why the fast ones win, and find out which one real libraries actually ship.</p>`,
  html: `
<p>Sorting is the most-studied problem in computer science — not because sorted data is pretty, but because it <em>unlocks</em> other speed: binary search, spotting duplicates, combining two sorted lists into one, finding the top 10 of anything. And it's the perfect showcase for Big-O, because the gap between the simple Θ(n²) sorts and the clever Θ(n log n) ones is the difference between "instant" and "go get coffee" on real data.</p>

<h2>The simple three: Θ(n²) but worth knowing</h2>

<h3>Bubble sort — swap neighbors until calm</h3>
<p>Sweep the array, swapping any adjacent pair that's out of order. Each sweep "bubbles" the largest remaining element to the end. Watch the green sorted zone grow from the right:</p>
<div data-w="avBubble"></div>
<div data-w="code1"></div>

<h3>Insertion sort — how you sort playing cards</h3>
<p>Keep the left part sorted; take the next element and slide it left into its place. Crucially, if the data is <em>already nearly sorted</em>, elements barely move — best case Θ(n). Remember that; it matters later.</p>
<div data-w="avInsertion"></div>

<h3>Selection sort — find the min, swap it home</h3>
<p>Scan for the smallest remaining element, swap it into the next position. Simple, and it makes the fewest <em>swaps</em> of any sort (n−1) — but always n(n−1)/2 comparisons, even on sorted input.</p>
<div data-w="avSelection"></div>

<div data-w="code2"></div>

<div data-w="q1"></div>

<h2>Quicksort: divide and conquer</h2>
<p>The Θ(n²) sorts all share a flaw: they compare elements that tell you almost nothing new. Quicksort's insight (Tony Hoare, 1959) is to make every comparison count. Pick a <strong>pivot</strong>; <strong>partition</strong> the array into smaller-than-pivot | pivot | larger-than-pivot. The pivot is now in its <em>final sorted position</em> — recurse on the two sides independently.</p>

<div data-w="avQuick"></div>

<div data-w="code3"></div>
<div data-w="term3"></div>

<p>Each partition pass is Θ(n) work, and a decent pivot splits the array roughly in half, so there are about log₂ n levels of recursion: <b>Θ(n log n) on average</b>. But a <em>terrible</em> pivot (always the smallest or largest element) splits n into 0 and n−1 — that's n levels, and quicksort degrades to Θ(n²).</p>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>The classic worst case:</b> with last-element pivots, an <em>already-sorted</em> array is the disaster input — every pivot is the maximum, every split is maximally lopsided. Real implementations dodge this with random or median-of-three pivots. Punchline for interviews: quicksort is Θ(n log n) average, <b>Θ(n²) worst case</b>.</p></div></div>

<div data-w="q2"></div>

<h2>Merge sort: guaranteed n log n</h2>
<p>Split in half, sort each half recursively, then <strong>merge</strong> the two sorted halves by repeatedly taking the smaller front element. Merging is Θ(n), the halving gives exactly log₂ n levels — <b>Θ(n log n) in every case</b>, no bad inputs. The price: it needs a scratch buffer (O(n) extra memory), unlike the in-place sorts above.</p>

<div data-w="code4"></div>
<div data-w="term4"></div>

<h2>n² vs n log n — feel the gap</h2>
<div data-w="bigo1"></div>

<h2>Stability, and the properties scoreboard</h2>
<p>A sort is <strong>stable</strong> if equal elements keep their original relative order. Sort people by first name, then stably by last name — people with the same last name stay sorted by first name. Non-stable sorts scramble ties, which silently breaks that kind of layered sorting.</p>

<table>
<tr><th>algorithm</th><th>best</th><th>average</th><th>worst</th><th>extra space</th><th>stable?</th></tr>
<tr><td>bubble</td><td>Θ(n)</td><td>Θ(n²)</td><td>Θ(n²)</td><td>O(1)</td><td>yes</td></tr>
<tr><td>insertion</td><td>Θ(n)</td><td>Θ(n²)</td><td>Θ(n²)</td><td>O(1)</td><td>yes</td></tr>
<tr><td>selection</td><td>Θ(n²)</td><td>Θ(n²)</td><td>Θ(n²)</td><td>O(1)</td><td>no</td></tr>
<tr><td>quicksort</td><td>Θ(n log n)</td><td>Θ(n log n)</td><td>Θ(n²)</td><td>O(log n) stack</td><td>no (typical)</td></tr>
<tr><td>merge sort</td><td>Θ(n log n)</td><td>Θ(n log n)</td><td>Θ(n log n)</td><td>O(n)</td><td>yes</td></tr>
</table>

<div class="callout tip"><div class="co-ic">💡</div><div class="co-body"><p><b>When the "slow" sort wins:</b> for tiny arrays (n ≲ 20) and nearly-sorted data, insertion sort's tiny constant factor and Θ(n) best case beat quicksort's recursive overhead. That's why production sorts (glibc's qsort, C++'s std::sort, Python's Timsort) are hybrids that hand small subarrays to insertion sort. Big-O picks the champion for large n — engineering picks it for your n.</p></div></div>

<div data-w="q3"></div>

<h2>In practice: <code>qsort</code></h2>
<p>You met <code>qsort</code> in the stdlib tour — it's how you actually sort in C: generic over element type, driven by your comparison function. (Despite the name, the standard doesn't require quicksort — glibc actually uses merge sort when memory allows!)</p>

<div data-w="code5"></div>
<div data-w="term5"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>Never write <code>return a - b;</code></b> in an int comparator: the subtraction can overflow (e.g. INT_MIN − 1), which is undefined behavior and gives garbage orderings. Use the safe idiom <code>(a &gt; b) - (a &lt; b)</code> — it can only produce −1, 0, or +1.</p></div></div>

<div data-w="ex1"></div>

<p>Quicksort and merge sort both leaned on a technique we sneaked past you — a function calling <em>itself</em>. Time to look recursion straight in the eye.</p>
`,
  widgets: {
    avBubble: { type: 'arrayviz', algo: 'bubble', n: 14, speed: 180, label: 'Bubble sort — big ones bubble right' },
    code1: {
      type: 'code', title: 'bubble.c',
      code: `#include <stdio.h>
#include <stdbool.h>

void bubble_sort(int *a, int n) {
    for (int pass = 0; pass < n - 1; pass++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - pass; j++) {
            if (a[j] > a[j + 1]) {          /* out of order?  */
                int t = a[j];               /* swap neighbors */
                a[j] = a[j + 1];
                a[j + 1] = t;
                swapped = true;
            }
        }
        if (!swapped) break;   /* full pass, no swaps: sorted */
    }
}

int main(void) {
    int a[] = {5, 1, 4, 2, 8};
    bubble_sort(a, 5);
    for (int i = 0; i < 5; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`
    },
    avInsertion: { type: 'arrayviz', algo: 'insertion', n: 14, speed: 180, label: 'Insertion sort — grow a sorted prefix' },
    avSelection: { type: 'arrayviz', algo: 'selection', n: 14, speed: 180, label: 'Selection sort — pick the minimum, place it' },
    code2: {
      type: 'code', title: 'insertion_selection.c (fragments)', run: false,
      code: `void insertion_sort(int *a, int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) {  /* shift bigger ones  */
            a[j + 1] = a[j];            /*   one slot right   */
            j--;
        }
        a[j + 1] = key;                 /* drop key in gap    */
    }
}

void selection_sort(int *a, int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++) /* find the smallest  */
            if (a[j] < a[min]) min = j; /*   of the rest      */
        int t = a[i]; a[i] = a[min]; a[min] = t;
    }
}`
    },
    q1: { type: 'quiz', q: 'You feed an ALREADY-SORTED array to each algorithm. Which finishes in Θ(n)?', opts: ['Selection sort', 'Insertion sort (and bubble with the early-exit flag)', 'Neither — all Θ(n²) sorts stay Θ(n²)', 'Only quicksort'], a: 1, expl: 'Insertion sort’s inner while-loop exits immediately when nothing needs shifting: n−1 comparisons total. Bubble with the swapped flag notices the clean pass and stops. Selection sort still scans everything: Θ(n²) always. And sorted input is quicksort’s WORST case with naive pivots!' },
    avQuick: { type: 'arrayviz', algo: 'quick', n: 16, speed: 240, label: 'Quicksort — pivots lock into place (green)' },
    code3: {
      type: 'code', title: 'quicksort.c', hl: [10, 11, 12],
      code: `#include <stdio.h>

static void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

/* Lomuto partition: returns the pivot's final index.
   Afterwards: a[lo..p-1] < pivot <= a[p+1..hi]        */
static int partition(int *a, int lo, int hi) {
    int pivot = a[hi];              /* last element as pivot */
    int i = lo;                     /* a[lo..i-1] = smalls   */
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot)
            swap(&a[i++], &a[j]);   /* grow the smalls zone  */
    swap(&a[i], &a[hi]);            /* pivot between zones   */
    return i;
}

void quicksort(int *a, int lo, int hi) {
    if (lo >= hi) return;           /* 0/1 elements: sorted  */
    int p = partition(a, lo, hi);
    quicksort(a, lo, p - 1);        /* smalls                */
    quicksort(a, p + 1, hi);        /* bigs (skip the pivot) */
}

int main(void) {
    int a[] = {33, 10, 55, 71, 29, 3, 64, 18};
    quicksort(a, 0, 7);
    for (int i = 0; i < 8; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`
    },
    term3: { type: 'term', text: `$ gcc quicksort.c -o quicksort && ./quicksort
3 10 18 29 33 55 64 71` },
    q2: { type: 'quiz', q: 'With a last-element pivot, which input drives quicksort to its Θ(n²) worst case?', opts: ['A random shuffle', 'All elements equal to 42… only', 'An already-sorted array', 'Reverse-sorted arrays only'], a: 2, expl: 'Sorted input makes every pivot the largest of its slice: the split is n−1 elements vs 0, recursion depth becomes n, and total work 1+2+…+n = Θ(n²). (Reverse-sorted and all-equal inputs are ALSO degenerate for plain Lomuto — but sorted is the famous, most ironic one: quicksort choking on already-done work.)' },
    code4: {
      type: 'code', title: 'mergesort.c',
      code: `#include <stdio.h>

/* sort a[lo..hi) — hi is EXCLUSIVE — using tmp as scratch */
void merge_sort(int *a, int *tmp, int lo, int hi) {
    if (hi - lo < 2) return;            /* 0/1 element: done */
    int mid = lo + (hi - lo) / 2;
    merge_sort(a, tmp, lo, mid);        /* sort left  half   */
    merge_sort(a, tmp, mid, hi);        /* sort right half   */

    int i = lo, j = mid, k = lo;        /* merge: take the   */
    while (i < mid && j < hi)           /* smaller front     */
        tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i < mid) tmp[k++] = a[i++];  /* leftovers         */
    while (j < hi)  tmp[k++] = a[j++];
    for (k = lo; k < hi; k++) a[k] = tmp[k];
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10};
    int tmp[7];
    merge_sort(a, tmp, 0, 7);
    for (int i = 0; i < 7; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc mergesort.c -o mergesort && ./mergesort
3 9 10 27 38 43 82
# note the <= on the merge comparison: taking from the LEFT
# half on ties is exactly what makes merge sort stable.` },
    bigo1: {
      type: 'bigo', curves: ['n', 'nlogn', 'n2'], maxN: 60, sliderMax: 300,
      label: 'Comparisons to sort n elements',
      note: 'At n = 300: n log n ≈ 2,500 vs n² = 90,000 — a 36× gap that keeps widening. This is why every serious library sort is n log n.',
    },
    q3: { type: 'quiz', q: 'You sort records by AGE with a STABLE sort, having already sorted them by NAME. Two people are both 25. Who comes first?', opts: ['Unpredictable — ties are arbitrary', 'The one whose name sorts first — stability preserves the earlier order', 'The one that appeared later in the input', 'Stable sorts forbid equal keys'], a: 1, expl: 'Stability means equal-key elements keep their previous relative order — so within each age group, the name ordering survives. This layered-sort trick only works with stable sorts (merge: yes; typical quicksort: no).' },
    code5: {
      type: 'code', title: 'use_qsort.c',
      code: `#include <stdio.h>
#include <stdlib.h>

int cmp_int(const void *pa, const void *pb) {
    int a = *(const int *)pa, b = *(const int *)pb;
    return (a > b) - (a < b);   /* NEVER a - b: overflow! */
}

int main(void) {
    int a[] = {42, 7, 19, 3, 88, 19, 5};
    int n = sizeof a / sizeof a[0];

    qsort(a, n, sizeof a[0], cmp_int);

    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc use_qsort.c -o use_qsort && ./use_qsort
3 5 7 19 19 42 88` },
    ex1: {
      type: 'editor', label: 'Exercise: implement insertion sort', height: 300,
      code: `#include <stdio.h>

void insertion_sort(int *a, int n) {
    /* TODO: for each i from 1 to n-1:
         save a[i] as key,
         shift every larger element one slot right,
         drop key into the gap. */
    (void)a; (void)n;
}

int main(void) {
    int a[] = {5, 2, 9, 1, 7, 3};
    insertion_sort(a, 6);
    for (int i = 0; i < 6; i++) printf("%d ", a[i]);
    printf("\\n");
    return 0;
}`,
      hint: 'Expected output: 1 2 3 5 7 9. Bonus: flip one comparison to sort descending, then count comparisons on already-sorted input — you should see the Θ(n) best case.',
    },
  },
});

/* ---------------- recursion ---------------- */
CT.lesson({
  id: 'recursion',
  title: 'Recursion: functions that call themselves',
  minutes: 14, xp: 130,
  tags: 'recursion base case call stack fibonacci memoization tail call hanoi factorial',
  why: `<p>You met the stack-overflow crash on Part 0's memory map — this lesson teaches you to cause one (on purpose, once) and then avoid it forever, because it's exactly what happens to a function that calls itself with no brake.</p><p>Handled right, a self-calling function solves in three elegant lines what loops turn into a nightmare — it's the engine inside the quicksort and merge sort you just watched, and today you'll see exactly how it works.</p>`,
  html: `
<p>A recursive function solves a problem by calling <em>itself</em> on a smaller version of the same problem. It sounds like cheating — "to sort the array, sort the array" — but you already watched it work: quicksort and merge sort are recursion. The trick is that each call shrinks the job, until it's so small the answer is obvious.</p>

<h2>The anatomy: base case + recursive case</h2>
<p>Every correct recursive function has exactly two ingredients:</p>
<ul>
<li><b>Base case:</b> an input so small you return the answer directly. This is the emergency brake.</li>
<li><b>Recursive case:</b> do a little work, then call yourself on a <em>strictly smaller</em> input that marches toward the base case.</li>
</ul>

<div data-w="code1"></div>
<div data-w="term1"></div>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>No base case, no mercy:</b> <code>long bad(int n) { return n + bad(n - 1); }</code> never stops shrinking past zero. Each call adds a stack frame; the stack is finite (typically ~8 MB, roughly 10⁵–10⁶ frames), so you get a <b>stack overflow</b> — on Linux, a segfault. Same fate if the base case exists but the input doesn't move toward it.</p></div></div>

<h2>Watch the call stack breathe</h2>
<p>Recursion works because of something you met in Part 0: every call gets its <em>own stack frame</em> with its own <code>n</code>. Four calls to <code>fact</code> means four separate <code>n</code>s alive at once. Step through and watch the stack grow, hit the base case, then unwind while multiplying:</p>

<div data-w="trace1"></div>

<div data-w="q1"></div>

<h2>Fibonacci: recursion's cautionary tale</h2>
<p>The Fibonacci definition — fib(n) = fib(n−1) + fib(n−2) — translates to gorgeous, tragic C:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Four seconds?! For one number?! Look at what the calls actually do:</p>

<div data-w="code3"></div>

<p>Every call spawns <em>two</em> more, and the same subproblems get recomputed again and again — fib(2) alone is computed 3 times in that tiny tree, and about a <em>billion</em> times in fib(45). The call count roughly doubles per level: exponential, about Θ(1.618ⁿ) (the golden ratio!), which the O(2ⁿ) curve bounds from above:</p>

<div data-w="bigo1"></div>

<div data-w="q2"></div>

<h3>The fix: remember what you computed</h3>
<p><strong>Memoization</strong> — cache each answer the first time, return the cached value ever after. One array turns an exponential algorithm into a linear one:</p>

<div data-w="code4"></div>
<div data-w="term4"></div>

<h2>Recursion vs iteration</h2>
<p>Anything recursive can be rewritten with a loop (plus, sometimes, an explicit stack — next lesson!), and vice versa. Rules of thumb:</p>
<ul>
<li><b>Naturally recursive shapes</b> — trees, divide &amp; conquer, nested structures — stay clearer as recursion.</li>
<li><b>Linear passes</b> (factorial, summing, fibonacci-with-memo) are usually better as plain loops: no stack-depth limit, less call overhead.</li>
<li>A <b>tail call</b> — where the recursive call is the very last action, its result returned unchanged — <em>can</em> be optimized by compilers into a loop (gcc/clang do it at <code>-O2</code>). But C the language doesn't guarantee it, so never bet your stack on it.</li>
</ul>

<div data-w="q3"></div>

<h2>The showpiece: Tower of Hanoi</h2>
<p>Move n disks from peg A to peg C, one at a time, never placing a bigger disk on a smaller one. Iteratively: a nightmare. Recursively: three lines of pure elegance — move n−1 disks out of the way, move the big one, move the n−1 back on top.</p>

<div data-w="code5"></div>
<div data-w="term5"></div>

<div data-w="rv1"></div>

<div data-w="ex1"></div>

<p>To trace recursion we kept talking about "the stack" — pushing frames, popping frames. That push/pop discipline is a data structure in its own right, and it's next.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'fact.c', hl: [4, 6],
      code: `#include <stdio.h>

long fact(int n) {
    if (n <= 1)                 /* BASE case: brake!     */
        return 1;
    return n * fact(n - 1);     /* RECURSIVE case:       */
}                               /*   shrink toward base  */

int main(void) {
    printf("4!  = %ld\\n", fact(4));
    printf("10! = %ld\\n", fact(10));
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc fact.c -o fact && ./fact
4!  = 24
10! = 3628800` },
    trace1: {
      type: 'trace', label: 'fact(4): the stack grows, then unwinds', title: 'trace_fact.c',
      code: `long fact(int n) {
    if (n <= 1)
        return 1;
    return n * fact(n - 1);
}

int main(void) {
    long r = fact(4);
}`,
      steps: [
        { line: 8, vars: { depth: 0, 'call stack': 'main', r: '?' }, out: '', note: 'main calls fact(4) — a frame is pushed.' },
        { line: 2, vars: { depth: 1, n: 4, 'call stack': 'main → fact(4)', r: '?' }, out: '', note: 'Is 4 ≤ 1? No — recursive case.' },
        { line: 4, vars: { depth: 1, n: 4, 'call stack': 'main → fact(4)', r: '?' }, out: '', note: 'Needs fact(3) before it can multiply. Push another frame.' },
        { line: 2, vars: { depth: 2, n: 3, 'call stack': 'main → fact(4) → fact(3)', r: '?' }, out: '', note: 'A brand-new n = 3, in a brand-new frame. fact(4)’s n = 4 still exists below.' },
        { line: 4, vars: { depth: 2, n: 3, 'call stack': 'main → fact(4) → fact(3)', r: '?' }, out: '', note: 'Needs fact(2)…' },
        { line: 4, vars: { depth: 3, n: 2, 'call stack': 'main → fact(4) → fact(3) → fact(2)', r: '?' }, out: '', note: '…which needs fact(1). Four frames deep now.' },
        { line: 2, vars: { depth: 4, n: 1, 'call stack': 'main → fact(4) → fact(3) → fact(2) → fact(1)', r: '?' }, out: '', note: '1 ≤ 1 — BASE CASE. The brake engages.' },
        { line: 3, vars: { depth: 4, n: 1, 'call stack': 'main → fact(4) → fact(3) → fact(2) → fact(1)', r: '?' }, out: '', note: 'return 1 — fact(1)’s frame pops. Unwinding begins.' },
        { line: 4, vars: { depth: 3, n: 2, returns: 2, 'call stack': 'main → fact(4) → fact(3) → fact(2)', r: '?' }, out: '', note: 'fact(2) resumes exactly where it paused: 2 × 1 = 2. Pop.' },
        { line: 4, vars: { depth: 2, n: 3, returns: 6, 'call stack': 'main → fact(4) → fact(3)', r: '?' }, out: '', note: 'fact(3): 3 × 2 = 6. Pop.' },
        { line: 4, vars: { depth: 1, n: 4, returns: 24, 'call stack': 'main → fact(4)', r: '?' }, out: '', note: 'fact(4): 4 × 6 = 24. Pop.' },
        { line: 8, vars: { depth: 0, 'call stack': 'main', r: 24 }, out: '', note: 'Back in main: r = 24. The multiplication happened on the way DOWN the unwind.' },
      ],
    },
    q1: { type: 'quiz', q: 'During fact(4), how many separate variables named <code>n</code> exist at the deepest moment?', opts: ['1 — it is overwritten each call', '4 — one per active stack frame', '2 — caller and callee', '0 — n lives in a register'], a: 1, expl: 'Each call pushes a fresh frame with its own n (4, 3, 2, 1 — all alive at once). That per-call privacy is the entire mechanism that makes recursion work.' },
    code2: {
      type: 'code', title: 'fib_naive.c',
      code: `#include <stdio.h>

long long fib(int n) {          /* naive: TWO calls per call */
    if (n < 2) return n;        /* fib(0)=0, fib(1)=1        */
    return fib(n - 1) + fib(n - 2);
}

int main(void) {
    printf("fib(45) = %lld\\n", fib(45));
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc -O2 fib_naive.c -o fib_naive && time ./fib_naive
fib(45) = 1134903170

real    0m4.31s
# ~4 seconds — and every +1 to n multiplies the time by ~1.6` },
    code3: {
      type: 'code', title: 'the call tree of fib(5)', run: false,
      code: `fib(5)
├── fib(4)
│   ├── fib(3)
│   │   ├── fib(2)   ← computed here…
│   │   └── fib(1)
│   └── fib(2)       ← …and again here…
└── fib(3)           ← this WHOLE subtree is a repeat!
    ├── fib(2)       ← …and again here
    └── fib(1)

15 calls for fib(5). fib(45) makes ~3.6 BILLION calls.`
    },
    bigo1: {
      type: 'bigo', curves: ['n', 'n2', '2n'], maxN: 25, sliderMax: 50,
      label: 'Naive fib call count — bounded by O(2ⁿ)',
      note: 'Slide n up slowly. O(2ⁿ) leaves even O(n²) looking flat — at n = 50 it is a quadrillion. Exponential algorithms do not need faster computers; they need different algorithms.',
    },
    q2: { type: 'quiz', q: 'Why is naive recursive fibonacci exponential?', opts: ['Function calls are inherently slow in C', 'The same subproblems are recomputed an exponential number of times', 'long long arithmetic is O(n)', 'The stack gets too deep'], a: 1, expl: 'Each call branches into two, and the branches endlessly repeat work already done elsewhere in the tree — fib(2) is recomputed ~a billion times inside fib(45). Depth is only n; the WIDTH of the tree is the killer.' },
    code4: {
      type: 'code', title: 'fib_memo.c', hl: [7, 8],
      code: `#include <stdio.h>

long long memo[93];   /* fib(92) is the last to fit long long */

long long fib(int n) {
    if (n < 2) return n;
    if (memo[n]) return memo[n];       /* cached? done: O(1) */
    return memo[n] = fib(n - 1) + fib(n - 2);
}

int main(void) {
    printf("fib(45) = %lld\\n", fib(45));
    printf("fib(90) = %lld\\n", fib(90));
    return 0;
}`
    },
    term4: { type: 'term', text: `$ gcc -O2 fib_memo.c -o fib_memo && time ./fib_memo
fib(45) = 1134903170
fib(90) = 2880067194370816120

real    0m0.002s
# each fib(k) computed once, then looked up: Θ(n). 2000x faster,
# and it reaches n=90 where the naive version needs ~centuries.` },
    q3: { type: 'quiz', q: 'What is the complexity of MEMOIZED fibonacci?', opts: ['Θ(n)', 'Θ(2ⁿ) still', 'Θ(n log n)', 'Θ(1)'], a: 0, expl: 'Each value fib(0..n) is computed exactly once (constant work each) and every repeat hits the O(1) cache check. n distinct computations → Θ(n). Trading O(n) memory for exponential time is the best deal in computing.' },
    code5: {
      type: 'code', title: 'hanoi.c',
      code: `#include <stdio.h>

void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;              /* base: nothing to move */
    hanoi(n - 1, from, via, to);     /* clear the n-1 above   */
    printf("move disk %d: %c -> %c\\n", n, from, to);
    hanoi(n - 1, via, to, from);     /* stack them back on    */
}

int main(void) {
    hanoi(3, 'A', 'C', 'B');
    return 0;
}`
    },
    term5: { type: 'term', text: `$ gcc hanoi.c -o hanoi && ./hanoi
move disk 1: A -> C
move disk 2: A -> B
move disk 1: C -> B
move disk 3: A -> C
move disk 1: B -> A
move disk 2: B -> C
move disk 1: A -> C` },
    rv1: {
      type: 'reveal', label: 'Think first',
      q: 'hanoi(3) printed 7 moves. How many moves for n disks — and is a faster algorithm possible?',
      answer: '<p>Moves(n) = 2 × Moves(n−1) + 1, which solves to <b>2ⁿ − 1</b>. And no algorithm can beat it — the biggest disk can only move when all n−1 others are parked on the spare peg, which provably requires this many steps. Here the problem itself is Θ(2ⁿ); the legend where monks move 64 disks would take 2⁶⁴−1 moves ≈ 585 billion years at one per second.</p>',
    },
    ex1: {
      type: 'editor', label: 'Exercise: recursive power()', height: 320,
      code: `#include <stdio.h>

/* Compute base^exp for exp >= 0, recursively.
   Base case:      exp == 0  ->  1
   Recursive case: base * power(base, exp - 1)
   Bonus (O(log exp)): if exp is even,
     power(b, e) = power(b, e/2) squared. */
long long power(int base, int exp) {
    (void)base; (void)exp;
    return 0;   /* your code here */
}

int main(void) {
    printf("2^10 = %lld\\n", power(2, 10));
    printf("3^5  = %lld\\n", power(3, 5));
    printf("7^0  = %lld\\n", power(7, 0));
    return 0;
}`,
      hint: 'Expected: 1024, 243, 1. The bonus halving version does ~log2(exp) multiplications instead of exp — the same halving magic as binary search.',
    },
  },
});

/* ---------------- stacks-queues ---------------- */
CT.lesson({
  id: 'stacks-queues',
  title: 'Stacks & queues: LIFO meets FIFO',
  minutes: 14, xp: 130,
  tags: 'stack queue push pop peek enqueue dequeue lifo fifo circular buffer ring',
  why: `<p>Ctrl+Z, your browser's back button, and the printer's job line all run on the same two tiny structures — about thirty lines of C each.</p><p>You'll build both from scratch, then use one to do what your code editor does every time you type a closing bracket: instantly check that every <code>(</code> and <code>[</code> has its matching partner.</p>`,
  html: `
<p>Arrays let you touch any element any time. Sometimes that freedom is exactly wrong — you <em>want</em> discipline. A <strong>stack</strong> only lets you touch the newest item (that's the "last in, first out" — LIFO — of the title); a <strong>queue</strong> only the oldest ("first in, first out" — FIFO). These two constraints turn out to run half of computing: your function calls, your undo history, your print jobs, the part of the operating system that decides which program runs next.</p>

<h2>The stack: Last In, First Out</h2>
<p>Picture a stack of plates. You can <code>push</code> a plate on top, <code>pop</code> the top one off, or <code>peek</code> at it. The one you get back is always the <em>most recently added</em> — LIFO. An array plus one integer is all it takes:</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Note the elegant symmetry: push is <code>data[top++]</code> (store, then step up), pop is <code>data[--top]</code> (step down, then read). <code>top</code> always equals the number of elements, and every operation is a single index tweak — <b>O(1)</b>.</p>

<div data-w="q1"></div>

<h2>Stacks are everywhere (you've been using one all along)</h2>
<ul>
<li><b>The call stack</b> — last function called is first to return. Recursion IS a stack; last lesson's trace was push/pop in disguise.</li>
<li><b>Undo</b> (Ctrl+Z) — the most recent change reverts first.</li>
<li><b>The back button</b> — most recent page first.</li>
<li><b>Matched brackets</b> — the classic interview problem, worked below.</li>
</ul>

<p>Why does a stack solve bracket matching? Because a closing bracket must match the <em>most recently opened, not-yet-closed</em> one — "most recent first" is literally the stack's job description. Step through checking <code>"([])"</code>:</p>

<div data-w="trace1"></div>

<div class="callout warn"><div class="co-ic">⚠️</div><div class="co-body"><p><b>Two easy-to-forget failure modes:</b> a closer arriving when the stack is <em>empty</em> (like <code>")("</code> — popping nothing is an underflow bug!), and leftovers at the end (like <code>"((("</code> — balanced means the stack finishes <em>empty</em>). The trace above skips the empty-check for brevity; your exercise version must not.</p></div></div>

<div data-w="q2"></div>

<h2>The queue: First In, First Out</h2>
<p>A queue is the line at the bakery: <code>enqueue</code> at the tail, <code>dequeue</code> from the head, and the first one in is the first one out — FIFO. Naive array version: dequeue from index 0 and shift everything left — O(n), yuck. The classy fix is the <strong>circular buffer</strong>: let head and tail chase each other around a fixed array, wrapping with modulo:</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Here's the buffer from that program at the moment right after <code>enqueue(90)</code> — the tail ran off the end of the array and <strong>wrapped around</strong> to slot 0:</p>

<div data-w="mem1"></div>

<div data-w="q3"></div>

<h2>Scoreboard & variants</h2>
<table>
<tr><th>operation</th><th>stack (array)</th><th>queue (circular)</th></tr>
<tr><td>insert (push / enqueue)</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>remove (pop / dequeue)</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>peek</td><td>O(1)</td><td>O(1)</td></tr>
<tr><td>search for a value</td><td>O(n) — and it's rude</td><td>O(n) — ditto</td></tr>
</table>

<p>Both can also be built on <strong>linked lists</strong> (push/pop at the list head; enqueue at a tail pointer): still O(1) per operation and never "full", at the cost of a heap allocation per element and worse cache behavior. Array-backed wins for a known size bound; linked wins for unbounded growth. Circular buffers in particular are the backbone of real systems — keyboard input, audio streaming, network packet rings.</p>

<div class="callout fun"><div class="co-ic">🎉</div><div class="co-body"><p><b>Party trick:</b> recursion and stacks are interchangeable. Any recursive algorithm can be rewritten iteratively with an explicit stack — that's literally what the compiler was doing for you with the call stack. Iterative quicksort? Push the (lo, hi) ranges onto your own stack instead of recursing.</p></div></div>

<div data-w="ex1"></div>

<p>Stacks and queues organize data by <em>when</em> it arrived — but to find things by <em>what they are</em>, in O(1), you need one more trick: hashing.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'stack.c', hl: [12, 13],
      code: `#include <stdio.h>
#include <stdbool.h>

#define CAP 16

typedef struct {
    int data[CAP];
    int top;              /* count; index of next free slot */
} Stack;

void st_init(Stack *s) { s->top = 0; }

bool st_push(Stack *s, int v) {
    if (s->top == CAP) return false;      /* full: overflow  */
    s->data[s->top++] = v;
    return true;
}

bool st_pop(Stack *s, int *out) {
    if (s->top == 0) return false;        /* empty: underflow */
    *out = s->data[--s->top];
    return true;
}

bool st_peek(const Stack *s, int *out) {
    if (s->top == 0) return false;
    *out = s->data[s->top - 1];           /* look, don't take */
    return true;
}

int main(void) {
    Stack s; st_init(&s);
    st_push(&s, 10); st_push(&s, 20); st_push(&s, 30);
    int v;
    while (st_pop(&s, &v)) printf("popped %d\\n", v);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc stack.c -o stack && ./stack
popped 30
popped 20
popped 10
# pushed 10,20,30 — got them back REVERSED. That's LIFO.` },
    q1: { type: 'quiz', q: 'You push 1, push 2, pop, push 3, pop, pop. In what order did the pops come out?', opts: ['1, 2, 3', '2, 3, 1', '3, 2, 1', '2, 1, 3'], a: 1, expl: 'Pop #1 takes the newest (2). Push 3, then pop #2 takes 3. Pop #3 finally reaches 1. Always the most recent survivor first.' },
    trace1: {
      type: 'trace', label: 'Bracket matching with a stack: is "([])" balanced?', title: 'trace_brackets.c',
      code: `const char *s = "([])";
char stk[8]; int top = 0;
for (int i = 0; s[i]; i++) {
    if (s[i] == '(' || s[i] == '[')
        stk[top++] = s[i];          /* push opener */
    else {                          /* a closer:   */
        char open = stk[--top];     /*   pop...    */
        if (!matches(open, s[i])) return 0;
    }
}
return top == 0;`,
      steps: [
        { line: 2, vars: { top: 0, stack: '(empty)' }, out: '', note: 'Empty stack — nothing is open yet.' },
        { line: 4, vars: { i: 0, 's[i]': "'('", top: 0, stack: '(empty)' }, out: '', note: "'(' is an opener." },
        { line: 5, vars: { i: 0, 's[i]': "'('", top: 1, stack: '(' }, out: '', note: 'Push it. One bracket now awaits closing.' },
        { line: 4, vars: { i: 1, 's[i]': "'['", top: 1, stack: '(' }, out: '', note: "'[' — another opener." },
        { line: 5, vars: { i: 1, 's[i]': "'['", top: 2, stack: '( [', }, out: '', note: "Push. '[' is on top: it must close FIRST. That's the whole insight." },
        { line: 7, vars: { i: 2, 's[i]': "']'", top: 1, stack: '(' }, out: '', note: "']' is a closer — pop the top opener: '['." },
        { line: 8, vars: { i: 2, 's[i]': "']'", top: 1, stack: '(', open: "'['" }, out: '', note: "'[' pairs with ']' — match! Continue." },
        { line: 7, vars: { i: 3, 's[i]': "')'", top: 0, stack: '(empty)', open: "'('" }, out: '', note: "')' pops '(' — match again." },
        { line: 11, vars: { i: 4, top: 0, stack: '(empty)' }, out: '', note: 'String done, stack empty: every opener found its closer. Balanced ✔' },
      ],
    },
    q2: { type: 'quiz', q: 'Using the stack method, why is <code>"([)]"</code> UNbalanced?', opts: ['It has an odd number of brackets', "When ')' arrives, the top of the stack is '[', not '('", 'The stack overflows', "It ends with ']'"], a: 1, expl: "After pushing '(' then '[', the ')' arrives — but the most recently opened bracket is '[', and a closer must match the TOP of the stack. Mismatched pop → reject. (Bracket count is even; that alone proves nothing.)" },
    code2: {
      type: 'code', title: 'queue.c', hl: [17, 25],
      code: `#include <stdio.h>
#include <stdbool.h>

#define CAP 8

typedef struct {
    int data[CAP];
    int head;    /* index of the oldest element        */
    int tail;    /* index where the next enqueue lands */
    int count;
} Queue;

void q_init(Queue *q) { q->head = q->tail = q->count = 0; }

bool enqueue(Queue *q, int v) {
    if (q->count == CAP) return false;    /* full          */
    q->data[q->tail] = v;
    q->tail = (q->tail + 1) % CAP;        /* wrap around!  */
    q->count++;
    return true;
}

bool dequeue(Queue *q, int *out) {
    if (q->count == 0) return false;      /* empty         */
    *out = q->data[q->head];
    q->head = (q->head + 1) % CAP;        /* wrap around!  */
    q->count--;
    return true;
}

int main(void) {
    Queue q; q_init(&q);
    for (int i = 1; i <= 5; i++) enqueue(&q, i * 10);
    int v;
    dequeue(&q, &v); printf("first out: %d\\n", v);
    dequeue(&q, &v); printf("then     : %d\\n", v);
    enqueue(&q, 60); enqueue(&q, 70); enqueue(&q, 80);
    enqueue(&q, 90);      /* tail wraps: 7 -> 0 ! */
    while (dequeue(&q, &v)) printf("%d ", v);
    printf("\\n");
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc queue.c -o queue && ./queue
first out: 10
then     : 20
30 40 50 60 70 80 90
# in: 10..90, out: 10..90 — same order. That's FIFO.` },
    mem1: {
      type: 'memgrid', label: 'The circular buffer just after enqueue(90) — head=2, tail=1, count=7',
      cells: [
        { addr: '[0]', val: '90', name: 'wrapped!', hl2: true },
        { addr: '[1]', val: '—', name: 'tail →' },
        { addr: '[2]', val: '30', name: 'head →', hl: true },
        { addr: '[3]', val: '40' },
        { addr: '[4]', val: '50' },
        { addr: '[5]', val: '60' },
        { addr: '[6]', val: '70' },
        { addr: '[7]', val: '80' },
      ],
      note: 'The queue holds 30,40,50,60,70,80,90 — but in memory it starts at index 2 and wraps through the end back to 0! <b>head</b> (blue) marks the oldest element; <b>tail</b> marks the next free slot. The <code>% CAP</code> turns a straight array into a circle: no element ever needs to shift.',
    },
    q3: { type: 'quiz', q: 'Why bother with the circular buffer instead of dequeuing from index 0 and shifting everything left?', opts: ['Shifting would reverse the order', 'It saves memory', 'Shifting makes dequeue O(n); the ring keeps every operation O(1)', 'Plain arrays can’t be dequeued'], a: 2, expl: 'Shifting n−1 elements on every dequeue is Θ(n) each time. Moving the head index instead is one increment and one modulo — O(1), no matter how big the queue. Same data, smarter bookkeeping.' },
    ex1: {
      type: 'editor', label: 'Exercise: balanced-brackets checker', height: 340,
      code: `#include <stdio.h>

/* Return 1 if every ( [ { is properly closed in order,
   else 0. Handle the two sneaky cases:
     - a closer when the stack is EMPTY  ->  0
     - leftovers when the string ends    ->  0     */
int balanced(const char *s) {
    char stk[64];
    int top = 0;
    (void)stk; (void)top; (void)s;
    return 0;   /* your code here */
}

int main(void) {
    printf("%d\\n", balanced("({[]})"));   /* want 1 */
    printf("%d\\n", balanced("([)]"));     /* want 0 */
    printf("%d\\n", balanced("((("));      /* want 0 */
    printf("%d\\n", balanced(")"));        /* want 0 */
    return 0;
}`,
      hint: 'Push openers. On a closer: if top == 0 return 0; pop and check the pair matches ( ) [ ] { }. At the end, return top == 0. Expected output: 1 0 0 0.',
    },
  },
});

/* ---------------- hash-tables ---------------- */
CT.lesson({
  id: 'hash-tables',
  title: 'Hash tables: the O(1) dictionary',
  minutes: 15, xp: 140,
  tags: 'hash table map djb2 bucket collision chaining load factor dictionary key value',
  why: `<p>When you log in, a website picks your account out of a billion others in a blink — no scanning down a list, no guessing games. That trick is the hash table, the same structure behind Python's dictionaries and JavaScript's objects, and you're about to build one from scratch in C.</p><p>You'll also see its one weak spot — and how attackers once used it to knock real web servers offline.</p>`,
  html: `
<p>Every structure so far finds things by <em>position</em> (index 3) or by <em>searching</em> (O(n) scan, O(log n) binary search). But the lookup you actually want most is by <strong>name</strong> — a <em>key</em>: "what's the value stored under <code>"dog"</code>?" — and you want it in <b>O(1)</b>, no matter if there are ten keys or ten million. That structure is the hash table, and it powers Python dicts, JavaScript objects, the indexes that make databases fast, and the way your terminal finds each command you type.</p>

<h2>The big idea: compute where things live</h2>
<p>An array gives O(1) access <em>if you know the index</em>. So… what if we could <em>calculate</em> an index from the key itself? That calculator is a <strong>hash function</strong>: it chews the bytes of the key and spits out a number. Same key in, same number out, every time. A beloved classic is <strong>djb2</strong> (Daniel J. Bernstein, 1991):</p>

<div data-w="code1"></div>
<div data-w="term1"></div>

<p>Why <code>h * 33 + c</code>? Honestly: nobody fully knows — it's empirical magic that mixes bits cheaply and spreads real-world strings well. (33 = 32 + 1, so compilers do it as a shift and an add.) The unsigned overflow that happens on long strings is fine — unsigned wraparound is well-defined in C, and hashing <em>wants</em> the scrambling.</p>

<h2>Buckets: hash, then modulo</h2>
<p>A hash is a huge number; the table has, say, 8 slots. <code>hash % 8</code> maps every key to a <strong>bucket</strong>. Here are those seven animals landing in an 8-bucket table:</p>

<div data-w="mem1"></div>

<div data-w="q1"></div>

<h2>Collisions are not a bug — they're a certainty</h2>
<p>Notice <code>dog</code> and <code>owl</code> both landed in bucket 7. Inevitable: there are infinitely many possible strings and only 8 buckets — by the <strong>pigeonhole principle</strong>, some keys <em>must</em> share. A hash table isn't defined by avoiding collisions but by <em>surviving</em> them. The classic survival strategy is <strong>chaining</strong>: each bucket holds a linked list of everything that landed there.</p>

<div data-w="code2"></div>
<div data-w="term2"></div>

<p>Read <code>map_put</code> carefully: it first walks the chain to <em>update</em> an existing key (a real map has no duplicate keys), and only then pushes a new entry onto the front of the bucket's list — O(1). Lookup hashes to the right bucket, then walks a chain that is, on average, <em>tiny</em>.</p>

<div data-w="q2"></div>

<h2>Load factor: how full is too full?</h2>
<p>The <strong>load factor</strong> is entries ÷ buckets. With a good hash and load factor around 1, the average chain has ~1 link — lookups are O(1) <em>on average</em>. Let the table overfill (load factor 10, 100…) and chains stretch — performance slides toward O(n). Real implementations watch the load factor and <strong>resize</strong>: allocate ~double the buckets and re-insert every key (positions change because <code>% nbuckets</code> changed!). One expensive O(n) rehash, amortized over all the O(1) inserts that preceded it — the same doubling trick as the dynamic array from the Big-O lesson.</p>

<div class="callout danger"><div class="co-ic">💀</div><div class="co-body"><p><b>The worst case is real:</b> if every key lands in one bucket, the "hash table" is a linked list — lookup Θ(n). It happens with awful hash functions, and it happens <em>on purpose</em>: attackers have DoS'd web servers by sending thousands of keys crafted to collide (the 2011 "HashDoS" attack). That's why modern languages seed their hash functions randomly per process.</p></div></div>

<div data-w="bigo1"></div>

<div data-w="q3"></div>

<h2>Why doesn't C just have one built in?</h2>
<p>Because C has no generics, no standard allocator policy hooks, and a fierce "you don't pay for what you don't use" culture — a one-size-fits-all hash table would fit nobody well. (POSIX does offer the crusty <code>hsearch</code>; almost nobody uses it.) In practice C programmers either write a small one per project, tuned to its keys — like we just did — or grab a library: <b>uthash</b> (a delightfully evil header of macros that hangs a hash handle inside <em>your</em> struct), or GLib's <code>GHashTable</code>. Either way, now you know exactly what's under the hood.</p>

<div data-w="ex1"></div>

<p>And that's the algorithms toolkit! You can now reason about cost, search, sort, and structure data — next we descend into the machinery that builds it all: the compiler and its toolchain.</p>
`,
  widgets: {
    code1: {
      type: 'code', title: 'djb2.c',
      code: `#include <stdio.h>

unsigned long djb2(const char *s) {
    unsigned long h = 5381;            /* magic seed        */
    while (*s)
        h = h * 33 + (unsigned char)*s++;   /* mix each byte */
    return h;
}

int main(void) {
    const char *w[] = {"ant","bee","cat","cow","dog","emu","owl"};
    for (int i = 0; i < 7; i++)
        printf("%-3s -> %10lu %% 8 = bucket %lu\\n",
               w[i], djb2(w[i]), djb2(w[i]) % 8);
    return 0;
}`
    },
    term1: { type: 'term', text: `$ gcc djb2.c -o djb2 && ./djb2
ant ->  193486376 % 8 = bucket 0
bee ->  193487153 % 8 = bucket 1
cat ->  193488125 % 8 = bucket 5
cow ->  193488590 % 8 = bucket 6
dog ->  193489663 % 8 = bucket 7
emu ->  193490700 % 8 = bucket 4
owl ->  193501911 % 8 = bucket 7   # <- same as dog. collision!` },
    mem1: {
      type: 'memgrid', label: 'An 8-bucket table: hash(key) % 8 picks the slot',
      cells: [
        { addr: 'b[0]', val: 'ant', hl: true },
        { addr: 'b[1]', val: 'bee', hl: true },
        { addr: 'b[2]', val: '—', freed: true },
        { addr: 'b[3]', val: '—', freed: true },
        { addr: 'b[4]', val: 'emu', hl: true },
        { addr: 'b[5]', val: 'cat', hl: true },
        { addr: 'b[6]', val: 'cow', hl: true },
        { addr: 'b[7]', val: 'dog→owl', name: 'collision!', hl2: true },
      ],
      note: 'Each key hashes straight to its bucket — no searching. But <code>dog</code> and <code>owl</code> both hash to 7 (orange): they must SHARE the bucket, chained together in a linked list. Buckets 2 and 3 sit empty — hash tables trade a little wasted space for a lot of speed.',
    },
    q1: { type: 'quiz', q: 'Why must a hash function be deterministic (same key → same hash, always)?', opts: ['To make hashes uniformly distributed', 'C functions cannot use randomness', 'Otherwise you could store a key in one bucket and later look for it in another', 'To prevent integer overflow'], a: 2, expl: 'Insert computes a bucket from the key; lookup recomputes it and goes to that bucket. If the two computations could disagree, stored keys would be unfindable. (Per-process random SEEDS are fine — the function stays deterministic within one run.)' },
    code2: {
      type: 'code', title: 'map.c — a complete chained hash map', hl: [24, 25, 26],
      code: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NBUCKETS 8

typedef struct Entry {
    char *key;
    int value;
    struct Entry *next;       /* the chain */
} Entry;

typedef struct { Entry *bucket[NBUCKETS]; } Map;

static unsigned long djb2(const char *s) {
    unsigned long h = 5381;
    while (*s) h = h * 33 + (unsigned char)*s++;
    return h;
}

void map_put(Map *m, const char *key, int value) {
    unsigned long b = djb2(key) % NBUCKETS;
    for (Entry *e = m->bucket[b]; e; e = e->next)
        if (strcmp(e->key, key) == 0) { e->value = value; return; }
    Entry *e = malloc(sizeof *e);           /* new entry:     */
    e->key = malloc(strlen(key) + 1);       /* own copy of    */
    strcpy(e->key, key);                    /*   the key      */
    e->value = value;
    e->next = m->bucket[b];                 /* push onto the  */
    m->bucket[b] = e;                       /*   chain: O(1)  */
}

int *map_get(Map *m, const char *key) {
    for (Entry *e = m->bucket[djb2(key) % NBUCKETS]; e; e = e->next)
        if (strcmp(e->key, key) == 0) return &e->value;
    return NULL;                            /* absent         */
}

void map_free(Map *m) {
    for (int b = 0; b < NBUCKETS; b++)
        for (Entry *e = m->bucket[b]; e; ) {
            Entry *next = e->next;
            free(e->key); free(e);
            e = next;
        }
}

int main(void) {
    Map m = {0};                 /* all buckets start NULL */
    map_put(&m, "dog", 4);
    map_put(&m, "owl", 2);       /* bucket 7 too — chained! */
    map_put(&m, "cat", 9);
    map_put(&m, "dog", 5);       /* update, not duplicate  */

    int *v = map_get(&m, "dog");
    printf("dog -> %d\\n", v ? *v : -1);
    printf("owl -> %d\\n", *map_get(&m, "owl"));
    printf("fox -> %s\\n", map_get(&m, "fox") ? "found" : "not found");

    map_free(&m);
    return 0;
}`
    },
    term2: { type: 'term', text: `$ gcc map.c -o map && ./map
dog -> 5
owl -> 2
fox -> not found
# "dog" was inserted then UPDATED in place — still one entry.
# valgrind reports 0 leaks: every malloc has its free.` },
    q2: { type: 'quiz', q: 'In the chained map, why does <code>map_put</code> walk the bucket’s chain BEFORE inserting?', opts: ['To find the end of the list — new entries go at the back', 'To check whether the key already exists and update it instead of duplicating', 'To count the load factor', 'To sort the chain for faster lookup'], a: 1, expl: 'A map means one value per key. Skipping the check would create duplicate entries, and lookups would forever return the newer one while the stale twin leaks memory. New entries go at the FRONT precisely so insertion stays O(1).' },
    bigo1: {
      type: 'bigo', curves: ['1', 'logn', 'n'], maxN: 60, sliderMax: 400,
      label: 'Lookup cost: hash table vs sorted array vs linear scan',
      note: 'O(1) hash lookup (average) is the flat line at the bottom; O(log n) binary search is barely worse; O(n) is the price of no structure at all. But remember: an adversarial or overloaded hash table decays to that O(n) line.',
    },
    q3: { type: 'quiz', q: 'A hash table’s lookup is best described as…', opts: ['Θ(1) guaranteed, always', 'O(log n) like all tree structures', 'O(1) on average with a good hash & load factor — but Θ(n) worst case', 'O(n) on average'], a: 2, expl: 'Expected O(1) relies on keys spreading evenly and chains staying short. All keys in one bucket (terrible hash, or a crafted attack) means walking one long chain: Θ(n). Know both halves of that sentence — interviewers check.' },
    ex1: {
      type: 'editor', label: 'Exercise: implement djb2 and watch keys land', height: 300,
      code: `#include <stdio.h>

/* TODO: implement djb2:
     start h = 5381
     for each byte c:  h = h * 33 + c
     return h                            */
unsigned long djb2(const char *s) {
    (void)s;
    return 0;   /* your code here */
}

int main(void) {
    const char *keys[] = {"list", "tree", "heap", "trie", "map"};
    for (int i = 0; i < 5; i++)
        printf("%-4s -> bucket %lu\\n", keys[i], djb2(keys[i]) % 8);
    return 0;
}`,
      hint: 'unsigned long h = 5381; while (*s) h = h * 33 + (unsigned char)*s++; — then experiment: switch % 8 to % 16 and watch every key move. Do any of the five keys collide?',
    },
  },
});
