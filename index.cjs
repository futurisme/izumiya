globalThis.Bun = { version: "1.2.4" };
import("./index.js").catch((err) => {
  process.exit(1);
});
