const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove bg-[#F8F9FC] and min-h-screen from the top level wrappers in pages
      const newContent = content.replace(/className="min-h-screen bg-\[#F8F9FC\] flex flex-col"/g, 'className="flex flex-col"');
      
      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const frontendAppDir = path.join(__dirname, 'app');
processDir(path.join(frontendAppDir, 'creator'));
processDir(path.join(frontendAppDir, 'brand'));
