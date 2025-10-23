import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';


import { fibSum as jsFibSum } from '../src/fib.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assemblyScriptWasmPath = path.resolve(__dirname, '../build/generated.wasm');
// Porf integration removed -- no porf runtime used anymore.

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

async function loadFibSumFromWasm(wasmPath, label) {
  let bytes;
  try {
    bytes = await readFile(wasmPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const hint = path.relative(process.cwd(), wasmPath);
      throw new Error(`${label} module not found at ${hint}. Run \`npm run build\` first.`);
    }
    throw error;
  }
  const { instance } = await WebAssembly.instantiate(bytes);
  const candidate = instance.exports.fib_sum ?? instance.exports.fibSum;
  if (typeof candidate !== 'function') {
    throw new Error(`${label} module is missing a fib_sum export.`);
  }
  return candidate;
}

async function prepareWasmContender(label, wasmPath) {
  try {
    const fn = await loadFibSumFromWasm(wasmPath, label);
    return { label, workload: makeWorkload(fn) };
  } catch (error) {
    return { label, error };
  }
}


const contenders = [
  { label: 'JavaScript', workload: makeWorkload(jsFibSum) },
  await prepareWasmContender('AssemblyScript', assemblyScriptWasmPath),
  // Porf contender removed
  
];

function runBenchmark(label, workload) {
  try {
    workload();
  } catch (error) {
    console.log(`${label.padEnd(18)} error: ${error.message}`);
    return;
  }
  let total = 0;
  let lastResult = 0;
  for (let i = 0; i < SAMPLES; i += 1) {
    const start = performance.now();
    try {
      lastResult = workload();
    } catch (error) {
      console.log(`${label.padEnd(18)} error: ${error.message}`);
      return;
    }
    total += performance.now() - start;
  }
  const average = total / SAMPLES;
  console.log(`${label.padEnd(18)} ${average.toFixed(2)} ms avg\t(result ${lastResult})`);
}

console.log(`Benchmarking fibSum(${WORK_INPUT}) with ${OUTER_LOOPS} iterations per sample (samples=${SAMPLES})`);
for (const contender of contenders) {
  if (contender.error) {
    console.log(`${contender.label.padEnd(18)} error: ${contender.error.message}`);
    continue;
  }
  runBenchmark(contender.label, contender.workload);
}
