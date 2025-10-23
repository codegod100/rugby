// load-wasm.mjs
import { readFile } from 'node:fs/promises';

const bytes = await readFile(new URL('./build/generated.wasm', import.meta.url));
const { instance } = await WebAssembly.instantiate(bytes);
const { fib, fib_sum: fibSum } = instance.exports;

console.log(`fib(10) => ${fib(10)}`);
console.log(`fib_sum(10) => ${fibSum(10)}`);