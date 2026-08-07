const fs = require('fs');
const glob = require('glob');

const prismaTypes = new Set([
  'Integration',
  'SubscriptionTier',
  'SubscriptionEnvironment',
  'ProviderSubscription',
  'ProviderSubscriptionStatus',
  'SubscriptionProvider',
  'PlannedWorkout',
  'Workout',
  'PartnerCampaign',
  'PartnerCampaignRedemption',
  'User',
  'SubscriptionStatus',
  'EmailAudience',
  'PrismaClient',
  'JourneyEventCategory',
  'UserMemory',
  'UserMemoryCategory',
  'UserMemoryScope',
  'UserMemorySource',
  'UserMemoryStatus',
  'EmailDeliveryStatus',
  'JourneyEventType',
  'TeamRole',
  'BugStatus',
  'OAuthApp',
  'UserNutritionSettings'
]);

const files = glob.sync('{server,shared,app,tests}/**/*.ts');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Regex to match `import type { A, B } from '#imports'`
  // Also matches `import type { type A, B } from '#imports'`
  const importRegex = /import\s+type\s+\{([^}]+)\}\s+from\s+['"]#imports['"]/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    const prismaImports = [];
    const otherImports = [];

    for (const imp of imports) {
      // Handle `type PrismaClient` -> `PrismaClient`
      const rawType = imp.replace(/^type\s+/, '').trim();
      if (prismaTypes.has(rawType)) {
        prismaImports.push(imp);
      } else {
        otherImports.push(imp);
      }
    }

    if (prismaImports.length === 0) {
      return match;
    }

    changed = true;
    let replacement = `import type { ${prismaImports.join(', ')} } from '~/server/utils/generated-prisma/client'`;
    if (otherImports.length > 0) {
      replacement += `\nimport type { ${otherImports.join(', ')} } from '#imports'`;
    }
    return replacement;
  });

  // Also catch `import { type A } from '#imports'`
  const importRegex2 = /import\s+\{([^}]+)\}\s+from\s+['"]#imports['"]/g;
  content = content.replace(importRegex2, (match, importsStr) => {
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    const prismaImports = [];
    const otherImports = [];

    for (const imp of imports) {
      const isType = imp.startsWith('type ');
      const rawType = imp.replace(/^type\s+/, '').trim();
      
      if (isType && prismaTypes.has(rawType)) {
        prismaImports.push(imp);
      } else {
        otherImports.push(imp);
      }
    }

    if (prismaImports.length === 0) {
      return match;
    }

    changed = true;
    let replacement = `import type { ${prismaImports.map(i => i.replace(/^type\s+/, '')).join(', ')} } from '~/server/utils/generated-prisma/client'`;
    if (otherImports.length > 0) {
      replacement += `\nimport { ${otherImports.join(', ')} } from '#imports'`;
    }
    return replacement;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
