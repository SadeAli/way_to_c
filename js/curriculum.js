/* ============================================================
   curriculum.js — the complete course manifest.
   Every lesson id listed here must be registered by a file in
   lessons/ via CT.lesson({ id, ... }). Unregistered ids render
   as "coming soon".
   ============================================================ */
window.CURRICULUM = {
  parts: [
    {
      id: 'p0', emoji: '🧮', title: 'Foundations — Before C',
      blurb: 'Bits, binary, hex, encodings, and how a computer actually thinks.',
      lessons: ['bits-binary', 'hexadecimal', 'negative-numbers', 'floating-point', 'text-encoding', 'how-compilers-work', 'memory-model'],
    },
    {
      id: 'p1', emoji: '🌱', title: 'C Basics',
      blurb: 'Your first programs: variables, operators, control flow, functions.',
      lessons: ['hello-world', 'variables-types', 'operators-arithmetic', 'operators-comparison', 'operators-bitwise', 'if-else', 'switch-case', 'loops-while', 'loops-for', 'break-continue-goto', 'functions', 'scope-lifetime'],
    },
    {
      id: 'p2', emoji: '🎯', title: 'Pointers & Memory',
      blurb: 'The heart of C: addresses, arrays, strings, and the heap.',
      lessons: ['pointers-intro', 'pointer-arithmetic', 'arrays', 'arrays-vs-pointers', 'strings', 'multidim-arrays', 'dynamic-memory', 'structs', 'unions-bitfields', 'function-pointers'],
    },
    {
      id: 'p3', emoji: '🧬', title: 'Types & Qualifiers, In Depth',
      blurb: 'Every remaining keyword: const, volatile, typedef, casts, and the dark art of UB.',
      lessons: ['const', 'volatile', 'typedef', 'enum', 'sizeof', 'storage-classes', 'inline', 'restrict', 'casting-conversions', 'undefined-behavior'],
    },
    {
      id: 'p4', emoji: '🎩', title: 'The Preprocessor',
      blurb: 'Everything that happens before compilation: #include, macros, and conditional builds.',
      lessons: ['include', 'define-macros', 'function-macros', 'conditional-compilation', 'pragma-error-line', 'header-organization'],
    },
    {
      id: 'p5', emoji: '🚀', title: 'Modern C (C11 → C23)',
      blurb: 'Static asserts, alignment, generics, atomics, threads, and shiny C23 features.',
      lessons: ['static-assert', 'alignment', 'generic-selection', 'atomics-threads', 'noreturn', 'complex-imaginary', 'c23-features'],
    },
    {
      id: 'p6', emoji: '📚', title: 'The Standard Library',
      blurb: 'A guided tour of every header worth knowing, from printf to setjmp.',
      lessons: ['stdio-lib', 'stdlib-lib', 'string-lib', 'math-time', 'ctype-assert-errno', 'limits-stdint', 'signal-setjmp', 'variadic-functions'],
    },
    {
      id: 'p7', emoji: '📈', title: 'Algorithms & Complexity',
      blurb: 'Big-O, Θ and Ω made visual, plus classic data structures in C.',
      lessons: ['big-o', 'searching', 'sorting', 'recursion', 'stacks-queues', 'hash-tables'],
    },
    {
      id: 'p8', emoji: '⚙️', title: 'Compiler & Toolchain Mastery',
      blurb: 'The pipeline, GCC flags, __attribute__, inline asm, Makefiles, and debugging.',
      lessons: ['compilation-pipeline', 'gcc-flags', 'gcc-extensions', 'inline-assembly', 'makefiles', 'debugging-tools', 'linking-libraries'],
    },
  ],

  order() {
    return this.parts.flatMap(p => p.lessons);
  },
  partOf(id) {
    return this.parts.find(p => p.lessons.includes(id));
  },
  prevNext(id) {
    const o = this.order();
    const i = o.indexOf(id);
    return { prev: i > 0 ? o[i - 1] : null, next: i >= 0 && i < o.length - 1 ? o[i + 1] : null };
  },
};
