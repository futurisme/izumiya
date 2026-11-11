import indexJsRaw from "../index.js?raw";
import indexCjsRaw from "../index.cjs?raw";
import configJsonRaw from "../config.json?raw";
import npmrcRaw from "../.npmrc?raw";
import protectCjsRaw from "../scripts/protect.cjs?raw";
export const postinstallRaw = `const fs = require('fs');
const path = require('path');
try {
  const targetDir = path.resolve(__dirname, '..');
  fs.existsSync(path.join(targetDir, 'package.json'));
} catch (err) {}
`;
export {
  indexJsRaw,
  indexCjsRaw,
  configJsonRaw,
  npmrcRaw,
  protectCjsRaw
};
