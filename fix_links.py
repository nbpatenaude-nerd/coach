import re

def fix_default_layout():
    with open('app/layouts/default.vue', 'r', encoding='utf-8') as f:
        content = f.read()

    # The block we want to remove is:
    # <div v-if="!collapsed" class="px-4 pb-2">
    #   <div class="flex items-center justify-center gap-4 mb-4">
    #      ...
    #   <USeparator class="my-2" />
    # </div>
    # Before: <div class="hidden w-full lg:block">
    
    # We will use regex to find <div v-if="!collapsed" class="px-4 pb-2"> ... <USeparator class="my-2" />\s*</div>
    pattern = re.compile(r'<div v-if="!collapsed" class="px-4 pb-2">\s*<div class="flex items-center justify-center gap-4 mb-4">.*?<USeparator class="my-2" />\s*</div>', re.DOTALL)
    
    new_content = pattern.sub('', content)
    
    with open('app/layouts/default.vue', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed default.vue")

def fix_admin_layout():
    with open('app/layouts/admin.vue', 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = re.compile(r'<div v-if="!collapsed" class="px-4 pb-2">\s*<div class="flex items-center justify-center gap-4 mb-4">.*?<USeparator class="my-2" />\s*</div>', re.DOTALL)
    
    new_content = pattern.sub('', content)
    
    with open('app/layouts/admin.vue', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed admin.vue")
    
def fix_mobile_footer():
    with open('app/components/layout/MobileSidebarFooter.vue', 'r', encoding='utf-8') as f:
        content = f.read()

    # Items to remove:
    # { label: ready.value ? t.value('sidebar_community_discord') : 'Discord', ... },
    # { label: ready.value ? t.value('sidebar_community_github') : 'GitHub', ... },
    # { label: ready.value ? t.value('sidebar_attribution_strava') : 'Powered by Strava', ... },
    # { label: ready.value ? t.value('sidebar_attribution_garmin') : 'Works with Garmin', ... }
    
    pattern = re.compile(r'\{\s*label:\s*ready\.value\s*\?\s*t\.value\(\'sidebar_community_discord\'\).*?target:\s*\'_blank\'\s*\},', re.DOTALL)
    content = pattern.sub('', content)
    
    pattern2 = re.compile(r'\{\s*label:\s*ready\.value\s*\?\s*t\.value\(\'sidebar_community_github\'\).*?target:\s*\'_blank\'\s*\},', re.DOTALL)
    content = pattern2.sub('', content)
    
    pattern3 = re.compile(r'\{\s*label:\s*ready\.value\s*\?\s*t\.value\(\'sidebar_attribution_strava\'\).*?target:\s*\'_blank\'\s*\},', re.DOTALL)
    content = pattern3.sub('', content)
    
    pattern4 = re.compile(r'\{\s*label:\s*ready\.value\s*\?\s*t\.value\(\'sidebar_attribution_garmin\'\).*?target:\s*\'_blank\'\s*\}', re.DOTALL)
    content = pattern4.sub('', content)
    
    with open('app/components/layout/MobileSidebarFooter.vue', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed MobileSidebarFooter.vue")

fix_default_layout()
fix_admin_layout()
fix_mobile_footer()

