const fs = require('fs');
const path = require('path');

const models = new Set(
  fs.readFileSync('scratch_prisma_models_utf8.txt', 'utf8')
    .replace(/^\uFEFF/, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
);

models.add('Prisma');
models.add('PrismaClient');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = walk('./server');
console.log(`Scanning ${files.length} files...`);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Match any import from '#imports'
  const importRegex = /import\s+(?:type\s+)?{([^}]+)}\s+from\s+['"]#imports['"]/g;
  
  let modified = false;
  
  content = content.replace(importRegex, (match, namedImports) => {
    const isType = match.includes('import type ') ? 'type ' : '';
    const symbols = namedImports.split(',').map(s => s.trim()).filter(Boolean);
    const prismaSymbols = [];
    const nuxtSymbols = [];
    
    for (const symbol of symbols) {
      const cleanSymbol = symbol.replace(/^type\s+/, '').trim();
      const baseSymbol = cleanSymbol.split(/\s+as\s+/)[0];
      
      if (models.has(baseSymbol)) {
        prismaSymbols.push(symbol);
      } else {
        nuxtSymbols.push(symbol);
      }
    }
    
    if (prismaSymbols.length === 0) return match;
    
    modified = true;
    let replacement = `import ${isType}{ ${prismaSymbols.join(', ')} } from '~/server/utils/generated-prisma/client'`;
    if (nuxtSymbols.length > 0) {
      replacement += `\nimport ${isType}{ ${nuxtSymbols.join(', ')} } from '#imports'`;
    }
    return replacement;
  });
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
