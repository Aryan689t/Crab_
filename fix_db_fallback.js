const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'backend', 'src', 'controllers');
const files = fs.readdirSync(controllersDir).map(f => path.join(controllersDir, f)).filter(f => f.endsWith('.ts'));

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add config import if missing
  if (!text.includes("import { config } from '../config/env.js';")) {
    text = text.replace(
      "import { prisma } from '../lib/prisma.js';",
      "import { prisma } from '../lib/prisma.js';\nimport { config } from '../config/env.js';"
    );
    changed = true;
  }

  // Find try blocks that catch and print the fallback message
  // E.g. 
  // try {
  //   someVar = await prisma...
  // } catch (err) {
  //   console.warn('[...] DB read failed, falling back to mock response.');
  // }
  
  const regex = /try\s*\{\s*([a-zA-Z0-9_]+)\s*=\s*await\s+prisma\.([^{}]+)\}\s*catch\s*\([a-zA-Z0-9_]+\)\s*\{\s*console\.warn\('\[[A-Z]+\]\s+DB\s+(?:read\s+)?failed,\s+falling\s+back\s+to\s+mock\s+response\.'\);\s*\}/g;
  
  text = text.replace(regex, (match, varName, prismaQuery) => {
    changed = true;
    return `if (config.databaseUrl) {
      try {
        ${varName} = await prisma.${prismaQuery}} catch (err) {
        console.error('[DB] Genuine read failure:', err);
      }
    }`;
  });

  if (changed) {
    fs.writeFileSync(file, text);
    console.log('Updated ' + file);
  }
}
