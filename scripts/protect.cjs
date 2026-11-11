/**
 * [AETHER-OMNI™ v26.11 IN-PLACE ENCRYPTION TOOL]
 * Encrypts index.js on Linux VPS Ubuntu 22 into the proprietary protected loader.
 */
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const indexJsPath = path.join(rootDir, "index.js");
const indexSourcePath = path.join(rootDir, "index.source.js");

if (!fs.existsSync(indexJsPath)) {
  console.error("\x1b[31m[ERROR]\x1b[0m index.js not found in " + rootDir);
  process.exit(1);
}

let codeToEncrypt = fs.readFileSync(indexJsPath, "utf8");

if (codeToEncrypt.includes("AETHER-OMNI™ v26.11 PROPRIETARY SECURE RUNTIME")) {
  if (fs.existsSync(indexSourcePath)) {
    codeToEncrypt = fs.readFileSync(indexSourcePath, "utf8");
  } else {
    console.log("\x1b[33m[INFO]\x1b[0m index.js is already encrypted by AETHER-OMNI v26.11.");
    process.exit(0);
  }
} else {
  fs.writeFileSync(indexSourcePath, codeToEncrypt, "utf8");
}

const { encryptSourceCode, buildProtectedLoaderScript } = require("../src/encryptionEngine.js");

const enc = encryptSourceCode(codeToEncrypt);
const protectedScript = buildProtectedLoaderScript(enc.payload, enc.checksum);

fs.writeFileSync(indexJsPath, protectedScript, "utf8");
console.log("\x1b[32m[AETHER-OMNI v26.11 SUCCESS]\x1b[0m index.js encrypted successfully with Checksum: " + enc.checksum + " (Entropy: " + enc.entropy + " bits/byte)");
