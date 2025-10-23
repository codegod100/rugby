export function fib(n) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

export function fibSum(n) {
  if (n < 0) {
    return 0;
  }
  return fib(n) + fibSum(n - 1);
}
