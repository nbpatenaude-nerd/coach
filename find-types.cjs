const fs = require('fs');
const glob = require('glob');
const files = glob.sync('{server,shared,app,tests}/**/*.ts');

const regex = /import\s+type\s+\{([^}]+)\}\s+from\s+['"]#imports['"]/g;
const allTypes = new Set();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    match[1].split(',').map(s => s.trim()).forEach(t => {
      if (t) allTypes.add(t);
    });
  }
}
console.log(Array.from(allTypes));
