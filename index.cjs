/**
 * [AETHER-OMNI™ v26.11 DUAL-MODE PM2 & CJS LAUNCHER]
 * Linux VPS Ubuntu 22 / Wispbyte / Pterodactyl Dual-Mode Execution Bridge
 */
globalThis.Bun = { version: "1.2.4" };
process.env.PM2_BRIDGE = "1";

import("./index.js")
  .then(() => {
    // Successfully started under ESM module runner
  })
  .catch((err) => {
    console.error("\x1b[31m[FADHILBOT PM2 / CJS LAUNCH ERROR]\x1b[0m Failed to hydrate engine:", err);
    process.exit(1);
  });

