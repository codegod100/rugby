import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

import { fibSum as jsFibSum } from '../src/fib.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmPath = path.resolve(__dirname, '../build/generated.wasm');

const wasmBytes = await readFile(wasmPath);
const { instance } = await WebAssembly.instantiate(wasmBytes);
const wasmFibSum = instance.exports.fib_sum;

const WORK_INPUT = 30;
const OUTER_LOOPS = 25;
const SAMPLES = 5;

function makeWorkload(fn) {
  return () => {
    let acc = 0;
    for (let i = 0; i < OUTER_LOOPS; i += 1) {
      acc += fn(WORK_INPUT);
    }
    return acc;
  };
}

const jsWorkload = makeWorkload(jsFibSum);
const wasmWorkload = makeWorkload(wasmFibSum);

function runBenchmark(label, workload) {
  workload();
  let total = 0;
  let lastResult = 0;
  for (let i = 0; i < SAMPLES; i += 1) {
    const start = performance.now();
    lastResult = workload();
    total += performance.now() - start;
  }
  const average = total / SAMPLES;
  console.log(`${label.padEnd(18)} ${average.toFixed(2)} ms avg\t(result ${lastResult})`);
}

console.log(`Benchmarking fibSum(${WORK_INPUT}) with ${OUTER_LOOPS} iterations per sample (samples=${SAMPLES})`);
runBenchmark('JavaScript', jsWorkload);
runBenchmark('WebAssembly', wasmWorkload);
