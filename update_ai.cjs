const fs = require('fs');
let content = fs.readFileSync('app/components/AiQuickCapture.vue', 'utf8');

// 1. Add form wrapper
content = content.replace(
  /<div\n\s*class=\"absolute inset-0 px-1 transition-opacity flex items-center\"\n\s*:class=\"([^"]+)\"\n\s*>/g,
  '<div\n        class=\"absolute inset-0 px-1 transition-opacity flex items-center\"\n        :class=\"\"\n      >\n        <form @submit.prevent=\"handleSubmit\" class=\"w-full flex items-center\">'
);
content = content.replace(
  /<\/UInput>\n      <\/div>/g,
  '</UInput>\n        </form>\n      </div>'
);
// Remove @keyup.enter from UInput
content = content.replace(/@keyup\.enter=\"handleSubmit\"/g, '');
// Change UButton click to type submit
content = content.replace(
  /@click=\"\n\s*\(\) => \{\n\s*void handleSubmit\(\)\n\s*\}\n\s*\"/g,
  'type=\"submit\"'
);

// 2. Remove isExpanded.value = false from catch block
content = content.replace(/isExpanded\.value = false\n\s*\}/g, '}');

// 3. Await sendMessage
content = content.replace(
  /chatInstance\.value\.sendMessage\(\{\n\s*text\n\s*\}\)/g,
  'await chatInstance.value.sendMessage({ text })'
);

fs.writeFileSync('app/components/AiQuickCapture.vue', content);
