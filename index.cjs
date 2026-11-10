/**
 * [AETHER-OMNI™ v26.11 DUAL-MODE PM2 & CJS LAUNCHER]
 * Linux VPS Ubuntu 18-24 / Wispbyte / Pterodactyl Dual-Mode Execution Bridge
 */
globalThis.Bun = { version: "1.2.4" };
process.env.PM2_BRIDGE = "1";

try {
  require("./index.js");
} catch (err) {
  if (err && err.code === "ERR_REQUIRE_ESM") {
    import("./index.js").catch((importErr) => {
      console.error("\x1b[31m[FADHILBOT PM2 LAUNCH ERROR]\x1b[0m", importErr);
      process.exit(1);
    });
  } else {
    console.error("\x1b[31m[FADHILBOT PM2 LAUNCH ERROR]\x1b[0m", err);
    process.exit(1);
  }
}

