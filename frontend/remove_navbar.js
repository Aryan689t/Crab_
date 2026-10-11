const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'app', 'creator');
const pages = [
  'dashboard/page.tsx',
  'opportunities/page.tsx',
  'applications/page.tsx',
  'collaborations/page.tsx',
  'inbox/page.tsx',
  'intelligence/page.tsx',
  'profile/page.tsx',
];

for (const page of pages) {
  const filePath = path.join(pagesDir, page);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/import\s+\{\s*Navbar\s*\}\s+from\s+['"]([^'"]+)['"];?\n/g, '');
    content = content.replace(/<Navbar\s*\/>\n?/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}
