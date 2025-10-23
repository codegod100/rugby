# ps-asc-demo

Common Lisp starter project that emits JavaScript with Parenscript and then attempts to compile the derived AssemblyScript view with the AssemblyScript compiler.

## Prerequisites

- [SBCL](https://www.sbcl.org/) or another Common Lisp implementation that supports ASDF.
- [Quicklisp](https://www.quicklisp.org/) with the `parenscript` library installed (`(ql:quickload :parenscript)`).
- Node.js 18+ with `npm` (required for AssemblyScript).
- Porf CLI available on the system `PATH` (optional, used for the JS→Wasm comparison).

## Installation

1. Install project dependencies:
   ```fish
   npm install
   ```
2. Ensure Parenscript is available to your Lisp runtime:
   ```lisp
   (ql:quickload :parenscript)
   ```

## Generate sources

Run the generator to translate the Parenscript program into JavaScript and a typed AssemblyScript view:

```fish
npm run generate
```

Artifacts are written to `build/`:

- `generated.js` – JavaScript emitted directly from Parenscript.
- `generated.ts` – AssemblyScript-friendly TypeScript reconstructed from the same Parenscript AST.

## Compile with AssemblyScript

Compile the generated AssemblyScript to WebAssembly:

```fish
npm run build:wasm
```

Outputs:

- `build/generated.wasm` – Release WebAssembly module.
- `build/generated.wat` – Text representation for inspection.
- `build/generated.porf.wasm` – Porf-transpiled WebAssembly module derived directly from the generated JavaScript.
- For debug builds use `npm run build:debug` (writes `.debug.wasm/.debug.wat`).

## Benchmark against JavaScript

1. Ensure artifacts are current:
   ```fish
   npm run build
   ```
2. Run the benchmark harness to compare the recursive Fibonacci sum in JavaScript, AssemblyScript, and Porf-generated WebAssembly:
   ```fish
   npm run bench
   ```

The script executes `fibSum(30)` multiple times in all three implementations and prints the average wall-clock time per variant.

> **Note:** The Porf-generated module currently overflows the stack on this recursive workload. The benchmark reports the failure instead of aborting, so you can still review the other results.

## Project layout

- `ps-asc-demo.asd` – ASDF system definition.
- `src/` – Common Lisp source for Parenscript/AssemblyScript generation.
- `src/fib.js` – Naive recursive Fibonacci + accumulator used for JavaScript benchmarking.
- `bin/generate.lisp` – Entrypoint used by the `generate` npm script.
- `asconfig.json` – AssemblyScript compiler configuration.
- `benchmarks/fib-benchmark.mjs` – Node.js script that compares JavaScript vs WebAssembly throughput for the generated workload.
- `scripts/porf-build.mjs` – Node helper that wraps `porf wasm` with input/output checks.
- `build/generated.porf.wasm` – Output created by `npm run porf:wasm` (wraps `porf wasm build/generated.js build/generated.porf.wasm`) for third-party WASM comparison.

## Notes

- The generated AssemblyScript currently covers a small subset of possible Parenscript forms. Extend `*function-specs*` and the emitter helpers in `src/generator.lisp` to support more constructs.
- The AssemblyScript compiler expects typed inputs; the generator adds minimal annotations so the sample can compile. Update the emitters if you introduce additional functions or types.
