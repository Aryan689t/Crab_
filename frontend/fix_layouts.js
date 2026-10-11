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
      
      // Match typical wrappers: max-w-7xl mx-auto px-6
      // Also max-w-6xl, max-w-5xl, max-w-4xl, max-w-3xl
      // Only replace if they contain mx-auto and px-6 to target the page wrappers,
      // avoiding component-level max-w (like max-w-md or max-w-xl on forms or modals).
      const regex = /className="(.*?)max-w-[34567]xl\s+mx-auto\s+px-6(.*?)"/g;
      const newContent = content.replace(regex, 'className="$1w-full px-4 md:px-6 lg:px-8$2"');
      
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

// Process AppShell separately
const appShellPath = path.join(__dirname, 'components', 'layout', 'AppShell.tsx');
if (fs.existsSync(appShellPath)) {
  let appShellContent = fs.readFileSync(appShellPath, 'utf8');
  appShellContent = appShellContent.replace(
    /className="p-8 flex-1 max-w-7xl w-full mx-auto space-y-8"/g,
    'className="px-4 md:px-6 lg:px-8 py-8 flex-1 w-full space-y-8"'
  );
  fs.writeFileSync(appShellPath, appShellContent, 'utf8');
  console.log(`Updated ${appShellPath}`);
}
