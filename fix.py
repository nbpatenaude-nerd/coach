import os
with open('d:/coach/app/components/landing/Pricing.vue', 'r', encoding='utf-8') as f:
    content = f.read()

import re
content = re.sub(r'to="https://app.reclaim.ai/m/Coach-Nick/journey-begins"\s*target="_blank"\s*block\s*class="bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold shadow-\[0_0_15px_rgba\(236,72,153,0\.4\)\]"\s*>Apply for Unlock', 'to="/apply/unlock" block class="bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)]">Apply for Unlock', content)

content = re.sub(r'to="https://app.reclaim.ai/m/Coach-Nick/journey-begins"\s*target="_blank"\s*block\s*variant="outline"\s*class="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"\s*>Apply for Unleash', 'to="/apply/unleash" block variant="outline" class="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400">Apply for Unleash', content)

with open('d:/coach/app/components/landing/Pricing.vue', 'w', encoding='utf-8') as f:
    f.write(content)
