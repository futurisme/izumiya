const fs = require('fs');
const path = require('path');
try {
  const targetDir = path.resolve(__dirname, '..');
  fs.existsSync(path.join(targetDir, 'package.json'));
} catch (err) {}
