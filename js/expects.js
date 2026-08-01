/* ============================================================
   expects.js — expected stdout for auto-checked exercises.
   exerciseId ("lessonId:widgetKey") -> exact expected output of
   the COMPLETED exercise. Every value was produced by compiling
   a reference solution on godbolt gcc — never guessed.
   A lesson widget's own `expect:` field overrides this registry.
   ============================================================ */
window.EXPECTS = {
  "break-continue-goto:ed1": "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 \n",  // Print all primes from 2 to 50 using a trial-division inner loop with b
  "if-else:ed1": "negative and odd\n",  // Print exactly one descriptive line for n=-7; the five candidate string
  "loops-for:ed1": "*\n**\n***\n****\n*****\n",  // Nested for loops print a 5-row left-aligned star triangle (row r has r
  "loops-while:ed1": "111 steps\n",  // Count Collatz steps for n=27; the fixed printf prints "<steps> steps".
  "operators-arithmetic:ed1": "2h 3m 4s\n",  // Decompose total=7384 seconds into hours/minutes/seconds with / and %, 
  "operators-comparison:ed1": "2024 is a leap year\n",  // Fill in the leap-year expression for year=2024; the fixed printf print
  "scope-lifetime:ed1": "hello, you are visitor 1\nhello, you are visitor 2\nhello, you are visitor 3\nhello, you are visitor 4\n",  // enter() prints "hello, you are visitor N" using a static counter start
  "switch-case:ed1": "28\n",  // One switch prints the day count for month=2 (February, ignore leap yea
  "arrays:ex1": "95\n",  // Loop over scores[8] tracking the max and print it (95).
  "arrays-vs-pointers:ex1": "14\n",  // Implement int sum(const int *a, size_t n); the commented call prints 1
  "dynamic-memory:ex1": "0 1 4 9 16 25 36 49 64 81 \n",  // malloc n=10 ints, NULL-check, fill a[i]=i*i, print the array, free and
  "function-pointers:ex1": "42 25 19 7 3 \n",  // Write comparator desc() so qsort sorts descending; fixed print loop sh
  "multidim-arrays:ex1": "18\n",  // Sum the main diagonal of the 3x3 matrix and print the trace (18).
  "pointer-arithmetic:ex1": "6 5 4 3 2 1 \n",  // Reverse {1..6} in place with lo/hi pointers; the fixed print loop show
  "pointers-intro:ex1": "21.500000\n25.000000\n",  // Point p at temp, print 21.5 through *p, set *p=25.0, print temp direct
  "strings:ex1": "0\n7\n",  // Implement my_strlen without <string.h>; commented tests print 0 then 7
  "structs:ex1": "12\n48\n",  // Define Rect, area(const Rect*), scale(Rect*,int); commented main print
  "unions-bitfields:ex1": "0x3f800000\n",  // Print the raw bits of 1.0f through the union: 0x3f800000.
  "inline:ed": "3 42\n",  // Write static inline imin and iabs; replace the placeholder printf args
  "storage-classes:ed": "10 9 8 7 6 \n",  // Write static int countdown(void) returning 10,9,8,... via a static loc
  "typedef:ed": "13\n42\n",  // typedef op_fn, add the op parameter to apply, call op(a,b), print appl
  "undefined-behavior:ed": "avg = 86\n",  // Fix uninitialized sum, off-by-one loop bounds, use-after-free and doub
  "define-macros:ed1": "area:      400\nperimeter: 80\n",  // Parenthesize #define SIDE so area prints 400 and perimeter 80.
  "function-macros:ed1": "7\n5\n12\n-5\n",  // Write MAX(a,b) with fully parenthesized parameters and body; four fixe
  "header-organization:ed1": "mean: 6.06\nmax:  9.25\ncalls: 2\n",  // Add maxv (prototype, implementation bumping mu_calls, uncommented call
  "include:ed1": "(3, 4)\n",  // Wrap both pasted copies of point.h in the same include guard so the re
  "pragma-error-line:ed1": "rec:   24 bytes\ntight: 11 bytes\n",  // Add a #error guard requiring C11+, add a #pragma pack(1) clone struct 
  "alignment:ed1": "sizeof(struct msg) = 16\ntag@12 value@0 flag@13 count@8\n",  // Reorder struct msg members (double, int, then the two chars) so sizeof
  "generic-selection:ed1": "int: 42\ndouble: 3.140000\nstring: hello\nfloat: 3.140000\n",  // Add float and unsigned int associations to print_any and uncomment the
  "ctype-assert-errno:ex1": "count  -> valid\n_tmp   -> valid\n2fast  -> invalid\na-b    -> invalid\nx9     -> valid\n       -> invalid\n",  // Implement is_identifier with ctype functions; the fixed test table pri
  "signal-setjmp:ex1": "handler ran 3 times\n",  // Install on_term for SIGTERM, raise it three times re-installing after 
  "stdio-lib:ex1": "|Coffee      |   2.50 EUR|\n|Sandwich    |   6.75 EUR|\n|Cake        |   4.20 EUR|\n",  // Print each row as |name left-aligned 12| price right-aligned 7 with 2 
  "stdlib-lib:ex1": "apple\nbanana\ncherry\npear\n",  // Implement cmp_str (strcmp through char** disguise) so qsort sorts the 
  "string-lib:ex1": "0\n2\n6\n",  // Implement my_strlen without library calls; fixed tests print 0, 2, 6.
  "variadic-functions:ex1": "9\n42\n-3\n",  // Implement variadic my_max(count, ...) starting best at the first varar
  "hash-tables:ex1": "list -> bucket 1\ntree -> bucket 5\nheap -> bucket 3\ntrie -> bucket 1\nmap  -> bucket 3\n",  // Implement djb2 (h=5381; h = h*33 + byte); fixed loop prints each key's
  "recursion:ex1": "2^10 = 1024\n3^5  = 243\n7^0  = 1\n",  // Implement recursive power(base, exp); fixed printfs show 1024, 243, 1.
  "searching:ex1": "5\n-1\n9\n",  // Implement binary_search with inclusive lo/hi and overflow-safe midpoin
  "sorting:ex1": "1 2 3 5 7 9 \n",  // Implement insertion_sort; fixed print loop shows 1 2 3 5 7 9.
  "stacks-queues:ex1": "1\n0\n0\n0\n",  // Implement balanced() with an array stack, handling empty-stack closers
  "gcc-extensions:ed1": "MAX(3, 7)        = 7\nMIN(3, 7)        = 3\nCLAMP(12, 0, 9) = 9\n",  // Write MIN(a,b) as a statement-expression macro and CLAMP(x,lo,hi) from
  "gcc-flags:ed1": "1..10 sums to 55\n",  // Remove the shadowing inner declaration so the loop updates the outer t
  "inline-assembly:ed1": "42\n",  // Change the inline asm from lea-add to sub with a "+r" read-write const
};
