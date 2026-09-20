/**
 * Minimal structured logging so test output stays scannable in CI.
 * Not a replacement for the HTML report — just faster to grep in raw logs.
 */
export const logger = {
  step: (msg: string) => console.log(`[STEP] ${msg}`),
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
};
