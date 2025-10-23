# ps-asc-demo

Common Lisp starter project that emits JavaScript with Parenscript and then attempts to compile the derived AssemblyScript view with the AssemblyScript compiler.

## Prerequisites

- [SBCL](https://www.sbcl.org/) or another Common Lisp implementation that supports ASDF.
- [Quicklisp](https://www.quicklisp.org/) with the `parenscript` library installed (`(ql:quickload :parenscript)`).
- Node.js 18+ with `npm` (required for AssemblyScript).

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
- For debug builds use `npm run build:debug` (writes `.debug.wasm/.debug.wat`).

## Project layout

- `ps-asc-demo.asd` – ASDF system definition.
- `src/` – Common Lisp source for Parenscript/AssemblyScript generation.
- `bin/generate.lisp` – Entrypoint used by the `generate` npm script.
- `asconfig.json` – AssemblyScript compiler configuration.

## Notes

- The generated AssemblyScript currently covers a small subset of possible Parenscript forms. Extend `*function-specs*` and the emitter helpers in `src/generator.lisp` to support more constructs.
- The AssemblyScript compiler expects typed inputs; the generator adds minimal annotations so the sample can compile. Update the emitters if you introduce additional functions or types.
